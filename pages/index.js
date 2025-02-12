import { useState, useEffect } from 'react';
import { Container, Text, Button, Card, Title, Progress, Divider, Box, Flex, Anchor } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { app } from '@/firebase';
import { getMessaging, getToken } from 'firebase/messaging';
import theme from "../theme"
import confetti from 'canvas-confetti';
import Navbar from "../components/Navbar";

// Daily Quotes (Editable List)
const quotes = [
    "Really cool quote"
];

export default function Home() {
    const [quote, setQuote] = useState('');
    const [attentionMeter, setAttentionMeter] = useState(0);
    const [firstOpen, setFirstOpen] = useLocalStorage({ key: 'first-open', defaultValue: true });
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [fcmToken, setFcmToken] = useState("");

    useEffect(() => {
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

        if (firstOpen) {
            confetti({ particleCount: 100, spread: 70 });
            setFirstOpen(false);
        }
    }, []);

    useEffect(() => {
        const requestPermission = async () => {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                // const token = await getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY });
                const messaging = getMessaging(app);
                getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY }).then((currentToken) => {
                    if (currentToken) {
                        // Send the token to your server and update the UI if necessary
                        // ...
                        console.log("Token: ", currentToken);
                        setFcmToken(currentToken);

                    } else {
                        // Show permission request UI
                        console.log('No registration token available. Request permission to generate one.');
                        // ...
                    }
                }).catch((err) => {
                    console.log('An error occurred while retrieving token. ', err);
                    // ...
                });
            } else {
                console.warn("Permission denied for notifications");
            }
        };
        requestPermission();
    }, []);

    // Function to send notification when progress is full
    const sendNotification = async () => {
        await fetch("/api/sendNotification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Your progress bar is full!", token: fcmToken }),
        });
    };

    // Trigger notification when progress reaches 100%
    useEffect(() => {
        if (attentionMeter >= 100) {
            sendNotification();
        }
    }, [attentionMeter, fcmToken]);

    // Wedding Countdown Logic (Updates Every Second)
    useEffect(() => {
        const weddingDate = new Date("2025-05-25T05:30:00").getTime();

        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = weddingDate - now;

            if (distance < 0) {
                setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            setCountdown({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000),
            });
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, []);

    return <Box w={"100vw"} h={"100vh"}>
        <Container size="sm" py="xl" h={"93vh"}>
            {/* Title */}
            <Title align="center">The Idom Homebase</Title>

            <Divider my="lg" />

            {/* Daily Quote */}
            <Card shadow="sm" p="lg" radius="md" withBorder mt="md">
                <Text align="center" size="lg" weight={500}>{quote}</Text>
            </Card>

            {/* Attention Meter */}
            <Card shadow="sm" p="lg" radius="md" withBorder mt="md">
                <Text align="center" size="lg">Click for Attention!</Text>
                <Progress value={Math.min(attentionMeter, 100)} color={theme.colors.brand[5]} size="lg" radius="xl" mt="md" />
                <Button
                    fullWidth mt="md"
                    color={theme.colors.brand[5]}
                    onClick={() => {
                        setAttentionMeter(attentionMeter + 5);
                        confetti({ particleCount: 10, spread: 50 });
                    }}
                    disabled={attentionMeter >= 100}
                >
                    Increase
                </Button>
            </Card>

            {/* Wedding Countdown */}
            <Card shadow="sm" p="lg" radius="md" withBorder mt="md" pl={0}>
                <Text align="center" size="lg" weight={700} transform="uppercase">
                    Wedding Countdown
                </Text>

                <Container style={{ display: "flex", justifyContent: "space-around", gap: "10px", marginTop: "10px" }} >
                    {Object.entries(countdown).map(([label, value]) => (
                        <div key={label} style={{
                            textAlign: "center",
                            minWidth: "60px",
                            padding: "8px",
                            borderRadius: "10px",
                            background: theme.colors.brand[5],
                            boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
                            color: "#fff",
                            fontSize: "32px",
                            fontWeight: "bold",
                            animation: "fadeIn 0.5s ease-in-out",
                        }}>
                            {value}
                            <Text size="sm" style={{ fontWeight: 400, textTransform: "uppercase" }}>{label}</Text>
                        </div>
                    ))}
                </Container>
            </Card>

            {/* Custom CSS for Animation */}
            <style jsx global>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
        </Container>
        <Navbar />
    </Box>;
}