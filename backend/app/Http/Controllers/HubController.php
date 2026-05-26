<?php

namespace App\Http\Controllers;

use App\Models\Hub;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class HubController extends Controller
{
    /**
     * Display a listing of active hubs for B2C customer routing.
     */
    public function index()
    {
        $hubs = Cache::rememberForever('active_hubs', function() {
            return Hub::with('franchisee')->where('status', 'active')->get()->toArray();
        });

        return response()->json([
            'success' => true,
            'data' => $hubs
        ]);
    }
}
