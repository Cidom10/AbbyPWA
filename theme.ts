import { createTheme } from '@mantine/core';

const theme = createTheme({
    colors: {
        brand: [
            "#f0f9fa", // 0 - Lightest
            "#d9f1f4", // 1 - Very Light Pastel Blue
            "#bfe7ea", // 2 - Soft Pastel Blue
            "#A5DDE0", // 3 - Slightly Lighter Pastel Blue (Updated)
            "#8CCDD0", // 4 - Soft Blue-Green Mix
            "#71BCC0", // 5 - Deeper Pastel
            "#5AAEB0", // 6 - Balanced Shade
            "#449E9F", // 7 - Stronger Accent
            "#2D8E8E", // 8 - Deep Blue-Green
            "#157E7E"  // 9 - Darkest Accent
        ],
    },
    primaryColor: 'brand',
    defaultRadius: 'md',
});

export default theme;