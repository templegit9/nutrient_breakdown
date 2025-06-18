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
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 6px 16px rgba(46, 125, 50, 0.4)'
            },
            width: 56,
            height: 56,
            boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          <AIIcon sx={{ fontSize: 28 }} />
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
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(46, 125, 50, 0.2)',
            border: '1px solid rgba(46, 125, 50, 0.1)',
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
            bgcolor: 'primary.main',
            color: 'white',
            background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              mr: 1,
              border: '2px solid rgba(255,255,255,0.3)'
            }}>
              <AIIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Nutrition Assistant
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {contextType === 'dashboard' ? 'Dashboard Analysis' : 
                 contextType === 'health_conditions' ? 'Health Insights' : 
                 'Food History Patterns'}
              </Typography>
            </Box>
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
              backgroundColor: '#f8fdf8'
            }}>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              
              {isProcessing && (
                <Fade in={isProcessing}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ 
                      bgcolor: 'primary.main', 
                      mr: 1, 
                      width: 32, 
                      height: 32,
                      boxShadow: '0 2px 8px rgba(46, 125, 50, 0.3)'
                    }}>
                      <AIIcon fontSize="small" />
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
                        '&:hover': { 
                          backgroundColor: 'primary.main', 
                          color: 'white',
                          transform: 'scale(1.02)'
                        }
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
              bgcolor: isUser ? '#2e7d32' : 'primary.main',
              boxShadow: '0 2px 8px rgba(46, 125, 50, 0.2)',
              width: 32,
              height: 32,
              mx: 1
            }}
          >
            {isUser ? <UserIcon fontSize="small" /> : <AIIcon fontSize="small" />}
          </Avatar>
          
          <Paper 
            elevation={1}
            sx={{ 
              p: 1.5,
              backgroundColor: isUser ? '#2e7d32' : 'white',
              color: isUser ? 'white' : 'text.primary',
              background: isUser ? 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)' : 'white',
              borderRadius: 2,
              maxWidth: '100%',
              border: isUser ? 'none' : '1px solid rgba(46, 125, 50, 0.1)'
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