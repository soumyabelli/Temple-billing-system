import React from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import BookingReceipt from '../components/common/BookingReceipt';

export const downloadReceiptPDF = (receiptData, filename) => {
  return new Promise((resolve, reject) => {
    try {
      const container = document.createElement('div');
      
      // We render off-screen but ensure it's technically visible for html2canvas to capture it
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '800px'; 
      container.style.backgroundColor = '#ffffff';
      
      document.body.appendChild(container);

      const root = createRoot(container);
      
      root.render(
        <div id="temp-receipt-content" style={{ padding: '20px', backgroundColor: '#ffffff', color: '#000' }}>
          <BookingReceipt {...receiptData} />
        </div>
      );

      // Give React time to render and styles to apply
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
          
          const imgData = canvas.toDataURL("image/jpeg", 1.0);
          const pdf = new jsPDF("p", "mm", "a4");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          
          pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
          pdf.save(filename || `receipt-${receiptData.receiptNo}.pdf`);
          
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
      }, 300);
    } catch (err) {
      reject(err);
    }
  });
};
