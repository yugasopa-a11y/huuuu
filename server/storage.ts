import { type Order, type InsertOrder } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
}

export class MemStorage implements IStorage {
  private orders: Map<string, Order>;

  constructor() {
    this.orders = new Map();
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const now = new Date();
    const order: Order = {
      id,
      customerName: insertOrder.customerName,
      customerPhone: insertOrder.customerPhone,
      deliveryMethod: insertOrder.deliveryMethod,
      streetAddress: insertOrder.streetAddress || null,
      city: insertOrder.city || null,
      state: insertOrder.state || null,
      zipCode: insertOrder.zipCode || null,
      modelFileName: insertOrder.modelFileName || null,
      modelWeight: insertOrder.modelWeight || null,
      printTime: insertOrder.printTime || null,
      baseCost: insertOrder.baseCost || null,
      supportRemoval: insertOrder.supportRemoval || false,
      supportCost: insertOrder.supportCost || "0.00",
      totalCost: insertOrder.totalCost || null,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    const existingOrder = this.orders.get(id);
    if (!existingOrder) {
      return undefined;
    }

    const updatedOrder: Order = {
      ...existingOrder,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }
}

export const storage = new MemStorage();
