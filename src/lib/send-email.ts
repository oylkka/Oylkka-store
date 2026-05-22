import transporter from '@/lib/nodemailer';

const BRAND = {
  primary: '#16a34a',
  background: '#f4f4f5',
  card: '#ffffff',
  foreground: '#18181b',
  mutedForeground: '#71717a',
  border: '#e4e4e7',
};

export type SendEmailInput = {
  to: string;
  subject: string;
  meta: {
    description: string;
    link: string;
    callToActionText: string;
    greeting?: string;
  };
  html?: string;
};

export async function sendEmail(input: SendEmailInput) {
  const { to, subject, meta, html } = input;

  const emailHtml =
    html ??
    `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin: 0; padding: 0; background-color: ${BRAND.background}; font-family: 'Helvetica Neue', Arial, sans-serif;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; padding: 40px 20px;">
        <tr>
          <td>
            <table cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
              <tr>
                <td style="width: 32px; height: 32px; background: ${BRAND.primary}; border-radius: 8px; text-align: center; line-height: 32px; font-size: 16px;">
                  🛍️
                </td>
                <td style="padding-left: 10px;">
                  <span style="font-size: 18px; font-weight: 700; letter-spacing: -0.02em; color: ${BRAND.foreground};">Oylkka</span>
                </td>
              </tr>
            </table>
            <table cellpadding="0" cellspacing="0" style="width: 100%; background: ${BRAND.card}; border-radius: 12px; border: 1px solid ${BRAND.border};">
              <tr>
                <td style="padding: 32px; text-align: center;">
                  <span style="font-size: 11px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: ${BRAND.primary};">
                    ${subject}
                  </span>
                  <h1 style="font-size: 24px; font-weight: 700; letter-spacing: -0.02em; margin: 16px 0 8px; color: ${BRAND.foreground};">
                    ${meta.greeting ? `Hi ${meta.greeting},` : ''}
                  </h1>
                  <p style="font-size: 14px; line-height: 1.6; color: ${BRAND.mutedForeground}; margin: 0 0 24px;">
                    ${meta.description}
                  </p>
                  <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                    <tr>
                      <td style="background: ${BRAND.primary}; border-radius: 8px; text-align: center;">
                        <a href="${meta.link}" style="display: inline-block; padding: 12px 28px; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px;">
                          ${meta.callToActionText || 'Complete Action'}
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <table cellpadding="0" cellspacing="0" style="width: 100%; border-top: 1px solid ${BRAND.border}; padding-top: 24px; margin-top: 32px;">
              <tr>
                <td style="text-align: center;">
                  <span style="font-size: 11px; color: ${BRAND.mutedForeground};">
                    © ${new Date().getFullYear()} Oylkka. All rights reserved.
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

  const mailOptions = {
    from: process.env.SMTP_SENDER,
    to,
    subject: `Oylkka - ${subject}`,
    html: emailHtml,
  };

  await transporter.sendMail(mailOptions);
}
