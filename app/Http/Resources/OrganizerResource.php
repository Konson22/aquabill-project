<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            // 'avatar' => $this->avatar,
            // 'about' => $this->about,
            // 'phone' => $this->phone,
            // 'address' => $this->address,
            // 'rating' => $this->rating,
            // 'likes' => $this->likes,
        ];
    }
}
