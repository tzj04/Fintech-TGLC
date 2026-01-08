import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const MessagingSection = ({ messages: initialMessages, userRole, onSendMessage }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendMessage = () => {
    if (!newMessage?.trim()) return;

    setSending(true);
    const message = {
      id: messages?.length + 1,
      sender: userRole === 'agent' ? 'Agent' : 'Borrower',
      content: newMessage,
      timestamp: new Date()?.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      isCurrentUser: true
    };

    setTimeout(() => {
      setMessages([...messages, message]);
      setNewMessage('');
      setSending(false);
      if (onSendMessage) onSendMessage(message);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e?.key === 'Enter' && !e?.shiftKey) {
      e?.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-glow-md overflow-hidden">
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg bg-primary/10">
            <Icon name="MessageSquare" size={24} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground">
              Messages
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Direct communication with {userRole === 'agent' ? 'borrower' : 'agent'}
            </p>
          </div>
        </div>
      </div>
      <div className="h-96 md:h-[28rem] overflow-y-auto scrollbar-custom p-4 md:p-6 space-y-4">
        {messages?.map((message) => (
          <div
            key={message?.id}
            className={`flex ${message?.isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] md:max-w-[70%] ${message?.isCurrentUser ? 'order-2' : 'order-1'}`}>
              <div className="flex items-center gap-2 mb-1">
                {!message?.isCurrentUser && (
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <Icon name="User" size={14} className="text-muted-foreground" />
                  </div>
                )}
                <span className="text-xs text-muted-foreground">
                  {message?.sender}
                </span>
                <span className="text-xs text-muted-foreground">
                  {message?.timestamp}
                </span>
              </div>
              <div
                className={`p-3 md:p-4 rounded-lg ${
                  message?.isCurrentUser
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-foreground'
                }`}
              >
                <p className="text-sm md:text-base whitespace-pre-wrap break-words">
                  {message?.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 md:p-6 border-t border-border">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e?.target?.value)}
              onKeyPress={handleKeyPress}
              disabled={sending}
            />
          </div>
          <Button
            variant="default"
            iconName="Send"
            iconPosition="right"
            onClick={handleSendMessage}
            disabled={!newMessage?.trim() || sending}
            loading={sending}
            className="sm:flex-shrink-0"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessagingSection;