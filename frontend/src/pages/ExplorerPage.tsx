import { motion } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, BarChart3, ScanSearch } from 'lucide-react';

function ExplorerPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-slate-400">Dataset profiling</p>
            <h2 className="text-2xl font-semibold text-white">Explore columns, distributions, and quality signals</h2>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
              <Search className="h-4 w-4" />
              <input className="bg-transparent outline-none" placeholder="Search column" />
            </label>
            <button className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-slate-300"><Filter className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: 'Data quality score', value: '94.2' },
            { title: 'Missing values', value: '3.2%' },
            { title: 'Outliers flagged', value: '8' },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">{item.title}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Preview</p>
              <h3 className="text-lg font-semibold text-white">Interactive data table</h3>
            </div>
            <button className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-slate-300"><SlidersHorizontal className="h-4 w-4" /></button>
          </div>
          <div className="overflow-hidden rounded-3xl border border-white/10">
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead className="bg-white/5 text-left text-slate-400">
                <tr>
                  <th className="px-4 py-3">Customer ID</th>
                  <th className="px-4 py-3">Age</th>
                  <th className="px-4 py-3">Region</th>
                  <th className="px-4 py-3">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-slate-300">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="hover:bg-white/5">
                    <td className="px-4 py-3">C-1024{idx}</td>
                    <td className="px-4 py-3">{32 + idx}</td>
                    <td className="px-4 py-3">North</td>
                    <td className="px-4 py-3">${(1200 + idx * 180).toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Insights</p>
              <h3 className="text-lg font-semibold text-white">Visual profiling</h3>
            </div>
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-300">
                <ScanSearch className="h-4 w-4 text-accent" />
                Correlation matrix
              </div>
              <div className="h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10" />
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Feature distribution</p>
              <p className="mt-2 text-xl font-semibold text-white">Revenue skewness detected</p>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

export default ExplorerPage;
