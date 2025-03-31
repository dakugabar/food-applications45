const mongoose = require('mongoose');

const deliveryBillPrinterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DeliveryBillPrinter', deliveryBillPrinterSchema);