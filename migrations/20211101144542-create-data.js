'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Data', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      CustomerName: {
        type: Sequelize.STRING
      },
      DatePurchase: {
        type: Sequelize.STRING
      },
      Amount_due__C: {
        type: Sequelize.INTEGER
      },
      Discount__c: {
        type: Sequelize.INTEGER
      },
      GST__c: {
        type: Sequelize.INTEGER
      },
      CreatedDate: {
        type: Sequelize.DATE
      },
      LastModifiedDate: {
        type: Sequelize.DATE
      }
      // createdAt: {
      //   allowNull: false,
      //   type: Sequelize.DATE
      // },
      // updatedAt: {
      //   allowNull: false,
      //   type: Sequelize.DATE
      // }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Data');
  }
};