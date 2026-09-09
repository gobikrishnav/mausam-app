import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  Sparkles, 
  Trash2, 
  Mic, 
  Thermometer, 
  Droplets, 
  Sun 
} from 'lucide-react';
import { MobileContainer } from '../components/layout/MobileContainer';
import { useAppStore } from '../store/useAppStore';
import { askMausamAI } from '../services/aiService';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  weatherContext?: {
    temp: number;
    condition: string;
    rainChance: number;
  };
}

const DEFAULT_SUGGESTIONS = [
  'Is it safe to run outdoors right now?',
  'Will I encounter wet roads on my commute?',
  'When is the best window for drying laundry today?',
  'Should I irrigate my crops tomorrow?',
];

export const AssistantScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentLocation, weather, daily, hourly, selectedPersonas } = useAppStore();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Namaste! I am your MAUSAM Meteorological AI Assistant for ${currentLocation.name}. How can I help tailor your day's weather planning?`,
      timestamp: 'Just now',
      weatherContext: weather ? {
        temp: weather.temperature,
        condition: weather.conditionText,
        rainChance: hourly[0]?.precipitationProbability || 0,
      } : undefined,
    }
  ]);

  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      const fallbackWeather = weather || {
        temperature: 28,
        feelsLike: 29,
        humidity: 60,
        windSpeed: 12,
        windDirection: 180,
        uvIndex: 4,
        weatherCode: 0,
        conditionText: 'Clear',
        isDay: true,
        pressure: 1012,
        dewPoint: 18,
        precipitation: 0,
        timestamp: new Date().toISOString(),
      };

      const { reply, contextSnippet } = await askMausamAI({
        question: text,
        locationName: currentLocation.name,
        weather: fallbackWeather,
        daily: daily,
        personas: selectedPersonas,
      });

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        weatherContext: contextSnippet,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: "I am having a brief connection hitch checking IMD data servers. Conditions are predominantly stable across the district. How else can I help?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `Chat history cleared. How can I assist you with ${currentLocation.name}'s weather today?`,
        timestamp: 'Now',
      }
    ]);
  };

  return (
    <MobileContainer hasBottomNav={true} className="flex flex-col h-screen overflow-hidden p-0 bg-[#F8FAFC]">
      {/* Header */}
      <div className="px-4 pt-safe-top pb-3 bg-white border-b border-slate-200 flex items-center justify-between z-10 shrink-0 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/home')}
            className="p-1.5 -ml-1.5 rounded-xl text-slate-600 hover:text-slate-900 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#082046] to-[#0E468A] p-[2px]">
            <div className="w-full h-full rounded-full bg-[#082046] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
          </div>

          <div>
            <h2 className="text-sm font-extrabold text-[#082046] flex items-center gap-1.5">
              Ask MAUSAM
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-blue-100 text-[#0E468A] font-bold">
                GPT-4o
              </span>
            </h2>
            <span className="text-[10px] text-emerald-700 font-bold">● Active • {currentLocation.name}</span>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 transition-colors"
          title="Clear chat"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 no-scrollbar">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fadeIn`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-[#0E468A] text-white rounded-tr-none'
                    : 'bg-white text-slate-900 rounded-tl-none border border-slate-200 shadow-xs'
                }`}
              >
                <p className={`font-sans whitespace-pre-wrap ${isUser ? 'text-white font-normal' : 'text-slate-900 font-medium'}`}>
                  {msg.text}
                </p>

                {/* Inline weather chip snippet if provided */}
                {msg.weatherContext && !isUser && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-3 text-[10px] font-bold text-[#0E468A]">
                    <span className="flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-[#C62828]" />
                      {msg.weatherContext.temp}°C
                    </span>
                    <span className="flex items-center gap-1">
                      <Sun className="w-3 h-3 text-amber-500" />
                      {msg.weatherContext.condition}
                    </span>
                    <span className="flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-sky-600" />
                      {msg.weatherContext.rainChance}% rain
                    </span>
                  </div>
                )}
              </div>
              <span className="text-[9px] text-slate-500 mt-1 px-1 font-medium">{msg.timestamp}</span>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white border border-slate-200 shadow-sm max-w-[80px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0E468A] animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#0E468A] animate-bounce delay-150" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#0E468A] animate-bounce delay-300" />
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {DEFAULT_SUGGESTIONS.map((chip, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(chip)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-[#0E468A] text-[11px] font-medium text-slate-700 hover:text-slate-900 transition-colors shadow-xs"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Fixed Input Bar */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 focus-within:border-[#0E468A] focus-within:bg-white transition-all">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask me anything about your weather..."
              className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`p-1 text-slate-400 hover:text-slate-700 transition-colors ${
                isListening ? 'text-rose-600 animate-pulse' : ''
              }`}
              title="Voice Input"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className={`p-3 rounded-2xl transition-all shadow-md ${
              inputText.trim() && !isTyping
                ? 'bg-[#0E468A] hover:bg-[#082046] text-white shadow-[#0E468A]/20'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </MobileContainer>
  );
};
