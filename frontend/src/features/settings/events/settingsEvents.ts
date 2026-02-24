/**
 * Settings Events - Event Naming Convention Constants
 * 
 * This file defines all event names for the Settings feature following the
 * standardized naming convention: <feature>.<entity>.<action>
 * 
 * All actions MUST use past tense to represent completed facts.
 * 
 * @module features/settings/events
 */

import { EventPayload } from '@/core/observer/types';

/**
 * Settings event names - use these constants for publishing/subscribing
 */
export const SettingsEvents = {
  /** Settings were updated */
  UPDATED: 'settings.updated',
  
  /** A user preference was changed */
  PREFERENCE_CHANGED: 'settings.preferenceChanged',
  
  /** The theme was changed */
  THEME_CHANGED: 'settings.themeChanged',
  
  /** The language was changed */
  LANGUAGE_CHANGED: 'settings.languageChanged',
} as const;

/**
 * Union type of all settings event names
 */
export type SettingsEventName = typeof SettingsEvents[keyof typeof SettingsEvents];

/**
 * =====================================================
 * EVENT PAYLOAD INTERFACES
 * =====================================================
 */

/**
 * Payload for settings.updated event
 */
export interface SettingsUpdatedPayload extends EventPayload {
  userId: string;
  changes: Record<string, unknown>;
  previousValues: Record<string, unknown>;
}

/**
 * Payload for settings.preferenceChanged event
 */
export interface SettingsPreferenceChangedPayload extends EventPayload {
  userId: string;
  preferenceKey: string;
  value: unknown;
  previousValue: unknown;
}

/**
 * Payload for settings.themeChanged event
 */
export interface SettingsThemeChangedPayload extends EventPayload {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
  previousTheme: 'light' | 'dark' | 'system';
  previousResolvedTheme: 'light' | 'dark';
}

/**
 * Payload for settings.languageChanged event
 */
export interface SettingsLanguageChangedPayload extends EventPayload {
  userId: string;
  language: string;
  previousLanguage: string;
}

/**
 * =====================================================
 * TYPE MAPPING
 * =====================================================
 */

export type SettingsEventPayload<T extends SettingsEventName> = 
  T extends typeof SettingsEvents.UPDATED ? SettingsUpdatedPayload :
  T extends typeof SettingsEvents.PREFERENCE_CHANGED ? SettingsPreferenceChangedPayload :
  T extends typeof SettingsEvents.THEME_CHANGED ? SettingsThemeChangedPayload :
  T extends typeof SettingsEvents.LANGUAGE_CHANGED ? SettingsLanguageChangedPayload :
  EventPayload;

export default SettingsEvents;
