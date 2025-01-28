'use strict';
const {
  Model
} = require('sequelize');

const bcrypt = require('bcryptjs');

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
          args: [6],
          msg: 'Password must be at least 6 characters long'
        }
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
    },
    hooks: {
      beforeCreate: (user, options) => {
        if (user.password) {
          user.password = bcrypt.hashSync(user.password, 10);
        }
      },
      beforeUpdate: (user, options) => {
        if (user.changed('password')) {
          const hashedPassword = bcrypt.hashSync(user.password, 10);
          user.password = hashedPassword;
        } else {
          user.password = user._previousDataValues.password;
        }
      }
    }
  },
  );
  return User;
};