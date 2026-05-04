<?php

namespace App\Services;

use App\Models\TrainingParticipant;
use App\Models\TrainingProgram;
use Illuminate\Database\Eloquent\Builder;

class TrainingReportService
{
    /**
     * Base query for programs report with optional filters.
     *
     * @param  array<string, mixed>  $filters
     */
    public function programsQuery(array $filters = []): Builder
    {
        $q = TrainingProgram::query()->orderByDesc('start_date');

        if (! empty($filters['status'])) {
            $q->where('status', $filters['status']);
        }

        if (! empty($filters['search'])) {
            $s = '%'.$filters['search'].'%';
            $q->where(function ($w) use ($s) {
                $w->where('title', 'like', $s)
                    ->orWhere('provider', 'like', $s)
                    ->orWhere('location', 'like', $s);
            });
        }

        if (! empty($filters['date_from'])) {
            $q->where(function ($w) use ($filters) {
                $w->whereDate('end_date', '>=', $filters['date_from'])
                    ->orWhereNull('end_date');
            });
        }

        if (! empty($filters['date_to'])) {
            $q->where(function ($w) use ($filters) {
                $w->whereDate('start_date', '<=', $filters['date_to'])
                    ->orWhereNull('start_date');
            });
        }

        return $q;
    }

    /**
     * Participation rows for export/report screens.
     *
     * @param  array<string, mixed>  $filters
     */
    public function participationQuery(array $filters = []): Builder
    {
        $q = TrainingParticipant::query()->with(['staff', 'trainingProgram']);

        if (! empty($filters['training_program_id'])) {
            $q->where('training_program_id', $filters['training_program_id']);
        }

        if (! empty($filters['status'])) {
            $q->where('status', $filters['status']);
        }

        return $q->orderByDesc('id');
    }

    /**
     * Total planned cost for programs (optionally filtered year).
     */
    public function totalCost(?int $year = null): float
    {
        $q = TrainingProgram::query();
        if ($year !== null) {
            $q->where(function ($w) use ($year) {
                $w->whereYear('start_date', $year)
                    ->orWhereYear('end_date', $year);
            });
        }

        return round((float) $q->sum('cost'), 2);
    }
}
