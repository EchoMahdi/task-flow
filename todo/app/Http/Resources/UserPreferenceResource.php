<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserPreferenceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'theme' => $this->theme,
            'theme_label' => $this->theme ? \App\Models\UserPreference::THEMES[$this->theme] : null,
            'language' => $this->language,
            'language_label' => $this->language ? \App\Models\UserPreference::LANGUAGES[$this->language] : null,
            'email_notifications' => $this->email_notifications,
            'push_notifications' => $this->push_notifications,
            'weekly_digest' => $this->weekly_digest,
            'marketing_emails' => $this->marketing_emails,
            'two_factor_enabled' => $this->two_factor_enabled,
            'session_timeout' => $this->session_timeout,
            'items_per_page' => $this->items_per_page,
            'date_format' => $this->date_format,
            'date_format_label' => $this->date_format ? \App\Models\UserPreference::DATE_FORMATS[$this->date_format] : null,
            'time_format' => $this->time_format,
            'time_format_label' => $this->time_format ? \App\Models\UserPreference::TIME_FORMATS[$this->time_format] : null,
            'start_of_week' => $this->start_of_week,
        ];
    }
}
