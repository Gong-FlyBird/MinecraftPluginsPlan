import { useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import BookmarkPicker from './BookmarkPicker';

export default function BookmarkButton({
  pluginId, pluginName,
  bookmarkCollections = [],
  onAddPluginToBookmark, onRemovePluginFromBookmark, onAddBookmarkCollection,
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const inBookmarks = bookmarkCollections
    .filter(c => c.pluginIds.includes(pluginId))
    .map(c => c.id);

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setPickerOpen(true); }}
        className={`glass-btn !p-1 !border-0 hover:!bg-hermes-gold/8 transition-opacity flex-shrink-0 ${
          inBookmarks.length > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
        title="收藏"
      >
        {inBookmarks.length > 0
          ? <BookmarkCheck size={11} className="text-hermes-gold" />
          : <Bookmark size={11} className="text-hermes-text-muted/40" />
        }
      </button>

      <BookmarkPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        pluginId={pluginId}
        pluginName={pluginName}
        bookmarkCollections={bookmarkCollections}
        onAddPluginToBookmark={onAddPluginToBookmark}
        onRemovePluginFromBookmark={onRemovePluginFromBookmark}
        onAddBookmarkCollection={onAddBookmarkCollection}
      />
    </>
  );
}
