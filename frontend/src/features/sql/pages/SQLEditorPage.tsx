import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Play, Download, Database, AlertCircle, Table as TableIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { PageContainer, PageHeader } from '../../../components/layout/PageContainer';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { ErrorState } from '../../../components/ui/ErrorState';
import { useNotification } from '../../../hooks/useNotification';
import { datasetsService } from '../../../services/datasets.service';
import { http, downloadBlob } from '../../../services/http';

export default function SQLEditorPage() {
  const { notifyError, notifySuccess } = useNotification();
  const [query, setQuery] = useState('SELECT * FROM datasets LIMIT 10;');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [results, setResults] = useState<{ columns: string[]; rows: number; data: Record<string, any>[] } | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const { data: datasets } = useQuery({
    queryKey: ['datasets'],
    queryFn: () => datasetsService.list(),
    select: (d: any) => d.datasets,
  });

  const handleRun = useCallback(async () => {
    if (!query.trim()) return;
    setIsRunning(true);
    setResults(null);
    try {
      const form = new FormData();
      form.append('query', query.trim());
      if (selectedDataset) form.append('dataset', selectedDataset);
      const data = await http.post('/query', form);
      setResults(data);
      notifySuccess('Query completed', `${data.rows} row(s) returned`);
    } catch (err: any) {
      notifyError('Query failed', err.message);
    } finally {
      setIsRunning(false);
    }
  }, [query, selectedDataset, notifySuccess, notifyError]);

  const handleExport = useCallback(() => {
    if (!results?.data?.length) return;
    const filename = `sql_export_${Date.now()}.csv`;
    downloadBlob(results.data, filename);
  }, [results]);

  return (
    <PageContainer maxWidth="xl">
      <PageHeader title="SQL Editor" description="Query your datasets using SQL" />

      <Card padding="none" className="mb-4">
        <div className="border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Database className="w-4 h-4" />
            Query Editor
          </div>
          <div className="flex items-center gap-3">
            <Select
              placeholder="All datasets"
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              options={(datasets || []).map((d: any) => ({ value: d.name || d.filename, label: d.filename || d.name }))}
              className="w-48"
            />
            <Button size="sm" onClick={handleRun} loading={isRunning} icon={<Play className="w-3.5 h-3.5" />}>Run</Button>
          </div>
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

      {isRunning && (
        <Card>
          <CardContent>
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-zinc-500">
              <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
              Running query...
            </div>
          </CardContent>
        </Card>
      )}

      {results && !isRunning && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-zinc-400" />
              <CardTitle>Results ({results.rows} row{results.rows !== 1 ? 's' : ''})</CardTitle>
            </div>
            {results.data?.length > 0 && (
              <Button size="sm" variant="ghost" onClick={handleExport} icon={<Download className="w-3.5 h-3.5" />}>Export CSV</Button>
            )}
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {!results.data?.length ? (
              <p className="text-sm text-zinc-500 text-center py-8">Query returned no results</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {results.columns.map((col) => (
                      <th key={col} className="px-3 py-2 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.data.map((row: any, i: number) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                      {results.columns.map((col: string) => (
                        <td key={col} className="px-3 py-2 text-zinc-300 whitespace-nowrap font-mono text-xs">
                          {row[col] != null ? String(row[col]) : <span className="text-zinc-600 italic">NULL</span>}
                        </td>
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