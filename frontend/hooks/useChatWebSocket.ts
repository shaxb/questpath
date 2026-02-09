'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface ChatMessage {
  type: 'message' | 'system' | 'error' | 'history' | 'pong';
  id?: number;
  user_id?: number;
  user_display_name?: string;
  user_is_premium?: boolean;
  message?: string;
  created_at?: string;
  messages?: ChatMessage[];
  online_count?: number;
}


interface UseChatWebSocketReturn {
  messages: ChatMessage[];
  isConnected: boolean;
  onlineCount: number;
  sendMessage: (content: string) => void;
  error: string | null;
}

export function useChatWebSocket(): UseChatWebSocketReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;

  const connect = useCallback(() => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not authenticated');
      return;
    }

    // Determine WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Use current domain (works for both dev and production)
    // Dev: ws://localhost:3000 → ws://localhost:8000 (direct to backend)
    // Prod: wss://questpath.live → wss://questpath.live (nginx routes /ws/chat to backend)
    const host = process.env.NODE_ENV === 'development' 
      ? 'localhost:8000'  // Dev: direct to backend
      : window.location.host;  // Prod: same domain, nginx routes to backend
    const wsUrl = `${protocol}//${host}/ws/chat?token=${token}`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data: ChatMessage = JSON.parse(event.data);

          if (data.type === 'history') {
            // Initial message history
            setMessages(data.messages || []);
            if (data.online_count !== undefined) {
              setOnlineCount(data.online_count);
            }
          } else if (data.type === 'message') {
            // New message from someone
            setMessages((prev) => [...prev, data]);
          } else if (data.type === 'system') {
            // System message (user joined/left)
            if (data.online_count !== undefined) {
              setOnlineCount(data.online_count);
            }
            // Optionally add system messages to chat
            setMessages((prev) => [...prev, data]);
          } else if (data.type === 'error') {
            // Error from server
            setError(data.message || 'An error occurred');
          } else if (data.type === 'pong') {
            // Heartbeat response
            if (data.online_count !== undefined) {
              setOnlineCount(data.online_count);
            }
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = () => {
        // WebSocket error events don't contain useful info
        // The actual error details come from onclose event
        setError('Connection error');
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason || 'No reason provided');
        setIsConnected(false);
        wsRef.current = null;

        // Attempt reconnection with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`Reconnecting in ${delay}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else {
          setError('Unable to connect to chat. Please refresh the page.');
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setError('Failed to connect to chat');
    }
  }, []);

  useEffect(() => {
    connect();

    // Cleanup on unmount only
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        // Only close if WebSocket is OPEN or CONNECTING
        // Prevents error when React Strict Mode runs cleanup during CONNECTING state
        if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
          wsRef.current.close();
        }
        wsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - connect is stable, run only on mount/unmount

  // Send heartbeat ping every 30 seconds
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const sendMessage = useCallback((content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('Not connected to chat');
      return;
    }

    try {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        content
      }));
      setError(null);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
    }
  }, []);

  return {
    messages,
    isConnected,
    onlineCount,
    sendMessage,
    error
  };
}
