const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin only if it hasn't been initialized
if (!admin.apps.length) {
    // Reconstructing the service account provided in the instructions
    const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        token_uri: "https://oauth2.googleapis.com/token",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        universe_domain: "googleapis.com"
    };

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const {
            customerName,
            phoneNumber,
            whatsappNumber,
            productService,
            quantity,
            deliveryAddress,
            specialNotes
        } = req.body;

        if (!customerName || !phoneNumber || !productService) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // 1. Save to Firebase Firestore
        const orderDoc = {
            customerName,
            phoneNumber,
            whatsappNumber: whatsappNumber || '',
            productService,
            quantity: quantity || 1,
            deliveryAddress: deliveryAddress || '',
            specialNotes: specialNotes || '',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('orders').add(orderDoc);

        // 2. Send Email Notification via Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.GMAIL_USER || 'devlopers36@gmail.com',
            to: 'devlopers36@gmail.com',
            subject: `New Order from ${customerName} — Webzio`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #185FA5;">🚀 New Webzio Order Received!</h2>
                    <table style="width: 100%; border-collapse: collapse; max-width: 600px;">
                        <tr style="background: #f8f9fa;">
                            <th style="text-align: left; padding: 10px; border: 1px solid #ddd;">Customer Name</th>
                            <td style="padding: 10px; border: 1px solid #ddd;">${customerName}</td>
                        </tr>
                        <tr>
                            <th style="text-align: left; padding: 10px; border: 1px solid #ddd;">Phone Number</th>
                            <td style="padding: 10px; border: 1px solid #ddd;">${phoneNumber}</td>
                        </tr>
                        <tr style="background: #f8f9fa;">
                            <th style="text-align: left; padding: 10px; border: 1px solid #ddd;">WhatsApp Number</th>
                            <td style="padding: 10px; border: 1px solid #ddd;">${whatsappNumber || 'N/A'}</td>
                        </tr>
                        <tr>
                            <th style="text-align: left; padding: 10px; border: 1px solid #ddd;">Product/Package</th>
                            <td style="padding: 10px; border: 1px solid #ddd;"><b>${productService}</b></td>
                        </tr>
                        <tr style="background: #f8f9fa;">
                            <th style="text-align: left; padding: 10px; border: 1px solid #ddd;">Quantity</th>
                            <td style="padding: 10px; border: 1px solid #ddd;">${quantity}</td>
                        </tr>
                        <tr>
                            <th style="text-align: left; padding: 10px; border: 1px solid #ddd;">Address/Location</th>
                            <td style="padding: 10px; border: 1px solid #ddd;">${deliveryAddress || 'N/A'}</td>
                        </tr>
                        <tr style="background: #f8f9fa;">
                            <th style="text-align: left; padding: 10px; border: 1px solid #ddd;">Special Notes</th>
                            <td style="padding: 10px; border: 1px solid #ddd;">${specialNotes || 'None'}</td>
                        </tr>
                    </table>
                    <p style="margin-top: 20px; font-size: 0.9em; color: #888;">Order submitted via Webzio Vercel API seamlessly integrated with Firebase Admin SDK.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ success: true, message: 'Order submitted successfully' });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ success: false, message: 'Order failed', error: error.message });
    }
}
