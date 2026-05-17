<?php

namespace App\Http\Controllers;

use App\Models\Hub;
use Illuminate\Http\Request;

class HubController extends Controller
{
    /**
     * Display a listing of active hubs for B2C customer routing.
     */
    public function index()
    {
        $hubs = Hub::where('status', 'active')->get();

        return response()->json([
            'success' => true,
            'data' => $hubs
        ]);
    }
}
