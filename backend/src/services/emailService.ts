import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'iamproxisys@gmail.com',
        pass: 'kwlb xeno jljm drkm'
    }
});

export const sendOtpEmail = async (to: string, otp: string) => {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 40px 0; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px; }
            .content { padding: 40px; text-align: center; }
            .greeting { font-size: 18px; color: #374151; margin-bottom: 24px; }
            .otp-box { background-color: #eff6ff; border: 2px dashed #bfdbfe; border-radius: 12px; padding: 20px; display: inline-block; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: 800; color: #2563eb; letter-spacing: 4px; font-family: monospace; }
            .message { color: #6b7280; line-height: 1.6; margin-bottom: 30px; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }
            .warning { color: #ef4444; font-size: 14px; margin-top: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Proxi</h1>
            </div>
            <div class="content">
                <p class="greeting">Hello,</p>
                <p class="message">You requested a password reset for your Proxi account. Use the verification code below to proceed.</p>
                
                <div class="otp-box">
                    <div class="otp-code">${otp}</div>
                </div>
                
                <p class="message">This code will expire in 10 minutes.</p>
                <p class="warning">If you didn't request this, please ignore this email.</p>
            </div>
            <div class="footer">
                &copy; ${new Date().getFullYear()} Proxi Management System. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: '"Proxi Security" <iamproxisys@gmail.com>',
        to,
        subject: '🔐 Your Password Reset Code',
        html
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${to}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};
