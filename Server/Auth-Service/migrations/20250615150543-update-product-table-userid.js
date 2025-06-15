"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("products", "UserId", {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
            onDelete: "CASCADE",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("products", "userId");
    },
};
