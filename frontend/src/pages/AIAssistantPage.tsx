import { motion } from 'framer-motion';
import { AIAssistantPanel } from '../components/AIAssistantPanel';

function AIAssistantPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="p-6 h-full">
      <div className="mb-6">
        <p className="text-sm text-slate-400">AI-powered insights</p>
        <h2 className="text-2xl font-semibold text-white">AI Assistant</h2>
      </div>
      <div className="h-[calc(100vh-12rem)]">
        <AIAssistantPanel />
      </div>
    </motion.div>
  );
}

export default AIAssistantPage;
