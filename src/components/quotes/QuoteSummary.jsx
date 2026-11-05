import { formatCurrency, formatPercentage } from "../../utils/format";

const Row = ({ label, value, muted = false }) => (
  <div className="flex items-center justify-between text-sm py-1.5">
    <span
      className={
        muted
          ? "text-gray-500 dark:text-gray-400"
          : "text-gray-700 dark:text-gray-300"
      }
    >
      {label}
    </span>
    <span
      className={
        muted
          ? "text-gray-500 dark:text-gray-400"
          : "text-gray-900 dark:text-white font-medium"
      }
    >
      {value}
    </span>
  </div>
);

/**
 * Financial breakdown for a quote. Currency is always the numeric value
 * from `summary` — never re-derived from formatted strings — to avoid
 * floating point display errors.
 */
const QuoteSummary = ({ summary }) => {
  if (!summary) return null;

  const {
    subtotal,
    taxRate,
    taxAmount,
    discount,
    totalAmount,
    currency = "NGN",
  } = summary;
  const unpriced = totalAmount === 0 && subtotal === 0;

  if (unpriced) {
    return (
      <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Summary
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Pricing pending — generate a Proforma Invoice to quote this request.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Summary
      </h2>

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        <Row
          label="Subtotal"
          value={formatCurrency(subtotal, currency)}
          muted
        />
        <Row
          label={`Tax (${formatPercentage(taxRate)})`}
          value={formatCurrency(taxAmount, currency)}
          muted
        />
        <Row
          label="Discount"
          value={
            discount > 0
              ? `-${formatCurrency(discount, currency)}`
              : formatCurrency(0, currency)
          }
          muted
        />
      </div>

      <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-200 dark:border-gray-800">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          Total
        </span>
        <span className="text-lg font-bold text-[#C3110C] dark:text-[#E6501B]">
          {formatCurrency(totalAmount, currency)}
        </span>
      </div>
    </div>
  );
};

export default QuoteSummary;
