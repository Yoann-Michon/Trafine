// ui/AdvantageCard.jsx
import { Card, CardContent, CardMedia, Typography } from '@mui/material';

import type { ReactNode } from 'react';

interface AdvantageCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  bgColor: string;
}

const AdvantageCard = ({ icon, title, description, bgColor }: AdvantageCardProps) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        boxShadow: 3,
      }}
    >
      <CardMedia
        component="div"
        sx={{
          height: 160,
          bgcolor: bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </CardMedia>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h5" component="h3" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default AdvantageCard;