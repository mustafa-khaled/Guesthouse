import { Review, IReview, ReviewStatus, IReviewRatings } from "../../models/review.model";
import { Booking } from "../../models/booking.model";
import { Property } from "../../models/property.model";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
  ConflictError,
} from "../../common/errors/http.errors";
import {
  getPaginationParams,
  createPaginatedResult,
  getSortParams,
  PaginatedResult,
} from "../../common/utils/pagination";
import { BookingStatus } from "../../common/enums/bookingStatus.enum";
import { Types } from "mongoose";

export interface CreateReviewData {
  bookingId: string;
  ratings: IReviewRatings;
  title?: string;
  text?: string;
  pros?: string[];
  cons?: string[];
}

export interface ListReviewsFilters {
  propertyId?: string;
  status?: ReviewStatus;
  minRating?: number;
}

class ReviewService {
  async create(data: CreateReviewData, userId: string): Promise<IReview> {
    if (!Types.ObjectId.isValid(data.bookingId)) {
      throw new BadRequestError("Invalid booking ID");
    }

    const booking = await Booking.findById(data.bookingId).populate("guestId");
    if (!booking) {
      throw new NotFoundError("Booking not found");
    }

    const guest = booking.guestId as any;
    if (!guest.userId || guest.userId.toString() !== userId) {
      throw new ForbiddenError("You can only review your own bookings");
    }

    if (booking.status !== BookingStatus.CHECKED_OUT) {
      throw new BadRequestError("You can only review after checking out");
    }

    const existingReview = await Review.findOne({ bookingId: booking._id });
    if (existingReview) {
      throw new ConflictError("A review already exists for this booking");
    }

    const review = new Review({
      propertyId: booking.propertyId,
      bookingId: booking._id,
      guestId: guest._id,
      ratings: data.ratings,
      title: data.title,
      text: data.text,
      pros: data.pros,
      cons: data.cons,
      status: ReviewStatus.PENDING,
      verifiedStay: true,
    });

    await review.save();

    return review;
  }

  async findById(id: string): Promise<IReview> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid review ID");
    }

    const review = await Review.findById(id)
      .populate("propertyId", "name")
      .populate("guestId", "firstName lastName")
      .populate("bookingId", "confirmationNumber dates");

    if (!review) {
      throw new NotFoundError("Review not found");
    }

    return review;
  }

  async update(id: string, data: Partial<CreateReviewData>, userId: string): Promise<IReview> {
    const review = await this.findById(id);

    const guest = review.guestId as any;
    if (!guest.userId || guest.userId.toString() !== userId) {
      throw new ForbiddenError("You can only edit your own reviews");
    }

    if (review.status === ReviewStatus.APPROVED) {
      throw new BadRequestError("Cannot edit an approved review");
    }

    if (data.ratings) {
      review.ratings = { ...review.ratings, ...data.ratings };
    }
    if (data.title !== undefined) review.title = data.title;
    if (data.text !== undefined) review.text = data.text;
    if (data.pros !== undefined) review.pros = data.pros;
    if (data.cons !== undefined) review.cons = data.cons;

    review.status = ReviewStatus.PENDING;

    await review.save();

    return review;
  }

  async delete(id: string, userId: string): Promise<void> {
    const review = await this.findById(id);

    const guest = review.guestId as any;
    if (!guest.userId || guest.userId.toString() !== userId) {
      throw new ForbiddenError("You can only delete your own reviews");
    }

    await (review as any).softDelete();
  }

  async moderate(
    id: string,
    action: "approve" | "reject",
    userId: string,
    reason?: string
  ): Promise<IReview> {
    const review = await this.findById(id);

    if (action === "approve") {
      review.status = ReviewStatus.APPROVED;

      await this.updatePropertyRating(review.propertyId.toString());
    } else {
      review.status = ReviewStatus.REJECTED;
    }

    await review.save();

    return review;
  }

  async respond(id: string, text: string, userId: string): Promise<IReview> {
    const review = await this.findById(id);

    if (review.status !== ReviewStatus.APPROVED) {
      throw new BadRequestError("Can only respond to approved reviews");
    }

    review.response = {
      text,
      respondedAt: new Date(),
      respondedBy: new Types.ObjectId(userId),
    };

    await review.save();

    return review;
  }

  async markHelpful(id: string): Promise<IReview> {
    const review = await this.findById(id);

    review.helpful += 1;
    await review.save();

    return review;
  }

  async list(
    filters: ListReviewsFilters,
    page: number = 1,
    limit: number = 20,
    sortBy: string = "createdAt",
    sortOrder: "asc" | "desc" = "desc"
  ): Promise<PaginatedResult<IReview>> {
    const query: any = {};

    if (filters.propertyId) {
      query.propertyId = new Types.ObjectId(filters.propertyId);
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.minRating) {
      query["ratings.overall"] = { $gte: filters.minRating };
    }

    const pagination = getPaginationParams(page, limit);
    const sort = getSortParams(sortBy, sortOrder);

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate("propertyId", "name")
        .populate("guestId", "firstName lastName")
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit),
      Review.countDocuments(query),
    ]);

    return createPaginatedResult(reviews, total, pagination);
  }

  async getPropertyReviews(
    propertyId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResult<IReview>> {
    return this.list(
      { propertyId, status: ReviewStatus.APPROVED },
      page,
      limit,
      "createdAt",
      "desc"
    );
  }

  async getPropertyRatingSummary(propertyId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
    categoryAverages: Record<string, number>;
  }> {
    if (!Types.ObjectId.isValid(propertyId)) {
      throw new BadRequestError("Invalid property ID");
    }

    const reviews = await Review.find({
      propertyId: new Types.ObjectId(propertyId),
      status: ReviewStatus.APPROVED,
    });

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        categoryAverages: {},
      };
    }

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const categoryTotals: Record<string, { sum: number; count: number }> = {};

    let totalOverall = 0;

    for (const review of reviews) {
      totalOverall += review.ratings.overall;
      ratingDistribution[Math.round(review.ratings.overall)]++;

      for (const [key, value] of Object.entries(review.ratings)) {
        if (key !== "overall" && value) {
          if (!categoryTotals[key]) {
            categoryTotals[key] = { sum: 0, count: 0 };
          }
          categoryTotals[key].sum += value;
          categoryTotals[key].count++;
        }
      }
    }

    const categoryAverages: Record<string, number> = {};
    for (const [key, { sum, count }] of Object.entries(categoryTotals)) {
      categoryAverages[key] = Math.round((sum / count) * 10) / 10;
    }

    return {
      averageRating: Math.round((totalOverall / reviews.length) * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution,
      categoryAverages,
    };
  }

  async getMyReviews(userId: string): Promise<IReview[]> {
    const booking = await Booking.find()
      .populate({
        path: "guestId",
        match: { userId: new Types.ObjectId(userId) },
      });

    const bookingIds = booking
      .filter((b) => b.guestId)
      .map((b) => b._id);

    return Review.find({ bookingId: { $in: bookingIds } })
      .populate("propertyId", "name")
      .sort({ createdAt: -1 });
  }

  private async updatePropertyRating(propertyId: string): Promise<void> {
    const summary = await this.getPropertyRatingSummary(propertyId);

    await Property.findByIdAndUpdate(propertyId, {
      "metadata.averageRating": summary.averageRating,
      "metadata.totalReviews": summary.totalReviews,
    });
  }
}

export const reviewService = new ReviewService();
