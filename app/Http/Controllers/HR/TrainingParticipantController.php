<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTrainingParticipantRequest;
use App\Http\Requests\UpdateTrainingParticipantRequest;
use App\Models\Staff;
use App\Models\TrainingParticipant;
use App\Models\TrainingProgram;
use App\Services\TrainingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;

class TrainingParticipantController extends Controller
{
    public function __construct(
        protected TrainingService $trainingService
    ) {}

    public function store(StoreTrainingParticipantRequest $request, TrainingProgram $program): RedirectResponse
    {
        $staff = Staff::query()->findOrFail($request->validated('staff_id'));

        $this->trainingService->enroll($program, $staff);

        return redirect()->route('hr.training.programs.show', $program);
    }

    public function update(
        UpdateTrainingParticipantRequest $request,
        TrainingProgram $program,
        TrainingParticipant $participant
    ): RedirectResponse {
        $this->ensureParticipantBelongsToProgram($program, $participant);

        $data = $request->safe()->only(['status', 'score', 'remarks']);

        if ($request->hasFile('certificate')) {
            if ($participant->certificate_path) {
                Storage::disk('public')->delete($participant->certificate_path);
            }
            $data['certificate_path'] = $request->file('certificate')->store(
                "training/certificates/{$program->id}",
                'public'
            );
        }

        $participant->fill($data);
        $participant->save();

        return redirect()->route('hr.training.programs.show', $program);
    }

    public function destroy(TrainingProgram $program, TrainingParticipant $participant): RedirectResponse
    {
        $this->ensureParticipantBelongsToProgram($program, $participant);

        if ($participant->certificate_path) {
            Storage::disk('public')->delete($participant->certificate_path);
        }

        $participant->delete();

        return redirect()->route('hr.training.programs.show', $program);
    }

    protected function ensureParticipantBelongsToProgram(TrainingProgram $program, TrainingParticipant $participant): void
    {
        if ($participant->training_program_id !== $program->id) {
            abort(404);
        }
    }
}
