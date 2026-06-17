import { Guest } from "../../models/guest.model";
import { Booking } from "../../models/booking.model";
import { Property } from "../../models/property.model";
import { RoomType } from "../../models/roomType.model";
import { logger } from "../../lib/logger";

export interface SearchResult<T> {
  items: T[];
  total: number;
  score?: number;
}

export interface UnifiedSearchResult {
  guests: SearchResult<any>;
  bookings: SearchResult<any>;
  properties: SearchResult<any>;
  roomTypes: SearchResult<any>;
  totalResults: number;
}

export interface SearchOptions {
  limit?: number;
  skip?: number;
  propertyId?: string;
}

class SearchService {
  async searchGuests(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult<any>> {
    const { limit = 20, skip = 0 } = options;

    if (!query || query.trim().length < 2) {
      return { items: [], total: 0 };
    }

    try {
      const searchQuery: any = {
        isDeleted: { $ne: true },
        $text: { $search: query },
      };

      const [items, total] = await Promise.all([
        Guest.find(searchQuery, { score: { $meta: "textScore" } })
          .sort({ score: { $meta: "textScore" } })
          .skip(skip)
          .limit(limit)
          .select("firstName lastName email phone tags stayCount totalSpend")
          .lean(),
        Guest.countDocuments(searchQuery),
      ]);

      return { items, total };
    } catch (error) {
      logger.warn({ error, query }, "Text search failed for guests, falling back to regex");
      return this.searchGuestsRegex(query, options);
    }
  }

  private async searchGuestsRegex(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult<any>> {
    const { limit = 20, skip = 0 } = options;
    const regex = new RegExp(query, "i");

    const searchQuery = {
      isDeleted: { $ne: true },
      $or: [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { phone: regex },
      ],
    };

    const [items, total] = await Promise.all([
      Guest.find(searchQuery)
        .skip(skip)
        .limit(limit)
        .select("firstName lastName email phone tags stayCount totalSpend")
        .lean(),
      Guest.countDocuments(searchQuery),
    ]);

    return { items, total };
  }

  async searchBookings(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult<any>> {
    const { limit = 20, skip = 0, propertyId } = options;

    if (!query || query.trim().length < 2) {
      return { items: [], total: 0 };
    }

    try {
      const searchQuery: any = {
        isDeleted: { $ne: true },
        $text: { $search: query },
      };

      if (propertyId) {
        searchQuery.propertyId = propertyId;
      }

      const [items, total] = await Promise.all([
        Booking.find(searchQuery, { score: { $meta: "textScore" } })
          .sort({ score: { $meta: "textScore" } })
          .skip(skip)
          .limit(limit)
          .select("confirmationNumber status dates pricing guestId propertyId")
          .populate("guestId", "firstName lastName email")
          .populate("propertyId", "name slug")
          .lean(),
        Booking.countDocuments(searchQuery),
      ]);

      return { items, total };
    } catch (error) {
      logger.warn({ error, query }, "Text search failed for bookings, falling back to regex");
      return this.searchBookingsRegex(query, options);
    }
  }

  private async searchBookingsRegex(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult<any>> {
    const { limit = 20, skip = 0, propertyId } = options;
    const regex = new RegExp(query, "i");

    const searchQuery: any = {
      isDeleted: { $ne: true },
      $or: [
        { confirmationNumber: regex },
        { specialRequests: regex },
        { internalNotes: regex },
      ],
    };

    if (propertyId) {
      searchQuery.propertyId = propertyId;
    }

    const [items, total] = await Promise.all([
      Booking.find(searchQuery)
        .skip(skip)
        .limit(limit)
        .select("confirmationNumber status dates pricing guestId propertyId")
        .populate("guestId", "firstName lastName email")
        .populate("propertyId", "name slug")
        .lean(),
      Booking.countDocuments(searchQuery),
    ]);

    return { items, total };
  }

  async searchProperties(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult<any>> {
    const { limit = 20, skip = 0 } = options;

    if (!query || query.trim().length < 2) {
      return { items: [], total: 0 };
    }

    try {
      const searchQuery: any = {
        isDeleted: { $ne: true },
        isActive: true,
        $text: { $search: query },
      };

      const [items, total] = await Promise.all([
        Property.find(searchQuery, { score: { $meta: "textScore" } })
          .sort({ score: { $meta: "textScore" } })
          .skip(skip)
          .limit(limit)
          .select("name slug description address starRating amenities images")
          .lean(),
        Property.countDocuments(searchQuery),
      ]);

      return { items, total };
    } catch (error) {
      logger.warn({ error, query }, "Text search failed for properties, falling back to regex");
      return this.searchPropertiesRegex(query, options);
    }
  }

  private async searchPropertiesRegex(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult<any>> {
    const { limit = 20, skip = 0 } = options;
    const regex = new RegExp(query, "i");

    const searchQuery = {
      isDeleted: { $ne: true },
      isActive: true,
      $or: [
        { name: regex },
        { slug: regex },
        { description: regex },
        { "address.city": regex },
        { "address.country": regex },
      ],
    };

    const [items, total] = await Promise.all([
      Property.find(searchQuery)
        .skip(skip)
        .limit(limit)
        .select("name slug description address starRating amenities images")
        .lean(),
      Property.countDocuments(searchQuery),
    ]);

    return { items, total };
  }

  async searchRoomTypes(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult<any>> {
    const { limit = 20, skip = 0, propertyId } = options;

    if (!query || query.trim().length < 2) {
      return { items: [], total: 0 };
    }

    const regex = new RegExp(query, "i");

    const searchQuery: any = {
      isDeleted: { $ne: true },
      isActive: true,
      $or: [
        { name: regex },
        { code: regex },
        { description: regex },
        { amenities: regex },
      ],
    };

    if (propertyId) {
      searchQuery.propertyId = propertyId;
    }

    const [items, total] = await Promise.all([
      RoomType.find(searchQuery)
        .skip(skip)
        .limit(limit)
        .select("name code description amenities maxOccupancy basePrice propertyId images")
        .populate("propertyId", "name slug")
        .lean(),
      RoomType.countDocuments(searchQuery),
    ]);

    return { items, total };
  }

  async unifiedSearch(
    query: string,
    options: SearchOptions & { types?: string[] } = {}
  ): Promise<UnifiedSearchResult> {
    const { types = ["guests", "bookings", "properties", "roomTypes"], limit = 10 } = options;
    const searchOptions = { ...options, limit };

    const results: UnifiedSearchResult = {
      guests: { items: [], total: 0 },
      bookings: { items: [], total: 0 },
      properties: { items: [], total: 0 },
      roomTypes: { items: [], total: 0 },
      totalResults: 0,
    };

    const searchPromises: Promise<void>[] = [];

    if (types.includes("guests")) {
      searchPromises.push(
        this.searchGuests(query, searchOptions).then((r) => {
          results.guests = r;
        })
      );
    }

    if (types.includes("bookings")) {
      searchPromises.push(
        this.searchBookings(query, searchOptions).then((r) => {
          results.bookings = r;
        })
      );
    }

    if (types.includes("properties")) {
      searchPromises.push(
        this.searchProperties(query, searchOptions).then((r) => {
          results.properties = r;
        })
      );
    }

    if (types.includes("roomTypes")) {
      searchPromises.push(
        this.searchRoomTypes(query, searchOptions).then((r) => {
          results.roomTypes = r;
        })
      );
    }

    await Promise.all(searchPromises);

    results.totalResults =
      results.guests.total +
      results.bookings.total +
      results.properties.total +
      results.roomTypes.total;

    return results;
  }

  async quickSearch(query: string, limit: number = 5): Promise<{
    guests: any[];
    bookings: any[];
    properties: any[];
  }> {
    const [guests, bookings, properties] = await Promise.all([
      this.searchGuests(query, { limit }),
      this.searchBookings(query, { limit }),
      this.searchProperties(query, { limit }),
    ]);

    return {
      guests: guests.items,
      bookings: bookings.items,
      properties: properties.items,
    };
  }
}

export const searchService = new SearchService();
