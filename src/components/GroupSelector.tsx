import { usePager } from '../context/PagerContext'
import { FILTER_NO_GROUP } from '../context/PagerContext'
import type { Group } from '../types/pager'

interface GroupSelectorProps {
  selectedGroupId: string | null
  onSelect: (groupId: string | null) => void
  showAllOption?: boolean
  showNoGroupOption?: boolean
  showGroupCounts?: boolean
}

export function GroupSelector({
  selectedGroupId,
  onSelect,
  showAllOption = true,
  showNoGroupOption = true,
  showGroupCounts = false,
}: GroupSelectorProps) {
  const { groups, getContactsByGroup } = usePager()

  return (
    <div className="group-selector">
      <div className="group-options">
        {showAllOption && (
          <button
            type="button"
            className={`group-chip ${selectedGroupId === null ? 'active' : ''}`}
            onClick={() => onSelect(null)}
          >
            全部
          </button>
        )}
        {showNoGroupOption && (
          <button
            type="button"
            className={`group-chip ${selectedGroupId === FILTER_NO_GROUP ? 'active' : ''}`}
            onClick={() => onSelect(FILTER_NO_GROUP)}
          >
            未分组
            {showGroupCounts && (
              <span className="group-count">
                ({getContactsByGroup(FILTER_NO_GROUP).length})
              </span>
            )}
          </button>
        )}
        {groups.map((group: Group) => {
          const count = showGroupCounts ? getContactsByGroup(group.id).length : 0
          return (
            <button
              key={group.id}
              type="button"
              className={`group-chip ${selectedGroupId === group.id ? 'active' : ''}`}
              style={
                selectedGroupId === group.id
                  ? { borderColor: group.color, color: group.color, textShadow: `0 0 4px ${group.color}` }
                  : {}
              }
              onClick={() => onSelect(group.id)}
            >
              <span className="group-dot" style={{ background: group.color }} />
              {group.name}
              {showGroupCounts && <span className="group-count">({count})</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
