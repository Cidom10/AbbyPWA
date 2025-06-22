import { useState, useEffect } from 'react';
import { Container, Title, Button, Grid, Box, Text, Modal, TextInput, ScrollArea, Card, Group } from '@mantine/core';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { arrayMove } from '@dnd-kit/sortable';
import { db } from '@/firebase'; // Assuming '@/firebase' correctly points to your firebase.js
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { MealPlanItem } from '@/components/MealPlanItem'; // Adjust path as needed
import Navbar from "@/components/Navbar"; // Adjust path as needed
import theme from '@/theme'; // Import your theme

export default function MealPlanPage() {
    const [allMeals, setAllMeals] = useState([]); // All meals from your 'meals' collection
    const [weeklyPlan, setWeeklyPlan] = useState([]); // The 7-day meal plan
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentDayToSelect, setCurrentDayToSelect] = useState(null); // Which day's meal is being selected
    const [searchQuery, setSearchQuery] = useState(''); // For searching meals in the modal

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // DND Sensors for keyboard and pointer (mouse/touch)
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    useEffect(() => {
        // Initialize an empty plan for the week
        const initialPlan = daysOfWeek.map(day => ({
            id: `${day.toLowerCase()}-dinner`, // Unique ID for DND context
            day: day,
            type: 'dinner',
            mealId: null,
            mealName: null,
            description: null,
            isLocked: false, // Indicates if this slot is "pinned"
        }));
        setWeeklyPlan(initialPlan);
        fetchAllMeals();
    }, []);

    // --- Data Fetching ---
    const fetchAllMeals = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'meals'));
            const mealsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllMeals(mealsList);
        } catch (error) {
            console.error("Error fetching all meals:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Meal Plan Generation & Manipulation ---
    const generatePlan = () => {
        const newPlan = [...weeklyPlan];
        const availableMeals = allMeals.filter(meal =>
            // Exclude meals that are already in a locked slot
            !newPlan.some(slot => slot.isLocked && slot.mealId === meal.id)
        );

        // Fill non-locked slots
        daysOfWeek.forEach((day, index) => {
            const slot = newPlan.find(s => s.day === day);

            if (!slot.isLocked) { // Only generate for unlocked slots
                // Filter out meals already selected for other unlocked slots
                const currentlyUsedIds = newPlan
                    .filter(s => s.id !== slot.id && s.mealId)
                    .map(s => s.mealId);

                const pool = availableMeals.filter(m => !currentlyUsedIds.includes(m.id));

                if (pool.length > 0) {
                    const randomIndex = Math.floor(Math.random() * pool.length);
                    const selectedMeal = pool[randomIndex];
                    slot.mealId = selectedMeal.id;
                    slot.mealName = selectedMeal.name;
                    slot.description = selectedMeal.description;
                } else {
                    // Fallback if no unique meals are left in the pool
                    slot.mealId = null;
                    slot.mealName = 'No unique meals available';
                    slot.description = '';
                }
            }
        });
        setWeeklyPlan(newPlan);
    };

    const removeMealFromSlot = (day) => {
        setWeeklyPlan(currentPlan =>
            currentPlan.map(slot =>
                slot.day === day
                    ? { ...slot, mealId: null, mealName: null, description: null, isLocked: false }
                    : slot
            )
        );
    };

    const regenerateSingleMeal = (day) => {
        const newPlan = [...weeklyPlan];
        const slot = newPlan.find(s => s.day === day);

        if (slot && !slot.isLocked) {
            const currentlyUsedIds = newPlan
                .filter(s => s.id !== slot.id && s.mealId)
                .map(s => s.mealId);

            const pool = allMeals.filter(m => !currentlyUsedIds.includes(m.id));

            if (pool.length > 0) {
                const randomIndex = Math.floor(Math.random() * pool.length);
                const selectedMeal = pool[randomIndex];
                slot.mealId = selectedMeal.id;
                slot.mealName = selectedMeal.name;
                slot.description = selectedMeal.description;
            } else {
                slot.mealId = null;
                slot.mealName = 'No unique meals available';
                slot.description = '';
            }
        }
        setWeeklyPlan(newPlan);
    };

    const toggleMealLock = (day) => {
        setWeeklyPlan(currentPlan =>
            currentPlan.map(slot =>
                slot.day === day
                    ? { ...slot, isLocked: !slot.isLocked }
                    : slot
            )
        );
    };

    const selectSpecificMeal = (day) => {
        setCurrentDayToSelect(day);
        setModalOpen(true);
        setSearchQuery(''); // Reset search query when opening modal
    };

    const handleMealSelection = (mealData) => {
        setWeeklyPlan(currentPlan =>
            currentPlan.map(slot =>
                slot.day === currentDayToSelect
                    ? { ...slot, mealId: mealData.id, mealName: mealData.name, description: mealData.description, isLocked: false } // Unlock when manually picked
                    : slot
            )
        );
        setModalOpen(false);
        setCurrentDayToSelect(null);
    };

    // --- Drag and Drop Handlers ---
    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setWeeklyPlan((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // --- Save Plan to Firestore ---
    const saveMealPlan = async () => {
        setLoading(true);
        try {
            const planName = `Weekly Dinner Plan: ${new Date().toLocaleDateString()}`; // Or allow user to name it
            const formattedMeals = weeklyPlan.map(slot => ({
                day: slot.day,
                type: slot.type,
                mealRef: slot.mealId ? `/meals/${slot.mealId}` : null, // Store as reference path or null
                notes: slot.notes || '', // Ensure notes field exists
            }));

            const planData = {
                name: planName,
                startDate: Timestamp.now(), // Use current date for simplicity
                endDate: Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                meals: formattedMeals,
                createdBy: 'user_id_placeholder', // Replace with actual user ID
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            };

            await addDoc(collection(db, 'mealPlans'), planData);
            alert('Meal plan saved successfully!'); // Use a Mantine notification for better UX
        } catch (error) {
            console.error("Error saving meal plan:", error);
            alert('Failed to save meal plan.'); // Use a Mantine notification for better UX
        } finally {
            setLoading(false);
        }
    };

    // Filter meals for the selection modal based on search query
    const filteredMeals = allMeals.filter(meal =>
        meal.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box w={"100vw"} minHeight={"100vh"} p={0} style={{ display: 'flex', flexDirection: 'column' }}>
            <Container
                size="md"
                py="xl"
                style={{ flexGrow: 1, paddingBottom: '7vh' }}
            >
                <Title align="center" mb="md">Weekly Dinner Plan</Title>

                <Group justify="center" mb="lg">
                    <Button onClick={generatePlan} loading={loading}>
                        Generate This Week's Plan
                    </Button>
                    <Button onClick={saveMealPlan} loading={loading} variant="outline" color={theme.colors.brand[6]}>
                        Save Current Plan
                    </Button>
                </Group>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={weeklyPlan.map(meal => meal.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <Grid gutter="md">
                            {weeklyPlan.map(meal => (
                                <Grid.Col key={meal.id} xs={12} sm={6} md={4}> {/* Responsive columns */}
                                    <MealPlanItem
                                        id={meal.id}
                                        meal={meal}
                                        onRemove={removeMealFromSlot}
                                        onRegenerate={regenerateSingleMeal}
                                        onToggleLock={toggleMealLock}
                                        onSelectSpecific={selectSpecificMeal}
                                        isDragging={false} // Placeholder, dnd-kit provides this via a hook if needed
                                    />
                                </Grid.Col>
                            ))}
                        </Grid>
                    </SortableContext>
                </DndContext>

                {/* Modal for selecting a specific meal */}
                <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Select a Meal">
                    <TextInput
                        placeholder="Search meals..."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        mb="md"
                    />
                    <ScrollArea h={300}>
                        {filteredMeals.length === 0 ? (
                            <Text c="dimmed" ta="center">No meals found. Try adjusting your search or add more meals.</Text>
                        ) : (
                            filteredMeals.map(meal => (
                                <Card
                                    key={meal.id}
                                    shadow="sm"
                                    padding="sm"
                                    radius="md"
                                    withBorder
                                    mb="xs"
                                    onClick={() => handleMealSelection(meal)}
                                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: theme.colors.brand[0] } }}
                                >
                                    <Text fw={500}>{meal.name}</Text>
                                    {meal.description && <Text size="sm" c="dimmed" lineClamp={1}>{meal.description}</Text>}
                                </Card>
                            ))
                        )}
                    </ScrollArea>
                </Modal>
            </Container>
            <Navbar />
        </Box>
    );
}