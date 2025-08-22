import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vehicles table
export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  model: varchar("model").notNull(),
  year: integer("year").notNull(),
  plate: varchar("plate").notNull(),
  batteryLevel: integer("battery_level").notNull().default(0),
  totalKm: integer("total_km").notNull().default(0),
  status: varchar("status").notNull().default("active"), // active, charging, maintenance
  lastTripAt: timestamp("last_trip_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Travel data table
export const travelData = pgTable("travel_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  startLocation: varchar("start_location").notNull(),
  endLocation: varchar("end_location").notNull(),
  route: varchar("route"),
  distance: decimal("distance", { precision: 8, scale: 2 }).notNull(), // in km
  duration: integer("duration").notNull(), // in minutes
  avgSpeed: decimal("avg_speed", { precision: 5, scale: 2 }).notNull(), // in km/h
  energyConsumption: decimal("energy_consumption", { precision: 6, scale: 2 }).notNull(), // in kWh
  consumptionPer100km: decimal("consumption_per_100km", { precision: 5, scale: 2 }).notNull(), // in kWh/100km
  tripDate: timestamp("trip_date").notNull(),
  status: varchar("status").notNull().default("completed"), // completed, in_progress, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

export const insertTravelDataSchema = createInsertSchema(travelData).omit({
  id: true,
  createdAt: true,
});
export type InsertTravelData = z.infer<typeof insertTravelDataSchema>;
export type TravelData = typeof travelData.$inferSelect;

// Vehicle with travel stats
export type VehicleWithStats = Vehicle & {
  recentTripsCount: number;
  totalTrips: number;
  avgConsumption: number;
};

// Travel analytics types
export type TravelAnalytics = {
  totalDistance: number;
  totalDuration: number;
  avgSpeed: number;
  avgConsumption: number;
  totalTrips: number;
  efficiencyScore: number;
};
