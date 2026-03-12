const nodemailer = require('nodemailer');

// This version uses Ethereal Email for testing
// No Gmail configuration needed!
const sendEmail = async (options) => {
    try {
        // Create a test account (for development only)
        let transporter;

        if (process.env.NODE_ENV === 'production') {
            // Production: Use Gmail
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
        } else {
            // Development: Use Ethereal (test email)
            const testAccount = await nodemailer.createTestAccount();

            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });

            console.log('📧 Using Ethereal Email for testing');
            console.log('Test account:', testAccount.user);
        }

        // Email options
        const mailOptions = {
            from: `EduLearn LMS <${process.env.EMAIL_USER || 'noreply@edulearn.com'}>`,
            to: options.email,
            subject: options.subject,
            html: options.message
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);

        if (process.env.NODE_ENV !== 'production') {
            // In development, log the preview URL
            console.log('✅ Email sent successfully!');
            console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
            console.log('👆 Open this URL in your browser to see the email');
        } else {
            console.log('Email sent successfully:', info.messageId);
        }

        return {
            success: true,
            messageId: info.messageId,
            previewUrl: nodemailer.getTestMessageUrl(info)
        };
    } catch (error) {
        console.error('Email sending error:', error);
        throw new Error('Email could not be sent');
    }
};

module.exports = sendEmail;
