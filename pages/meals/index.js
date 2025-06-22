import { useState, useEffect } from 'react';
import { Container, Title, Button, Grid, Card, Text, Group, ActionIcon, Box } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { db } from '@/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import Navbar from "../../components/Navbar";

export default function MealsPage() {
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMeals();
    }, []);

    // Function to fetch all meals from Firestore
    const fetchMeals = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'meals'));
            const mealsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMeals(mealsList);
        } catch (error) {
            console.error("Error fetching meals:", error);
            // Optionally, set an error state here to display to the user
        } finally {
            setLoading(false);
        }
    };

    // Function to delete a meal from Firestore
    const deleteMeal = async (id) => {
        try {
            await deleteDoc(doc(db, 'meals', id));
            setMeals(meals.filter((meal) => meal.id !== id));
        } catch (error) {
            console.error("Error deleting meal:", error);
            // Optionally, set an error state here
        }
    };

    // Handler for navigating to the add new meal page
    const navigateToAddMeal = () => {
        window.location.href = "/meals/new"; // This will navigate to a new page, e.g., /pages/meals/new.js
    };

    return (
        <Box w={"100vw"} h={"100vh"} p={0}>
            <Container size="md" py="xl" h={"93vh"}>
                <Title align="center" mb="md">Your Meals</Title>

                <Button fullWidth leftSection={<IconPlus size={18} />} onClick={navigateToAddMeal} mb="md">
                    Add New Meal
                </Button>

                {loading ? (
                    <Text align="center" mt="md">Loading meals...</Text>
                ) : meals.length === 0 ? (
                    <Text align="center" mt="md">No meals added yet. Click "Add New Meal" to get started!</Text>
                ) : (
                    <Grid gutter="md">
                        {meals.map((meal) => (
                            <Grid.Col key={meal.id} xs={12} sm={6} md={4}>
                                <Card shadow="sm" radius="md" p="md" withBorder>
                                    <Group justify="space-between" align="center" mb="xs">
                                        <Text fw={700} size="lg" lineClamp={1}>
                                            {meal.name}
                                        </Text>
                                        <ActionIcon color="red" size="sm" onClick={() => deleteMeal(meal.id)}>
                                            <IconTrash size={18} />
                                        </ActionIcon>
                                    </Group>
                                    {meal.description && (
                                        <Text c="dimmed" size="sm" lineClamp={2}>
                                            {meal.description}
                                        </Text>
                                    )}
                                    {/* Optionally display other fields like ingredients or instructions if they exist and are not empty */}
                                    {meal.ingredients && meal.ingredients.length > 0 && (
                                        <Text size="xs" mt="sm">
                                            Ingredients: {meal.ingredients.map(i => i.item).join(', ')}
                                        </Text>
                                    )}
                                    {meal.notes && (
                                        <Text size="xs" mt="xs" c="blue">
                                            Notes: {meal.notes}
                                        </Text>
                                    )}
                                </Card>
                            </Grid.Col>
                        ))}
                    </Grid>
                )}
            </Container>
            <Navbar />
        </Box>
    );
}