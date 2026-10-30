<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class KnowledgeItem extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'category_id',
        'printer_id',
        'title',
        'type',
        'status',
        'body',
        'video_path',
        'views',
        'rejection_reason',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $appends = ['average_rating', 'ratings_count', 'is_saved'];

    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
        ];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function printer(): BelongsTo
    {
        return $this->belongsTo(Printer::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(KnowledgeMedia::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(KnowledgeComment::class);
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(KnowledgeRating::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(ContentReport::class);
    }

    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', 'approved');
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (! $term) {
            return $query;
        }

        return $query->where(function (Builder $inner) use ($term) {
            $inner->where('title', 'like', "%{$term}%")
                ->orWhere('body', 'like', "%{$term}%")
                ->orWhere('type', 'like', "%{$term}%");
        });
    }

    public function getAverageRatingAttribute(): float
    {
        if (array_key_exists('ratings_avg_score', $this->attributes)) {
            return round((float) $this->attributes['ratings_avg_score'], 2);
        }

        return round((float) $this->ratings()->avg('score'), 2);
    }

    public function getRatingsCountAttribute(): int
    {
        if (array_key_exists('ratings_count', $this->attributes)) {
            return (int) $this->attributes['ratings_count'];
        }

        return $this->ratings()->count();
    }

    public function getIsSavedAttribute(): bool
    {
        $user = auth()->user();
        if (! $user) {
            return false;
        }

        if ($this->relationLoaded('saves')) {
            return $this->saves->isNotEmpty();
        }

        return SavedItem::query()
            ->where('user_id', $user->id)
            ->where('knowledge_item_id', $this->id)
            ->exists();
    }

    public function saves(): HasMany
    {
        return $this->hasMany(SavedItem::class);
    }
}
