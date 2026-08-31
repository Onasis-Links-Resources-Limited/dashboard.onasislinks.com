import { Mail, Phone, MapPin, Building2 } from "lucide-react";

const InfoRow = ({ icon: Icon, children }) => (
  <div className="flex items-start gap-3 text-sm">
    <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
    <span className="text-gray-700 dark:text-gray-300 break-words">
      {children}
    </span>
  </div>
);

/** Customer details card shown on the Quote Detail page. */
const QuoteCustomerInfo = ({ customer }) => {
  if (!customer) return null;

  return (
    <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
        Customer Information
      </h2>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#C3110C] to-[#E6501B] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
          {customer.name?.charAt(0) || "?"}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {customer.name}
          </p>
          {customer.company && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {customer.company}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {customer.email && (
          <InfoRow icon={Mail}>
            <a
              href={`mailto:${customer.email}`}
              className="hover:text-[#C3110C] dark:hover:text-[#E6501B] hover:underline"
            >
              {customer.email}
            </a>
          </InfoRow>
        )}
        {customer.phone && (
          <InfoRow icon={Phone}>
            <a
              href={`tel:${customer.phone}`}
              className="hover:text-[#C3110C] dark:hover:text-[#E6501B] hover:underline"
            >
              {customer.phone}
            </a>
          </InfoRow>
        )}
        {customer.address && (
          <InfoRow icon={MapPin}>{customer.address}</InfoRow>
        )}
        {customer.company && (
          <InfoRow icon={Building2}>{customer.company}</InfoRow>
        )}
      </div>
    </div>
  );
};

export default QuoteCustomerInfo;
