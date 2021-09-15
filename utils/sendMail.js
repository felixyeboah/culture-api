const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID);

export const sendMail = async (email, subject, text, html) => {
  try {
    const msg = {
      to: email, // Change to your recipient
      from: process.env.SENDER_EMAIL, // Change to your verified sender
      subject,
      text,
      html,
    };
    await sgMail.send(msg);
  } catch (error) {
    console.log('Error sending email', error.message);
  } finally {
    return;
  }
};
