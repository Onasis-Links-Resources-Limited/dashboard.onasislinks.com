import { Clock } from "lucide-react";

/** Chronological activity feed for a quote (creation, emails, status changes). */
const QuoteTimeline = ({ timeline = [] }) => {
  if (timeline.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
        Activity Timeline
      </h2>

      <ol className="relative border-l border-gray-200 dark:border-gray-800 ml-2 space-y-5">
        {timeline.map((event, i) => (
          <li key={i} className="ml-4">
            <span className="absolute -left-[5px] w-2.5 h-2.5 rounded-full bg-[#C3110C] dark:bg-[#E6501B] mt-1.5" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {event.action}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              <Clock className="w-3 h-3" />
              <span>{event.date}</span>
              <span>·</span>
              <span>{event.user}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default QuoteTimeline;
