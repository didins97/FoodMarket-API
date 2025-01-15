'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      length: {
        min: 3,
        msg: 'Name must be between 3'
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: 'Email must be unique'
      },
      validate: {
        isEmail: {
          args: true,
          msg: 'Email must be valid'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          args: true,
          msg: 'Password is required'
        },
        notEmpty: {
          args: true,
          msg: 'Password is required'
        },
        len: {
          args: [6, 20],
          msg: 'Password must be between 6 and 20 characters'
        },
        // is: {
        //   args: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$!%*?&]{8,}$/,
        //   msg: "Password must contain at least 8 characters, one lowercase letter, one uppercase letter, and one number.",
        // },
      }
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user',
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
    scopes: {
      withoutPassword: {
        attributes: {
          exclude: ['password']
        }
      }
    }
  },
);
  return User;
};