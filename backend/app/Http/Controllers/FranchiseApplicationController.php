<?php

namespace App\Http\Controllers;

use App\Models\FranchiseApplication;
use Illuminate\Http\Request;
use App\Http\Requests\SubmitFranchiseApplicationRequest;

class FranchiseApplicationController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(SubmitFranchiseApplicationRequest $request)
    {
        // Anti-spam & Deduplication logic
        $exists = FranchiseApplication::where(function ($query) use ($request) {
            $query->where('email', $request->email)
                  ->orWhere('phone', $request->phone);
        })->whereIn('status', ['Pending', 'Under Review'])->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'An application is already being processed for this contact information.'
            ], 429); // Too Many Requests
        }

        $application = FranchiseApplication::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Application submitted successfully!',
            'data' => $application
        ], 201);
    }
}
