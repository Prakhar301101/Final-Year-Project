"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("inventories", "stockingDate", {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
        });

        await queryInterface.removeColumn("inventories", "createdAt");
        await queryInterface.removeColumn("inventories", "updatedAt");
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("inventories", "stockingDate");

        await queryInterface.addColumn("inventories", "createdAt", {
            allowNull: false,
            type: Sequelize.DATE,
        });
        await queryInterface.addColumn("inventories", "updatedAt", {
            allowNull: false,
            type: Sequelize.DATE,
        });
    },
};
