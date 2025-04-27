import { DataTypes, Model } from 'sequelize';
import sequelize from '@/lib/db/mysql';

// Şifre sıfırlama token model interface'i
interface ResetTokenAttributes {
  id?: number;
  userId: number;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ResetTokenCreationAttributes extends Omit<ResetTokenAttributes, 'id'> {}

// Sequelize ResetToken modeli
export class ResetToken extends Model<ResetTokenAttributes, ResetTokenCreationAttributes> implements ResetTokenAttributes {
  public id!: number;
  public userId!: number;
  public token!: string;
  public expiresAt!: Date;
  public used!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ResetToken.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    used: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: 'reset_tokens',
    sequelize,
  }
);

export default ResetToken;
