import { activityFeed } from '../lib/mockData';

export function ActivityTimeline() {
  return (
    <div className="rounded-xl border border-border bg-card/60">
      <div className="px-4 py-3.5 border-b border-border">
        <span className="text-sm font-medium text-zinc-100">Activity</span>
      </div>
      <div className="px-4 py-3.5">
        <ol className="relative border-l border-border ml-1.5 space-y-4">
          {activityFeed.map((item) => (
            <li key={item.id} className="pl-4 relative">
              <span className="absolute -left-[4.5px] top-1.5 h-2 w-2 rounded-full bg-primary ring-4 ring-card" />
              <p className="text-[13px] text-zinc-300 leading-snug">
                <span className="font-medium text-zinc-100">{item.actor}</span>{' '}
                {item.action}{' '}
                <span className="text-zinc-200">{item.target}</span>
              </p>
              <span className="text-[11px] text-zinc-600">{item.time}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
