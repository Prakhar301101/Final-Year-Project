import { RequestHandler, Request, Response, NextFunction } from "express";
import db from "../../models";

const User = (db as any).User;
const Transaction = (db as any).Transaction;
const Product = (db as any).Product;

type AsyncHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<any>;

const convertQuantity = (quantityStr: string): number => {
    const match = quantityStr.match(
        /(\d+(?:\.\d+)?)(\s*)(kg|g|gm|L|l|mL|ml)$/i
    );
    if (!match) return parseFloat(quantityStr);

    const [, value, , unit] = match;
    const numericValue = parseFloat(value);

    switch (unit.toLowerCase()) {
        case "kg":
        case "l":
            return numericValue;
        case "g":
        case "gm":
        case "ml":
            return numericValue / 1000;
        default:
            return numericValue;
    }
};

export const storeRows: AsyncHandler = async (req, res, next) => {
    try {
        const { rows } = req.body;

        // Validate input
        if (!Array.isArray(rows) || rows.length === 0) {
            return res.status(400).json({ error: "No rows provided" });
        }

        // Ensure all rows have a valid UserId
        const userIds = [...new Set(rows.map((row) => row.UserId))];
        const users = await User.findAll({ where: { id: userIds } });

        if (users.length !== userIds.length) {
            return res
                .status(400)
                .json({ error: "Invalid UserId(s) provided" });
        }

        // Get unique item names and find corresponding products
        const itemNames = [...new Set(rows.map((row) => row.item))];
        const products = await Product.findAll({
            where: {
                productName: itemNames,
            },
            attributes: ["productID", "productName"],
        });
        // Create a map for quick product lookup
        const productMap = new Map(
            products.map(
                (p: { productName: string; productID: string | number }) => [
                    p.productName,
                    p.productID,
                ]
            )
        );
        // Check if all items exist in products table
        const missingItems = itemNames.filter((item) => !productMap.has(item));
        if (missingItems.length > 0) {
            return res.status(400).json({
                error: "Some items do not exist in the products table",
                missingItems,
            });
        }

        const processedRows = rows.map((row) => ({
            ...row,
            date: new Date(row.date),
            orderID: parseInt(row.orderID),
            productID: productMap.get(row.item),
            sellingPrice: parseFloat(row.sellingPrice),
            quantity: convertQuantity(row.quantity),
        }));
        // Bulk insert rows into the Transaction table
        const insertedRows = await Transaction.bulkCreate(processedRows);

        res.status(201).json({
            message: "Rows stored successfully",
            data: insertedRows,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Server error",
            details: (err as Error)?.message,
        });
    }
};
