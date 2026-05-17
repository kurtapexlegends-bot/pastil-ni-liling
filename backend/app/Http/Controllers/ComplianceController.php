<?php

namespace App\Http\Controllers;

use App\Models\ComplianceAudit;
use App\Models\Hub;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ComplianceController extends Controller
{
    /**
     * Display a listing of digital compliance audits.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Fail-Fast: HQ officers get global view
        if ($user->hasRole('Admin') || $user->hasRole('HQ operations')) {
            $audits = ComplianceAudit::with(['hub', 'auditor'])->latest()->get();
            return response()->json([
                'success' => true,
                'data' => $audits
            ]);
        }

        // Franchise partners get local view for their hubs
        if ($user->hasRole('Franchisee')) {
            $hubs = Hub::where('franchisee_id', $user->id)->pluck('id');
            $audits = ComplianceAudit::whereIn('hub_id', $hubs)
                ->with(['hub', 'auditor'])
                ->latest()
                ->get();

            return response()->json([
                'success' => true,
                'data' => $audits
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Access denied.'
        ], 403);
    }

    /**
     * Store a newly created compliance QC audit in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // Fail-Fast: Only HQ operations, Super Admin, or Franchisee themselves can register audits
        $isAuthorized = $user->hasRole('Admin') || $user->hasRole('HQ operations') || $user->hasRole('Franchisee');
        if (!$isAuthorized) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized compliance action.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'hub_id' => 'required|exists:hubs,id',
            'hygiene_score' => 'required|integer|min:0|max:100',
            'recipe_adherence_score' => 'required|integer|min:0|max:100',
            'notes' => 'nullable|string',
            'kitchen_photo' => 'nullable|string', // mock base64 or path
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error.',
                'errors' => $validator->errors()
            ], 422);
        }

        // Set default status. If Franchisee submits, must be pending reviewer approval.
        $status = 'pending';
        if ($user->hasRole('Admin') || $user->hasRole('HQ operations')) {
            $status = 'approved';
        }

        $audit = ComplianceAudit::create([
            'hub_id' => $request->hub_id,
            'auditor_id' => $user->id,
            'audit_date' => now()->toDateString(),
            'hygiene_score' => $request->hygiene_score,
            'recipe_adherence_score' => $request->recipe_adherence_score,
            'kitchen_photo_path' => $request->kitchen_photo ?? '/photos/mock_kitchen.jpg',
            'notes' => $request->notes,
            'status' => $status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Hygiene and QC compliance audit registered successfully.',
            'data' => $audit->load(['hub', 'auditor'])
        ], 201);
    }

    /**
     * Update QC audit approval status.
     */
    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();

        // Fail-Fast: Only HQ auditors / Super Admins can issue status changes
        $isHQ = $user->hasRole('Admin') || $user->hasRole('HQ operations');
        if (!$isHQ) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized audit governance access.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:approved,flagged',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors()
            ], 422);
        }

        $audit = ComplianceAudit::find($id);
        if (!$audit) {
            return response()->json([
                'success' => false,
                'message' => 'Compliance audit record not found.'
            ], 404);
        }

        $audit->status = $request->status;
        if ($request->has('notes')) {
            $audit->notes = ($audit->notes ? $audit->notes . "\n" : '') . "HQ Audit Review: " . $request->notes;
        }
        $audit->save();

        return response()->json([
            'success' => true,
            'message' => 'QC compliance status updated to: ' . $request->status,
            'data' => $audit->load(['hub', 'auditor'])
        ]);
    }
}
