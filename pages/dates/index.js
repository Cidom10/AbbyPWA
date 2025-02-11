import { useState, useEffect } from 'react';
import { Container, Title, Button, Card, Text, Group, Modal, TextInput, Select, ActionIcon, Flex, Box } from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { db } from '@/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import Navbar from '../../components/Navbar';

export default function DatesPage() {
    const [events, setEvents] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDate, setNewDate] = useState(new Date());
    const [newTime, setNewTime] = useState('');
    const [repeat, setRepeat] = useState('no');

    useEffect(() => {
        fetchEvents();
    }, []);

    // Fetch events from Firestore and filter past non-repeating events
    const fetchEvents = async () => {
        const querySnapshot = await getDocs(collection(db, 'importantDates'));
        let eventsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const today = new Date();

        // Filter past events unless they repeat yearly
        eventsList = eventsList.filter(event =>
            event.repeat === 'yearly' || new Date(event.date) > today
        );

        // Sort by closest upcoming date
        eventsList.sort((a, b) => new Date(a.date) - new Date(b.date));

        setEvents(eventsList);
    };

    // Add a new event to Firebase
    const addEvent = async () => {
        if (!newTitle.trim()) return;

        const formattedDate = format(newDate, 'yyyy-MM-dd'); // Ensure correct date format
        const formattedTime = newTime instanceof Date ? format(newTime, 'HH:mm') : null; // Prevent errors

        const eventData = {
            title: newTitle,
            date: formattedDate,
            time: formattedTime, // Store time only if valid
            repeat: repeat,
        };

        try {
            const docRef = await addDoc(collection(db, 'importantDates'), eventData);
            setEvents([...events, { id: docRef.id, ...eventData }]);
            setModalOpen(false);
            setNewTitle('');
            setNewDate(new Date());
            setNewTime(null); // Reset properly
            setRepeat('no');
        } catch (error) {
            console.error("Error adding event:", error);
        }
    };

    // Delete an event from Firebase
    const deleteEvent = async (id) => {
        await deleteDoc(doc(db, 'importantDates', id));
        setEvents(events.filter(event => event.id !== id));
    };

    return <Box w={"100vw"} h={"100vh"} p={0}>
        <Container size="md" py="xl" h="93vh">
            <Title align="center" mb="md">Important Dates</Title>

            <Button fullWidth leftIcon={<IconPlus size={18} />} onClick={() => setModalOpen(true)} mb="md">
                Add Important Date
            </Button>

            {/* Events List */}
            {events.map((event) => (
                <Card key={event.id} shadow="sm" radius="md" p="md" mb="md">
                    <Group position="apart">
                        <Text weight={600}>{event.title}</Text>
                        <ActionIcon color="red" size="sm" onClick={() => deleteEvent(event.id)}>
                            <IconTrash size={18} />
                        </ActionIcon>
                    </Group>
                    <Text size="sm" color="gray">
                        {format(new Date(event.date), 'MMMM d, yyyy')}
                        {event.time ? ` at ${event.time}` : ''}
                    </Text>
                    {event.repeat === 'yearly' && <Text size="xs" color="blue">Repeats every year</Text>}
                </Card>
            ))}

            {/* Add Event Modal */}
            <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Add Important Date">
                <TextInput
                    placeholder="Title of the event"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                />
                <Flex w="100%" justify="center" mt={"md"}>
                    <DatePicker
                        selected={newDate}
                        onChange={(date) => setNewDate(date)}
                        dateFormat="MMMM d, yyyy"
                        className="custom-datepicker"
                    />
                </Flex>
                <TimeInput
                    placeholder="Optional time"
                    value={newTime}
                    onChange={(event) => setNewTime(event.target.value)}
                    mt="md"
                />
                <Select
                    data={[
                        { value: 'no', label: 'One-Time Event' },
                        { value: 'yearly', label: 'Repeats Yearly' }
                    ]}
                    value={repeat}
                    onChange={setRepeat}
                    label="Does this event repeat?"
                    mt="md"
                />
                <Button fullWidth mt="md" onClick={addEvent}>
                    Save Event
                </Button>
            </Modal>
        </Container>
        <Navbar />
    </Box>;
}