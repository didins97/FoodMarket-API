'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Categories extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Categories.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: 'Categories must be unique'
      },
      validate: {
        notNull: {
          args: true,
          msg: 'Categories must not be empty'
        }
      }
    }
  },
  {
    sequelize,
    modelName: 'Categories',
  }
);
  return Categories;
};