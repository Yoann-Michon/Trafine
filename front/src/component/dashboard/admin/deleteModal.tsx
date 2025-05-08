import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';
import type { User } from '../../../types/user-types';
import type { Dispatch, SetStateAction } from 'react';
import { deleteUser } from '../../../services/user-service';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  currentUser: User | null;
  users: User[];
  setUsers: Dispatch<SetStateAction<User[]>>;
  setNotification: Dispatch<SetStateAction<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
  }>>;
}

const DeleteConfirmDialog= ({
  open,
  onClose,
  currentUser,
  users,
  setUsers,
  setNotification
}:DeleteConfirmDialogProps) => {
  const handleDeleteUser = async () => {
    if (!currentUser) return;
    
    try {
      await deleteUser(currentUser.id);
      setUsers(users.filter(u => u.id !== currentUser.id));
      setNotification({
        open: true,
        message: 'Utilisateur supprimé avec succès',
        severity: 'success'
      });
      onClose();
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      setNotification({
        open: true,
        message: 'Erreur lors de la suppression de l\'utilisateur',
        severity: 'error'
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirmer la suppression</DialogTitle>
      <DialogContent>
        <Typography>
          Êtes-vous sûr de vouloir supprimer l'utilisateur {currentUser?.username} ?
          Cette action est irréversible.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={handleDeleteUser} variant="contained" color="error">
          Supprimer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;