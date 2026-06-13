import React, { useState, useRef, useEffect } from 'react';
import { chatService } from '../services/endpoints';
import { MessageSquare, Send, Cpu } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hello. I'm your AI health assistant. I can answer general health questions and help you understand medical concepts. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const reply = await chatService.sendMessage(userMessage);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Sorry, I couldn't process your request. Please check your connection and try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Helper to parse simple markdown bold and lists
  const renderMessageContent = (content: string, isUser: boolean) => {
    if (isUser) {
      return <p style={{ color: 'var(--bg-primary)', margin: 0 }}>{content}</p>;
    }

    const lines = content.split('\n');
    return (
      <div style={styles.markdownWrap}>
        {lines.map((line, idx) => {
          let isHeader = false;
          let isListItem = false;
          let cleanText = line.trim();

          if (cleanText.startsWith('#')) {
            isHeader = true;
            cleanText = cleanText.replace(/^#+\s*/, '');
          } else if (cleanText.startsWith('* ') || cleanText.startsWith('- ')) {
            isListItem = true;
            cleanText = cleanText.substring(2);
          } else if (/^\d+\.\s+/.test(cleanText)) {
            isListItem = true;
            const match = cleanText.match(/^(\d+\.\s+)/);
            if (match) {
              cleanText = cleanText.substring(match[1].length);
            }
          }

          if (line.trim() === '' && idx !== lines.length - 1) {
            return <div key={idx} style={{ height: '8px' }} />;
          }

          const parts = cleanText.split('**');
          const renderedElements = parts.map((part, pIdx) => {
            const isBold = pIdx % 2 === 1;
            return (
              <span key={pIdx} style={{ fontWeight: isBold ? 'bold' : 'normal' }}>
                {part}
              </span>
            );
          });

          if (isHeader) {
            return (
              <h4 key={idx} style={styles.mdHeader}>
                {renderedElements}
              </h4>
            );
          }

          if (isListItem) {
            return (
              <div key={idx} style={styles.mdListRow}>
                <span style={styles.mdBullet}>•</span>
                <span style={styles.mdListText}>{renderedElements}</span>
              </div>
            );
          }

          return (
            <p key={idx} style={styles.mdParagraph}>
              {renderedElements}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Banner Header */}
        <div style={styles.banner} className="glassmorphism">
          <div style={styles.visualImage} />
          <div style={styles.bannerScrim} />
          <div style={styles.bannerContent}>
            <div style={styles.iconBox}>
              <MessageSquare size={18} color="var(--text-accent)" />
            </div>
            <div>
              <h1 style={styles.bannerTitle}>AI Health Assistant</h1>
              <p style={styles.bannerSub}>Clinical educational chatbot — not medical diagnostic advice</p>
            </div>
          </div>
        </div>

        {/* Chat area card */}
        <div style={styles.chatCard} className="glassmorphism">
          {/* Scrollable list */}
          <div style={styles.messagesList}>
            {messages.map((item) => {
              const isUser = item.role === 'user';
              return (
                <div
                  key={item.id}
                  style={{
                    ...styles.messageRow,
                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      ...styles.bubble,
                      background: isUser ? 'var(--text-accent)' : 'var(--bg-tertiary)',
                      border: isUser ? 'none' : '1px solid var(--border-subtle)',
                      borderBottomRightRadius: isUser ? 'var(--radius-sm)' : 'var(--radius-xl)',
                      borderBottomLeftRadius: isUser ? 'var(--radius-xl)' : 'var(--radius-sm)',
                    }}
                  >
                    {!isUser && (
                      <div style={styles.aiBadge}>
                        <Cpu size={8} color="var(--text-accent)" style={{ marginRight: '3px' }} />
                        <span>AI ASSISTANT</span>
                      </div>
                    )}
                    {renderMessageContent(item.content, isUser)}
                    <span style={{
                      ...styles.timestamp,
                      color: isUser ? 'rgba(12, 12, 11, 0.6)' : 'var(--text-tertiary)'
                    }}>
                      {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div style={styles.messageRow}>
                <div style={{ ...styles.bubble, border: '1px solid var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
                  <div style={styles.typingRow}>
                    <div style={styles.dot1} />
                    <div style={styles.dot2} />
                    <div style={styles.dot3} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form input controls */}
          <form onSubmit={handleSend} style={styles.inputForm}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a health or diagnostic question..."
              maxLength={500}
              style={styles.textField}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              style={{
                ...styles.sendBtn,
                background: input.trim() && !isTyping ? 'var(--text-accent)' : 'var(--bg-primary)',
                color: input.trim() && !isTyping ? 'var(--bg-primary)' : 'var(--text-tertiary)',
                borderColor: input.trim() && !isTyping ? 'var(--text-accent)' : 'var(--border-default)',
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: 'var(--bg-primary)',
    minHeight: '100vh',
    padding: '4rem 2rem',
  },
  wrapper: {
    maxWidth: '850px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  banner: {
    position: 'relative',
    height: '140px',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'flex-end',
    padding: '1.5rem 2rem',
  },
  visualImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'url("https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1200&q=80")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.15,
  },
  bannerScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(to top, var(--bg-primary) 0%, transparent 100%)',
  },
  bannerContent: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  iconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'var(--surface-highlight)',
    border: '1px solid var(--border-default)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: '1.25rem',
    fontFamily: 'var(--font-display)',
    color: '#FFFFFF',
    fontWeight: 'normal',
  },
  bannerSub: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6875rem',
    color: 'var(--text-tertiary)',
    letterSpacing: '0.3px',
    marginTop: '2px',
  },
  chatCard: {
    borderRadius: 'var(--radius-xl)',
    display: 'flex',
    flexDirection: 'column',
    height: '60vh',
    minHeight: '400px',
    overflow: 'hidden',
  },
  messagesList: {
    flex: 1,
    padding: '2rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  messageRow: {
    display: 'flex',
    width: '100%',
  },
  bubble: {
    maxWidth: '75%',
    padding: '1rem 1.25rem',
    borderRadius: 'var(--radius-xl)',
    display: 'flex',
    flexDirection: 'column',
  },
  aiBadge: {
    display: 'flex',
    alignItems: 'center',
    alignSelf: 'flex-start',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.5625rem',
    color: 'var(--text-accent)',
    background: 'var(--surface-highlight)',
    padding: '2px 6px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-subtle)',
    marginBottom: '8px',
    letterSpacing: '1px',
  },
  timestamp: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.5625rem',
    alignSelf: 'flex-end',
    marginTop: '6px',
  },
  inputForm: {
    display: 'flex',
    padding: '1.25rem 2rem',
    background: 'var(--bg-secondary)',
    borderTop: '1px solid var(--border-subtle)',
    gap: '0.75rem',
    alignItems: 'center',
  },
  textField: {
    flex: 1,
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
    padding: '0.875rem 1.25rem',
    borderRadius: 'var(--radius-xl)',
    fontSize: '0.875rem',
    outline: 'none',
  },
  sendBtn: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
  },
  markdownWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: '0.875rem',
    color: 'var(--text-primary)',
  },
  mdHeader: {
    fontSize: '0.95rem',
    fontWeight: 'bold',
    margin: '6px 0 2px 0',
  },
  mdParagraph: {
    margin: '0 0 4px 0',
    lineHeight: '1.5',
  },
  mdListRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '6px',
    paddingLeft: '4px',
  },
  mdBullet: {
    color: 'var(--text-accent)',
  },
  mdListText: {
    flex: 1,
    lineHeight: '1.5',
  },
  typingRow: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    height: '14px',
  },
  dot1: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--text-accent)',
    opacity: 0.4,
    animation: 'float 1.2s infinite alternate',
  },
  dot2: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--text-accent)',
    opacity: 0.7,
    animation: 'float 1.2s infinite alternate 0.2s',
  },
  dot3: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--text-accent)',
    opacity: 1,
    animation: 'float 1.2s infinite alternate 0.4s',
  },
};
export default Chat;
