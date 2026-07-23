import { useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, Loader2, Lightbulb, AlertTriangle, BarChart3, Clock, Cpu, Copy, Check } from 'lucide-react';
import styles from './AiAssistant.module.css';

interface AiAssistantProps {
  onInsertQuery: (query: string) => void;
  currentQuery?: string;
  columns?: string[];
  dtypes?: Record<string, string>;
}

export const AiAssistant = memo(function AiAssistant({ onInsertQuery, currentQuery, columns = [], dtypes = {} }: AiAssistantProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; sql?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', content: input }]);
    setLoading(true);
    setInput('');

    const firstCol = columns[0] || 'col';
    const numericCols = columns.filter((c) => {
      const t = (dtypes[c] || '').toLowerCase();
      return t.includes('int') || t.includes('float') || t.includes('double');
    });
    const numCol = numericCols[0] || firstCol;
    const strCols = columns.filter((c) => {
      const t = (dtypes[c] || '').toLowerCase();
      return t.includes('varchar') || t.includes('str') || t.includes('text');
    });
    const strCol = strCols[0] || firstCol;

    setTimeout(() => {
      const nl = input.toLowerCase();
      let sql = '';
      let explanation = '';

      if (nl.includes('average') || nl.includes('avg')) {
        sql = `SELECT ${strCol},\n  AVG(${numCol}) as average\nFROM data\nGROUP BY ${strCol}\nORDER BY average DESC;`;
        explanation = `This calculates the average ${numCol} for each ${strCol} group using AVG(). GROUP BY splits data into groups, and ORDER BY DESC shows highest averages first.`;
      } else if (nl.includes('count') || nl.includes('how many')) {
        sql = `SELECT ${strCol},\n  COUNT(*) as count\nFROM data\nGROUP BY ${strCol}\nORDER BY count DESC;`;
        explanation = `COUNT(*) counts rows in each ${strCol} group. GROUP BY creates groups. ORDER BY count DESC shows largest groups first.`;
      } else if (nl.includes('top') || nl.includes('highest') || nl.includes('maximum')) {
        sql = `SELECT *\nFROM data\nORDER BY ${numCol} DESC\nLIMIT 10;`;
        explanation = `ORDER BY ${numCol} DESC sorts descending (largest first). LIMIT 10 returns only the top 10 records.`;
      } else if (nl.includes('sum') || nl.includes('total')) {
        sql = `SELECT ${strCol},\n  SUM(${numCol}) as total\nFROM data\nGROUP BY ${strCol}\nORDER BY total DESC;`;
        explanation = `SUM() adds up ${numCol} in each ${strCol} group. GROUP BY aggregates by unique values. ORDER BY total DESC shows highest total first.`;
      } else {
        const searchTerms = nl.split(' ').filter((w) => w.length > 2).slice(0, 3);
        sql = `SELECT *\nFROM data\nWHERE ${strCol} LIKE '%${searchTerms.join('%')}%'\nLIMIT 100;`;
        explanation = `This query searches for records in ${strCol} matching your description using LIKE with wildcards (%). It returns up to 100 matching rows.`;
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
    <div className={styles.assistant}>
      <div className={styles.header}>
        <Sparkles className={styles.headerIcon} />
        <span className={styles.headerText}>AI Assistant</span>
      </div>

      <div className={styles.messages}>
        {messages.length === 0 && !loading && (
          <div className={styles.emptyState}>
            <Sparkles className={styles.emptyIcon} />
            <p className={styles.emptyText}>Ask AI to generate SQL from plain English</p>
            <div className={styles.suggestions}>
              {[
                'Show average salary by department',
                'Find top 10 highest values',
                'Count records by category',
                'Calculate total sales by month',
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => { setInput(prompt); }}
                  className={styles.suggestion}
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
            className={`${styles.message} ${msg.role === 'user' ? styles.messageUser : styles.messageAssistant}`}
          >
            <div className={`${styles.bubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant}`}>
              {msg.content}
            </div>

            {msg.sql && (
              <div className={styles.sqlBlock}>
                <pre className={styles.sqlPre}>{msg.sql}</pre>
                <div className={styles.sqlActions}>
                  <button
                    onClick={() => copyToClipboard(msg.sql!)}
                    className={`${styles.sqlActionBtn} ${copied === msg.sql ? styles.sqlActionBtnSuccess : ''}`}
                  >
                    {copied === msg.sql ? <Check className={styles.timingIcon} /> : <Copy className={styles.timingIcon} />}
                  </button>
                </div>
                <button
                  onClick={() => onInsertQuery(msg.sql!)}
                  className={styles.insertBtn}
                >
                  Insert
                </button>
              </div>
            )}

            {msg.content.includes('Optimization') && (
              <div className={styles.timingBadge}>
                <Clock className={styles.timingIcon} />
                Quick ({'<1s for 1M rows'})
              </div>
            )}
          </motion.div>
        ))}

        {loading && (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner} />
            Generating...
          </div>
        )}
      </div>

      <div className={styles.inputArea}>
        <div className={styles.inputRow}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Describe the query you need..."
            className={styles.input}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={styles.sendBtn}
          >
            {loading ? <Loader2 className={styles.sendIcon} /> : <Send className={styles.sendIcon} />}
          </button>
        </div>
      </div>
    </div>
  );
});
