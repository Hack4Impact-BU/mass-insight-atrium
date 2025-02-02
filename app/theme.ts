'use client';
import { createTheme } from '@mui/material/styles';

// nextjs font optimization with material ui
const theme = createTheme({
    typography: {
        fontFamily: 'var(--font-roboto)',
    },
    cssVariables: true,
})

export default theme;