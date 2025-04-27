import mongoose from 'mongoose';

// Sepetteki ürün için alt şema
const CartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId, // MongoDB Product ID'si
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  imageUrl: {
    type: String,
  },
});

// Ana Sepet şeması
const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: Number, // MySQL User tablosundaki id'yi referans alır
      required: true,
      index: true,
    },
    items: [CartItemSchema],
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Model varsa kullan, yoksa oluştur
const Cart = mongoose.models.Cart || mongoose.model('Cart', CartSchema);

export default Cart;
