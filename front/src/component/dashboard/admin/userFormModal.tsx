import { type ChangeEvent, type Dispatch, type SetStateAction } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
} from '@mui/material';
import type { User } from '../../../types/user-types';
import { createUser, updateUser } from '../../../services/user-service';

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  formData: {
    username: string;
    email: string;
    role: string;
    password: string;
  };
  setFormData: Dispatch<SetStateAction<{
    username: string;
    email: string;
    role: string;
    password: string;
  }>>;
  isEditing: boolean;
  currentUser: User | null;
  users: User[];
  setUsers: Dispatch<SetStateAction<User[]>>;
  setNotification: Dispatch<SetStateAction<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
  }>>;
}

const UserFormDialog = ({
  open,
  onClose,
  formData,
  setFormData,
  isEditing,
  currentUser,
  users,
  setUsers,
  setNotification
}: UserFormDialogProps) => {

  const handleTextInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name as string]: value
    });
  };

  const handleSaveUser = async () => {
    try {
      const userData = {
        ...formData,
        role: formData.role.toUpperCase() as 'ADMIN' | 'USER'
      };

      if (isEditing && currentUser) {
        console.log(currentUser)
        console.log(userData)
        await updateUser(currentUser.id, userData);
        setUsers(users.map(u => u.id === currentUser.id ? { ...u, ...userData } : u));
        setNotification({
          open: true,
          message: 'Utilisateur mis à jour avec succès',
          severity: 'success'
        });
      } else {
        const newUser = await createUser(userData);
        setUsers([...users, newUser]);
        setNotification({
          open: true,
          message: 'Utilisateur créé avec succès',
          severity: 'success'
        });
      }
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'utilisateur:', error);
      setNotification({
        open: true,
        message: 'Erreur lors de l\'enregistrement de l\'utilisateur',
        severity: 'error'
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}</DialogTitle>
      <DialogContent>
        <Box mt={2} display="flex" flexDirection="column" gap={3}>
          <TextField
            label="Nom d'utilisateur"
            name="username"
            value={formData.username}
            onChange={handleTextInputChange}
            fullWidth
            required
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleTextInputChange}
            fullWidth
            required
          />
          {!isEditing && (
            <TextField
              label="Mot de passe"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleTextInputChange}
              fullWidth
              required
            />
          )}
          <FormControl fullWidth>
            <InputLabel>Rôle</InputLabel>
            <Select
              name="role"
              value={formData.role}
              onChange={handleSelectChange}
              label="Rôle"
            >
              <MenuItem value="USER">Utilisateur</MenuItem>
              <MenuItem value="MODERATOR">Modérateur</MenuItem>
              <MenuItem value="ADMIN">Administrateur</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={handleSaveUser} variant="contained" color="primary">
          {isEditing ? 'Enregistrer' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserFormDialog;