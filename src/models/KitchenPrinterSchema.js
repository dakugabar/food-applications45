import mongoose from 'mongoose';

// Define the schema for the KitchenPrinter
const KitchenPrinterSchema = new mongoose.Schema({
  printername: { type: String, required: true }  // Define the 'printername' field as a required string
});

// Export the model, checking if it already exists in mongoose.models
export const KitchenPrinter = mongoose.models.KitchenPrinter || mongoose.model('KitchenPrinter', KitchenPrinterSchema);
