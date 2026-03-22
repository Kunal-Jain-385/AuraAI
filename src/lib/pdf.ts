import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export interface PDFExtractionResult {
  text: string;
  pageCount: number;
  error?: string;
}

export const extractTextFromPDF = async (file: File): Promise<PDFExtractionResult> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    
    // Track loading progress if needed, but for now just wait for completion
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    const pageCount = pdf.numPages;

    if (pageCount === 0) {
      return { text: '', pageCount: 0, error: 'The PDF file is empty.' };
    }

    for (let i = 1; i <= pageCount; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        if (pageText.trim()) {
          fullText += `--- Page ${i} ---\n${pageText}\n\n`;
        }
      } catch (pageErr) {
        console.warn(`Failed to extract text from page ${i}:`, pageErr);
        // Continue to next page instead of failing entirely
      }
    }

    if (!fullText.trim()) {
      return {
        text: '',
        pageCount,
        error: 'This PDF appears to be image-based (scanned) or contains no extractable text. Aura currently only supports text-based PDFs.'
      };
    }

    return { text: fullText, pageCount };
  } catch (err: any) {
    console.error('PDF extraction error:', err);
    
    if (err.name === 'PasswordException') {
      return { text: '', pageCount: 0, error: 'This PDF is password-protected. Please provide an unprotected version for analysis.' };
    }
    
    if (err.name === 'InvalidPDFException' || err.message?.includes('Invalid PDF')) {
      return { text: '', pageCount: 0, error: 'The PDF file is corrupted or invalid. Please try another file.' };
    }

    if (err.message?.includes('Worker error')) {
      return { text: '', pageCount: 0, error: 'A technical error occurred while processing the PDF. Please try refreshing the page.' };
    }

    return { text: '', pageCount: 0, error: `Failed to process PDF: ${err.message || 'Unknown error'}` };
  }
};
