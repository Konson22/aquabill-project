<?php

namespace App\Support;

use App\Models\Customer;
use App\Models\Pipe;
use App\Models\Valve;
use App\Models\WaterPoint;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

final class GisMapQuery
{
    /**
     * @return array{
     *     zone_id: int|null,
     *     water_point_type_id: int|null,
     *     water_point_status: string|null,
     *     pipe_type: string|null,
     *     pipe_status: string|null,
     *     valve_type: string|null,
     *     valve_status: string|null,
     *     pipe_id: int|null,
     *     customer_status: string|null
     * }
     */
    public static function filtersFromRequest(Request $request): array
    {
        return [
            'zone_id' => $request->filled('zone_id') ? (int) $request->input('zone_id') : null,
            'water_point_type_id' => $request->filled('water_point_type_id') ? (int) $request->input('water_point_type_id') : null,
            'water_point_status' => $request->filled('water_point_status') ? (string) $request->input('water_point_status') : null,
            'pipe_type' => $request->filled('pipe_type') ? (string) $request->input('pipe_type') : null,
            'pipe_status' => $request->filled('pipe_status') ? (string) $request->input('pipe_status') : null,
            'valve_type' => $request->filled('valve_type') ? (string) $request->input('valve_type') : null,
            'valve_status' => $request->filled('valve_status') ? (string) $request->input('valve_status') : null,
            'pipe_id' => $request->filled('pipe_id') ? (int) $request->input('pipe_id') : null,
            'customer_status' => $request->filled('customer_status') ? (string) $request->input('customer_status') : null,
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<int, WaterPoint>
     */
    public static function waterPoints(array $filters): Collection
    {
        $query = WaterPoint::query()
            ->with(['zone:id,name', 'waterPointType:id,name,slug'])
            ->whereNotNull('latitude')
            ->whereNotNull('longitude');

        if (! empty($filters['zone_id'])) {
            $query->where('zone_id', $filters['zone_id']);
        }
        if (! empty($filters['water_point_type_id'])) {
            $query->where('water_point_type_id', $filters['water_point_type_id']);
        }
        if (! empty($filters['water_point_status'])) {
            $query->where('status', $filters['water_point_status']);
        }

        return $query->orderBy('code')->get();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Pipe>
     */
    public static function pipes(array $filters): Collection
    {
        $query = Pipe::query()
            ->with('zone:id,name')
            ->whereNotNull('coordinates');

        if (! empty($filters['zone_id'])) {
            $query->where('zone_id', $filters['zone_id']);
        }
        if (! empty($filters['pipe_type'])) {
            $query->where('pipe_type', $filters['pipe_type']);
        }
        if (! empty($filters['pipe_status'])) {
            $query->where('status', $filters['pipe_status']);
        }

        return $query->orderBy('pipe_code')->get();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Valve>
     */
    public static function valves(array $filters): Collection
    {
        $query = Valve::query()->with(['zone:id,name', 'pipe:id,pipe_code']);

        if (! empty($filters['zone_id'])) {
            $query->where('zone_id', $filters['zone_id']);
        }
        if (! empty($filters['valve_type'])) {
            $query->where('valve_type', $filters['valve_type']);
        }
        if (! empty($filters['valve_status'])) {
            $query->where('status', $filters['valve_status']);
        }
        if (! empty($filters['pipe_id'])) {
            $query->where('pipe_id', $filters['pipe_id']);
        }

        return $query->orderBy('valve_code')->get();
    }

    /**
     * Customers with map coordinates (billing accounts), scoped by the same zone filter as other layers.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Customer>
     */
    public static function customers(array $filters): Collection
    {
        $query = Customer::query()
            ->with(['zone:id,name', 'tariff:id,name'])
            ->whereNotNull('latitude')
            ->whereNotNull('longitude');

        if (! empty($filters['zone_id'])) {
            $query->where('zone_id', $filters['zone_id']);
        }
        if (! empty($filters['customer_status'])) {
            $query->where('status', $filters['customer_status']);
        }

        return $query->orderBy('account_number')->get();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array{water_points: Collection<int, WaterPoint>, pipes: Collection<int, Pipe>, valves: Collection<int, Valve>, customers: Collection<int, Customer>}
     */
    public static function mapData(array $filters): array
    {
        return [
            'water_points' => self::waterPoints($filters),
            'pipes' => self::pipes($filters),
            'valves' => self::valves($filters),
            'customers' => self::customers($filters),
        ];
    }
}
