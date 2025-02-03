import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY as string);

export async function emailSender(
  to: string,
  subject: string,
  text: string,
){
  try {
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL as string, // would need mass impact to set up their domain on Resend dashboard
      to,
      subject,
      text,
    });
    console.log("Email sent successfully: "+response);
    return response // successful res
  } catch (error) {
    console.error("Error with email sender: "+error);
    return error // failed res
  }
}

//Tests:
//emailSender("recipient@example.com", "test subject", "test text");