import { sendPushNotification } from "@mmmike/web-push/send";

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...extra }
  });
}

function cors(origin) {
  const allowed = [
    "https://laxmannepal.com.np",
    "https://www.laxmannepal.com.np"
  ];
  return allowed.includes(origin) ? origin : "https://laxmannepal.com.np";
}

function withCors(response, origin) {
  const h = new Headers(response.headers);
  h.set("access-control-allow-origin", cors(origin));
  h.set("access-control-allow-methods", "GET,POST,DELETE,OPTIONS");
  h.set("access-control-allow-headers", "content-type,authorization");
  h.set("vary", "Origin");
  return new Response(response.body, { status: response.status, headers: h });
}

function keyFor(endpoint) {
  return "sub:" + endpoint;
}

function siteBase(env) {
  return (env.SITE_URL || "https://laxmannepal.com.np/iamfromhetauda/").replace(/\/$/, "");
}

function siteUrl(env, id) {
  return siteBase(env) + "/?news=" + encodeURIComponent(id);
}

function assetUrl(env, path) {
  return new URL(path.replace(/^\//, ""), siteBase(env) + "/").href;
}

async function authorize(request, env) {
  const expected = env.ADMIN_KEY || "";
  const got = request.headers.get("authorization") || "";
  return expected && got === "Bearer " + expected;
}

async function handle(request, env, ctx) {
  const url = new URL(request.url);
  const origin = request.headers.get("origin") || "";

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": cors(origin),
        "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
        "access-control-allow-headers": "content-type,authorization",
        "access-control-max-age": "86400",
        "vary": "Origin"
      }
    });
  }

  if (url.pathname === "/health") {
    return json({ ok: true, service: "I Am From Hetauda Push", time: new Date().toISOString() });
  }

  if (url.pathname === "/config" && request.method === "GET") {
    if (!env.VAPID_PUBLIC_KEY) return json({ ok: false, error: "VAPID_PUBLIC_KEY is not configured" }, 503);
    return json({ ok: true, publicKey: env.VAPID_PUBLIC_KEY });
  }

  if (url.pathname === "/subscribe" && request.method === "POST") {
    const body = await request.json().catch(() => null);
    if (!body?.endpoint || !body?.keys?.p256dh || !body?.keys?.auth) {
      return json({ ok: false, error: "Invalid push subscription" }, 400);
    }
    const clean = {
      endpoint: String(body.endpoint),
      keys: { p256dh: String(body.keys.p256dh), auth: String(body.keys.auth) }
    };
    await env.PUSH_KV.put(keyFor(clean.endpoint), JSON.stringify(clean));
    return json({ ok: true, subscribed: true });
  }

  if (url.pathname === "/subscribe" && request.method === "DELETE") {
    const body = await request.json().catch(() => null);
    if (!body?.endpoint) return json({ ok: false, error: "Endpoint required" }, 400);
    await env.PUSH_KV.delete(keyFor(String(body.endpoint)));
    return json({ ok: true, unsubscribed: true });
  }

  if (url.pathname === "/broadcast" && request.method === "POST") {
    if (!(await authorize(request, env))) return json({ ok: false, error: "Unauthorized" }, 401);
    const news = await request.json().catch(() => null);
    if (!news?.id || !news?.title) return json({ ok: false, error: "News id and title required" }, 400);
    if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY || !env.VAPID_SUBJECT) {
      return json({ ok: false, error: "VAPID secrets are not configured" }, 503);
    }

    let delivered = 0, removed = 0, failed = 0, checked = 0;
    let cursor = undefined;
    const base = siteBase(env);
    const imageUrl = news.image ? new URL(String(news.image), base + "/").href : assetUrl(env, "logo.jpg");
    const payload = {
      title: "I Am From Hetauda",
      body: String(news.title).slice(0, 240),
      icon: assetUrl(env, "logo.jpg"),
      badge: assetUrl(env, "logo.jpg"),
      image: imageUrl,
      tag: "news-" + String(news.id),
      id: String(news.id),
      url: siteUrl(env, String(news.id)),
      requireInteraction: false,
      timestamp: Date.now()
    };

    do {
      const listed = await env.PUSH_KV.list({ prefix: "sub:", limit: 1000, ...(cursor ? { cursor } : {}) });
      checked += listed.keys.length;
      for (const item of listed.keys) {
        const raw = await env.PUSH_KV.get(item.name);
        if (!raw) continue;
        try {
          const subscription = JSON.parse(raw);
          await sendPushNotification(subscription, payload, {
            publicKey: env.VAPID_PUBLIC_KEY,
            privateKey: env.VAPID_PRIVATE_KEY,
            subject: env.VAPID_SUBJECT
          }, { ttl: 86400 });
          delivered++;
        } catch (e) {
          const status = Number(e?.status || e?.statusCode || 0);
          if (status === 404 || status === 410) {
            await env.PUSH_KV.delete(item.name);
            removed++;
          } else {
            failed++;
            console.error("push failed", item.name, e?.message || e);
          }
        }
      }
      cursor = listed.list_complete === false ? listed.cursor : undefined;
    } while (cursor);

    return json({ ok: true, newsId: String(news.id), delivered, removed, failed, checked });
  }

  return json({ ok: false, error: "Not found" }, 404);
}

export default {
  async fetch(request, env, ctx) {
    try {
      return withCors(await handle(request, env, ctx), request.headers.get("origin") || "");
    } catch (error) {
      console.error(error);
      return withCors(json({ ok: false, error: "Server error" }, 500), request.headers.get("origin") || "");
    }
  }
};
