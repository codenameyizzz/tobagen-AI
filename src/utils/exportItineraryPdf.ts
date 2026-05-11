import jsPDF from 'jspdf';
import type { TobaItinerary } from '../services/itineraryService';

const PRODUCT_NAME = 'TobaGen AI Discovery';

export function exportItineraryPdf(itinerary: TobaItinerary) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const footerY = pageHeight - 8;
  let y = 22;

  const ensureSpace = (heightNeeded: number) => {
    if (y + heightNeeded <= pageHeight - 20) {
      return;
    }

    doc.addPage();
    drawPageFrame(doc, pageWidth, pageHeight);
    drawWatermark(doc, pageWidth, pageHeight);
    drawFooter(doc, pageWidth, footerY);
    y = 22;
  };

  drawPageFrame(doc, pageWidth, pageHeight);
  drawWatermark(doc, pageWidth, pageHeight);
  drawFooter(doc, pageWidth, footerY);

  doc.setFillColor(10, 102, 194);
  doc.roundedRect(margin, y, contentWidth, 32, 9, 9, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(PRODUCT_NAME, margin + 8, y + 8);
  doc.setFontSize(24);
  doc.text(itinerary.title, margin + 8, y + 18, { maxWidth: contentWidth - 16 });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const summaryLines = doc.splitTextToSize(itinerary.summary, contentWidth - 16);
  doc.text(summaryLines, margin + 8, y + 26);
  y += Math.max(36, 22 + summaryLines.length * 5);

  y += 8;
  ensureSpace(24);
  drawSectionTitle(doc, margin, y, 'Journey Overview');
  y += 10;

  const overviewCards = [
    { label: 'Duration', value: `${itinerary.days.length} day plan` },
    { label: 'Highlights', value: `${itinerary.recommendedPlaces.length} places` },
    { label: 'Travel Notes', value: `${itinerary.travelTips.length} tips` },
  ];

  const cardWidth = (contentWidth - 8) / 3;
  overviewCards.forEach((card, index) => {
    const cardX = margin + index * (cardWidth + 4);
    drawInfoCard(doc, cardX, y, cardWidth, 24, card.label, card.value);
  });
  y += 32;

  itinerary.days.forEach((day) => {
    const activityHeights = day.activities.map((activity) => estimateTextBlockHeight(doc, [
      `• ${activity.time} - ${activity.activity}`,
      `${activity.location}`,
      `${activity.description}`,
    ], contentWidth - 20));
    const dayHeight = 24 + activityHeights.reduce((total, height) => total + height + 4, 0);

    ensureSpace(dayHeight + 8);
    drawDayCard(doc, margin, y, contentWidth, day, pageHeight);
    y += dayHeight + 8;
  });

  ensureSpace(22);
  drawSectionTitle(doc, margin, y, 'Recommended Places');
  y += 10;

  itinerary.recommendedPlaces.forEach((place) => {
    const placeHeight = estimateTextBlockHeight(doc, [
      place.name,
      `${place.category} • ${place.bestTime}`,
      `${place.location.lat.toFixed(2)}° N, ${place.location.lng.toFixed(2)}° E`,
      place.description,
    ], contentWidth - 20) + 10;

    ensureSpace(placeHeight);
    drawPlaceCard(doc, margin, y, contentWidth, placeHeight, place);
    y += placeHeight + 6;
  });

  ensureSpace(20);
  drawSectionTitle(doc, margin, y, 'Travel Tips');
  y += 10;

  itinerary.travelTips.forEach((tip, index) => {
    const tipHeight = estimateTextBlockHeight(doc, [`${index + 1}. ${tip}`], contentWidth - 18) + 8;
    ensureSpace(tipHeight);
    drawTipCard(doc, margin, y, contentWidth, tipHeight, `${index + 1}. ${tip}`);
    y += tipHeight + 5;
  });

  doc.save(`${slugify(itinerary.title)}.pdf`);
}

function drawPageFrame(doc: jsPDF, pageWidth: number, pageHeight: number) {
  doc.setFillColor(247, 250, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  doc.setFillColor(227, 238, 252);
  doc.rect(0, 0, pageWidth, 12, 'F');
}

function drawWatermark(doc: jsPDF, pageWidth: number, pageHeight: number) {
  doc.saveGraphicsState();
  doc.setTextColor(220, 231, 245);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.text(PRODUCT_NAME, pageWidth / 2, pageHeight / 2, {
    align: 'center',
    angle: 32,
  });
  doc.restoreGraphicsState();
}

function drawFooter(doc: jsPDF, pageWidth: number, footerY: number) {
  const pageNumber = doc.getCurrentPageInfo().pageNumber;
  doc.setDrawColor(209, 221, 240);
  doc.line(16, footerY - 4, pageWidth - 16, footerY - 4);
  doc.setTextColor(90, 110, 135);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Crafted for personalized Lake Toba planning', 16, footerY);
  doc.text(`${PRODUCT_NAME} • Page ${pageNumber}`, pageWidth - 16, footerY, { align: 'right' });
}

function drawSectionTitle(doc: jsPDF, x: number, y: number, title: string) {
  doc.setTextColor(10, 102, 194);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(title, x, y);
}

function drawInfoCard(doc: jsPDF, x: number, y: number, width: number, height: number, label: string, value: string) {
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(206, 223, 246);
  doc.roundedRect(x, y, width, height, 5, 5, 'FD');
  doc.setTextColor(10, 102, 194);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(label.toUpperCase(), x + 5, y + 7);
  doc.setTextColor(29, 29, 31);
  doc.setFontSize(12);
  doc.text(value, x + 5, y + 15, { maxWidth: width - 10 });
}

function drawDayCard(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  day: TobaItinerary['days'][number],
  pageHeight: number,
) {
  const headerHeight = 18;
  const activityBlockHeights = day.activities.map((activity) => estimateTextBlockHeight(doc, [
    `• ${activity.time} - ${activity.activity}`,
    `${activity.location}`,
    `${activity.description}`,
  ], width - 20));
  const totalHeight = headerHeight + activityBlockHeights.reduce((sum, height) => sum + height + 4, 0) + 8;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(206, 223, 246);
  doc.roundedRect(x, y, width, totalHeight, 7, 7, 'FD');

  doc.setFillColor(232, 241, 255);
  doc.roundedRect(x + 1, y + 1, width - 2, headerHeight, 6, 6, 'F');
  doc.setTextColor(10, 102, 194);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`DAY ${day.day}`, x + 6, y + 7);
  doc.setTextColor(29, 29, 31);
  doc.setFontSize(15);
  doc.text(day.title, x + 6, y + 14, { maxWidth: width - 12 });

  let innerY = y + headerHeight + 7;
  day.activities.forEach((activity) => {
    doc.setTextColor(29, 29, 31);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    const titleLines = doc.splitTextToSize(`• ${activity.time} - ${activity.activity}`, width - 20);
    doc.text(titleLines, x + 6, innerY);
    innerY += titleLines.length * 5;

    doc.setTextColor(10, 102, 194);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const locationLines = doc.splitTextToSize(activity.location, width - 20);
    doc.text(locationLines, x + 6, innerY);
    innerY += locationLines.length * 4.5;

    doc.setTextColor(74, 74, 79);
    doc.setFontSize(10);
    const descLines = doc.splitTextToSize(activity.description, width - 20);
    doc.text(descLines, x + 6, innerY);
    innerY += descLines.length * 4.5 + 4;
  });

  if (y + totalHeight > pageHeight - 20) {
    doc.setDrawColor(206, 223, 246);
  }
}

function drawPlaceCard(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  place: TobaItinerary['recommendedPlaces'][number],
) {
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(206, 223, 246);
  doc.roundedRect(x, y, width, height, 6, 6, 'FD');

  doc.setTextColor(29, 29, 31);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(place.name, x + 6, y + 8, { maxWidth: width - 12 });

  doc.setTextColor(10, 102, 194);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`${place.category} • Best time: ${place.bestTime}`, x + 6, y + 14, { maxWidth: width - 12 });

  doc.setTextColor(90, 110, 135);
  doc.text(`${place.location.lat.toFixed(2)}° N, ${place.location.lng.toFixed(2)}° E`, x + 6, y + 20);

  doc.setTextColor(74, 74, 79);
  doc.setFontSize(10);
  const descLines = doc.splitTextToSize(place.description, width - 12);
  doc.text(descLines, x + 6, y + 27);
}

function drawTipCard(doc: jsPDF, x: number, y: number, width: number, height: number, tip: string) {
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(206, 223, 246);
  doc.roundedRect(x, y, width, height, 5, 5, 'FD');
  doc.setTextColor(29, 29, 31);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const tipLines = doc.splitTextToSize(tip, width - 12);
  doc.text(tipLines, x + 6, y + 8);
}

function estimateTextBlockHeight(doc: jsPDF, blocks: string[], width: number) {
  let total = 0;
  blocks.forEach((block, index) => {
    const lines = doc.splitTextToSize(block, width);
    total += lines.length * (index === 0 ? 5 : 4.5);
  });
  return total;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'toba-itinerary';
}
