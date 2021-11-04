'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Data extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Data.init({
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    CustomerName: DataTypes.STRING,
    DatePurchase: DataTypes.STRING,
    Amount_due__c: DataTypes.FLOAT,
    Discount__c: DataTypes.FLOAT,
    GST__c: DataTypes.FLOAT,
    CreatedDate: DataTypes.DATE,
    LastModifiedDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Data',
    timestamps: false
  });
  return Data;
};