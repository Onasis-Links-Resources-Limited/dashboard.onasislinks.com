import onasisLogoUrl from "../../assets/Onasis logo.png";

// --- Company constants (Onasis Links Resources Limited) --------------------

export const COMPANY = {
  name: "Onasis Links Resources Limited",
  address: "Plot 78A Eleganza Gardens, Lekki-Epe Expressway",
  tel: "+2348030495649",
  email: "info@onasisltd.com",
  rcNumber: "RC: 623670",
  taxId: "2522543594411",
  vatNo: "LC 06623670",
  bank: {
    bankerName: "Zenith Bank",
    accountName: "Onasis Links Resources Ltd",
    accountNumber: "1012552910",
  },
};

// --- Amount-in-words --------------------------------------------------------

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];
const GROUPS = ["", "Thousand", "Million", "Billion", "Trillion"];

const threeDigitsToWords = (n) => {
  let str = "";
  if (n >= 100) {
    str += `${ONES[Math.floor(n / 100)]} Hundred`;
    n %= 100;
    if (n > 0) str += " ";
  }
  if (n >= 20) {
    str += TENS[Math.floor(n / 10)];
    if (n % 10 > 0) str += `-${ONES[n % 10]}`;
  } else if (n > 0) {
    str += ONES[n];
  }
  return str;
};

const integerToWords = (num) => {
  if (num === 0) return "Zero";
  const parts = [];
  let i = 0;
  let n = num;
  while (n > 0) {
    const chunk = n % 1000;
    if (chunk > 0) {
      parts.unshift(
        threeDigitsToWords(chunk) + (GROUPS[i] ? ` ${GROUPS[i]}` : ""),
      );
    }
    n = Math.floor(n / 1000);
    i++;
  }
  return parts.join(", ");
};

/** e.g. amountToWords(15080100) -> "Fifteen Million, Eighty Thousand, One Hundred Naira Only" */
export const amountToWords = (amount) => {
  const naira = Math.floor(amount);
  const kobo = Math.round((amount - naira) * 100);
  let words = `${integerToWords(naira)} Naira`;
  if (kobo > 0) words += `, ${integerToWords(kobo)} Kobo`;
  return `${words} Only`;
};

export const formatMoney = (amount) =>
  new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);

// --- Logo loading (cached) --------------------------------------------------

let logoDataUrlPromise = null;
let logoArrayBufferPromise = null;

const fetchLogoBlob = async () => {
  const res = await fetch(onasisLogoUrl);
  return res.blob();
};

const getLogoDataUrl = () => {
  if (!logoDataUrlPromise) {
    logoDataUrlPromise = fetchLogoBlob().then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }),
    );
  }
  return logoDataUrlPromise;
};

const getLogoArrayBuffer = () => {
  if (!logoArrayBufferPromise) {
    logoArrayBufferPromise = fetchLogoBlob().then((blob) => blob.arrayBuffer());
  }
  return logoArrayBufferPromise;
};

// --- Shared download helper --------------------------------------------------

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const proformaFilename = (quote, ext) =>
  `Proforma-${quote.proforma?.number || quote.id}.${ext}`;

// --- CSV ---------------------------------------------------------------------

export const buildProformaCSV = (quote) => {
  const escapeCell = (cell) => {
    const value = String(cell);
    return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  };
  const row = (cells) => cells.map(escapeCell).join(",");

  const lines = [
    row([COMPANY.name]),
    row([COMPANY.address]),
    row([`Tel: ${COMPANY.tel}`, `Email: ${COMPANY.email}`]),
    row([]),
    row(["Proforma Invoice No.", quote.proforma?.number || ""]),
    row(["Date", quote.proforma?.generatedDate || ""]),
    row(["Valid Until", quote.proforma?.validUntil || quote.validUntil]),
    row(["Quote Ref.", quote.id]),
    row([]),
    row(["Bill To", quote.customer.company || quote.customer.name]),
    row(["Attn", quote.customer.name]),
    row(["Address", quote.customer.address || ""]),
    row(["Email", quote.customer.email]),
    row(["Phone", quote.customer.phone || ""]),
    row([]),
    row([
      "S/No",
      "Item Description",
      "Unit",
      "Qty",
      "Unit Price",
      "Total Price",
    ]),
    ...quote.items.map((item, i) =>
      row([
        i + 1,
        item.name,
        item.unit || "Pcs",
        item.quantity,
        formatMoney(item.unitPrice),
        formatMoney(item.total),
      ]),
    ),
    row(["", "", "", "", "Subtotal", formatMoney(quote.summary.subtotal)]),
    row([
      "",
      "",
      "",
      "",
      `VAT (${quote.summary.taxRate}%)`,
      formatMoney(quote.summary.taxAmount),
    ]),
    ...(quote.summary.discount > 0
      ? [
          row([
            "",
            "",
            "",
            "",
            "Discount",
            `-${formatMoney(quote.summary.discount)}`,
          ]),
        ]
      : []),
    row(["", "", "", "", "TOTAL", formatMoney(quote.summary.totalAmount)]),
    row([]),
    row(["Amount in Words", amountToWords(quote.summary.totalAmount)]),
    row([]),
    row(["Banker", COMPANY.bank.bankerName]),
    row(["Account Name", COMPANY.bank.accountName]),
    row(["Account No", COMPANY.bank.accountNumber]),
    row([]),
    row(["Notes", quote.notes || ""]),
  ];

  return lines.join("\n");
};

export const downloadProformaCSV = (quote) => {
  const csv = buildProformaCSV(quote);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, proformaFilename(quote, "csv"));
};

// --- PDF (jsPDF + autotable) --------------------------------------------------

export const downloadProformaPDF = async (quote) => {
  const [{ jsPDF }, autoTableModule, logoDataUrl] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
    getLogoDataUrl(),
  ]);
  const autoTable = autoTableModule.default;

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 15;
  const rightX = pageWidth - marginX;

  // --- Letterhead (logo left, company details right) ---
  doc.addImage(logoDataUrl, "PNG", marginX, 12, 30, 13.7);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(COMPANY.name, rightX, 16, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(90);
  doc.text(COMPANY.address, rightX, 21, { align: "right" });
  doc.text(`Tel: ${COMPANY.tel}   Email: ${COMPANY.email}`, rightX, 25.5, {
    align: "right",
  });
  doc.setTextColor(0);

  doc.setDrawColor(230, 80, 27); // Onasis orange (#E6501B), matches the logo  doc.setLineWidth(0.6);
  doc.line(marginX, 32, rightX, 32);

  // --- Bill To (left) / Meta (right) ---
  let y = 40;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO", marginX, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const billLines = [
    quote.customer.company || quote.customer.name,
    quote.customer.company ? `Attn: ${quote.customer.name}` : null,
    quote.customer.address,
    quote.customer.email,
    quote.customer.phone,
  ].filter(Boolean);
  billLines.forEach((line, i) => doc.text(line, marginX, y + 5 + i * 4.6));

  const metaRows = [
    ["Proforma Invoice No.", quote.proforma?.number || "—"],
    ["Date", quote.proforma?.generatedDate || quote.date],
    ["Valid Until", quote.proforma?.validUntil || quote.validUntil],
    ["Quote Ref.", quote.id],
    ["VAT No.", COMPANY.vatNo],
    ["Tax ID", COMPANY.taxId],
  ];
  doc.setFontSize(9);
  metaRows.forEach(([label, value], i) => {
    const rowY = y + i * 4.6;
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 128, rowY);
    doc.setFont("helvetica", "normal");
    doc.text(String(value), rightX, rowY, { align: "right" });
  });

  // --- Title (sits just above the items table, not the letterhead) ---
  const titleY =
    y + Math.max(billLines.length * 4.6, metaRows.length * 4.6) + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("PROFORMA INVOICE", pageWidth / 2, titleY, { align: "center" });

  // --- Items table ---
  const tableStartY = titleY + 6;
  autoTable(doc, {
    startY: tableStartY,
    margin: { left: marginX, right: marginX },
    head: [
      ["S/No", "Item Description", "Unit", "Qty", "Unit Price", "Total Price"],
    ],
    body: quote.items.map((item, i) => [
      String(i + 1),
      item.specifications ? `${item.name}\n${item.specifications}` : item.name,
      item.unit || "Pcs",
      String(item.quantity),
      formatMoney(item.unitPrice),
      formatMoney(item.total),
    ]),
    styles: {
      fontSize: 9,
      cellPadding: 2.4,
      lineColor: [220, 220, 220],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [180, 180, 180],// #B4B4B4 RBG color for the Proforma Table color
      textColor: 255,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 16, halign: "center" },
      3: { cellWidth: 14, halign: "center" },
      4: { cellWidth: 26, halign: "right" },
      5: { cellWidth: 28, halign: "right" },
    },
  });

  // --- Totals ---
  let ty = doc.lastAutoTable.finalY + 6;
  const totalsX = rightX - 55;
  const totalLine = (label, value, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 10.5 : 9.5);
    doc.text(label, totalsX, ty);
    doc.text(value, rightX, ty, { align: "right" });
    ty += bold ? 6.5 : 5.2;
  };
  totalLine("Subtotal", formatMoney(quote.summary.subtotal));
  totalLine(
    `VAT (${quote.summary.taxRate}%)`,
    formatMoney(quote.summary.taxAmount),
  );
  if (quote.summary.discount > 0)
    totalLine("Discount", `-${formatMoney(quote.summary.discount)}`);
  ty += 1.5; // breathing room before the divider so it doesn't crowd the line above it
  doc.setDrawColor(200);
  doc.line(totalsX, ty, rightX, ty);
  ty += 5; // breathing room after the divider so it doesn't crowd TOTAL below it
  totalLine("TOTAL (NGN)", formatMoney(quote.summary.totalAmount), true);

  // --- Amount in words ---
  ty += 3;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  const wordsText = doc.splitTextToSize(
    `Amount in Words: ${amountToWords(quote.summary.totalAmount)}`,
    rightX - marginX,
  );
  doc.text(wordsText, marginX, ty);
  ty += wordsText.length * 4.6 + 4;

  // --- Bank details ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("BANK DETAILS", marginX, ty);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  ty += 5;
  doc.text(`Banker: ${COMPANY.bank.bankerName}`, marginX, ty);
  ty += 4.6;
  doc.text(`Account Name: ${COMPANY.bank.accountName}`, marginX, ty);
  ty += 4.6;
  doc.text(`Account No: ${COMPANY.bank.accountNumber}`, marginX, ty);
  ty += 8;

  // --- Notes / terms ---
  if (quote.notes) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("TERMS & NOTES", marginX, ty);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    ty += 5;
    const noteLines = doc.splitTextToSize(quote.notes, rightX - marginX);
    doc.text(noteLines, marginX, ty);
    ty += noteLines.length * 4.6 + 6;
  }

  // --- Signatures ---
  const sigY = Math.max(ty + 10, 255);
  doc.setFontSize(9.5);
  doc.text("_______________________", marginX, sigY);
  doc.text("For Onasis Links Resources Limited", marginX, sigY + 5);
  doc.text("Date: ______________", marginX, sigY + 10);

  doc.text("_______________________", rightX - 60, sigY);
  doc.text(
    `For ${quote.customer.company || quote.customer.name}`,
    rightX - 60,
    sigY + 5,
  );
  doc.text("Date: ______________", rightX - 60, sigY + 10);

  // --- Footer ---
  doc.setFontSize(7.5);
  doc.setTextColor(130);
  doc.text(
    `${COMPANY.name}  ·  ${COMPANY.rcNumber}  ·  This is a system-generated proforma invoice.`,
    pageWidth / 2,
    288,
    {
      align: "center",
    },
  );

  doc.save(proformaFilename(quote, "pdf"));
};

// --- DOCX ---------------------------------------------------------------------

export const downloadProformaDOCX = async (quote) => {
  const docx = await import("docx");
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    ImageRun,
    AlignmentType,
    WidthType,
    BorderStyle,
    VerticalAlign,
    HeadingLevel,
  } = docx;

  const logoBuffer = await getLogoArrayBuffer();

  const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const plainCellBorders = {
    top: noBorder,
    bottom: noBorder,
    left: noBorder,
    right: noBorder,
  };

  const metaRow = (label, value) =>
    new TableRow({
      children: [
        new TableCell({
          borders: plainCellBorders,
          width: { size: 40, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [new TextRun({ text: label, bold: true, size: 18 })],
            }),
          ],
        }),
        new TableCell({
          borders: plainCellBorders,
          width: { size: 60, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: value, size: 18 })],
            }),
          ],
        }),
      ],
    });

  const itemHeaderCell = (text) =>
    new TableCell({
      shading: { fill: "646464" },
      verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text, bold: true, color: "FFFFFF", size: 18 }),
          ],
        }),
      ],
    });

  const itemCell = (text, align = AlignmentType.LEFT) =>
    new TableCell({
      verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({
          alignment: align,
          children: [new TextRun({ text: String(text), size: 18 })],
        }),
      ],
    });

  const itemsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          itemHeaderCell("S/No"),
          itemHeaderCell("Item Description"),
          itemHeaderCell("Unit"),
          itemHeaderCell("Qty"),
          itemHeaderCell("Unit Price"),
          itemHeaderCell("Total Price"),
        ],
      }),
      ...quote.items.map(
        (item, i) =>
          new TableRow({
            children: [
              itemCell(i + 1, AlignmentType.CENTER),
              itemCell(
                item.specifications
                  ? `${item.name} (${item.specifications})`
                  : item.name,
              ),
              itemCell(item.unit || "Pcs", AlignmentType.CENTER),
              itemCell(item.quantity, AlignmentType.CENTER),
              itemCell(formatMoney(item.unitPrice), AlignmentType.RIGHT),
              itemCell(formatMoney(item.total), AlignmentType.RIGHT),
            ],
          }),
      ),
    ],
  });

  const totalsTable = new Table({
    width: { size: 45, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.RIGHT,
    rows: [
      metaRow("Subtotal", formatMoney(quote.summary.subtotal)),
      metaRow(
        `VAT (${quote.summary.taxRate}%)`,
        formatMoney(quote.summary.taxAmount),
      ),
      ...(quote.summary.discount > 0
        ? [metaRow("Discount", `-${formatMoney(quote.summary.discount)}`)]
        : []),
      metaRow("TOTAL (NGN)", formatMoney(quote.summary.totalAmount)),
    ],
  });

  const paragraph = (text, opts = {}) =>
    new Paragraph({
      children: [new TextRun({ text, size: 18, ...opts })],
      spacing: { after: 80 },
    });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    borders: plainCellBorders,
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new ImageRun({
                            type: "png",
                            data: logoBuffer,
                            transformation: { width: 130, height: 60 },
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: plainCellBorders,
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: COMPANY.name,
                            bold: true,
                            size: 24,
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: COMPANY.address,
                            size: 16,
                            color: "5A5A5A",
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: `Tel: ${COMPANY.tel}   Email: ${COMPANY.email}`,
                            size: 16,
                            color: "5A5A5A",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: "", spacing: { after: 200 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    borders: plainCellBorders,
                    width: { size: 55, type: WidthType.PERCENTAGE },
                    children: [
                      paragraph("BILL TO", { bold: true }),
                      paragraph(quote.customer.company || quote.customer.name, {
                        bold: true,
                      }),
                      ...(quote.customer.company
                        ? [paragraph(`Attn: ${quote.customer.name}`)]
                        : []),
                      paragraph(quote.customer.address || ""),
                      paragraph(quote.customer.email),
                      paragraph(quote.customer.phone || ""),
                    ],
                  }),
                  new TableCell({
                    borders: plainCellBorders,
                    width: { size: 45, type: WidthType.PERCENTAGE },
                    children: [
                      metaRow(
                        "Proforma Invoice No.",
                        quote.proforma?.number || "—",
                      ),
                      metaRow(
                        "Date",
                        quote.proforma?.generatedDate || quote.date,
                      ),
                      metaRow(
                        "Valid Until",
                        quote.proforma?.validUntil || quote.validUntil,
                      ),
                      metaRow("Quote Ref.", quote.id),
                      metaRow("VAT No.", COMPANY.vatNo),
                      metaRow("Tax ID", COMPANY.taxId),
                    ].map(
                      (row) =>
                        new Table({
                          width: { size: 100, type: WidthType.PERCENTAGE },
                          rows: [row],
                        }),
                    ),
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: "", spacing: { after: 240 } }),
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "PROFORMA INVOICE",
                bold: true,
                size: 30,
                color: "C3110C",
              }),
            ],
            spacing: { after: 240 },
          }),
          itemsTable,
          new Paragraph({ text: "", spacing: { after: 200 } }),
          totalsTable,
          new Paragraph({ text: "", spacing: { after: 200 } }),
          paragraph(
            `Amount in Words: ${amountToWords(quote.summary.totalAmount)}`,
            { italics: true },
          ),
          new Paragraph({ text: "", spacing: { after: 200 } }),
          paragraph("BANK DETAILS", { bold: true }),
          paragraph(`Banker: ${COMPANY.bank.bankerName}`),
          paragraph(`Account Name: ${COMPANY.bank.accountName}`),
          paragraph(`Account No: ${COMPANY.bank.accountNumber}`),
          new Paragraph({ text: "", spacing: { after: 200 } }),
          ...(quote.notes
            ? [
                paragraph("TERMS & NOTES", { bold: true }),
                paragraph(quote.notes),
              ]
            : []),
          new Paragraph({ text: "", spacing: { after: 400 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    borders: plainCellBorders,
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      paragraph("_______________________"),
                      paragraph("For Onasis Links Resources Limited", {
                        bold: true,
                      }),
                      paragraph("Date: ______________"),
                    ],
                  }),
                  new TableCell({
                    borders: plainCellBorders,
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      paragraph("_______________________"),
                      paragraph(
                        `For ${quote.customer.company || quote.customer.name}`,
                        { bold: true },
                      ),
                      paragraph("Date: ______________"),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: "", spacing: { before: 400 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `${COMPANY.name} · ${COMPANY.rcNumber} · System-generated proforma invoice`,
                size: 14,
                color: "999999",
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, proformaFilename(quote, "docx"));
};
