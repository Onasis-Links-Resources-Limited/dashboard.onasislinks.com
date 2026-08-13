import React from "react";

export const TableSkeleton = ({ rows = 6, columns = 6 }) => (
  <tbody>
    {Array.from({ length: rows }).map((_, r) => (
      <tr key={r} className="animate-pulse">
        {Array.from({ length: columns }).map((__, c) => (
          <td key={c} className="px-4 py-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          </td>
        ))}
      </tr>
    ))}
  </tbody>
);

export const CardListSkeleton = ({ rows = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="p-4 border rounded animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
    ))}
  </div>
);

export default TableSkeleton;
