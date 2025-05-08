import React, { useState, useEffect, useRef } from 'react';
import {
  Paper,
  InputBase,
  IconButton,
  CircularProgress,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Popper,
  ClickAwayListener,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material';
import { searchAddress } from '../../services/navigation-service';

interface SearchResult {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  address: string;
  name?: string;
  poi?: {
    categories: string[];
    name: string;
  };
}

interface SearchBoxProps {
  onSearch: (result: SearchResult) => void;
  placeholder?: string;
}

const SearchBox: React.FC<SearchBoxProps> = ({ 
  onSearch, 
  placeholder = "Rechercher une adresse ou un lieu" 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    // Effectuer une recherche après un délai de saisie
    const timeoutId = setTimeout(() => {
      if (query.length >= 3) {
        performSearch();
      } else {
        setResults([]);
        setOpen(false);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [query]);
  
  const performSearch = async () => {
    if (query.length < 3) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await searchAddress(query);
      
      if (response?.results) {
        // Transformer les résultats dans notre format
        const formattedResults = response.results.map((item: any) => ({
          id: item.id,
          position: {
            lat: item.position.lat,
            lng: item.position.lon
          },
          address: item.address.freeformAddress,
          name: item.poi?.name,
          poi: item.poi
        }));
        
        setResults(formattedResults);
        setOpen(formattedResults.length > 0);
      } else {
        setResults([]);
        setOpen(false);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setError('Erreur lors de la recherche. Veuillez réessayer.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (result: SearchResult) => {
    setQuery(result.name ?? result.address);
    setOpen(false);
    onSearch(result);
  };
  
  const handleClear = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && results.length > 0) {
      handleSearch(results[0]);
    }
  };
  
  const renderResultItem = (result: SearchResult) => {
    const mainText = result.name ?? result.address;
    const secondaryText = result.name ? result.address : '';
    const category = result.poi?.categories?.length && result.poi.categories.length > 0 ? result.poi.categories![0] : '';
    
    return (
      <ListItem 
        component="button"
        onClick={() => handleSearch(result)}
        sx={{ 
          py: 1.5, 
          borderRadius: 1,
          '&:hover': { bgcolor: 'action.hover' }
        }}
      >
        <ListItemIcon>
          <LocationOnIcon color="primary" />
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography variant="body1" noWrap>
              {mainText}
            </Typography>
          }
          secondary={
            <>
              {secondaryText && (
                <Typography variant="body2" color="text.secondary" noWrap>
                  {secondaryText}
                </Typography>
              )}
              {category && (
                <Typography variant="caption" color="primary" component="span" sx={{ ml: secondaryText ? 1 : 0 }}>
                  {category}
                </Typography>
              )}
            </>
          }
        />
      </ListItem>
    );
  };

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box ref={searchRef} sx={{ position: 'relative', width: '100%', maxWidth: 600, mx: 'auto' }}>
        <Paper
          elevation={3}
          sx={{
            p: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: 2,
            boxShadow: open ? 4 : 2
          }}
        >
          <IconButton sx={{ p: '10px' }} aria-label="search">
            <SearchIcon />
          </IconButton>
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder={placeholder}
            inputProps={{ 'aria-label': 'rechercher un lieu' }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            inputRef={inputRef}
          />
          {loading && (
            <CircularProgress size={24} sx={{ mx: 1 }} />
          )}
          {query && (
            <IconButton sx={{ p: '10px' }} aria-label="clear" onClick={handleClear}>
              <CloseIcon />
            </IconButton>
          )}
        </Paper>

        <Popper
          open={open}
          anchorEl={searchRef.current}
          placement="bottom-start"
          style={{ width: searchRef.current?.clientWidth, zIndex: 1300 }}
        >
          <Paper 
            elevation={4}
            sx={{ 
              mt: 1, 
              maxHeight: 350, 
              overflow: 'auto',
              borderRadius: 2,
              bgcolor: 'background.paper'
            }}
          >
            {error && (
              <Typography color="error" variant="body2" sx={{ p: 2 }}>
                {error}
              </Typography>
            )}
            
            {results.length === 0 && !error && !loading && (
              <Typography variant="body2" sx={{ p: 2, color: 'text.secondary' }}>
                Aucun résultat trouvé
              </Typography>
            )}
            
            <List sx={{ py: 0 }}>
              {results.map((result, index) => (
                <React.Fragment key={result.id}>
                  {index > 0 && <Divider component="li" />}
                  {renderResultItem(result)}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export default SearchBox;