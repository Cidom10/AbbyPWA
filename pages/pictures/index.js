import { useState, useEffect } from 'react';
import { Container, Title, Button, Grid, Card, Image, Group, ActionIcon, FileButton, Loader, Text, ScrollArea, Box, Flex } from '@mantine/core';
import { IconUpload, IconTrash } from '@tabler/icons-react';
import { db, storage } from '@/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import Navbar from '../../components/Navbar';

const MAX_FILE_SIZE_MB = 5; // Max file size in MB

export default function PicturesPage() {
    const [pictures, setPictures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastVisible, setLastVisible] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPictures();
    }, []);

    // Fetch images from Firestore (Paginated: Loads 20 images at a time)
    const fetchPictures = async (more = false) => {
        setLoading(true);
        const imagesRef = collection(db, 'pictures');
        let q = query(imagesRef, orderBy('uploadDate', 'desc'), limit(20));

        if (more && lastVisible) {
            q = query(imagesRef, orderBy('uploadDate', 'desc'), startAfter(lastVisible), limit(20));
        }

        const snapshot = await getDocs(q);
        const newPictures = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setPictures(more ? [...pictures, ...newPictures] : newPictures);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1] || null);
        setLoading(false);
    };

    // Upload Image to Firebase Storage & Save URL to Firestore
    const uploadPicture = async (file) => {
        if (!file) return;

        // Validate file size
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
            return;
        }

        setUploading(true);
        setError(null);

        const storageRef = ref(storage, `pictures/${file.name}-${Date.now()}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        const docRef = await addDoc(collection(db, 'pictures'), {
            imageURL: downloadURL,
            uploadDate: new Date().toISOString(),
        });

        setPictures([{ id: docRef.id, imageURL: downloadURL, uploadDate: new Date().toISOString() }, ...pictures]);
        setUploading(false);
    };

    // Delete Image from Firebase Storage & Firestore
    const deletePicture = async (id, imageURL) => {
        await deleteDoc(doc(db, 'pictures', id));
        const storageRef = ref(storage, imageURL);
        await deleteObject(storageRef);
        setPictures(pictures.filter((pic) => pic.id !== id));
    };

    return <Box w={"100vw"} h={"100vh"}>
        <Container size="md" py="xl" h={"93vh"} w={"99vw"}>
            <Title align="center" mb="md">Picture Gallery</Title>
            <Flex justify="center" mb="md">
                <FileButton onChange={uploadPicture} accept="image/*">
                    {(props) => (
                        <Button {...props} leftIcon={<IconUpload size={18} />} loading={uploading}>
                            Upload Picture
                        </Button>
                    )}
                </FileButton>
            </Flex>

            {error && <Text color="red" align="center" mt="md">{error}</Text>}

            {/* Scrollable Image Grid (3-Image Wide) */}
            <ScrollArea style={{ height: "70vh" }} scrollbars="y">
                <Grid gutter="md" columns={3}>
                    {pictures.map((pic) => (
                        <Grid.Col key={pic.id} span={1}>
                            <Card shadow="sm" radius="md">
                                <Image src={pic.imageURL} height={200} radius="md" />
                                <Group position="apart" mt="sm">
                                    <Text size="xs" c="gray">
                                        {new Date(pic.uploadDate).toLocaleDateString()}
                                    </Text>
                                    <ActionIcon color="red" size="sm" onClick={() => deletePicture(pic.id, pic.imageURL)}>
                                        <IconTrash size={18} />
                                    </ActionIcon>
                                </Group>
                            </Card>
                        </Grid.Col>
                    ))}
                </Grid>
                {/* Load More Button */}
                <Flex justify="center" mt="md">
                    {lastVisible && (
                        <Group position="center" mt="md">
                            <Button onClick={() => fetchPictures(true)} disabled={loading}>
                                {loading ? <Loader size="sm" /> : "Load More"}
                            </Button>
                        </Group>
                    )}
                </Flex>
            </ScrollArea>
        </Container>
        <Navbar />
    </Box>;
}