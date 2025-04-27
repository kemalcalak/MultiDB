import mongoose from 'mongoose';

// Siparişteki ürün için alt şema
const OrderItemSchema = new mongoose.Schema({
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
});

// Teslimat adresi için şema
const ShippingAddressSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
});

// Ana Sipariş şeması
const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: Number, // MySQL User tablosundaki id'yi referans alır
      required: true,
      index: true,
    },
    orderItems: [OrderItemSchema],
    shippingAddress: ShippingAddressSchema,
    paymentMethod: {
      type: String,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Model varsa kullan, yoksa oluştur
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

export default Order;
