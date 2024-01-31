<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory,SoftDeletes;

    protected $guarded = ['id'];


    public function order_detail(){
        return $this->hasMany(OrderDetail::class,'order_id','id');
    }

    public function people(){
        return $this->belongsTo(People::class,'people_id','id');
    }


    public function payment_method(){
        return $this->belongsTo(PaymentMethod::class,'payment_method_id','id');
    }


}
