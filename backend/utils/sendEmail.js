const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        let transporter;

        // Check if Gmail credentials are configured
        const hasGmailConfig = process.env.EMAIL_USER &&
            process.env.EMAIL_PASS &&
            process.env.EMAIL_USER !== 'your_email@gmail.com';

        if (hasGmailConfig) {
            // Use Gmail if configured
            console.log('📧 Using Gmail for sending emails');
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
        } else {
            // Use Ethereal Email for testing (no configuration needed)
            console.log('📧 Gmail not configured, using Ethereal Email for testing');
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

            console.log('📧 Test email account:', testAccount.user);
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

        if (!hasGmailConfig) {
            // Show preview URL for Ethereal emails
            const previewUrl = nodemailer.getTestMessageUrl(info);
            console.log('✅ Email sent successfully!');
            console.log('📧 Preview URL:', previewUrl);
            console.log('👆 Open this URL in your browser to see the email');
            console.log('');
        } else {
            console.log('✅ Email sent successfully:', info.messageId);
        }

        return {
            success: true,
            messageId: info.messageId,
            previewUrl: nodemailer.getTestMessageUrl(info)
        };
    } catch (error) {
        console.error('❌ Email sending error:', error.message);
        throw new Error('Email could not be sent');
    }
};

module.exports = sendEmail;
