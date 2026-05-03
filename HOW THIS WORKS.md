# 🧠 How This Works

If you are curious about the engineering behind this project, you might wonder: *Why use both GitHub Actions AND Vercel? Why not just use Vercel for everything?*

The answer comes down to **Performance** and **Rate Limits**. 

Here is the entire workflow and the cool technical reasons why it is built this way.

---

## The Problem

To find your top contributors, a system has to:
1. Fetch a list of **all** your public repositories.
2. For *every single repository*, fetch the list of contributors.
3. Handle pagination (some repos have hundreds of contributors).

If we built a simple Vercel API to do this "on the fly" whenever someone loads your GitHub Profile, two very bad things would happen:
1. **API Rate Limits**: GitHub limits unauthenticated API requests to just 60 per hour per IP. If your profile is viewed more than 60 times, the image breaks.
2. **Timeouts**: Fetching all that data takes time. Vercel Serverless Functions on the free tier have a strict **10-second timeout**. If you have many repositories, the function would simply timeout and crash before drawing the image.

---

## The "Zero-Config" Architecture

To solve this, we split the architecture into two dedicated halves: the **Heavy Lifter** and the **Fast Renderer**.

### 1. The Heavy Lifter (GitHub Actions)
Inside `.github/workflows/aggregate.yml`, there is a cron job that runs once a day at midnight. 

- **Security**: It runs using GitHub's built-in `GITHUB_TOKEN`, which gives it a massive rate limit of 1,000 requests per hour. You don't have to configure any secrets!
- **Zero Config**: It dynamically reads `${{ github.repository_owner }}`. Because of this, anyone who forks the repository inherently triggers the action for *their own* username automatically.
- **The Output**: The script (`scripts/aggregate.js`) does all the heavy data fetching, filters out bots, and sorts the users. It then saves a tiny, pre-calculated `data/contributors.json` file and commits it right back to the repository.

### 2. The Fast Renderer (Vercel)
When someone looks at your GitHub profile, your README makes a request to your Vercel URL.

- **Instant Generation**: Because the heavy lifting is already done, the Vercel API (`api/contributors.js`) doesn't talk to GitHub at all. It simply reads the `data/contributors.json` file that is bundled with it.
- **Image Construction**: It fetches the avatars and uses the `canvas` package to draw them into a perfect, transparent PNG layout.
- **Caching**: The endpoint returns the image with `Cache-Control: s-maxage=86400, stale-while-revalidate`, meaning Vercel caches the image globally on its Edge Network. The response time drops to **<50 milliseconds**.

---

## 🎨 Why PNG and not SVG?

Many dynamic GitHub status cards use SVG formats because they are lightweight and easy to build. 

However, GitHub's markdown image proxy (`camo`) strictly sanitizes SVGs. It strips out `<foreignObject>` tags, interactive elements, and heavily restricts external `<image>` embeds inside the SVG. By using `canvas` to render a raw **PNG image**, we guarantee 100% compatibility with GitHub READMEs. The image will never break, no matter how strictly GitHub updates their security policies.

---

## 🔁 Visual Workflow

```text
[ GitHub Action (Daily) ] 
       │
       ▼
[ Fetch all Repos & Contributors ]
       │
       ▼
[ Filter & Sort Top Users ]
       │
       ▼
[ Save data/contributors.json ]
       │
       ▼
[ Commit & Push back to Repo ] 

=======================================

[ Someone Views Your GitHub Profile ]
       │
       ▼
[ GET /api/contributors ] (Hits Vercel)
       │
       ▼
[ Vercel reads local contributors.json ]
       │
       ▼
[ Canvas generates PNG instantly ]
       │
       ▼
[ Image is displayed on your README ]
```

---

### Summary
By pairing a scheduled data-aggregation pipeline with a serverless edge renderer, you get an infinitely scalable, zero-configuration dynamic image that never hits rate limits and never slows down your profile load time!
