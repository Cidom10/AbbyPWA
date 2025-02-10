import { useState, useEffect } from 'react';
import { Container, Title, Button, Grid, Card, Text, ActionIcon, Modal, Textarea, Box, Badge, NativeSelect, Group } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import Navbar from '../../components/Navbar';
import { db } from '@/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function NotesPage() {
    const [notes, setNotes] = useState([]);
    const [opened, setOpened] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [newAuthor, setNewAuthor] = useState('Cal'); // Default author

    useEffect(() => {
        fetchNotes();
    }, []);

    // Fetch notes from Firebase Firestore for both "Cal" and "Abby"
    const fetchNotes = async () => {
        try {
            const calNotesSnapshot = await getDocs(collection(db, 'calNotes'));
            const abbyNotesSnapshot = await getDocs(collection(db, 'abbyNotes'));

            const calNotes = calNotesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), author: 'Cal' }));
            const abbyNotes = abbyNotesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), author: 'Abby' }));

            setNotes([...calNotes, ...abbyNotes]); // Combine both authors' notes
        } catch (error) {
            console.error("Error fetching notes: ", error);
        }
    };

    // Add a new note to Firebase Firestore under the correct author's document
    const addNote = async () => {
        if (newNote.trim() === '') return;

        const noteData = {
            text: newNote,
            date: new Date().toISOString(), // Store the current date
        };

        try {
            if (newAuthor === 'Cal') {
                const docRef = await addDoc(collection(db, 'calNotes'), noteData);
                setNotes([...notes, { id: docRef.id, ...noteData, author: newAuthor }]);
                setNewNote('');
                setOpened(false);
            } else {
                const docRef = await addDoc(collection(db, 'abbyNotes'), noteData);
                setNotes([...notes, { id: docRef.id, ...noteData, author: newAuthor }]);
                setNewNote('');
                setOpened(false);
            }
        } catch (error) {
            console.error("Error adding note: ", error);
        }
    };

    // Delete a note from Firebase Firestore under the correct author
    const deleteNote = async (id, author) => {
        try {
            if (author == 'Cal') await deleteDoc(doc(db, 'calNotes', id));
            else if (author == 'Abby') await deleteDoc(doc(db, 'abbyNotes', id));
            setNotes(notes.filter((note) => note.id !== id));
        } catch (error) {
            console.error("Error deleting note: ", error);
        }
    };

    return (
        <Box w={"100vw"} h={"100vh"}>
            <Container size="md" py="xl" h={"93vh"}>
                {/* Header */}
                <Title align="center" mb="md">Notes</Title>
                <Button fullWidth leftIcon={<IconPlus size={18} />} onClick={() => setOpened(true)} mb="md">
                    Add Note
                </Button>

                {/* Notes Grid */}
                <Grid gutter="md">
                    {notes.map((note) => (
                        <Grid.Col key={note.id} xs={12} sm={6} md={4} lg={3}>
                            <Card shadow="sm" p="md" radius="md" sx={{ backgroundColor: '#A5DDE0', color: 'white' }}>
                                {/* Row for badge, date, and trash icon */}
                                <Group position="apart" spacing="xs">
                                    <Badge color={note.author === 'Cal' ? 'blue' : 'pink'}>{note.author}</Badge>
                                    <Text size="xs" color="gray">
                                        {new Date(note.date).toLocaleDateString()}
                                    </Text>
                                    <ActionIcon color="red" size="sm" onClick={() => deleteNote(note.id, note.author)}>
                                        <IconTrash size={18} />
                                    </ActionIcon>
                                </Group>

                                {/* Note Content */}
                                <Text size="sm" mt="sm">{note.text}</Text>
                            </Card>
                        </Grid.Col>
                    ))}
                </Grid>

                {/* Add Note Modal */}
                <Modal opened={opened} onClose={() => setOpened(false)} title="New Note">
                    <Textarea
                        placeholder="Type your note here..."
                        value={newNote}
                        onChange={(event) => setNewNote(event.target.value)}
                        minRows={4}
                    />
                    <NativeSelect
                        data={["Cal", "Abby"]}
                        description="Who made the note?"
                        mt={"md"}
                        onChange={(e) => setNewAuthor(e.target.value)}
                        value={newAuthor}
                    />
                    <Button fullWidth mt="md" onClick={addNote}>
                        Save Note
                    </Button>
                </Modal>
            </Container>
            <Navbar />
        </Box>
    );
}