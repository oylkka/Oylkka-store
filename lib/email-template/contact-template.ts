export function contactTemplate({
  username,
  email,
  phoneNumber,
  message,
}: {
  username: string;
  email: string;
  phoneNumber?: string;
  message: string;
}) {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Contact Form Submission</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Inter', sans-serif;">
    <table role="presentation" width="100%" style="border-collapse: collapse;">
      <tr>
        <td align="center" style="padding: 40px 0;">
          <table width="600" role="presentation" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
            <tr>
              <td style="background-color: #ea580c; padding: 32px 40px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff;">New Contact Form Submission</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px 40px;">
                <p style="font-size: 16px; color: #111827; margin-bottom: 24px;">You've received a new message through your website contact form:</p>
                <table width="100%" style="border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px; background-color: #f3f4f6; border-radius: 6px;">
                      <p style="margin: 0 0 8px;"><strong style="color: #ea580c;">Name:</strong> ${username}</p>
                      <p style="margin: 0 0 8px;"><strong style="color: #ea580c;">Email:</strong> ${email}</p>
                      ${
                        phoneNumber
                          ? `<p style="margin: 0 0 8px;"><strong style="color: #ea580c;">Phone:</strong> ${phoneNumber}</p>`
                          : ''
                      }
                      <p style="margin: 16px 0 8px;"><strong style="color: #ea580c;">Message:</strong></p>
                      <div style="padding: 12px; background-color: #ffffff; border-left: 4px solid #ea580c; border-radius: 4px;">
                        <p style="margin: 0; color: #374151;">${message}</p>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
}
