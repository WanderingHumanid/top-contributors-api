# Top Contributors API

A lightweight serverless endpoint that generates a live SVG showing the top contributors (by total contributions) across all *public* repositories of a GitHub user.

This README only documents the current, accurate behavior of the service.

## What it does

- Fetches *all public repositories* for the requested username (paginated).
- For each repository, fetches its contributors and sums contributions by contributor login across all repos.
- Filters bots when requested and excludes non-user contributor types.
- Returns an SVG containing the top N contributor avatars.
- Sets `Cache-Control: s-maxage=3600, stale-while-revalidate` so responses are cached for 1 hour.

## Endpoint

Base URL:

```
https://top-contributors-api.vercel.app/api/contributors
```

Required query param:

- `username` — GitHub username to analyze.

Optional query params:

- `limit` (default `5`) — number of top contributors to show.
- `size` (default `60`) — avatar pixel size.
- `bots` (default `true`) — set to `false` to exclude bot accounts (e.g. dependabot).

Example:

```
https://top-contributors-api.vercel.app/api/contributors?username=octocat&limit=8&size=80&bots=false
```

Quick view (no bots, exclude owner)

Replace `USERNAME` with the GitHub account you want to inspect. This example disables bots and the function will also automatically exclude the repo owner and the authenticated token user (if `GITHUB_TOKEN` is set in Vercel):

```
https://top-contributors-api.vercel.app/api/contributors?username=USERNAME&limit=8&size=80&bots=false
```

Open that URL in your browser to preview the generated SVG. If you want me to update the README with a deployed preview link for a specific username, tell me which username to use and I'll add it.

## Environment

Set the following in Vercel (or your runtime environment):

- `GITHUB_TOKEN` — optional but strongly recommended. When present, requests are authenticated and gain a much higher GitHub API rate limit. Do NOT commit this token to source.

If `GITHUB_TOKEN` is missing the endpoint still works but will be subject to the much lower unauthenticated GitHub rate limits.

## Behavior and limitations

- Only public repositories are queried; private repo data is not accessible.
- Contributions are summed by contributor login across all repositories.
- Avatars are embedded in a single SVG; they are not individual links.
- The service can be slow for users with very large numbers of repositories because it iterates all pages and fetches contributors for each repo. Caching mitigates repeated load.
- If GitHub API errors occur, the endpoint returns a simple SVG with an error message instead of a broken image.

## Deployment

1. Import this repository into Vercel.
2. Add `GITHUB_TOKEN` in Project Settings → Environment Variables.
3. Deploy.

## Local testing

If you use the Vercel CLI you can run the function locally:

```bash
vercel dev
```

You may need Node.js installed to run the development server.

## Notes for maintainers

- The function fetches all repositories (paginated) and then fetches contributors per repo. It parallelizes contributor fetches but still may hit rate limits if unauthenticated.
- The response uses `s-maxage=3600` to cache on Vercel's edge for one hour.

## License

MIT
