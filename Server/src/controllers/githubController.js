exports.getGithubUser = async(req, res) => {
    try {
        const { username } = req.params;
        if(!username) {
            return res.status(400).json({
                message: "Username is required"
            })
        }
        const cleanUsername = username.trim();
        const headers = {
            Accept: 'application/vnd.github+json',
           'User-Agent': 'PortfolioGenie-App',
        }

        const [userResponse, reposResponse] = await Promise.all([
            fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`, { headers }),
            fetch(
          `https://api.github.com/users/${encodeURIComponent(cleanUsername)}/repos?sort=updated&per_page=30`,
          { headers }
         ),
        ])

        if (userResponse.status === 404) {
            return res.status(404).json({
            success: false,
            message: `GitHub user "${cleanUsername}" not found`,
          });
        }

        if (!userResponse.ok || !reposResponse.ok) {
            return res.status(500).json({
                success: false,
                message: 'Error fetching data from GitHub API',
            });
        }

        const userData = await userResponse.json();
        const reposData = await reposResponse.json();
        const formattedRepos = reposData.map(repo => {
            return {
                id: repo.id,
                name: repo.name,
                description: repo.description,
                language: repo.language,
                html_url: repo.html_url,
                stargazers_count: repo.stargazers_count,
                forks_count: repo.forks_count,
                updated_at: repo.updated_at,
            }
        });

        const user = {
            name: userData.name,
            avatar_url: userData.avatar_url,
            bio: userData.bio,
            blog: userData.blog,
            location: userData.location,
            email: userData.email,
            public_repos: userData.public_repos,
            followers: userData.followers,
            following: userData.following,
            repos: formattedRepos
        }
        return res.status(200).json({
            success: true,
            profile: user,
            repos: formattedRepos
        });
    } catch (error) {
        console.error('Error fetching GitHub user data:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}
