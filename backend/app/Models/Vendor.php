<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vendor extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'contact_info', 'address'];

    protected static function booted()
    {
        static::saving(function ($vendor) {
            $source = null;

            if ($vendor->isDirty('slug') && !empty($vendor->slug)) {
                $source = $vendor->slug;
            } elseif (empty($vendor->slug)) {
                $source = $vendor->name;
            }

            if ($source) {
                $slug = \Illuminate\Support\Str::slug($source);
                $originalSlug = $slug;
                $count = 1;
                while (static::where('slug', $slug)->where('id', '!=', $vendor->id)->exists()) {
                    $slug = $originalSlug . '-' . $count;
                    $count++;
                }
                $vendor->slug = $slug;
            }
        });
    }

    public function getRouteKeyName()
    {
        return 'slug';
    }

    public function resolveRouteBinding($value, $field = null)
    {
        return $this->where('slug', $value)->orWhere('id', $value)->firstOrFail();
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
