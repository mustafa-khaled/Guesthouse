import { Router } from 'express'
import {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
} from '../controllers/userController.js'
import {
  signup,
  login,
  logout,
  protect,
  restrictTo,
  forgetPassword,
  resetPassword,
  updatePassword,
} from '../controllers/authController.js'
import { validate } from '../middleware/validate.js'
import { signupSchema, loginSchema, updatePasswordSchema, updateMeSchema } from '@guesthouse/shared'

const router = Router()

router.post('/signup', validate(signupSchema), signup)
router.post('/login', validate(loginSchema), login)
router.get('/logout', logout)
router.post('/forgotPassword', forgetPassword)
router.patch('/resetPassword/:token', resetPassword)

// All routes below require authentication
router.use(protect)

router.patch('/updateMyPassword', validate(updatePasswordSchema), updatePassword)
router.get('/me', getMe, getUser)
router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, validate(updateMeSchema), updateMe)
router.delete('/deleteMe', deleteMe)

// Admin-only routes
router.use(restrictTo('admin'))

router.route('/').get(getAllUsers).post(createUser)
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)

export default router
