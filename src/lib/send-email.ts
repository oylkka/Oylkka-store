import transporter from '@/lib/nodemailer';

export type SendEmailInput = {
  to: string;
  subject: string;
  meta: {
    description: string;
    link: string;
    callToActionText: string;
    greeting?: string;
  };
};

export async function sendEmail(input: SendEmailInput) {
  const { to, subject, meta } = input;

  const mailOptions = {
    from: process.env.SMTP_SENDER,
    to,
    subject: `Oylkka - ${subject}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <style>
              .body-wrapper { font-family: 'Arial', sans-serif; background-color: #f8f9fa; margin: 0; padding: 0; }
              .main-card { background-color: #ffffff; border-radius: 8px; padding: 30px; border: 1px solid #e9ecef; }
              .cta-button { display: inline-block; padding: 12px 25px; background-color: #007bff; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; }
          </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f9fa;">
          <center class="body-wrapper" style="width: 100%; padding-top: 40px; padding-bottom: 40px;">
              <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                  <tr>
                      <td align="center" class="main-card">
                          <h1 style="font-size: 24px; color: #343a40;">${subject}</h1>
                          ${meta.greeting ? `<p>Hi ${meta.greeting},</p>` : ''}
                          <p style="line-height: 1.5; color: #495057;">${meta.description}</p>
                          <div style="text-align: center;">
                              <a href="${meta.link}" class="cta-button">
                                ${meta.callToActionText || 'Complete Action'}
                              </a>
                          </div>
                      </td>
                  </tr>
              </table>
          </center>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}
