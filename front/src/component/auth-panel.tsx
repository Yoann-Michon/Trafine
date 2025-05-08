import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import { useAuth } from "../contexts/auth-context";
import { login, register } from "../services/auth-service";

// Material UI imports
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Checkbox,
  FormControlLabel,
  Link,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  useTheme,
  alpha
} from "@mui/material";

const loginSchema = Joi.object({
  email: Joi.string().required().email({ tlds: { allow: false } }).messages({
    'string.empty': 'L\'adresse e-mail est requise',
    'string.email': 'Veuillez entrer une adresse e-mail valide'
  }),
  password: Joi.string().required().min(6).messages({
    'string.empty': 'Le mot de passe est requis',
    'string.min': 'Le mot de passe doit contenir au moins {#limit} caractères'
  })
});

const registerSchema = Joi.object({
  username: Joi.string().required().min(3).messages({
    'string.empty': 'Le nom d\'utilisateur est requis',
    'string.min': 'Le nom d\'utilisateur doit contenir au moins {#limit} caractères'
  }),
  email: Joi.string().required().email({ tlds: { allow: false } }).messages({
    'string.empty': 'L\'adresse e-mail est requise',
    'string.email': 'Veuillez entrer une adresse e-mail valide'
  }),
  password: Joi.string().required().min(6).messages({
    'string.empty': 'Le mot de passe est requis',
    'string.min': 'Le mot de passe doit contenir au moins {#limit} caractères'
  }),
});

type LoginFormValues = {
  email: string;
  password: string;
};

type RegisterFormValues = {
  username: string;
  email: string;
  password: string;
};

const AuthPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login: setUserLoggedIn } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const {
    control: loginControl,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors }
  } = useForm<LoginFormValues>({
    resolver: joiResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const {
    control: registerControl,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors }
  } = useForm<RegisterFormValues>({
    resolver: joiResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    }
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userData = await login(data);
      setUserLoggedIn(data.email, data.password);
      
      navigate(userData.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError('Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await register(data);
      
      navigate('/auth');
    } catch (err) {
      console.error('Erreur d\'inscription:', err);
      setError('Une erreur s\'est produite lors de l\'inscription. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (_event: React.MouseEvent<HTMLElement>, newTab: string | null) => {
    if (newTab !== null) {
      setActiveTab(newTab);
    }
  };

  return (
    <Box sx={{ color: 'common.white' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <ToggleButtonGroup
          value={activeTab}
          exclusive
          onChange={handleTabChange}
          aria-label="auth tabs"
          sx={{
            bgcolor: alpha(theme.palette.common.white, 0.1),
            padding: 0.5,
            borderRadius: 2,
            '& .MuiToggleButton-root': {
              color: alpha(theme.palette.common.white, 0.8),
              border: 'none',
              borderRadius: 1.5,
              fontWeight: 500,
              fontSize: '0.875rem',
              px: 2,
              py: 1,
              '&.Mui-selected': {
                color: 'common.white',
                bgcolor: 'primary.main',
                boxShadow: theme.shadows[1],
                '&:hover': {
                  bgcolor: 'primary.dark',
                }
              },
              '&:hover': {
                color: 'common.white',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              }
            }
          }}
        >
          <ToggleButton value="login">Connexion</ToggleButton>
          <ToggleButton value="register">Inscription</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            bgcolor: alpha(theme.palette.error.main, 0.1),
            color: 'common.white',
            borderColor: alpha(theme.palette.error.main, 0.3),
            '& .MuiAlert-icon': {
              color: theme.palette.error.main
            }
          }}
        >
          {error}
        </Alert>
      )}

      {activeTab === "login" && (
        <Box component="form" onSubmit={handleLoginSubmit(onLoginSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography 
              component="label" 
              htmlFor="login-email" 
              variant="body2" 
              fontWeight="medium" 
              sx={{ color: alpha(theme.palette.common.white, 0.9), mb: 0.5, display: 'block' }}
            >
              Adresse e-mail
            </Typography>
            <Controller
              name="email"
              control={loginControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Votre email"
                  fullWidth
                  error={!!loginErrors.email}
                  helperText={loginErrors.email?.message}
                  FormHelperTextProps={{ sx: { color: theme.palette.error.light } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'common.white',
                      backgroundColor: alpha(theme.palette.common.white, 0.1),
                      '& fieldset': {
                        borderColor: alpha(theme.palette.common.white, 0.2),
                      },
                      '&:hover fieldset': {
                        borderColor: alpha(theme.palette.common.white, 0.3),
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: alpha(theme.palette.common.white, 0.5),
                      opacity: 1,
                    },
                  }}
                  variant="outlined"
                />
              )}
            />
          </Box>

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography
                component="label"
                htmlFor="login-password"
                variant="body2"
                fontWeight="medium"
                sx={{ color: alpha(theme.palette.common.white, 0.9) }}
              >
                Mot de passe
              </Typography>
              <Link
                href="#"
                underline="hover"
                sx={{ 
                  fontSize: '0.75rem', 
                  color: 'primary.light',
                  '&:hover': {
                    color: 'primary.main',
                  }
                }}
              >
                Mot de passe oublié ?
              </Link>
            </Box>
            <Controller
              name="password"
              control={loginControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Votre mot de passe"
                  fullWidth
                  error={!!loginErrors.password}
                  helperText={loginErrors.password?.message}
                  FormHelperTextProps={{ sx: { color: theme.palette.error.light } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'common.white',
                      backgroundColor: alpha(theme.palette.common.white, 0.1),
                      '& fieldset': {
                        borderColor: alpha(theme.palette.common.white, 0.2),
                      },
                      '&:hover fieldset': {
                        borderColor: alpha(theme.palette.common.white, 0.3),
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: alpha(theme.palette.common.white, 0.5),
                      opacity: 1,
                    },
                  }}
                  variant="outlined"
                />
              )}
            />
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                sx={{
                  color: alpha(theme.palette.common.white, 0.7),
                  '&.Mui-checked': {
                    color: 'primary.main',
                  },
                }}
              />
            }
            label={
              <Typography
                variant="body2"
                sx={{ color: alpha(theme.palette.common.white, 0.8) }}
              >
                Se souvenir de moi
              </Typography>
            }
          />

          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            fullWidth
            sx={{
              py: 1.5,
              mt: 1,
              background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
              '&:hover': {
                boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Connexion...
              </Box>
            ) : (
              "Se connecter"
            )}
          </Button>
        </Box>
      )}

      {activeTab === "register" && (
        <Box component="form" onSubmit={handleRegisterSubmit(onRegisterSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography
              component="label"
              htmlFor="register-username"
              variant="body2"
              fontWeight="medium"
              sx={{ color: alpha(theme.palette.common.white, 0.9), mb: 0.5, display: 'block' }}
            >
              Nom d'utilisateur
            </Typography>
            <Controller
              name="username"
              control={registerControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="register-username"
                  type="text"
                  placeholder="Choisissez un nom d'utilisateur"
                  fullWidth
                  error={!!registerErrors.username}
                  helperText={registerErrors.username?.message}
                  FormHelperTextProps={{ sx: { color: theme.palette.error.light } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'common.white',
                      backgroundColor: alpha(theme.palette.common.white, 0.1),
                      '& fieldset': {
                        borderColor: alpha(theme.palette.common.white, 0.2),
                      },
                      '&:hover fieldset': {
                        borderColor: alpha(theme.palette.common.white, 0.3),
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: alpha(theme.palette.common.white, 0.5),
                      opacity: 1,
                    },
                  }}
                  variant="outlined"
                />
              )}
            />
          </Box>

          <Box>
            <Typography
              component="label"
              htmlFor="register-email"
              variant="body2"
              fontWeight="medium"
              sx={{ color: alpha(theme.palette.common.white, 0.9), mb: 0.5, display: 'block' }}
            >
              Adresse e-mail
            </Typography>
            <Controller
              name="email"
              control={registerControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Votre adresse email"
                  fullWidth
                  error={!!registerErrors.email}
                  helperText={registerErrors.email?.message}
                  FormHelperTextProps={{ sx: { color: theme.palette.error.light } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'common.white',
                      backgroundColor: alpha(theme.palette.common.white, 0.1),
                      '& fieldset': {
                        borderColor: alpha(theme.palette.common.white, 0.2),
                      },
                      '&:hover fieldset': {
                        borderColor: alpha(theme.palette.common.white, 0.3),
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: alpha(theme.palette.common.white, 0.5),
                      opacity: 1,
                    },
                  }}
                  variant="outlined"
                />
              )}
            />
          </Box>

          <Box>
            <Typography
              component="label"
              htmlFor="register-password"
              variant="body2"
              fontWeight="medium"
              sx={{ color: alpha(theme.palette.common.white, 0.9), mb: 0.5, display: 'block' }}
            >
              Mot de passe
            </Typography>
            <Controller
              name="password"
              control={registerControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Créez un mot de passe sécurisé"
                  fullWidth
                  error={!!registerErrors.password}
                  helperText={registerErrors.password?.message}
                  FormHelperTextProps={{ sx: { color: theme.palette.error.light } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'common.white',
                      backgroundColor: alpha(theme.palette.common.white, 0.1),
                      '& fieldset': {
                        borderColor: alpha(theme.palette.common.white, 0.2),
                      },
                      '&:hover fieldset': {
                        borderColor: alpha(theme.palette.common.white, 0.3),
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: alpha(theme.palette.common.white, 0.5),
                      opacity: 1,
                    },
                  }}
                  variant="outlined"
                />
              )}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            fullWidth
            sx={{
              py: 1.5,
              mt: 1,
              background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
              '&:hover': {
                boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Inscription...
              </Box>
            ) : (
              "S'inscrire"
            )}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default AuthPanel;