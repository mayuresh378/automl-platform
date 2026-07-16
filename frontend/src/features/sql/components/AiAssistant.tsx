import { useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, Loader2, Lightbulb, AlertTriangle, BarChart3, Clock, Cpu, Copy, Check } from 'lucide-react';
import { cn } from '../../../lib/cn';

interface AiAssistantProps {
  onInsertQuery: (query: string) => void;
  currentQuery?: string;
}

export const AiAssistant = memo(function AiAssistant({ onInsertQuery, currentQuery }: AiAssistantProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; sql?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', content: input }]);
    setLoading(true);
    setInput('');

    setTimeout(() => {
      const nl = input.toLowerCase();
      let sql = '';
      let explanation = '';

      if (nl.includes('average') || nl.includes('avg')) {
        sql = 'SELECT column_name,\n  AVG(value) as average\nFROM data\nGROUP BY column_name\nORDER BY average DESC;';
        explanation = 'This calculates the average value for each group using AVG(), a SQL aggregate function. GROUP BY splits data into groups, and ORDER BY DESC shows highest averages first.';
      } else if (nl.includes('count') || nl.includes('how many')) {
        sql = 'SELECT column_name,\n  COUNT(*) as count\nFROM data\nGROUP BY column_name\nORDER BY count DESC;';
        explanation = 'COUNT(*) counts rows in each group. GROUP BY column_name creates groups. ORDER BY count DESC shows largest groups first.';
      } else if (nl.includes('top') || nl.includes('highest') || nl.includes('maximum')) {
        sql = 'SELECT *\nFROM data\nORDER BY column_name DESC\nLIMIT 10;';
        explanation = 'ORDER BY column_name DESC sorts descending (largest first). LIMIT 10 returns only the first 10 rows — the top 10 records.';
      } else if (nl.includes('sum') || nl.includes('total')) {
        sql = 'SELECT column_name,\n  SUM(value) as total\nFROM data\nGROUP BY column_name\nORDER BY total DESC;';
        explanation = 'SUM() adds up all values in each group. GROUP BY aggregates by unique column values. ORDER BY total DESC shows the highest total first.';
      } else {
        sql = `SELECT *\nFROM data\nWHERE column_name LIKE '%${nl.split(' ').slice(0, 3).join('%')}%'\nLIMIT 100;`;
        explanation = 'This query searches for records matching your description using LIKE with wildcards (%). It returns up to 100 matching rows.';
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: explanation, sql }]);

      const suggestions = [
        'Add indexes on frequently queried columns like `column_name` to improve lookup performance.',
        'Consider partitioning large tables by date ranges for faster scans.',
        'Use columnar storage formats (Parquet) for analytical queries.',
        'Limit results with precise WHERE clauses instead of scanning full tables.',
      ];

      setTimeout(() => {
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: `**Optimization Suggestions:**\n${suggestions.map((s) => `• ${s}`).join('\n')}\n\n**Query Complexity:** O(n) — full table scan\n**Estimated Runtime:** Depends on table size (sub-second for <1M rows)`,
        }]);
        setLoading(false);
      }, 800);
    }, 1200);
  }, [input]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-border flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">AI Assistant</span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3">
        {messages.length === 0 && !loading && (
          <div className="text-center py-6">
            <Sparkles className="w-8 h-8 text-primary/40 mx-auto mb-2" />
            <p className="text-xs text-zinc-500 mb-3">Ask AI to generate SQL from plain English</p>
            <div className="space-y-1.5">
              {[
                'Show average salary by department',
                'Find top 10 highest values',
                'Count records by category',
                'Calculate total sales by month',
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => { setInput(prompt); }}
                  className="w-full text-left px-2.5 py-1.5 rounded-md text-xs text-zinc-400 hover:text-zinc-200 hover:bg-sidebar-hover transition-colors"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('text-xs', msg.role === 'user' ? 'text-right' : 'text-left')}
          >
            <div className={cn(
              'inline-block max-w-[90%] rounded-lg px-3 py-2',
              msg.role === 'user' ? 'bg-primary/20 text-zinc-200' : 'bg-sidebar-hover text-zinc-300',
            )}>
              {msg.content}
            </div>

            {msg.sql && (
              <div className="mt-1.5 text-left">
                <div className="relative group rounded-lg bg-card border border-border p-2.5 font-mono text-[11px] text-emerald-300">
                  <pre className="whitespace-pre-wrap">{msg.sql}</pre>
                  <button
                    onClick={() => copyToClipboard(msg.sql!)}
                    className="absolute top-1.5 right-1.5 p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05] opacity-0 group-hover:opacity-100 transition-all"
                  >
                    {copied === msg.sql ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => onInsertQuery(msg.sql!)}
                    className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded text-[10px] bg-primary/20 text-primary hover:bg-primary/30 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    Insert
                  </button>
                </div>
              </div>
            )}

            {msg.content.includes('Optimization') && (
              <div className="mt-1 flex items-center gap-2 text-[10px] text-zinc-500">
                <Clock className="w-3 h-3" />
                Quick ({'<1s for 1M rows'})
              </div>
            )}
          </motion.div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-zinc-500 py-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Generating...
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Describe the query you need..."
            className="flex-1 h-8 px-2.5 rounded-md bg-white/[0.05] border border-border text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-primary/50"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="h-8 w-8 flex items-center justify-center rounded-md bg-primary text-white disabled:opacity-40 transition-colors hover:bg-primary/90"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
});
