<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string)$this->id,
            'title' => $this->title,
            'date' => $this->date,
            'location' => $this->location,
            'category' => $this->category,
            'description' => $this->description,
            'coordinate_y' => $this->coordinate_y,
            'coordinate_x' => $this->coordinate_x,
            'image' => $this->image,
            'pricing_category' => $this->categories,
            'owner' => [
                'id' => $this->owner->id,
                'name' => $this->owner->name,
            ]
        ];
    }
}
