import Link from 'next/link';
import { useRouter } from 'next/router';
import { ActionIcon, Box, useMantineTheme } from '@mantine/core';
import { IconHome, IconNotes, IconMovie, IconCamera, IconCalendar } from '@tabler/icons-react';

export default function BottomNav() {
    const router = useRouter();
    const theme = useMantineTheme();

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                width: '100%',
                background: theme.white,
                boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.1)',
                padding: '10px 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 1000,
                borderTopLeftRadius: '15px',
                borderTopRightRadius: '15px',
                height: '60px', // Ensures a consistent height
                paddingInline: '10px', // Adds some padding for spacing
            }}
        >
            {/* Left Section */}
            <Box sx={{ display: 'flex', gap: '30px' }}>
                <NavItem href="/notes" icon={<IconNotes size={24} />} active={router.pathname === '/notes'} theme={theme} />
                <NavItem href="/movies" icon={<IconMovie size={24} />} active={router.pathname === '/movies'} theme={theme} />
            </Box>

            {/* Center Raised Home Button */}
            <Box
                sx={{
                    position: 'relative',
                    bottom: '20px', // Raises the home button
                    background: theme.colors.brand[3],
                    borderRadius: '50%',
                    padding: '14px',
                    boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.2)',
                }}
            >
                <NavItem href="/" icon={<IconHome size={28} />} active={router.pathname === '/'} center theme={theme} />
            </Box>

            {/* Right Section */}
            <Box sx={{ display: 'flex', gap: '30px' }}>
                <NavItem href="/pictures" icon={<IconCamera size={24} />} active={router.pathname === '/pictures'} theme={theme} />
                <NavItem href="/dates" icon={<IconCalendar size={24} />} active={router.pathname === '/dates'} theme={theme} />
            </Box>
        </Box>
    );
}

function NavItem({ href, icon, active, center = false, theme }) {
    return (
        <Link href={href} passHref legacyBehavior>
            <ActionIcon
                size={center ? 'xl' : 'lg'}
                radius="xl"
                sx={{
                    color: active ? theme.colors.brand[5] : theme.colors.gray[6],
                    transition: 'all 0.2s ease',
                    '&:hover': { color: theme.colors.brand[5] },
                }}
            >
                {icon}
            </ActionIcon>
        </Link>
    );
}