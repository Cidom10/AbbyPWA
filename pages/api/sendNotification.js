import admin from "firebase-admin";

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            project_id: process.env.FIREBASE_PROJECT_ID,
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            private_key: process.env.FIREBASE_PRIVATE_KEY,
        }),
    });
}

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

    const { message, token } = req.body; // Token is the recipient's FCM token

    const payload = {
        message: {
            token: token,
            notification: {
                title: "Progress Update",
                body: message,
            },
            android: {
                priority: "high",
            },
            apns: {
                payload: {
                    aps: {
                        sound: "default",
                    },
                },
            },
        },
    };

    try {
        const response = await admin.messaging().send(payload);
        res.status(200).json({ success: true, response });
    } catch (error) {
        console.error("Error sending notification:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}