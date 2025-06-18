import React, { useState, useRef, useEffect } from 'react';
import {
  Fab,
  Dialog,
  DialogContent,
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  Fade,
  CircularProgress,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  SmartToy as AIIcon,
  Send as SendIcon,
  Close as CloseIcon,
  Minimize as MinimizeIcon,
  Person as UserIcon
} from '@mui/icons-material';

interface FloatingAssistantProps {
  contextData: any; // The data from the current tab (dashboard stats, health conditions, history, etc.)
  contextType: 'dashboard' | 'health_conditions' | 'food_history';
  isVisible?: boolean;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const FloatingAssistant: React.FC<FloatingAssistantProps> = ({
  contextData,
  contextType,
  isVisible = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with context-specific welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = getWelcomeMessage(contextType);
      setMessages([{
        id: Date.now().toString(),
        type: 'assistant',
        content: welcomeMessage,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, contextType]);

  const getWelcomeMessage = (type: string): string => {
    switch (type) {
      case 'dashboard':
        return "Hi! I'm here to help you understand your nutrition dashboard. Ask me about your daily nutrients, progress toward goals, or what the charts mean!";
      case 'health_conditions':
        return "Hello! I can help you understand your health condition analysis, explain recommendations, or answer questions about how nutrition affects your specific conditions.";
      case 'food_history':
        return "Hey there! I can analyze your eating patterns, help you understand trends in your food history, or answer questions about specific meals you've logged.";
      default:
        return "Hi! I'm your nutrition assistant. How can I help you today?";
    }
  };

  const getContextPrompt = (): string => {
    const basePrompt = "You are a helpful nutrition assistant analyzing user data. Be conversational, encouraging, and provide actionable insights. Keep responses concise but informative.";
    
    switch (contextType) {
      case 'dashboard':
        return `${basePrompt}\n\nDASHBOARD DATA: ${JSON.stringify(contextData)}\n\nHelp the user understand their nutrition dashboard, daily progress, nutrient intake, and provide personalized advice based on their current data.`;
      
      case 'health_conditions':
        return `${basePrompt}\n\nHEALTH CONDITIONS DATA: ${JSON.stringify(contextData)}\n\nHelp the user understand their health condition analysis, explain scores and recommendations, and provide guidance on nutrition for their specific health conditions.`;
      
      case 'food_history':
        return `${basePrompt}\n\nFOOD HISTORY DATA: ${JSON.stringify(contextData)}\n\nAnalyze the user's eating patterns, identify trends, suggest improvements, and answer questions about their food history and meal patterns.`;
      
      default:
        return basePrompt;
    }
  };

  const analyzeWithGemini = async (userMessage: string): Promise<string> => {
    try {
      const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
      const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

      if (!API_KEY) {
        return "I'm sorry, but the AI assistant isn't configured properly. Please check that the Gemini API key is set up.";
      }

      const prompt = `${getContextPrompt()}\n\nUser Question: "${userMessage}"\n\nProvide a helpful, conversational response based on the data and context provided. Keep it under 200 words.`;

      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300,
            topP: 0.8,
            topK: 10
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format');
      }

    } catch (error) {
      console.error('Gemini API error:', error);
      return "I'm having trouble processing your request right now. Could you try asking again in a moment?";
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);

    try {
      const aiResponse = await analyzeWithGemini(userMessage.content);
      
      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + '_assistant',
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '_error',
        type: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setMessages([]); // Clear messages when closing
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const getQuickSuggestions = (): string[] => {
    switch (contextType) {
      case 'dashboard':
        return [
          "How am I doing with my nutrition goals?",
          "What nutrients am I low on?",
          "Explain my macronutrient breakdown"
        ];
      case 'health_conditions':
        return [
          "How does my diet affect my health conditions?",
          "What foods should I focus on?",
          "Explain my health scores"
        ];
      case 'food_history':
        return [
          "What patterns do you see in my eating?",
          "How can I improve my diet?",
          "Show me my meal timing trends"
        ];
      default:
        return [];
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <Fab
          color="primary"
          onClick={handleOpen}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1976D2 30%, #1CB5D3 90%)',
            },
            width: 56,
            height: 56
          }}
        >
          <img 
            src="/ai_button.png" 
            alt="AI Assistant" 
            style={{
              width: 32,
              height: 32,
              objectFit: 'contain'
            }}
            onError={(e) => {
              // Fallback to AI icon if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = '<svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="SmartToyIcon" style="font-size: 24px; color: white;"><path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 16.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path></svg>';
            }}
          />
        </Fab>
      )}

      {/* Chat Dialog */}
      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            position: 'fixed',
            bottom: isMinimized ? -400 : 24,
            right: 24,
            top: 'auto',
            left: 'auto',
            margin: 0,
            width: isMobile ? 'calc(100vw - 32px)' : 400,
            maxHeight: isMinimized ? 60 : 500,
            borderRadius: 3,
            boxShadow: theme.shadows[8],
            transition: 'all 0.3s ease-in-out'
          }
        }}
        BackdropProps={{
          sx: { backgroundColor: 'transparent' }
        }}
      >
        {/* Header */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 2,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            color: 'white'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 1 }}>
              <img 
                src="/ai_button.png" 
                alt="AI" 
                style={{
                  width: 24,
                  height: 24,
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  // Fallback to AI icon if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = '<svg class="MuiSvgIcon-root" focusable="false" aria-hidden="true" viewBox="0 0 24 24" style="font-size: 24px; color: white;"><path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 16.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path></svg>';
                }}
              />
            </Avatar>
            <Typography variant="h6">
              Nutrition Assistant
            </Typography>
          </Box>
          <Box>
            <IconButton 
              onClick={handleMinimize} 
              sx={{ color: 'white', mr: 1 }}
              size="small"
            >
              <MinimizeIcon />
            </IconButton>
            <IconButton 
              onClick={handleClose} 
              sx={{ color: 'white' }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Chat Content */}
        {!isMinimized && (
          <DialogContent sx={{ p: 0, height: 350 }}>
            {/* Messages */}
            <Box sx={{ 
              height: 280, 
              overflowY: 'auto', 
              p: 2,
              backgroundColor: 'grey.50'
            }}>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              
              {isProcessing && (
                <Fade in={isProcessing}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 1, width: 32, height: 32 }}>
                      <img 
                        src="/ai_button.png" 
                        alt="AI" 
                        style={{
                          width: 20,
                          height: 20,
                          objectFit: 'contain'
                        }}
                        onError={(e) => {
                          // Fallback to AI icon if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = '<svg class="MuiSvgIcon-root" focusable="false" aria-hidden="true" viewBox="0 0 24 24" style="font-size: 20px; color: white;"><path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 16.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path></svg>';
                        }}
                      />
                    </Avatar>
                    <Paper sx={{ p: 1.5, backgroundColor: 'white', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress size={16} sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Thinking...
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                </Fade>
              )}
              
              <div ref={messagesEndRef} />
            </Box>

            {/* Quick Suggestions */}
            {messages.length <= 1 && (
              <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Try asking:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {getQuickSuggestions().map((suggestion, index) => (
                    <Chip
                      key={index}
                      label={suggestion}
                      size="small"
                      onClick={() => setInputText(suggestion)}
                      sx={{ 
                        fontSize: '0.7rem',
                        height: 24,
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Input Area */}
            <Box sx={{ 
              p: 2, 
              borderTop: '1px solid', 
              borderColor: 'divider',
              backgroundColor: 'white'
            }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <TextField
                  fullWidth
                  placeholder="Ask me about your nutrition data..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isProcessing}
                  variant="outlined"
                  size="small"
                  multiline
                  maxRows={2}
                />
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isProcessing}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
};

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.type === 'user';

  return (
    <Fade in={true}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2
      }}>
        <Box sx={{ 
          display: 'flex',
          alignItems: 'flex-start',
          maxWidth: '85%',
          flexDirection: isUser ? 'row-reverse' : 'row'
        }}>
          <Avatar 
            sx={{ 
              bgcolor: isUser ? 'secondary.main' : 'primary.main',
              width: 32,
              height: 32,
              mx: 1
            }}
          >
            {isUser ? (
              <UserIcon fontSize="small" />
            ) : (
              <img 
                src="/ai_button.png" 
                alt="AI" 
                style={{
                  width: 20,
                  height: 20,
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  // Fallback to AI icon if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = '<svg class="MuiSvgIcon-root" focusable="false" aria-hidden="true" viewBox="0 0 24 24" style="font-size: 20px; color: white;"><path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 16.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path></svg>';
                }}
              />
            )}
          </Avatar>
          
          <Paper 
            elevation={1}
            sx={{ 
              p: 1.5,
              backgroundColor: isUser ? 'primary.main' : 'white',
              color: isUser ? 'white' : 'text.primary',
              borderRadius: 2,
              maxWidth: '100%'
            }}
          >
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {message.content}
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Fade>
  );
};

export default FloatingAssistant;