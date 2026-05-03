# 🏆 My Top Contributors

[![Live Demo](https://img.shields.io/badge/Live_Demo-Website-6366f1?style=for-the-badge)](https://top-contributors-api.vercel.app)

A personalized, zero-configuration system to automatically calculate and showcase the **top contributors across all your public GitHub repositories** directly on your GitHub Profile README.

By splitting the workload between a daily GitHub Action and a lightning-fast Vercel API, this project gives you a production-grade contributor image without ever hitting GitHub API rate limits. Best of all? **It requires absolutely zero configuration.** Just fork, deploy, and you're done!

👉 **Curious about the engineering?** Read [HOW THIS WORKS.md](HOW%20THIS%20WORKS.md) for a deep dive into how we bypass GitHub's API rate limits and SVG restrictions.

---

## 🎯 Features

* **Zero Config**: Automatically knows your GitHub username just by being in your account.
* **Profile-Wide Aggregation**: Scans all your public repositories to find the top contributors.
* **Smart Filtering**: Automatically excludes the repository owner and bots.
* **100% GitHub README Safe**: Renders as a raw PNG image, bypassing GitHub's strict SVG sanitization rules.
* **Lightning Fast**: Relies on a scheduled GitHub Action to cache data offline, so the API endpoint renders instantly without hitting GitHub API rate limits.
* **Built-in Landing Page**: Comes with a stunning, auto-generated documentation website right out of the box!

---

## 🛠️ Step-by-Step Setup Guide

Setting this up takes less than 2 minutes. Follow these 3 simple steps:

### 1️⃣ Fork the Repository
Click the **Fork** button at the top right of this page to create your own copy of the repository.

### 2️⃣ Enable & Run GitHub Actions
This project uses an automatic script to calculate your contributors daily. Since you just forked it, you need to enable it and run it for the first time.

1. Go to the **Actions** tab at the top of your repository.
2. Click the green **"I understand my workflows, go ahead and enable them"** button.
3. On the left sidebar, click **Aggregate Top Contributors**.
4. Click the **Run workflow** dropdown on the right side, and hit the green **Run workflow** button.

> ⏳ *Wait about 30 seconds for it to finish and show a green checkmark! Your data is now successfully generated.*

### 3️⃣ Deploy to Vercel
Now, let's deploy the API that serves the beautiful image and landing page.

1. Create a free account on [Vercel](https://vercel.com) (log in with GitHub).
2. From the dashboard, click **Add New...** > **Project**.
3. Import your newly forked `top-contributors-api` repository.
4. Leave everything blank! **No environment variables are needed.**
5. Click **Deploy**.

> 🔗 *Once finished, Vercel will give you a domain (e.g., `https://your-app.vercel.app`). Copy this URL!*

---

## 🎨 Usage

Now that your API is live, you can embed the dynamic image directly into your GitHub Profile `README.md`!

### Basic Embedding
Copy this markdown snippet and replace the URL with your Vercel URL from Step 3:

```md
## My Top Contributors 🏆

![Top Contributors](https://your-app.vercel.app/api/contributors)
```

### ⚙️ Customization Parameters
You can customize the image dynamically by adding parameters to the URL.

| Parameter | Default | Description |
| :--- | :---: | :--- |
| `limit` | `5` | The number of contributors to display. |
| `size` | `80` | The size of the circular avatars in pixels. |

### Examples

**Show the Top 10 Contributors:**
```md
![Top Contributors](https://your-app.vercel.app/api/contributors?limit=10)
```

**Compact view (Top 3 contributors, tiny 50px avatars):**
```md
![Top Contributors](https://your-app.vercel.app/api/contributors?limit=3&size=50)
```

---

## 💻 Local Offline Testing

If you want to modify the code or test the output locally without deploying to Vercel:

```bash
# 1. Install dependencies
npm install

# 2. Generate mock data locally (replace your-username)
GH_USERNAME=your-username node scripts/aggregate.js

# 3. Run the local development server
npm run dev
```
*Visit `http://localhost:3000` to view the beautiful landing page and test your API!*
