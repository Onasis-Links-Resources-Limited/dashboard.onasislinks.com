// Mock Quotes API service.
//
// Client requests for quotes arrive from the Onasis website with items and
// quantities but no pricing — pricing is assigned internally when staff
// generate the Proforma Invoice. This mirrors the shape a real backend
// would return, so swapping to real calls later is a matter of replacing
// the function bodies with `api.get/put/delete` calls (see
// src/api/client.js) without touching any component code.
//
//   GET    /api/quotes
//   GET    /api/quotes/:id
//   PUT    /api/quotes/:id/status
//   POST   /api/quotes/:id/proforma       (price items, generate + send Proforma Invoice)
//   POST   /api/quotes/:id/purchase-order (record client's Purchase Order)
//   DELETE /api/quotes/:id
//   GET    /api/quotes/export
//
// Quote lifecycle:
//   pending   -> client request just received from the website, unpriced
//   quoted    -> staff priced the items and sent a Proforma Invoice
//   approved  -> client issued a Purchase Order, order confirmed
//   completed -> order delivered
//   rejected  -> client declined the quote
//   expired   -> quote validity window lapsed before a decision

export const STATUSES = [
  "pending",
  "quoted",
  "approved",
  "rejected",
  "completed",
  "expired",
];

const CUSTOMERS = [
  {
    name: "John Doe",
    email: "john@example.com",
    phone: "+234 801 234 5678",
    company: "Doe Enterprises",
    address: "42, Victoria Island, Lagos, Nigeria",
  },
  {
    name: "Amaka Nwosu",
    email: "amaka.nwosu@brighttel.ng",
    phone: "+234 803 555 1122",
    company: "BrightTel Networks",
    address: "15 Adeola Odeku St, Victoria Island, Lagos",
  },
  {
    name: "Tunde Bakare",
    email: "tunde@lagosfiber.com",
    phone: "+234 805 442 9981",
    company: "Lagos Fiber Co.",
    address: "7 Marina Rd, Lagos Island, Lagos",
  },
  {
    name: "Chioma Eze",
    email: "chioma.eze@skylinktech.ng",
    phone: "+234 809 213 6674",
    company: "SkyLink Technologies",
    address: "23 Ademola Adetokunbo Cres, Abuja",
  },
  {
    name: "Ibrahim Musa",
    email: "ibrahim@northcomm.ng",
    phone: "+234 802 771 3345",
    company: "NorthComm Ltd",
    address: "4 Ahmadu Bello Way, Kaduna",
  },
  {
    name: "Grace Okafor",
    email: "grace.okafor@portnet.ng",
    phone: "+234 807 665 2210",
    company: "PortNet Solutions",
    address: "11 Aba Rd, Port Harcourt",
  },
  {
    name: "Femi Adeyemi",
    email: "femi@westgrid.ng",
    phone: "+234 806 998 4432",
    company: "WestGrid Power & Telecom",
    address: "9 Bodija Rd, Ibadan",
  },
  {
    name: "Ngozi Umeh",
    email: "ngozi.umeh@cloudbase.ng",
    phone: "+234 810 334 5567",
    company: "CloudBase Systems",
    address: "18 Awolowo Rd, Ikoyi, Lagos",
  },
  {
    name: "Baid Technical Services",
    email: "procurement@baidtechnical.com",
    phone: "+234 xxx xxx xxxx",
    company: "Baid Technical Services Company Limited",
    address: "12 Ada George Road, Port Harcourt, Nigeria",
  },
];

// unitPrice here is the internal reference/cost price used to seed mock
// data for quotes that are already past the pricing stage. Prices quoted
// to the client always come from the Proforma Invoice, never this table.
const PRODUCT_CATALOG = [
  {
    productId: "P-001",
    name: "Fiber Optic Cable",
    sku: "FO-001",
    unit: "Box",
    unitPrice: 8000,
    specifications: "10m, Single Mode",
  },
  {
    productId: "P-002",
    name: "5G Antenna",
    sku: "5G-002",
    unit: "Set",
    unitPrice: 5000,
    specifications: "High Gain, Outdoor",
  },
  {
    productId: "P-003",
    name: "Cloud Server Module",
    sku: "CL-003",
    unit: "Unit",
    unitPrice: 11000,
    specifications: "12GB RAM, 500GB SSD",
  },
  {
    productId: "P-004",
    name: "Network Switch 24-Port",
    sku: "NW-004",
    unit: "Set",
    unitPrice: 42000,
    specifications: "Gigabit, Managed",
  },
  {
    productId: "P-005",
    name: "Wireless Router AC1200",
    sku: "WR-005",
    unit: "Set",
    unitPrice: 15500,
    specifications: "Dual Band",
  },
  {
    productId: "P-006",
    name: "UPS Backup Unit",
    sku: "UPS-006",
    unit: "Set",
    unitPrice: 27000,
    specifications: "1500VA",
  },
  {
    productId: "P-007",
    name: "CAT6 Ethernet Cable",
    sku: "CB-007",
    unit: "Box",
    unitPrice: 1200,
    specifications: "305m Box",
  },
  {
    productId: "P-008",
    name: "IP Security Camera",
    sku: "CAM-008",
    unit: "Set",
    unitPrice: 9500,
    specifications: "4MP, Night Vision",
  },
  {
    productId: "P-009",
    name: "9U Rack Wall Mount",
    sku: "RK-009",
    unit: "Set",
    unitPrice: 130000,
    specifications: "600mm x 600mm",
  },
  {
    productId: "P-010",
    name: "42U Rack",
    sku: "RK-010",
    unit: "Set",
    unitPrice: 490000,
    specifications: "800mm x 1000mm",
  },
  {
    productId: "P-011",
    name: "PVC Trunk (Round)",
    sku: "PVC-011",
    unit: "M",
    unitPrice: 760,
    specifications: "20mm x 12mm",
  },
];

const NOTES = [
  "Delivery within 5 working days. Payment due within 30 days.",
  "Installation included. 1-year warranty on all hardware.",
  "Prices valid for 30 days from quote date. VAT inclusive.",
  "50% deposit required before order processing.",
  "Free shipping within Lagos. Other states attract logistics fee.",
];

// --- Deterministic mock data generation --------------------------------

const seededRandom = (seed) => {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
};

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

const computeSummary = (items, discount = 0, taxRate = 7.5) => {
  const subtotal = round2(items.reduce((sum, item) => sum + item.total, 0));
  const taxAmount = round2(subtotal * (taxRate / 100));
  const totalAmount = round2(subtotal + taxAmount - discount);
  return {
    subtotal,
    taxRate,
    taxAmount,
    discount,
    totalAmount,
    currency: "NGN",
  };
};

const buildQuote = (index) => {
  const rand = seededRandom(index * 7919 + 13);
  const customer = CUSTOMERS[index % CUSTOMERS.length];
  const status = STATUSES[Math.floor(rand() * STATUSES.length)];
  const priced = status !== "pending"; // pending = raw, unpriced website request

  const itemCount = 1 + Math.floor(rand() * 3);
  const shuffled = [...PRODUCT_CATALOG]
    .sort(() => rand() - 0.5)
    .slice(0, itemCount);
  const items = shuffled.map((p, i) => {
    const quantity = 1 + Math.floor(rand() * 4);
    const unitPrice = priced ? p.unitPrice : 0;
    return {
      id: i + 1,
      productId: p.productId,
      name: p.name,
      sku: p.sku,
      unit: p.unit,
      quantity,
      unitPrice,
      total: round2(quantity * unitPrice),
      specifications: p.specifications,
    };
  });

  const discount = priced && rand() > 0.85 ? 5000 : 0;
  const summary = priced
    ? computeSummary(items, discount)
    : {
        subtotal: 0,
        taxRate: 7.5,
        taxAmount: 0,
        discount: 0,
        totalAmount: 0,
        currency: "NGN",
      };

  const daysAgo = Math.floor(rand() * 120);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const validUntil = new Date(date);
  validUntil.setDate(validUntil.getDate() + 30);

  const idNum = String(index + 1).padStart(3, "0");
  const dateStr = date.toISOString().slice(0, 10);

  const timeline = [
    {
      date: `${dateStr} 09:00`,
      action: "Quote Request Received from Website",
      user: "System",
    },
  ];

  let proforma = null;
  if (priced) {
    const sentDate = new Date(date);
    sentDate.setHours(sentDate.getHours() + 4);
    proforma = {
      number: `PI-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}-${idNum}`,
      generatedDate: dateStr,
      sentDate: sentDate.toISOString().slice(0, 16).replace("T", " "),
      validUntil: validUntil.toISOString().slice(0, 10),
    };
    timeline.push({
      date: proforma.sentDate,
      action: `Proforma Invoice ${proforma.number} Sent to Customer`,
      user: "Admin",
    });
  }

  let purchaseOrder = null;
  if (["approved", "completed"].includes(status)) {
    purchaseOrder = {
      poNumber: `PO-${idNum}-${date.getFullYear()}`,
      receivedDate: dateStr,
    };
    timeline.push({
      date: `${dateStr} 14:00`,
      action: `Purchase Order ${purchaseOrder.poNumber} Received`,
      user: "Admin",
    });
  }
  if (status === "rejected") {
    timeline.push({
      date: `${dateStr} 14:00`,
      action: "Quote Rejected by Customer",
      user: "Admin",
    });
  }
  if (status === "completed") {
    timeline.push({
      date: `${dateStr} 16:00`,
      action: "Order Delivered — Quote Completed",
      user: "Admin",
    });
  }

  return {
    id: `Q-${idNum}`,
    quoteNumber: `Q-${date.getFullYear()}-${idNum}`,
    status,
    date: dateStr,
    validUntil: validUntil.toISOString().slice(0, 10),
    customer: { id: `C-${idNum}`, ...customer },
    summary,
    items,
    notes: NOTES[index % NOTES.length],
    proforma,
    purchaseOrder,
    timeline,
  };
};

const TOTAL_MOCK_QUOTES = 56;
const MOCK_QUOTES = Array.from({ length: TOTAL_MOCK_QUOTES }, (_, i) =>
  buildQuote(i),
);

// --- Helpers -------------------------------------------------------------

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

// Occasionally simulate a network failure so error states are reachable
// during testing without needing to disconnect anything. Disabled by
// default; flip to a small probability (e.g. 0.05) locally if needed.
const FAILURE_RATE = 0;
const maybeFail = (message) => {
  if (Math.random() < FAILURE_RATE) {
    throw new Error(message);
  }
};

const matchesSearch = (quote, search) => {
  if (!search) return true;
  const term = search.trim().toLowerCase();
  return (
    quote.id.toLowerCase().includes(term) ||
    quote.quoteNumber.toLowerCase().includes(term) ||
    quote.customer.name.toLowerCase().includes(term) ||
    quote.customer.email.toLowerCase().includes(term)
  );
};

const sortQuotes = (quotes, sortBy, sortOrder) => {
  const dir = sortOrder === "asc" ? 1 : -1;
  return [...quotes].sort((a, b) => {
    switch (sortBy) {
      case "customer":
        return a.customer.name.localeCompare(b.customer.name) * dir;
      case "amount":
        return (a.summary.totalAmount - b.summary.totalAmount) * dir;
      case "date":
      default:
        return (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir;
    }
  });
};

const findQuoteOrThrow = (id) => {
  const quote = MOCK_QUOTES.find((q) => q.id === id);
  if (!quote) {
    const error = new Error(`Quote ${id} not found`);
    error.status = 404;
    throw error;
  }
  return quote;
};

// --- Public API ------------------------------------------------------------

export const quoteAPI = {
  /**
   * @param {{page?:number, limit?:number, search?:string, status?:string,
   *   dateFrom?:string, dateTo?:string, sortBy?:string, sortOrder?:string}} params
   * @returns {Promise<{data: object[], meta: {total:number, page:number, limit:number, totalPages:number}}>}
   */
  async getAll(params = {}) {
    await delay();
    maybeFail("Failed to load quotes");

    const {
      page = 1,
      limit = 10,
      search = "",
      status = "all",
      dateFrom = "",
      dateTo = "",
      sortBy = "date",
      sortOrder = "desc",
    } = params;

    let results = MOCK_QUOTES.filter((q) => matchesSearch(q, search));

    if (status && status !== "all") {
      results = results.filter((q) => q.status === status);
    }
    if (dateFrom) {
      results = results.filter((q) => q.date >= dateFrom);
    }
    if (dateTo) {
      results = results.filter((q) => q.date <= dateTo);
    }

    results = sortQuotes(results, sortBy, sortOrder);

    const total = results.length;
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const startIndex = (safePage - 1) * limit;
    const pageData = results.slice(startIndex, startIndex + limit);

    return {
      data: pageData,
      meta: { total, page: safePage, limit, totalPages },
    };
  },

  /** @returns {Promise<object>} */
  async getById(id) {
    await delay(300);
    maybeFail("Failed to load quote");
    return findQuoteOrThrow(id);
  },

  /**
   * Creates a manual quote for email-based requests.
   * @param {{customer: {name:string, email:string, phone:string, company:string, address:string}, items: {productId:string, quantity:number}[]}} payload
   * @returns {Promise<object>} created quote
   */
  async create(payload) {
    await delay(500);
    maybeFail("Failed to create quote");

    // Find the next available quote ID
    const maxId = Math.max(
      ...MOCK_QUOTES.map((q) => parseInt(q.id.replace("Q-", "")) || 0),
      0,
    );
    const newIdNum = String(maxId + 1).padStart(3, "0");
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);

    // Build quote items from catalog products
    const items = payload.items.map((reqItem, i) => {
      const product = PRODUCT_CATALOG.find(
        (p) => p.productId === reqItem.productId,
      );
      if (!product) {
        throw new Error(`Product ${reqItem.productId} not found`);
      }
      return {
        id: i + 1,
        productId: product.productId,
        name: product.name,
        sku: product.sku,
        unit: product.unit,
        quantity: reqItem.quantity,
        unitPrice: 0, // Unpriced initially, will be priced when generating proforma
        total: 0,
        specifications: product.specifications,
      };
    });

    // Create new quote
    const newQuote = {
      id: `Q-${newIdNum}`,
      quoteNumber: `Q-${now.getFullYear()}-${newIdNum}`,
      status: "pending",
      date: dateStr,
      validUntil: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      customer: {
        id: `C-${newIdNum}`,
        name: payload.customer.name,
        email: payload.customer.email,
        phone: payload.customer.phone,
        company: payload.customer.company,
        address: payload.customer.address,
      },
      summary: {
        subtotal: 0,
        taxRate: 7.5,
        taxAmount: 0,
        discount: 0,
        totalAmount: 0,
        currency: "NGN",
      },
      items,
      notes: NOTES[Math.floor(Math.random() * NOTES.length)],
      proforma: null,
      purchaseOrder: null,
      timeline: [
        {
          date: `${dateStr} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
          action: "Quote Request Received from Email",
          user: "Admin",
        },
      ],
    };

    MOCK_QUOTES.push(newQuote);
    return newQuote;
  },

  /** @returns {Promise<object>} updated quote */
  async updateStatus(id, status) {
    await delay(500);
    maybeFail("Failed to update quote");

    const quote = findQuoteOrThrow(id);
    quote.status = status;
    quote.timeline.push({
      date: new Date().toISOString().slice(0, 16).replace("T", " "),
      action: `Quote ${status.charAt(0).toUpperCase()}${status.slice(1)}`,
      user: "Admin",
    });
    return quote;
  },

  /**
   * Prices the requested items, computes totals, and generates + "sends"
   * the Proforma Invoice in one step. Moves the quote from `pending` to
   * `quoted`.
   * @param {string} id
   * @param {{items: {id:number, unitPrice:number}[], discount?:number, validUntil?:string}} payload
   * @returns {Promise<object>} updated quote
   */
  async generateProforma(id, payload) {
    await delay(600);
    maybeFail("Failed to generate proforma invoice");

    const quote = findQuoteOrThrow(id);
    const priceById = new Map(payload.items.map((i) => [i.id, i.unitPrice]));

    quote.items = quote.items.map((item) => {
      const unitPrice = priceById.has(item.id)
        ? Number(priceById.get(item.id)) || 0
        : item.unitPrice;
      return { ...item, unitPrice, total: round2(unitPrice * item.quantity) };
    });

    quote.summary = computeSummary(quote.items, Number(payload.discount) || 0);

    const now = new Date();
    const proformaNumber = `PI-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${quote.id.replace("Q-", "")}`;
    quote.proforma = {
      number: proformaNumber,
      generatedDate: now.toISOString().slice(0, 10),
      sentDate: now.toISOString().slice(0, 16).replace("T", " "),
      validUntil: payload.validUntil || quote.validUntil,
    };
    if (payload.validUntil) quote.validUntil = payload.validUntil;

    quote.status = "quoted";
    quote.timeline.push({
      date: quote.proforma.sentDate,
      action: `Proforma Invoice ${proformaNumber} Sent to Customer`,
      user: "Admin",
    });

    return quote;
  },

  /**
   * Records the client's Purchase Order against a quoted request and moves
   * it to `approved`, ready for delivery.
   * @param {string} id
   * @param {{poNumber: string, poDate?: string}} payload
   * @returns {Promise<object>} updated quote
   */
  async recordPurchaseOrder(id, payload) {
    await delay(500);
    maybeFail("Failed to record purchase order");

    const quote = findQuoteOrThrow(id);
    quote.purchaseOrder = {
      poNumber: payload.poNumber,
      receivedDate: payload.poDate || new Date().toISOString().slice(0, 10),
    };
    quote.status = "approved";
    quote.timeline.push({
      date: new Date().toISOString().slice(0, 16).replace("T", " "),
      action: `Purchase Order ${payload.poNumber} Received`,
      user: "Admin",
    });
    return quote;
  },

  /** @returns {Promise<{success: boolean}>} */
  async delete(id) {
    await delay(400);
    maybeFail("Failed to delete quote");

    const index = MOCK_QUOTES.findIndex((q) => q.id === id);
    if (index === -1) {
      const error = new Error(`Quote ${id} not found`);
      error.status = 404;
      throw error;
    }
    MOCK_QUOTES.splice(index, 1);
    return { success: true };
  },

  /** Bulk delete convenience wrapper around delete(). */
  async bulkDelete(ids) {
    await delay(500);
    maybeFail("Failed to delete quotes");

    ids.forEach((id) => {
      const index = MOCK_QUOTES.findIndex((q) => q.id === id);
      if (index !== -1) MOCK_QUOTES.splice(index, 1);
    });
    return { success: true, deleted: ids.length };
  },

  /**
   * Returns CSV text for the currently filtered dataset (all matching
   * records, not just the current page).
   */
  async exportCSV(params = {}) {
    await delay(400);
    maybeFail("Failed to export quotes");

    const { search = "", status = "all", dateFrom = "", dateTo = "" } = params;

    let results = MOCK_QUOTES.filter((q) => matchesSearch(q, search));
    if (status && status !== "all")
      results = results.filter((q) => q.status === status);
    if (dateFrom) results = results.filter((q) => q.date >= dateFrom);
    if (dateTo) results = results.filter((q) => q.date <= dateTo);

    const header = [
      "Quote ID",
      "Quote Number",
      "Customer",
      "Email",
      "Items",
      "Amount",
      "Date",
      "Status",
    ];
    const rows = results.map((q) => [
      q.id,
      q.quoteNumber,
      q.customer.name,
      q.customer.email,
      q.items.length,
      q.summary.totalAmount,
      q.date,
      q.status,
    ]);

    const escapeCell = (cell) => {
      const value = String(cell);
      return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
    };

    const csv = [header, ...rows]
      .map((row) => row.map(escapeCell).join(","))
      .join("\n");
    return csv;
  },
};

export default quoteAPI;
