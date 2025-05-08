import { Box, TextField, FormControl, InputLabel, Select, MenuItem, Button, type SelectChangeEvent } from '@mui/material';
import { Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';
import type { ChangeEvent } from 'react';

interface UserToolbarProps {
  search: string;
  filter: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onCreateUser: () => void;
}

const UserToolbar = ({
  search,
  filter,
  onSearchChange,
  onFilterChange,
  onCreateUser
}: UserToolbarProps) => {
  
  const handleFilterChange = (event: SelectChangeEvent) => {
    onFilterChange(event.target.value);
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  return (
    <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
      <Box display="flex" alignItems="center">
        <TextField
          placeholder="Rechercher un utilisateur..."
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
          }}
          sx={{ mr: 2 }}
        />
        
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filtre de rôle</InputLabel>
          <Select
            value={filter}
            onChange={handleFilterChange}
            label="Filtre de rôle"
          >
            <MenuItem value="all">Tous les rôles</MenuItem>
            <MenuItem value="admin">Administrateurs</MenuItem>
            <MenuItem value="user">Utilisateurs</MenuItem>
            <MenuItem value="moderator">Modérateurs</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={onCreateUser}
      >
        Nouvel utilisateur
      </Button>
    </Box>
  );
};

export default UserToolbar;