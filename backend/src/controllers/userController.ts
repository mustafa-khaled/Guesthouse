import { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import sharp from 'sharp'
import { User, IUser } from '../models/userModel.js'
import { AppError } from '../utils/appError.js'
import { catchAsync } from '../utils/catchAsync.js'
import { deleteOne, updateOne, getOne, getAll } from './handlerFactory.js'

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

export const uploadUserPhoto = upload.single('photo')

export const resizeUserPhoto = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  if (!req.file) return next()

  req.file.filename = `user-${(req as Request & { user: IUser }).user.id}-${Date.now()}.jpeg`

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`)

  next()
})

const filterObj = (obj: Record<string, unknown>, ...allowedFields: string[]): Record<string, unknown> => {
  const newObject: Record<string, unknown> = {}
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObject[el] = obj[el]
    }
  })
  return newObject
}

export const getMe = (req: Request, _res: Response, next: NextFunction): void => {
  req.params.id = (req as Request & { user: IUser }).user.id
  next()
}

export const updateMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password update.', 400))
  }

  const filteredBody = filterObj(req.body, 'name', 'email')
  if (req.file) filteredBody.photo = (req.file as Express.Multer.File & { filename: string }).filename

  const updatedUser = await User.findByIdAndUpdate(
    (req as Request & { user: IUser }).user.id,
    filteredBody,
    { new: true, runValidators: true },
  )

  res.status(200).json({ status: 'success', data: { user: updatedUser } })
})

export const deleteMe = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  await User.findByIdAndUpdate(
    (req as Request & { user: IUser }).user.id,
    { active: false },
  )
  res.status(204).json({ status: 'success', data: null })
})

export const createUser = (_req: Request, res: Response): void => {
  res.status(500).json({
    status: 'error',
    message: 'Please use signup instead!!',
  })
}

export const getAllUsers = getAll(User)
export const getUser = getOne(User)
export const updateUser = updateOne(User)
export const deleteUser = deleteOne(User)
