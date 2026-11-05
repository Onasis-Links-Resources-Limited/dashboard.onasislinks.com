import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Loader2,
  Mail,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";
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
  const token = localStorage.getItem("token");

  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [, setBusy] = useState(false);
  const [isProformaOpen, setIsProformaOpen] = useState(false);
  const [isRecordPOOpen, setIsRecordPOOpen] = useState(false);
  const [resending, setResending] = useState(false);

  // ✅ Derived AFTER quote is declared
  // const hasItems = (quote?.items?.length || 0) > 0;

  const handleResendEmail = async () => {
    if (!quote?.proforma?.number) {
      toast.error("No proforma invoice available to resend.");
      return;
    }

    setResending(true);
    try {
      const result = await api.quotes.resendProforma(token, quote.id);
      if (result.success) {
        toast.success("Proforma email resent successfully!");
        // refresh quote so the banner flips to success
        const refreshed = await api.quotes.getOne(token, id);
        setQuote(refreshed.data || refreshed);
      } else {
        toast.error(result.message || "Failed to resend email.");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to resend email.");
    } finally {
      setResending(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    const loadQuote = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await api.quotes.getOne(token, id);
        const data = result.data || result;

        if (!isActive) return;
        setQuote(data);
      } catch (err) {
        if (!isActive) return;
        setError(
          err?.response?.status === 404
            ? `Quote ${id} not found.`
            : "Unable to load the requested quote.",
        );
      } finally {
        if (isActive) setLoading(false);
      }
    };

    void loadQuote();

    return () => {
      isActive = false;
    };
  }, [id, token]);

  const handleStatusChange = async (targetQuote, status) => {
    setBusy(true);
    try {
      const result = await api.quotes.updateStatus(token, targetQuote.id, status);
      const updated = result.data || result;
      setQuote(updated);
      toast.success(`Quote ${status} successfully.`);
    } catch (err) {
      toast.error(err?.message || "Failed to update quote status.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (targetQuote) => {
    setBusy(true);
    try {
      await api.quotes.delete(token, targetQuote.id);
      toast.success(`Quote ${targetQuote.quoteNumber || targetQuote.id} deleted successfully.`);
      navigate("/dashboard/quotes");
    } catch (err) {
      toast.error(err?.message || "Failed to delete quote.");
    } finally {
      setBusy(false);
    }
  };

  const handleGenerateProforma = async (payload) => {
    setBusy(true);
    try {
      const result = await api.quotes.generateProforma(token, id, payload);
      const updatedQuote = result.data?.quote || result.data;

      if (updatedQuote) setQuote(updatedQuote);
      setIsProformaOpen(false);

      if (result.data?.email_sent === false) {
        toast.error(
          `Proforma generated, but email failed to send. ${result.data?.email_error || ""}`,
          { duration: 8000 },
        );
      } else {
        toast.success("Proforma Invoice generated and sent successfully.");
      }
    } catch (err) {
      const msg =
        err?.message || err?.body?.message || "Failed to generate Proforma Invoice.";
      toast.error(msg, { duration: 6000 });
      // ✅ Re-throw so QuoteProformaPanel can show the inline error too
      throw err;
    } finally {
      setBusy(false);
    }
  };

  const handleRecordPurchaseOrder = async (payload) => {
    setBusy(true);
    try {
      const result = await api.quotes.recordPO(token, id, payload);
      const updated = result.data || result;
      setQuote(updated);
      setIsRecordPOOpen(false);
      toast.success("Purchase Order recorded successfully.");
    } catch (err) {
      toast.error(err?.message || "Failed to record Purchase Order.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-lg bg-gray-200 dark:bg-[#1A1A1A] animate-pulse" />
        <div className="grid gap-6 xl:grid-cols-[1.6fr_0.95fr]">
          <div className="space-y-4">
            <div className="h-40 rounded-2xl bg-gray-200 dark:bg-[#1A1A1A] animate-pulse" />
            <div className="h-72 rounded-2xl bg-gray-200 dark:bg-[#1A1A1A] animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-40 rounded-2xl bg-gray-200 dark:bg-[#1A1A1A] animate-pulse" />
            <div className="h-40 rounded-2xl bg-gray-200 dark:bg-[#1A1A1A] animate-pulse" />
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl p-6 shadow-sm">
        <div className="space-y-3">
          <button
            onClick={() => navigate("/dashboard/quotes")}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#E6501B] hover:text-[#a80e0a]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quotes
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Quote Details
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Review and manage quote{" "}
              <span className="font-bold text-[#E6501B]">{quote.quoteNumber}</span>{" "}
              for <span className="font-bold">{quote.customer?.name}</span>.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="space-y-1 text-right">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Total Amount
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(quote.summary?.totalAmount || 0)}
            </p>
          </div>
          <StatusBadge status={quote.status} />
          <QuoteDownloadMenu quote={quote} disabled={!quote.proforma} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.95fr]">
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Quote Information
              </h2>
              <div className="grid gap-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Quote ID
                  </span>
                  <span className="text-xs">{quote.id}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Quote Number
                  </span>
                  <span>{quote.quoteNumber || quote.quote_number}</span>
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
                  <span>{formatDate(quote.validUntil || "—")}</span>
                </div>
              </div>
            </div>
            <QuoteCustomerInfo customer={quote.customer} />
          </div>

          <QuoteItemsList items={quote.items || []} />
          <QuoteNotes notes={quote.notes} />
          <QuoteTimeline timeline={quote.timeline || []} />
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
              quote.status !== "accepted" && quote.status !== "completed"
            }
          />

          {quote.proforma && (
            <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-xl p-5">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Proforma Invoice
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Generated for this quote.
                  </p>
                </div>
                <FileText className="w-5 h-5 text-[#ED7D00]" />
              </div>

              <div className="grid gap-3 text-sm text-gray-600 dark:text-gray-300 mb-4">
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
                  <span>
                    {quote.proforma.sentDate
                      ? new Date(quote.proforma.sentDate).toLocaleString()
                      : quote.proforma.generatedDate
                        ? new Date(quote.proforma.generatedDate).toLocaleString()
                        : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Valid Until
                  </span>
                  <span>
                    {quote.proforma.validUntil
                      ? new Date(quote.proforma.validUntil).toLocaleString()
                      : "—"}
                  </span>
                </div>
              </div>

              {quote.proforma.emailSent ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 mb-4">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-green-800 dark:text-green-300">
                      Email sent successfully
                    </p>
                    {quote.proforma.emailSentAt && (
                      <p className="text-[10px] text-green-600 dark:text-green-400">
                        {new Date(quote.proforma.emailSentAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 mb-4">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                        Email delivery failed
                      </p>
                      {quote.proforma.emailError && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                          {quote.proforma.emailError}
                        </p>
                      )}
                      <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-1">
                        You can download the Proforma PDF and send it manually
                        instead.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleResendEmail}
                      disabled={resending}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[#ED7D00] hover:bg-[#C46500] text-white transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {resending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          Resend Email
                        </>
                      )}
                    </button>

                    <QuoteDownloadMenu quote={quote} label="Download PDF" />
                  </div>
                </>
              )}
            </div>
          )}

          {quote.purchaseOrder && (
            <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-xl p-5">
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
                  <span>{quote.purchaseOrder.receivedDate || "—"}</span>
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