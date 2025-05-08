import { Box, CircularProgress } from '@mui/material';


const Loader = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh" width="100%">
      <CircularProgress />
    </Box>
  );
};

export default Loader;
