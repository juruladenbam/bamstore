<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentMethod extends Model
{
    use HasFactory,SoftDeletes;

    protected $guarded = ['id'];


    public function order(){
        return $this->hasMany(Order::class,'payment_method_id','id');
    }

    public function payment_intruction(){
        return $this->hasMany(PaymentInstruction::class,'payment_method_id','id');
    }
}
