import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  TextField,
  Typography,
  CircularProgress,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { type ChangeEvent, type Dispatch, type SetStateAction } from 'react';
import type { User } from '../../types/user-types';

interface ProfileInfoProps {
  userData: User;
  editMode: boolean;
  setEditMode: Dispatch<SetStateAction<boolean>>;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSaveProfile: () => Promise<void>;
  loading: boolean;
}

const ProfileInfo = ({
  userData,
  editMode,
  setEditMode,
  handleInputChange,
  handleSaveProfile,
  loading
}: ProfileInfoProps) => {

  const handleCancelEdit = () => {
    setEditMode(false);
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Informations personnelles
          </Typography>
          
          {editMode ? (
            <Box>
              <IconButton 
                color="primary" 
                onClick={handleSaveProfile}
                disabled={loading}
                title="Enregistrer les modifications"
              >
                {loading ? <CircularProgress size={24} /> : <SaveIcon />}
              </IconButton>
              <IconButton 
                color="error" 
                onClick={handleCancelEdit}
                title="Annuler les modifications"
              >
                <CancelIcon />
              </IconButton>
            </Box>
          ) : (
            <Tooltip title="Modifier les informations">
              <Button
                startIcon={<EditIcon />}
                variant="outlined"
                onClick={() => setEditMode(true)}
              >
                Modifier
              </Button>
            </Tooltip>
          )}
        </Box>
        
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={3}>
          <Box flex={1}>
            <TextField
              fullWidth
              label="Nom d'utilisateur"
              name="username"
              value={userData.username}
              onChange={handleInputChange}
              disabled={!editMode}
              margin="normal"
              variant={editMode ? "outlined" : "filled"}
              InputProps={{
                readOnly: !editMode,
              }}
              required
              error={editMode && !userData.username}
              helperText={editMode && !userData.username ? "Le nom d'utilisateur est requis" : ""}
            />
          </Box>
          
          <Box flex={1}>
            <TextField
              fullWidth
              label="Adresse e-mail"
              name="email"
              type="email"
              value={userData.email}
              onChange={handleInputChange}
              disabled={!editMode}
              margin="normal"
              variant={editMode ? "outlined" : "filled"}
              InputProps={{
                readOnly: !editMode,
              }}
              required
              error={editMode && (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email))}
              helperText={
                editMode && !userData.email 
                  ? "L'adresse e-mail est requise" 
                  : editMode && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)
                  ? "Format d'e-mail invalide"
                  : ""
              }
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProfileInfo;