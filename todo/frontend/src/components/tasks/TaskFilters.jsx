import { useState } from 'react'

function TaskFilters({ tags, filters, onFilterChange }) {
  const [search, setSearch] = useState('')

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearch(value)
    onFilterChange({ ...filters, search: value || undefined })
  }

  const handlePriorityChange = (e) => {
    const value = e.target.value
    onFilterChange({ ...filters, priority: value || undefined })
  }

  const handleStatusChange = (e) => {
    const value = e.target.value
    if (value === '') {
      const { is_completed, ...rest } = filters
      onFilterChange(rest)
    } else {
      onFilterChange({ ...filters, is_completed: value === 'true' })
    }
  }

  const handleTagChange = (e) => {
    const value = e.target.value
    onFilterChange({ ...filters, tag_id: value || undefined })
  }

  const clearFilters = () => {
    setSearch('')
    onFilterChange({})
  }

  const hasFilters = search || filters.priority || filters.is_completed !== undefined || filters.tag_id

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-bold mb-4">Filters</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Search
          </label>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search tasks..."
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Priority
          </label>
          <select
            value={filters.priority || ''}
            onChange={handlePriorityChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Status
          </label>
          <select
            value={
              filters.is_completed === undefined
                ? ''
                : filters.is_completed
                ? 'true'
                : 'false'
            }
            onChange={handleStatusChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Tasks</option>
            <option value="false">Incomplete</option>
            <option value="true">Completed</option>
          </select>
        </div>
        
        {tags.length > 0 && (
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Tag
            </label>
            <select
              value={filters.tag_id || ''}
              onChange={handleTagChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Tags</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  )
}

export default TaskFilters
