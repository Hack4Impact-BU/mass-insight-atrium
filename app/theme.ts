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
            contrastText: '#fff',
            dark: '#022C4D',
            light: '#F0F9FF',
        },
    }
}));

export default theme;