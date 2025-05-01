import Image from 'next/image';
import { Box } from '@mui/material';

export const DashboardLogo = () => {
  return (
    <Box sx={{ 
      mb: 4, 
      width: '100%',
      display: 'flex',
      justifyContent: 'center'
    }}>
      <Box sx={{ 
        width: '300px', 
        height: '80px', 
        position: 'relative' 
      }}>
        <Image
          src="/mass-insight-logo.png"
          alt="Mass Insight Education & Research"
          fill
          style={{
            objectFit: 'contain',
            objectPosition: 'center'
          }}
          priority
        />
      </Box>
    </Box>
  );
}; 