export interface AIResponse {
  content: string;
  delay: number;
}

export class MockAIService {
  private responses: string[] = [
    "That's a fascinating question! Let me break this down for you step by step.",
    "I understand what you're asking about. Here's my perspective on this topic:",
    "Great point! This is actually a complex issue with several important considerations.",
    "Thanks for bringing this up. Based on my analysis, I think the key factors are:",
    "That's an interesting observation. Let me provide some insights that might help:",
    "I see what you mean. This reminds me of similar patterns I've encountered before.",
    "Excellent question! This touches on some fundamental concepts that are worth exploring.",
    "I appreciate you sharing that context. It helps me provide a more targeted response.",
    "That's a thoughtful way to approach this problem. Here's how I would think about it:",
    "Good catch! You've identified an important nuance that many people overlook.",
  ];

  private followUpResponses: string[] = [
    "Building on what we just discussed, there's another angle to consider:",
    "That leads me to an important follow-up point:",
    "Now that we've covered the basics, let's dive deeper into:",
    "This connects to a broader principle that's worth understanding:",
    "Here's a practical example that illustrates this concept:",
    "To put this in perspective, consider how this applies to:",
    "One thing that's particularly interesting about this is:",
    "This also raises the question of:",
  ];

  private technicalResponses: string[] = [
    "From a technical standpoint, the implementation would involve:",
    "The architecture for this would typically include:",
    "Here's how you could approach this programmatically:",
    "The key technical considerations are:",
    "In terms of best practices, I'd recommend:",
    "The most efficient solution would be to:",
    "From a performance perspective, you'll want to:",
    "The security implications include:",
  ];

  private conversationHistory: string[] = [];

  generateResponse(userMessage: string): Promise<AIResponse> {
    return new Promise((resolve) => {
      // Add user message to history
      this.conversationHistory.push(userMessage.toLowerCase());
      
      // Determine response type based on message content
      const responseType = this.determineResponseType(userMessage);
      const baseResponse = this.selectResponse(responseType);
      
      // Generate contextual content
      const contextualContent = this.generateContextualContent(userMessage, baseResponse);
      
      // Calculate realistic delay (1-4 seconds)
      const delay = 1000 + Math.random() * 3000;
      
      setTimeout(() => {
        resolve({
          content: contextualContent,
          delay: delay
        });
      }, delay);
    });
  }

  private determineResponseType(message: string): 'technical' | 'followup' | 'general' {
    const lowerMessage = message.toLowerCase();
    
    // Check for technical keywords
    const technicalKeywords = [
      'code', 'programming', 'function', 'algorithm', 'database', 'api',
      'implementation', 'architecture', 'performance', 'security', 'bug',
      'error', 'debug', 'optimize', 'framework', 'library', 'typescript',
      'react', 'electron', 'nextjs', 'python', 'javascript'
    ];
    
    if (technicalKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'technical';
    }
    
    // Check if this is a follow-up (conversation has history)
    if (this.conversationHistory.length > 1) {
      const followupIndicators = ['also', 'what about', 'how about', 'and', 'but', 'however'];
      if (followupIndicators.some(indicator => lowerMessage.includes(indicator))) {
        return 'followup';
      }
    }
    
    return 'general';
  }

  private selectResponse(type: 'technical' | 'followup' | 'general'): string {
    switch (type) {
      case 'technical':
        return this.technicalResponses[Math.floor(Math.random() * this.technicalResponses.length)];
      case 'followup':
        return this.followUpResponses[Math.floor(Math.random() * this.followUpResponses.length)];
      default:
        return this.responses[Math.floor(Math.random() * this.responses.length)];
    }
  }

  private generateContextualContent(userMessage: string, baseResponse: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Add specific context based on message content
    let contextualAddition = '';
    
    if (lowerMessage.includes('electron')) {
      contextualAddition = '\n\nRegarding Electron specifically, it\'s worth noting that it combines Chromium and Node.js, which gives you the power of web technologies in a desktop application. The main process manages application lifecycle and creates renderer processes.';
    } else if (lowerMessage.includes('nextjs') || lowerMessage.includes('next.js')) {
      contextualAddition = '\n\nWith Next.js, you get server-side rendering, static site generation, and excellent developer experience out of the box. When integrating with Electron, the key is to configure Next.js for static export to work with the file:// protocol.';
    } else if (lowerMessage.includes('typescript')) {
      contextualAddition = '\n\nTypeScript adds static type checking to JavaScript, which helps catch errors at compile time and provides better IDE support. It\'s particularly valuable in larger applications where type safety becomes crucial.';
    } else if (lowerMessage.includes('react')) {
      contextualAddition = '\n\nReact\'s component-based architecture makes it perfect for building complex UIs. The virtual DOM and one-way data flow help maintain predictable application state.';
    } else if (lowerMessage.includes('python')) {
      contextualAddition = '\n\nPython integration with Electron can be achieved through child processes. You can spawn Python scripts from the main process and communicate through stdin/stdout or use IPC mechanisms.';
    }
    
    // Add helpful suggestions
    const suggestions = [
      '\n\nWould you like me to elaborate on any specific aspect?',
      '\n\nLet me know if you need more details on implementation!',
      '\n\nFeel free to ask if you have any follow-up questions.',
      '\n\nI can provide more specific examples if that would be helpful.',
      '\n\nIs there a particular part you\'d like to dive deeper into?',
    ];
    
    const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    
    return baseResponse + contextualAddition + suggestion;
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  getConversationLength(): number {
    return this.conversationHistory.length;
  }
}

// Export singleton instance
export const mockAI = new MockAIService();
