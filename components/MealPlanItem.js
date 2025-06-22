import { Card, Text, Group, ActionIcon, Flex, Button } from '@mantine/core';
import { IconTrash, IconArrowsMove, IconRefresh, IconLock, IconLockOpen, IconReplace } from '@tabler/icons-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import theme from '../theme'; // Import your theme

export function MealPlanItem({ id, meal, onRemove, onRegenerate, onToggleLock, onSelectSpecific, isDragging }) {
    // id here is the unique ID for the DND context (e.g., "Monday-dinner")
    // meal is the meal object from your weeklyPlan state for this slot
    // onRemove, onRegenerate, onToggleLock, onSelectSpecific are functions passed from the parent

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: id, disabled: meal?.isLocked }); // Disable drag if locked

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: meal?.isLocked ? 'not-allowed' : 'grab', // Change cursor for locked items
        opacity: isDragging ? 0.5 : 1, // Visual feedback for dragging
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            shadow="sm"
            padding="md"
            radius="md"
            withBorder
            mih={120} // Minimum height for consistent layout
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderColor: meal?.isLocked ? theme.colors.brand[8] : theme.colors.brand[5], // Highlight locked meals
                borderWidth: meal?.isLocked ? 2 : 1,
            }}
        >
            <Group justify="space-between" mb="xs" wrap="nowrap">
                <Text fw={700} size="lg" style={{ flexShrink: 0 }}>
                    {meal.day}
                </Text>
                <Flex gap="xs" style={{ flexWrap: 'nowrap' }}> {/* Added Flex for action buttons */}
                    {/* Toggle Lock Button */}
                    <ActionIcon
                        variant="transparent"
                        color="gray"
                        onClick={() => onToggleLock(meal.day)}
                        title={meal?.isLocked ? "Unlock Meal" : "Lock Meal"}
                    >
                        {meal?.isLocked ? <IconLock size={18} /> : <IconLockOpen size={18} />}
                    </ActionIcon>

                    {/* Drag Handle */}
                    {!meal?.isLocked && (
                        <ActionIcon
                            variant="transparent"
                            color="gray"
                            {...listeners} // Listeners for drag
                            {...attributes} // Attributes for drag
                            title="Drag to reorder"
                        >
                            <IconArrowsMove size={18} />
                        </ActionIcon>
                    )}

                    {/* Remove Button */}
                    <ActionIcon
                        variant="transparent"
                        color="red"
                        onClick={() => onRemove(meal.day)}
                        title="Remove meal"
                    >
                        <IconTrash size={18} />
                    </ActionIcon>
                </Flex>
            </Group>

            {meal.mealName ? (
                <Text fw={500} size="md" lineClamp={2} style={{ flexGrow: 1 }}>
                    {meal.mealName}
                </Text>
            ) : (
                <Text c="dimmed" size="sm" style={{ flexGrow: 1 }}>
                    No meal selected
                </Text>
            )}

            <Group justify="flex-end" mt="sm">
                {!meal.isLocked && meal.mealName && (
                    <Button
                        size="xs"
                        variant="outline"
                        color={theme.colors.brand[6]}
                        leftSection={<IconRefresh size={14} />}
                        onClick={() => onRegenerate(meal.day)}
                    >
                        Re-generate
                    </Button>
                )}
                {!meal.isLocked && (
                    <Button
                        size="xs"
                        variant="outline"
                        color={theme.colors.brand[6]}
                        leftSection={<IconReplace size={14} />}
                        onClick={() => onSelectSpecific(meal.day)}
                    >
                        Pick Meal
                    </Button>
                )}
            </Group>
        </Card>
    );
}