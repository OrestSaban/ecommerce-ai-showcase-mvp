import React, { useState, useEffect, useRef } from 'react';
import DrawerPanel from '../components/common/DrawerPanel';
import './Ask.css';

export default function Ask() {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const SUGGESTIONS = [
    { text: 'Which Meta campaigns lost ROAS this week?', icon: 'trend' },
    { text: 'Why did refunds spike on Product Y?', icon: 'bag' },
    { text: 'FBA leak - how to recover the $4,680?', icon: 'alert' }
  ];

  const PAST_CONVERSATIONS = [
    { text: 'Meta ROAS analysis', time: '2 days ago' },
    { text: 'Inventory check', time: '2 days ago' },
    { text: 'Q1 vs Q2 margin', time: '2 days ago' }
  ];

  const renderSuggestionIcon = (iconType) => {
    switch (iconType) {
      case 'trend':
        return (
          <div className="ask-icon-wrapper blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="M18 9l-5 5-4-4-6 6" />
            </svg>
          </div>
        );
      case 'bag':
        return (
          <div className="ask-icon-wrapper green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
        );
      case 'alert':
        return (
          <div className="ask-icon-wrapper red">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    // Add user message
    const newUserMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsTyping(true);

    // Build history from previous messages (exclude the one we just added)
    const history = messages.map(m => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch('http://127.0.0.1:8000/api/ask/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer || 'No response received.',
      }]);
    } catch (err) {
      console.error('Ask API error:', err);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I could not reach the AI service right now. Please try again.',
      }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
    }
  };

  return (
    <DrawerPanel closeEventName="close-ask" returnPath="/" maxWidth="870px">
      <div className="ask-container">
        
        {/* Header */}
        <div className="ask-header">
          <h2 className="ask-title">Ask</h2>
          {messages.length > 0 && (
            <button className="ask-new-chat-btn" onClick={() => setMessages([])}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Go back
            </button>
          )}
        </div>

        {/* Input Box - on top for empty state */}
        {messages.length === 0 && (
          <div className="ask-input-wrapper">
            <input 
              type="text" 
              className="ask-input" 
              placeholder="Ask about your business..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="ask-send-btn" onClick={() => handleSend(inputValue)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="ask-content">
          {messages.length === 0 ? (
            /* Empty State */
            <div className="ask-empty-state">
              <div className="ask-section">
                <h3 className="ask-section-title">WHAT TO ASK NEXT</h3>
                <div className="ask-card-list">
                  {SUGGESTIONS.map((item, idx) => (
                    <button key={idx} className="ask-card-item" onClick={() => handleSend(item.text)}>
                      <div className="ask-card-left">
                        {renderSuggestionIcon(item.icon)}
                        <span className="ask-card-text">{item.text}</span>
                      </div>
                      <svg className="ask-card-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div className="ask-section">
                <h3 className="ask-section-title">PAST CONVERSATIONS</h3>
                <div className="ask-card-list">
                  {PAST_CONVERSATIONS.map((item, idx) => (
                    <button key={idx} className="ask-card-item past-convo">
                      <div className="ask-card-left">
                        <div className="ask-icon-wrapper gray">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                        </div>
                        <span className="ask-card-text">{item.text}</span>
                      </div>
                      <div className="ask-card-right">
                        <span className="ask-card-time">{item.time}</span>
                        <svg className="ask-card-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Chat Interface */
            <div className="ask-chat-history">
              {messages.map((msg, idx) => (
                <div key={idx} className={`ask-message-row ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                  {msg.role === 'assistant' && (
                    <div className="ask-ai-avatar">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                      </svg>
                    </div>
                  )}
                  <div className={`ask-message-bubble ${msg.role}`}>
                    {msg.content.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i !== msg.content.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="ask-message-row assistant">
                  <div className="ask-ai-avatar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                    </svg>
                  </div>
                  <div className="ask-message-bubble typing">
                    Analyzing business data...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Box - at bottom for chat mode */}
        {messages.length > 0 && (
          <div className="ask-input-wrapper ask-input-bottom">
            <input 
              type="text" 
              className="ask-input" 
              placeholder="Ask a follow-up..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="ask-send-btn" onClick={() => handleSend(inputValue)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </DrawerPanel>
  );
}
