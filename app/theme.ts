'use client';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// nextjs font optimization with material ui
const theme = responsiveFontSizes(createTheme({
    typography: {
        // This is currently not controlling the app font. Font is being set in layout.tsx
        fontFamily: 'Inter, sans-serif',
    },
    cssVariables: true,
    palette: {
        primary: {
            main: '#006EB6',
            contrastText: '#FFFFFF',
            dark: '#D9D9D9',
            light: '#F0F9FF',
        },
        secondary: {
            main: '#7A6BC4',
            contrastText: '#FFED00',
            dark: '#05A500',
            light: '#F36001',
        }
    }
}));

export default theme;