import { Paper, Typography } from "@mui/material";


interface DashboardHeaderProps {
  user?: {
    username?: string;
  };
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user }) => {
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Bonjour, {user?.username}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Bienvenue sur votre tableau de bord. Vous pouvez consulter les incidents à proximité, vos itinéraires et vos lieux enregistrés.
      </Typography>
    </Paper>
  );
};

export default DashboardHeader;
