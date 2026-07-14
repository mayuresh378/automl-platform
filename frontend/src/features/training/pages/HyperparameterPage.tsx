import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { PageContainer, PageHeader } from '../../../components/layout/PageContainer';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Sliders, Play } from 'lucide-react';

export default function HyperparameterPage() {
  const [algorithm, setAlgorithm] = useState('random_forest');

  return (
    <PageContainer>
      <PageHeader title="HPO Tuning" description="Hyperparameter optimization for better models">
        <Button icon={<Play className="w-4 h-4" />}>Start Tuning</Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Select label="Algorithm" value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} options={[
                { value: 'random_forest', label: 'Random Forest' },
                { value: 'gradient_boost', label: 'Gradient Boosting' },
                { value: 'xgboost', label: 'XGBoost' },
                { value: 'lightgbm', label: 'LightGBM' },
              ]} />
              <Input label="Number of Trials" type="number" defaultValue={50} />
              <Select label="Search Strategy" value='bayesian' onChange={() => {}} options={[
                { value: 'grid', label: 'Grid Search' },
                { value: 'random', label: 'Random Search' },
                { value: 'bayesian', label: 'Bayesian Optimization' },
              ]} />
              <Button className="w-full" icon={<Sliders className="w-4 h-4" />}>Configure Hyperparameters</Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Tuning Results</CardTitle></CardHeader>
            <CardContent>
              <EmptyState icon={<Sliders className="w-8 h-8" />} title="No tuning runs yet" description="Configure hyperparameter search and start tuning" />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
