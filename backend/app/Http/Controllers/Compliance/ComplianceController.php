<?php

namespace App\Http\Controllers\Compliance;

use App\Http\Controllers\Controller;
use App\Models\ComplianceAudit;
use App\Models\Hub;
use App\Models\PosSyncAnomaly;
use Illuminate\Http\Request;
use App\Http\Requests\Compliance\StoreComplianceAuditRequest;
use App\Http\Requests\Compliance\UpdateComplianceStatusRequest;
use App\Http\Requests\Compliance\ResolveAnomalyRequest;

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
    public function store(StoreComplianceAuditRequest $request)
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
    public function updateStatus(UpdateComplianceStatusRequest $request, int $id)
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

    /**
     * Display a listing of POS sync anomalies.
     */
    public function getAnomalies(Request $request)
    {
        $user = $request->user();

        if (!$user->hasRole('Admin') && !$user->hasRole('HQ operations') && !$user->hasRole('Franchisee')) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.'
            ], 403);
        }

        $anomalies = PosSyncAnomaly::with(['hub', 'product'])
            ->forUser($user)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($anomaly) {
                // Map to maintain backward compatibility with frontend
                $anomaly->hub_name = $anomaly->hub->name ?? 'Unknown';
                $anomaly->product_name = $anomaly->product->name ?? 'Unknown';
                return $anomaly;
            });

        return response()->json([
            'success' => true,
            'data' => $anomalies
        ]);
    }

    /**
     * Resolve a POS sync anomaly.
     */
    public function resolveAnomaly(ResolveAnomalyRequest $request, int $id)
    {
        $user = $request->user();

        // Only HQ Operations or Admins can mark anomalies as resolved
        if (!$user->hasRole('Admin') && !$user->hasRole('HQ operations')) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Only HQ operators can resolve anomalies.'
            ], 403);
        }

        $anomaly = PosSyncAnomaly::find($id);

        if (!$anomaly) {
            return response()->json([
                'success' => false,
                'message' => 'Anomaly not found.'
            ], 404);
        }

        $anomaly->update([
            'status' => 'resolved',
            'notes' => $request->notes ?? 'Reconciled and resolved by HQ Operator.'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'POS sync anomaly marked as resolved.',
            'data' => $anomaly
        ]);
    }
}
