const Portfolio = require('../models/Portfolio');
const Project = require('../models/Project');

exports.createSlug = (text = 'Portfolio') => {
    const slug = text.toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

    const randomString = Math.floor(1000 + Math.random() * 9000);
    return slug + '-' + randomString;
}

exports.createPortfolio = async(req, res) => {
    try{
        const {
           fullName,
           roleTitle,
           location = '',
           githubUsername,
           writingStyle = 'Thoughtful and minimal',
           bio,
           headline = '',
           skills,
           socialLinks = {},
           themeConfig = {},
           seoMetadata = {},
           projects = [],
        } = req.body;

        if (!fullName?.trim() || !roleTitle?.trim() || !githubUsername?.trim() || !bio?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Name, role, GitHub username, and About Me are required.',
            });
        }

        if (!Array.isArray(projects)) {
            return res.status(400).json({
                success: false,
                message: 'Projects must be an array.',
            });
        }

        const slug = exports.createSlug(fullName);
        const projectDocuments = projects
            .filter((projectData) => typeof projectData?.name === 'string' && projectData.name.trim())
            .map((projectData) => ({
                name: projectData.name.trim(),
                description: typeof projectData.description === 'string' ? projectData.description.trim() : '',
                optimizedDescription: projectData.optimizedDescription || '',
                techStack: Array.isArray(projectData.techStack)
                    ? projectData.techStack
                    : typeof projectData.techStack === 'string'
                      ? projectData.techStack.split(',').map((item) => item.trim()).filter(Boolean)
                      : [],
                repoUrl: projectData.repoUrl || '',
                liveUrl: projectData.liveUrl || '',
                stars: Number.isFinite(projectData.stars) ? projectData.stars : 0,
            }));
        const derivedSkills = [...new Set(projectDocuments.flatMap((projectData) => projectData.techStack))]
            .map((name) => ({ name, category: 'Other' }));

        const newPortfolio = new Portfolio({
           fullName: fullName.trim(),
           slug,
           roleTitle: roleTitle.trim(),
           location: location.trim(),
           githubUsername: githubUsername.trim(),
           writingStyle,
           bio: bio.trim(),
           headline,
           skills: Array.isArray(skills) ? skills : derivedSkills,
           socialLinks,
           themeConfig,
           seoMetadata,
           projects: [],
        })

        const savedProjects = projectDocuments.length
            ? await Project.insertMany(projectDocuments.map((projectData) => ({
                ...projectData,
                techStack: projectData.techStack.join(', '),
                portfolioId: newPortfolio._id,
            })))
            : [];
        newPortfolio.projects = savedProjects.map((projectData) => projectData._id);
        await newPortfolio.save();
        const portfolioData = newPortfolio.toObject();
        portfolioData.projects = savedProjects;

        return res.status(201).json({
            success: true,
            data: portfolioData,
        });
    } catch (error) {
        console.error('Error creating portfolio:', error);
        return res.status(500).json({
            success: false,
            message: 'Could not build the portfolio.',
        });
    }
}



exports.updatePortfolio = async(req, res) => {
    try {
        const { slug } = req.params;

        const updatedPortfolio = await Portfolio.findOneAndUpdate(
            { slug },
            req.body,
            { new: true, runValidators: true },
        ).populate('projects');
        if (!updatedPortfolio) {
            return res.status(404).json({ message: 'Portfolio not found' });
        }
        res.status(200).json({ message: 'Portfolio updated successfully', portfolio: updatedPortfolio });
    } catch (error) {
        console.error('Error updating portfolio:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getPortfolioBySlug = async(req, res) => {
    try {
        const { slug } = req.params;

        const foundPortfolio = await Portfolio.findOne({ slug }).populate('projects');

        if (!foundPortfolio) {
            return res.status(404).json({
                success: false,
                message: 'Portfolio not found.',
            })
        }
        return res.status(200).json({
            success: true,
            data: foundPortfolio,
        });
    } catch (error) {
        console.error('Error fetching portfolio:', error);
        return res.status(500).json({
            success: false,
            message: 'Could not load the portfolio.',
        });
    }
}

exports.deletePortfolio = async(req, res) => {
    try {
        const { slug } = req.params;

        const deletedPortfolio = await Portfolio.findOneAndDelete({ slug });
        if (!deletedPortfolio) {
            return res.status(404).json({ message: 'Portfolio not found' });
        }
        res.status(200).json({ message: 'Portfolio deleted successfully', portfolio: deletedPortfolio });
    } catch (error) {
        console.error('Error deleting portfolio:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}