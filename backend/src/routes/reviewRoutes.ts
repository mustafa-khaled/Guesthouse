import { Router } from 'express'
import {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReview,
} from '../controllers/reviewController.js'
import { protect, restrictTo } from '../controllers/authController.js'
import { validate } from '../middleware/validate.js'
import { reviewSchema } from '@guesthouse/shared'

const router = Router({ mergeParams: true })

router.use(protect)

router
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), setTourUserIds, validate(reviewSchema), createReview)

router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('user', 'admin'), validate(reviewSchema.partial()), updateReview)
  .delete(restrictTo('user', 'admin'), deleteReview)

export default router
