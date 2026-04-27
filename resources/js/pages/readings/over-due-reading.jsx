
export default function OverDueReading() {
  return (
    <AppLayout breadcrumbs={[{ title: 'Over Due Reading', href: '/readings/over-due-reading' }]}>
      <Head title="Over Due Reading" />
      <div className="flex h-full flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-500" />
              Over Due Reading
            </h1>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
