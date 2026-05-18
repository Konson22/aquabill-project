<?php

use App\Models\ConnectionRequest;
use App\Models\ConnectionRequestItem;
use App\Models\Customer;
use App\Models\ServiceCharge;
use App\Models\ServiceChargeType;
use App\Models\Tariff;
use App\Models\User;
use App\Models\Zone;

/**
 * @return array{0: Zone, 1: Tariff}
 */
function createZoneAndTariffForConnectionRequestTest(): array
{
    $tariff = Tariff::query()->create([
        'name' => 'T-'.uniqid(),
        'price_per_unit' => 50,
        'fixed_charge' => 0,
    ]);
    $zone = Zone::query()->create([
        'name' => 'Z-'.uniqid(),
        'supply_day_id' => supplyDayId('Monday'),
        'supply_time' => '08:00:00',
    ]);

    return [$zone, $tariff];
}

function createServiceChargeTypeForConnectionRequestTest(): ServiceChargeType
{
    $u = uniqid();

    return ServiceChargeType::query()->create([
        'name' => "Install {$u}",
        'code' => "INST{$u}",
        'amount' => 50.00,
    ]);
}

function validConnectionRequestPayload(Zone $zone, Tariff $tariff, ServiceChargeType $chargeType): array
{
    return [
        'name' => 'Applicant Name',
        'phone' => '0912345678',
        'email' => 'applicant@example.com',
        'national_id' => 'ID123',
        'address' => '123 Test Street',
        'plot_no' => 'Plot-A',
        'customer_type' => 'residential',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'issued_date' => now()->toDateString(),
        'notes' => 'Test notes',
        'items' => [
            [
                'service_charge_type_id' => $chargeType->id,
                'description' => $chargeType->name,
                'amount' => 50.00,
                'quantity' => 1,
            ],
            [
                'service_charge_type_id' => null,
                'description' => 'Custom permit fee',
                'amount' => 10.00,
                'quantity' => 2,
            ],
        ],
    ];
}

test('guest is redirected from connection requests index', function () {
    $this->get(route('connection-requests.index'))
        ->assertRedirect();
});

test('authenticated user can view connection requests index', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('connection-requests.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('connection-requests/index'));
});

test('authenticated user can view create connection request page', function () {
    $user = User::factory()->create();
    createServiceChargeTypeForConnectionRequestTest();

    $this->actingAs($user)
        ->get(route('connection-requests.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('connection-requests/create')
            ->has('zones')
            ->has('tariffs'));
});

test('can create connection request with multiple items and correct total', function () {
    $user = User::factory()->create();
    [$zone, $tariff] = createZoneAndTariffForConnectionRequestTest();
    $chargeType = createServiceChargeTypeForConnectionRequestTest();

    $payload = validConnectionRequestPayload($zone, $tariff, $chargeType);

    $this->actingAs($user)
        ->post(route('connection-requests.store'), $payload)
        ->assertRedirect();

    $request = ConnectionRequest::query()->where('name', 'Applicant Name')->first();

    expect($request)->not->toBeNull()
        ->and($request->request_number)->toStartWith('CONN-'.now()->format('Y').'-')
        ->and($request->status)->toBe('pending')
        ->and((float) $request->total_amount)->toBe(70.0)
        ->and($request->items)->toHaveCount(2);
});

test('print page renders for connection request', function () {
    $user = User::factory()->create();
    [$zone, $tariff] = createZoneAndTariffForConnectionRequestTest();

    $request = ConnectionRequest::factory()->create([
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'issued_by' => $user->id,
    ]);

    ConnectionRequestItem::factory()->create([
        'connection_request_id' => $request->id,
        'description' => 'Installation',
        'amount' => 50,
        'quantity' => 1,
    ]);

    $request->recalculateTotalAmount();

    $this->actingAs($user)
        ->get(route('connection-requests.print', $request))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('connection-requests/print')
            ->has('connectionRequest'));
});

test('mark paid transitions pending request to paid', function () {
    $user = User::factory()->create();
    [$zone, $tariff] = createZoneAndTariffForConnectionRequestTest();

    $request = ConnectionRequest::factory()->create([
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'issued_by' => $user->id,
        'status' => 'pending',
    ]);

    $this->actingAs($user)
        ->post(route('connection-requests.mark-paid', $request))
        ->assertRedirect();

    $request->refresh();

    expect($request->status)->toBe('paid')
        ->and($request->paid_at)->not->toBeNull();
});

test('cannot mark paid when request is not pending', function () {
    $user = User::factory()->create();
    [$zone, $tariff] = createZoneAndTariffForConnectionRequestTest();

    $request = ConnectionRequest::factory()->paid()->create([
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'issued_by' => $user->id,
    ]);

    $this->actingAs($user)
        ->from(route('connection-requests.show', $request))
        ->post(route('connection-requests.mark-paid', $request))
        ->assertRedirect()
        ->assertSessionHas('error');
});

test('convert to customer creates customer and service charges for typed lines', function () {
    $user = User::factory()->create();
    [$zone, $tariff] = createZoneAndTariffForConnectionRequestTest();
    $chargeType = createServiceChargeTypeForConnectionRequestTest();

    $request = ConnectionRequest::factory()->paid()->create([
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'issued_by' => $user->id,
        'name' => 'New Applicant',
        'phone' => '0999888777',
        'address' => 'Plot 99',
    ]);

    ConnectionRequestItem::factory()->create([
        'connection_request_id' => $request->id,
        'service_charge_type_id' => $chargeType->id,
        'description' => $chargeType->name,
        'amount' => 50,
        'quantity' => 1,
    ]);

    ConnectionRequestItem::factory()->create([
        'connection_request_id' => $request->id,
        'service_charge_type_id' => null,
        'description' => 'Custom fee',
        'amount' => 15,
        'quantity' => 1,
    ]);

    $this->actingAs($user)
        ->post(route('connection-requests.convert', $request))
        ->assertRedirect();

    $request->refresh();

    expect($request->status)->toBe('completed')
        ->and($request->customer_id)->not->toBeNull()
        ->and($request->completed_at)->not->toBeNull();

    $customer = Customer::query()->find($request->customer_id);

    expect($customer)->not->toBeNull()
        ->and($customer->name)->toBe('New Applicant');

    expect(ServiceCharge::query()->where('customer_id', $customer->id)->count())->toBe(1);
});

test('cannot convert unpaid connection request', function () {
    $user = User::factory()->create();
    [$zone, $tariff] = createZoneAndTariffForConnectionRequestTest();

    $request = ConnectionRequest::factory()->create([
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'issued_by' => $user->id,
        'status' => 'pending',
    ]);

    $this->actingAs($user)
        ->from(route('connection-requests.show', $request))
        ->post(route('connection-requests.convert', $request))
        ->assertRedirect()
        ->assertSessionHas('error');

    expect(Customer::query()->where('name', $request->name)->exists())->toBeFalse();
});

test('cannot convert already completed connection request', function () {
    $user = User::factory()->create();
    [$zone, $tariff] = createZoneAndTariffForConnectionRequestTest();
    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Existing',
        'phone' => '123',
        'address' => 'Addr',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $request = ConnectionRequest::factory()->completed()->create([
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'issued_by' => $user->id,
        'customer_id' => $customer->id,
    ]);

    $this->actingAs($user)
        ->from(route('connection-requests.show', $request))
        ->post(route('connection-requests.convert', $request))
        ->assertRedirect()
        ->assertSessionHas('error');
});
