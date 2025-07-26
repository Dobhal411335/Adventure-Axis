import mongoose from 'mongoose';

const QuantitySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variants: [
    {
      size: String,
      color: String,
      qty: Number,
      price: Number,
      weight: Number,
      optional: Boolean
    }
  ],
}, { timestamps: true });

export default mongoose.models.Quantity || mongoose.model('Quantity', QuantitySchema);
