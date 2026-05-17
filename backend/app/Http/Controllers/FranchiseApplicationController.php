<?php

namespace App\Http\Controllers;

use App\Models\FranchiseApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FranchiseApplicationController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'target_location' => 'required|string|max:255',
            'investment_capacity' => 'required|string',
            'experience_summary' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $application = FranchiseApplication::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Application submitted successfully!',
            'data' => $application
        ], 201);
    }
}
