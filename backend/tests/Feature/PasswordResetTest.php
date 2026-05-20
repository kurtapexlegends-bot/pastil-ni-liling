<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_generates_token_for_valid_email()
    {
        $user = User::factory()->create([
            'email' => 'test@liling.com',
            'password' => 'oldpassword123'
        ]);

        $response = $this->postJson('/api/forgot-password', [
            'email' => 'test@liling.com'
        ]);

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'success' => true,
            'email' => 'test@liling.com'
        ]);

        $this->assertNotNull($response->json('token'));
        
        // Assert token is stored in the database
        $this->assertTrue(
            DB::table('password_reset_tokens')
                ->where('email', 'test@liling.com')
                ->where('token', $response->json('token'))
                ->exists()
        );
    }

    public function test_forgot_password_returns_error_for_invalid_email()
    {
        $response = $this->postJson('/api/forgot-password', [
            'email' => 'nonexistent@liling.com'
        ]);

        $response->assertStatus(422);
        $response->assertJsonFragment([
            'success' => false,
            'message' => 'We could not find a user with that email address.'
        ]);
    }

    public function test_reset_password_updates_user_password_successfully()
    {
        $user = User::factory()->create([
            'email' => 'test@liling.com',
            'password' => Hash::make('oldpassword123')
        ]);

        $token = 'test-token-123456';
        DB::table('password_reset_tokens')->insert([
            'email' => 'test@liling.com',
            'token' => $token,
            'created_at' => Carbon::now()
        ]);

        $response = $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => 'test@liling.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123'
        ]);

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'success' => true,
            'message' => 'Your password has been reset successfully!'
        ]);

        // Assert token is deleted
        $this->assertFalse(
            DB::table('password_reset_tokens')
                ->where('email', 'test@liling.com')
                ->exists()
        );

        // Assert user can log in with new password
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'test@liling.com',
            'password' => 'newpassword123'
        ]);

        $loginResponse->assertStatus(200);
        $loginResponse->assertJsonFragment([
            'success' => true
        ]);
    }

    public function test_reset_password_fails_for_invalid_or_expired_token()
    {
        $user = User::factory()->create([
            'email' => 'test@liling.com',
            'password' => Hash::make('oldpassword123')
        ]);

        // 1. Invalid token
        $response = $this->postJson('/api/reset-password', [
            'token' => 'wrong-token',
            'email' => 'test@liling.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123'
        ]);

        $response->assertStatus(400);
        $response->assertJsonFragment([
            'success' => false,
            'message' => 'This password reset token is invalid.'
        ]);

        // 2. Expired token (created 61 minutes ago)
        $token = 'expired-token-123456';
        DB::table('password_reset_tokens')->insert([
            'email' => 'test@liling.com',
            'token' => $token,
            'created_at' => Carbon::now()->subMinutes(61)
        ]);

        $responseExpired = $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => 'test@liling.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123'
        ]);

        $responseExpired->assertStatus(400);
        $responseExpired->assertJsonFragment([
            'success' => false,
            'message' => 'This password reset token has expired.'
        ]);
    }
}
