// api/contributors.js

export const config = {
  runtime: "nodejs"
};

export default async function handler(req, res) {

  const username = req.query.username;
  const TOP_N = 5;
  
  if (!username) {
    return res.status(400).send("Missing username");
  }

  const headers = {
    "Accept": "application/vnd.github+json",
    "User-Agent": "contributors-api"
  };

  // Fetch repos
  let repos = [];
  let page = 1;

  while (true) {
    const r = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&page=${page}`, { headers });
    const data = await r.json();
    if (!data.length) break;
    repos.push(...data);
    page++;
  }

  let contributors = {};

  // Fetch contributors per repo
  for (const repo of repos) {
    let page = 1;

    while (true) {
      const r = await fetch(`https://api.github.com/repos/${username}/${repo.name}/contributors?per_page=100&page=${page}`, { headers });
      const data = await r.json();

      if (!data.length || data.message) break;

      for (const user of data) {
        if (user.login.toLowerCase() === username.toLowerCase()) continue;

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
  }

  const top = Object.entries(contributors)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, TOP_N);

  // SVG layout
  const size = 60;
  const gap = 20;
  const width = top.length * (size + gap);

  let images = "";

  top.forEach(([user, data], i) => {
    const x = i * (size + gap);
    images += `
      <image href="${data.avatar}" x="${x}" y="0" width="${size}" height="${size}" clip-path="circle(30px at 30px 30px)" />
    `;
  });

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="80">
      ${images}
    </svg>
  `;

  res.setHeader("Content-Type", "image/svg+xml");
  res.status(200).send(svg);
}