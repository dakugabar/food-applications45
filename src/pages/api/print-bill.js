import { printDirect } from 'printer';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { printerName, billContent } = req.body;

    // Check if printer name and bill content are provided
    if (!printerName || !billContent) {
      return res.status(400).json({ error: 'Printer name and content are required' });
    }

    try {
      // Log the data for debugging
      console.log('Printer Name:', printerName);
      console.log('Bill Content:', billContent);

      // Send the print job to the specified printer
      printDirect({
        data: billContent, // Content to print
        printer: printerName, // Printer name on the network
        type: 'RAW', // Document type (RAW or text)
        success: (jobID) => {
          console.log('Print job sent successfully with ID:', jobID);
          res.status(200).json({ message: `Print job sent successfully with ID: ${jobID}` });
        },
        error: (err) => {
          console.error('Error while printing:', err);
          res.status(500).json({ error: `Failed to send print job: ${err.message}` });
        },
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      res.status(500).json({ error: `An unexpected error occurred: ${error.message}` });
    }
  } else {
    // Handle unsupported methods (only POST is allowed for this API)
    res.status(405).json({ error: 'Method not allowed' });
  }
}
