import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { Cart, CartStatuses } from '../models';

@Injectable()
export class CartService {
  private userCarts: Record<string, Cart> = {};

  private nowISO(): string {
    return new Date().toISOString();
  }

  findByUserId(userId: string): Cart {
    return this.userCarts[userId];
  }

  createByUserId(userId: string) {
    const now = this.nowISO();

    // Create a complete Cart object
    const userCart: Cart = {
      id: v4(),
      user_id: userId,
      created_at: now,
      updated_at: now,
      status: CartStatuses.OPEN,
      items: [],
    };

    this.userCarts[userId] = userCart;

    return userCart;
  }

  findOrCreateByUserId(userId: string): Cart {
    let userCart = this.findByUserId(userId);

    if (!userCart) {
      userCart = this.createByUserId(userId);
    }

    return userCart;
  }

  updateByUserId(userId: string, { items }: Cart): Cart {
    const { id, updated_at, ...rest } = this.findOrCreateByUserId(userId);

    const updatedCart = {
      id,
      updated_at: this.nowISO(),
      ...rest,
      items: [...items],
    };

    this.userCarts[userId] = { ...updatedCart };

    return { ...updatedCart };
  }

  removeByUserId(userId: string): void {
    this.userCarts[userId] = null;
  }
}
