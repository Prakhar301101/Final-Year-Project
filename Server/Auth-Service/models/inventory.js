"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    class Inventory extends Model {
        static associate(models) {
            // An inventory belongs to a user
            Inventory.belongsTo(models.User, {
                foreignKey: "UserId",
                as: "user",
            });
            // An inventory belongs to a product
            Inventory.belongsTo(models.Product, {
                foreignKey: "productID",
                as: "product",
            });
        }
    }

    Inventory.init(
        {
            inventoryID: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            productID: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "products",
                    key: "productID",
                },
            },
            UserId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Users",
                    key: "id",
                },
            },
            productName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            unitPrice: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            holdingQuantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "Inventory",
            tableName: "inventories",
            timestamps: false,
        }
    );

    return Inventory;
};
