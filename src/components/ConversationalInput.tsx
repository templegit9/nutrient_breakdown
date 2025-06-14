import { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Chip,
  IconButton,
  CircularProgress,
  Fade,
  Stack
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as AIIcon,
  Person as UserIcon,
  Check as CheckIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { parseSmartFood } from '../utils/smartFoodParser';
import { parseConversationalInput } from '../utils/conversationalParser';
import type { SmartParseResult, SmartParsedFood } from '../utils/smartFoodParser';

interface ConversationalInputProps {
  onFoodsConfirmed: (foods: SmartParsedFood[]) => void;
  disabled?: boolean;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'confirmation';
  content: string;
  timestamp: Date;
  foods?: SmartParsedFood[];
  parseResult?: SmartParseResult;
}

export default function ConversationalInput({ onFoodsConfirmed, disabled }: ConversationalInputProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingFoods, setPendingFoods] = useState<SmartParsedFood[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isProcessing || disabled) return;

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
      // Parse the user input
      const parseResult = await parseSmartFood(inputText.trim());
      
      // Create assistant response
      const assistantMessage = createAssistantResponse(parseResult);
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // If foods were found, show confirmation
      if (parseResult.foods.length > 0) {
        setPendingFoods(parseResult.foods);
        const confirmationMessage = createConfirmationMessage(parseResult);
        setMessages(prev => [...prev, confirmationMessage]);
      }
      
    } catch (error) {
      console.error('Error processing message:', error);
      
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '_error',
        type: 'assistant',
        content: "I'm having trouble understanding that. Could you try rephrasing? For example: 'I had 2 slices of bread and a cup of coffee'",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const createAssistantResponse = (parseResult: SmartParseResult): ChatMessage => {
    let content = '';
    
    if (parseResult.foods.length === 0) {
      content = "I didn't find any specific foods in that message. Could you tell me what you ate? For example: '2 slices of bread' or '1 cup of rice'";
    } else if (parseResult.needsClarification) {
      content = `I found some foods but need clarification:\n${parseResult.foods.map(f => 
        `• ${f.food}${f.quantity ? ` (${f.quantity}${f.unit ? ' ' + f.unit : ''})` : ' (how much?)'}`
      ).join('\n')}`;
    } else {
      content = `Great! I found ${parseResult.foods.length} food${parseResult.foods.length > 1 ? 's' : ''}:\n${parseResult.foods.map(f => 
        `• ${f.quantity || ''} ${f.unit || ''} ${f.food}${f.cookingMethod ? ` (${f.cookingMethod})` : ''}`
      ).join('\n')}`;
    }

    return {
      id: Date.now().toString() + '_assistant',
      type: 'assistant',
      content,
      timestamp: new Date(),
      foods: parseResult.foods,
      parseResult
    };
  };

  const createConfirmationMessage = (parseResult: SmartParseResult): ChatMessage => {
    return {
      id: Date.now().toString() + '_confirmation',
      type: 'confirmation',
      content: 'Would you like to add these foods to your log?',
      timestamp: new Date(),
      foods: parseResult.foods,
      parseResult
    };
  };

  const handleConfirmFoods = () => {
    if (pendingFoods.length > 0) {
      onFoodsConfirmed(pendingFoods);
      setPendingFoods([]);
      
      const successMessage: ChatMessage = {
        id: Date.now().toString() + '_success',
        type: 'assistant',
        content: `✅ Added ${pendingFoods.length} food${pendingFoods.length > 1 ? 's' : ''} to your log! Anything else you'd like to add?`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, successMessage]);
    }
  };

  const handleEditFood = (food: SmartParsedFood) => {
    // For now, suggest manual edit
    const editMessage: ChatMessage = {
      id: Date.now().toString() + '_edit',
      type: 'assistant',
      content: `To edit "${food.food}", you can tell me: "Actually, I had [amount] [unit] of ${food.food}" or switch to the form mode for precise editing.`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, editMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Chat Messages */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto', 
        p: 2, 
        backgroundColor: 'grey.50',
        minHeight: '300px',
        maxHeight: '500px'
      }}>
        {messages.length === 0 && (
          <Box sx={{ textAlign: 'center', color: 'text.secondary', mt: 4 }}>
            <AIIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="body1">
              Tell me what you ate! Try something like:
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
              "I had 2 slices of bread and a cup of coffee for breakfast"
            </Typography>
          </Box>
        )}
        
        {messages.map((message) => (
          <MessageBubble 
            key={message.id} 
            message={message} 
            onConfirmFoods={handleConfirmFoods}
            onEditFood={handleEditFood}
            pendingFoods={pendingFoods}
          />
        ))}
        
        {isProcessing && (
          <Fade in={isProcessing}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                backgroundColor: 'white',
                borderRadius: 2,
                p: 2,
                boxShadow: 1
              }}>
                <AIIcon color="primary" sx={{ mr: 1 }} />
                <CircularProgress size={16} sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Analyzing your food...
                </Typography>
              </Box>
            </Box>
          </Fade>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Paper elevation={1} sx={{ p: 2, borderRadius: 0 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder="Tell me what you ate... (e.g., '2 slices of bread and coffee')"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled || isProcessing}
            variant="outlined"
            size="small"
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!inputText.trim() || disabled || isProcessing}
            sx={{ mb: 0.5 }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
  onConfirmFoods: () => void;
  onEditFood: (food: SmartParsedFood) => void;
  pendingFoods: SmartParsedFood[];
}

function MessageBubble({ message, onConfirmFoods, onEditFood, pendingFoods }: MessageBubbleProps) {
  const isUser = message.type === 'user';
  const isConfirmation = message.type === 'confirmation';

  return (
    <Fade in={true}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2
      }}>
        <Box sx={{ maxWidth: '80%' }}>
          {/* Message Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 0.5,
            justifyContent: isUser ? 'flex-end' : 'flex-start'
          }}>
            {!isUser && <AIIcon color="primary" sx={{ mr: 1, fontSize: 16 }} />}
            <Typography variant="caption" color="text.secondary">
              {isUser ? 'You' : 'AI Assistant'}
            </Typography>
            {isUser && <UserIcon color="action" sx={{ ml: 1, fontSize: 16 }} />}
          </Box>

          {/* Message Content */}
          <Paper 
            elevation={1}
            sx={{ 
              p: 2,
              backgroundColor: isUser ? 'primary.main' : 'white',
              color: isUser ? 'white' : 'text.primary',
              borderRadius: 2,
              whiteSpace: 'pre-line'
            }}
          >
            <Typography variant="body2">
              {message.content}
            </Typography>

            {/* Food Chips */}
            {message.foods && message.foods.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                {message.foods.map((food, index) => (
                  <Chip
                    key={index}
                    label={`${food.quantity || '?'} ${food.unit || ''} ${food.food}`.trim()}
                    size="small"
                    color={food.confidence > 0.7 ? 'success' : 'warning'}
                    icon={food.confidence > 0.7 ? <CheckIcon /> : <EditIcon />}
                    onClick={() => onEditFood(food)}
                    sx={{ 
                      backgroundColor: isUser ? 'rgba(255,255,255,0.2)' : undefined,
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </Stack>
            )}

            {/* Confirmation Buttons */}
            {isConfirmation && pendingFoods.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<CheckIcon />}
                  onClick={onConfirmFoods}
                  sx={{ backgroundColor: 'success.main' }}
                >
                  Add to Log
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  sx={{ borderColor: 'white', color: 'white' }}
                >
                  Edit First
                </Button>
              </Box>
            )}
          </Paper>

          {/* Processing Method Indicator */}
          {message.parseResult && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, mt: 0.5, display: 'block' }}>
              Processed with {message.parseResult.processingMethod === 'llm' ? '🧠 AI' : 
                            message.parseResult.processingMethod === 'hybrid' ? '⚡ Smart patterns' : 
                            '📝 Basic patterns'}
            </Typography>
          )}
        </Box>
      </Box>
    </Fade>
  );
}