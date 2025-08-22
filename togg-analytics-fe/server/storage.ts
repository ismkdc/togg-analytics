import {
  users,
  vehicles,
  travelData,
  type User,
  type UpsertUser,
  type Vehicle,
  type InsertVehicle,
  type TravelData,
  type InsertTravelData,
  type VehicleWithStats,
  type TravelAnalytics,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Vehicle operations
  getUserVehicles(userId: string): Promise<VehicleWithStats[]>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | undefined>;
  
  // Travel data operations
  getVehicleTravelData(vehicleId: string, limit?: number): Promise<TravelData[]>;
  createTravelData(data: InsertTravelData): Promise<TravelData>;
  getTravelAnalytics(vehicleId: string, days?: number): Promise<TravelAnalytics>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private vehicles: Map<string, Vehicle>;
  private travelDataStore: Map<string, TravelData>;

  constructor() {
    this.users = new Map();
    this.vehicles = new Map();
    this.travelDataStore = new Map();
    this.seedData();
  }

  private seedData() {
    // Create sample user
    const sampleUser: User = {
      id: "sample-user-1",
      email: "ahmet.yilmaz@trumore.com",
      firstName: "Ahmet",
      lastName: "Yılmaz",
      profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(sampleUser.id, sampleUser);

    // Create sample vehicles
    const sampleVehicles: Vehicle[] = [
      {
        id: "togg-t10x-001",
        userId: "sample-user-1",
        model: "Togg T10X",
        year: 2024,
        plate: "34 ABC 123",
        batteryLevel: 87,
        totalKm: 12450,
        status: "active",
        lastTripAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "togg-t10x-002",
        userId: "sample-user-1",
        model: "Togg T10X",
        year: 2024,
        plate: "06 XYZ 789",
        batteryLevel: 43,
        totalKm: 8720,
        status: "charging",
        lastTripAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "togg-t10x-003",
        userId: "sample-user-1",
        model: "Togg T10X",
        year: 2023,
        plate: "35 DEF 456",
        batteryLevel: 100,
        totalKm: 25890,
        status: "maintenance",
        lastTripAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    sampleVehicles.forEach(vehicle => {
      this.vehicles.set(vehicle.id, vehicle);
    });

    // Create sample travel data
    const sampleTravelData: TravelData[] = [
      {
        id: randomUUID(),
        vehicleId: "togg-t10x-001",
        startLocation: "İstanbul",
        endLocation: "Ankara",
        route: "D-020 Otoyolu",
        distance: "456.00",
        duration: 272, // 4h 32m
        avgSpeed: "89.20",
        energyConsumption: "19.80",
        consumptionPer100km: "43.40",
        tripDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: "completed",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        vehicleId: "togg-t10x-001",
        startLocation: "Büyükçekmece",
        endLocation: "Taksim",
        route: "E-5 + TEM Bağlantı",
        distance: "67.00",
        duration: 78, // 1h 18m
        avgSpeed: "51.60",
        energyConsumption: "12.10",
        consumptionPer100km: "18.10",
        tripDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: "completed",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        vehicleId: "togg-t10x-001",
        startLocation: "Kadıköy",
        endLocation: "Ataşehir",
        route: "D-100 Karayolu",
        distance: "28.00",
        duration: 42,
        avgSpeed: "40.00",
        energyConsumption: "4.80",
        consumptionPer100km: "17.10",
        tripDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: "completed",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        vehicleId: "togg-t10x-001",
        startLocation: "Kadıköy",
        endLocation: "Ataşehir",
        route: "D-100 Karayolu",
        distance: "28.00",
        duration: 42,
        avgSpeed: "40.00",
        energyConsumption: "4.80",
        consumptionPer100km: "17.10",
        tripDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: "completed",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        vehicleId: "togg-t10x-001",
        startLocation: "Kadıköy",
        endLocation: "Ataşehir",
        route: "D-100 Karayolu",
        distance: "28.00",
        duration: 42,
        avgSpeed: "40.00",
        energyConsumption: "4.80",
        consumptionPer100km: "17.10",
        tripDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: "completed",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        vehicleId: "togg-t10x-001",
        startLocation: "Kadıköy",
        endLocation: "Ataşehir",
        route: "D-100 Karayolu",
        distance: "28.00",
        duration: 42,
        avgSpeed: "40.00",
        energyConsumption: "4.80",
        consumptionPer100km: "17.10",
        tripDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: "completed",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        vehicleId: "togg-t10x-001",
        startLocation: "Kadıköy",
        endLocation: "Ataşehir",
        route: "D-100 Karayolu",
        distance: "28.00",
        duration: 42,
        avgSpeed: "40.00",
        energyConsumption: "4.80",
        consumptionPer100km: "17.10",
        tripDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: "completed",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        vehicleId: "togg-t10x-001",
        startLocation: "Kadıköy",
        endLocation: "Ataşehir",
        route: "D-100 Karayolu",
        distance: "28.00",
        duration: 42,
        avgSpeed: "40.00",
        energyConsumption: "4.80",
        consumptionPer100km: "17.10",
        tripDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: "completed",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        vehicleId: "togg-t10x-001",
        startLocation: "Kadıköy",
        endLocation: "Ataşehir",
        route: "D-100 Karayolu",
        distance: "28.00",
        duration: 42,
        avgSpeed: "40.00",
        energyConsumption: "4.80",
        consumptionPer100km: "17.10",
        tripDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: "completed",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        vehicleId: "togg-t10x-001",
        startLocation: "Kadıköy",
        endLocation: "Ataşehir",
        route: "D-100 Karayolu",
        distance: "28.00",
        duration: 42,
        avgSpeed: "40.00",
        energyConsumption: "4.80",
        consumptionPer100km: "17.10",
        tripDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: "completed",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        vehicleId: "togg-t10x-001",
        startLocation: "Kadıköy",
        endLocation: "Ataşehir",
        route: "D-100 Karayolu",
        distance: "28.00",
        duration: 42,
        avgSpeed: "40.00",
        energyConsumption: "4.80",
        consumptionPer100km: "17.10",
        tripDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: "completed",
        createdAt: new Date(),
      },
    ];

    sampleTravelData.forEach(data => {
      this.travelDataStore.set(data.id, data);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    const user: User = {
      ...userData,
      id: userData.id || randomUUID(),
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    } as User;
    
    this.users.set(user.id, user);
    return user;
  }

  async getUserVehicles(userId: string): Promise<VehicleWithStats[]> {
    const userVehicles = Array.from(this.vehicles.values()).filter(
      vehicle => vehicle.userId === userId
    );

    return userVehicles.map(vehicle => {
      const vehicleTrips = Array.from(this.travelDataStore.values()).filter(
        trip => trip.vehicleId === vehicle.id
      );
      
      const recentTrips = vehicleTrips.filter(
        trip => trip.tripDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );
      
      const avgConsumption = vehicleTrips.length > 0
        ? vehicleTrips.reduce((sum, trip) => sum + parseFloat(trip.consumptionPer100km), 0) / vehicleTrips.length
        : 0;

      return {
        ...vehicle,
        recentTripsCount: recentTrips.length,
        totalTrips: vehicleTrips.length,
        avgConsumption: Math.round(avgConsumption * 10) / 10,
      };
    });
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async createVehicle(vehicleData: InsertVehicle): Promise<Vehicle> {
    const id = randomUUID();
    const vehicle: Vehicle = {
      ...vehicleData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return undefined;

    const updatedVehicle = {
      ...vehicle,
      ...updates,
      updatedAt: new Date(),
    };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }

  async getVehicleTravelData(vehicleId: string, limit = 10): Promise<TravelData[]> {
    const vehicleTrips = Array.from(this.travelDataStore.values())
      .filter(trip => trip.vehicleId === vehicleId)
      .sort((a, b) => b.tripDate.getTime() - a.tripDate.getTime())
      .slice(0, limit);
    
    return vehicleTrips;
  }

  async createTravelData(data: InsertTravelData): Promise<TravelData> {
    const id = randomUUID();
    const travelData: TravelData = {
      ...data,
      id,
      createdAt: new Date(),
    };
    this.travelDataStore.set(id, travelData);
    return travelData;
  }

  async getTravelAnalytics(vehicleId: string, days = 30): Promise<TravelAnalytics> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const trips = Array.from(this.travelDataStore.values()).filter(
      trip => trip.vehicleId === vehicleId && trip.tripDate >= cutoffDate
    );

    if (trips.length === 0) {
      return {
        totalDistance: 0,
        totalDuration: 0,
        avgSpeed: 0,
        avgConsumption: 0,
        totalTrips: 0,
        efficiencyScore: 0,
      };
    }

    const totalDistance = trips.reduce((sum, trip) => sum + parseFloat(trip.distance), 0);
    const totalDuration = trips.reduce((sum, trip) => sum + trip.duration, 0);
    const avgSpeed = trips.reduce((sum, trip) => sum + parseFloat(trip.avgSpeed), 0) / trips.length;
    const avgConsumption = trips.reduce((sum, trip) => sum + parseFloat(trip.consumptionPer100km), 0) / trips.length;
    
    // Calculate efficiency score based on consumption (lower is better)
    const efficiencyScore = Math.max(0, Math.min(10, 10 - (avgConsumption - 15) / 2));

    return {
      totalDistance: Math.round(totalDistance * 10) / 10,
      totalDuration: Math.round(totalDuration / 60 * 10) / 10, // convert to hours
      avgSpeed: Math.round(avgSpeed * 10) / 10,
      avgConsumption: Math.round(avgConsumption * 10) / 10,
      totalTrips: trips.length,
      efficiencyScore: Math.round(efficiencyScore * 10) / 10,
    };
  }
}

export const storage = new MemStorage();
