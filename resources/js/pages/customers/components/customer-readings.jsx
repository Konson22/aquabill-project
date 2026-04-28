import { Badge } from '@/components/ui/badge';
import { Droplet, Calendar } from 'lucide-react';

export default function CustomerReadings({ readings }) {
    const formatDate = (value) => {
        if (!value) return '—';
        try {
            return new Date(value).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return String(value);
        }
    };

    if (!readings?.length) {
        return (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground bg-muted/5">
                <Droplet className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
                <p>No meter readings found for this customer.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
            <table className="w-full text-left border-collapse text-sm">
                <thead>
                    <tr className="border-b bg-muted/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3 text-right">Previous (m³)</th>
                        <th className="px-4 py-3 text-right">Current (m³)</th>
                        <th className="px-4 py-3 text-right">Consumption (m³)</th>
                        <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {readings.map((reading) => (
                        <tr key={reading.id} className="hover:bg-muted/10 transition-colors">
                            <td className="px-4 py-3 font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {formatDate(reading.reading_date)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                                {reading.previous_reading ?? '—'}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold">
                                {reading.current_reading ?? '—'}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-black text-primary">
                                {reading.consumption ?? '—'}
                            </td>
                            <td className="px-4 py-3 text-center">
                                {reading.is_initial ? (
                                    <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-600 border-amber-200">Initial</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-200">Regular</Badge>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
