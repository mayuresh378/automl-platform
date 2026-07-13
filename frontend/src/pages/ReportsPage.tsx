import { motion } from 'framer-motion';
import { FileText, BarChart3, Download } from 'lucide-react';
import { Button } from '../components/Button';
import { staggerContainer, staggerItem } from '../lib/animations';

function ReportsPage() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.section variants={staggerItem} className="card-hover rounded-[32px] border border-white/10 bg-[#111827]/80 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Reporting</p>
            <h2 className="text-2xl font-semibold text-white">Generate polished ML reports for stakeholders</h2>
          </div>
          <Button>Export report</Button>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_0.75fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-200">
              <BarChart3 className="h-4 w-4 text-primary" />
              Performance summary
            </div>
            <div className="h-48 rounded-[24px] border border-white/10 bg-gradient-to-br from-primary/10 to-accent/10" />
          </div>
          <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-accent/10 to-primary/10 p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-200">
              <FileText className="h-4 w-4 text-accent" />
              Export formats
            </div>
            <div className="space-y-3">
              {['PDF executive summary', 'CSV metrics export', 'Excel workbook', 'PNG charts'].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-sm text-slate-300">
                  <span>{item}</span>
                  <Download className="h-4 w-4 text-white" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}

export default ReportsPage;
