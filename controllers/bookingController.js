const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');

const getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get currently booked tour
  const { tourId } = req.params;
  const tour = await Tour.findById(tourId);

  if (!tour) return next(new AppError('No tour found with that ID', 404));

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/`,
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

module.exports = { getCheckoutSession };
