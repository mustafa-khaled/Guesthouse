import { Router } from 'express'
import {
  getCheckoutSession,
  createBookingCheckout,
  createBooking,
  getAllBooking,
  getBooking,
  updateBooking,
  deleteBooking,
} from '../controllers/bookingController.js'
import { protect, restrictTo } from '../controllers/authController.js'

const router = Router()

router.use(protect)

router.get('/checkout-session/:tourId', getCheckoutSession)

router.use(restrictTo('admin', 'lead-guide'))

router.route('/').get(getAllBooking).post(createBooking)
router.route('/:id').get(getBooking).patch(updateBooking).delete(deleteBooking)

export default router
