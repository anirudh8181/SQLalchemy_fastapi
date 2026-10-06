

CREATE DATABASE APIDATA;

USE APIDATA;



-- Create the table
CREATE TABLE Products (
    id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL
);

-- Insert the data
INSERT INTO Products (id, name, description, price, quantity) VALUES
(1, 'Notebook', 'A lined notebook', 4.99, 20),
(2, 'Pen', 'Blue ink ballpoint pen', 1.50, 100),
(3, 'Backpack', 'Water-resistant school backpack', 29.99, 15),
(4, 'Water Bottle', 'Reusable stainless steel bottle', 12.75, 30),
(5, 'Desk Lamp', 'LED lamp with adjustable brightness', 22.00, 8),
(6, 'Headphones', 'Wireless over-ear headphones', 59.95, 12),
(7, 'Keyboard', 'Compact mechanical keyboard', 45.00, 10),
(8, 'Mouse', 'Wireless optical mouse', 18.25, 25),
(9, 'Coffee Mug', 'Ceramic mug with a handle', 8.50, 40),
(10, 'Sticky Notes', 'Pack of yellow sticky notes', 3.25, 50);


-- TEST QUERY 
update products
SET price = 4.8
WHERE id = 10;