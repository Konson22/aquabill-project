<?php

namespace App\Http\Controllers\Departments;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreHrDepartmentRequest;
use App\Http\Requests\StoreStaffRequest;
use App\Models\HrDepartment;
use App\Models\LeaveType;
use App\Models\PayrollPeriod;
use App\Models\Staff;
use App\Models\StaffAttendance;
use App\Models\StaffDocument;
use App\Models\StaffLeaveRequest;
use App\Services\TrainingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HRController extends Controller
{
    public function index(): Response
    {
        $today = now()->toDateString();

        $pendingLeave = StaffLeaveRequest::query()->where('status', 'pending')->count();
        $expiringDocs = StaffDocument::query()
            ->whereNotNull('expires_at')
            ->whereDate('expires_at', '<=', now()->addDays(30))
            ->whereDate('expires_at', '>=', $today)
            ->count();

        $attendanceToday = StaffAttendance::query()
            ->whereDate('attendance_date', $today)
            ->count();

        $currentPayroll = PayrollPeriod::query()
            ->whereIn('status', ['draft', 'processed'])
            ->latest('end_date')
            ->first();

        $trainingMetrics = app(TrainingService::class)->dashboardMetrics();

        return Inertia::render('hr/dashboard', [
            'trainingMetrics' => $trainingMetrics,
            'stats' => [
                'total_staff' => Staff::query()->count(),
                'active_staff' => Staff::query()->where('status', 'active')->count(),
                'on_leave_today' => Staff::query()->where('status', 'on_leave')->count(),
                'pending_leave' => $pendingLeave,
                'attendance_today' => $attendanceToday,
                'expiring_documents' => $expiringDocs,
            ],
            'currentPayroll' => $currentPayroll ? [
                'id' => $currentPayroll->id,
                'name' => $currentPayroll->name,
                'status' => $currentPayroll->status,
            ] : null,
        ]);
    }

    public function departments(Request $request): Response
    {
        $search = (string) $request->get('search', '');
        $active = $request->get('active');

        $query = HrDepartment::query()
            ->withCount('staff')
            ->orderBy('name');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('code', 'like', '%'.$search.'%');
            });
        }

        if ($active === '1' || $active === '0') {
            $query->where('is_active', (bool) (int) $active);
        }

        return Inertia::render('hr/departments/index', [
            'departments' => $query->get(),
            'filters' => [
                'search' => $search,
                'active' => $active,
            ],
        ]);
    }

    public function storeDepartment(StoreHrDepartmentRequest $request): RedirectResponse
    {
        HrDepartment::query()->create($request->validated());

        return redirect()->route('hr.departments.index');
    }

    public function staffIndex(Request $request): Response
    {
        $search = (string) $request->get('search', '');
        $status = $request->get('status');
        $hrDepartmentId = $request->get('hr_department_id');

        $query = Staff::query()
            ->with('hrDepartment')
            ->orderBy('name');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('employee_number', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%');
            });
        }

        if (in_array($status, ['active', 'inactive', 'on_leave'], true)) {
            $query->where('status', $status);
        }

        if ($hrDepartmentId) {
            $query->where('hr_department_id', $hrDepartmentId);
        }

        return Inertia::render('hr/staff/index', [
            'staffMembers' => $query->paginate(15)->withQueryString(),
            'hrDepartments' => HrDepartment::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
            'filters' => [
                'search' => $search,
                'status' => $status,
                'hr_department_id' => $hrDepartmentId,
            ],
        ]);
    }

    public function staffCreate(): Response
    {
        return Inertia::render('hr/staff/create', [
            'hrDepartments' => HrDepartment::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
        ]);
    }

    public function staffStore(StoreStaffRequest $request): RedirectResponse
    {
        $staff = Staff::query()->create($request->validated());

        return redirect()->route('hr.staff.show', $staff);
    }

    public function staffShow(Staff $staff): Response
    {
        $staff->load([
            'hrDepartment',
            'attendances' => fn ($q) => $q->latest('attendance_date')->limit(14),
            'leaveRequests' => fn ($q) => $q->with('leaveType')->latest()->limit(10),
            'leaveBalances' => fn ($q) => $q->with('leaveType')->where('year', now()->year),
            'trainingParticipants' => fn ($q) => $q->with('trainingProgram')->latest()->limit(40),
            'salaries' => fn ($q) => $q->latest('effective_from')->limit(5),
            'payrolls' => fn ($q) => $q->with('payrollPeriod')->latest()->limit(6),
            'documents' => fn ($q) => $q->with('documentType')->latest()->limit(12),
        ]);

        return Inertia::render('hr/staff/show', [
            'staffMember' => $staff,
        ]);
    }

    public function attendance(Request $request): Response
    {
        $date = $request->get('date', now()->toDateString());

        $records = StaffAttendance::query()
            ->with('staff.hrDepartment')
            ->whereDate('attendance_date', $date)
            ->orderBy('staff_id')
            ->get();

        return Inertia::render('hr/attendance/index', [
            'attendances' => $records,
            'filters' => ['date' => $date],
        ]);
    }

    public function leave(Request $request): Response
    {
        $status = $request->get('status');

        $requestsQuery = StaffLeaveRequest::query()
            ->with(['staff.hrDepartment', 'leaveType', 'approvedBy'])
            ->latest();

        if (in_array($status, ['pending', 'approved', 'rejected', 'cancelled'], true)) {
            $requestsQuery->where('status', $status);
        }

        return Inertia::render('hr/leave/index', [
            'leaveRequests' => $requestsQuery->take(50)->get(),
            'leaveTypes' => LeaveType::query()->where('is_active', true)->orderBy('name')->get(),
            'filters' => ['status' => $status],
        ]);
    }

    public function payroll(): Response
    {
        $periods = PayrollPeriod::query()->latest('end_date')->take(24)->get();

        return Inertia::render('hr/payroll/index', [
            'periods' => $periods,
        ]);
    }

    public function documents(): Response
    {
        $soon = now()->addDays(30)->toDateString();
        $today = now()->toDateString();

        $expiring = StaffDocument::query()
            ->with(['staff', 'documentType'])
            ->whereNotNull('expires_at')
            ->whereDate('expires_at', '>=', $today)
            ->whereDate('expires_at', '<=', $soon)
            ->orderBy('expires_at')
            ->take(50)
            ->get();

        return Inertia::render('hr/documents/index', [
            'expiringDocuments' => $expiring,
        ]);
    }

    public function reports(): Response
    {
        return Inertia::render('hr/reports/index');
    }
}
