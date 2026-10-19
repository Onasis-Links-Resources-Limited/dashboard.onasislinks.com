import { COMPANY, formatMoney } from "./ProformaUtils";

export const downloadWaybillPDF = async (quote) => {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const autoTable = autoTableModule.default;
  const left = 15;
  const right = doc.internal.pageSize.getWidth() - left;
  const po =
    quote.purchaseOrder?.poNumber || quote.purchaseOrder?.po_number || "—";
  const reference = quote.quoteNumber || quote.quote_number || quote.id;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(COMPANY.name, left, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(COMPANY.address, left, 24);
  doc.text(`Tel: ${COMPANY.tel}  Email: ${COMPANY.email}`, left, 29);
  doc.setDrawColor(230, 80, 27);
  doc.setLineWidth(0.6);
  doc.line(left, 34, right, 34);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text("WAYBILL", doc.internal.pageSize.getWidth() / 2, 45, {
    align: "center",
  });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const date = new Date().toISOString().slice(0, 10);
  doc.text(`Waybill Date: ${date}`, right, 53, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.text("DELIVER TO", left, 57);
  doc.setFont("helvetica", "normal");
  const customerLines = [
    quote.customer?.company || quote.customer?.name || "—",
    quote.customer?.name,
    quote.customer?.address,
    quote.customer?.phone,
    quote.customer?.email,
  ].filter(Boolean);
  customerLines.forEach((line, index) =>
    doc.text(String(line), left, 63 + index * 4.5),
  );

  doc.setFont("helvetica", "bold");
  doc.text(`PO Number: ${po}`, right, 63, { align: "right" });
  doc.text(`Order Ref: ${reference}`, right, 68, { align: "right" });

  autoTable(doc, {
    startY: 91,
    margin: { left, right: left },
    head: [
      [
        "No.",
        "Description",
        "SKU",
        "Unit",
        "Quantity",
        "Unit Price (NGN)",
        "Total (NGN)",
      ],
    ],
    body: (quote.items || []).map((item, index) => [
      String(index + 1),
      [item.name, item.specifications].filter(Boolean).join("\n"),
      item.sku || "—",
      item.unit || "Pcs",
      String(item.quantity || 0),
      formatMoney(item.unitPrice),
      formatMoney(item.total),
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      lineColor: [220, 220, 220],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [180, 180, 180],
      textColor: 255,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 19 },
      3: { cellWidth: 14 },
      4: { cellWidth: 17, halign: "center" },
      5: { cellWidth: 28, halign: "right" },
      6: { cellWidth: 27, halign: "right" },
    },
  });

  let y = (doc.lastAutoTable?.finalY || 100) + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(
    `Order Total (NGN): ${formatMoney(quote.summary?.totalAmount)}`,
    right,
    y,
    { align: "right" },
  );
  y += 10;
  if (quote.notes) {
    doc.setFontSize(9);
    doc.text("Delivery / PO Notes", left, y);
    doc.setFont("helvetica", "normal");
    const noteLines = doc.splitTextToSize(String(quote.notes), right - left);
    doc.text(noteLines, left, y + 5);
    y += noteLines.length * 4 + 12;
  }

  y = Math.max(y + 18, 230);
  doc.setDrawColor(120);
  doc.line(left, y, left + 65, y);
  doc.line(right - 65, y, right, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Prepared / Dispatched By", left, y + 5);
  doc.text("Received By (Customer)", right, y + 5, { align: "right" });
  doc.text("Name & Signature: __________________", left, y + 14);
  doc.text("Name & Signature: __________________", right, y + 14, {
    align: "right",
  });
  doc.text("Date: __________________", left, y + 23);
  doc.text("Date: __________________", right, y + 23, { align: "right" });
  doc.setFontSize(7.5);
  doc.setTextColor(130);
  doc.text(
    `${COMPANY.name} · System-generated waybill`,
    doc.internal.pageSize.getWidth() / 2,
    288,
    { align: "center" },
  );

  doc.save(`Waybill-${po === "—" ? quote.id : po}.pdf`);
};
