export const sendBrevoEmail = async (toEmail, toName, subject, htmlContent) => {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'hello@glitzcreativez.com';
    const senderName = process.env.BREVO_SENDER_NAME || 'Glitz Creativez';

    if (!apiKey) {
        console.warn('BREVO_API_KEY is not defined. Email not sent.');
        return false;
    }

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'api-key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: senderName, email: senderEmail },
                to: [{ email: toEmail, name: toName }],
                subject: subject,
                htmlContent: htmlContent
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Failed to send email via Brevo:', errorData);
            return false;
        }

        const data = await response.json();
        console.log(`[Brevo] Email sent successfully to ${toEmail}, messageId: ${data.messageId}`);
        return true;
    } catch (error) {
        console.error('Error sending email via Brevo:', error);
        return false;
    }
};
