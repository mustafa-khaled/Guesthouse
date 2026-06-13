import { Request, Response, NextFunction } from 'express'
import Stripe from 'stripe'
import { Tour } from '../models/tourModel.js'
import { Booking } from '../models/bookingModel.js'
import { AppError } from '../utils/appError.js'
import { catchAsync } from '../utils/catchAsync.js'
import { createOne, updateOne, deleteOne, getAll, getOne } from './handlerFactory.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

export const getCheckoutSession = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { tourId } = req.params
  const tour = await Tour.findById(tourId)

  if (!tour) return next(new AppError('No tour found with that ID', 404))

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${tourId}&user=${(req as Request & { user: { id: string } }).user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: (req as Request & { user: { email: string } }).user.email,
    client_reference_id: tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.guesthouse.dev/img/tours/${tour.imageCover}`],
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  })

  res.status(200).json({ status: 'success', session })
})

export const createBookingCheckout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { tour, user, price } = req.query

  if (!tour || !user || !price) return next()

  await Booking.create({ tour, user, price })

  res.redirect((req.originalUrl.split('?')[0]))
})

export const createBooking = createOne(Booking)
export const getAllBooking = getAll(Booking)
export const getBooking = getOne(Booking)
export const updateBooking = updateOne(Booking)
export const deleteBooking = deleteOne(Booking)
