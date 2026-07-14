import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { PageContainer, PageHeader } from '../../../components/layout/PageContainer';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Cpu, Play, Settings } from 'lucide-react';

export default function AutomlEnginePage() {
  const [targetMetric, setTargetMetric] = useState('accuracy');

  return (
    <PageContainer>
      <PageHeader title="AutoML Engine" description="Automated machine learning with intelligent optimization">
        <Button icon={<Play className="w-4 h-4" />}>Run AutoML</Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Select label="Target Metric" value={targetMetric} onChange={(e) => setTargetMetric(e.target.value)} options={[
                { value: 'accuracy', label: 'Accuracy' },
                { value: 'f1', label: 'F1 Score' },
                { value: 'precision', label: 'Precision' },
                { value: 'recall', label: 'Recall' },
                { value: 'rmse', label: 'RMSE' },
              ]} />
              <Input label="Max Models" type="number" defaultValue={20} />
              <Input label="Time Limit (minutes)" type="number" defaultValue={60} />
              <Select label="Optimization Mode" value='quality' onChange={() => {}} options={[
                { value: 'quality', label: 'Quality (Best Model)' },
                { value: 'balanced', label: 'Balanced' },
                { value: 'speed', label: 'Speed (Fastest)' },
              ]} />
              <Button className="w-full" icon={<Cpu className="w-4 h-4" />}>Start AutoML Run</Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Engine Status</CardTitle></CardHeader>
            <CardContent>
              <EmptyState icon={<Settings className="w-8 h-8" />} title="No runs yet" description="Configure and start an AutoML run to see results here" />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
