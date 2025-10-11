const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const getOverview = catchAsync(async (req, res, next) => {
  // 1): Get tour data from collection
  const tours = await Tour.find();

  // 2): Build template

  // 3): Render that template using tour data from 1
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

const getTour = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  // 1): Get data for the requested tour
  const tour = await Tour.findOne({ slug: slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  // 2): Build template

  // 3): Render that template using tour data from 1
  res.status(200).render('tour', {
    title: `${tour.name} tour`,
    tour,
  });
});

const getLoginForm = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
});

const getAccount = catchAsync(async (req, res, next) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
});

const updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedUser) {
    return next(new AppError('There is no user with that ID.', 404));
  }

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});

const getMyTours = catchAsync(async (req, res, next) => {
  const userWithTours = await User.findById(req.user.id).populate({
    path: 'bookedTours',
    populate: {
      path: 'tour',
      select:
        'name duration maxGroupSize difficulty ratingsAverage price imageCover startDates slug description summary',
    },
  });

  const tours = userWithTours.bookedTours.map((booking) => booking.tour);

  console.log(tours);

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

module.exports = {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  updateUserData,
  getMyTours,
};
