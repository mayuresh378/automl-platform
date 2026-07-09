import { CheckCircle2, XCircle, ArrowUpDown } from 'lucide-react';
import { recentExperiments } from '../lib/mockData';

export function ExperimentsTable() {
  return (
    <div className="rounded-xl border border-border bg-card/60 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
        <span className="text-sm font-medium text-zinc-100">Recent experiments</span>
        <button className="text-[11px] text-primary hover:text-primary/80 transition-colors">View all</button>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] text-zinc-600 border-b border-border">
              <th className="font-medium px-4 py-2.5">
                <span className="inline-flex items-center gap-1">Run <ArrowUpDown className="h-2.5 w-2.5" /></span>
              </th>
              <th className="font-medium px-4 py-2.5">Model</th>
              <th className="font-medium px-4 py-2.5">Accuracy</th>
              <th className="font-medium px-4 py-2.5">F1</th>
              <th className="font-medium px-4 py-2.5">When</th>
              <th className="font-medium px-4 py-2.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentExperiments.map((exp) => (
              <tr key={exp.id} className="border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-2.5 text-[13px] text-zinc-200 font-medium whitespace-nowrap">{exp.name}</td>
                <td className="px-4 py-2.5 text-[13px] text-zinc-400 whitespace-nowrap">{exp.model}</td>
                <td className="px-4 py-2.5 text-[13px] font-mono text-zinc-300">
                  {exp.status === 'success' ? `${(exp.accuracy * 100).toFixed(1)}%` : '—'}
                </td>
                <td className="px-4 py-2.5 text-[13px] font-mono text-zinc-300">
                  {exp.status === 'success' ? exp.f1.toFixed(3) : '—'}
                </td>
                <td className="px-4 py-2.5 text-[13px] text-zinc-500 whitespace-nowrap">{exp.runAt}</td>
                <td className="px-4 py-2.5 text-right">
                  {exp.status === 'success' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-success">
                      <CheckCircle2 className="h-3 w-3" /> Success
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-danger">
                      <XCircle className="h-3 w-3" /> Failed
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
