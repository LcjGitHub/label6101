interface FilterBarProps {
  value: string
  onChange: (value: string) => void
}

export function FilterBar({ value, onChange }: FilterBarProps) {
  return (
    <div className="filter-bar">
      <label htmlFor="filter-number">号码筛选</label>
      <input
        id="filter-number"
        type="text"
        className="pager-input"
        placeholder="输入号码..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={20}
      />
      {value && (
        <button
          type="button"
          className="pager-btn pager-btn-sm"
          onClick={() => onChange('')}
        >
          CLR
        </button>
      )}
    </div>
  )
}
