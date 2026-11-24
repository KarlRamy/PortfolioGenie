const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        trim: true
    },
    slug: {
        type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true
    },
    githubUsername: {
        type: String,
        required: true,
        trim: true
    },
    roleTitle: {
        type: String,
        required: true
    },
    location: {
        type: String,
        trim: true,
        default: '',
    },
    writingStyle: {
        type: String,
        trim: true,
        default: 'Thoughtful and minimal',
    },
    bio: {
        type: String,
        required: true
    },
    headline: {
        type: String,
        trim: true,
        default: '',
    },
    seoMetadata: {
      metaTitle: { type: String, trim: true },
      metaDescription: { type: String, trim: true },
      keywords: [{ type: String }],
    },
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],
    skills: [{
        name: { type: String, required: true },
        category: {
          type: String,
          enum: ['Frontend', 'Backend', 'Database', 'Tools', 'Other'],
          default: 'Other',
        },
    }],
    socialLinks: {
      github: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      twitter: { type: String, trim: true },
      website: { type: String, trim: true },
      email: { type: String, trim: true },
    },
    themeConfig: {
      template: {
        type: String,
        enum: ['minimal', 'dark-dev', 'modern', 'terminal'],
        default: 'dark-dev',
      },
      primaryColor: {
        type: String,
        default: '#3b82f6',
      },
    },
  },
  {
    timestamps: true,
  }
);

const Portfolio = mongoose.model('Portfolio', portfolioSchema);
module.exports = Portfolio;