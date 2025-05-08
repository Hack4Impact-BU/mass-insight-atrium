import * as React from 'react';
import {
  Html,
  Body,
  Container,
  Text,
  Link,
  Preview,
  Section,
  Img,
} from '@react-email/components';

interface EmailTemplateProps {
  firstName: string;
  lastName: string;
  role: string;
  content: {
    body: string;
    footer?: string | null;
    confirmationCode?: string | null;
  };
  settings: {
    color: string;
    logoFile: string | null;
  };
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({
  firstName,
  lastName,
  role,
  content,
  settings,
}) => {
  const textColor = settings.color === 'black' ? '#ffffff' : '#000000';
  const backgroundColor = settings.color === 'black' ? '#000000' : '#ffffff';

  return (
    <Html>
      <Preview>{content.body.substring(0, 100)}...</Preview>
      <Body style={{ backgroundColor, color: textColor }}>
        <Container>
          {settings.logoFile && (
            <Section>
              <Img
                src="https://atriummassinsight.s3.us-east-2.amazonaws.com/Massinsightwline.png"
                alt="Mass Insight Logo"
                width="200"
                height="53"
              />
            </Section>
          )}

          <Section>
            {content.body.split('\n').map((paragraph, i) => (
              <Text key={i} style={{ color: textColor }}>
                {paragraph
                  .replace(/{first_name}/g, firstName)
                  .replace(/{last_name}/g, lastName)
                  .replace(/{role}/g, role)}
              </Text>
            ))}
          </Section>

          {content.confirmationCode && (
            <Section style={{ 
              backgroundColor: '#f3f4f6',
              padding: '16px',
              borderRadius: '4px',
              marginTop: '16px'
            }}>
              <Text style={{ color: '#000000' }}>
                Confirmation Code: <strong>{content.confirmationCode}</strong>
              </Text>
            </Section>
          )}

          {content.footer && (
            <Section style={{ 
              borderTop: '1px solid #e5e7eb',
              marginTop: '24px',
              paddingTop: '24px'
            }}>
              <Text style={{ color: textColor }}>
                {content.footer
                  .replace(/{first_name}/g, firstName)
                  .replace(/{last_name}/g, lastName)
                  .replace(/{role}/g, role)}
              </Text>
            </Section>
          )}

          <Section style={{ marginTop: '32px' }}>
            <Text style={{ fontSize: '12px', color: '#6b7280' }}>
              © {new Date().getFullYear()} Mass Insight. All rights reserved.{' '}
              <Link href="https://massinsight.org">massinsight.org</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}; 