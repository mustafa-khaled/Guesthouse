import dotenv from 'dotenv'
import path from 'path'
import mongoose from 'mongoose'

dotenv.config({ path: path.resolve(process.cwd(), 'config.env') })

process.on('uncaughtException', (err: Error) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...')
  console.log(err.name, err.message)
  process.exit(1)
})

const DB = (process.env.DATABASE_URL || '').replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD || '',
)

mongoose
  .connect(DB)
  .then(() => console.log('DB connection successful!'))
  .catch((err: Error) => {
    console.log('DB connection error:', err.message)
  })

const app = (await import('./app.js')).default

const port = process.env.PORT || 3000
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`)
})

process.on('unhandledRejection', (err: Error) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...')
  console.log(err.name, err.message)
  server.close(() => {
    process.exit(1)
  })
})

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully')
  server.close(() => {
    console.log('💥 Process terminated!')
  })
})
