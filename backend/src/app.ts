import express from 'express'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import mongoSanitize from 'express-mongo-sanitize'
import xss from 'xss-clean'
import path from 'path'
import cors from 'cors'
import hpp from 'hpp'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'url'
import { Request, Response, NextFunction } from 'express'

import { AppError } from './utils/appError.js'
import { globalErrorHandler } from './controllers/errorController.js'
import tourRouter from './routes/tourRoutes.js'
import userRouter from './routes/userRoutes.js'
import reviewRouter from './routes/reviewRoutes.js'
import bookingRouter from './routes/bookingRoutes.js'
import { setupOpenAPI } from './openapi/setup.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '..', 'views'))

app.use(express.static(path.join(__dirname, '..', 'public')))

app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:3000',
    credentials: true,
  }),
)

app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://js.stripe.com', 'https://cdnjs.cloudflare.com'],
      frameSrc: ["'self'", 'https://js.stripe.com'],
      connectSrc: ["'self'", 'https://api.stripe.com', 'ws://localhost:*'],
      imgSrc: ["'self'", 'data:', 'https:', 'http:', `${process.env.FRONTEND_URL || 'http://localhost:3000'}`],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ['https://fonts.gstatic.com'],
    },
  }),
)

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
})
app.use('/api', limiter)

app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

app.use(mongoSanitize())
app.use(xss())
app.use(hpp({
  whitelist: [
    'duration', 'ratingsQuantity', 'ratingsAverage',
    'maxGroupSize', 'difficulty', 'price',
  ],
}))

// OpenAPI docs
setupOpenAPI(app)

// Routes
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/bookings', bookingRouter)

app.all('*', (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

app.use(globalErrorHandler)

export default app
