"use strict";
const { Model, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // A user can have many transactions
            User.hasMany(models.Transaction, {
                foreignKey: "UserId", // Foreign key in the Transaction table
                as: "transactions", // Alias for the association
                onDelete: "CASCADE", // Optional: Delete transactions if the user is deleted
            });
            // A user can have many inventories
            User.hasMany(models.Inventory, {
                foreignKey: "UserId", // Foreign key in the Inventory table
                as: "inventories", // Alias for the association
                onDelete: "CASCADE", // Optional: Delete inventories if the user is deleted
            });
            // A user can have many products
            User.hasMany(models.Product, {
                foreignKey: "UserId", // Foreign key in the Product table
                as: "products", // Alias for the association
                onDelete: "CASCADE", // Optional: Delete products if the user is deleted
            });
        }

        // Instance method to compare passwords
        async comparePassword(candidatePassword) {
            return bcrypt.compare(candidatePassword, this.password);
        }
    }

    User.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: { msg: "Name cannot be empty" },
                },
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: { msg: "Email address already in use!" },
                validate: {
                    isEmail: { msg: "Must be a valid email address" },
                },
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: {
                        args: [8, 255],
                        msg: "Password must be at least 8 characters long",
                    },
                },
            },
            storeName: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            businessType: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            gstNumber: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            address: {
                type: DataTypes.TEXT, // Use TEXT for potentially longer addresses
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT, // Use TEXT for potentially longer descriptions
                allowNull: true,
            },
            phoneNumber: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            establishedYear: {
                type: DataTypes.INTEGER,
                allowNull: true,
                validate: {
                    isInt: { msg: "Established year must be a valid year" },
                    min: 1800, // Example minimum year
                    max: new Date().getFullYear(), // Example maximum year (current year)
                },
            },
            avgMonthlyRevenue: {
                type: DataTypes.DECIMAL(15, 2), // Example: Up to 15 digits total, 2 after decimal
                allowNull: true,
                validate: {
                    isDecimal: {
                        msg: "Average monthly revenue must be a number",
                    },
                    min: 0, // Revenue cannot be negative
                },
            },
            // Timestamps are managed by Sequelize by default (createdAt, updatedAt)
        },
        {
            sequelize,
            modelName: "User",
            tableName: "users", // Explicitly define table name
            timestamps: true, // Enable timestamps
            hooks: {
                // Hook to hash password before creating/updating a user
                beforeSave: async (user, options) => {
                    if (user.changed("password")) {
                        const salt = await bcrypt.genSalt(12);
                        user.password = await bcrypt.hash(user.password, salt);
                    }
                },
            },
            defaultScope: {
                // Exclude password by default when querying
                attributes: { exclude: ["password"] },
            },
            scopes: {
                // Define a scope to include password when needed (e.g., for login)
                withPassword: {
                    attributes: { include: ["password"] },
                },
            },
        }
    );

    return User;
};
