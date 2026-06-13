import mongoose, { Document, Schema } from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export interface IUser extends Document {
  name: string
  email: string
  photo: string
  role: 'user' | 'guide' | 'lead-guide' | 'admin'
  password: string
  passwordConfirm: string
  passwordChangedAt: Date
  passwordResetToken: string | undefined
  passwordResetExpires: Date | undefined
  active: boolean
  correctPassword(candidatePassword: string, userPassword: string): Promise<boolean>
  changedPasswordAfter(JWTTimestamp: number): boolean
  createPasswordResetToken(): string
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name!'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function (this: IUser, el: string) {
          return el === this.password
        },
        message: 'Passwords are not the same!',
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

userSchema.pre('save', async function (this: IUser, next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  this.passwordConfirm = undefined as unknown as string
  next()
})

userSchema.pre('save', function (this: IUser, next) {
  if (!this.isModified('password') || this.isNew) return next()
  this.passwordChangedAt = new Date(Date.now() - 1000)
  next()
})

userSchema.pre(/^find/, function (this: mongoose.Query<IUser[], IUser>, next) {
  this.find({ active: { $ne: false } })
  next()
})

userSchema.virtual('bookedTours', {
  ref: 'Booking',
  foreignField: 'user',
  localField: '_id',
})

userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPasswordAfter = function (this: IUser, JWTTimestamp: number): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000)
    return JWTTimestamp < changedTimestamp
  }
  return false
}

userSchema.methods.createPasswordResetToken = function (this: IUser): string {
  const resetToken = crypto.randomBytes(32).toString('hex')
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000)
  return resetToken
}

export const User = mongoose.model<IUser>('User', userSchema)
