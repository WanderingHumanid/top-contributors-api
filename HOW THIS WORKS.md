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

## 🕒 Minute-by-Minute: The Daily Automation Deep Dive

If you're wondering exactly what happens when the clock strikes midnight, here is the breakdown:

### 00:00 - The Wake Up
GitHub's internal scheduler triggers the `Aggregate Top Contributors` workflow. A virtual machine in the cloud (Ubuntu) is spun up specifically for your project.

### 00:01 - Environment Setup
The machine clones your repository and installs Node.js. It runs `npm ci` to install dependencies in seconds.

### 00:02 - The Data Hunt (`aggregate.js`)
1. **Repo Scanning**: The script asks the GitHub API for every public repository owned by you.
2. **Contributor Deep-Dive**: For every repository found, it fetches the list of people who have contributed code.
3. **The Filter**: It ignores your own username and filters out common bots (like `dependabot` or `github-actions`).
4. **The Tally**: It sums up all contributions across every repo and sorts everyone from "Most" to "Least."

### 00:03 - The "Hard Copy"
The script writes this sorted list into `data/contributors.json`. This acts as a **static cache**. By saving it as a file, we ensure the Vercel API is lightning fast because it doesn't have to talk to GitHub at all.

### 00:04 - The Secure Commit
The GitHub Action uses its built-in `GITHUB_TOKEN` to:
1. Stage the changes: `git add data/`
2. Sign the commit: `git commit -m "chore: update data"`
3. Push: `git push`

### 00:05 - Vercel Deployment
Vercel detects the new commit on your `main` branch. It automatically triggers a "Production Redeploy." Your new data is now live and globally distributed on Vercel's Edge Network.

---

## 🛡️ Security & Safeguards

To ensure this remains a "Set it and Forget it" project, we have implemented:

1. **Read-Only PRs**: Any Pull Request from a stranger triggers `test.yml`, which has **zero write access**. It can't steal secrets or change your code.
2. **Rate Limit Protection**: By using a scheduled Action with a token, we get 1,000 requests/hour, far exceeding the 60/hour limit for public users.
3. **API Capping**: Our Vercel endpoint strictly caps the `limit` and `size` parameters to prevent malicious users from trying to crash the server with giant requests.

---

### Summary
By pairing a scheduled data-aggregation pipeline with a serverless edge renderer, you get an infinitely scalable, zero-configuration dynamic image that never hits rate limits and never slows down your profile load time!
