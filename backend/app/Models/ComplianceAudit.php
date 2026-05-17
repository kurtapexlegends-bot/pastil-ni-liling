<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ComplianceAudit extends Model
{
    use HasFactory;

    protected $fillable = [
        'hub_id',
        'auditor_id',
        'audit_date',
        'hygiene_score',
        'recipe_adherence_score',
        'kitchen_photo_path',
        'notes',
        'status',
    ];

    public function hub()
    {
        return $this->belongsTo(Hub::class);
    }

    public function auditor()
    {
        return $this->belongsTo(User::class, 'auditor_id');
    }
}
