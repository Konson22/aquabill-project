<?php

namespace App\Http\Controllers\Departments;

use App\Http\Controllers\Controller;
use App\Services\FinanceReportService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FinanceReportController extends Controller
{
    public function __construct(
        private FinanceReportService $financeReportService,
    ) {}

    public function index(Request $request): RedirectResponse
    {
        $query = $request->query();

        if (! array_key_exists('month', $query) && array_key_exists('from', $query)) {
            $query['month'] = Carbon::parse((string) $query['from'])->format('Y-m');
            unset($query['from'], $query['to'], $query['pf_from'], $query['pf_to']);
        }

        return redirect()->route('revenue-report.index', $query);
    }

    public function export(Request $request): StreamedResponse
    {
        return $this->financeReportService->exportCsv($request);
    }
}
