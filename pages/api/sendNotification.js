import { admin } from "@/firebase-admin";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

    try {
        // Get all registered FCM tokens from Firestore
        const devicesSnapshot = await getDocs(collection(db, "devices"));
        const tokens = devicesSnapshot.docs.map((doc) => doc.data().token);

        if (tokens.length === 0) {
            return res.status(400).json({ message: "No devices registered" });
        }

        // Send notification to all devices
        const payload = {
            notification: {
                title: "URGENT ALERT",
                body: "Abby needs attention ASAP!",
            },
            tokens: tokens, // Send to all registered devices
        };

        const response = await admin.messaging().sendEachForMulticast(payload);
        res.status(200).json({ success: true, response });
    } catch (error) {
        console.error("Error sending notification:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}