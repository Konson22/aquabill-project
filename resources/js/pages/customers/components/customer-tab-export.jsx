import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';

export default function CustomerTabExport({ href, visible = true }) {
    if (!visible || !href) {
        return null;
    }

    return (
        <div className="flex justify-end">
            <Button variant="outline" size="sm" className="gap-2" asChild>
                <a href={href}>
                    <FileSpreadsheet className="h-4 w-4" aria-hidden />
                    Export Excel
                </a>
            </Button>
        </div>
    );
}
