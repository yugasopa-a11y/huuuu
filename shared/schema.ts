import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  deliveryMethod: text("delivery_method").notNull(), // 'delivery' or 'meetup'
  streetAddress: text("street_address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  modelFileName: text("model_file_name"),
  modelWeight: decimal("model_weight", { precision: 10, scale: 2 }),
  printTime: text("print_time"),
  baseCost: decimal("base_cost", { precision: 10, scale: 2 }),
  supportRemoval: boolean("support_removal").default(false),
  supportCost: decimal("support_cost", { precision: 10, scale: 2 }).default("0.00"),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  status: text("status").default("pending"), // 'pending', 'confirmed', 'in_progress', 'completed'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders, {
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().min(10, "Valid phone number is required"),
  deliveryMethod: z.enum(["delivery", "meetup"]),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  modelFileName: z.string().optional(),
  modelWeight: z.string().optional(),
  printTime: z.string().optional(),
  baseCost: z.string().optional(),
  supportRemoval: z.boolean().default(false),
  supportCost: z.string().default("0.00"),
  totalCost: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
