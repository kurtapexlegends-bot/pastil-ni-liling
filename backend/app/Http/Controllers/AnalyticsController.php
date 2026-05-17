<?php

namespace App\Http\Controllers;

use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    protected AnalyticsService $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Fetch executive intelligence aggregates.
     * Restricts endpoint view to authorized high-tier roles (Super Admin & HQ Operations).
     */
    public function getSummary(Request $request): JsonResponse
    {
        // Fail-Fast: Verify session user existence and high-tier RBAC authorization
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access credentials.'
            ], 401);
        }

        if (!$user->hasRole('Admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Restricted personnel access locks triggered.'
            ], 403);
        }

        try {
            $data = $this->analyticsService->getAnalyticsSummary();

            return response()->json([
                'success' => true,
                'data' => $data
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Analytics processing execution faulted.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
