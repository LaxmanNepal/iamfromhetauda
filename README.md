# I Am From Hetauda — Nepal News

Nepali live-news dashboard for I Am From Hetauda.

## Features
- Multi-source RSS/Atom news fetching via GitHub Actions every 15 minutes
- Category navbar: नेपाल, राजनीति, अर्थतन्त्र, समाज, खेलकुद, प्रविधि, विश्व
- iPhone-inspired glassmorphism interface
- Homepage shows clean headline + image cards
- Tapping a story opens a glass popup with the fetched publisher description, image, headline, source and a button to open the original news site
- Longer RSS/Atom descriptions are retained for the popup (up to 1,600 characters)
- Headline-based category detection to reduce misleading categories
- Duplicate-story grouping across publishers
- Ranking using freshness, source count, verification, local Hetauda/Makwanpur relevance and image availability
- Private copy desk at /admin-news.html
- Daily copy-ready data at data/today-post.json

## Copyright / source policy
The dashboard intentionally does not copy or republish complete copyrighted articles. The popup uses the description/summary supplied by the publisher feed and sends readers to the original publisher for the full article.

Important: the private page is only a light browser-side gate. GitHub Pages is static, so this is NOT real authentication. Do not store secrets there.
