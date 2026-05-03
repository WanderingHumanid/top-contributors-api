# 🚀 Top Contributors API

A **production-ready architecture** to compute and display **top contributors across all repositories of a GitHub user**, optimized for reliability, rate limits, and GitHub README compatibility.

## 🎯 Features

* **Profile-Wide Aggregation**: Scans all your public repositories to find the top contributors.
* **Smart Filtering**: Automatically excludes the repository owner and bots.
* **100% GitHub README Safe**: Renders as a raw PNG image, bypassing GitHub's strict SVG and `<image>` sanitization rules.
* **Lightning Fast**: Relies on a scheduled GitHub Action to cache data, so the API endpoint renders instantly without hitting GitHub API rate limits at runtime.

---

## 🛠️ Step-by-Step Setup Guide

Setting this up requires zero coding. You just need to deploy the API to Vercel and tell GitHub Actions which username to scan.

### Step 1: Deploy the API to Vercel

Vercel will host the serverless API that generates the image.

1. Click the button below to instantly clone this repository to your GitHub account and deploy it to Vercel:
   
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvishnunandan555%2Ftop-contributors-api)

2. Follow the Vercel prompts to link your GitHub account.
3. You **do not** need to add any Environment Variables in Vercel. Leave them blank!
4. Click **Deploy**.
5. Once finished, Vercel will give you a domain (e.g., `https://top-contributors-api-yourname.vercel.app`). **Copy this URL** for later.

---

### Step 2: Configure the GitHub Action

Now that you have your own copy of the repository (created by Vercel in Step 1), you need to tell the system whose repositories to scan.

1. Go to your newly created repository on GitHub.
2. Navigate to **Settings** > **Secrets and variables** > **Actions** > **Variables** tab (Make sure it is the *Variables* tab, not Secrets).
3. Click **New repository variable**:
   * **Name**: `GH_USERNAME`
   * **Value**: *Your GitHub Username* (e.g., `vishnunandan555`)
4. Go to the **Actions** tab at the top of your repository. 
   *(Note: GitHub disables Actions on cloned repos by default. Click the green "I understand my workflows, go ahead and enable them" button).*
5. On the left sidebar, click **Aggregate Top Contributors**.
6. On the right side, click the **Run workflow** dropdown, and click the green **Run workflow** button.

> 🎉 **Done!** The action will now scan your repositories, generate a `.json` file containing your top contributors, and commit it to your repo. It will automatically re-run on the 1st of every month to keep your stats updated.

*(Note: The workflow securely uses the built-in `GITHUB_TOKEN` automatically, so you don't need to generate a custom Personal Access Token!)*

---

## 🎨 Usage in your Profile README

Now that your API is deployed and data is generated, you can display the image in your GitHub Profile `README.md`!

Copy the markdown below, but make sure to replace the Vercel URL with your actual URL from Step 1, and the username with your username:

```md
## My Top Contributors 🏆

![Top Contributors](https://your-vercel-app.vercel.app/api/contributors?username=your-username)
```

---

## ⚙️ Customization Parameters

You can customize the image dynamically by simply adding query parameters to the URL. No redeployment is necessary!

| Parameter  | Type   | Default | Description                    |
| ---------- | ------ | ------- | ------------------------------ |
| `username` | string | *req.*  | GitHub username to fetch for   |
| `limit`    | number | 5       | Number of contributors to show |
| `size`     | number | 80      | Avatar size in pixels          |

### Examples:

**1. Show the Top 10 Contributors:**
```md
![Top Contributors](https://your-vercel-app.vercel.app/api/contributors?username=your-username&limit=10)
```

**2. Make avatars larger (100px) for high-resolution displays:**
```md
![Top Contributors](https://your-vercel-app.vercel.app/api/contributors?username=your-username&size=100)
```

**3. Compact view (Top 3 contributors, 50px avatars):**
```md
![Top Contributors](https://your-vercel-app.vercel.app/api/contributors?username=your-username&limit=3&size=50)
```

---

## 💻 Local Offline Testing

If you want to modify the code or test the output locally without deploying to Vercel:

1. Clone your repository to your local machine and install dependencies:
   ```bash
   npm install
   ```
2. Generate mock data locally:
   ```bash
   GH_USERNAME=your-username node scripts/aggregate.js
   ```
3. Run the offline local development server:
   ```bash
   npm run dev
   ```
4. View the result in your browser: 
   `http://localhost:3000/api/contributors?username=your-username`
