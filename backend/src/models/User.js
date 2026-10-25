import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['ROLE_CANDIDATE', 'ROLE_COMPANY', 'ROLE_ADMIN'],
      default: 'ROLE_CANDIDATE'
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    companyName: {
      type: String,
      default: null
    },
    companyEmail: {
      type: String,
      default: null
    },
    emailVerified: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret.password;
        return ret;
      }
    }
  }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
