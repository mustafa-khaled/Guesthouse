import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { promisify } from 'util'
import { User, IUser } from '../models/userModel.js'
import { AppError } from '../utils/appError.js'
import { catchAsync } from '../utils/catchAsync.js'
import { Email } from '../utils/email.js'

interface JwtPayload {
  id: string
  iat: number
}

const signToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  } as jwt.SignOptions)
}

const createSendToken = (user: IUser, statusCode: number, res: Response): void => {
  const token = signToken(String(user._id))
  const cookieOptions: {
    expires: Date
    httpOnly: boolean
    secure?: boolean
  } = {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  }

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true

  res.cookie('jwt', token, cookieOptions)

  user.password = undefined as unknown as string

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  })
}

export const signup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, passwordConfirm } = req.body

  const newUser = await User.create({ name, email, password, passwordConfirm })

  const url = `${req.protocol}://${req.get('host')}/me`
  await new Email(newUser, url).sendWelcome()

  createSendToken(newUser, 201, res)
})

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400))
  }

  const user = await User.findOne({ email }).select('+password')

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401))
  }

  createSendToken(user, 200, res)
})

export const logout = (_req: Request, res: Response): void => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  })

  res.status(200).json({ status: 'success' })
}

export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt
  }

  if (!token) {
    return next(new AppError('You are not logged in!', 401))
  }

  const decoded = await promisify<string, string>(jwt.verify)(
    token,
    process.env.JWT_SECRET as string,
  ) as unknown as JwtPayload

  const currentUser = await User.findById(decoded.id)
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token does no longer exist', 401),
    )
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed his password', 401))
  }

  ;(req as Request & { user: IUser }).user = currentUser
  res.locals.user = currentUser
  next()
})

export const isLoggedIn = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (req.cookies?.jwt) {
    try {
      const decoded = await promisify<string, string>(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET as string,
      ) as unknown as JwtPayload

      const currentUser = await User.findById(decoded.id)
      if (!currentUser) {
        return next()
      }

      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next()
      }

      res.locals.user = currentUser
      return next()
    } catch {
      return next()
    }
  }
  next()
}

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as Request & { user: IUser }).user
    if (!user || !roles.includes(user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      )
    }
    next()
  }
}

export const forgetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body
  const user = await User.findOne({ email })

  if (!user) {
    return next(new AppError('There is no user with this email address.', 404))
  }

  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })

  try {
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
    await new Email(user, resetURL).sendPasswordReset()
  } catch (err) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })
    return next(
      new AppError('There was an error sending the email, try again later!!', 500),
    )
  }

  res.status(200).json({ status: 'success', message: 'Token sent to email' })
})

export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  })

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400))
  }

  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()

  createSendToken(user, 200, res)
})

export const updatePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findById((req as Request & { user: IUser }).user.id).select('+password')

  if (!user) {
    return next(new AppError('User not found', 404))
  }

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong!', 401))
  }

  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  await user.save()

  createSendToken(user, 200, res)
})
