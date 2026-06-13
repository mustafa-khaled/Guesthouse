import mongoose, { Document, Schema } from 'mongoose'

export interface IBooking extends Document {
  tour: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  price: number
  createdAt: Date
  paid: boolean
}

const bookingSchema = new Schema<IBooking>({
  tour: {
    type: Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour!'],
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User!'],
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price.'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paid: {
    type: Boolean,
    default: true,
  },
})

bookingSchema.pre(/^find/, function (this: mongoose.Query<IBooking[], IBooking>, next) {
  this.populate('user').populate({
    path: 'tour',
  })
  next()
})

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema)
