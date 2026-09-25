import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { en: 'How do I treat Fall Armyworm?', ny: 'Ndingatani kuti ndithane ndi Fall Armyworm?' },
  { en: 'When should I plant maize?', ny: 'Nthawi iti yoyenera kuponya chimanga?' },
  { en: 'Best fertilizer for tomatoes?', ny: 'Foteleza yabwino ya matimati ndi itani?' },
  { en: 'How to save water during drought?', ny: 'Ndingatani kuti ndilipire madzi pa dzaza?' },
];

export default function AIAssistant() {
  const { t, language } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: t(
        "Hello! I'm your AI farming assistant. I can help you with crop management, pest control, fertilizer advice, weather guidance, and more. Ask me anything about farming!",
        "Moni!_ndine wothandizira wanu wa AI wa ulimi. Ndingakuthandizeninso pa nkhaza za zomera, kuthana ndi tizilombo, malangizo a foteleza, nyengo, ndi zina. Funsani china chilichonse cha ulimi!"
      ),
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const assistantId = (Date.now() + 1).toString();
    const history = [...messages, userMessage]
      .filter(m => m.id !== '1')
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch('/api/farm-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, language }),
      });

      if (!response.ok || !response.body) {
        const detail = await response.text().catch(() => '');
        throw new Error(detail || `Request failed (${response.status})`);
      }

      setMessages(prev => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '', timestamp: new Date() },
      ]);
      setLoading(false);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let answer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages(prev =>
          prev.map(m => (m.id === assistantId ? { ...m, content: answer } : m))
        );
      }

      if (!answer.trim()) {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: t('No answer came back. Please ask again.', 'Palibe yankho lomwe labwera. Chonde funsaninso.') }
              : m
          )
        );
      }
    } catch (error) {
      console.error('[AIAssistant] chat failed:', error);
      const detail = error instanceof Error ? error.message : '';
      setMessages(prev => [
        ...prev.filter(m => m.id !== assistantId),
        {
          id: assistantId,
          role: 'assistant',
          content: `${t('Sorry, I could not answer just now.', 'Pepani, sindingathe kuyankha pano.')}${detail ? ` (${detail})` : ''}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
            <Bot className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{t('AI Farming Assistant', 'Wothandizira wa AI wa Ulimi')}</h1>
            <p className="text-sm text-gray-500">{t('Ask anything about farming', 'Funsani chilichonse cha ulimi')}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-violet-600" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-900 rounded-bl-md'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm">{message.content}</p>
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary-600" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
              <Bot className="w-5 h-5 text-violet-600" />
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-2 overflow-x-auto pb-3 mb-3 scrollbar-hide">
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleQuickPrompt(language === 'ny' ? prompt.ny : prompt.en)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full bg-gray-100 text-sm text-gray-700 hover:bg-gray-200 transition-colors"
            >
              {language === 'ny' ? prompt.ny : prompt.en}
            </button>
          ))}
        </div>

        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('Ask me anything about farming...', 'Funsani china chilichonse cha ulimi...')}
            className="input flex-1"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="btn-primary"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
