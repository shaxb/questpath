'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Crown, User, Minimize2 } from 'lucide-react';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';
import toast from 'react-hot-toast';

export function GlobalChat() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef(0);

  const { messages, isConnected, onlineCount, sendMessage, error } = useChatWebSocket();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && isExpanded) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded]);

  // Show unread indicator when collapsed and new messages arrive
  useEffect(() => {
    if (!isExpanded && messages.length > previousMessageCountRef.current) {
      setHasUnread(true);
    }
    previousMessageCountRef.current = messages.length;
  }, [messages, isExpanded]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Clear unread when expanded
  useEffect(() => {
    if (isExpanded) {
      setHasUnread(false);
    }
  }, [isExpanded]);

  const handleSendMessage = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    
    if (trimmed.length > 500) {
      toast.error('Message too long (max 500 characters)');
      return;
    }

    sendMessage(trimmed);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isExpanded ? (
        // Floating button
        <button
          onClick={() => setIsExpanded(true)}
          className="relative bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Open chat"
        >
          <MessageCircle size={24} />
          {hasUnread && (
            <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />
          )}
          {onlineCount > 0 && (
            <span className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {onlineCount}
            </span>
          )}
        </button>
      ) : (
        // Chat panel
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-96 h-[500px] flex flex-col border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-purple-600 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} />
              <h3 className="font-semibold">Global Chat</h3>
              {onlineCount > 0 && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {onlineCount} online
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isConnected && (
                <span className="text-xs bg-yellow-500/80 px-2 py-0.5 rounded-full">
                  Connecting...
                </span>
              )}
              <button
                onClick={() => setIsExpanded(false)}
                className="hover:bg-white/20 rounded p-1 transition"
                aria-label="Minimize chat"
              >
                <Minimize2 size={18} />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900"
          >
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                if (msg.type === 'system') {
                  return (
                    <div key={`system-${index}`} className="text-center text-xs text-gray-500 dark:text-gray-400 py-1">
                      {msg.message}
                    </div>
                  );
                }

                if (msg.type === 'message' && msg.message) {
                  return (
                    <div key={`msg-${msg.id || index}`} className="flex gap-2">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                          <User size={16} className="text-purple-600 dark:text-purple-300" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                            {msg.user_display_name || 'Unknown'}
                          </span>
                          {msg.user_is_premium && (
                            <span title="Premium User">
                              <Crown size={14} className="text-yellow-500" />
                            </span>
                          )}
                          {msg.created_at && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTimestamp(msg.created_at)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  );
                }

                return null;
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isConnected ? 'Type a message...' : 'Connecting...'}
                disabled={!isConnected}
                maxLength={500}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!isConnected || !inputValue.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white p-2 rounded-lg transition disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            </div>
            {inputValue.length > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                {inputValue.length}/500
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
