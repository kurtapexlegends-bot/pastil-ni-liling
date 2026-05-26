<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(RegisterRequest $request)
    {

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
        ]);

        // Assign default role
        $user->assignRole('Customer');

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    /**
     * Login user and create token.
     */
    public function login(LoginRequest $request)
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid login details'
            ], 401);
        }

        $user = User::where('email', $request['email'])->firstOrFail();
        
        // Include roles in the response
        $user->load('roles');

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Logout user (Revoke token).
     */
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Get the authenticated User.
     */
    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user()->load('roles')
        ]);
    }

    /**
     * Send simulated password reset instructions and store reset token.
     */
    public function forgotPassword(ForgotPasswordRequest $request)
    {
        $email = $request->email;
        $token = Str::random(40);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'token' => $token,
                'created_at' => Carbon::now()
            ]
        );

        $frontendUrl = (string) config('app.frontend_url', 'http://localhost:3000');
        $resetLink = rtrim($frontendUrl, '/') . "/reset-password?token=" . $token . "&email=" . urlencode((string) $email);
        \Illuminate\Support\Facades\Log::info("Password reset link requested: " . $resetLink);

        return response()->json([
            'success' => true,
            'message' => 'A password reset instruction has been sent to your registered email address.',
            'token' => $token,
            'email' => $email
        ]);
    }

    /**
     * Reset the user's password.
     */
    public function resetPassword(ResetPasswordRequest $request)
    {
        // Verify token
        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'This password reset token is invalid.'
            ], 400);
        }

        // Check expiration (60 minutes)
        $createdAt = Carbon::parse($record->created_at);
        if ($createdAt->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json([
                'success' => false,
                'message' => 'This password reset token has expired.'
            ], 400);
        }

        // Reset password
        $user = User::where('email', $request->email)->firstOrFail();
        $user->password = $request->password;
        $user->save();

        // Delete token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Your password has been reset successfully!'
        ]);
    }
}
