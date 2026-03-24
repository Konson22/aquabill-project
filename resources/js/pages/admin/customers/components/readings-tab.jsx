import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Link } from '@inertiajs/react';
import { Activity } from 'lucide-react';

export default function ReadingsTab({
    allReadings,
    getMeterNumber,
    getBillForReading,
}) {
    return (
        <>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                    <Activity className="h-4 w-4" />
                    Meter Readings
                </h2>
                <Button variant="outline" size="sm" asChild>
                    <Link href={route('meter-readings')}>
                        View All Readings
                    </Link>
                </Button>
            </div>
            {allReadings.length > 0 ? (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>Date</TableHead>
                                <TableHead>Meter</TableHead>
                                <TableHead>Previous</TableHead>
                                <TableHead>Current</TableHead>
                                <TableHead>Usage</TableHead>
                                <TableHead>Bill</TableHead>
                                <TableHead>Billing Officer</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allReadings.map((reading) => (
                                <TableRow
                                    key={reading.id}
                                    className="hover:bg-muted/50"
                                >
                                    <TableCell>
                                        {new Date(
                                            reading.reading_date,
                                        ).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">
                                        {getMeterNumber(reading)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {reading.previous_reading ?? '0'}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {reading.current_reading}
                                    </TableCell>
                                    <TableCell>
                                        {(
                                            parseFloat(
                                                reading.current_reading || 0,
                                            ) -
                                            parseFloat(
                                                reading.previous_reading || 0,
                                            )
                                        ).toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        {(() => {
                                            const bill =
                                                getBillForReading(reading);
                                            return bill ? (
                                                <Link
                                                    href={route(
                                                        'bills.show',
                                                        bill.id,
                                                    )}
                                                    className="font-medium text-primary hover:underline"
                                                >
                                                    {bill.bill_number}
                                                </Link>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    —
                                                </span>
                                            );
                                        })()}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {reading.reader?.name ?? '—'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <Activity className="mb-4 h-10 w-10 opacity-20" />
                    <p>No meter readings found for this customer.</p>
                </div>
            )}
        </>
    );
}
