const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');
const {
  createOne,
  updateOne,
  deleteOne,
  getAll,
  getOne,
} = require('./handlerFactory');

const getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get currently booked tour
  const { tourId } = req.params;
  const tour = await Tour.findById(tourId);

  if (!tour) return next(new AppError('No tour found with that ID', 404));

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${tourId}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });

  // 3) Send session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

const createBookingCheckout = catchAsync(async (req, res, next) => {
  // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
  const { tour, user, price } = req.query;

  if (!tour || !user || !price) return next();

  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

const createBooking = createOne(Booking);

const getAllBooking = getAll(Booking);

const getBooking = getOne(Booking);

const updateBooking = updateOne(Booking);

const deleteBooking = deleteOne(Booking);

module.exports = {
  getCheckoutSession,
  createBookingCheckout,
  createBooking,
  updateBooking,
  deleteBooking,
  getAllBooking,
  getBooking,
};
