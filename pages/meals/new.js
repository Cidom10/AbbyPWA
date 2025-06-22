import { useState } from 'react';
import { Container, Title, Button, TextInput, Textarea, Group, ActionIcon, Box, Flex, Text, ScrollArea } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { db } from '@/firebase'; // Assuming '@/firebase' correctly points to your firebase.js
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import Navbar from "../../components/Navbar"; // Adjust path if your Navbar is elsewhere
import theme from '../../theme'; // Assuming your theme is in ../../theme.ts or .js

export default function NewMealPage() {
    const router = useRouter();

    // State for main meal fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [notes, setNotes] = useState('');

    // State for dynamic arrays (ingredients and instructions)
    const [ingredients, setIngredients] = useState([{ item: '', quantity: '', unit: '' }]);
    const [instructions, setInstructions] = useState(['']);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- Ingredient Handlers ---
    const handleIngredientChange = (index, field, value) => {
        const newIngredients = [...ingredients];
        newIngredients[index][field] = value;
        setIngredients(newIngredients);
    };

    const addIngredient = () => {
        setIngredients([...ingredients, { item: '', quantity: '', unit: '' }]);
    };

    const removeIngredient = (index) => {
        const newIngredients = [...ingredients];
        newIngredients.splice(index, 1);
        setIngredients(newIngredients);
    };

    // --- Instruction Handlers ---
    const handleInstructionChange = (index, value) => {
        const newInstructions = [...instructions];
        newInstructions[index] = value;
        setInstructions(newInstructions);
    };

    const addInstruction = () => {
        setInstructions([...instructions, '']);
    };

    const removeInstruction = (index) => {
        const newInstructions = [...instructions];
        newInstructions.splice(index, 1);
        setInstructions(newInstructions);
    };

    // --- Form Submission ---
    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        // Basic validation for required fields
        if (!name.trim() || !description.trim()) {
            setError('Meal name and description are required.');
            setLoading(false);
            return;
        }

        const mealData = {
            name: name.trim(),
            description: description.trim(),
            createdBy: 'user_id_placeholder', // You'll replace this with actual Firebase Auth UID later
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        // Add optional fields only if they have content
        const filteredIngredients = ingredients.filter(
            (ing) => ing.item.trim() !== ''
        );
        if (filteredIngredients.length > 0) {
            mealData.ingredients = filteredIngredients.map(ing => ({
                item: ing.item.trim(),
                quantity: ing.quantity.trim() || null, // Store as null if empty
                unit: ing.unit.trim() || null,
            }));
        }

        const filteredInstructions = instructions.filter(
            (inst) => inst.trim() !== ''
        );
        if (filteredInstructions.length > 0) {
            mealData.instructions = filteredInstructions.map(inst => inst.trim());
        }

        if (notes.trim() !== '') {
            mealData.notes = notes.trim();
        }

        try {
            await addDoc(collection(db, 'meals'), mealData);
            router.push('/meals'); // Navigate back to the meals list page
        } catch (err) {
            console.error("Error adding meal:", err);
            setError('Failed to add meal. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box w={"100vw"} mih={"100vh"} p={0} style={{ display: 'flex', flexDirection: 'column', alignItems: "center" }}>
            <ScrollArea size="sm" px="md" pt={"sm"} maw={"70vw"} h={"93vh"}>
                <Title align="center" mb="md">Add New Meal</Title>

                <form onSubmit={handleSubmit}>
                    <TextInput
                        label="Meal Name"
                        placeholder="e.g., Spaghetti Bolognese"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        required
                        mb="md"
                    />

                    <Textarea
                        label="Description"
                        placeholder="A classic Italian pasta dish with a rich meat sauce."
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        required
                        minRows={3}
                        mb="md"
                    />

                    {/* Ingredients Section */}
                    <Text fw={700} size="md" mt="lg" mb="sm">Ingredients (Optional)</Text>
                    {ingredients.map((ing, index) => (
                        <Group key={index} mb="xs" grow wrap="nowrap">
                            <TextInput
                                placeholder="Item (e.g., Ground Beef)"
                                value={ing.item}
                                onChange={(event) => handleIngredientChange(index, 'item', event.target.value)}
                                style={{ flexGrow: 3 }}
                            />
                            <TextInput
                                placeholder="Qty (e.g., 1)"
                                value={ing.quantity}
                                onChange={(event) => handleIngredientChange(index, 'quantity', event.target.value)}
                                style={{ flexGrow: 1 }}
                            />
                            <TextInput
                                placeholder="Unit (e.g., lb)"
                                value={ing.unit}
                                onChange={(event) => handleIngredientChange(index, 'unit', event.target.value)}
                                style={{ flexGrow: 1 }}
                            />
                            <ActionIcon color="red" onClick={() => removeIngredient(index)} disabled={ingredients.length === 1 && ingredients[0].item === ''}>
                                <IconTrash size={18} />
                            </ActionIcon>
                        </Group>
                    ))}
                    <Button
                        variant="light"
                        leftSection={<IconPlus size={18} />}
                        onClick={addIngredient}
                        mb="lg"
                        fullWidth
                    >
                        Add Ingredient
                    </Button>

                    {/* Instructions Section */}
                    <Text fw={700} size="md" mt="lg" mb="sm">Instructions (Optional)</Text>
                    {instructions.map((inst, index) => (
                        <Group key={index} mb="xs" grow wrap="nowrap">
                            <Textarea
                                placeholder={`Step ${index + 1}`}
                                value={inst}
                                onChange={(event) => handleInstructionChange(index, event.target.value)}
                                minRows={1}
                                autosize
                                style={{ flexGrow: 1 }}
                            />
                            <ActionIcon color="red" onClick={() => removeInstruction(index)} disabled={instructions.length === 1 && instructions[0] === ''}>
                                <IconTrash size={18} />
                            </ActionIcon>
                        </Group>
                    ))}
                    <Button
                        variant="light"
                        leftSection={<IconPlus size={18} />}
                        onClick={addInstruction}
                        mb="lg"
                        fullWidth
                    >
                        Add Instruction
                    </Button>

                    <Textarea
                        label="Additional Notes (Optional)"
                        placeholder="Any tips, serving suggestions, or dietary considerations."
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        minRows={2}
                        mb="lg"
                    />

                    {error && (
                        <Text c="red" ta="center" mb="md">
                            {error}
                        </Text>
                    )}

                    <Button type="submit" fullWidth loading={loading} mt="md">
                        Save Meal
                    </Button>
                </form>
            </ScrollArea>
            <Navbar />
        </Box>
    );
}   