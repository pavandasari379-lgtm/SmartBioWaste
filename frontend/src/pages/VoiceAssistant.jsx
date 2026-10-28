import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';
import BinBadge from '../components/BinBadge';

export default function VoiceAssistant() {
  const { language, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "Hello! I am your AI Bio-Safety Assistant. Ask me where to discard hospital waste items, PPE requirements, or emergency spill protocols.",
      source: "Rule Engine & Verified Knowledge Base"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'ta' ? 'ta-IN' : (language === 'hi' ? 'hi-IN' : 'en-US');

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (e) => {
        console.error("Speech recognition error:", e);
        setIsListening(false);
      };
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleSend(transcript);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please type your query in the text box.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.lang = language === 'ta' ? 'ta-IN' : (language === 'hi' ? 'hi-IN' : 'en-US');
      recognitionRef.current.start();
    }
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'ta' ? 'ta-IN' : (language === 'hi' ? 'hi-IN' : 'en-US');
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (customQuery) => {
    const textToSend = (customQuery || query).trim();
    if (!textToSend || loading) return;

    // Add user message
    const userMsg = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const resp = await api.sendVoiceQuery(textToSend, language);
      const assistantMsg = {
        sender: 'assistant',
        text: resp.response_text,
        category: resp.detected_category,
        bin: resp.recommended_bin,
        safety: resp.safety_summary,
        source: resp.source
      };
      setMessages(prev => [...prev, assistantMsg]);
      speakText(resp.response_text);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: "I experienced an error connecting to the bio-safety rule engine. Please try again.",
          error: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Grounded In Regulatory Guidelines & Rule Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {t('voice.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          {t('voice.subtitle')}
        </p>
      </div>

      {/* Chat / Interaction Box */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col h-[520px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 items-start ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-emerald-500 text-white font-medium rounded-tr-none'
                    : 'bg-slate-800/80 border border-slate-750 text-slate-200 rounded-tl-none space-y-2'
                }`}
              >
                <p>{m.text}</p>

                {m.bin && (
                  <div className="pt-2 border-t border-slate-750 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-semibold">Destination:</span>
                    <BinBadge bin={m.bin} size="sm" />
                  </div>
                )}

                {m.safety && (
                  <p className="text-[11px] text-emerald-400 font-medium bg-emerald-950/20 p-2 rounded-lg">
                    {m.safety}
                  </p>
                )}

                {m.source && (
                  <span className="block text-[10px] text-slate-400 italic">
                    Source: {m.source}
                  </span>
                )}
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Consulting Bio-Safety Rule Engine & Knowledge Base...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-3 border-t border-slate-800 space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-2xl border transition-all ${
                isListening
                  ? 'bg-red-500 text-white border-red-400 animate-pulse shadow-lg shadow-red-500/30'
                  : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700 hover:bg-slate-750'
              }`}
              title={isListening ? 'Stop Listening' : 'Speak to Assistant'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isListening ? t('voice.listening') : t('voice.placeholder')}
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition placeholder-slate-500"
            />

            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="p-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white shadow-lg shadow-emerald-500/20 transition"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          {/* Prompt Suggestions */}
          <div className="flex items-center gap-2 overflow-x-auto text-[11px] pb-1">
            <span className="text-slate-400 shrink-0 font-medium">Quick Prompts:</span>
            {[
              t('voice.sample1'),
              t('voice.sample2'),
              t('voice.sample3'),
              t('voice.sample4')
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(p)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white shrink-0 transition"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
