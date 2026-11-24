const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    portfolioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Portfolio',
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    optimizedDescription: {
        type: String,
        default: '',
    },
    techStack: {
        type: String,
        default: '',
    },
    repoUrl: {
        type: String,
        default: '',
    },
    liveUrl: {
        type: String,
        default: '',
    },
    stars: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;