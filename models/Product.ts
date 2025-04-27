import mongoose from 'mongoose';

// Ürün şeması
const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ürün adı gereklidir'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Ürün fiyatı gereklidir'],
      min: [0, 'Fiyat negatif olamaz'],
    },
    description: {
      type: String,
      required: [true, 'Ürün açıklaması gereklidir'],
    },
    imageUrl: {
      type: String,
      required: false,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      required: false,
    },
    features: {
      type: [String],
      default: [],
    },
    ratings: {
      type: [
        {
          userId: Number, // MySQL User ID'si
          rating: Number,
          comment: String,
          date: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    averageRating: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Ürün modelini oluştur
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

export default Product;
