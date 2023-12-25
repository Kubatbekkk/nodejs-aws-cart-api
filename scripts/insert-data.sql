create extension if not exists "uuid-ossp";

--users
INSERT INTO users (name, email, password) VALUES
('John Doe', 'johndoe@test.com', 'test1234'),
('Jane Smith', 'janesmith@test.com', 'test5678')

--carts
INSERT INTO carts (user_id, status)
SELECT
 users.id,
 CASE WHEN random() < 0.5 THEN 'OPEN'::cart_status ELSE 'ORDERED'::cart_status END
FROM users;

-- cart_items
INSERT INTO cart_items (cart_id, product_id, count)
SELECT
 carts.id AS cart_id,
 uuid_generate_v4() AS product_id,
 floor(random() * 5 + 1) AS count
FROM carts
JOIN users ON carts.user_id = users.id;

-- orders
INSERT INTO orders (user_id, cart_id, payment, delivery, comments, status, total)
SELECT
 users.id AS user_id,
 carts.id AS cart_id,
 '{"method": "credit_card", "amount": 9}'::jsonb AS payment,
 '{"address": "1 Main Av", "city": "Osh", "zipcode": "72000"}'::jsonb AS delivery,
 'This is a comment' AS comments,
 CASE WHEN random() < 0.4 THEN 'PAYED'::order_status ELSE 'OPEN'::order_status END AS status,
 floor(random() * 500 + 100) AS total
FROM carts
JOIN users ON carts.user_id = users.id
WHERE NOT EXISTS (
 SELECT 1 FROM orders o WHERE o.cart_id = carts.id
);
-- used when inserted wrong information
--DELETE FROM orders;