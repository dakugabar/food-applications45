import mongoose from "mongoose";

const TablesaveSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    mobileNumber: { type: String, default: 0},
    seatNumber: { type: Number, default: 0 },
    tableNumber: { type: String, required: true },
    maxPax: { type: Number, required: true },
    orderItems: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" ,required:true},
        name: { type: String, required: true },
        discount: { type: Number, required: true },
        gstRate: { type: Number, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, default: 1 },
        itemstatus: {
          type: String,
          enum: ["Pending", "Preparing", "Ready", "Served", "Cancelled"],
          default: "Pending",
        },
        total: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number, required: true },
   
    createdDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Tablesave || mongoose.model("Tablesave", TablesaveSchema);
