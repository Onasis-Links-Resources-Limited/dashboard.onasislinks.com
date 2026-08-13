import React from "react";

const EmptyState = ({
  icon: Icon,
  title = "No data",
  description = "",
  actionLabel,
  onAction,
}) => {
  return (
    <div className="p-8 text-center">
      {Icon && <Icon className="mx-auto w-10 h-10 text-gray-400" />}
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      )}
      {actionLabel && (
        <div className="mt-4">
          <button
            onClick={onAction}
            className="px-4 py-2 rounded bg-[#C3110C] text-white"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
