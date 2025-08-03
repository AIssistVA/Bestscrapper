import mongoose from 'mongoose'

const leadSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true,
    trim: true,
  },
  ownerName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
    default: 'Kansas City',
  },
  state: {
    type: String,
    required: true,
    trim: true,
    default: 'MO',
  },
  zipCode: {
    type: String,
    required: true,
    trim: true,
  },
  industry: {
    type: String,
    required: true,
    trim: true,
  },
  employeeCount: {
    type: Number,
    required: true,
    min: 1,
  },
  revenue: {
    type: Number,
    required: true,
    min: 0,
  },
  website: {
    type: String,
    trim: true,
    default: '',
  },
  socialMedia: {
    linkedin: {
      type: String,
      trim: true,
      default: '',
    },
    facebook: {
      type: String,
      trim: true,
      default: '',
    },
    twitter: {
      type: String,
      trim: true,
      default: '',
    },
  },
  leadScore: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 5,
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  scrapedAt: {
    type: Date,
    default: Date.now,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isDuplicate: {
    type: Boolean,
    default: false,
  },
})

// Indexes for faster queries
leadSchema.index({ businessName: 1 })
leadSchema.index({ industry: 1 })
leadSchema.index({ city: 1 })
leadSchema.index({ employeeCount: 1 })
leadSchema.index({ revenue: 1 })
leadSchema.index({ leadScore: 1 })
leadSchema.index({ scrapedAt: -1 })

// Compound indexes for common queries
leadSchema.index({ industry: 1, employeeCount: 1 })
leadSchema.index({ industry: 1, revenue: 1 })
leadSchema.index({ city: 1, industry: 1 })

export default mongoose.models.Lead || mongoose.model('Lead', leadSchema)