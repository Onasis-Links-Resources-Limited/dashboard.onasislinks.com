import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import quoteAPI from "../../api/quoteAPI";
import { useToast } from "../../context/ToastContext";
import QuoteCustomerInfo from "../../components/quotes/QuoteCustomerInfo";
import QuoteItemsList from "../../components/quotes/QuoteItemsList";
import QuoteSummary from "../../components/quotes/QuoteSummary";
import QuoteNotes from "../../components/quotes/QuoteNotes";
import QuoteTimeline from "../../components/quotes/QuoteTimeline";
import QuoteActions from "../../components/quotes/QuoteActions";
import QuoteProformaPanel from "../../components/quotes/QuoteProformaPanel";
import QuotePurchaseOrderPanel from "../../components/quotes/QuotePurchaseOrderPanel";
import QuoteDownloadMenu from "../../components/quotes/QuoteDownloadMenu";
import StatusBadge from "../../components/common/StatusBadge";
import EmptyState from "../../components/common/EmptyState";
import { formatDate } from "../../libs/utils";
import { formatCurrency } from "../../utils/format";

const QuoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [isProformaOpen, setIsProformaOpen] = useState(false);
  const [isRecordPOOpen, setIsRecordPOOpen] = useState(false);

  const fetchQuote = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await quoteAPI.getById(id);
      setQuote(data);
    } catch (err) {
      setError(
        err?.status === 404
          ? `Quote ${id} not found.`
          : "Unable to load the requested quote.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  const handleStatusChange = async (targetQuote, status) => {
    setBusy(true);
    try {
      const updated = await quoteAPI.updateStatus(targetQuote.id, status);
      setQuote(updated);
      toast.success(`Quote ${status} successfully.`);
    } catch {
      toast.error("Failed to update quote status.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (targetQuote) => {
    setBusy(true);
    try {
      await quoteAPI.delete(targetQuote.id);
      toast.success(`Quote ${targetQuote.id} deleted successfully.`);
      navigate("/dashboard/quotes");
    } catch {
      toast.error("Failed to delete quote.");
    } finally {
      setBusy(false);
    }
  };

  const handleGenerateProforma = async (payload) => {
    setBusy(true);
    try {
      const updated = await quoteAPI.generateProforma(id, payload);
      setQuote(updated);
      setIsProformaOpen(false);
      toast.success("Proforma Invoice generated successfully.");
    } catch {
      toast.error("Failed to generate Proforma Invoice.");
    } finally {
      setBusy(false);
    }
  };

  const handleRecordPurchaseOrder = async (payload) => {
    setBusy(true);
    try {
      const updated = await quoteAPI.recordPurchaseOrder(id, payload);
      setQuote(updated);
      setIsRecordPOOpen(false);
      toast.success("Purchase Order recorded successfully.");
    } catch {
      toast.error("Failed to record Purchase Order.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
        <div className="grid gap-6 xl:grid-cols-[1.6fr_0.95fr]">
          <div className="space-y-4">
            <div className="h-40 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="h-72 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-40 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="h-40 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Unable to load quote"
        description={error}
        actionLabel="Back to Quotes"
        onAction={() => navigate("/dashboard/quotes")}
      />
    );
  }

  if (!quote) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="space-y-3">
          <button
            onClick={() => navigate("/dashboard/quotes")}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#C3110C] hover:text-[#a80e0a]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quotes
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Quote Details
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Review and manage quote {quote.id} for {quote.customer.name}.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="space-y-1 text-right">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Total Amount
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(quote.summary.totalAmount)}
            </p>
          </div>
          <StatusBadge status={quote.status} />
          <QuoteDownloadMenu quote={quote} disabled={!quote.proforma} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.95fr]">
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Quote Information
              </h2>
              <div className="grid gap-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Quote ID
                  </span>
                  <span>{quote.id}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Quote Number
                  </span>
                  <span>{quote.quoteNumber}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Requested
                  </span>
                  <span>{formatDate(quote.date)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Valid Until
                  </span>
                  <span>{quote.validUntil}</span>
                </div>
              </div>
            </div>
            <QuoteCustomerInfo customer={quote.customer} />
          </div>

          <QuoteItemsList items={quote.items} />
          <QuoteNotes notes={quote.notes} />

          <QuoteTimeline timeline={quote.timeline} />
        </div>

        <div className="space-y-6">
          <QuoteSummary summary={quote.summary} />

          <QuoteActions
            quote={quote}
            onOpenProforma={() => setIsProformaOpen(true)}
            onOpenRecordPO={() => setIsRecordPOOpen(true)}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            canDelete={
              quote.status !== "approved" && quote.status !== "completed"
            }
          />

          {quote.proforma && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Proforma Invoice
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Generated for this quote.
                  </p>
                </div>
                <FileText className="w-5 h-5 text-[#C3110C]" />
              </div>
              <div className="grid gap-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Number
                  </span>
                  <span>{quote.proforma.number}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Sent
                  </span>
                  <span>{quote.proforma.sentDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Valid Until
                  </span>
                  <span>{quote.proforma.validUntil}</span>
                </div>
              </div>
            </div>
          )}

          {quote.purchaseOrder && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Purchase Order
              </h2>
              <div className="grid gap-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">
                    PO Number
                  </span>
                  <span>{quote.purchaseOrder.poNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Received
                  </span>
                  <span>{quote.purchaseOrder.receivedDate}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <QuoteProformaPanel
        open={isProformaOpen}
        quote={quote}
        onGenerate={handleGenerateProforma}
        onCancel={() => setIsProformaOpen(false)}
      />

      <QuotePurchaseOrderPanel
        open={isRecordPOOpen}
        quote={quote}
        onSubmit={handleRecordPurchaseOrder}
        onCancel={() => setIsRecordPOOpen(false)}
      />
    </div>
  );
};

export default QuoteDetail;
