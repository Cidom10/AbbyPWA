import { useState, useEffect } from 'react';
import { Container, Text, Button, Card, Title, Progress, Divider, Box, Flex } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import confetti from 'canvas-confetti';
import { theme } from '@/theme';
import { IconCalendar, IconCamera, IconHome, IconImageInPicture, IconMovie, IconNote, IconPictureInPicture } from '@tabler/icons-react';
import { useRouter } from 'next/router';

// Daily Quotes (Editable List)
const quotes = [
    "A meaningful connection grows stronger every day.",
    "The best moments are the ones we share.",
    "Every journey is better with you by my side.",
];

let navStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRight: `1px solid ${theme.colors.brand[5]}`
}
let navStyleActive = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRight: `1px solid ${theme.colors.brand[5]}`,
    backgroundColor: theme.colors.brand[5],
    color: "#fff"
}

export default function Home() {
    let router = useRouter();
    const [quote, setQuote] = useState('');
    const [loveMeter, setLoveMeter] = useState(0);
    const [firstOpen, setFirstOpen] = useLocalStorage({ key: 'first-open', defaultValue: true });
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

        if (firstOpen) {
            confetti({ particleCount: 100, spread: 70 });
            setFirstOpen(false);
        }
    }, []);

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

    return <Box w={"100vw"} h={"100vh"} pb={0} mb={0}>
        <Container size="sm" py="xl" w={"100vw"} h={"93vh"}>
            {/* Title */}
            <Title align="center">The Idom Home Base</Title>

            <Divider my="lg" />

            {/* Daily Quote */}
            <Card shadow="sm" p="lg" radius="md" withBorder mt="md">
                <Text align="center" size="lg" weight={500}>{quote}</Text>
            </Card>

            {/* Love Meter */}
            <Card shadow="sm" p="lg" radius="md" withBorder mt="md" >
                <Text align="center" size="lg">🎉 Keep Clicking for Attention! 🎉</Text>
                <Progress value={Math.min(loveMeter, 100)} color="brand" size="lg" radius="xl" mt="md" />
                <Button
                    fullWidth mt="md"
                    color="brand"
                    onClick={() => {
                        setLoveMeter(loveMeter + 5);
                        confetti({ particleCount: 10, spread: 50 });
                    }}
                >
                    Increase
                </Button>
            </Card>

            {/* Wedding Countdown */}
            <Card shadow="sm" p="lg" radius="md" withBorder mt="md">
                <Text align="center" size="lg" weight={700} transform="uppercase">
                    🔔 Wedding Countdown 🔔
                </Text>

                <Container style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "10px" }} px={0}>
                    {Object.entries(countdown).map(([label, value]) => (
                        <div key={label} style={{
                            textAlign: "center",
                            minWidth: "50px",
                            padding: "8px",
                            borderRadius: "10px",
                            background: theme.colors.brand[5],
                            boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
                            color: "#fff",
                            fontSize: "28px",
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
        <Flex w={"100vw"} h={"7vh"} p={0} direction={"row"}
            style={{ borderTop: `1px solid ${theme.colors.brand[5]}` }}
        >
            <Box w={"20%"} style={navStyle} onClick={() => router.push("/notes")} >
                <IconNote color={theme.colors.brand[5]} />
                <Text>Notes</Text>
            </Box>
            <Box w={"20%"} style={navStyle} onClick={() => router.push("/movies")} >
                <IconMovie color={theme.colors.brand[5]} />
                <Text>Movies</Text>
            </Box>
            <Box w={"20%"} style={navStyleActive} onClick={() => router.push("/")} >
                <IconHome color={"white"} />
                <Text>Home</Text>
            </Box>
            <Box w={"20%"} style={navStyle} onClick={() => router.push("/pictures")} >
                <IconCamera color={theme.colors.brand[5]} />
                <Text>Pictures</Text>
            </Box>
            <Box w={"20%"} style={navStyle} bd={0} onClick={() => router.push("/calendar")} >
                <IconCalendar color={theme.colors.brand[5]} />
                <Text>Calendar</Text>
            </Box>
        </Flex>
    </Box>
}