import { useState, useEffect, type ChangeEvent } from 'react';
import { Box, Typography, CircularProgress, Snackbar, Alert } from '@mui/material';
import { getUsers } from '../../services/user-service';
import type { User } from '../../types/user-types';
import DeleteConfirmDialog from '../../component/dashboard/admin/deleteModal';
import UserFormDialog from '../../component/dashboard/admin/userFormModal';
import UserTable from '../../component/dashboard/admin/userTable';
import UserToolbar from '../../component/dashboard/admin/userToolbar';



const UsersManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  
  const [userDialogOpen, setUserDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
  }>({ open: false, message: '', severity: 'info' });

  const [formData, setFormData] = useState<{
    username: string;
    email: string;
    role: string;
    password:string;
    
  }>({
    username: '',
    email: '',
    role: 'USER',
    password: ''
  });

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        setNotification({
          open: true,
          message: 'Erreur lors du chargement des utilisateurs',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    if (filter !== 'all' && user.role.toLowerCase() !== filter.toLowerCase()) return false;
    if (search && !user.username.toLowerCase().includes(search.toLowerCase()) && 
        !user.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const openCreateDialog = () => {
    setFormData({
      username: '',
      email: '',
      role: 'USER',
      password: ''
    });
    setIsEditing(false);
    setUserDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setCurrentUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      password:user.password
    });
    setIsEditing(true);
    setUserDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setCurrentUser(user);
    setDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setUserDialogOpen(false);
    setDeleteDialogOpen(false);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Gestion des utilisateurs</Typography>
      
      <UserToolbar 
        search={search}
        filter={filter}
        onSearchChange={setSearch}
        onFilterChange={setFilter}
        onCreateUser={openCreateDialog}
      />
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <UserTable
          users={filteredUsers}
          page={page}
          rowsPerPage={rowsPerPage}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
          onEditUser={openEditDialog}
          onDeleteUser={openDeleteDialog}
        />
      )}
      
      <UserFormDialog
        open={userDialogOpen}
        onClose={handleCloseDialog}
        formData={formData}
        setFormData={setFormData}
        isEditing={isEditing}
        currentUser={currentUser}
        users={users}
        setUsers={setUsers}
        setNotification={setNotification}
      />
      
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={handleCloseDialog}
        currentUser={currentUser}
        users={users}
        setUsers={setUsers}
        setNotification={setNotification}
      />
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersManagement;