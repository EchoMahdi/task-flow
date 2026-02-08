<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserPreference;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

/**
 * Theme Settings Controller
 * 
 * Handles API endpoints for user theme preferences including:
 * - Theme mode (light/dark/system)
 * - Locale/language preference
 * - Accessibility settings (reduced motion, high contrast, font scale)
 */
class ThemeController extends Controller
{
    /**
     * Get current user's theme settings
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'You must be logged in to view theme settings'
            ], 401);
        }
        
        $preferences = $user->preferences ?? new UserPreference();
        
        return response()->json([
            'theme_mode' => $preferences->theme ?? 'system',
            'locale' => $preferences->language ?? 'en',
            'preferences' => [
                'reduced_motion' => $preferences->reduced_motion ?? false,
                'high_contrast' => $preferences->high_contrast ?? false,
                'font_scale' => $preferences->font_scale ?? 1.0,
            ],
            'updated_at' => $preferences->updated_at ? $preferences->updated_at->toIso8601String() : null,
        ]);
    }
    
    /**
     * Update user's theme settings
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'You must be logged in to update theme settings'
            ], 401);
        }
        
        $validator = Validator::make($request->all(), [
            'theme_mode' => 'nullable|in:light,dark,system',
            'locale' => 'nullable|in:en,fa',
            'preferences.reduced_motion' => 'nullable|boolean',
            'preferences.high_contrast' => 'nullable|boolean',
            'preferences.font_scale' => 'nullable|numeric|min:0.8|max:1.5',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'message' => $validator->errors()->first()
            ], 422);
        }
        
        $preferences = $user->preferences()->first() ?? new UserPreference(['user_id' => $user->id]);
        
        if (!$preferences) {
            $preferences = new UserPreference(['user_id' => $user->id]);
        }
        
        // Update theme mode (map to existing 'theme' field)
        if ($request->has('theme_mode')) {
            $preferences->theme = $request->theme_mode;
        }
        
        // Update locale (map to existing 'language' field)
        if ($request->has('locale')) {
            $preferences->setAttribute('language', $request->locale);
        }
        
        // Update accessibility preferences
        if ($request->has('preferences')) {
            $prefs = $request->preferences;
            
            if (isset($prefs['reduced_motion'])) {
                $preferences->reduced_motion = $prefs['reduced_motion'];
            }
            
            if (isset($prefs['high_contrast'])) {
                $preferences->high_contrast = $prefs['high_contrast'];
            }
            
            if (isset($prefs['font_scale'])) {
                $preferences->font_scale = (float) $prefs['font_scale'];
            }
        }
        
        $preferences->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Theme settings updated successfully',
            'data' => [
                'theme_mode' => $preferences->theme,
                'locale' => $preferences->language,
                'preferences' => [
                    'reduced_motion' => $preferences->reduced_motion,
                    'high_contrast' => $preferences->high_contrast,
                    'font_scale' => $preferences->font_scale,
                ],
                'updated_at' => $preferences->updated_at->toIso8601String(),
            ]
        ]);
    }
    
    /**
     * Update only theme mode
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateMode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'theme_mode' => 'required|in:light,dark,system',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'message' => $validator->errors()->first()
            ], 422);
        }
        
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        $preferences = $user->preferences ?? new UserPreference(['user_id' => $user->id]);
        $preferences->theme = $request->theme_mode;
        $preferences->save();
        
        return response()->json(['success' => true, 'theme_mode' => $preferences->theme]);
    }
    
    /**
     * Update only locale
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateLocale(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'locale' => 'required|in:en,fa',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'message' => $validator->errors()->first()
            ], 422);
        }
        
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        $preferences = $user->preferences ?? new UserPreference(['user_id' => $user->id]);
        $preferences->language = $request->locale;
        $preferences->save();
        
        return response()->json(['success' => true, 'locale' => $preferences->language]);
    }
    
    /**
     * Update accessibility preferences
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatePreferences(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reduced_motion' => 'nullable|boolean',
            'high_contrast' => 'nullable|boolean',
            'font_scale' => 'nullable|numeric|min:0.8|max:1.5',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'message' => $validator->errors()->first()
            ], 422);
        }
        
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        $preferences = $user->preferences ?? new UserPreference(['user_id' => $user->id]);
        
        if ($request->has('reduced_motion')) {
            $preferences->reduced_motion = $request->reduced_motion;
        }
        
        if ($request->has('high_contrast')) {
            $preferences->high_contrast = $request->high_contrast;
        }
        
        if ($request->has('font_scale')) {
            $preferences->font_scale = (float) $request->font_scale;
        }
        
        $preferences->save();
        
        return response()->json([
            'success' => true,
            'preferences' => [
                'reduced_motion' => $preferences->reduced_motion,
                'high_contrast' => $preferences->high_contrast,
                'font_scale' => $preferences->font_scale,
            ],
        ]);
    }
    
    /**
     * Reset theme settings to defaults
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function reset()
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        $preferences = $user->preferences ?? new UserPreference(['user_id' => $user->id]);
        
        // Reset to defaults
        $preferences->theme = 'system';
        $preferences->language = 'en';
        $preferences->reduced_motion = false;
        $preferences->high_contrast = false;
        $preferences->font_scale = 1.0;
        
        $preferences->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Theme settings reset to defaults',
            'data' => [
                'theme_mode' => $preferences->theme,
                'locale' => $preferences->language,
                'preferences' => [
                    'reduced_motion' => $preferences->reduced_motion,
                    'high_contrast' => $preferences->high_contrast,
                    'font_scale' => $preferences->font_scale,
                ],
            ],
        ]);
    }
}
