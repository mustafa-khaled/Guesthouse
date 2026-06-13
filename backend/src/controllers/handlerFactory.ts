import { Request, Response, NextFunction } from 'express'
import { Model, Document, PopulateOptions } from 'mongoose'
import { APIFeatures } from '../utils/apiFeatures.js'
import { AppError } from '../utils/appError.js'
import { catchAsync } from '../utils/catchAsync.js'

export const deleteOne = <T extends Document>(Model: Model<T>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const document = await Model.findByIdAndDelete(id)

    if (!document) {
      return next(new AppError('No document found with that ID', 404))
    }

    res.status(204).json({ status: 'Success', data: null })
  })

export const updateOne = <T extends Document>(Model: Model<T>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const doc = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!doc) {
      return next(new AppError('No document found with that ID', 404))
    }

    res.status(200).json({ status: 'Success', data: { data: doc } })
  })

export const createOne = <T extends Document>(Model: Model<T>) =>
  catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const doc = await Model.create(req.body)
    res.status(201).json({ status: 'success', data: { data: doc } })
  })

export const getOne = <T extends Document>(
  Model: Model<T>,
  populateOptions?: PopulateOptions | (string | PopulateOptions)[],
) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    let query = Model.findById(id)
    if (populateOptions) query = query.populate(populateOptions as PopulateOptions)

    const doc = await query

    if (!doc) {
      return next(new AppError('No document found with that ID', 404))
    }

    res.status(200).json({ status: 'success', data: { data: doc } })
  })

export const getAll = <T extends Document>(Model: Model<T>) =>
  catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    let filter: Record<string, unknown> = {}
    if (req.params.tourId) filter = { tour: req.params.tourId }

    const features = new APIFeatures(Model.find(filter), req.query as Record<string, unknown>)
      .filter()
      .sort()
      .limitFields()
      .paginate()

    const docs = await features.query

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: { data: docs },
    })
  })
