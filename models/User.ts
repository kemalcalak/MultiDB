import { DataTypes, Model } from 'sequelize';
import sequelize from '@/lib/db/mysql';
import bcrypt from 'bcryptjs';

// Kullanıcı model interface'i
interface UserAttributes {
  id?: number;
  email: string;
  password: string;
  name: string;
  role: string; // Yeni eklenen rol alanı
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Omit<UserAttributes, 'id'> {}

// Sequelize User modeli
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public password!: string;
  public name!: string;
  public role!: string; // Yeni eklenen rol alanı
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('customer', 'supplier'), // Müşteri veya tedarikçi rolü
      defaultValue: 'customer',
      allowNull: false,
    },
  },
  {
    tableName: 'users',
    sequelize,
    hooks: {
      beforeCreate: async (user: User) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      },
    },
  }
);

// Password karşılaştırma metodu
export const comparePassword = async (candidatePassword: string, userPassword: string) => {
  return bcrypt.compare(candidatePassword, userPassword);
};

export default User;
