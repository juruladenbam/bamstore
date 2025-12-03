<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $fillable = ['name', 'slug'];

    protected static function booted()
    {
        static::saving(function ($category) {
            $source = null;

            if ($category->isDirty('slug') && !empty($category->slug)) {
                $source = $category->slug;
            } elseif (empty($category->slug)) {
                $source = $category->name;
            }

            if ($source) {
                $slug = \Illuminate\Support\Str::slug($source);
                $originalSlug = $slug;
                $count = 1;
                while (static::where('slug', $slug)->where('id', '!=', $category->id)->exists()) {
                    $slug = $originalSlug . '-' . $count;
                    $count++;
                }
                $category->slug = $slug;
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
