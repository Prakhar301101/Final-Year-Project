"use strict";

const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    class Product extends Model {
        static associate(models) {
            Product.hasMany(models.Transaction, {
                foreignKey: "productID",
                sourceKey: "productID",
                as: "transactions",
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
            });
            Product.hasMany(models.Inventory, {
                foreignKey: "productID",
                sourceKey: "productID",
                as: "inventories",
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
            });
            Product.belongsTo(models.User, {
                foreignKey: "UserId",
                as: "user",
            });
        }
    }

    Product.init(
        {
            productID: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
            },
            productName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            UserId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "users", // Table name for the User model
                    key: "id",
                },
            },
        },
        {
            sequelize,
            modelName: "Product",
            tableName: "products",
            timestamps: false,
        }
    );
    return Product;
};
