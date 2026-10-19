<?php

namespace App\Services;

use App\Models\Hub;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class EmployeeService
{
    /**
     * Retrieve employee personnel scoped by the authenticated user's role and hub.
     * Admin/HQ Operations see all employees with roles.
     * Franchisee only sees Branch Cashiers explicitly assigned to their hub.
     *
     * @return Collection<int, User>
     */
    public function getEmployees(User $user): Collection
    {
        if ($user->hasRole('Franchisee')) {
            $hub = Hub::where('franchisee_id', $user->id)->first();

            return $hub
                ? User::role('Branch Cashier')
                    ->where('hub_id', $hub->id)
                    ->with('roles')
                    ->get()
                : new Collection;
        }

        return User::role(['Admin', 'HQ operations', 'Franchisee', 'Branch Cashier'])
            ->with('roles')
            ->get();
    }

    /**
     * Create a new employee with role assignment inside an ACID transaction.
     * Enforces hub_id assignment: forces actor's hub if Franchisee.
     *
     * @param  array<string, mixed>  $data
     */
    public function createEmployee(array $data, User $actor): User
    {
        return DB::transaction(function () use ($data, $actor) {
            $hubId = null;

            if ($actor->hasRole('Franchisee')) {
                $hub = Hub::where('franchisee_id', $actor->id)->first();
                $hubId = $hub?->id;
            } elseif ($actor->hasRole(['Admin', 'HQ operations'])) {
                $hubId = $data['hub_id'] ?? null;
            }

            $employee = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'hub_id' => $hubId,
            ]);

            $employee->assignRole($data['role']);

            return $employee->load('roles');
        });
    }

    /**
     * Update an employee's details and role assignment inside an ACID transaction.
     * Verifies tenant ownership if the actor is a Franchisee.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateEmployee(User $employee, array $data, User $actor): User
    {
        return DB::transaction(function () use ($employee, $data, $actor) {
            // Verify tenant boundary if Franchisee actor
            if ($actor->hasRole('Franchisee')) {
                $hub = Hub::where('franchisee_id', $actor->id)->first();
                if (! $hub || $employee->hub_id !== $hub->id) {
                    abort(403, 'Unauthorized. Employee does not belong to your branch.');
                }
            }

            if (isset($data['name'])) {
                $employee->name = $data['name'];
            }

            if (isset($data['email'])) {
                $employee->email = $data['email'];
            }

            if (! empty($data['password'])) {
                $employee->password = Hash::make($data['password']);
            }

            if ($actor->hasRole('Franchisee')) {
                $hub = Hub::where('franchisee_id', $actor->id)->first();
                if ($hub) {
                    $employee->hub_id = $hub->id;
                }
            } elseif ($actor->hasRole(['Admin', 'HQ operations']) && array_key_exists('hub_id', $data)) {
                $employee->hub_id = $data['hub_id'];
            }

            $employee->save();

            if (isset($data['role'])) {
                $employee->syncRoles([$data['role']]);
            }

            return $employee->load('roles');
        });
    }

    /**
     * Terminate an employee credential inside an ACID transaction.
     * Prevents self-termination and verifies authorization.
     */
    public function deleteEmployee(User $employee, User $actor): bool
    {
        return DB::transaction(function () use ($employee, $actor) {
            if ($employee->id === $actor->id) {
                abort(400, 'Cannot self-terminate active console session.');
            }

            if ($actor->hasRole('Franchisee')) {
                $hub = Hub::where('franchisee_id', $actor->id)->first();
                if (! $hub || $employee->hub_id !== $hub->id) {
                    abort(403, 'Unauthorized. Employee does not belong to your branch.');
                }
            }

            return (bool) $employee->delete();
        });
    }
}
