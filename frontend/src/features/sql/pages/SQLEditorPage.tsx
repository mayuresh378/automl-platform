import { useState } from 'react';
import { Play, Download, Database, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { PageContainer, PageHeader } from '../../../components/layout/PageContainer';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { ErrorState } from '../../../components/ui/ErrorState';
import { useNotification } from '../../../hooks/useNotification';

export default function SQLEditorPage() {
  const { notifyError } = useNotification();
  const [query, setQuery] = useState('SELECT * FROM datasets LIMIT 10;');
  const [results, setResults] = useState<any[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const res = await fetch(`/api/v1/sql/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResults(data.results || []);
    } catch (err: any) {
      notifyError('Query failed', err.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <PageContainer maxWidth="xl">
      <PageHeader title="SQL Editor" description="Query your datasets using SQL" />

      <Card padding="none" className="mb-4">
        <div className="border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Database className="w-4 h-4" />
            Query Editor
          </div>
          <Button size="sm" onClick={handleRun} loading={isRunning} icon={<Play className="w-3.5 h-3.5" />}>Run</Button>
        </div>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent p-4 text-sm font-mono text-zinc-200 placeholder:text-zinc-600 resize-none focus:outline-none"
          rows={6}
          placeholder="SELECT * FROM datasets LIMIT 10;"
          spellCheck={false}
        />
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Results ({results.length} rows)</CardTitle>
            <Button size="sm" variant="ghost" icon={<Download className="w-3.5 h-3.5" />}>Export</Button>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {results.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-8">Query returned no results</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {Object.keys(results[0]).map((col) => (
                      <th key={col} className="px-3 py-2 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                      {Object.values(row).map((val: any, j) => (
                        <td key={j} className="px-3 py-2 text-zinc-300 whitespace-nowrap">{val != null ? String(val) : 'NULL'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
