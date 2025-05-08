import React, { createContext, useContext, useEffect, useState, type ReactNode} from 'react';
import { setupWebSockets } from '../services/websocket-service';
import { useAuth } from './auth-context';
import type { Socket } from 'socket.io-client';

interface WebSocketContextType {
  navigationSocket: Socket | null;
  incidentSocket: Socket | null;
  connected: boolean;
  reconnect: () => void;
}

export const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [navigationSocket, setNavigationSocket] = useState<Socket | null>(null);
  const [incidentSocket, setIncidentSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  
  const initializeSockets = () => {
    // Setup WebSockets when user is authenticated
    if (user) {
      const { navigationSocket: navSocket, incidentSocket: incSocket } = setupWebSockets();
      
      setNavigationSocket(navSocket);
      setIncidentSocket(incSocket);
      
      const checkConnection = () => {
        const navConnected = navSocket?.connected || false;
        const incConnected = incSocket?.connected || false;
        setConnected(navConnected && incConnected);
      };
      
      // Check initial connection status
      checkConnection();
      
      // Setup connection status listeners
      navSocket?.on('connect', checkConnection);
      navSocket?.on('disconnect', checkConnection);
      incSocket?.on('connect', checkConnection);
      incSocket?.on('disconnect', checkConnection);
      
      // Clean up listeners
      return () => {
        navSocket?.off('connect', checkConnection);
        navSocket?.off('disconnect', checkConnection);
        incSocket?.off('connect', checkConnection);
        incSocket?.off('disconnect', checkConnection);
        
        // Close socket connections
        navSocket?.disconnect();
        incSocket?.disconnect();
      };
    }
    
    // No user, so no sockets
    setNavigationSocket(null);
    setIncidentSocket(null);
    setConnected(false);
    return undefined;
  };
  
  // Initialize sockets when user changes
  useEffect(() => {
    const cleanup = initializeSockets();
    return cleanup;
  }, [user]);
  
  // Method to force reconnection
  const reconnect = () => {
    navigationSocket?.disconnect().connect();
    incidentSocket?.disconnect().connect();
  };
  
  const value = {
    navigationSocket,
    incidentSocket,
    connected,
    reconnect
  };
  
  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};