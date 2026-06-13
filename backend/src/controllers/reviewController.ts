import { Request, Response, NextFunction } from 'express'
import { deleteOne, updateOne, createOne, getOne, getAll } from './handlerFactory.js'
import { Review, IReview } from '../models/reviewModel.js'

export const setTourUserIds = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.body.tour) req.body.tour = req.params.tourId
  if (!req.body.user) req.body.user = (req as Request & { user: { id: string } }).user.id
  next()
}

export const getAllReviews = getAll(Review)
export const createReview = createOne(Review)
export const deleteReview = deleteOne(Review)
export const updateReview = updateOne(Review)
export const getReview = getOne(Review)
