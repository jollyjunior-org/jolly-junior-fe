import React, { useMemo } from 'react';
import type { StoreTag } from '@/types';

interface TagMultiSelectProps {
  /** All tags from Control → Tags (the only options allowed). */
  tags: StoreTag[];
  /** Currently selected tag IDs. */
  selectedIds: string[];
  /** Called when selection changes. Args: next selected tag id list. */
  onChange: (nextIds: string[]) => void;
  /** Optional short helper under the control. */
  hint?: string;
  /** Disable interaction. */
  disabled?: boolean;
}

/**
 * Pick product/campaign tags only from the Tags table list.
 * Horizontal toggle buttons — no free typing, no search.
 */
export const TagMultiSelect: React.FC<TagMultiSelectProps> = ({
  tags,
  selectedIds,
  onChange,
  hint,
  disabled = false,
}) => {
  const selected = useMemo(
    () => tags.filter((t) => selectedIds.includes(t.id)),
    [tags, selectedIds],
  );

  /** Toggle one tag id on/off in the selection. */
  const toggle = (tagId: string) => {
    if (disabled) return;
    if (selectedIds.includes(tagId)) {
      onChange(selectedIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedIds, tagId]);
    }
  };

  if (tags.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50 px-3 py-2.5">
        <p className="text-[11px] font-bold text-amber-800">
          No tags yet. Create them in Admin → Control → Tags, then pick them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => {
          const on = selectedIds.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              disabled={disabled}
              onClick={() => toggle(tag.id)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer transition-colors ${
                on
                  ? 'text-white border-transparent'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
              style={on ? { backgroundColor: tag.color } : undefined}
              title={tag.name}
            >
              {tag.label}
            </button>
          );
        })}
      </div>
      {selected.length === 0 ? (
        <p className="text-[10px] text-slate-400">
          {hint || 'Tap tags from your Tags list to select them.'}
        </p>
      ) : (
        <p className="text-[10px] text-slate-400">
          {hint || `${selected.length} selected — same tags on campaigns pull matching products.`}
        </p>
      )}
    </div>
  );
};
