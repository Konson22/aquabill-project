export default function SummaryStats() {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-l-4 border-l-emerald-500 transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between border-none pb-2 shadow-none">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Revenue Collected
                    </CardTitle>
                    <Wallet className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-emerald-600">
                        {formatCurrency(stats.totalCollected)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Lifetime collections
                    </p>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between border-none pb-2 shadow-none">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Collections Today
                    </CardTitle>
                    <Banknote className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(stats.collectedToday)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Received in the last 24h
                    </p>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between border-none pb-2 shadow-none">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Pending Revenue
                    </CardTitle>
                    <CreditCard className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                        {formatCurrency(stats.totalPending)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Outstanding bills & invoices
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
