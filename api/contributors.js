// api/contributors.js

export const config = {
  runtime: "nodejs"
};

export default async function handler(req, res) {

  const {
    username,
    limit = 5,
    size = 60,
    bots = "true"
  } = req.query;

  if (!username) {
    return res.status(400).send("Missing username");
  }

  try {
    const headers = {
      "Accept": "application/vnd.github+json",
      "User-Agent": "contributors-api"
    };

    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `token ${process.env.GITHUB_TOKEN}`;
    }

    // Fetch repos
    let repos = [];
    let repoPage = 1;
    while (true) {
      const r = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&page=${repoPage}`, { headers });
      const data = await r.json();
      
      if (r.status !== 200) {
          // Handle GitHub API errors
          return res.status(500).send(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="50"><text x="10" y="25">Error: ${data.message || 'Could not fetch user repos'}</text></svg>`);
      }

      if (!data.length) break;
      repos.push(...data);
      repoPage++;
    }

    let contributors = {};

    // Fetch contributors per repo
    await Promise.all(repos.map(async (repo) => {
      let page = 1;
      while (true) {
        const r = await fetch(`https://api.github.com/repos/${username}/${repo.name}/contributors?per_page=100&page=${page}`, { headers });
        const data = await r.json();

        if (!data.length || data.message) break;

        for (const user of data) {
          if (bots === "false" && user.type === "Bot") continue;
          if (user.type !== "User" && user.type !== "Bot") continue;

          if (!contributors[user.login]) {
            contributors[user.login] = {
              count: 0,
              avatar: user.avatar_url
            };
          }
          contributors[user.login].count += user.contributions;
        }
        page++;
      }
    }));

    const top = Object.entries(contributors)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, parseInt(limit, 10));

    if (top.length === 0) {
      res.setHeader("Content-Type", "image/svg+xml");
      return res.send(`
        <svg xmlns="http://www.w3.org/2000/svg" width="300" height="50">
          <text x="10" y="25">No contributors found</text>
        </svg>
      `);
    }

    // SVG layout
    const avatarSize = parseInt(size, 10);
    const gap = 20;
    const width = top.length * (avatarSize + gap) - gap;

    let images = "";

    top.forEach(([user, data], i) => {
      const x = i * (avatarSize + gap);
      images += `
        <image href="${data.avatar}" x="${x}" y="0" width="${avatarSize}" height="${avatarSize}" clip-path="circle(${(avatarSize / 2)}px at ${(avatarSize / 2)}px ${(avatarSize / 2)}px)" />
      `;
    });

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${avatarSize}">
        ${images}
      </svg>
    `;

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    res.setHeader("Content-Type", "image/svg+xml");
    res.status(200).send(svg);

  } catch (error) {
    console.error(error);
    res.setHeader("Content-Type", "image/svg+xml");
    res.status(500).send(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="50"><text x="10" y="25">Internal Server Error</text></svg>`);
  }
}