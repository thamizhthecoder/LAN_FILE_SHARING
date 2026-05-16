import React, { createContext, useContext, useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getWebSocketUrl } from '../services/api';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [fileUpdates, setFileUpdates] = useState({});
  const [fileStatuses, setFileStatuses] = useState({});
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const stompClient = new Client({
      webSocketFactory: () => new SockJS(getWebSocketUrl()),
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        console.log('Connected to WebSocket');
        
        stompClient.subscribe('/topic/files', (message) => {
          const file = JSON.parse(message.body);
          setFileUpdates(prev => ({ ...prev, [file.id]: file }));
        });

        stompClient.subscribe('/topic/file-status', (message) => {
          const statusUpdate = JSON.parse(message.body);
          setFileStatuses(prev => ({ ...prev, [statusUpdate.id]: statusUpdate.status }));
          
          if (statusUpdate.downloadedBy) {
            setFileUpdates(prev => {
              const file = prev[statusUpdate.id];
              if (file) {
                const downloadedBy = file.downloadedBy || [];
                if (!downloadedBy.includes(statusUpdate.downloadedBy)) {
                  return { 
                    ...prev, 
                    [statusUpdate.id]: { 
                      ...file, 
                      downloadedBy: [...downloadedBy, statusUpdate.downloadedBy] 
                    } 
                  };
                }
              }
              return prev;
            });
          }
        });
      },
      onDisconnect: () => {
        setConnected(false);
        console.log('Disconnected from WebSocket');
      }
    });

    stompClient.activate();
    setClient(stompClient);

    return () => {
      stompClient.deactivate();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ client, connected, fileUpdates, fileStatuses }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
