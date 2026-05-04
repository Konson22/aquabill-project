<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTrainingProgramRequest;
use App\Http\Requests\UpdateTrainingProgramRequest;
use App\Models\Staff;
use App\Models\TrainingProgram;
use App\Services\TrainingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrainingProgramController extends Controller
{
    public function __construct(
        protected TrainingService $trainingService
    ) {}

    public function index(Request $request): Response
    {
        $search = (string) $request->get('search', '');
        $status = $request->get('status');
        $provider = (string) $request->get('provider', '');
        $dateFrom = $request->get('date_from');
        $dateTo = $request->get('date_to');

        $query = TrainingProgram::query()
            ->withCount(['participants', 'documents'])
            ->latest('start_date');

        if ($search !== '') {
            $s = '%'.$search.'%';
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', $s)
                    ->orWhere('provider', 'like', $s)
                    ->orWhere('location', 'like', $s);
            });
        }

        if (in_array($status, ['planned', 'ongoing', 'completed', 'cancelled'], true)) {
            $query->where('status', $status);
        }

        if ($provider !== '') {
            $query->where('provider', 'like', '%'.$provider.'%');
        }

        if ($dateFrom) {
            $query->where(function ($q) use ($dateFrom) {
                $q->whereDate('end_date', '>=', $dateFrom)
                    ->orWhereNull('end_date');
            });
        }

        if ($dateTo) {
            $query->where(function ($q) use ($dateTo) {
                $q->whereDate('start_date', '<=', $dateTo)
                    ->orWhereNull('start_date');
            });
        }

        return Inertia::render('hr/training/programs/index', [
            'programs' => $query->paginate(12)->withQueryString(),
            'filters' => [
                'search' => $search,
                'status' => $status,
                'provider' => $provider,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('hr/training/programs/create');
    }

    public function store(StoreTrainingProgramRequest $request): RedirectResponse
    {
        TrainingProgram::query()->create($request->validated());

        return redirect()->route('hr.training.programs.index');
    }

    public function show(TrainingProgram $program): Response
    {
        $program->load([
            'participants.staff',
            'documents',
        ]);

        $staffOptions = Staff::query()->orderBy('name')->get(['id', 'name', 'employee_number']);

        return Inertia::render('hr/training/programs/show', [
            'program' => $program,
            'participantSummary' => $this->trainingService->participantSummary($program),
            'completionRate' => $this->trainingService->completionRate($program),
            'staffOptions' => $staffOptions,
        ]);
    }

    public function edit(TrainingProgram $program): Response
    {
        return Inertia::render('hr/training/programs/edit', [
            'program' => $program,
        ]);
    }

    public function update(UpdateTrainingProgramRequest $request, TrainingProgram $program): RedirectResponse
    {
        $program->update($request->validated());

        return redirect()->route('hr.training.programs.show', $program);
    }

    public function destroy(TrainingProgram $program): RedirectResponse
    {
        $program->delete();

        return redirect()->route('hr.training.programs.index');
    }
}
