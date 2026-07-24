import { useState, useRef, useEffect, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Loader2, Lightbulb, User, Sparkles, Copy, Check, ChevronDown } from 'lucide-react';
import { aiService } from '../../../services/ai.service';
import styles from './AIAssistantPage.module.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

function renderMarkdown(text: string): string {
  let html = text;
  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="$styles.codeBlock"><code>$2</code></pre>');
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="$styles.inlineCode">$1</code>');
  // Tables
  html = html.replace(/\|(.+)\|/g, (match) => {
    if (match.includes('---')) return '';
    const cells = match.split('|').filter((c: string) => c.trim());
    const cellHtml = cells.map((c: string) => `<td class="$styles.tableCell">${c.trim()}</td>`).join('');
    return `<tr class="$styles.tableRow">${cellHtml}</tr>`;
  });
  // Lists
  html = html.replace(/^- (.+)$/gm, '<li class="$styles.listItem">$1</li>');
  html = html.replace(/(<li class="[^"]*">.*<\/li>\n?)+/g, (match) => `<ul class="$styles.list">${match}</ul>`);
  // Headers
  html = html.replace(/^#### (.+)$/gm, '<h4 class="$styles.h4">$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3 class="$styles.h3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="$styles.h2">$1</h2>');
  // Line breaks
  html = html.replace(/\n\n/g, '<br/><br/>');
  html = html.replace(/\n/g, '<br/>');
  return html;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);
  return (
    <button className={styles.copyBtn} onClick={handleCopy} title="Copy to clipboard">
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  const isTyping = msg.id === 'typing';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`${styles.messageRow} ${isUser ? styles.messageRowUser : ''}`}
    >
      {!isUser && (
        <div className={styles.avatarBot}>
          <Bot size={16} />
        </div>
      )}
      <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleBot}`}>
        {isTyping ? (
          <div className={styles.typingIndicator}>
            <span className={styles.typingDot} />
            <span className={styles.typingDot} />
            <span className={styles.typingDot} />
          </div>
        ) : isUser ? (
          <span className={styles.userText}>{msg.content}</span>
        ) : (
          <div className={styles.botContent}>
            <div
              className={styles.markdown}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
            />
            <CopyButton text={msg.content} />
          </div>
        )}
      </div>
      {isUser && (
        <div className={styles.avatarUser}>
          <User size={14} />
        </div>
      )}
    </motion.div>
  );
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `**Welcome to AutoML AI Assistant!** 👋\n\nI can help you with every step of your machine learning workflow:\n\n- **Algorithm Selection** — "Which model should I choose?"\n- **Debug Low Accuracy** — "Why is my accuracy low?"\n- **SQL Generation** — "Generate SQL for my dataset"\n- **Preprocessing** — "Suggest preprocessing steps"\n- **Confusion Matrix** — "Explain confusion matrix"\n- **Feature Selection** — "Recommend features to remove"\n- **Experiment Summary** — "Summarize my experiments"\n\nAsk me anything — or pick a suggestion below!`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { data: suggestions } = useQuery({
    queryKey: ['ai', 'suggestions'],
    queryFn: () => aiService.suggestions(),
    select: (d) => d.suggestions,
    staleTime: 60_000,
  });

  const chatMutation = useMutation({
    mutationFn: (question: string) => aiService.chat(question),
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== 'typing'),
        { id: `ai_${Date.now()}`, role: 'assistant', content: data.answer, timestamp: Date.now() },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== 'typing'),
        { id: `ai_err_${Date.now()}`, role: 'assistant', content: 'Sorry, something went wrong. Please try again.', timestamp: Date.now() },
      ]);
    },
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleScroll = useCallback(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollBtn(!atBottom);
  }, []);

  const handleSend = (text?: string) => {
    const q = (text || input).trim();
    if (!q || chatMutation.isPending) return;
    setMessages((prev) => [
      ...prev,
      { id: `user_${Date.now()}`, role: 'user', content: q, timestamp: Date.now() },
      { id: 'typing', role: 'assistant', content: '', timestamp: Date.now() },
    ]);
    setInput('');
    chatMutation.mutate(q);
  };

  return (
    <div className={styles.page}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={styles.container}
      >
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className={styles.title}>AI Assistant</h1>
              <p className={styles.subtitle}>Intelligent ML workflow guidance</p>
            </div>
          </div>
        </div>

        <div
          className={styles.chatContainer}
          ref={chatContainerRef}
          onScroll={handleScroll}
        >
          <div className={styles.chatInner}>
            <AnimatePresence mode="popLayout">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {showScrollBtn && (
            <button className={styles.scrollBtn} onClick={() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })}>
              <ChevronDown size={16} />
            </button>
          )}
        </div>

        {suggestions && suggestions.length > 0 && messages.length <= 1 && (
          <div className={styles.suggestionsBar}>
            <Lightbulb size={13} className={styles.suggestionIcon} />
            <span className={styles.suggestionLabel}>Try asking:</span>
            <div className={styles.suggestionChips}>
              {suggestions.map((s: string, i: number) => (
                <button
                  key={i}
                  className={styles.chip}
                  onClick={() => handleSend(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={styles.inputArea}>
          <form
            className={styles.inputForm}
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          >
            <input
              className={styles.inputField}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about models, data, SQL, preprocessing..."
              disabled={chatMutation.isPending}
            />
            <button
              type="submit"
              className={styles.sendBtn}
              disabled={!input.trim() || chatMutation.isPending}
            >
              {chatMutation.isPending ? (
                <Loader2 size={18} className={styles.spin} />
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
