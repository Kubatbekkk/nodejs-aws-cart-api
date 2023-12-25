import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { Cart, CartStatuses } from '../models';
import dbClient from '../../db';
import { UpdateUserCartDTO } from '../dto/update-user-cart.dto';
import { Knex } from 'knex';

@Injectable()
export class CartService {
  private userCarts: Record<string, Cart> = {};

  private nowISO(): string {
    return new Date().toISOString();
  }

  async findByUserId(
    userId: string,
    status = CartStatuses.OPEN,
  ): Promise<Cart> {
    if (!userId) {
      return null;
    }
    console.log({ userId, status });
    try {
      const cart = await dbClient('carts')
        .where('user_id', userId)
        .where('status', status)
        .first();

      if (!cart) {
        return null;
      }
      console.log('cartID: ', cart.id);
      console.log('cart: ', cart);
      const cartItems = await dbClient('cart_items')
        .select(
          'cart_items.product_id',
          'cart_items.count',
          'products.id',
          'products.title',
          'products.description',
          'products.price',
        )
        .join('products', 'cart_items.product_id', 'products.id')
        .where('cart_items.cart_id', cart.id);

      // Make sure cartItems is fetched correctly
      console.log('cartItems:', cartItems);

      const productsData = cartItems.map((item) => ({
        product: {
          id: item.product_id,
          title: item.title,
          description: item.description,
          price: item.price,
        },
        count: item.count,
      }));

      // Ensure productsData contains expected results
      console.log('productsData:', productsData);

      cart.items = productsData;

      return cart;
    } catch (error) {
      console.error('Error fetching cart data:', error);
      return null;
    }
  }

  async createByUserId(userId: string): Promise<Cart> {
    const userCart = {
      user_id: userId,
    };

    return (await dbClient('carts')
      .insert(userCart)
      .returning('*')) as any as Cart;
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    let userCart = await this.findByUserId(userId);
    console.log('userCart: ', userCart);
    if (userCart) {
      return userCart;
    }

    const newCartUserId = userId;
    const newUserCart = (await this.createByUserId(newCartUserId))[0];

    newUserCart.items = [];
    console.log('newUserCart: ', newUserCart);
    return newUserCart;
  }

  async updateByUserId(
    userId: string,
    updateUserCartDTO: UpdateUserCartDTO,
  ): Promise<Cart> {
    const { id, items, ...rest } = await this.findOrCreateByUserId(userId);

    if (!id) {
      return null;
    }

    const { product, count } = updateUserCartDTO;

    if (count > 0) {
      await dbClient('cart_items')
        .insert({
          product_id: product.id,
          count,
          cart_id: id,
        })
        .onConflict(['cart_id', 'product_id'])
        .merge()
        .returning('*');

      const { updatedAt } = await dbClient('carts')
        .select('updated_at')
        .where('id', id)
        .first();

      const updatedCart = {
        id,
        ...rest,
        updatedAt,
        items: [
          updateUserCartDTO,
          ...items.filter((item) => item.product.id !== product.id),
        ],
      };

      return updatedCart;
    }

    await dbClient('cart_items')
      .where({ cart_id: id, product_id: product.id })
      .del();

    const { updatedAt } = await dbClient('carts')
      .select('updated_at')
      .where('id', id)
      .first();
    const updatedCart = {
      id,
      ...rest,
      updatedAt,
      items: [...items.filter((item) => item.product.id !== product.id)],
    };

    return updatedCart;
  }

  async removeByUserId(userId: string): Promise<void> {
    await dbClient.transaction(async (trx) => {
      await trx('carts').where('carts.user_id', userId).del();
    });
  }

  async createTransaction() {
    return await dbClient.transaction();
  }

  async changeCartStatusTransacted(
    trx: Knex.Transaction<any, any[]>,
    cartId: string,
    status = CartStatuses.ORDERED,
  ) {
    return await trx('carts')
      .where('carts.id', cartId)
      .update({ status })
      .returning('status');
  }
}
