<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Category extends Model
{
    protected $fillable = ['name', 'slug', 'scope', 'description'];

    protected static function booted(): void
    {
        static::creating(function (Category $category) {
            $category->slug = $category->slug ?: Str::slug($category->name);
        });
    }

    public function knowledgeItems(): HasMany
    {
        return $this->hasMany(KnowledgeItem::class);
    }
}
