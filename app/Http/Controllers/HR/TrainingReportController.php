<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Services\TrainingReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrainingReportController extends Controller
{
    public function __construct(
        protected TrainingReportService $trainingReportService
    ) {}

    public function index(Request $request): Response
    {
        $filters = [
            'search' => $request->get('search'),
            'status' => $request->get('status'),
            'date_from' => $request->get('date_from'),
            'date_to' => $request->get('date_to'),
        ];

        $programs = $this->trainingReportService
            ->programsQuery(array_filter($filters))
            ->withCount('participants')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('hr/training/reports/index', [
            'programs' => $programs,
            'filters' => $filters,
            'totalCostYear' => $this->trainingReportService->totalCost((int) now()->year),
        ]);
    }
}
