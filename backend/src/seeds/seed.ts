import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { env } from "../config/env";
import { logger } from "../lib/logger";
import { hashPassword } from "../lib/hash";

import { User } from "../models/user.model";
import { Property } from "../models/property.model";
import { RoomType } from "../models/roomType.model";
import { Room } from "../models/room.model";
import { RatePlan } from "../models/ratePlan.model";
import { Guest } from "../models/guest.model";
import { AddOn } from "../models/addOn.model";

import { usersSeed } from "./data/users.seed";
import { propertiesSeed } from "./data/properties.seed";
import { roomTypesSeed } from "./data/roomTypes.seed";

interface SeedOptions {
  clean?: boolean;
  users?: boolean;
  properties?: boolean;
  roomTypes?: boolean;
  rooms?: boolean;
  ratePlans?: boolean;
  guests?: boolean;
  addOns?: boolean;
  all?: boolean;
}

async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info("Connected to MongoDB for seeding");
  } catch (error) {
    logger.error({ err: error }, "Failed to connect to MongoDB");
    process.exit(1);
  }
}

async function cleanDatabase(): Promise<void> {
  logger.info("Cleaning database...");
  await mongoose.connection.dropDatabase();
  logger.info("Database cleaned (dropped and recreated)");
}

async function seedUsers(): Promise<Map<string, string>> {
  logger.info("Seeding users...");
  const userIdMap = new Map<string, string>();

  for (const userData of usersSeed) {
    const hashedPassword = await hashPassword(userData.password);
    const user = await User.create({
      ...userData,
      password: hashedPassword,
    });
    userIdMap.set(userData.email, user.id);
    logger.info(`Created user: ${userData.email} (${userData.role})`);
  }

  logger.info(`Seeded ${usersSeed.length} users`);
  return userIdMap;
}

async function seedProperties(ownerId?: string): Promise<Map<string, string>> {
  logger.info("Seeding properties...");
  const propertyIdMap = new Map<string, string>();

  for (const propertyData of propertiesSeed) {
    const property = await Property.create({
      ...propertyData,
      ownerId: ownerId ? new mongoose.Types.ObjectId(ownerId) : undefined,
    });
    propertyIdMap.set(propertyData.slug, property.id);
    logger.info(`Created property: ${propertyData.name}`);
  }

  logger.info(`Seeded ${propertiesSeed.length} properties`);
  return propertyIdMap;
}

async function seedRoomTypes(propertyIdMap: Map<string, string>): Promise<Map<string, string>> {
  logger.info("Seeding room types...");
  const roomTypeIdMap = new Map<string, string>();
  let count = 0;

  for (const [propertySlug, roomTypes] of Object.entries(roomTypesSeed)) {
    const propertyId = propertyIdMap.get(propertySlug);
    if (!propertyId) {
      logger.warn(`Property not found for slug: ${propertySlug}`);
      continue;
    }

    for (const roomTypeData of roomTypes) {
      const roomType = await RoomType.create({
        ...roomTypeData,
        propertyId: new mongoose.Types.ObjectId(propertyId),
      });
      roomTypeIdMap.set(`${propertySlug}:${roomTypeData.code}`, roomType.id);
      count++;
      logger.info(`Created room type: ${roomTypeData.name} for ${propertySlug}`);
    }
  }

  logger.info(`Seeded ${count} room types`);
  return roomTypeIdMap;
}

async function seedRooms(
  propertyIdMap: Map<string, string>,
  roomTypeIdMap: Map<string, string>
): Promise<void> {
  logger.info("Seeding rooms...");

  let count = 0;

  const roomConfigs: Record<string, { code: string; count: number; floor: number }[]> = {
    "seaside-resort-spa": [
      { code: "OVS", count: 5, floor: 3 },
      { code: "DLX", count: 10, floor: 2 },
      { code: "FAM", count: 3, floor: 4 },
    ],
    "mountain-lodge-inn": [
      { code: "MTV", count: 8, floor: 2 },
      { code: "LGS", count: 4, floor: 3 },
      { code: "STD", count: 12, floor: 1 },
    ],
    "urban-boutique-hotel": [
      { code: "CVK", count: 15, floor: 5 },
      { code: "EXE", count: 5, floor: 8 },
      { code: "TWN", count: 10, floor: 4 },
    ],
  };

  const rooms: any[] = [];
  for (const [propertySlug, configs] of Object.entries(roomConfigs)) {
    const propertyId = propertyIdMap.get(propertySlug);
    if (!propertyId) continue;

    for (const config of configs) {
      const roomTypeId = roomTypeIdMap.get(`${propertySlug}:${config.code}`);
      if (!roomTypeId) continue;

      for (let i = 1; i <= config.count; i++) {
        const roomNumber = `${config.floor}${String(i).padStart(2, "0")}`;
        rooms.push({
          propertyId: new mongoose.Types.ObjectId(propertyId),
          roomTypeId: new mongoose.Types.ObjectId(roomTypeId),
          roomNumber,
          floor: config.floor,
          status: "clean",
          isOccupied: false,
          isActive: true,
        });
      }
    }
  }

  await Room.insertMany(rooms);
  count = rooms.length;
  logger.info(`Seeded ${count} rooms`);
}

async function seedRatePlans(
  propertyIdMap: Map<string, string>,
  roomTypeIdMap: Map<string, string>
): Promise<void> {
  logger.info("Seeding rate plans...");
  let count = 0;

  const ratePlanTemplates = [
    {
      name: "Standard Rate",
      code: "STD",
      priceMultiplier: 1.0,
      cancellationPolicy: { type: "flexible", deadlineHours: 48, penaltyPercentage: 0 },
      mealPlan: "room_only",
    },
    {
      name: "Breakfast Included",
      code: "BNB",
      priceMultiplier: 1.15,
      cancellationPolicy: { type: "moderate", deadlineHours: 72, penaltyPercentage: 50 },
      mealPlan: "breakfast",
    },
    {
      name: "Non-Refundable",
      code: "NRF",
      priceMultiplier: 0.85,
      cancellationPolicy: { type: "non-refundable", deadlineHours: 0, penaltyPercentage: 100 },
      mealPlan: "room_only",
    },
  ];

  for (const [propertySlug, roomTypes] of Object.entries(roomTypesSeed)) {
    const propertyId = propertyIdMap.get(propertySlug);
    if (!propertyId) continue;

    for (const roomType of roomTypes) {
      const roomTypeId = roomTypeIdMap.get(`${propertySlug}:${roomType.code}`);
      if (!roomTypeId) continue;

      for (const template of ratePlanTemplates) {
        const basePrice = Math.round(roomType.basePrice * template.priceMultiplier);
        
        await RatePlan.create({
          propertyId: new mongoose.Types.ObjectId(propertyId),
          roomTypeId: new mongoose.Types.ObjectId(roomTypeId),
          name: template.name,
          code: `${roomType.code}-${template.code}`,
          description: `${template.name} for ${roomType.name}`,
          basePrice,
          cancellationPolicy: template.cancellationPolicy,
          mealPlan: template.mealPlan,
          isActive: true,
        });
        count++;
      }
    }
  }

  logger.info(`Seeded ${count} rate plans`);
}

async function seedGuests(): Promise<void> {
  logger.info("Seeding guests...");

  const guests = [
    {
      email: "john.doe@email.com",
      firstName: "John",
      lastName: "Doe",
      phone: "+1-555-0101",
      address: { city: "New York", country: "USA" },
      preferences: { roomPreferences: ["High Floor", "Non-Smoking"] },
    },
    {
      email: "jane.smith@email.com",
      firstName: "Jane",
      lastName: "Smith",
      phone: "+1-555-0102",
      address: { city: "Los Angeles", country: "USA" },
      preferences: { roomPreferences: ["Ocean View", "Quiet Room"] },
    },
    {
      email: "bob.wilson@email.com",
      firstName: "Bob",
      lastName: "Wilson",
      phone: "+1-555-0103",
      address: { city: "Chicago", country: "USA" },
      preferences: { dietaryRestrictions: ["Vegetarian"] },
    },
    {
      email: "alice.johnson@email.com",
      firstName: "Alice",
      lastName: "Johnson",
      phone: "+44-20-5550104",
      address: { city: "London", country: "UK" },
    },
    {
      email: "carlos.garcia@email.com",
      firstName: "Carlos",
      lastName: "Garcia",
      phone: "+34-91-5550105",
      address: { city: "Madrid", country: "Spain" },
    },
  ];

  for (const guestData of guests) {
    await Guest.create(guestData);
  }

  logger.info(`Seeded ${guests.length} guests`);
}

async function seedAddOns(propertyIdMap: Map<string, string>): Promise<void> {
  logger.info("Seeding add-ons...");
  let count = 0;

  const addOns = [
    { name: "Airport Transfer", code: "TRANSFER", category: "transport", pricing: { type: "per-stay" as const, amount: 75 } },
    { name: "Late Checkout", code: "LATE-CO", category: "amenity", pricing: { type: "per-stay" as const, amount: 50 } },
    { name: "Early Check-in", code: "EARLY-CI", category: "amenity", pricing: { type: "per-stay" as const, amount: 50 } },
    { name: "Spa Package", code: "SPA", category: "spa", pricing: { type: "per-person" as const, amount: 150 } },
    { name: "Romantic Dinner", code: "DINNER", category: "dining", pricing: { type: "per-person" as const, amount: 120 } },
    { name: "Extra Bed", code: "XBED", category: "amenity", pricing: { type: "per-night" as const, amount: 40 } },
    { name: "Parking", code: "PARK", category: "transport", pricing: { type: "per-night" as const, amount: 25 } },
    { name: "Pet Fee", code: "PET", category: "other", pricing: { type: "per-night" as const, amount: 30 } },
  ];

  for (const propertyId of propertyIdMap.values()) {
    for (const addOn of addOns) {
      await AddOn.create({
        ...addOn,
        propertyId: new mongoose.Types.ObjectId(propertyId),
        isActive: true,
      });
      count++;
    }
  }

  logger.info(`Seeded ${count} add-ons`);
}

async function seed(options: SeedOptions = {}): Promise<void> {
  const startTime = Date.now();
  
  try {
    await connectDB();

    if (options.clean) {
      await cleanDatabase();
    }

    const seedAll = options.all || (!options.users && !options.properties && !options.roomTypes && !options.rooms && !options.ratePlans && !options.guests && !options.addOns);

    let userIdMap = new Map<string, string>();
    let propertyIdMap = new Map<string, string>();
    let roomTypeIdMap = new Map<string, string>();

    if (seedAll || options.users) {
      userIdMap = await seedUsers();
    }

    if (seedAll || options.properties) {
      const managerId = userIdMap.get("manager@guesthouse.com");
      propertyIdMap = await seedProperties(managerId);
    } else {
      const properties = await Property.find({});
      for (const p of properties) {
        propertyIdMap.set(p.slug, p.id);
      }
    }

    if (seedAll || options.roomTypes) {
      roomTypeIdMap = await seedRoomTypes(propertyIdMap);
    } else {
      const roomTypes = await RoomType.find({}).populate("propertyId");
      for (const rt of roomTypes) {
        const property = rt.propertyId as any;
        if (property?.slug) {
          roomTypeIdMap.set(`${property.slug}:${rt.code}`, rt.id);
        }
      }
    }

    if (seedAll || options.rooms) {
      await seedRooms(propertyIdMap, roomTypeIdMap);
    }

    if (seedAll || options.ratePlans) {
      await seedRatePlans(propertyIdMap, roomTypeIdMap);
    }

    if (seedAll || options.guests) {
      await seedGuests();
    }

    if (seedAll || options.addOns) {
      await seedAddOns(propertyIdMap);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.info(`Seeding completed in ${duration}s`);

  } catch (error) {
    logger.error({ err: error }, "Seeding failed");
    throw error;
  } finally {
    await mongoose.disconnect();
    logger.info("Disconnected from MongoDB");
  }
}

function parseArgs(): SeedOptions {
  const args = process.argv.slice(2);
  const options: SeedOptions = {};

  for (const arg of args) {
    switch (arg) {
      case "--clean":
      case "-c":
        options.clean = true;
        break;
      case "--users":
      case "-u":
        options.users = true;
        break;
      case "--properties":
      case "-p":
        options.properties = true;
        break;
      case "--room-types":
      case "-rt":
        options.roomTypes = true;
        break;
      case "--rooms":
      case "-r":
        options.rooms = true;
        break;
      case "--rate-plans":
      case "-rp":
        options.ratePlans = true;
        break;
      case "--guests":
      case "-g":
        options.guests = true;
        break;
      case "--add-ons":
      case "-a":
        options.addOns = true;
        break;
      case "--all":
        options.all = true;
        break;
      case "--help":
      case "-h":
        console.log(`
Guesthouse Database Seeder

Usage: pnpm seed [options]

Options:
  --clean, -c       Clean database before seeding
  --users, -u       Seed users only
  --properties, -p  Seed properties only
  --room-types, -rt Seed room types only
  --rooms, -r       Seed rooms only
  --rate-plans, -rp Seed rate plans only
  --guests, -g      Seed guests only
  --add-ons, -a     Seed add-ons only
  --all             Seed everything (default if no options specified)
  --help, -h        Show this help message

Examples:
  pnpm seed                    # Seed all data
  pnpm seed --clean            # Clean DB and seed all
  pnpm seed --clean --users    # Clean DB and seed users only
  pnpm seed -p -rt -r          # Seed properties, room types, and rooms
        `);
        process.exit(0);
    }
  }

  return options;
}

const options = parseArgs();
seed(options).catch(() => process.exit(1));
