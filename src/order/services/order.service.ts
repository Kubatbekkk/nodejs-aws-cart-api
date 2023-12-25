import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

import { Order, OrderStatus } from '../models';
import { Knex } from 'knex';
import dbClient from '../../db';

@Injectable()
export class OrderService {
  private orders: Record<string, Order> = {};

  async findById(orderId: string): Promise<Order> {
    return await dbClient('orders').where('id', orderId).first();
  }

  async createTransacted(trx: Knex.Transaction<any, any[]>, data: Order) {
    const order = {
      ...data,
      status: OrderStatus.OPEN,
    };

    return (
      await trx('orders').insert(order).returning('*')
    )[0] as any as Order;
  }

  update(orderId: string, data: Order) {
    const order = this.findById(orderId);

    if (!order) {
      throw new Error('Order does not exist.');
    }
    const updatedOrder = dbClient('orders')
      .where('id', orderId)
      .update({ ...order, ...data });

    return updatedOrder;
  }
}
