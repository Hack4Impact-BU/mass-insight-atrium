import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { EmailTemplate } from '../../components/email-template';
import { createClient } from '@/utils/supabase/server';

const resend = new Resend(process.env.RESEND_API_KEY);

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to delay execution with exponential backoff
async function delayWithBackoff(attempt: number) {
  const baseDelay = 500; // 500ms base delay
  const maxDelay = 10000; // 10s maximum delay
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  await new Promise(resolve => setTimeout(resolve, delay));
}

interface SendResult {
  success: boolean;
  error?: unknown;
  recipient: any;
  email: string;
}

// Process a single recipient with retries
async function processSingleRecipient(
  recipient: any,
  campaign: any,
  settings: any,
  supabase: any,
  attempt: number = 0
): Promise<SendResult> {
  const maxAttempts = 3;
  const recipientEmail = recipient.email?.trim();

  // Validate email format
  if (!isValidEmail(recipientEmail)) {
    console.error(`Invalid email format for: ${recipientEmail}`);
    return {
      success: false,
      error: new Error(`Invalid email format: ${recipientEmail}`),
      recipient,
      email: recipientEmail
    };
  }

  try {
    // Determine if this is a manual recipient
    const isManualRecipient = recipient.isManual || (
      typeof recipient.id === 'string' && (
        recipient.id.startsWith('manual_') ||
        recipient.id.startsWith('import_') ||
        recipient.id.startsWith('meeting_')
      )
    );
    // Always set keys consistently
    let personId = null;
    let manualEmail = null;
    if (isManualRecipient) {
      personId = null;
      manualEmail = recipientEmail;
    } else if (typeof recipient.id === 'number' || (typeof recipient.id === 'string' && !isNaN(Number(recipient.id)))) {
      personId = Number(recipient.id);
      manualEmail = null;
    }
    const recipientData = {
      campaign_id: campaign.id,
      person_id: personId,
      manual_email: manualEmail,
      status: 'pending'
    };

    // Upsert the recipient record
    const { data: recipientRecord, error: recipientError } = await supabase
      .from('email_recipients')
      .upsert(recipientData, { 
        onConflict: 'campaign_id,manual_email',
        returning: true 
      })
      .select()
      .single();

    if (recipientError) {
      throw recipientError;
    }

    try {
      // Send the email
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'Mass Insight <noreply@atrium.massinsight.org>',
        to: recipientEmail,
        replyTo: settings.replyTo || 'noreply@atrium.massinsight.org',
        subject: campaign.subject,
        react: EmailTemplate({
          firstName: recipient.first_name || recipientEmail.split('@')[0] || '',
          lastName: recipient.last_name || '',
          role: recipient.role_profile || 'Guest',
          content: {
            body: campaign.body,
            footer: campaign.footer,
            confirmationCode: settings.confirmationCode ? 'CONF-' + Math.random().toString(36).substring(2, 8).toUpperCase() : null
          },
          settings: {
            color: settings.color === 'black' ? 'black' : 'white',
            logoFile: settings.logoFile
          }
        }) as any,
      });

      if (emailError) {
        throw emailError;
      }

      // Update recipient status to sent
      const { error: updateError } = await supabase
        .from('email_recipients')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', recipientRecord.id);

      if (updateError) {
        console.error('Failed to update recipient status:', {
          recipientId: recipientRecord.id,
          error: updateError
        });
        // Don't throw here, just log the error
        // The email was sent successfully, so we'll consider this a success
      }

      console.log('Successfully sent email:', {
        recipientId: recipientRecord.id,
        email: recipientEmail
      });

      return {
        success: true,
        recipient,
        email: recipientEmail
      };

    } catch (error: any) {
      console.error('Failed to send email:', {
        recipientId: recipientRecord.id,
        email: recipientEmail,
        error
      });

      // Update recipient status to failed
      const { error: updateError } = await supabase
        .from('email_recipients')
        .update({ 
          status: 'failed',
          error_message: error.message || 'Unknown error'
        })
        .eq('id', recipientRecord.id);

      if (updateError) {
        console.error('Failed to update recipient status to failed:', {
          recipientId: recipientRecord.id,
          error: updateError
        });
      }

      throw error;
    }

  } catch (error: any) {
    console.error(`Error processing ${recipientEmail}:`, error);

    // If we haven't exceeded max attempts and it's a rate limit error, retry
    if (attempt < maxAttempts && error?.statusCode === 429) {
      console.log(`Retrying ${recipientEmail} after backoff (attempt ${attempt + 1})`);
      await delayWithBackoff(attempt);
      return processSingleRecipient(recipient, campaign, settings, supabase, attempt + 1);
    }

    return {
      success: false,
      error,
      recipient,
      email: recipientEmail
    };
  }
}

// Process all recipients with proper rate limiting
async function processRecipients(recipients: any[], campaign: any, settings: any, supabase: any) {
  const results: SendResult[] = [];
  const processedEmails = new Set<string>();
  
  // Process recipients in sequence with rate limiting
  for (const recipient of recipients) {
    const recipientEmail = recipient.email?.trim();

    // Skip duplicates
    if (processedEmails.has(recipientEmail)) {
      console.log(`Skipping duplicate email: ${recipientEmail}`);
      continue;
    }

    processedEmails.add(recipientEmail);

    // Add delay between requests to respect rate limit
    if (results.length > 0) {
      await delayWithBackoff(0); // Base delay between requests
    }

    const result = await processSingleRecipient(recipient, campaign, settings, supabase);
    results.push(result);
  }

  return {
    total: processedEmails.size,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results
  };
}

export async function POST(request: Request) {
  try {
    const { campaign, settings, recipients } = await request.json();
    const supabase = await createClient();

    // Log initial recipients for debugging
    console.log('Processing recipients:', recipients.map((r: any) => ({
      email: r.email,
      id: r.id,
      isManual: r.isManual || (typeof r.id === 'string' && (
        r.id.startsWith('manual_') ||
        r.id.startsWith('import_') ||
        r.id.startsWith('meeting_')
      ))
    })));

    const { total, successful, failed, results } = await processRecipients(
      recipients,
      campaign,
      settings,
      supabase
    );

    // Log final summary
    console.log(`Email campaign complete:
      Total: ${total}
      Successful: ${successful}
      Failed: ${failed}
      Results: ${JSON.stringify(results, null, 2)}
    `);

    // Update campaign status based on results
    const campaignStatus = failed > 0 ? 'failed' : 'sent';
    const { error: campaignUpdateError } = await supabase
      .from('email_campaigns')
      .update({ status: campaignStatus })
      .eq('id', campaign.id);

    if (campaignUpdateError) {
      console.error('Failed to update campaign status:', campaignUpdateError);
    }

    // If any emails failed, return partial success response
    if (failed > 0) {
      const failures = results.filter(r => !r.success);
      return NextResponse.json({
        status: 'partial_success',
        campaignId: campaign.id,
        summary: { total, successful, failed },
        failures: failures.map(f => ({
          email: f.email,
          error: f.error
        }))
      }, { status: 207 }); // 207 Multi-Status
    }

    // All emails sent successfully
    return NextResponse.json({ 
      status: 'success',
      campaignId: campaign.id,
      summary: { total, successful, failed: 0 }
    });

  } catch (error) {
    console.error('Fatal error sending emails:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: 'Failed to process email campaign',
        details: error
      },
      { status: 500 }
    );
  }
} 