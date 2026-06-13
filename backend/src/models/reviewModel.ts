import mongoose, { Document, Schema, Model } from 'mongoose'

export interface IReview extends Document {
  review: string
  rating: number
  createdAt: Date
  tour: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
}

interface IReviewModel extends Model<IReview> {
  calcAverageRatings(tourId: mongoose.Types.ObjectId): Promise<void>
}

const reviewSchema = new Schema<IReview>(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

reviewSchema.pre(/^find/, function (this: mongoose.Query<IReview[], IReview>, next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  })
  next()
})

reviewSchema.statics.calcAverageRatings = async function (
  tourId: mongoose.Types.ObjectId,
): Promise<void> {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ])

  const Tour = mongoose.model('Tour')
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    })
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    })
  }
}

reviewSchema.post('save', function (this: IReview) {
  const ReviewModel = this.constructor as IReviewModel
  ReviewModel.calcAverageRatings(this.tour)
})

interface ReviewQueryHelpers {
  r?: IReview
}

reviewSchema.pre<ReviewQueryHelpers & mongoose.Query<IReview, IReview>>(/^findOneAnd/, async function (next) {
  ;(this as unknown as ReviewQueryHelpers).r = (await this.findOne()) ?? undefined
  next()
})

reviewSchema.post<ReviewQueryHelpers & mongoose.Query<IReview, IReview>>(/^findOneAnd/, async function () {
  const review = (this as unknown as ReviewQueryHelpers).r
  if (review) {
    const ReviewModel = review.constructor as IReviewModel
    await ReviewModel.calcAverageRatings(review.tour)
  }
})

export const Review = mongoose.model<IReview, IReviewModel>('Review', reviewSchema)
