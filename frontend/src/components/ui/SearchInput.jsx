/**
 * ============================================================================
 * SearchInput Component
 *
 * Production-ready, accessible search input with:
 * - Debounced input handling
 * - Keyboard shortcuts (/)
 * - Clear button
 * - Loading indicator
 * - Suggestions dropdown
 * - Full ARIA support
 * ============================================================================
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Close as CloseIcon, Search as SearchIcon } from '@mui/icons-material';

/**
 * Debounce hook for input handling
 */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * SearchInput Component
 *
 * @param {Object} props - Component props
 * @param {string} props.value - Current search value
 * @param {function} props.onChange - Callback when value changes
 * @param {function} props.onSubmit - Callback when search is submitted
 * @param {function} props.onClear - Callback when search is cleared
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.loading - Show loading indicator
 * @param {Array} props.suggestions - Array of suggestion strings
 * @param {function} props.onSuggestionSelect - Callback when a suggestion is selected
 * @param {boolean} props.showSuggestions - Whether to show suggestions dropdown
 * @param {string} props.size - Size variant (small, medium, large)
 * @param {boolean} props.fullWidth - Whether to take full width
 * @param {Object} props.style - Additional inline styles
 * @param {string} props.ariaLabel - Custom aria-label
 * @param {string} props.id - Input element ID
 */
function SearchInput({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = 'Search...',
  loading = false,
  suggestions = [],
  onSuggestionSelect,
  showSuggestions = false,
  size = 'medium',
  fullWidth = true,
  style = {},
  ariaLabel = 'Search tasks, projects, and tags',
  id = `search-input-${Math.random().toString(36).substr(2, 9)}`,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value || '');
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const containerRef = useRef(null);

  // Debounced value for suggestions
  const debouncedValue = useDebounce(localValue, 200);

  // Sync with external value
  useEffect(() => {
    if (value !== undefined) {
      setLocalValue(value);
    }
  }, [value]);

  // Keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      // "/" or Ctrl+K / Cmd+K to focus
      if (
        (e.key === '/' && !e.ctrlKey && !e.metaKey) ||
        (e.key === 'k' && (e.ctrlKey || e.metaKey))
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Escape to blur and close suggestions
      if (e.key === 'Escape') {
        inputRef.current?.blur();
        if (showSuggestions) {
          // Close suggestions logic
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSuggestions]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions when debounced value changes
  useEffect(() => {
    if (showSuggestions && debouncedValue.length >= 2 && isFocused) {
      onSuggestionSelect?.(debouncedValue);
    }
  }, [debouncedValue, showSuggestions, isFocused, onSuggestionSelect]);

  const handleChange = useCallback(
    (e) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange?.(newValue);
    },
    [onChange]
  );

  const handleSubmit = useCallback(
    (e) => {
      e?.preventDefault();
      onSubmit?.(localValue);
    },
    [localValue, onSubmit]
  );

  const handleClear = useCallback(() => {
    setLocalValue('');
    onChange?.('');
    onClear?.();
    inputRef.current?.focus();
  }, [onChange, onClear]);

  const handleSuggestionClick = useCallback(
    (suggestion) => {
      setLocalValue(suggestion);
      onChange?.(suggestion);
      onSubmit?.(suggestion);
      setIsFocused(false);
    },
    [onChange, onSubmit]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        handleSubmit(e);
      }
    },
    [handleSubmit]
  );

  // Size-based styles
  const sizeStyles = {
    small: { height: '36px', fontSize: '14px', padding: '0 12px' },
    medium: { height: '44px', fontSize: '16px', padding: '0 16px' },
    large: { height: '52px', fontSize: '18px', padding: '0 20px' },
  };

  const currentSize = sizeStyles[size] || sizeStyles.medium;

  const hasValue = localValue.length > 0;
  const showSuggestionsDropdown =
    showSuggestions && isFocused && suggestions.length > 0;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: fullWidth ? '100%' : 'auto',
        ...style,
      }}
    >
      <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--search-bg, #f5f5f5)',
            border: '1px solid var(--search-border, #e0e0e0)',
            borderRadius: '8px',
            padding: '0 12px',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            borderColor: isFocused
              ? 'var(--search-focus, #1976d2)'
              : 'var(--search-border, #e0e0e0)',
            boxShadow: isFocused
              ? '0 0 0 3px var(--search-focus-ring, rgba(25, 118, 210, 0.1))'
              : 'none',
          }}
        >
          <SearchIcon
            sx={{
              color: 'var(--search-icon, #757575)',
              fontSize: size === 'small' ? '20px' : '24px',
              marginRight: '8px',
            }}
            aria-hidden="true"
          />

          <input
            ref={inputRef}
            type="text"
            id={id}
            value={localValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={placeholder}
            aria-label={ariaLabel}
            aria-expanded={showSuggestionsDropdown}
            aria-controls={showSuggestionsDropdown ? `${id}-suggestions` : undefined}
            aria-autocomplete="list"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              fontSize: currentSize.fontSize,
              height: currentSize.height,
              color: 'var(--search-text, #212121)',
              minWidth: 0,
              ...currentSize,
            }}
          />

          {/* Loading indicator */}
          {loading && (
            <span
              style={{
                width: '16px',
                height: '16px',
                border: '2px solid var(--search-border, #e0e0e0)',
                borderTopColor: 'var(--search-focus, #1976d2)',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite',
                marginLeft: '8px',
              }}
              role="status"
              aria-label="Loading"
            >
              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </span>
          )}

          {/* Clear button */}
          {hasValue && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--search-icon, #757575)',
              }}
            >
              <CloseIcon
                sx={{ fontSize: size === 'small' ? '18px' : '20px' }}
              />
            </button>
          )}

          {/* Keyboard shortcut hint */}
          {!hasValue && (
            <kbd
              style={{
                padding: '2px 6px',
                fontSize: '12px',
                border: '1px solid var(--search-border, #e0e0e0)',
                borderRadius: '4px',
                color: 'var(--search-placeholder, #9e9e9e)',
                backgroundColor: 'var(--search-bg, #f5f5f5)',
                marginLeft: '8px',
              }}
              aria-hidden="true"
            >
              /
            </kbd>
          )}
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestionsDropdown && (
        <div
          ref={suggestionsRef}
          id={`${id}-suggestions`}
          role="listbox"
          aria-label="Search suggestions"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            backgroundColor: 'var(--surface, #ffffff)',
            border: '1px solid var(--border, #e0e0e0)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            maxHeight: '300px',
            overflowY: 'auto',
          }}
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              role="option"
              aria-selected={index === 0}
              onClick={() => handleSuggestionClick(suggestion)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                borderBottom: index < suggestions.length - 1 ? '1px solid var(--border, #f0f0f0)' : 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                color: 'var(--text, #212121)',
                transition: 'background-color 0.1s',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--hover-bg, #f5f5f5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SearchIcon sx={{ fontSize: '18px', color: 'var(--text-muted, #9e9e9e)' }} />
                {suggestion}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

SearchInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
  onClear: PropTypes.func,
  placeholder: PropTypes.string,
  loading: PropTypes.bool,
  suggestions: PropTypes.arrayOf(PropTypes.string),
  onSuggestionSelect: PropTypes.func,
  showSuggestions: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  style: PropTypes.object,
  ariaLabel: PropTypes.string,
  id: PropTypes.string,
};

export default SearchInput;
