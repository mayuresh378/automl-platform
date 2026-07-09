import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowUp, Wand2 } from 'lucide-react';

interface Message {
  role: 'assistant' | 'user';
  text: string;
}

const SUGGESTIONS = [
  'Which model should I use for churn prediction?',
  'Explain the drop in accuracy on housing-reg-v1',
  'Suggest features to engineer for fraud_signals.csv',
];

const INITIAL_MESSAGES: Message[] = [
  {
    role: 'assistant',
    text: 'I noticed customer_churn.csv has 3 columns with over 15% missing values. Want me to suggest an imputation strategy before training?',
  },
];

export function AIAssistantPanel() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');

  function send(text: string) {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text: "This is a frontend preview — connect the AI assistant endpoint to get real answers here.",
        },
      ]);
    }, 500);
  }

  return (
    <div className="flex flex-col h-full rounded-xl border border-border bg-card/60">
      <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border">
        <div className="flex items-center justify-center h-6 w-6 rounded-md bg-gradient-to-br from-primary to-accent">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-sm font-medium text-zinc-100">AI Assistant</span>
        <span className="ml-auto text-[10px] font-mono text-zinc-600 px-1.5 py-0.5 rounded border border-border">
          preview
        </span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3 space-y-3 min-h-[180px]">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={m.role === 'assistant' ? 'flex gap-2' : 'flex gap-2 justify-end'}
          >
            {m.role === 'assistant' && (
              <div className="h-6 w-6 shrink-0 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            )}
            <div
              className={
                m.role === 'assistant'
                  ? 'text-[13px] leading-relaxed text-zinc-300 bg-white/[0.04] rounded-lg rounded-tl-sm px-3 py-2 max-w-[85%]'
                  : 'text-[13px] leading-relaxed text-white bg-primary/90 rounded-lg rounded-tr-sm px-3 py-2 max-w-[85%]'
              }
            >
              {m.text}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="px-3 pb-2 flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            className="flex items-center gap-1.5 text-[11px] text-zinc-400 border border-border rounded-full px-2.5 py-1 hover:border-border-strong hover:text-zinc-200 transition-colors"
          >
            <Wand2 className="h-2.5 w-2.5" />
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-border px-3 py-2.5"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your data or models…"
          className="flex-1 bg-transparent text-[13px] text-zinc-100 placeholder:text-zinc-600 outline-none"
        />
        <button
          type="submit"
          className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-40"
          disabled={!input.trim()}
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
