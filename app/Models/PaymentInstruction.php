<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentInstruction extends Model
{
    use HasFactory,SoftDeletes;

    protected $guarded = ['id'];

    public function payment_method(){
        return $this->belongsTo(PaymentMethod::class,'payment_method_id','id');
    }
}
