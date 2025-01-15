'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      Cart.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });

      Cart.belongsTo(models.Food, {
        foreignKey: 'food_id',
        as: 'food'
      })
    }
  }
  Cart.init({
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
    food_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Foods',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'Cart',
    tableName: 'Carts'
  }
);
  return Cart;
};