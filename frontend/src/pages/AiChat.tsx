
import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Bot, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/section-heading';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { format } from 'date-fns';


interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatHistoryResponse {
  messages: ChatMessage[];
}

async function sendChatMessage(message: string): Promise<ChatMessage> {
  try {
    // In a real app, this would make an actual API call
    // For now, we'll simulate a response after a delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // This is mock data - in a real app this would come from the API
        resolve({
          id: Date.now().toString(),
          role: 'assistant',
          content: `I understand your question about "${message.substring(0, 30)}...". Here's my analysis based on the latest technical standards and best practices...`,
          timestamp: new Date().toISOString()
        });
      }, 1000);
    });
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

async function getChatHistory(): Promise<ChatHistoryResponse> {
  try {
    // In a real app, this would make an actual API call
    // For now, we'll return some sample history
    return {
      messages: [
        {
          id: '1',
          role: 'user',
          content: 'How do I implement authentication in a React app?',
          timestamp: new Date(Date.now() - 60000).toISOString()
        },
        {
          id: '2',
          role: 'assistant',
          content: 'For implementing authentication in a React app, you have several options. The most common approaches are: 1) JWT-based authentication, 2) OAuth with providers like Google or GitHub, or 3) Using an authentication service like Auth0 or Firebase Authentication. Would you like me to explain one of these in more detail?',
          timestamp: new Date(Date.now() - 40000).toISOString()
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
}


export default function AiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Load chat history when the component mounts
    const loadChatHistory = async () => {
      try {
        const history = await getChatHistory();
        setMessages(history.messages);
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };
    
    loadChatHistory();
  }, []);
  
  useEffect(() => {
    // Scroll to bottom whenever messages change
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await sendChatMessage(input);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add an error message
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again later.',
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), 'MMM d, h:mm a');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <SectionHeading
        title="AI Chat"
        description="Chat with KAGE to get answers to your technical questions and project guidance."
        className="mb-8 text-center"
      />
      
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-300px)] min-h-[500px]">
        <Card className="flex-grow flex flex-col">
          <CardContent className="flex-grow p-0 flex flex-col">
            <div className="flex-grow overflow-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <Bot className="h-12 w-12 text-kage-purple mb-4" />
                  <h3 className="text-xl font-medium mb-2 font-heading">KAGE is Ready to Help</h3>
                  <p className="text-muted-foreground max-w-md">
                    Ask me anything about your development projects, coding challenges, or technical questions.
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`
                        max-w-3/4 rounded-lg p-4 space-y-2
                        ${message.role === 'user' 
                          ? 'bg-kage-purple text-white' 
                          : 'bg-kage-gray-dark border border-border'}
                      `}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`p-1 rounded-full ${message.role === 'user' ? 'bg-white/20' : 'bg-kage-purple/20'}`}>
                          {message.role === 'user' ? (
                            <User className="h-3 w-3" />
                          ) : (
                            <Bot className="h-3 w-3 text-kage-purple-light" />
                          )}
                        </div>
                        <span className="text-xs font-medium">
                          {message.role === 'user' ? 'You' : 'KAGE'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-kage-gray-dark border border-border max-w-3/4 rounded-lg p-4 flex items-center space-x-3">
                    <Bot className="h-5 w-5 text-kage-purple-light" />
                    <LoadingSpinner size="sm" />
                    <span>KAGE is thinking...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t border-border">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-grow"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="bg-kage-purple hover:bg-kage-purple-dark"
                  disabled={!input.trim() || isLoading}
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center mt-4">
          <p className="text-xs text-muted-foreground">
            KAGE provides technical guidance based on the information provided. 
            Always verify solutions in your specific context.
          </p>
        </div>
      </div>
    </div>
  );
}
