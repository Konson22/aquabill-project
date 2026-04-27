import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Activity } from 'lucide-react';

export default function WaterUsageReport() {
  return (
    <AppLayout breadcrumbs={[{ title: 'Water Usage Report', href: '/reports/water-usage' }]}>
      <Head title="Water Usage Report" />
      <div className="flex h-full flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-500" />
              Water Usage Report
            </h1>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
