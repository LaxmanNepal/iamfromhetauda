import json,os,urllib.request
from pathlib import Path

before_path=Path("/tmp/news-before.json")
if not before_path.exists():
    raise SystemExit("No previous news snapshot; skip push broadcast")
try:
    before=json.loads(before_path.read_text(encoding="utf-8"))
    old={x.get("id") for x in before.get("items",[]) if x.get("id")}
except Exception:
    old=set()
current=json.loads(Path("data/news.json").read_text(encoding="utf-8"))
new=[x for x in current.get("items",[]) if x.get("id") and x.get("id") not in old]
new.sort(key=lambda x:x.get("published",""), reverse=True)
base=os.environ.get("PUSH_API_BASE","").rstrip("/")
admin=os.environ.get("PUSH_ADMIN_KEY","")
if not base or not admin:
    print("Push secrets not configured; skipping background notifications.")
    raise SystemExit(0)
if not new:
    print("No new stories; no push sent.")
    raise SystemExit(0)
for n in new[:3]:
    payload=json.dumps({
        "id":n["id"],
        "title":n.get("title",""),
        "image":n.get("image","")
    },ensure_ascii=False).encode("utf-8")
    req=urllib.request.Request(
        base+"/broadcast",
        data=payload,
        method="POST",
        headers={
            "Content-Type":"application/json",
            "Authorization":"Bearer "+admin
        }
    )
    try:
        with urllib.request.urlopen(req,timeout=30) as r:
            print("Push:",n["title"],r.read().decode("utf-8"))
    except Exception as e:
        print("Push failed:",n["title"],e)
