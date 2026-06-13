import { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import sharp from 'sharp'
import { Tour, ITour } from '../models/tourModel.js'
import { AppError } from '../utils/appError.js'
import { catchAsync } from '../utils/catchAsync.js'
import { deleteOne, updateOne, createOne, getOne, getAll } from './handlerFactory.js'

const multerStorage = multer.memoryStorage()

const multerFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): void => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400))
  }
}

const upload = multer({ storage: multerStorage, fileFilter: multerFilter })

export const uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
])

export const resizeTourImages = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] }

  if (!files?.imageCover && !files?.images) return next()

  if (files.imageCover) {
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
    await sharp(files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${req.body.imageCover}`)
  }

  if (files.images) {
    req.body.images = []
    await Promise.all(
      files.images.map(async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`
        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/tours/${filename}`)
        req.body.images.push(filename)
      }),
    )
  }

  next()
})

export const aliasTopTours = (req: Request, _res: Response, next: NextFunction): void => {
  req.query.limit = '5'
  req.query.sort = '-ratingsAverage,price'
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
  next()
}

export const getAllTours = getAll(Tour)
export const getTour = getOne(Tour, { path: 'reviews' })
export const createTour = createOne(Tour)
export const updateTour = updateOne(Tour)
export const deleteTour = deleteOne(Tour)

export const getTourStats = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numRatings: { $sum: '$ratingsQuantity' },
        numTours: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { avgPrice: 1 } },
  ])

  res.status(200).json({ stats: 'success', data: { stats } })
})

export const getMonthlyPlan = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const year = Number(req.params.year)

  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    { $addFields: { month: '$_id' } },
    { $project: { _id: 0 } },
    { $sort: { numTourStarts: -1 } },
    { $limit: 12 },
  ])

  res.status(200).json({ stats: 'success', data: { plan } })
})

export const getToursWithin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { distance, latlng, unit } = req.params
  const [lat, lng] = latlng.split(',')

  if (!lat || !lng) {
    return next(
      new AppError('Please provide latitude and longitude in the format lat,lng.', 400),
    )
  }

  const radius = unit === 'mi' ? Number(distance) / 3963.2 : Number(distance) / 6378.1

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[Number(lng), Number(lat)], radius] } },
  })

  res.status(200).json({ status: 'success', results: tours.length, data: { data: tours } })
})

export const getDistances = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { latlng, unit } = req.params
  const [lat, lng] = latlng.split(',')

  if (!lat || !lng) {
    return next(
      new AppError('Please provide latitude and longitude in the format lat,lng.', 400),
    )
  }

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [Number(lng), Number(lat)],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    { $project: { distance: 1, name: 1 } },
  ])

  res.status(200).json({ status: 'success', data: { data: distances } })
})
