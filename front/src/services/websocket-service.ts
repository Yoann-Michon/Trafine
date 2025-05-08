import { io } from 'socket.io-client'

// URL de base pour les connexions WebSocket
const VITE_INCIDENT_WS = import.meta.env.VITE_INCIDENT_WS;
const VITE_NAVIGATION_WS = import.meta.env.VITE_NAVIGATION_WS;

/**
 * Établit les connexions WebSocket avec les différents services
 */
export const setupWebSockets = () => {
  console.log("Configuration des WebSockets:");
  console.log("- URL Navigation:", VITE_NAVIGATION_WS);
  console.log("- URL Incidents:", VITE_INCIDENT_WS);
  
  if (!VITE_NAVIGATION_WS || !VITE_INCIDENT_WS) {
    console.error("Les URLs WebSocket ne sont pas correctement configurées dans les variables d'environnement");
    return { navigationSocket: null, incidentSocket: null };
  }
  
  // Options communes pour toutes les connexions
  const options = {
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  }

  try {
    // Connexion au service de navigation
    console.log("Tentative de connexion au service de navigation...");
    const navigationSocket = io(`${VITE_NAVIGATION_WS}`, options);
    
    // Connexion au service d'incidents
    console.log("Tentative de connexion au service d'incidents...");
    const incidentSocket = io(`${VITE_INCIDENT_WS}`, options);

    // Configuration des gestionnaires d'événements communs
    const sockets = [navigationSocket, incidentSocket];
    
    sockets.forEach(socket => {
      // Gestionnaire de connexion
      socket.on('connect', () => {
        console.log(`Connecté à ${socket.io.opts.hostname ?? 'inconnu'}:${socket.io.opts.port ?? 'inconnu'}`);
        console.log(`ID Socket: ${socket.id}`);
      });
      
      // Gestionnaire de déconnexion
      socket.on('disconnect', (reason) => {
        console.log(`Déconnecté de ${socket.io.opts.hostname ?? 'inconnu'}:${socket.io.opts.port ?? 'inconnu'}`);
        console.log(`Raison: ${reason}`);
        
        // Reconnexion automatique en cas de déconnexion serveur
        if (reason === 'io server disconnect') {
          console.log('Déconnexion initiée par le serveur. Tentative de reconnexion...');
          socket.connect();
        }
      });
      
      // Gestionnaire d'erreur
      socket.on('error', (error) => {
        console.error(`Erreur socket (${socket.io.opts.hostname ?? 'inconnu'}:${socket.io.opts.port ?? 'inconnu'}):`, error);
      });
      
      // Gestionnaire d'erreur de connexion
      socket.on('connect_error', (error) => {
        console.error(`Erreur de connexion (${socket.io.opts.hostname ?? 'inconnu'}:${socket.io.opts.port ?? 'inconnu'}):`, error);
        console.error(`Détails de l'erreur:`, error.message);
      });
    });

    console.log("Configuration WebSocket terminée avec succès");
    return {
      navigationSocket,
      incidentSocket
    };
  } catch (error) {
    console.error("Erreur critique lors de la configuration WebSocket:", error);
    return { navigationSocket: null, incidentSocket: null };
  }
}

// Le reste de votre code existant...