import { Router } from "express";
import { searchController } from "./search.controller";
import { requireAuth } from "../../middleware";

const router = Router();

router.get(
  "/",
  requireAuth,
  searchController.unifiedSearch.bind(searchController)
);

router.get(
  "/quick",
  requireAuth,
  searchController.quickSearch.bind(searchController)
);

router.get(
  "/guests",
  requireAuth,
  searchController.searchGuests.bind(searchController)
);

router.get(
  "/bookings",
  requireAuth,
  searchController.searchBookings.bind(searchController)
);

router.get(
  "/properties",
  searchController.searchProperties.bind(searchController)
);

router.get(
  "/room-types",
  searchController.searchRoomTypes.bind(searchController)
);

export default router;
