import { StickyNote } from "lucide-react";

/** Notes / terms section, visually distinct from the items table. */
const QuoteNotes = ({ notes }) => {
  if (!notes) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/40 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-2">
        <StickyNote className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-300">
          Notes & Terms
        </h2>
      </div>
      <p className="text-sm text-amber-800 dark:text-amber-200/90 leading-relaxed">
        {notes}
      </p>
    </div>
  );
};

export default QuoteNotes;
