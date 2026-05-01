import { Schema, model } from "../imports.js";
import { hashPassword } from "../Utils/Password.Util.js";
import { SoftDeletePlugin } from "../Utils/SoftDelete.Plugin.js";

const UserSchema = new Schema(
{
  firstName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },

  lastName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },

  avatar: {
    type: String,
    default: null
  },

  bio: {
    type: String,
    maxlength: 500,
    default: null
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },

  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  },

  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student'
  },

  isActive: {
    type: Boolean,
    default: true
  },

  isBanned: {
    type: Boolean,
    default: false
  },

  lastLoginAt: {
    type: Date,
    default: null
  },

  emailVerified: {
    type: Boolean,
    default: false
  },

  resetPasswordToken: {
    type: String,
    default: null
  },

  resetPasswordExpiry: {
    type: Date,
    default: null
  }

},
{
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.password;
      return ret;
    }
  }
});

UserSchema.pre('save', async function()
{
    if (!this.isModified("password")) return;
    
    this.password = await hashPassword(this.password);
});

UserSchema.plugin(SoftDeletePlugin);

export const UserModel = model('User', UserSchema);
