# 🚀 Top Contributors API

A **production-ready architecture** to compute and display **top contributors across all repositories of a GitHub user**, optimized for reliability, rate limits, and GitHub README compatibility.

## 🎯 Features

* **Profile-Wide Aggregation**: Scans all your public repositories to find the top contributors.
* **Smart Filtering**: Automatically excludes the repository owner and bots.
* **100% GitHub README Safe**: Renders as a raw PNG image, bypassing GitHub's strict SVG and `<image>` sanitization rules.
* **Lightning Fast**: Relies on a scheduled GitHub Action to cache data, so the API endpoint renders instantly without hitting GitHub API rate limits at runtime.

---

## 🚀 How to Set This Up for Yourself

### 1. Deploy to Vercel
Clone or fork this repository, and import it into your Vercel dashboard to deploy the API endpoint. 
*(Alternatively, use the Vercel CLI: `npm run dev` for local testing, or `npx vercel` to deploy).*

### 2. Configure GitHub Actions
To populate the contributor data, you need to configure the scheduled GitHub Action in your repository.

1. Go to your repository's **Settings**.
2. Navigate to **Secrets and variables** > **Actions** > **Variables** tab.
3. Add a new variable:
   * **Name**: `GH_USERNAME`
   * **Value**: *Your GitHub Username*
4. Go to the **Actions** tab in your repository and manually trigger the **Aggregate Top Contributors** workflow to generate your first batch of data.

*(Note: The workflow uses the built-in `GITHUB_TOKEN` automatically, so you don't need to generate a custom Personal Access Token!)*

---

## 🎨 Usage in your Profile README

Add this markdown to your `README.md` to display the contributors:

```md
## Top Contributors

![Top Contributors](https://your-vercel-app.vercel.app/api/contributors?username=your-username)
```

*(Remember to replace `your-vercel-app.vercel.app` with your actual Vercel deployment URL, and `your-username` with your GitHub username).*

### ⚙️ Customization Parameters

You can customize the output by adding query parameters to the image URL:

| Param      | Type   | Default  | Description                    |
| ---------- | ------ | -------- | ------------------------------ |
| `username` | string | required | GitHub username to fetch for   |
| `limit`    | number | 5        | Number of contributors to show |
| `size`     | number | 80       | Avatar size (px)               |

**Example (10 contributors, 60px avatars):**
```md
![Top Contributors](https://your-vercel-app.vercel.app/api/contributors?username=your-username&limit=10&size=60)
```

---

## 🛠️ Local Development

If you want to modify the code or test the output locally without Vercel:

1. Clone the repository and install dependencies:
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
