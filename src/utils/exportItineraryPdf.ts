import jsPDF from 'jspdf';
import type { TobaItinerary } from '../services/itineraryService';

const PRODUCT_NAME = 'TobaGen AI Discovery';
const COLORS = {
  blue: [10, 102, 194] as const,
  blueLight: [232, 241, 255] as const,
  blueTint: [245, 249, 255] as const,
  border: [206, 223, 246] as const,
  text: [29, 29, 31] as const,
  textMuted: [90, 110, 135] as const,
  white: [255, 255, 255] as const,
};

export function exportItineraryPdf(itinerary: TobaItinerary) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const layout = {
    pageWidth: doc.internal.pageSize.getWidth(),
    pageHeight: doc.internal.pageSize.getHeight(),
    marginX: 16,
    marginTop: 18,
    marginBottom: 16,
    contentWidth: doc.internal.pageSize.getWidth() - 32,
  };

  let cursorY = layout.marginTop;

  const startPage = () => {
    drawPageBackground(doc, layout.pageWidth, layout.pageHeight);
    drawWatermark(doc, layout.pageWidth, layout.pageHeight);
    drawFooter(doc, layout.pageWidth, layout.pageHeight);
    cursorY = layout.marginTop;
  };

  const reserve = (height: number) => {
    if (cursorY + height <= layout.pageHeight - layout.marginBottom - 10) {
      return;
    }

    doc.addPage();
    startPage();
  };

  startPage();

  cursorY = drawHeaderCard(doc, itinerary, layout.marginX, cursorY, layout.contentWidth) + 10;

  reserve(34);
  drawSectionHeading(doc, layout.marginX, cursorY, 'Journey Overview');
  cursorY += 8;

  const overviewCardWidth = (layout.contentWidth - 8) / 3;
  const overviewValues = [
    { label: 'Duration', value: `${itinerary.days.length} day plan` },
    { label: 'Highlights', value: `${itinerary.recommendedPlaces.length} places` },
    { label: 'Travel Notes', value: `${itinerary.travelTips.length} tips` },
  ];

  overviewValues.forEach((item, index) => {
    drawInfoCard(doc, layout.marginX + index * (overviewCardWidth + 4), cursorY, overviewCardWidth, 22, item.label, item.value);
  });
  cursorY += 30;

  for (const day of itinerary.days) {
    const dayHeight = measureDayCardHeight(doc, day, layout.contentWidth);
    reserve(dayHeight);
    drawDayCard(doc, layout.marginX, cursorY, layout.contentWidth, day);
    cursorY += dayHeight + 6;
  }

  reserve(18);
  drawSectionHeading(doc, layout.marginX, cursorY, 'Recommended Places');
  cursorY += 8;

  for (const place of itinerary.recommendedPlaces) {
    const placeHeight = measurePlaceCardHeight(doc, place, layout.contentWidth);
    reserve(placeHeight);
    drawPlaceCard(doc, layout.marginX, cursorY, layout.contentWidth, place);
    cursorY += placeHeight + 5;
  }

  reserve(18);
  drawSectionHeading(doc, layout.marginX, cursorY, 'Travel Tips');
  cursorY += 8;

  itinerary.travelTips.forEach((tip, index) => {
    const content = `${index + 1}. ${tip}`;
    const tipHeight = measureTextHeight(doc, content, layout.contentWidth - 12, 10, 5) + 8;
    reserve(tipHeight);
    drawTipCard(doc, layout.marginX, cursorY, layout.contentWidth, content);
    cursorY += tipHeight + 4;
  });

  doc.save(`${slugify(itinerary.title)}.pdf`);
}

function drawHeaderCard(doc: jsPDF, itinerary: TobaItinerary, x: number, y: number, width: number) {
  const titleHeight = measureTextHeight(doc, itinerary.title, width - 18, 22, 8.2);
  const summaryHeight = measureTextHeight(doc, itinerary.summary, width - 18, 11, 5.2);
  const cardHeight = 18 + titleHeight + summaryHeight + 16;

  setFill(doc, COLORS.blue);
  doc.roundedRect(x, y, width, cardHeight, 8, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(PRODUCT_NAME, x + 9, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(formatGeneratedAt(), x + width - 9, y + 8, { align: 'right' });

  let textY = y + 18;
  textY = drawParagraph(doc, itinerary.title, x + 9, textY, width - 18, 22, 8.2, 'bold', [255, 255, 255]) + 2;
  textY = drawParagraph(doc, itinerary.summary, x + 9, textY, width - 18, 11, 5.2, 'normal', [242, 247, 255]) + 4;

  return Math.max(textY, y + cardHeight);
}

function drawSectionHeading(doc: jsPDF, x: number, y: number, title: string) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.blue);
  doc.text(title, x, y);
}

function drawInfoCard(doc: jsPDF, x: number, y: number, width: number, height: number, label: string, value: string) {
  setFill(doc, COLORS.white);
  setDraw(doc, COLORS.border);
  doc.roundedRect(x, y, width, height, 5, 5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.blue);
  doc.text(label.toUpperCase(), x + 5, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.text);
  drawParagraph(doc, value, x + 5, y + 13, width - 10, 11, 4.8, 'normal', COLORS.text);
}

function drawDayCard(doc: jsPDF, x: number, y: number, width: number, day: TobaItinerary['days'][number]) {
  const height = measureDayCardHeight(doc, day, width);

  setFill(doc, COLORS.white);
  setDraw(doc, COLORS.border);
  doc.roundedRect(x, y, width, height, 7, 7, 'FD');

  setFill(doc, COLORS.blueLight);
  doc.roundedRect(x + 1, y + 1, width - 2, 18, 6, 6, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.blue);
  doc.text(`DAY ${day.day}`, x + 6, y + 7);
  doc.setFontSize(15);
  doc.setTextColor(...COLORS.text);
  doc.text(day.title, x + 6, y + 14);

  let innerY = y + 26;
  day.activities.forEach((activity, index) => {
    const blockHeight = measureActivityBlockHeight(doc, activity, width - 12);
    setFill(doc, COLORS.blueTint);
    doc.roundedRect(x + 4, innerY - 4, width - 8, blockHeight + 6, 4, 4, 'F');

    innerY = drawParagraph(
      doc,
      `${activity.time} - ${activity.activity}`,
      x + 8,
      innerY,
      width - 16,
      11,
      5.2,
      'bold',
      COLORS.text,
    ) + 1.5;

    innerY = drawParagraph(
      doc,
      activity.location,
      x + 8,
      innerY,
      width - 16,
      9.5,
      4.4,
      'normal',
      COLORS.blue,
    ) + 1.2;

    innerY = drawParagraph(
      doc,
      activity.description,
      x + 8,
      innerY,
      width - 16,
      10,
      4.8,
      'normal',
      COLORS.textMuted,
    ) + 3;

    if (index < day.activities.length - 1) {
      innerY += 1;
    }
  });
}

function drawPlaceCard(doc: jsPDF, x: number, y: number, width: number, place: TobaItinerary['recommendedPlaces'][number]) {
  const height = measurePlaceCardHeight(doc, place, width);

  setFill(doc, COLORS.white);
  setDraw(doc, COLORS.border);
  doc.roundedRect(x, y, width, height, 6, 6, 'FD');

  let innerY = y + 8;
  innerY = drawParagraph(doc, place.name, x + 6, innerY, width - 12, 12, 5.4, 'bold', COLORS.text) + 1;
  innerY = drawParagraph(
    doc,
    `${place.category} - Best time: ${place.bestTime}`,
    x + 6,
    innerY,
    width - 12,
    9,
    4.3,
    'normal',
    COLORS.blue,
  ) + 1;
  innerY = drawParagraph(
    doc,
    `Lat ${place.location.lat.toFixed(2)}, Lng ${place.location.lng.toFixed(2)}`,
    x + 6,
    innerY,
    width - 12,
    9,
    4.3,
    'normal',
    COLORS.textMuted,
  ) + 1.5;
  drawParagraph(doc, place.description, x + 6, innerY, width - 12, 10, 4.8, 'normal', COLORS.textMuted);
}

function drawTipCard(doc: jsPDF, x: number, y: number, width: number, tip: string) {
  const height = measureTextHeight(doc, tip, width - 12, 10, 5) + 8;

  setFill(doc, COLORS.blueTint);
  setDraw(doc, COLORS.border);
  doc.roundedRect(x, y, width, height, 5, 5, 'FD');
  drawParagraph(doc, tip, x + 6, y + 7, width - 12, 10, 5, 'normal', COLORS.text);
}

function drawPageBackground(doc: jsPDF, pageWidth: number, pageHeight: number) {
  setFill(doc, [247, 250, 255]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  setFill(doc, [227, 238, 252]);
  doc.rect(0, 0, pageWidth, 12, 'F');
}

function drawWatermark(doc: jsPDF, pageWidth: number, pageHeight: number) {
  doc.saveGraphicsState();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(225, 235, 248);
  doc.text(PRODUCT_NAME, pageWidth / 2, pageHeight / 2, {
    align: 'center',
    angle: 32,
  });
  doc.restoreGraphicsState();
}

function drawFooter(doc: jsPDF, pageWidth: number, pageHeight: number) {
  const footerY = pageHeight - 8;
  const pageNumber = doc.getCurrentPageInfo().pageNumber;

  setDraw(doc, [209, 221, 240]);
  doc.line(16, footerY - 4, pageWidth - 16, footerY - 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.textMuted);
  doc.text('Crafted for personalized Lake Toba planning', 16, footerY);
  doc.text(`${PRODUCT_NAME} - Page ${pageNumber}`, pageWidth - 16, footerY, { align: 'right' });
}

function drawParagraph(
  doc: jsPDF,
  text: string,
  x: number,
  startY: number,
  maxWidth: number,
  fontSize: number,
  lineHeight: number,
  fontStyle: 'normal' | 'bold',
  color: readonly [number, number, number],
) {
  const lines = getTextLines(doc, text, maxWidth, fontSize, fontStyle);

  doc.setFont('helvetica', fontStyle);
  doc.setFontSize(fontSize);
  doc.setTextColor(...color);

  let currentY = startY;
  lines.forEach((line) => {
    doc.text(line, x, currentY);
    currentY += lineHeight;
  });

  return currentY;
}

function getTextLines(
  doc: jsPDF,
  text: string,
  maxWidth: number,
  fontSize: number,
  fontStyle: 'normal' | 'bold',
) {
  doc.setFont('helvetica', fontStyle);
  doc.setFontSize(fontSize);
  return doc.splitTextToSize(text, maxWidth) as string[];
}

function measureTextHeight(
  doc: jsPDF,
  text: string,
  maxWidth: number,
  fontSize: number,
  lineHeight: number,
  fontStyle: 'normal' | 'bold' = 'normal',
) {
  const lines = getTextLines(doc, text, maxWidth, fontSize, fontStyle);
  return lines.length * lineHeight;
}

function measureActivityBlockHeight(
  doc: jsPDF,
  activity: TobaItinerary['days'][number]['activities'][number],
  width: number,
) {
  return (
    measureTextHeight(doc, `${activity.time} - ${activity.activity}`, width - 4, 11, 5.2, 'bold') +
    measureTextHeight(doc, activity.location, width - 4, 9.5, 4.4) +
    measureTextHeight(doc, activity.description, width - 4, 10, 4.8) +
    8
  );
}

function measureDayCardHeight(doc: jsPDF, day: TobaItinerary['days'][number], width: number) {
  return 26 + day.activities.reduce((total, activity) => total + measureActivityBlockHeight(doc, activity, width - 8) + 4, 0);
}

function measurePlaceCardHeight(doc: jsPDF, place: TobaItinerary['recommendedPlaces'][number], width: number) {
  return (
    measureTextHeight(doc, place.name, width - 12, 12, 5.4, 'bold') +
    measureTextHeight(doc, `${place.category} - Best time: ${place.bestTime}`, width - 12, 9, 4.3) +
    measureTextHeight(doc, `Lat ${place.location.lat.toFixed(2)}, Lng ${place.location.lng.toFixed(2)}`, width - 12, 9, 4.3) +
    measureTextHeight(doc, place.description, width - 12, 10, 4.8) +
    12
  );
}

function setFill(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setFillColor(color[0], color[1], color[2]);
}

function setDraw(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setDrawColor(color[0], color[1], color[2]);
}

function formatGeneratedAt() {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'toba-itinerary';
}
