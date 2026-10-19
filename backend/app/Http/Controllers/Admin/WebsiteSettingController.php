<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateWebsiteSettingsRequest;
use App\Services\WebsiteSettingService;
use Illuminate\Http\JsonResponse;

class WebsiteSettingController extends Controller
{
    /**
     * Inject WebsiteSettingService into controller.
     */
    public function __construct(
        protected WebsiteSettingService $settingService
    ) {}

    /**
     * Fetch all website configuration settings in a flat key-value mapping.
     * Accessible by public public-facing routes.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->settingService->getSettings(),
        ], 200);
    }

    /**
     * Save/Update a batch of website settings.
     * Restricts endpoint to authorized HQ and Admin roles via Form Request.
     */
    public function update(UpdateWebsiteSettingsRequest $request): JsonResponse
    {
        try {
            $updated = $this->settingService->updateSettings($request->validated('settings'));

            return response()->json([
                'success' => true,
                'message' => 'Website content settings updated successfully.',
                'data' => $updated,
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to apply site configuration settings.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
