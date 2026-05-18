<?php

namespace App\Http\Controllers\Departments;

use App\Http\Controllers\Controller;
use App\Services\FinanceReportService;
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
        if (! array_key_exists('pf_from', $query) && array_key_exists('from', $query)) {
            $query['pf_from'] = $query['from'];
            unset($query['from']);
        }
        if (! array_key_exists('pf_to', $query) && array_key_exists('to', $query)) {
            $query['pf_to'] = $query['to'];
            unset($query['to']);
        }

        return redirect()->route('revenue-report.index', $query);
    }

    public function export(Request $request): StreamedResponse
    {
        return $this->financeReportService->exportCsv($request);
    }
}
