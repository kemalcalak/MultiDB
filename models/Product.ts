import { DataTypes, Model } from 'sequelize';
import sequelize from '@/lib/db/mysql';
import mongoose from 'mongoose';

// Ürün model interface'i
interface ProductAttributes {
  id?: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  stock: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProductCreationAttributes extends Omit<ProductAttributes, 'id'> {}

// Sequelize Product modeli
export class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  public id!: number;
  public name!: string;
  public price!: number;
  public description!: string;
  public imageUrl!: string;
  public stock!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: 'products',
    sequelize,
  }
);

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
const MongoProduct = mongoose.models.Product || mongoose.model('Product', ProductSchema);

export { MongoProduct };
export default Product;
