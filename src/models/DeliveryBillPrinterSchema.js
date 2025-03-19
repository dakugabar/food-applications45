import mongoose from 'mongoose';

// Define the schema for the DeliveryBillPrinter
const DeliveryBillPrinterSchema = new mongoose.Schema({
  printername: { type: String, required: true }  // Define the 'printername' field as a required string
});

// Export the model, checking if it already exists in mongoose.models
export const DeliveryBillPrinter = mongoose.models.DeliveryBillPrinter || mongoose.model('DeliveryBillPrinter', DeliveryBillPrinterSchema);
