const mongoose = require('mongoose');

const aiSchema = new mongoose.Schema({
    portfolioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Portfolio',
        required: false
    },
    type: {
        type: String,
        enum: ['optimization', 'generation'],
        required: true
    },
    writingStyle: {
        type: String,
        trim: true
    },
    inputPayload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    outputPayload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    modelName: {
      type: String,
      default: 'gemini-3.5-flash-lite',
    },
  },
  {
    timestamps: true,
  }
);

const AiGeneration = mongoose.model('AiGeneration', aiSchema);
module.exports = AiGeneration;