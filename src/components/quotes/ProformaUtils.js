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

// --- Logo constants (1032px x 374px, aspect ratio 2.759:1) --------------------

const LOGO_ASPECT_RATIO = 1032 / 374;
const PDF_LOGO_WIDTH = 30;
const PDF_LOGO_HEIGHT = PDF_LOGO_WIDTH / LOGO_ASPECT_RATIO;
const DOCX_LOGO_WIDTH = 130;
const DOCX_LOGO_HEIGHT = DOCX_LOGO_WIDTH / LOGO_ASPECT_RATIO;

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

    if (n % 10 > 0) {
      str += `-${ONES[n % 10]}`;
    }
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

/**
 * e.g. amountToWords(15080100)
 * -> "Fifteen Million, Eighty Thousand, One Hundred Naira Only"
 */
export const amountToWords = (amount) => {
  const naira = Math.floor(amount);
  const kobo = Math.round((amount - naira) * 100);

  let words = `${integerToWords(naira)} Naira`;

  if (kobo > 0) {
    words += `, ${integerToWords(kobo)} Kobo`;
  }

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

// --- Shared download helper -------------------------------------------------

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

// --- CSV --------------------------------------------------------------------

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

    // Meta info
    row(["PI No.:", quote.proforma?.number || ""]),
    row(["Quote Ref.:", quote.id]),
    row(["VAT No.:", COMPANY.vatNo]),
    row(["Tax ID:", COMPANY.taxId]),

    row([]),

    row(["Bill To", quote.customer.company || quote.customer.name]),
    row(["Address", quote.customer.address || ""]),
    row(["Email", quote.customer.email]),

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

    // Subtotal
    row(["", "", "", "", "Subtotal", formatMoney(quote.summary.subtotal)]),

    // VAT
    row([
      "",
      "",
      "",
      "",
      `VAT (${quote.summary.taxRate}%)`,
      formatMoney(quote.summary.taxAmount),
    ]),

    // Discount
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

    row([]),

    // Overall Total
    row(["TOTAL (NGN)", formatMoney(quote.summary.totalAmount)]),

    row([]),

    // Amount in Words
    row(["Amount in Words", amountToWords(quote.summary.totalAmount)]),

    row([]),

    // Bank Details
    row(["BANK DETAILS"]),
    row(["Banker:", COMPANY.bank.bankerName]),
    row(["Account Name:", COMPANY.bank.accountName]),
    row(["Account No:", COMPANY.bank.accountNumber]),

    row([]),

    // Terms & Notes
    row(["Terms & Notes"]),

    ...(quote.proforma?.validUntil || quote.validUntil
      ? [
          row([
            `Valid Until: ${quote.proforma?.validUntil || quote.validUntil}`,
          ]),
        ]
      : []),

    ...(quote.notes ? [row([quote.notes])] : []),
  ];

  return lines.join("\n");
};

export const downloadProformaCSV = (quote) => {
  const csv = buildProformaCSV(quote);

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  downloadBlob(blob, proformaFilename(quote, "csv"));
};

// --- PDF (jsPDF + autotable) ------------------------------------------------

export const downloadProformaPDF = async (quote) => {
  const [{ jsPDF }, autoTableModule, logoDataUrl] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
    getLogoDataUrl(),
  ]);

  const autoTable = autoTableModule.default;

  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 15;
  const rightX = pageWidth - marginX;

  // --- Letterhead -----------------------------------------------------------

  doc.addImage(
    logoDataUrl,
    "PNG",
    marginX,
    12,
    PDF_LOGO_WIDTH,
    PDF_LOGO_HEIGHT,
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);

  doc.text("Onasis Links Resources Limited", rightX, 16, {
    align: "right",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(90);

  doc.text(COMPANY.address, rightX, 21, {
    align: "right",
  });

  doc.text(`Tel: ${COMPANY.tel}   Email: ${COMPANY.email}`, rightX, 25.5, {
    align: "right",
  });

  doc.setTextColor(0);

  doc.setDrawColor(230, 80, 27);
  doc.setLineWidth(0.6);

  doc.line(marginX, 32, rightX, 32);

  // --- Bill To / Meta -------------------------------------------------------

  let y = 40;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");

  doc.text("BILL TO", marginX, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);

  const billLines = [
    quote.customer.company || quote.customer.name,
    quote.customer.address,
    quote.customer.email,
  ].filter(Boolean);

  billLines.forEach((line, i) => doc.text(line, marginX, y + 5 + i * 4.6));

  // --- Meta information -----------------------------------------------------

  const metaItems = [
    ["PI No.:", quote.proforma?.number || "—"],
    ["Quote Ref.:", quote.id],
    ["VAT No.:", COMPANY.vatNo],
    ["Tax ID:", COMPANY.taxId],
  ];

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  const piValue = String(metaItems[0][1]);

  const metaValueX = rightX - doc.getTextWidth(piValue);

  const metaLabelGap = 2;

  metaItems.forEach(([label, value], i) => {
    const rowY = y + i * 4.6;

    doc.setFont("helvetica", "normal");

    doc.text(String(value), metaValueX, rowY);

    doc.setFont("helvetica", "bold");

    doc.text(label, metaValueX - metaLabelGap, rowY, {
      align: "right",
    });
  });

  // --- Title centered with Date on right -----------------------------------

  const titleY =
    y + Math.max(billLines.length * 4.6, metaItems.length * 4.6) + 10;

  const dateStr = quote.proforma?.generatedDate || quote.date || "";

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  doc.text(`Date: ${dateStr}`, rightX, titleY, {
    align: "right",
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);

  doc.text("Proforma Invoice", pageWidth / 2, titleY, {
    align: "center",
  });

  // --- Items table ----------------------------------------------------------

  const tableStartY = titleY + 6;

  const tableBody = quote.items.map((item, i) => [
    String(i + 1),
    item.specifications ? `${item.name}\n${item.specifications}` : item.name,
    item.unit || "Pcs",
    String(item.quantity),
    formatMoney(item.unitPrice),
    formatMoney(item.total),
  ]);

  // Subtotal
  tableBody.push([
    "",
    "",
    "",
    "",
    "Subtotal",
    formatMoney(quote.summary.subtotal),
  ]);

  // VAT
  tableBody.push([
    "",
    "",
    "",
    "",
    `VAT (${quote.summary.taxRate}%)`,
    formatMoney(quote.summary.taxAmount),
  ]);

  // Discount
  if (quote.summary.discount > 0) {
    tableBody.push([
      "",
      "",
      "",
      "",
      "Discount",
      `-${formatMoney(quote.summary.discount)}`,
    ]);
  }

  autoTable(doc, {
    startY: tableStartY,

    margin: {
      left: marginX,
      right: marginX,
    },

    head: [
      ["S/No", "Item Description", "Unit", "Qty", "Unit Price", "Total Price"],
    ],

    body: tableBody,

    styles: {
      fontSize: 9,
      cellPadding: 2.4,
      lineColor: [220, 220, 220],
      lineWidth: 0.2,
    },

    headStyles: {
      fillColor: [180, 180, 180],
      textColor: 255,
      fontStyle: "bold",
    },

    columnStyles: {
      0: {
        cellWidth: 12,
        halign: "center",
      },

      1: {
        cellWidth: "auto",
      },

      2: {
        cellWidth: 16,
        halign: "center",
      },

      3: {
        cellWidth: 14,
        halign: "center",
      },

      4: {
        cellWidth: 26,
        halign: "right",
      },

      5: {
        cellWidth: 28,
        halign: "right",
      },
    },

    didParseCell: function (data) {
      const itemCount = quote.items.length;

      if (data.section === "body" && data.row.index >= itemCount) {
        data.cell.styles.fontStyle = "bold";

        if (data.cell.styles.fillColor === undefined) {
          data.cell.styles.fillColor = [248, 248, 248];
        }
      }
    },
  });

  // --- Overall Total --------------------------------------------------------

  let ty = doc.lastAutoTable.finalY + 6;

  const totalLabelX = rightX - 55;

  doc.setDrawColor(200);

  doc.line(totalLabelX, ty, rightX, ty);

  ty += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);

  doc.text("TOTAL (NGN)", totalLabelX, ty);

  doc.text(formatMoney(quote.summary.totalAmount), rightX, ty, {
    align: "right",
  });

  ty += 8;

  // --- Amount in words ------------------------------------------------------

  ty += 2;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const wordsText = doc.splitTextToSize(
    `Amount in Words: ${amountToWords(quote.summary.totalAmount)}`,
    rightX - marginX,
  );

  doc.text(wordsText, marginX, ty);

  ty += wordsText.length * 4.6 + 4;

  // --------------------------------------------------------------------------
  // BANK DETAILS
  // --------------------------------------------------------------------------

  // Extra spacing after Amount in Words so the section does not sit too close.
  ty += 7;

  const bankItems = [
    ["Banker:", COMPANY.bank.bankerName],
    ["Account Name:", COMPANY.bank.accountName],
    ["Account No:", COMPANY.bank.accountNumber],
  ];

  // BANK DETAILS heading - centered on the page.
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");

  doc.text("BANK DETAILS", pageWidth / 2, ty, {
    align: "center",
  });

  ty += 7;

  // --------------------------------------------------------------------------
  // CENTERED BANK DETAILS COLUMN BLOCK
  // --------------------------------------------------------------------------
  //
  // The entire two-column block is centered under BANK DETAILS.
  //
  // Column 1 = labels
  // Column 2 = values
  //
  // The labels are right-aligned and the values are left-aligned.
  // This keeps the columns perfectly consistent from row to row.
  // --------------------------------------------------------------------------

  const bankTableWidth = 100;
  const bankTableStartX = pageWidth / 2 - bankTableWidth / 2;

  const labelColumnWidth = 40;
  bankItems.forEach(([label, value], i) => {
    const rowY = ty + i * 5.5;
    const valueString = String(value);

    // Label column - right aligned.
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");

    doc.text(label, bankTableStartX + labelColumnWidth, rowY, {
      align: "right",
    });

    // Value column - left aligned.
    doc.setFont("helvetica", "normal");

    doc.text(valueString, bankTableStartX + labelColumnWidth + 3, rowY);
  });

  ty += bankItems.length * 5.5 + 8;

  // --- Terms & Notes with Valid Until --------------------------------------

  const termsNotes = [];

  const validUntilStr = quote.proforma?.validUntil || quote.validUntil || "";

  if (validUntilStr) {
    termsNotes.push(`Valid Until: ${validUntilStr}`);
  }

  if (quote.notes && quote.notes.trim()) {
    termsNotes.push(quote.notes);
  }

  if (termsNotes.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);

    doc.text("TERMS & NOTES", marginX, ty);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    ty += 5;

    const noteText = termsNotes.join("\n");

    const noteLines = doc.splitTextToSize(noteText, rightX - marginX);

    doc.text(noteLines, marginX, ty);

    ty += noteLines.length * 4.6 + 6;
  }

  // --- Signatures -----------------------------------------------------------

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

  // --- Footer ---------------------------------------------------------------

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

// --- DOCX -------------------------------------------------------------------

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
  } = docx;

  const logoBuffer = await getLogoArrayBuffer();

  const noBorder = {
    style: BorderStyle.NONE,
    size: 0,
    color: "FFFFFF",
  };

  const plainCellBorders = {
    top: noBorder,
    bottom: noBorder,
    left: noBorder,
    right: noBorder,
  };

  // --- Meta row -------------------------------------------------------------

  const metaRow = (label, value) =>
    new TableRow({
      children: [
        new TableCell({
          borders: plainCellBorders,

          width: {
            size: 45,
            type: WidthType.PERCENTAGE,
          },

          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,

              children: [
                new TextRun({
                  text: label,
                  bold: true,
                  size: 18,
                }),
              ],
            }),
          ],
        }),

        new TableCell({
          borders: plainCellBorders,

          width: {
            size: 55,
            type: WidthType.PERCENTAGE,
          },

          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,

              children: [
                new TextRun({
                  text: value,
                  size: 18,
                }),
              ],
            }),
          ],
        }),
      ],
    });

  // --- Bank details ----------------------------------------------------------

  const bankDetailsRows = [
    ["Banker:", COMPANY.bank.bankerName],
    ["Account Name:", COMPANY.bank.accountName],
    ["Account No:", COMPANY.bank.accountNumber],
  ];

  // Each bank-detail row is centered as a complete line.
  // This places the bank details directly underneath the
  // centered BANK DETAILS heading.
  const bankDetailParagraphs = bankDetailsRows.map(
    ([label, value]) =>
      new Paragraph({
        alignment: AlignmentType.CENTER,

        children: [
          new TextRun({
            text: `${label} `,
            bold: true,
            size: 18,
          }),

          new TextRun({
            text: String(value),
            size: 18,
          }),
        ],

        spacing: {
          after: 40,
        },
      }),
  );

  // --- Item header cell -----------------------------------------------------

  const itemHeaderCell = (text) =>
    new TableCell({
      shading: {
        fill: "646464",
      },

      verticalAlign: VerticalAlign.CENTER,

      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,

          children: [
            new TextRun({
              text,
              bold: true,
              color: "FFFFFF",
              size: 18,
            }),
          ],
        }),
      ],
    });

  // --- Item cell ------------------------------------------------------------

  const itemCell = (text, align = AlignmentType.LEFT) =>
    new TableCell({
      verticalAlign: VerticalAlign.CENTER,

      children: [
        new Paragraph({
          alignment: align,

          children: [
            new TextRun({
              text: String(text),
              size: 18,
            }),
          ],
        }),
      ],
    });

  // --- Bold item cell -------------------------------------------------------

  const itemCellWithBold = (text, align = AlignmentType.LEFT, bold = false) =>
    new TableCell({
      verticalAlign: VerticalAlign.CENTER,

      shading: bold ? { fill: "F8F8F8" } : undefined,

      children: [
        new Paragraph({
          alignment: align,

          children: [
            new TextRun({
              text: String(text),
              size: 18,
              bold,
            }),
          ],
        }),
      ],
    });

  // --- Items table ----------------------------------------------------------

  const itemRowsWithBold = [
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

    // Subtotal
    new TableRow({
      children: [
        itemCellWithBold("", AlignmentType.CENTER, true),

        itemCellWithBold("", AlignmentType.LEFT, true),

        itemCellWithBold("", AlignmentType.CENTER, true),

        itemCellWithBold("", AlignmentType.CENTER, true),

        itemCellWithBold("Subtotal", AlignmentType.RIGHT, true),

        itemCellWithBold(
          formatMoney(quote.summary.subtotal),
          AlignmentType.RIGHT,
          true,
        ),
      ],
    }),

    // VAT
    new TableRow({
      children: [
        itemCellWithBold("", AlignmentType.CENTER, true),

        itemCellWithBold("", AlignmentType.LEFT, true),

        itemCellWithBold("", AlignmentType.CENTER, true),

        itemCellWithBold("", AlignmentType.CENTER, true),

        itemCellWithBold(
          `VAT (${quote.summary.taxRate}%)`,
          AlignmentType.RIGHT,
          true,
        ),

        itemCellWithBold(
          formatMoney(quote.summary.taxAmount),
          AlignmentType.RIGHT,
          true,
        ),
      ],
    }),

    // Discount
    ...(quote.summary.discount > 0
      ? [
          new TableRow({
            children: [
              itemCellWithBold("", AlignmentType.CENTER, true),

              itemCellWithBold("", AlignmentType.LEFT, true),

              itemCellWithBold("", AlignmentType.CENTER, true),

              itemCellWithBold("", AlignmentType.CENTER, true),

              itemCellWithBold("Discount", AlignmentType.RIGHT, true),

              itemCellWithBold(
                `-${formatMoney(quote.summary.discount)}`,
                AlignmentType.RIGHT,
                true,
              ),
            ],
          }),
        ]
      : []),
  ];

  const itemsTable = new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },

    rows: itemRowsWithBold,
  });

  const totalsTable = new Table({
    width: {
      size: 45,
      type: WidthType.PERCENTAGE,
    },

    alignment: AlignmentType.RIGHT,

    rows: [metaRow("TOTAL (NGN)", formatMoney(quote.summary.totalAmount))],
  });

  // --- Paragraph helper ----------------------------------------------------

  const paragraph = (text, opts = {}) =>
    new Paragraph({
      children: [
        new TextRun({
          text,
          size: 18,
          ...opts,
        }),
      ],

      spacing: {
        after: 80,
      },
    });

  // --- Terms & Notes -------------------------------------------------------

  const termsParts = [];

  const validUntilStr = quote.proforma?.validUntil || quote.validUntil || "";

  if (validUntilStr) {
    termsParts.push(`Valid Until: ${validUntilStr}`);
  }

  if (quote.notes && quote.notes.trim()) {
    termsParts.push(quote.notes);
  }

  const termsText = termsParts.join("\n");

  // --- DOCX Document -------------------------------------------------------

  const doc = new Document({
    sections: [
      {
        properties: {},

        children: [
          // Letterhead
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },

            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    borders: plainCellBorders,

                    width: {
                      size: 30,
                      type: WidthType.PERCENTAGE,
                    },

                    children: [
                      new Paragraph({
                        children: [
                          new ImageRun({
                            type: "png",
                            data: logoBuffer,

                            transformation: {
                              width: DOCX_LOGO_WIDTH,
                              height: DOCX_LOGO_HEIGHT,
                            },
                          }),
                        ],
                      }),
                    ],
                  }),

                  new TableCell({
                    borders: plainCellBorders,

                    width: {
                      size: 70,
                      type: WidthType.PERCENTAGE,
                    },

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

          new Paragraph({
            text: "",

            spacing: {
              after: 200,
            },
          }),

          // Bill To / Meta
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },

            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    borders: plainCellBorders,

                    width: {
                      size: 55,
                      type: WidthType.PERCENTAGE,
                    },

                    children: [
                      paragraph("BILL TO", {
                        bold: true,
                      }),

                      paragraph(quote.customer.company || quote.customer.name, {
                        bold: true,
                      }),

                      paragraph(quote.customer.address || ""),

                      paragraph(quote.customer.email),
                    ],
                  }),

                  new TableCell({
                    borders: plainCellBorders,

                    width: {
                      size: 45,
                      type: WidthType.PERCENTAGE,
                    },

                    children: [
                      new Table({
                        width: {
                          size: 100,
                          type: WidthType.PERCENTAGE,
                        },

                        rows: [
                          metaRow("PI No.:", quote.proforma?.number || "—"),

                          metaRow("Quote Ref.:", quote.id),

                          metaRow("VAT No.:", COMPANY.vatNo),

                          metaRow("Tax ID:", COMPANY.taxId),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({
            text: "",

            spacing: {
              after: 240,
            },
          }),

          // Title
          new Paragraph({
            alignment: AlignmentType.CENTER,

            children: [
              new TextRun({
                text: "Proforma Invoice",
                bold: true,
                size: 30,
                color: "C3110C",
              }),
            ],

            spacing: {
              after: 80,
            },
          }),

          // Date
          new Paragraph({
            alignment: AlignmentType.RIGHT,

            children: [
              new TextRun({
                text: `Date: ${
                  quote.proforma?.generatedDate || quote.date || ""
                }`,
                size: 18,
              }),
            ],

            spacing: {
              after: 240,
            },
          }),

          // Items
          itemsTable,

          new Paragraph({
            text: "",

            spacing: {
              after: 200,
            },
          }),

          // Total
          totalsTable,

          new Paragraph({
            text: "",

            spacing: {
              after: 200,
            },
          }),

          // Amount in Words
          paragraph(
            `Amount in Words: ${amountToWords(quote.summary.totalAmount)}`,
            {
              italics: true,
            },
          ),

          // Extra spacing before Bank Details
          new Paragraph({
            text: "",

            spacing: {
              after: 280,
            },
          }),

          // ------------------------------------------------------------------
          // BANK DETAILS SECTION
          // ------------------------------------------------------------------

          new Paragraph({
            alignment: AlignmentType.CENTER,

            children: [
              new TextRun({
                text: "BANK DETAILS",
                bold: true,
                size: 20,
              }),
            ],

            spacing: {
              after: 80,
            },
          }),

          // Bank details rows
          ...bankDetailParagraphs,

          new Paragraph({
            text: "",

            spacing: {
              after: 200,
            },
          }),

          // ------------------------------------------------------------------
          // TERMS & NOTES
          // ------------------------------------------------------------------

          ...(termsText
            ? [
                paragraph("TERMS & NOTES", {
                  bold: true,
                }),

                paragraph(termsText),
              ]
            : []),

          new Paragraph({
            text: "",

            spacing: {
              after: 400,
            },
          }),

          // ------------------------------------------------------------------
          // SIGNATURES
          // ------------------------------------------------------------------

          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },

            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    borders: plainCellBorders,

                    width: {
                      size: 50,
                      type: WidthType.PERCENTAGE,
                    },

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

                    width: {
                      size: 50,
                      type: WidthType.PERCENTAGE,
                    },

                    children: [
                      paragraph("_______________________"),

                      paragraph(
                        `For ${quote.customer.company || quote.customer.name}`,
                        {
                          bold: true,
                        },
                      ),

                      paragraph("Date: ______________"),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({
            text: "",

            spacing: {
              before: 400,
            },
          }),

          // ------------------------------------------------------------------
          // FOOTER
          // ------------------------------------------------------------------

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
