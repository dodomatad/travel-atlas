'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, MapPin, Calendar, Clock, DollarSign, RefreshCw, CheckCircle, Compass } from 'lucide-react';
import type { TripItinerary, AIResponse } from '@/lib/ai/schemas';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contextCountry?: string | null;
  onApplyItinerary?: (itinerary: TripItinerary) => void;
  onFlyToCoordinates?: (coords: { lat: number; lng: number }) => void;
}

interface ChatMessage {
  id: string;
  sender: 'USER' | 'AI';
  text: string;
  itinerary?: TripItinerary;
  questions?: string[];
  timestamp: string;
}

export default function AIAssistantPanel({ 
  isOpen, 
  onClose, 
  contextCountry, 
  onApplyItinerary,
  onFlyToCoordinates 
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mensagem inicial de boas-vindas
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'AI',
          text: contextCountry 
            ? `Olá! Sou o seu Agente de Inteligência Turística. Notei que você está explorando **${contextCountry}**. Como posso ajudar? Posso detalhar a melhor época, requisitos de visto, gastronomia ou montar um roteiro personalizado completo.`
            : 'Olá! Sou o seu **Travel Intelligence Agent**. Para onde você sonha viajar? Diga-me o destino e a quantidade de dias que montarei o seu roteiro completo!',
          questions: contextCountry 
            ? [`Qual a melhor época para visitar ${contextCountry}?`, `Monte um roteiro de 7 dias em ${contextCountry}`, `Como funciona o transporte em ${contextCountry}?`]
            : ['Monte uma viagem de 7 dias na Itália', 'Qual a melhor época para o Japão?', 'Roteiro econômico na França'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }
  }, [contextCountry]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'USER',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          context: {
            selectedCountry: contextCountry || undefined,
          },
        }),
      });

      const data: AIResponse = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'AI',
        text: data.message,
        itinerary: data.itinerary,
        questions: data.questionsForUser?.length ? data.questionsForUser : undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'AI',
          text: 'Desculpe, ocorreu uma instabilidade na comunicação com o motor de inteligência. Por favor, tente novamente.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 top-12 sm:inset-y-4 sm:right-4 sm:left-auto sm:w-[420px] sm:max-w-[calc(100vw-32px)] bg-[#050515]/98 sm:bg-[#050515]/95 backdrop-blur-3xl border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-fade-in text-white font-sans">
      
      {/* Header */}
      <div className="p-3.5 sm:p-4 border-b border-white/10 flex flex-col bg-black/40">
        <div className="sm:hidden w-10 h-1 bg-white/30 rounded-full mx-auto mb-2.5" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <img 
              src="/logo.png" 
              alt="Travel Globe Logo" 
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover shadow-lg border border-white/20 shadow-blue-500/20" 
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-black tracking-wider uppercase">Travel Intelligence</h3>
                <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Llama
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-gray-400">
                {contextCountry ? `Contexto ativo: ${contextCountry}` : 'Agente Autônomo de Viagens'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Fechar assistente"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
        {messages.map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}>
            <div className={`flex gap-2 max-w-[88%] ${msg.sender === 'USER' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                msg.sender === 'USER' ? 'bg-blue-600' : 'bg-gradient-to-tr from-purple-600 to-blue-600'
              }`}>
                {msg.sender === 'USER' ? <User size={12} /> : <Sparkles size={12} />}
              </div>

              <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'USER' 
                  ? 'bg-blue-600/90 text-white rounded-tr-none' 
                  : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
              }`}>
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Card de Itinerário Gerado */}
                {msg.itinerary && (
                  <div className="mt-3 p-3 bg-black/40 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <h4 className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                        <Compass size={14} /> {msg.itinerary.destination}
                      </h4>
                      <span className="text-[10px] text-gray-400">
                        {msg.itinerary.days.length} dias
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {msg.itinerary.days.map(d => (
                        <div key={d.dayNumber} className="text-[10px] bg-white/5 p-2 rounded-lg">
                          <span className="font-bold text-blue-400">Dia {d.dayNumber}: {d.theme || d.city}</span>
                          <ul className="mt-1 space-y-0.5 text-gray-300">
                            {d.activities.map((a, i) => (
                              <li key={i} className="flex items-center justify-between">
                                <span>• {a.startTime} - {a.title}</span>
                                {a.coordinates && onFlyToCoordinates && (
                                  <button 
                                    onClick={() => onFlyToCoordinates(a.coordinates)}
                                    className="text-[8px] text-blue-400 hover:underline flex items-center gap-0.5"
                                  >
                                    <MapPin size={8} /> Ver no Globo
                                  </button>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {onApplyItinerary && (
                      <button
                        onClick={() => onApplyItinerary(msg.itinerary!)}
                        className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 text-white shadow-lg shadow-emerald-600/30"
                      >
                        <CheckCircle size={14} /> Adicionar ao Roteiro Oficial
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sugestões de perguntas rápidas */}
            {msg.questions && msg.questions.length > 0 && (
              <div className="mt-2 ml-8 flex flex-wrap gap-1.5">
                {msg.questions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    disabled={loading}
                    className="text-[10px] px-2.5 py-1 bg-white/5 hover:bg-blue-600/30 border border-white/10 hover:border-blue-500/40 rounded-full text-gray-300 hover:text-white transition-all text-left"
                  >
                    💬 {q}
                  </button>
                ))}
              </div>
            )}

            <span className="text-[9px] text-gray-500 mt-1 px-8">
              {msg.timestamp}
            </span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-gray-400 ml-8 bg-white/5 p-2.5 rounded-xl border border-white/5 w-fit">
            <RefreshCw size={14} className="animate-spin text-blue-400" />
            <span>Consultando Llama e orquestrando dados turísticos...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 bg-black/60 border-t border-white/10 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
          placeholder={contextCountry ? `Pergunte sobre ${contextCountry}...` : "Ex: Monte um roteiro de 5 dias na Grécia..."}
          disabled={loading}
          className="flex-1 bg-white/5 border border-white/10 focus:border-blue-500/60 rounded-xl px-3.5 py-2.5 text-sm sm:text-xs text-white placeholder-gray-500 outline-none transition-colors"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!input.trim() || loading}
          className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-white transition-all shadow-lg shadow-blue-600/30"
          title="Enviar mensagem"
        >
          <Send size={14} />
        </button>
      </div>

    </div>
  );
}
