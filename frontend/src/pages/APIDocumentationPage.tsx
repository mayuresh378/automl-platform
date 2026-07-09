import { motion } from 'framer-motion';
import { Code, Copy, ExternalLink, Lock } from 'lucide-react';

function APIDocumentationPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Developer reference</p>
            <h2 className="text-2xl font-semibold text-white">REST API documentation</h2>
          </div>
          <a href="#" className="inline-flex items-center gap-2 rounded-2xl bg-primary/20 px-4 py-2 text-sm font-medium text-white">
            View full docs <ExternalLink className="h-4 w-4" />
          </a>
        </div>
        <div className="space-y-4">
          {[
            { method: 'POST', path: '/api/v1/datasets', desc: 'Upload a new dataset' },
            { method: 'GET', path: '/api/v1/models', desc: 'List all trained models' },
            { method: 'POST', path: '/api/v1/predictions', desc: 'Make a prediction' },
            { method: 'POST', path: '/api/v1/training', desc: 'Start a training job' },
          ].map((endpoint) => (
            <div key={endpoint.path} className="rounded-[28px] border border-white/10 bg-white/5 p-4 font-mono text-sm">
              <div className="mb-2 flex items-center gap-2">
                <span className={`inline-block w-12 rounded text-center py-1 font-semibold ${
                  endpoint.method === 'POST' ? 'bg-primary/20 text-primary' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {endpoint.method}
                </span>
                <code className="flex-1 text-slate-300">{endpoint.path}</code>
                <button className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:bg-white/10">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p className="text-slate-400">{endpoint.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Authentication</p>
              <h3 className="text-lg font-semibold text-white">API keys</h3>
            </div>
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-3">
            {['prod-key-2024', 'staging-key-2024', 'dev-key-2024'].map((key) => (
              <div key={key} className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-300">
                <div className="flex items-center justify-between">
                  <code className="font-mono">{key}</code>
                  <button className="rounded-lg bg-white/10 px-2 py-1 text-xs text-white">Revoke</button>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">
            Generate new key
          </button>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Resources</p>
              <h3 className="text-lg font-semibold text-white">Learning materials</h3>
            </div>
            <Code className="h-5 w-5 text-accent" />
          </div>
          <div className="space-y-2">
            {['Getting started', 'Python SDK', 'JavaScript SDK', 'Postman collection'].map((resource) => (
              <a key={resource} href="#" className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10">
                <span>{resource}</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}

export default APIDocumentationPage;
