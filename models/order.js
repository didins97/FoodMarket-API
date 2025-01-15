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
      // define association here
    }
  }
  Order.init({
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
      values: ['pending', 'success', 'failed'],
      defaultValue: 'pending'  
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
  }
);
  return Order;
};