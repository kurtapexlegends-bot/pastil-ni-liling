<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\InvalidatesAnalyticsCache;

class WorkShift extends Model
{
    use HasFactory;
    use InvalidatesAnalyticsCache;

    protected $fillable = [
        'user_id',
        'hub_id',
        'clock_in',
        'clock_out',
        'hourly_rate',
        'total_break_minutes',
        'current_break_start',
        'status',
    ];

    protected $casts = [
        'clock_in' => 'datetime',
        'clock_out' => 'datetime',
        'current_break_start' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function hub()
    {
        return $this->belongsTo(Hub::class);
    }
}
