from itertools import product
import random
import datetime
import sys
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv
import os

# Database connection settings - update these to match your environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres.evujabwwvgxmasemxjkz:Tony2056*@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres")

# Connect to the database
try:
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    print("Connected to the database successfully!")
except Exception as e:
    print(f"Error connecting to the database: {e}")
    sys.exit(1)

# Get existing user IDs from the database
def get_user_ids():
    try:
        cursor.execute("SELECT id FROM users")
        user_ids = [row[0] for row in cursor.fetchall()]
        if not user_ids:
            print("No users found in the database. Please create at least one user first.")
            sys.exit(1)
        return user_ids
    except Exception as e:
        print(f"Error fetching user IDs: {e}")
        sys.exit(1)
        
# If you want to use a fixed user ID for testing
DEFAULT_USER_ID = 1

# First, ensure all products exist in the database
def ensure_products_exist(items_dict):
    try:
        cursor.execute('SELECT "productName", "productID" FROM products WHERE "UserId" = %s', (DEFAULT_USER_ID,))
        existing_products = {row[0]: row[1] for row in cursor.fetchall()}
        # print(existing_products)
        # Insert missing products
        new_products = []
        product_map = {}

        for item_name in items_dict.keys():
            if item_name in existing_products:
                product_map[item_name] = existing_products[item_name]
            else:
                new_products.append((item_name, DEFAULT_USER_ID))
        
        if new_products:
            execute_values(cursor, "INSERT INTO products (\"productName\", \"UserId\") VALUES %s RETURNING \"productID\", \"productName\"", new_products)
            conn.commit()
            
            # Update product_map with newly inserted products
            for new_product in cursor.fetchall():
                product_map[new_product[1]] = new_product[0]

        return product_map
    except Exception as e:
        conn.rollback()
        print(f"Error ensuring products exist: {e}")
        sys.exit(1)

# Define items and their unit prices
items = {
    "Basmati rice": {"unit": "kg", "price": 100, "unit_options": [0.5, 1, 2, 5, 10, 20]},
    "Red lentils": {"unit": "kg", "price": 105, "unit_options": [0.25, 0.5, 1, 2, 5]},
    "Mustard oil": {"unit": "L", "price": 185, "unit_options": [0.2, 0.5, 1, 2, 5, 10]},
    "Salt": {"unit": "kg", "price": 28, "unit_options": [0.25, 0.5, 1, 2, 5]},
    "Atta": {"unit": "kg", "price": 55, "unit_options": [0.5, 1, 2, 5, 10, 25]},
    "Maida": {"unit": "kg", "price": 50, "unit_options": [0.5, 1, 2, 5, 10, 25]},
    "Sugar": {"unit": "kg", "price": 42, "unit_options": [0.25, 0.5, 1, 2, 5, 10]},
    "Turmeric powder": {"unit": "kg", "price": 200, "unit_options": [0.050, 0.100, 0.200, 0.500, 1.000]},
    "Tea leaves": {"unit": "kg", "price": 350, "unit_options": [0.050, 0.100, 0.250, 0.500, 1.000]},
    "Groundnut oil": {"unit": "L", "price": 200, "unit_options": [0.2, 0.5, 1, 2, 5, 10]},
    "Jaggery": {"unit": "kg", "price": 75, "unit_options": [0.100, 0.250, 0.500, 1.000, 2.000]},
    "Red chilli powder": {"unit": "kg", "price": 280, "unit_options": [0.050, 0.100, 0.200, 0.500, 1.000]},
    "Cumin seeds": {"unit": "kg", "price": 250, "unit_options": [0.050, 0.100, 0.250, 0.500, 1.000]},
    "Black pepper": {"unit": "kg", "price": 600, "unit_options": [0.025, 0.050, 0.100, 0.200, 0.500]},
    "Coriander powder": {"unit": "kg", "price": 200, "unit_options": [0.050, 0.100, 0.200, 0.500, 1.000]},
    "Cardamom": {"unit": "kg", "price": 3000, "unit_options": [0.010, 0.025, 0.050, 0.100, 0.200]},
    "Cloves": {"unit": "kg", "price": 800, "unit_options": [0.010, 0.025, 0.050, 0.100, 0.200]},
    "Green gram": {"unit": "kg", "price": 130, "unit_options": [0.25, 0.5, 1, 2, 5]},
    "Chickpeas": {"unit": "kg", "price": 85, "unit_options": [0.25, 0.5, 1, 2, 5]},
    "Bay leaves": {"unit": "kg", "price": 150, "unit_options": [0.025, 0.050, 0.100, 0.200, 0.500]},
    "Dry red chilli": {"unit": "kg", "price": 300, "unit_options": [0.050, 0.100, 0.200, 0.500, 1.000]},
    "Moong dal": {"unit": "kg", "price": 125, "unit_options": [0.25, 0.5, 1, 2, 5]},
    "Masoor dal": {"unit": "kg", "price": 105, "unit_options": [0.25, 0.5, 1, 2, 5]},
    "Refined oil": {"unit": "L", "price": 170, "unit_options": [0.2, 0.5, 1, 2, 5, 10]},
    "Sunflower oil": {"unit": "L", "price": 180, "unit_options": [0.2, 0.5, 1, 2, 5, 10]},
    "Besan": {"unit": "kg", "price": 80, "unit_options": [0.5, 1, 2, 5, 10]},
    "Toor dal": {"unit": "kg", "price": 145, "unit_options": [0.25, 0.5, 1, 2, 5]},
    "Urad dal": {"unit": "kg", "price": 130, "unit_options": [0.25, 0.5, 1, 2, 5]},
    "Poha": {"unit": "kg", "price": 85, "unit_options": [0.25, 0.5, 1, 2, 5]},
    "Sooji": {"unit": "kg", "price": 60, "unit_options": [0.25, 0.5, 1, 2, 5]},
    "Ghee": {"unit": "kg", "price": 700, "unit_options": [0.1, 0.25, 0.5, 1, 2]},
    "Coconut oil": {"unit": "L", "price": 250, "unit_options": [0.2, 0.5, 1, 2]},
    "Tamarind": {"unit": "kg", "price": 150, "unit_options": [0.050, 0.100, 0.250, 0.500, 1.000]},
    "Fennel seeds": {"unit": "kg", "price": 220, "unit_options": [0.050, 0.100, 0.200, 0.500]},
    "Fenugreek seeds": {"unit": "kg", "price": 100, "unit_options": [0.050, 0.100, 0.200, 0.500]},
    "Asafoetida": {"unit": "kg", "price": 1000, "unit_options": [0.025, 0.050, 0.100, 0.200]},
    "Cashew nuts": {"unit": "kg", "price": 750, "unit_options": [0.050, 0.100, 0.250, 0.500, 1.000]},
    "Almonds": {"unit": "kg", "price": 800, "unit_options": [0.050, 0.100, 0.250, 0.500, 1.000]},
    "Raisins": {"unit": "kg", "price": 300, "unit_options": [0.050, 0.100, 0.250, 0.500, 1.000]},
    "Peanuts": {"unit": "kg", "price": 120, "unit_options": [0.25, 0.5, 1, 2, 5]},
    "Chana dal": {"unit": "kg", "price": 85, "unit_options": [0.25, 0.5, 1, 2, 5]},
    "Rajma": {"unit": "kg", "price": 160, "unit_options": [0.25, 0.5, 1, 2, 5]},
    "Sago": {"unit": "kg", "price": 90, "unit_options": [0.25, 0.5, 1, 2]},
    "Vermicelli": {"unit": "kg", "price": 70, "unit_options": [0.25, 0.5, 1, 2]},
    "Baking soda": {"unit": "kg", "price": 80, "unit_options": [0.050, 0.100, 0.200, 0.500]},
    "Baking powder": {"unit": "kg", "price": 150, "unit_options": [0.050, 0.100, 0.200, 0.500]},
    "Custard powder": {"unit": "kg", "price": 250, "unit_options": [0.050, 0.100, 0.200, 0.500]},
    "Jelly crystals": {"unit": "kg", "price": 200, "unit_options": [0.050, 0.100, 0.200, 0.500]},
    "Honey": {"unit": "kg", "price": 450, "unit_options": [0.100, 0.250, 0.500, 1.000]},
    "Jam": {"unit": "kg", "price": 200, "unit_options": [0.100, 0.250, 0.500, 1.000]},
    "Pickle": {"unit": "kg", "price": 180, "unit_options": [0.100, 0.250, 0.500, 1.000]},
    "Papad": {"unit": "kg", "price": 180, "unit_options": [0.050, 0.100, 0.200, 0.500]}
}

# Generate a date within the last 2 months
def generate_date(order_id, total_orders):
    end_date = datetime.datetime.now()
    start_date = end_date - datetime.timedelta(days=730)  # 2 years period
    days_between = (end_date - start_date).days
    date_position = (int(order_id) - 1) / total_orders
    days_to_add = int(days_between * date_position)

    return start_date + datetime.timedelta(days=days_to_add)

# Generate transactions with 2-7 items per order
def generate_transactions(num_transactions=300):
    # Use a fixed user ID or get from database
    # user_ids = get_user_ids()
    user_id = DEFAULT_USER_ID  # For simplicity, using a fixed user ID
    product_map = ensure_products_exist(items)
    
    transactions = []
    # current_id = 1
    order_count = 0

    estimated_orders = num_transactions // 4.5
    
    while len(transactions) < num_transactions:
        # Generate a new order with 2-7 items
        order_id = order_count + 1  # Simple sequential order IDs
        order_date = generate_date(order_id, estimated_orders)
        order_items_count = random.randint(2, 7)  # 2-7 items per order
        
        # Create a timestamp for this order
        timestamp = order_date.replace(hour=random.randint(9, 18), minute=random.randint(0, 59), second=random.randint(0, 59))
        timestamp_str = timestamp.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3] + "+05:30"
        
        # Select random items for this order (without duplicates)
        order_items = random.sample(list(items.keys()), order_items_count)
        
        for item_name in order_items:
            item_data = items[item_name]
            quantity_value = random.choice(item_data["unit_options"])
            
            # Calculate price based on quantity and unit price
            selling_price = quantity_value * item_data["price"]
            
            transaction = {
                # "id": current_id,
                "UserId": user_id,
                "date": order_date,
                "productID": product_map[item_name],
                "item": item_name,
                "sellingPrice": selling_price,
                "orderID": order_id,
                "quantity": quantity_value,
                "createdAt": timestamp_str,
                "updatedAt": timestamp_str
            }
            
            transactions.append(transaction)
            # current_id += 1
            
            # Break if we've reached the target number of transactions
            if len(transactions) >= num_transactions:
                break
        
        order_count += 1
    
    return transactions[:num_transactions]  # Ensure exactly num_transactions are returned

# Insert transactions into the database
def insert_transactions(transactions):
    try:
        # Prepare data for bulk insert
        values = [(
            t["UserId"], 
            t["date"], 
            t["productID"],
            t["item"], 
            t["sellingPrice"], 
            t["quantity"],
            t["orderID"], 
            t["createdAt"], 
            t["updatedAt"] 
        ) for t in transactions]
        
        # Bulk insert using execute_values
        execute_values(
            cursor,
            """
            INSERT INTO transactions 
            ("UserId", date, "productID", item, "sellingPrice", quantity, "orderID", "createdAt", "updatedAt") 
            VALUES %s
            """,
            values
        )
        
        conn.commit()
        print(f"Successfully inserted {len(transactions)} transactions!")
    except Exception as e:
        conn.rollback()
        print(f"Error inserting transactions: {e}")
        sys.exit(1)

# Main execution
if __name__ == "__main__":
    try:
        num_transactions = 300  # Default number of transactions to generate
        
        # Allow command-line argument to specify number of transactions
        if len(sys.argv) > 1:
            try:
                num_transactions = int(sys.argv[1])
            except ValueError:
                print("Invalid number of transactions. Using default value of 300.")
        
        print(f"Generating {num_transactions} random transactions...")
        transactions = generate_transactions(num_transactions)
        print(f"Generated {len(transactions)} transactions. Inserting into database...")
        insert_transactions(transactions)
        print("Data geenration completed successfully!")
    except Exception as e:
        print(f"Error during data generation: {e}")
    finally:
        # Close database connection
        cursor.close()
        conn.close()
        print("Database connection closed.")