<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class EmployeeController extends Controller
{
    /**
     * Display a listing of employee personnel.
     */
    public function index(Request $request)
    {
        // Fail-Fast: Only Admins or HQ Operations can list all employees globally
        $isAuthorized = $request->user()->hasRole('Admin') || $request->user()->hasRole('HQ operations');
        if (!$isAuthorized) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized governance access.'
            ], 403);
        }

        $employees = User::role(['Admin', 'HQ operations', 'Franchisee', 'Branch Cashier'])
            ->with('roles')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $employees
        ]);
    }

    /**
     * Store a newly created employee in storage.
     */
    public function store(Request $request)
    {
        $isAuthorized = $request->user()->hasRole('Admin') || $request->user()->hasRole('HQ operations');
        if (!$isAuthorized) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized personnel action.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:Admin,HQ operations,Franchisee,Branch Cashier',
        ]);

        // Fail-Fast: Check validations immediately
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors()
            ], 422);
        }

        $employee = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $employee->assignRole($request->role);

        return response()->json([
            'success' => true,
            'message' => 'Personnel profile registered successfully.',
            'data' => $employee->load('roles')
        ], 201);
    }

    /**
     * Update an employee's details.
     */
    public function update(Request $request, $id)
    {
        $isAuthorized = $request->user()->hasRole('Admin') || $request->user()->hasRole('HQ operations');
        if (!$isAuthorized) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized personnel action.'
            ], 403);
        }

        $employee = User::find($id);
        // Fail-Fast: Verify entity existence
        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Personnel profile not found.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $id,
            'role' => 'sometimes|required|string|in:Admin,HQ operations,Franchisee,Branch Cashier',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->has('name')) {
            $employee->name = $request->name;
        }
        if ($request->has('email')) {
            $employee->email = $request->email;
        }
        if ($request->has('password') && !empty($request->password)) {
            $employee->password = Hash::make($request->password);
        }
        $employee->save();

        if ($request->has('role')) {
            $employee->syncRoles([$request->role]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Personnel details updated successfully.',
            'data' => $employee->load('roles')
        ]);
    }

    /**
     * Remove the specified employee from storage.
     */
    public function destroy(Request $request, $id)
    {
        $isAuthorized = $request->user()->hasRole('Admin');
        if (!$isAuthorized) {
            return response()->json([
                'success' => false,
                'message' => 'Only Super Admins can terminate employee credentials.'
            ], 403);
        }

        $employee = User::find($id);
        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Personnel profile not found.'
            ], 404);
        }

        // Prevent self-deletion
        if ($employee->id === $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot self-terminate active console session.'
            ], 400);
        }

        $employee->delete();

        return response()->json([
            'success' => true,
            'message' => 'Personnel profile terminated successfully.'
        ]);
    }
}
