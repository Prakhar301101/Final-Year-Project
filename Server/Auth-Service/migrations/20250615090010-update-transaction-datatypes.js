"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.sequelize.query(
                'TRUNCATE "transactions" CASCADE',
                { transaction }
            );

            await queryInterface.sequelize.query(
                'ALTER TABLE "transactions" ' +
                    'ALTER COLUMN "orderID" DROP DEFAULT',
                { transaction }
            );
            await queryInterface.sequelize.query(
                'ALTER TABLE "transactions" ' +
                    'ALTER COLUMN "quantity" DROP DEFAULT',
                { transaction }
            );
            await queryInterface.sequelize.query(
                'ALTER TABLE "transactions" ' +
                    'ALTER COLUMN "sellingPrice" DROP DEFAULT',
                { transaction }
            );

            await queryInterface.sequelize.query(
                'ALTER TABLE "transactions" ' +
                    'ALTER COLUMN "date" TYPE DATE USING "date"::date, ' +
                    'ALTER COLUMN "orderID" TYPE INTEGER USING "orderID"::integer, ' +
                    'ALTER COLUMN "quantity" TYPE DECIMAL(10, 3) USING "quantity"::decimal(10, 3), ' +
                    'ALTER COLUMN "sellingPrice" TYPE DECIMAL(10, 2) USING "sellingPrice"::decimal(10, 2)',
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
            await queryInterface.sequelize.query(
                'ALTER TABLE "transactions" ' +
                    'ALTER COLUMN "date" TYPE VARCHAR(255), ' +
                    'ALTER COLUMN "orderID" TYPE VARCHAR(255), ' +
                    'ALTER COLUMN "quantity" TYPE DECIMAL(10, 3), ' +
                    'ALTER COLUMN "sellingPrice" TYPE VARCHAR(255)',
                { transaction }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },
};
