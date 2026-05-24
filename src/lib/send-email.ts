import { queueEmail } from '@/lib/email-queue';

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
  const { to, subject, html } = input;

  const emailHtml = html ?? buildGenericHtml(input);

  await queueEmail(to, subject, emailHtml);
}

function buildGenericHtml(input: SendEmailInput): string {
  const { subject, meta } = input;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Helvetica Neue', Arial, sans-serif;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; padding: 40px 20px;">
        <tr>
          <td>
            <table cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
              <tr>
                <td style="width: 32px; height: 32px; background: #16a34a; border-radius: 8px; text-align: center; line-height: 32px; font-size: 16px;">
                  🛍️
                </td>
                <td style="padding-left: 10px;">
                  <span style="font-size: 18px; font-weight: 700; letter-spacing: -0.02em; color: #18181b;">Oylkka</span>
                </td>
              </tr>
            </table>
            <table cellpadding="0" cellspacing="0" style="width: 100%; background: #ffffff; border-radius: 12px; border: 1px solid #e4e4e7;">
              <tr>
                <td style="padding: 32px; text-align: center;">
                  <span style="font-size: 11px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: #16a34a;">
                    ${subject}
                  </span>
                  <h1 style="font-size: 24px; font-weight: 700; letter-spacing: -0.02em; margin: 16px 0 8px; color: #18181b;">
                    ${meta.greeting ? `Hi ${meta.greeting},` : ''}
                  </h1>
                  <p style="font-size: 14px; line-height: 1.6; color: #71717a; margin: 0 0 24px;">
                    ${meta.description}
                  </p>
                  <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                    <tr>
                      <td style="background: #16a34a; border-radius: 8px; text-align: center;">
                        <a href="${meta.link}" style="display: inline-block; padding: 12px 28px; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px;">
                          ${meta.callToActionText || 'Complete Action'}
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <table cellpadding="0" cellspacing="0" style="width: 100%; border-top: 1px solid #e4e4e7; padding-top: 24px; margin-top: 32px;">
              <tr>
                <td style="text-align: center;">
                  <span style="font-size: 11px; color: #71717a;">
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
}
