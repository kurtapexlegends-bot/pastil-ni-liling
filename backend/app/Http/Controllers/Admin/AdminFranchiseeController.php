<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminFranchiseeController extends Controller
{
    /**
     * Get all users holding the Franchisee role.
     */
    public function index()
    {
        $franchisees = User::role('Franchisee')->get();
        return response()->json([
            'success' => true,
            'data' => $franchisees
        ]);
    }
}
