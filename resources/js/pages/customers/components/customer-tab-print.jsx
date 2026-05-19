import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export default function CustomerTabPrint({ onPrint, visible = true }) {
    if (!visible || !onPrint) {
        return null;
    }

    return (
        <Button type="button" variant="outline" size="sm" className="gap-2 print:hidden" onClick={onPrint}>
            <Printer className="h-4 w-4" aria-hidden />
            Print bills
        </Button>
    );
}
