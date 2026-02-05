import React, { useState } from 'react';
import { useTranslation } from '../../context/I18nContext';
import { Icons } from '../ui/Icons';

/**
 * CalendarFilters Component
 * 
 * Provides filtering options for the calendar view:
 * - Status filter (all, pending, in_progress, completed)
 * - Priority filter (low, medium, high, urgent)
 * - Include completed toggle
 * - Date range quick filters
 */
const CalendarFilters = ({
  filters,
  onChange,
  availableFormats,
}) => {
  const { t } = useTranslation();
  
  // Local state for dropdown visibility
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  
  // Status options
  const statusOptions = [
    { value: 'pending', label: t('status.pending') },
    { value: 'in_progress', label: t('status.in_progress') },
    { value: 'completed', label: t('status.completed') },
  ];
  
  // Priority options
  const priorityOptions = [
    { value: 'low', label: t('priority.low') },
    { value: 'medium', label: t('priority.medium') },
    { value: 'high', label: t('priority.high') },
    { value: 'urgent', label: t('priority.urgent') },
  ];
  
  // Date range quick filters
  const dateRangeOptions = [
    { value: 'today', label: t('datetime.today') },
    { value: 'this_week', label: t('datetime.thisWeek') },
    { value: 'this_month', label: t('datetime.thisMonth') },
    { value: 'overdue', label: t('datetime.overdue') },
  ];
  
  // Handle status toggle
  const handleStatusToggle = (status) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    
    onChange({ ...filters, status: newStatus });
  };
  
  // Handle priority toggle
  const handlePriorityToggle = (priority) => {
    const newPriority = filters.priority.includes(priority)
      ? filters.priority.filter((p) => p !== priority)
      : [...filters.priority, priority];
    
    onChange({ ...filters, priority: newPriority });
  };
  
  // Handle include completed toggle
  const handleIncludeCompleted = () => {
    onChange({ ...filters, include_completed: !filters.include_completed });
  };
  
  // Handle reset all filters
  const handleReset = () => {
    onChange({
      status: [],
      priority: [],
      include_completed: false,
    });
  };
  
  // Check if any filters are active
  const hasActiveFilters = 
    filters.status.length > 0 || 
    filters.priority.length > 0 || 
    filters.include_completed;
  
  // Get active filter count
  const activeFilterCount = 
    filters.status.length + 
    filters.priority.length + 
    (filters.include_completed ? 1 : 0);
  
  return (
    <div className="calendar-filters">
      <div className="filters-row">
        {/* Status Filter */}
        <div className="filter-dropdown">
          <button
            className={`filter-button ${filters.status.length > 0 ? 'active' : ''}`}
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            aria-expanded={showStatusDropdown}
            aria-haspopup="listbox"
          >
            <Icons.Filter className="w-4 h-4" />
            <span>{t('filters.status')}</span>
            {filters.status.length > 0 && (
              <span className="filter-count">{filters.status.length}</span>
            )}
            <Icons.ChevronDown className="w-4 h-4" />
          </button>
          
          {showStatusDropdown && (
            <div className="dropdown-menu" role="listbox">
              {statusOptions.map((option) => {
                const isSelected = filters.status.includes(option.value);
                return (
                  <button
                    key={option.value}
                    className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleStatusToggle(option.value)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="checkbox">
                      {isSelected && <Icons.Check className="w-3 h-3" />}
                    </span>
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Priority Filter */}
        <div className="filter-dropdown">
          <button
            className={`filter-button ${filters.priority.length > 0 ? 'active' : ''}`}
            onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
            aria-expanded={showPriorityDropdown}
            aria-haspopup="listbox"
          >
            <Icons.Flag className="w-4 h-4" />
            <span>{t('filters.priority')}</span>
            {filters.priority.length > 0 && (
              <span className="filter-count">{filters.priority.length}</span>
            )}
            <Icons.ChevronDown className="w-4 h-4" />
          </button>
          
          {showPriorityDropdown && (
            <div className="dropdown-menu" role="listbox">
              {priorityOptions.map((option) => {
                const isSelected = filters.priority.includes(option.value);
                return (
                  <button
                    key={option.value}
                    className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handlePriorityToggle(option.value)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className={`priority-indicator ${option.value}`}>
                      <Icons.Flag className="w-3 h-3" />
                    </span>
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Include Completed Toggle */}
        <button
          className={`filter-toggle ${filters.include_completed ? 'active' : ''}`}
          onClick={handleIncludeCompleted}
        >
          <Icons.CheckCircle className="w-4 h-4" />
          <span>{t('filters.includeCompleted')}</span>
        </button>
        
        {/* Clear Filters */}
        {hasActiveFilters && (
          <button className="clear-filters" onClick={handleReset}>
            <Icons.X className="w-4 h-4" />
            <span>{t('filters.clear')}</span>
          </button>
        )}
      </div>
      
      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="active-filters">
          {filters.status.map((status) => (
            <span key={status} className="filter-tag status">
              {statusOptions.find((o) => o.value === status)?.label}
              <button onClick={() => handleStatusToggle(status)}>
                <Icons.X className="w-3 h-3" />
              </button>
            </span>
          ))}
          
          {filters.priority.map((priority) => (
            <span key={priority} className={`filter-tag priority ${priority}`}>
              {priorityOptions.find((o) => o.value === priority)?.label}
              <button onClick={() => handlePriorityToggle(priority)}>
                <Icons.X className="w-3 h-3" />
              </button>
            </span>
          ))}
          
          {filters.include_completed && (
            <span className="filter-tag completed">
              {t('filters.completedIncluded')}
              <button onClick={handleIncludeCompleted}>
                <Icons.X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
      
      {/* Click outside to close dropdowns */}
      {(showStatusDropdown || showPriorityDropdown) && (
        <div
          className="dropdown-backdrop"
          onClick={() => {
            setShowStatusDropdown(false);
            setShowPriorityDropdown(false);
          }}
        />
      )}
      
      <style>{`
        .calendar-filters {
          padding: 12px 16px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .filters-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .filter-dropdown {
          position: relative;
        }
        
        .filter-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 13px;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .filter-button:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }
        
        .filter-button.active {
          background: #eff6ff;
          border-color: #3b82f6;
          color: #1d4ed8;
        }
        
        .filter-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          background: #3b82f6;
          color: white;
          border-radius: 9px;
          font-size: 11px;
          font-weight: 600;
        }
        
        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 13px;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .filter-toggle:hover {
          background: #f3f4f6;
        }
        
        .filter-toggle.active {
          background: #ecfdf5;
          border-color: #10b981;
          color: #059669;
        }
        
        .clear-filters {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          background: none;
          border: none;
          font-size: 13px;
          color: #6b7280;
          cursor: pointer;
          transition: color 0.2s;
        }
        
        .clear-filters:hover {
          color: #ef4444;
        }
        
        .dropdown-menu {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          min-width: 180px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 50;
          padding: 4px;
        }
        
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          background: none;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          color: #374151;
          cursor: pointer;
          transition: background 0.2s;
          text-align: left;
        }
        
        .dropdown-item:hover {
          background: #f3f4f6;
        }
        
        .dropdown-item.selected {
          background: #eff6ff;
          color: #1d4ed8;
        }
        
        .dropdown-item .checkbox {
          width: 16px;
          height: 16px;
          border: 1.5px solid #d1d5db;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .dropdown-item.selected .checkbox {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }
        
        .priority-indicator {
          display: flex;
          align-items: center;
        }
        
        .priority-indicator.low { color: #22c55e; }
        .priority-indicator.medium { color: #f59e0b; }
        .priority-indicator.high { color: #ef4444; }
        .priority-indicator.urgent { color: #dc2626; }
        
        .dropdown-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 40;
        }
        
        .active-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }
        
        .filter-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .filter-tag.status {
          background: #eff6ff;
          color: #1d4ed8;
        }
        
        .filter-tag.priority {
          background: #fef2f2;
          color: #dc2626;
        }
        
        .filter-tag.priority.low {
          background: #ecfdf5;
          color: #059669;
        }
        
        .filter-tag.completed {
          background: #ecfdf5;
          color: #059669;
        }
        
        .filter-tag button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          background: rgba(0, 0, 0, 0.1);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .filter-tag button:hover {
          background: rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default CalendarFilters;
