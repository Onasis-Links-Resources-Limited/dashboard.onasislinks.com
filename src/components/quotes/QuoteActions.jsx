import { useState } from "react";
import {
  FileText,
  XCircle,
  PackageCheck,
  PackageSearch,
  Trash2,
  AlertCircle,
} from "lucide-react";
import ConfirmDialog from "../common/ConfirmDialog";

// eslint-disable-next-line react-refresh/only-export-components
export const STATUS_TRANSITIONS = {
  pending: { label: "Pending", allowedActions: ["generateProforma", "reject"] },
  quoted: { label: "Quoted", allowedActions: ["recordPO", "reject"] },
  accepted: { label: "Accepted", allowedActions: ["complete"] },
  rejected: { label: "Rejected", allowedActions: [] },
  completed: { label: "Completed", allowedActions: [] },
  expired: { label: "Expired", allowedActions: [] },
};

const QuoteActions = ({
  quote,
  onOpenProforma,
  onOpenRecordPO,
  onStatusChange,
  onDelete,
  canDelete = true,
}) => {
  const [pendingAction, setPendingAction] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!quote) return null;

  const hasItems = (quote.items?.length || 0) > 0;
  const allowedActions = STATUS_TRANSITIONS[quote.status]?.allowedActions || [];
  const canGenerateProforma = allowedActions.includes("generateProforma") && hasItems;
  const needsItemsWarning =
    allowedActions.includes("generateProforma") && !hasItems;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      if (pendingAction === "delete") {
        await onDelete(quote);
      } else if (pendingAction === "reject") {
        await onStatusChange(quote, "rejected");
      } else if (pendingAction === "complete") {
        await onStatusChange(quote, "completed");
      }
      setPendingAction(null);
    } finally {
      setSubmitting(false);
    }
  };

  const dialogConfig = {
    delete: {
      title: `Delete quote ${quote.quoteNumber}?`,
      description:
        "This will permanently remove this quote. This action cannot be undone.",
      confirmLabel: "Delete",
      danger: true,
    },
    reject: {
      title: `Reject quote ${quote.quoteNumber}?`,
      description: `This will mark quote ${quote.quoteNumber} as rejected. The customer will be notified.`,
      confirmLabel: "Reject",
      danger: true,
    },
    complete: {
      title: `Mark quote ${quote.quoteNumber} as completed?`,
      description: "This confirms the order has been delivered.",
      confirmLabel: "Mark as Completed",
      danger: false,
    },
  }[pendingAction];

  return (
    <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
        Actions
      </h2>

      <div className="flex flex-wrap gap-2">
        {allowedActions.length === 0 && !canDelete && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No further actions available.
          </p>
        )}

        {/* ✅ Only render the proforma button when there are items */}
        {canGenerateProforma && (
          <button
            onClick={onOpenProforma}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#C3110C] text-white hover:bg-[#a80e0a] transition-colors"
          >
            <FileText className="w-4 h-4" />
            Generate Proforma Invoice
          </button>
        )}

        {/* ✅ Warning replaces the button, not alongside it */}
        {needsItemsWarning && (
          <div className="w-full flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                No items on this quote
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                A proforma invoice can't be generated. Delete this quote or ask
                the customer to submit a new request.
              </p>
            </div>
          </div>
        )}

        {allowedActions.includes("recordPO") && (
          <button
            onClick={onOpenRecordPO}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            <PackageSearch className="w-4 h-4" />
            Record Purchase Order
          </button>
        )}

        {allowedActions.includes("complete") && (
          <button
            onClick={() => setPendingAction("complete")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            <PackageCheck className="w-4 h-4" />
            Mark as Completed
          </button>
        )}

        {allowedActions.includes("reject") && (
          <button
            onClick={() => setPendingAction("reject")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
        )}

        {canDelete && (
          <button
            onClick={() => setPendingAction("delete")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        )}
      </div>

      <ConfirmDialog
        open={!!pendingAction}
        title={dialogConfig?.title}
        description={dialogConfig?.description}
        confirmLabel={dialogConfig?.confirmLabel}
        danger={dialogConfig?.danger}
        loading={submitting}
        onConfirm={handleConfirm}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
};

export default QuoteActions;