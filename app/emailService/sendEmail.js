// import sgMail from '@sendgrid/mail';

// // Set your SendGrid API Key from environment variables
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// /**
//  * Sends an email using SendGrid.
//  * 
//  * @param {Object} params - Email parameters.
//  * @param {string} params.to - Recipient email address.
//  * @param {string} params.subject - Email subject.
//  * @param {string} params.html - HTML content of the email.
//  * @returns {Promise} - Resolves with SendGrid's response.
//  */
export default async function sendEmail({ to, subject, html }) {
  const msg = {
    to, // Recipient email address
    from: process.env.SENDGRID_FROM_EMAIL, // Verified sender email address in SendGrid
    subject,
    html,
  };

  try {
    // const response = await sgMail.send(msg);
    // console.log("Email sent successfully via SendGrid:", response);
    // return response;
    return { success: true }
  } catch (error) {
    console.error("Error sending email via SendGrid:", error);
    if (error.response) {
      console.error("SendGrid error details:", error.response.body);
    }
    throw error;
  }
}
