-- scripts for carts table
create extension if not exists "uuid-ossp";

create table products (
	id uuid default uuid_generate_v4() primary key,
	title text not null,
	decription text not null,
	price integer not null check (price >= 0)
)

create table users (
	id uuid default uuid_generate_v4() primary key,
	name text not null,
	email text,
	password text not null
)

create type cart_status as enum ('OPEN', 'ORDERED');

create table carts (
id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id uuid NOT NULL references users(id) on delete CASCADE,
created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT current_timestamp,
updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT current_timestamp,
status cart_status
);

 create table cart_items
 (
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  count INT,
  PRIMARY KEY (cart_id, product_id)
);

create type order_status as enum ('OPEN', 'PAYED', 'CONFIRMED', 'SENT', 'COMPLETED', 'CANCELLED');

create table orders (
	id uuid default uuid_generate_v4() primary key,
	user_id uuid not null references users("id") on delete no action,
	cart_id uuid not null references carts("id") on delete no action,
	payment json,
	delivery json,
	comments text,
	status order_status default 'OPEN',
	total integer not null
)

CREATE OR REPLACE FUNCTION item_update_cart_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE carts
  SET updated_at = NOW()
  WHERE id = NEW.cart_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER item_update_cart_timestamp_trigger
AFTER INSERT OR UPDATE OR DELETE ON cart_items
FOR EACH ROW
EXECUTE FUNCTION item_update_cart_timestamp();

CREATE OR REPLACE FUNCTION update_cart_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER status_update_cart_timestamp_trigger
BEFORE UPDATE ON carts
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION update_cart_timestamp();

-- drop table cart_items;
-- altering coulmns
--alter table carts
--alter column created_at set default current_timestamp,
--alter column updated_at set default current_timestamp;