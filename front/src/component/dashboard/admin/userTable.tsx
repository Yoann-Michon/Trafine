import { type ChangeEvent} from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import type { User } from '../../../types/user-types';

interface UserTableProps {
  users: User[];
  page: number;
  rowsPerPage: number;
  onChangePage: (event: unknown, newPage: number) => void;
  onChangeRowsPerPage: (event: ChangeEvent<HTMLInputElement>) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
}

const UserTable = ({
  users,
  page,
  rowsPerPage,
  onChangePage,
  onChangeRowsPerPage,
  onEditUser,
  onDeleteUser,
}: UserTableProps) => {

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nom d'utilisateur</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Rôle</TableCell>
            <TableCell>Fiabilité</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                Aucun utilisateur trouvé
              </TableCell>
            </TableRow>
          ) : (
            users
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role}
                      color={user.role === 'ADMIN' ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {(user as any).reliability ? `${(user as any).reliability}%` : 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Modifier">
                      <IconButton onClick={() => onEditUser(user)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton onClick={() => onDeleteUser(user)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
          )}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={users.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onChangePage}
        onRowsPerPageChange={onChangeRowsPerPage}
      />
    </TableContainer>
  );
};

export default UserTable;