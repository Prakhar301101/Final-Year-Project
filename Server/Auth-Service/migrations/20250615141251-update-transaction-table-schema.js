"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            // Add productID column
            await queryInterface.addColumn(
                "transactions",
                "productID",
                {
                    type: Sequelize.INTEGER,
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
            // Revert productID column
            await queryInterface.removeColumn("transactions", "productID", {
                transaction,
            });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },
};
