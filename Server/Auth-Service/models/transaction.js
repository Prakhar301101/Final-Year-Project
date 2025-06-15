"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    class Transaction extends Model {
        static associate(models) {
            // A transaction belongs to a user
            Transaction.belongsTo(models.User, {
                foreignKey: "UserId",
                as: "user",
            });
            Transaction.belongsTo(models.Product, {
                foreignKey: "productID",
                as: "product",
            });
        }
    }

    Transaction.init(
        {
            UserId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "users", // Table name for the User model
                    key: "id",
                },
            },
            date: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            orderID: {
                type: DataTypes.INTEGER,
                allowNull: false,
                default: 0,
            },
            item: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            quantity: {
                type: DataTypes.DECIMAL(10, 3),
                allowNull: false,
                default: 0.0,
            },
            sellingPrice: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                default: 0.0,
            },
            productID: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "products",
                    key: "productID",
                },
            },
        },
        {
            sequelize,
            modelName: "Transaction",
            tableName: "transactions",
            timestamps: false, // Enable createdAt and updatedAt
        }
    );

    return Transaction;
};
