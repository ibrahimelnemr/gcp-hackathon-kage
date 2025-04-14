
import { apiRequest } from './api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
}

export async function sendChatMessage(message: string): Promise<ChatMessage> {
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

export async function getChatHistory(): Promise<ChatHistoryResponse> {
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
