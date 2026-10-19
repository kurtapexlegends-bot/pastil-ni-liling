<?php

namespace App\Models;

use Database\Factories\FranchiseApplicationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FranchiseApplication extends Model
{
    /** @use HasFactory<FranchiseApplicationFactory> */
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'target_location',
        'investment_capacity',
        'experience_summary',
        'status',
    ];
}
