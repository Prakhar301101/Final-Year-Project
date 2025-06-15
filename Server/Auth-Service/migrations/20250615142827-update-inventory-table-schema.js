"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.addColumn(
                "inventories",
                "inventoryID",
                {
                    type: Sequelize.INTEGER,
                    autoIncrement: true,
                    allowNull: false,
                    primaryKey: true,
                },
                { transaction }
            );

            await queryInterface.addColumn(
                "inventories",
                "productID",
                {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    references: {
                        model: "products",
                        key: "productID",
                    },
                    onUpdate: "CASCADE",
                    onDelete: "SET NULL",
                },
                { transaction }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.removeColumn("inventories", "productID", {
                transaction,
            });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },
};
