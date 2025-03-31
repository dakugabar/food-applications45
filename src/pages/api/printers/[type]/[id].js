import dbConnect from '../../../../app/lib/dbconnect';
import DeliveryBillPrinter from '../../../../models/DeliveryBillPrinter';
import TableBillPrinter from '../../../../models/TableBillPrinter';
import KitchenBillPrinter from '../../../../models/KitchenBillPrinter';

export default async function handler(req, res) {
  await dbConnect();

  const { type, id } = req.query;

  // Map type to the correct model
  const printerModels = {
    delivery: DeliveryBillPrinter,
    table: TableBillPrinter,
    kitchen: KitchenBillPrinter,
  };

  const PrinterModel = printerModels[type];

  if (!PrinterModel) {
    return res.status(400).json({ message: "Invalid printer type" });
  }

  switch (req.method) {
    case 'DELETE':
      try {
        const deletedPrinter = await PrinterModel.findByIdAndDelete(id);
        if (!deletedPrinter) {
          return res.status(404).json({ message: "Printer not found" });
        }
        res.status(200).json({ message: "Printer deleted successfully" });
      } catch (error) {
        res.status(500).json({ message: "Error deleting printer", error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
