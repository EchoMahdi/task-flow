/**
 * LanguageSwitcher Component
 * 
 * A fully independent and reusable component for language selection.
 * This component:
 * - Is self-contained and decoupled from pages/layouts
 * - Can be used in Header, Settings page, Sidebar, or any future component
 * - Controls global language state via I18nContext
 * - Syncs with backend for persistence
 * - Handles RTL/LTR and typography automatically
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useI18n } from '@/context/I18nContext';
import { useTheme } from '@/theme';
import LanguageSwitcherStyles from './LanguageSwitcher.module.css';

/**
 * 
 * @param {Object} props
 * @param {string} props.variant - 'dropdown' | 'toggle' | 'buttons'
 * @param {string} props.size - 'small' | 'medium' | 'large'
 * @param {boolean} props.showLabels - Show language names
 * @param {boolean} props.showFlags - Show flag icons
 * @param {Function} props.onChange - Callback when language changes (optional)
 */
 function LanguageSwitcher({ 
  variant = 'dropdown',
  size = 'medium',
  showLabels = true,
  showFlags = true,
  onChange 
}) {
  const { 
    language, 
    changeLanguage, 
    getLanguages, 
    direction,
    isRTL 
  } = useI18n();
  
  const { colors, spacing } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const languages = getLanguages();
  const currentLang = languages.find((l) => l.code === language) || languages[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event) => {
    switch (event.key) {
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        triggerRef.current?.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex((prev) => 
            prev < languages.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex((prev) => 
          prev > 0 ? prev - 1 : languages.length - 1
        );
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          handleLanguageSelect(languages[focusedIndex].code);
        }
        break;
      default:
        break;
    }
  }, [isOpen, focusedIndex, languages]);

  // Handle language selection
  const handleLanguageSelect = async (langCode) => {
    if (langCode === language || isUpdating) return;
    
    setIsUpdating(true);
    try {
      await changeLanguage(langCode);
      onChange?.(langCode);
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
      setFocusedIndex(-1);
      triggerRef.current?.focus();
    }
  };

  // Focus menu item when focusedIndex changes
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && menuRef.current) {
      const buttons = menuRef.current.querySelectorAll('[role="option"]');
      buttons[focusedIndex]?.focus();
    }
  }, [focusedIndex, isOpen, languages.length]);

  // Get flag emoji for language
  const getFlagEmoji = (langCode) => {
    const flags = {
      en: '🇺🇸',
      fa: '🇮🇷',
    };
    return flags[langCode] || '🌐';
  };

  // Render variant: toggle (icon only)
  if (variant === 'toggle') {
    return (
      <button
        className={LanguageSwitcherStyles.toggleButton}
        onClick={() => handleLanguageSelect(language === 'fa' ? 'en' : 'fa')}
        aria-label={`Switch to ${language === 'fa' ? 'English' : 'Persian'}`}
        title={`Current: ${currentLang.nativeName}`}
        disabled={isUpdating}
      >
        <span style={{ fontSize: '1.2em' }}>{getFlagEmoji(language)}</span>
      </button>
    );
  }

  // Render variant: buttons (horizontal selection)
  if (variant === 'buttons') {
    return (
      <div 
        className={LanguageSwitcherStyles.buttonGroup}
        role="radiogroup"
        aria-label="Select language"
      >
        {languages.map((lang) => (
          <button
            key={lang.code}
            role="radio"
            aria-checked={language === lang.code}
            className={`${LanguageSwitcherStyles.langButton} ${language === lang.code ? LanguageSwitcherStyles.active : ''}`}
            onClick={() => handleLanguageSelect(lang.code)}
            disabled={isUpdating}
          >
            {showFlags && <span>{getFlagEmoji(lang.code)}</span>}
            {showLabels && <span>{lang.nativeName}</span>}
          </button>
        ))}
      </div>
    );
  }

  // Access theme colors directly (useTheme provides complete color object)
  const triggerBg = colors.surface.default;
  const triggerBorder = colors.border.default;
  const triggerHover = colors.action.hover;
  const dropdownBg = colors.surface.default;
  const dropdownBorder = colors.border.default;
  const itemTextColor = colors.text.primary;
  const currentLangColor = colors.text.secondary;

  return (
    <div ref={dropdownRef} className={LanguageSwitcherStyles.dropdown}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={LanguageSwitcherStyles.dropdownTrigger}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={currentLang?.name || 'Select language'}
        style={{
          '--trigger-bg': triggerBg,
          '--trigger-border': triggerBorder,
          '--trigger-hover': triggerHover,
        }}
      >
        {showFlags && (
          <span className={LanguageSwitcherStyles.triggerIcon}>
            {getFlagEmoji(language)}
          </span>
        )}
        {showLabels && (
          <span 
            className={LanguageSwitcherStyles.triggerLabel}
            style={{ color: currentLangColor }}
          >
            {currentLang?.nativeName}
          </span>
        )}
        <svg 
          className={`${LanguageSwitcherStyles.chevron} ${isOpen ? LanguageSwitcherStyles.open : ''}`}
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor"
        >
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className={LanguageSwitcherStyles.dropdownBackdrop}
            onClick={() => {
              setIsOpen(false);
              setFocusedIndex(-1);
              triggerRef.current?.focus();
            }}
          />
          <div
            ref={menuRef}
            className={LanguageSwitcherStyles.dropdownMenu}
            role="listbox"
            aria-label="Available languages"
            dir={direction}
            style={{
              '--dropdown-bg': dropdownBg,
              '--dropdown-border': dropdownBorder,
              '--action-hover': triggerHover,
            }}
          >
            {languages.map((lang, index) => (
              <button
                key={lang.code}
                role="option"
                aria-selected={language === lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                onMouseEnter={() => setFocusedIndex(index)}
                className={`
                  ${LanguageSwitcherStyles.dropdownItem}
                  ${language === lang.code ? LanguageSwitcherStyles.active : ''}
                  ${focusedIndex === index ? LanguageSwitcherStyles.focused : ''}
                `}
              >
                {showFlags && (
                  <span className={LanguageSwitcherStyles.itemIcon}>
                    {getFlagEmoji(lang.code)}
                  </span>
                )}
                <span 
                  className={LanguageSwitcherStyles.itemLabel}
                  style={{ color: itemTextColor }}
                >
                  {lang.nativeName}
                </span>
                {lang.code !== 'en' && lang.code !== 'fa' && (
                  <span className={LanguageSwitcherStyles.itemSubtitle}>
                    {lang.name}
                  </span>
                )}
                {language === lang.code && (
                  <svg 
                    className={LanguageSwitcherStyles.checkmark} 
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default LanguageSwitcher;
