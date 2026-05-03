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
    "Authorization": `Bearer ${process.env.GH_TOKEN || ""}`,
    "User-Agent": "top-contributors-api"
  };

  // ---------- FETCH REPOS ----------
  let repos = [];
  let page = 1;

  while (true) {
    const r = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&page=${page}`, { headers });
    const data = await r.json();
    if (!data.length) break;
    repos.push(...data);
    page++;
  }

  // ---------- COLLECT CONTRIBUTORS ----------
  let contributors = {};

  for (const repo of repos) {
    let page = 1;

    while (true) {
      const r = await fetch(`https://api.github.com/repos/${username}/${repo.name}/contributors?per_page=100&page=${page}`, { headers });
      const data = await r.json();

      if (!data.length || data.message) break;

      for (const user of data) {
        const login = user.login.toLowerCase();

        // skip self + bots
        if (login === username.toLowerCase()) continue;
        if (user.type !== "User") continue;

        if (!contributors[login]) {
          contributors[login] = {
            count: 0,
            avatar: user.avatar_url
          };
        }

        contributors[login].count += user.contributions;
      }

      page++;
    }
  }

  const top = Object.entries(contributors)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, TOP_N);

  // ---------- FETCH + CONVERT AVATARS TO BASE64 ----------
  async function toBase64(url) {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    return `data:image/png;base64,${base64}`;
  }

  const avatars = await Promise.all(
    top.map(async ([user, data]) => {
      return {
        name: user,
        count: data.count,
        img: await toBase64(data.avatar)
      };
    })
  );

  // ---------- SVG GENERATION ----------
  const size = 60;
  const gap = 20;
  const width = avatars.length * (size + gap);
  const height = 80;

  let svgImages = "";

  avatars.forEach((user, i) => {
    const x = i * (size + gap);

    svgImages += `
      <defs>
        <pattern id="img${i}" patternUnits="userSpaceOnUse" width="${size}" height="${size}">
          <image href="${user.img}" width="${size}" height="${size}" />
        </pattern>
      </defs>

      <circle cx="${x + size / 2}" cy="${size / 2}" r="${size / 2}" fill="url(#img${i})" />
    `;
  });

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      ${svgImages}
    </svg>
  `;

  // ---------- HEADERS ----------
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "s-maxage=3600");

  return res.status(200).send(svg);
}