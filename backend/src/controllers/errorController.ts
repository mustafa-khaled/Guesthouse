import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/appError.js'

interface MongoError extends Error {
  path?: string
  value?: string
  errmsg?: string
  code?: number
  errors?: Record<string, { message: string }>
}

const handleCastErrorDB = (err: MongoError): AppError => {
  const message = `Invalid ${err.path}: ${err.value}.`
  return new AppError(message, 400)
}

const handleDuplicateFieldsDB = (err: MongoError): AppError => {
  const value = (err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0]) || ''
  const message = `Duplicate field value: ${value}. Please use another value.`
  return new AppError(message, 400)
}

const handleValidationErrorsDB = (err: MongoError): AppError => {
  const errors = Object.values(err.errors || {}).map((el) => el.message)
  const message = `Invalid input data. ${errors.join('. ')}`
  return new AppError(message, 400)
}

const handleJWTError = (): AppError =>
  new AppError('Invalid token, please login again!', 401)

const handleJWTExpiredError = (): AppError =>
  new AppError('Your token has expired, please login again!', 401)

const sendErrorDev = (err: AppError, req: Request, res: Response): void => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    })
  } else {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    })
  }
}

const sendErrorProd = (err: AppError, req: Request, res: Response): void => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      })
    } else {
      console.error('ERROR 💥', err)
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong!!.',
      })
    }
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message,
      })
    } else {
      console.error('ERROR 💥', err)
      res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later.',
      })
    }
  }
}

export const globalErrorHandler = (
  err: MongoError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let error = new AppError(err.message || 'Something went wrong', 500)
  error.statusCode = (err as AppError).statusCode || 500
  error.status = (err as AppError).status || 'error'

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, req, res)
  } else if (process.env.NODE_ENV === 'production') {
    let prodError = error

    if (err.name === 'CastError') prodError = handleCastErrorDB(err)
    if (err.code === 11000) prodError = handleDuplicateFieldsDB(err)
    if (err.name === 'ValidationError') prodError = handleValidationErrorsDB(err)
    if (err.name === 'JsonWebTokenError') prodError = handleJWTError()
    if (err.name === 'TokenExpiredError') prodError = handleJWTExpiredError()

    sendErrorProd(prodError, req, res)
  }
}
