<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreEmployeeRequest;
use App\Http\Requests\Admin\UpdateEmployeeRequest;
use App\Models\User;
use App\Services\EmployeeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function __construct(
        protected EmployeeService $employeeService
    ) {}

    /**
     * Display a listing of employee personnel.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user->hasRole(['Admin', 'HQ operations', 'Franchisee'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized governance access.',
            ], 403);
        }

        $employees = $this->employeeService->getEmployees($user);

        return response()->json([
            'success' => true,
            'data' => $employees,
        ]);
    }

    /**
     * Store a newly created employee in storage.
     */
    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        $employee = $this->employeeService->createEmployee(
            $request->validated(),
            $request->user()
        );

        return response()->json([
            'success' => true,
            'message' => 'Personnel profile registered successfully.',
            'data' => $employee,
        ], 201);
    }

    /**
     * Update an employee's details.
     */
    public function update(UpdateEmployeeRequest $request, int $id): JsonResponse
    {
        $employee = User::find($id);
        if (! $employee) {
            return response()->json([
                'success' => false,
                'message' => 'Personnel profile not found.',
            ], 404);
        }

        $updated = $this->employeeService->updateEmployee(
            $employee,
            $request->validated(),
            $request->user()
        );

        return response()->json([
            'success' => true,
            'message' => 'Personnel details updated successfully.',
            'data' => $updated,
        ]);
    }

    /**
     * Remove the specified employee from storage.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        if (! $user->hasRole('Admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Only Super Admins can terminate employee credentials.',
            ], 403);
        }

        $employee = User::find($id);
        if (! $employee) {
            return response()->json([
                'success' => false,
                'message' => 'Personnel profile not found.',
            ], 404);
        }

        if ($employee->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot self-terminate active console session.',
            ], 400);
        }

        $this->employeeService->deleteEmployee($employee, $user);

        return response()->json([
            'success' => true,
            'message' => 'Personnel profile terminated successfully.',
        ]);
    }
}
