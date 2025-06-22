import { useState, useEffect } from 'react';
import { Container, Title, Button, Grid, Card, Image, Text, Group, ActionIcon, Modal, TextInput, Loader, Box, ScrollArea } from '@mantine/core';
import { IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { db } from '@/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import Navbar from "../../components/Navbar"

export default function MoviesPage() {
    const [movies, setMovies] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        fetchMovies();
    }, []);

    // Fetch saved movies from Firebase
    const fetchMovies = async () => {
        const querySnapshot = await getDocs(collection(db, 'movies'));
        const moviesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMovies(moviesList);
    };

    // Search TMDb API
    const searchMovies = async () => {
        if (!searchQuery) return;
        setLoading(true);
        const url = `https://api.themoviedb.org/3/search/movie?query=${searchQuery}&language=en-US&page=1`;
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}`
            }
        };
        fetch(url, options)
            .then(res => res.json())
            .then(json => {
                console.log(json);
                setSearchResults(json.results || []);
                setLoading(false);
            })
            .catch(err => console.error(err));
    };

    // Add selected movie to Firebase
    const addMovie = async (movie) => {
        const movieData = {
            title: movie.title,
            poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            genre: movie.genre_ids[0] || 'Unknown', // Gets first genre (fallback: Unknown)
        };

        const docRef = await addDoc(collection(db, 'movies'), movieData);
        setMovies([...movies, { id: docRef.id, ...movieData }]);
        setModalOpen(false);
    };

    // Delete a movie
    const deleteMovie = async (id) => {
        await deleteDoc(doc(db, 'movies', id));
        setMovies(movies.filter((movie) => movie.id !== id));
    };

    return <Box w={"100vw"} h={"100vh"} p={0} pos={"relative"}>
        <Container size="md" py="xl" h={"93vh"}>
            <Title align="center" mb="md">Movie Watchlist</Title>

            <Button fullWidth leftIcon={<IconPlus size={18} />} onClick={() => setModalOpen(true)} mb="md">
                Add Movie
            </Button>

            {/* Movies Grid (Fixed 3-Column Layout & Uniform Height Cards) */}
            <ScrollArea h="70vh" scrollbars="y">
                <Grid gutter="md" columns={3}>
                    {movies.map((movie) => (
                        <Grid.Col key={movie.id} span={1}>
                            <Card shadow="md" bd={"1px solid black"} radius="md" h={220} sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                <Image src={movie.poster} height={200} radius="md" />
                                <Text align="center" weight={600} lineClamp={1} mt="sm">{movie.title}</Text>
                                <Group position="center" mt="sm">
                                    <ActionIcon color="red" size="sm" onClick={() => deleteMovie(movie.id)}>
                                        <IconTrash size={18} />
                                    </ActionIcon>
                                </Group>
                            </Card>
                        </Grid.Col>
                    ))}
                </Grid>
            </ScrollArea>

            {/* Add Movie Modal */}
            <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Search for a Movie">
                <TextInput
                    placeholder="Enter movie title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    rightSection={
                        <ActionIcon onClick={searchMovies}>
                            <IconSearch size={18} />
                        </ActionIcon>
                    }
                />
                {loading && <Loader size="sm" mt="md" />}

                {/* Search Results */}
                <Grid gutter="md" mt="md">
                    {searchResults.map((movie) => (
                        <Grid.Col key={movie.id} xs={12} sm={6}>
                            <Card shadow="sm" p="sm" radius="md" onClick={() => addMovie(movie)} sx={{ cursor: 'pointer' }}>
                                <Group noWrap>
                                    <Image src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} height={80} radius="md" />
                                    <Text size="sm">{movie.title}</Text>
                                </Group>
                            </Card>
                        </Grid.Col>
                    ))}
                </Grid>
            </Modal>
        </Container>
        <Navbar />
    </Box>;
}