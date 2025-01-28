'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' })

      Order.hasMany(models.OrderItem, { foreignKey: 'order_id', as: 'order_items' })
    }
  }
  Order.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    total_price: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    payment_method: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['cash', 'transfer'],
      defaultValue: 'cash'
    },
    status: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['pending', 'processed', 'completed', 'canceled'],
      defaultValue: 'pending',
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  },
    {
      sequelize,
      modelName: 'Order',
      tableName: 'Orders',
      paranoid: true,
      hooks: {
        async afterUpdate(order, option) {
          const { OrderItem } = sequelize.models;

          let newStatus;
          switch (order.status) {
            case 'pending':
              newStatus = 'awaited'
              break;
            case 'processed':
              newStatus = 'packed'
              break;
            case 'completed':
              newStatus = 'received'
              break;
            case 'canceled':
              newStatus = 'canceled'
              break;
            default:
              newStatus = 'awaited'
              break;
          }

          await OrderItem.update(
            { status: newStatus },
            {
              where: { order_id: order.id }
            }
          );
        }
      },
      scopes: {
        admin: {
          include: { all: true }
        },
        userOrders: (userId) => {
          return {
            where: { user_id: userId },
            include: { all: true }
          }
        }
      }
    }
  );
  return Order;
};