<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTrainingDocumentRequest;
use App\Models\TrainingDocument;
use App\Models\TrainingProgram;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;

class TrainingDocumentController extends Controller
{
    public function store(StoreTrainingDocumentRequest $request, TrainingProgram $program): RedirectResponse
    {
        $validated = $request->validated();

        $path = $request->file('file')->store(
            "training/materials/{$program->id}",
            'public'
        );

        TrainingDocument::query()->create([
            'training_program_id' => $program->id,
            'title' => $validated['title'] ?? $request->file('file')->getClientOriginalName(),
            'file_path' => $path,
        ]);

        return redirect()->route('hr.training.programs.show', $program);
    }

    public function destroy(TrainingProgram $program, TrainingDocument $document): RedirectResponse
    {
        if ($document->training_program_id !== $program->id) {
            abort(404);
        }

        Storage::disk('public')->delete($document->file_path);
        $document->delete();

        return redirect()->route('hr.training.programs.show', $program);
    }
}
