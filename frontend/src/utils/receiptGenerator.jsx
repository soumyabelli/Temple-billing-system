import React from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import BookingReceipt from '../components/common/BookingReceipt';

export const downloadReceiptPDF = (receiptData, options = {}) => {
  const saveName = typeof options === 'string' ? options : (options?.filename || `receipt-${receiptData?.receiptNo || 'temple'}.pdf`);
  return new Promise((resolve, reject) => {
    try {
      const container = document.createElement('div');
      
      // Render off-screen with fixed width matching optimal A4 proportions
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '820px'; 
      container.style.backgroundColor = '#ffffff';
      
      document.body.appendChild(container);

      const root = createRoot(container);
      
      root.render(
        <div id="temp-receipt-content" style={{ margin: 0, padding: 0, backgroundColor: '#ffffff', color: '#000' }}>
          <BookingReceipt {...receiptData} />
        </div>
      );

      // Give React time to render all subcomponents, fonts, and styles
      setTimeout(async () => {
        try {
          const element = document.getElementById('temp-receipt-content');
          if (!element) throw new Error("Receipt element not found");

          const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff"
          });
          
          const pdf = new jsPDF("p", "mm", "a4");
          const pageWidth = pdf.internal.pageSize.getWidth(); // 210 mm
          const pageHeight = pdf.internal.pageSize.getHeight(); // 297 mm
          const margin = 5; // 5 mm margin around the page
          const printableWidth = pageWidth - (margin * 2); // 200 mm
          const printableHeight = pageHeight - (margin * 2); // 287 mm

          const contentHeightMm = (canvas.height * printableWidth) / canvas.width;

          // If content fits within single page or slightly exceeds (within 20%), scale down to fit on ONE single page
          if (contentHeightMm <= printableHeight * 1.20) {
            const scale = Math.min(1, printableHeight / contentHeightMm);
            const scaledWidth = printableWidth * scale;
            const scaledHeight = contentHeightMm * scale;
            const xOffset = margin + (printableWidth - scaledWidth) / 2;
            const yOffset = margin + (printableHeight - scaledHeight) / 2;
            const imgData = canvas.toDataURL("image/jpeg", 0.98);
            pdf.addImage(imgData, "JPEG", xOffset, yOffset, scaledWidth, scaledHeight);
          } else {
            // For extra long multi-service receipts (10+ items), cleanly slice canvas into A4 page-height chunks so NOTHING is ever cut off
            const pageCanvasHeight = Math.floor((printableHeight / printableWidth) * canvas.width);
            let currentY = 0;
            let pageIndex = 0;

            while (currentY < canvas.height) {
              if (pageIndex > 0) {
                pdf.addPage();
              }

              const sliceHeight = Math.min(pageCanvasHeight, canvas.height - currentY);
              const pageCanvas = document.createElement('canvas');
              pageCanvas.width = canvas.width;
              pageCanvas.height = sliceHeight;
              const pageCtx = pageCanvas.getContext('2d');

              pageCtx.fillStyle = '#ffffff';
              pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
              pageCtx.drawImage(
                canvas,
                0, currentY, canvas.width, sliceHeight,
                0, 0, canvas.width, sliceHeight
              );

              const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98);
              const sliceHeightMm = (sliceHeight * printableWidth) / canvas.width;
              pdf.addImage(pageImgData, 'JPEG', margin, margin, printableWidth, sliceHeightMm);

              currentY += sliceHeight;
              pageIndex++;
            }
          }

          let finalFileName = typeof saveName === 'string' && saveName.trim() ? saveName.trim() : `Receipt-${receiptData?.receiptNo || 'Temple'}.pdf`;
          if (!finalFileName.toLowerCase().endsWith('.pdf')) {
            finalFileName += '.pdf';
          }

          // Use robust blob + anchor trigger attached to document.body so Chromium ALWAYS honors the filename and .pdf extension
          const pdfBlob = pdf.output('blob');
          const blobUrl = URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = finalFileName;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();

          setTimeout(() => {
            if (link.parentNode) {
              link.parentNode.removeChild(link);
            }
            URL.revokeObjectURL(blobUrl);
          }, 30000);

          resolve();
        } catch (err) {
          console.error("PDF generation error:", err);
          reject(err);
        } finally {
          root.unmount();
          if (container.parentNode) {
            container.parentNode.removeChild(container);
          }
        }
      }, 350);
    } catch (err) {
      reject(err);
    }
  });
};
