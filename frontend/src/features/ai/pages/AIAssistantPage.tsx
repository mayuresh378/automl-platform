import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Loader2, Lightbulb, User } from 'lucide-react';
import { aiService } from '../../../services/ai.service';
import { Card } from '../../../components/ui/Card';
import { PageContainer, PageHeader } from '../../../components/layout/PageContainer';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { ErrorState } from '../../../components/ui/ErrorState';
import { useNotification } from '../../../hooks/useNotification';
import { getErrorMessage } from '../../../services/http';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function AIAssistantPage() {
  const { notifyError } = useNotification();
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant', content: 'Hello! I can help you with AutoML tasks, answer questions about your models, suggest improvements, and more. How can I assist you today?', timestamp: Date.now() },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: suggestions } = useQuery({
    queryKey: ['ai', 'suggestions'],
    queryFn: () => aiService.suggestions(),
    select: (d) => d.suggestions,
    staleTime: 60_000,
  });

  const chatMutation = useMutation({
    mutationFn: (question: string) => aiService.chat(question),
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { id: `ai_${Date.now()}`, role: 'assistant', content: data.answer, timestamp: Date.now() }]);
    },
    onError: (err) => {
      notifyError('Failed to get response', getErrorMessage(err));
      setMessages((prev) => prev.filter((m) => m.id !== 'typing'));
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const q = input.trim();
    if (!q || chatMutation.isPending) return;
    setMessages((prev) => [...prev, { id: `user_${Date.now()}`, role: 'user', content: q, timestamp: Date.now() }, { id: 'typing', role: 'assistant', content: '...', timestamp: Date.now() }]);
    setInput('');
    chatMutation.mutate(q);
  };

  return (
    <PageContainer maxWidth="lg">
      <PageHeader title="AI Assistant" description="Ask questions and get intelligent suggestions" />

      <Card padding="none" className="flex flex-col h-[65vh]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                  <div className={`rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white/5 text-zinc-200'}`}>
                    {msg.id === 'typing' ? (
                      <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Thinking...</span>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
                {msg.role === 'user' && msg.id !== 'typing' && (
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-zinc-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {suggestions && suggestions.length > 0 && messages.length === 1 && (
          <div className="px-4 pb-4">
            <p className="text-xs text-zinc-500 mb-2 flex items-center gap-1"><Lightbulb className="w-3 h-3" /> Suggestions</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s: string, i: number) => (
                <button
                  key={i}
                  onClick={() => { setInput(s); }}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-zinc-200 transition-colors border border-white/5"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-white/10 p-4">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your ML workflow..."
              className="flex-1"
            />
            <Button type="submit" loading={chatMutation.isPending} disabled={!input.trim()} icon={<Send className="w-4 h-4" />}>
              Send
            </Button>
          </form>
        </div>
      </Card>
    </PageContainer>
  );
}
