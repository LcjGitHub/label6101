interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onClear?: () => void
  placeholder?: string
}

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = '搜索消息内容...',
}: SearchInputProps) {
  const handleClear = () => {
    onChange('')
    onClear?.()
  }

  return (
    <div className="search-bar">
      <label htmlFor="search-query">内容搜索</label>
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          id="search-query"
          type="text"
          className="pager-input search-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={50}
        />
      </div>
      {value && (
        <button
          type="button"
          className="pager-btn pager-btn-sm search-clear-btn"
          onClick={handleClear}
          title="清除搜索"
        >
          清除
        </button>
      )}
    </div>
  )
}
