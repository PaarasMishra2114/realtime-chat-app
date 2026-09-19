import React, { useState, useEffect, useRef } from 'react';
import { 
  Hash, Users, Send, 
  Activity, Search, MessageCircle 
} from 'lucide-react';
import { User, Room, ChatMessage } from '../types.js';
import { wsClient } from '../services/websocket.js';
import { PonytailWidget } from '../components/PonytailWidget.js';

interface ChatAppProps {
  soundEnabled: boolean;
  onPlayChime: () => void;
}

export const ChatApp: React.FC<ChatAppProps> = ({ soundEnabled, onPlayChime }) => {
  const [currentUser] = useState<User>(() => ({
    id: `usr-${Math.floor(1000 + Math.random() * 9000)}`,
    username: `DevUser_${Math.floor(100 + Math.random() * 900)}`,
    avatar: '👨‍💻',
    status: 'online',
    lastSeen: new Date().toISOString()
  }));

  const [rooms, setRooms] = useState<Room[]>([
    { id: 'general', name: 'general', description: 'General community hangout & chatter', topic: 'Welcome to PulseChat Real-Time Mesh!', isPrivate: false, memberCount: 24 },
    { id: 'dev', name: 'dev-stream', description: 'Architecture discussions & releases', topic: 'v2026.1 WebSocket Mesh deployed', isPrivate: false, memberCount: 18 },
    { id: 'design', name: 'ui-design', description: 'Glassmorphism & animations', topic: 'Dark mode cyber-luxe aesthetic', isPrivate: false, memberCount: 12 },
    { id: 'announcements', name: 'announcements', description: 'Official releases & updates', topic: 'PulseChat 2026 launched!', isPrivate: false, memberCount: 42 }
  ]);

  const [activeRoomId, setActiveRoomId] = useState<string>('general');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [searchFilter, setSearchFilter] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Set SEO metadata
  useEffect(() => {
    document.title = `PulseChat — Live Room #${activeRoomId} | Real-Time WebSocket`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', `Live chat room #${activeRoomId} on PulseChat real-time messaging network with instant delivery.`);
    }
  }, [activeRoomId]);

  // Connect WebSocket on mount
  useEffect(() => {
    const wsUrl = (import.meta as any).env?.VITE_WS_URL || 'ws://localhost:3001/ws';
    wsClient.connect(wsUrl, currentUser);

    const unsubAuth = wsClient.onAuthSuccess((data) => {
      if (data.rooms && data.rooms.length > 0) {
        setRooms(data.rooms);
      }
      wsClient.joinRoom(activeRoomId);
    });

    const unsubHistory = wsClient.onRoomHistory((data) => {
      if (data.roomId === activeRoomId) {
        setMessages(data.messages);
        setOnlineUsers(data.onlineUsers);
      }
    });

    const unsubMsg = wsClient.onNewMessage((msg) => {
      if (msg.roomId === activeRoomId) {
        setMessages((prev) => [...prev, msg]);
        if (msg.userId !== currentUser.id && soundEnabled) {
          onPlayChime();
        }
      }
    });

    const unsubPresence = wsClient.onPresence((data) => {
      if (data.roomId === activeRoomId) {
        setOnlineUsers(data.onlineUsers);
      }
    });

    const unsubTyping = wsClient.onTyping((data) => {
      if (data.roomId === activeRoomId) {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          if (data.isTyping) {
            next.add(data.username);
          } else {
            next.delete(data.username);
          }
          return next;
        });
      }
    });

    const unsubReaction = wsClient.onReaction((data) => {
      if (data.roomId === activeRoomId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === data.messageId ? { ...m, reactions: data.reactions } : m
          )
        );
      }
    });

    return () => {
      unsubAuth();
      unsubHistory();
      unsubMsg();
      unsubPresence();
      unsubTyping();
      unsubReaction();
    };
  }, [activeRoomId, currentUser, onPlayChime, soundEnabled]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleSelectRoom = (roomId: string) => {
    if (roomId === activeRoomId) return;
    setActiveRoomId(roomId);
    setMessages([]);
    setTypingUsers(new Set());
    wsClient.joinRoom(roomId);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    wsClient.sendMessage(activeRoomId, text);
    setInputText('');
    wsClient.stopTyping(activeRoomId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    // Typing telemetry debouncing
    wsClient.startTyping(activeRoomId);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      wsClient.stopTyping(activeRoomId);
    }, 2000);
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    wsClient.addReaction(messageId, activeRoomId, emoji);
  };

  const activeRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];
  const filteredMessages = messages.filter((m) =>
    searchFilter ? m.text.toLowerCase().includes(searchFilter.toLowerCase()) : true
  );

  return (
    <div style={{
      maxWidth: '1440px',
      margin: '0 auto',
      padding: '1rem 1.5rem',
      height: 'calc(100vh - 80px)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Unique <h1> for Technical SEO */}
      <h1 style={{
        fontSize: '1rem',
        fontWeight: 600,
        color: 'var(--text-muted)',
        marginBottom: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <Activity size={16} color="var(--accent-cyan)" />
        PulseChat Real-Time Workspace — Live WebSocket Stream
      </h1>

      {/* Main Container */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '260px 1fr 240px',
        gap: '1rem',
        overflow: 'hidden'
      }}>
        {/* Left Sidebar: Room Channels */}
        <aside className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
                Channels
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', background: 'rgba(0, 229, 255, 0.1)', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>
                {rooms.length} Active
              </span>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
            {rooms.map((room) => {
              const isActive = room.id === activeRoomId;
              return (
                <button
                  key={room.id}
                  onClick={() => handleSelectRoom(room.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '0.25rem',
                    background: isActive ? 'rgba(0, 229, 255, 0.12)' : 'transparent',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--border-active)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                  className="glass-card"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Hash size={16} color={isActive ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                    <span style={{ fontWeight: isActive ? 600 : 500, fontSize: '0.9rem' }}>
                      {room.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {room.memberCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* User Profile Card */}
          <div style={{
            padding: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}>
              {currentUser.avatar}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.username}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>
                <span className="pulse-indicator" /> Online
              </div>
            </div>
          </div>
        </aside>

        {/* Center: Live Chat Stream */}
        <main className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Room Header */}
          <div style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(0, 229, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Hash size={18} color="var(--accent-cyan)" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>#{activeRoom.name}</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{activeRoom.topic}</p>
              </div>
            </div>

            {/* Search within room */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.35rem 0.75rem'
              }}>
                <Search size={14} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    width: '140px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Messages Stream */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {filteredMessages.length === 0 ? (
              <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                <MessageCircle size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem' }} />
                <p>No messages yet in #{activeRoom.name}. Be the first to say hello!</p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isMe = msg.userId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'flex-start',
                      maxWidth: '85%',
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      flexDirection: isMe ? 'row-reverse' : 'row'
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      flexShrink: 0
                    }}>
                      {msg.avatar || '👤'}
                    </div>

                    {/* Bubble */}
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.25rem',
                        justifyContent: isMe ? 'flex-end' : 'flex-start'
                      }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isMe ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                          {msg.username}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div style={{
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        background: isMe ? 'linear-gradient(135deg, rgba(0, 229, 255, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)' : 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid',
                        borderColor: isMe ? 'rgba(0, 229, 255, 0.3)' : 'var(--border-subtle)',
                        fontSize: '0.9rem',
                        lineHeight: '1.5',
                        wordBreak: 'break-word',
                        color: 'var(--text-primary)'
                      }}>
                        {msg.text}
                      </div>

                      {/* Reaction Badges & Quick Picker */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        marginTop: '0.4rem',
                        flexWrap: 'wrap',
                        justifyContent: isMe ? 'flex-end' : 'flex-start'
                      }}>
                        {Object.values(msg.reactions || {}).map((reaction) => (
                          <button
                            key={reaction.emoji}
                            onClick={() => handleAddReaction(msg.id, reaction.emoji)}
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 'var(--radius-full)',
                              padding: '0.15rem 0.5rem',
                              fontSize: '0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              color: 'var(--text-secondary)'
                            }}
                          >
                            <span>{reaction.emoji}</span>
                            <span style={{ fontWeight: 600 }}>{reaction.count}</span>
                          </button>
                        ))}

                        {/* Quick Add Reaction Buttons */}
                        {['👍', '❤️', '🔥', '🚀'].map((em) => (
                          <button
                            key={em}
                            onClick={() => handleAddReaction(msg.id, em)}
                            style={{
                              padding: '0.15rem 0.35rem',
                              borderRadius: 'var(--radius-sm)',
                              opacity: 0.6,
                              fontSize: '0.75rem'
                            }}
                            title={`React with ${em}`}
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing Indicator Bar */}
          {typingUsers.size > 0 && (
            <div style={{
              padding: '0.35rem 1.5rem',
              fontSize: '0.75rem',
              color: 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <span>{Array.from(typingUsers).join(', ')} is typing</span>
              <span className="wave-dot" />
              <span className="wave-dot" />
              <span className="wave-dot" />
            </div>
          )}

          {/* Message Input & Extension Integration Toolbar */}
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(0, 0, 0, 0.2)'
          }}>
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 0.85rem',
                gap: '0.5rem'
              }}>
                <input
                  type="text"
                  placeholder={`Message #${activeRoom.name}...`}
                  value={inputText}
                  onChange={handleInputChange}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                  }}
                />

                {/* Ponytail Extension Quick Snippet Inserter */}
                <PonytailWidget
                  activeRoom={activeRoom.name}
                  onInsertSnippet={(snippet) => {
                    setInputText((prev) => (prev ? `${prev} ${snippet}` : snippet));
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={!inputText.trim()}
                style={{
                  background: inputText.trim() ? 'linear-gradient(135deg, #00e5ff 0%, #8b5cf6 100%)' : 'rgba(255, 255, 255, 0.1)',
                  color: inputText.trim() ? '#0a0d14' : 'var(--text-muted)',
                  padding: '0.65rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: inputText.trim() ? '0 0 15px rgba(0, 229, 255, 0.3)' : 'none'
                }}
              >
                <Send size={16} /> Send
              </button>
            </form>
          </div>
        </main>

        {/* Right Sidebar: Active Room Members */}
        <aside className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Users size={14} /> Room Members ({onlineUsers.length + 1})
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
            {/* Current user */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '0.35rem',
              background: 'rgba(0, 229, 255, 0.05)'
            }}>
              <span style={{ fontSize: '1.1rem' }}>{currentUser.avatar}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                  {currentUser.username} (You)
                </span>
              </div>
              <span className="pulse-indicator" />
            </div>

            {/* Other peers */}
            {onlineUsers
              .filter((u) => u.id !== currentUser.id)
              .map((u) => (
                <div
                  key={u.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '0.25rem'
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{u.avatar || '👤'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {u.username}
                    </span>
                  </div>
                  <span className="pulse-indicator" />
                </div>
              ))}
          </div>

          {/* Extension Quick Launch Banner */}
          <div style={{
            padding: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(0, 229, 255, 0.03)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '0.2rem' }}>
              Ponytail Companion
            </div>
            Use extension hotkey to dock PulseChat directly to your browser sidebar.
          </div>
        </aside>
      </div>
    </div>
  );
};
