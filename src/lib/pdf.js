import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * Renders a DOM node to a crisp, nicely-margined single-page PDF and
 * triggers a download. Works for the ticket card and the registration
 * summary — anything that fits a portrait card.
 *
 * @param {HTMLElement} node - element to capture
 * @param {string} filename - without extension
 * @param {object} opts
 * @param {string} opts.background - canvas background colour (matches theme)
 */
export async function downloadElementAsPdf(node, filename = "document", opts = {}) {
  if (!node) throw new Error("Nothing to export yet.");
  const background = opts.background || "#ffffff";

  const canvas = await html2canvas(node, {
    scale: Math.min(3, (window.devicePixelRatio || 1) * 2),
    backgroundColor: background,
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");

  // Convert the element's own CSS size into mm so the PDF page hugs the
  // card with a comfortable margin instead of stretching to A4.
  const pxToMm = 0.264583;
  const marginMm = 14;
  const rect = node.getBoundingClientRect();
  const widthMm = rect.width * pxToMm;
  const heightMm = rect.height * pxToMm;

  const pageW = widthMm + marginMm * 2;
  const pageH = heightMm + marginMm * 2;

  const pdf = new jsPDF({
    orientation: pageW > pageH ? "landscape" : "portrait",
    unit: "mm",
    format: [pageW, pageH],
  });

  pdf.setFillColor(background);
  pdf.rect(0, 0, pageW, pageH, "F");
  pdf.addImage(imgData, "PNG", marginMm, marginMm, widthMm, heightMm, undefined, "FAST");
  pdf.save(`${filename}.pdf`);
}
