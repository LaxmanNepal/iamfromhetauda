# I Am From Hetauda — Background Push Worker

This Worker is the server side of browser Web Push. It stores browser subscriptions in Cloudflare KV and sends encrypted Web Push messages using VAPID.

## 1. Create KV

Install Wrangler and log in:

```bash
npm install
npx wrangler login
npx wrangler kv namespace create PUSH_KV
```

Copy the returned namespace ID into `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "PUSH_KV"
id = "YOUR_NAMESPACE_ID"
```

Cloudflare KV is available on the Free plan; current free limits include 100,000 reads/day and 1,000 writes/day.

## 2. Generate VAPID keys

Run:

```bash
npx web-push generate-vapid-keys
```

Keep the private key secret. Web Push uses the VAPID public key in the browser subscription and the private key only on the server.

Then set Worker secrets:

```bash
npx wrangler secret put VAPID_PUBLIC_KEY
npx wrangler secret put VAPID_PRIVATE_KEY
npx wrangler secret put VAPID_SUBJECT
npx wrangler secret put ADMIN_KEY
```

Use a subject such as `mailto:your-email@example.com`.

For `ADMIN_KEY`, generate a long random value. Never put it in the website JavaScript.

## 3. Deploy

```bash
npx wrangler deploy
```

The Worker will be available at a URL similar to:

`https://iamfromhetauda-push.<your-subdomain>.workers.dev`

Test:

```bash
curl https://YOUR_WORKER_URL/health
curl https://YOUR_WORKER_URL/config
```

## 4. Connect the website

Set `PUSH_API_BASE` in `index.html` to the Worker URL, then redeploy the GitHub Pages site.

The browser subscription must happen from the user's button click; this is required/best practice for PushManager subscription.

The Worker never receives or stores the newspaper's original URL as the notification target. Notification clicks always go to:

`https://iamfromhetauda.com.np/?news=<stable-news-id>`

## 5. GitHub Actions

Add these GitHub Actions repository secrets:

- `PUSH_API_BASE` — Worker URL
- `PUSH_ADMIN_KEY` — same value as Worker `ADMIN_KEY`

The news workflow will call `POST /broadcast` for newly fetched stories.

## Security

- VAPID private key stays in Cloudflare Worker secrets.
- Admin key stays in GitHub Actions secrets and Worker secrets.
- Browser only receives the VAPID public key.
- Push subscriptions are stored in KV.
- Invalid 404/410 subscriptions are automatically removed.
- Notification target is always your own site.
