import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, StopCircle, Trash2, Download, Info, Mic, MicOff, Paperclip, Image as ImageIcon, Brain, Zap, FileText, HelpCircle, Lightbulb, Volume2, VolumeX, Loader2, Copy, Check } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { ChatSession, Message } from '../types';
import { extractTextFromPDF } from '../lib/pdf';
import { useVoice } from '../hooks/useVoice';

interface ChatAreaProps {
  session: ChatSession;
  isGenerating: boolean;
  currentResponse: string;
  onSend: (content: string, image?: string) => void;
  onStop: () => void;
  onClear: () => void;
  onExport: () => void;
  onContextUpdate: (context: string) => void;
  modelName?: string;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  session,
  isGenerating,
  currentResponse,
  onSend,
  onStop,
  onClear,
  onExport,
  onContextUpdate,
  modelName = "GEMINI 3.1 FLASH LITE",
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { speak, stop: stopVoice, isSpeaking, currentText: speakingText } = useVoice();

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }
  }, []);

  const toggleVoiceInput = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start recognition', err);
      }
    }
  }, [isListening]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      setIsExtracting(true);
      const result = await extractTextFromPDF(file);
      setIsExtracting(false);
      
      if (result.error) {
        onSend(`[System Error] I tried to process "${file.name}" but encountered an issue: ${result.error}`);
      } else {
        onContextUpdate(result.text);
        onSend(`I've uploaded a PDF titled "${file.name}" (${result.pageCount} pages). Please analyze its content and help me understand the key concepts.`);
      }
    } else {
      onSend(`[System Error] Aura currently only supports PDF files for document analysis. Please upload a PDF.`);
    }
    // Reset input
    e.target.value = '';
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        fileInputRef.current?.click();
      }
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        toggleVoiceInput();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleVoiceInput]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session.messages, currentResponse]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !selectedImage) || isGenerating) return;
    onSend(input, selectedImage || undefined);
    setInput('');
    setSelectedImage(null);
  };

  const quickActions = [
    { icon: <Zap size={18} />, title: 'Explain Quantum Physics', subtitle: 'BEGINNER STYLE' },
    { icon: <FileText size={18} />, title: 'Summarize my PDF', subtitle: 'HIGH-YIELD ONLY' },
    { icon: <HelpCircle size={18} />, title: 'Test my knowledge', subtitle: 'INTERACTIVE QUIZ' },
    { icon: <Lightbulb size={18} />, title: 'Create an analogy', subtitle: 'FOR TCP/IP' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth">
        {session.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 max-w-4xl mx-auto">
            <div className="w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-center text-zinc-800 mb-8 shadow-sm">
              <Brain size={32} />
            </div>
            
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-4xl font-serif font-medium text-zinc-900">How can I help you learn today?</h2>
              <p className="text-zinc-400 max-w-lg mx-auto text-sm leading-relaxed">
                Upload your notes, ask about a complex topic, or enter Exam Mode for a quick revision.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => onSend(action.title)}
                  className="flex flex-col items-start p-6 bg-white border border-zinc-100 rounded-2xl hover:border-zinc-200 hover:shadow-md transition-all text-left group"
                >
                  <div className="text-zinc-400 group-hover:text-zinc-900 transition-colors mb-4">
                    {action.icon}
                  </div>
                  <div className="font-bold text-zinc-900 mb-1">{action.title}</div>
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{action.subtitle}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
            <div className="max-w-3xl mx-auto w-full py-8">
              {session.messages.map((msg) => (
                <div key={msg.id} className="group relative">
                  <MessageBubble role={msg.role} content={msg.content} />
                  {msg.role === 'assistant' && (
                    <div className="absolute -right-10 top-2 flex flex-col gap-1">
                      <button 
                        onClick={() => isSpeaking && speakingText === msg.content ? stopVoice() : speak(msg.content)}
                        className={`p-2 transition-all rounded-full hover:bg-zinc-100 ${
                          isSpeaking && speakingText === msg.content ? 'text-emerald-500 opacity-100' : 'text-zinc-300 hover:text-zinc-900 opacity-0 group-hover:opacity-100'
                        }`}
                        title={isSpeaking && speakingText === msg.content ? "Stop reading" : "Read aloud"}
                      >
                        {isSpeaking && speakingText === msg.content ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </button>
                      <button 
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className={`p-2 transition-all rounded-full hover:bg-zinc-100 ${
                          copiedId === msg.id ? 'text-emerald-500 opacity-100' : 'text-zinc-300 hover:text-zinc-900 opacity-0 group-hover:opacity-100'
                        }`}
                        title="Copy to clipboard"
                      >
                        {copiedId === msg.id ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            {isGenerating && currentResponse && (
              <MessageBubble role="assistant" content={currentResponse} isStreaming />
            )}
          </div>
        )}
      </div>

      <div className="p-6 shrink-0">
        <div className="max-w-3xl mx-auto">
          {selectedImage && (
            <div className="mb-4 relative inline-block">
              <img src={selectedImage} alt="Selected" className="h-20 w-20 object-cover rounded-xl border border-zinc-100" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-zinc-900 text-white rounded-full p-1 shadow-lg"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="relative flex items-center bg-zinc-50 border border-zinc-100 rounded-full px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-zinc-900/5 transition-all">
            <div className="flex items-center gap-2 mr-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".pdf" 
                className="hidden" 
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors"
                title="Upload PDF (Ctrl+P)"
              >
                {isExtracting ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
              </button>
              
              <input 
                type="file" 
                ref={imageInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <button 
                type="button" 
                onClick={() => imageInputRef.current?.click()}
                className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors"
                title="Upload Image"
              >
                <ImageIcon size={20} />
              </button>
            </div>
            
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Ask Aura anything..."
              className="flex-1 bg-transparent border-none focus:outline-none text-zinc-800 py-2 text-sm"
            />

            <div className="flex items-center gap-2 ml-2">
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-zinc-400 hover:text-zinc-600'}`}
                title="Voice Input (Ctrl+M)"
              >
                <Mic size={20} />
              </button>
              <button
                type="submit"
                disabled={(!input.trim() && !selectedImage) || isGenerating}
                className="p-2 bg-zinc-400 text-white rounded-xl hover:bg-zinc-900 transition-all disabled:opacity-30"
              >
                <Send size={20} />
              </button>
            </div>
          </form>

          <footer className="mt-6 flex items-center justify-center gap-6 text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              LOCAL ONLY
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
              {modelName}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
              AURA ENGINE
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
