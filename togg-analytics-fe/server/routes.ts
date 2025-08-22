import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertVehicleSchema, insertTravelDataSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  // await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Vehicle routes
  app.get('/api/vehicles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const vehicles = await storage.getUserVehicles(userId);
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  app.get('/api/vehicles/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const vehicle = await storage.getVehicle(id);
      
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      // Check if user owns this vehicle
      const userId = req.user.claims.sub;
      if (vehicle.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(vehicle);
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      res.status(500).json({ message: "Failed to fetch vehicle" });
    }
  });

  app.post('/api/vehicles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const vehicleData = insertVehicleSchema.parse({
        ...req.body,
        userId,
      });
      
      const vehicle = await storage.createVehicle(vehicleData);
      res.status(201).json(vehicle);
    } catch (error) {
      console.error("Error creating vehicle:", error);
      res.status(400).json({ message: "Invalid vehicle data" });
    }
  });

  // Travel data routes
  app.get('/api/vehicles/:vehicleId/travel-data', isAuthenticated, async (req: any, res) => {
    try {
      const { vehicleId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      
      // Verify user owns this vehicle
      const vehicle = await storage.getVehicle(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      const userId = req.user.claims.sub;
      if (vehicle.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const travelData = await storage.getVehicleTravelData(vehicleId, limit);
      res.json(travelData);
    } catch (error) {
      console.error("Error fetching travel data:", error);
      res.status(500).json({ message: "Failed to fetch travel data" });
    }
  });

  app.get('/api/vehicles/:vehicleId/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const { vehicleId } = req.params;
      const days = parseInt(req.query.days as string) || 30;
      
      // Verify user owns this vehicle
      const vehicle = await storage.getVehicle(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      const userId = req.user.claims.sub;
      if (vehicle.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const analytics = await storage.getTravelAnalytics(vehicleId, days);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.post('/api/vehicles/:vehicleId/travel-data', isAuthenticated, async (req: any, res) => {
    try {
      const { vehicleId } = req.params;
      
      // Verify user owns this vehicle
      const vehicle = await storage.getVehicle(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      const userId = req.user.claims.sub;
      if (vehicle.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const travelData = insertTravelDataSchema.parse({
        ...req.body,
        vehicleId,
      });
      
      const result = await storage.createTravelData(travelData);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating travel data:", error);
      res.status(400).json({ message: "Invalid travel data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
