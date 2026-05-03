# 🚀 Top Contributors API

A **production-ready architecture** to compute and display **top contributors across all your public repositories**, optimized for reliability, rate limits, and GitHub README compatibility.

This project is built with a **"Zero Configuration"** philosophy. You simply fork the repository and deploy it. It automatically detects who you are and builds your image!

## 🎯 Features

* **Zero Config**: Automatically knows your GitHub username just by being in your account.
* **Profile-Wide Aggregation**: Scans all your public repositories to find the top contributors.
* **Smart Filtering**: Automatically excludes the repository owner and bots.
* **100% GitHub README Safe**: Renders as a raw PNG image, bypassing GitHub's strict SVG sanitization rules.
* **Lightning Fast**: Relies on a scheduled GitHub Action to cache data offline, so the API endpoint renders instantly without hitting GitHub API rate limits.

---

## 🛠️ Step-by-Step Setup Guide

### Step 1: Fork the Repository

Click the **Fork** button at the top right of this page to create your own copy of the repository.

### Step 2: Enable the GitHub Action

Because this is a fork, GitHub disables scheduled workflows by default. You need to enable it so it can start generating your data daily.

1. Go to the **Actions** tab in your forked repository.
2. Click the green **"I understand my workflows, go ahead and enable them"** button.
3. On the left sidebar, click **Aggregate Top Contributors**.
4. On the right side, click the **Run workflow** dropdown, and click **Run workflow**.

> 🎉 **Done!** The action will now scan your repositories and generate a `data/contributors.json` file. It will automatically re-run every day at midnight to keep your stats updated.

### Step 3: Deploy to Vercel

Now that your GitHub Action has generated the data, you can deploy the image renderer to Vercel.

1. Create a free account on [Vercel](https://vercel.com).
2. Click **Add New Project** and select your forked GitHub repository.
3. You **do not** need to add any Environment Variables. Leave them blank!
4. Click **Deploy**.
5. Once finished, Vercel will give you a domain (e.g., `https://top-contributors-api-yourname.vercel.app`). **Copy this URL**.

---

## 🎨 Usage in your Profile README

Now that your API is deployed and data is generated, you can display the image in your GitHub Profile `README.md`!

Copy the markdown below, but make sure to replace the Vercel URL with your actual URL from Step 3:

```md
## My Top Contributors 🏆

![Top Contributors](https://your-vercel-app.vercel.app/api/contributors)
```

---

## ⚙️ Customization Parameters

You can customize the image dynamically by simply adding query parameters to the URL.

| Parameter | Type   | Default | Description                    |
| --------- | ------ | ------- | ------------------------------ |
| `limit`   | number | 5       | Number of contributors to show |
| `size`    | number | 80      | Avatar size in pixels          |

### Examples:

**1. Show the Top 10 Contributors:**
```md
![Top Contributors](https://your-vercel-app.vercel.app/api/contributors?limit=10)
```

**2. Compact view (Top 3 contributors, 50px avatars):**
```md
![Top Contributors](https://your-vercel-app.vercel.app/api/contributors?limit=3&size=50)
```

---

## 💻 Local Offline Testing

If you want to modify the code or test the output locally without deploying to Vercel:

1. Clone your repository to your local machine and install dependencies:
   ```bash
   npm install
   ```
2. Generate mock data locally (replace `your-username`):
   ```bash
   GH_USERNAME=your-username node scripts/aggregate.js
   ```
3. Run the offline local development server:
   ```bash
   npm run dev
   ```
4. View the result in your browser: 
   `http://localhost:3000/api/contributors`
