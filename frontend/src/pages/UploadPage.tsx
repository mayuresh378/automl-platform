import { motion } from 'framer-motion';
import { CloudUpload, FileSpreadsheet, CheckCircle2, Sparkles, DatabaseZap } from 'lucide-react';

function UploadPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-primary/15 p-3 text-primary">
              <CloudUpload className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Intelligent ingestion</p>
              <h2 className="text-2xl font-semibold text-white">Upload & validate datasets</h2>
            </div>
          </div>
          <div className="rounded-[28px] border border-dashed border-primary/30 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 p-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
              <DatabaseZap className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-white">Drop files here or browse your cloud storage</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">CSV, Excel, Parquet, and JSON datasets are supported. Large files are streamed and validated in parallel.</p>
            <button className="mt-6 rounded-2xl bg-white/10 px-4 py-2 font-medium text-white transition hover:bg-white/20">Select files</button>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Recent uploads</p>
              <h3 className="text-lg font-semibold text-white">Cloud-ready datasets</h3>
            </div>
            <Sparkles className="h-5 w-5 text-accent" />
          </div>
          <div className="space-y-3">
            {[
              { name: 'customer_churn.csv', size: '24.8 MB', state: 'Validated' },
              { name: 'marketing_mix.parquet', size: '18.1 MB', state: 'Queued' },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.size}</p>
                  </div>
                </div>
                <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">{item.state}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Quality checks</p>
            <h3 className="text-lg font-semibold text-white">Validation pipeline</h3>
          </div>
          <div className="rounded-2xl bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">98.4% score</div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: 'Schema detected', value: '14 columns' },
            { title: 'Missing values', value: '3.2%' },
            { title: 'Duplicates', value: '0.08%' },
          ].map((card) => (
            <div key={card.title} className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">Passed</span>
              </div>
              <p className="text-sm text-slate-400">{card.title}</p>
              <p className="mt-1 text-xl font-semibold text-white">{card.value}</p>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

export default UploadPage;
