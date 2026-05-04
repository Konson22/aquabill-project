<?php

namespace App\Services;

use App\Models\Staff;
use App\Models\TrainingParticipant;
use App\Models\TrainingProgram;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class TrainingService
{
    /**
     * Enroll staff in a program. Duplicate enrollment is rejected.
     */
    public function enroll(TrainingProgram $program, Staff $staff): TrainingParticipant
    {
        if ($program->participants()->where('staff_id', $staff->id)->exists()) {
            throw ValidationException::withMessages([
                'staff_id' => __('This staff member is already enrolled in this training.'),
            ]);
        }

        return $program->participants()->create([
            'staff_id' => $staff->id,
            'status' => 'enrolled',
        ]);
    }

    /**
     * Percentage of participants marked completed.
     */
    public function completionRate(TrainingProgram $program): float
    {
        $total = $program->participants()->count();
        if ($total === 0) {
            return 0.0;
        }

        $completed = $program->participants()->where('status', 'completed')->count();

        return round(100 * $completed / $total, 1);
    }

    /**
     * Aggregates for HR dashboard training widgets.
     *
     * @return array<string, float|int|string|null>
     */
    public function dashboardMetrics(): array
    {
        $year = (int) now()->year;
        $yearStart = now()->startOfYear()->toDateString();
        $yearEnd = now()->endOfYear()->toDateString();

        $costThisYear = (float) TrainingProgram::query()
            ->where(function ($q) use ($yearStart, $yearEnd) {
                $q->whereBetween('start_date', [$yearStart, $yearEnd])
                    ->orWhereBetween('end_date', [$yearStart, $yearEnd])
                    ->orWhere(function ($q2) use ($yearStart, $yearEnd) {
                        $q2->where('start_date', '<=', $yearStart)
                            ->where('end_date', '>=', $yearEnd);
                    });
            })
            ->sum('cost');

        $staffTrainedThisYear = (int) TrainingParticipant::query()
            ->whereHas('trainingProgram', function ($q) use ($year) {
                $q->whereYear('start_date', $year)
                    ->orWhereYear('end_date', $year);
            })
            ->get()
            ->unique('staff_id')
            ->count();

        return [
            'total_trainings' => TrainingProgram::query()->count(),
            'ongoing' => TrainingProgram::query()->where('status', 'ongoing')->count(),
            'completed' => TrainingProgram::query()->where('status', 'completed')->count(),
            'planned' => TrainingProgram::query()->where('status', 'planned')->count(),
            'staff_trained_this_year' => $staffTrainedThisYear,
            'cost_this_year' => round($costThisYear, 2),
        ];
    }

    /**
     * Summary row counts for a program detail view.
     *
     * @return array<string, int>
     */
    public function participantSummary(TrainingProgram $program): array
    {
        $base = $program->participants();

        return [
            'total' => (clone $base)->count(),
            'enrolled' => (clone $base)->where('status', 'enrolled')->count(),
            'attended' => (clone $base)->where('status', 'attended')->count(),
            'completed' => (clone $base)->where('status', 'completed')->count(),
            'absent' => (clone $base)->where('status', 'absent')->count(),
        ];
    }

    /**
     * Training history for a staff profile (non-login staff record).
     *
     * @return Collection<int, array<string, mixed>>
     */
    public function staffTrainingRows(Staff $staff): Collection
    {
        return $staff->trainingParticipants()
            ->with('trainingProgram')
            ->latest()
            ->get()
            ->map(fn (TrainingParticipant $p) => [
                'id' => $p->id,
                'program_id' => $p->training_program_id,
                'program_title' => $p->trainingProgram?->title,
                'provider' => $p->trainingProgram?->provider,
                'status' => $p->status,
                'score' => $p->score,
                'remarks' => $p->remarks,
                'certificate_path' => $p->certificate_path,
                'start_date' => $p->trainingProgram?->start_date?->toDateString(),
                'end_date' => $p->trainingProgram?->end_date?->toDateString(),
            ]);
    }
}
