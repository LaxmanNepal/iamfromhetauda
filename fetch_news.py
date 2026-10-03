import json,re,urllib.request
from xml.etree import ElementTree as ET
from datetime import datetime,timezone,timedelta
from email.utils import parsedate_to_datetime

FEEDS=[
 ("OnlineKhabar","https://www.onlinekhabar.com/feed"),
 ("Setopati","https://www.setopati.com/feed"),
 ("Ratopati","https://www.ratopati.com/feed"),
 ("Khabarhub","https://khabarhub.com/feed/"),
 ("Lokaantar","https://www.lokaantar.com/feed"),
 ("Nepal Samaya","https://nepalsamaya.com/feed"),
 ("Baahrakhari","https://baahrakhari.com/feed"),
 ("Kendrabindu","https://kendrabindu.com/feed"),
 ("Nepal Press","https://www.nepalpress.com/feed/"),
 ("Thaha Khabar","https://thahakhabar.com/feed/"),
 ("BBC Nepali","https://www.bbc.com/nepali/index.xml"),
 ("Gorkhapatra Online","https://gorkhapatraonline.com/rss"),
]
def clean(s):
 return re.sub(r"\s+"," ",re.sub(r"<[^>]+>"," ",s or "")).strip()
def node_text(n,name):
 x=n.find(name)
 return clean("".join(x.itertext()) if x is not None else "")
def cat(t):
 t=t.lower()
 if any(x in t for x in ["निर्वाचन","चुनाव","संसद","मन्त्री","मन्त्रिपरिषद्","प्रधानमन्त्री","राष्ट्रपति","कांग्रेस","एमाले","माओवादी","रास्वपा","राजनीति","दल","सरकार","विधेयक"]): return "politics"
 if any(x in t for x in ["क्रिकेट","फुटबल","खेलकुद","खेलाडी","राष्ट्रिय खेलकुद","sports"]): return "sports"
 if any(x in t for x in ["एआई","आर्टिफिसियल इन्टेलिजेन्स","प्रविधि","प्रविधिक","मोबाइल","स्मार्टफोन","एप","इन्टरनेट","साइबर","कम्प्युटर","टेक"]): return "tech"
 if any(x in t for x in ["सेयर","शेयर","नेप्से","बैंक","बैंकिङ","बिमा","बीमा","अर्थतन्त्र","अर्थ","व्यवसाय","बजार","लगानी","राजस्व","कर","बजेट","मुद्रा"]): return "business"
 if any(x in t for x in ["मौसम","बाढी","पहिरो","भूकम्प","दुर्घटना","अपराध","प्रहरी","हत्या","शिक्षा","विद्यालय","स्वास्थ्य","अस्पताल","समाज","उद्धार","विपद्"]): return "society"
 if any(x in t for x in ["अमेरिका","चीन","रुस","रूस","युक्रेन","इजरायल","प्यालेस्टाइन","अन्तर्राष्ट्रिय","विदेश","विश्व","संयुक्त राष्ट्र","ट्रम्प","ईरान","इरान","बेलायत","ब्रिटेन"]): return "world"
 return "nepal"
def parse_date(v):
 try:return parsedate_to_datetime(v).isoformat()
 except:
  try:return datetime.fromisoformat(v.replace("Z","+00:00")).isoformat()
  except:return ""
def parse(src,xml):
 root=ET.fromstring(xml); out=[]; atom="{http://www.w3.org/2005/Atom}"; media="{http://search.yahoo.com/mrss/}"
 nodes=root.findall(".//item") or root.findall(".//"+atom+"entry")
 for n in nodes:
  title=node_text(n,"title") or node_text(n,atom+"title")
  link=node_text(n,"link")
  if not link:
   le=n.find(atom+"link"); link=le.get("href","") if le is not None else ""
  desc=node_text(n,"description") or node_text(n,atom+"summary") or node_text(n,atom+"content")
  pub=node_text(n,"pubDate") or node_text(n,"published") or node_text(n,"updated") or node_text(n,atom+"published") or node_text(n,atom+"updated")
  image=""
  image_candidates=[]
  for x in list(n):
   tag=x.tag.split("}")[-1].lower()
   if tag=="enclosure" and (x.get("type","").startswith("image") or x.get("url","").lower().split("?")[0].endswith((".jpg",".jpeg",".png",".webp"))):
    image_candidates.append((int(x.get("width") or 0),x.get("url","")))
   if x.tag.startswith(media+"content") and x.get("url") and ("image" in x.get("type","") or x.get("medium")=="image"):
    image_candidates.append((int(x.get("width") or 0),x.get("url","")))
   if x.tag.startswith(media+"thumbnail") and x.get("url"):
    image_candidates.append((int(x.get("width") or 0),x.get("url","")))
  if image_candidates:
   image=max(image_candidates,key=lambda z:z[0])[1]
  if not image:
   m=re.search(r'<img[^>]+src=["\']([^"\']+)',desc or "",re.I); image=m.group(1) if m else ""
  if title and link: out.append({"title":title,"link":link,"description":desc[:1600],"published":parse_date(pub),"source":src,"category":cat(title),"image":image})
 return out
items=[]
for src,url in FEEDS:
 try:
  req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 (compatible; IAmFromHetaudaNews/2.0)"})
  with urllib.request.urlopen(req,timeout=15) as r: items+=parse(src,r.read())
 except Exception as e: print("Feed failed:",src,e)

def words(s):
 return set(re.findall(r"[\u0900-\u097Fa-zA-Z0-9]{2,}",s.lower()))
def similarity(a,b):
 A,B=words(a),words(b)
 return len(A&B)/max(1,len(A|B))
def local_score(n):
 t=(n["title"]+" "+n["description"]).lower()
 return 1 if any(x in t for x in ["हेटौंडा","हेटौडा","मकवानपुर","बागमती प्रदेश","बागमती"]) else 0
def ts(n):
 try:return datetime.fromisoformat(n["published"].replace("Z","+00:00")).timestamp()
 except:return 0

# Story clustering: exact title, or strong overlap within the same category and time window.
# Generic words such as "नेपाल", "सरकार", "आज" are ignored to reduce false merges.
STOP={"नेपाल","आज","भयो","भए","गरे","गर्ने","बारे","का","को","मा","ले","बाट","एक","नयाँ","सरकार","प्रदेश","देश","the","and","for","with"}
def meaningful_words(s):
 return {w for w in words(s) if w not in STOP and len(w)>2}
def strong_similarity(a,b):
 A,B=meaningful_words(a),meaningful_words(b)
 return len(A&B)/max(1,len(A|B))
groups=[]
for n in sorted(items,key=ts,reverse=True):
 placed=False
 for g in groups:
  base=g[0]
  age_gap=abs(ts(n)-ts(base))/3600
  same_cat=n.get("category")==base.get("category")
  exact=re.sub(r"[^\w\u0900-\u097F]","",n["title"].lower())==re.sub(r"[^\w\u0900-\u097F]","",base["title"].lower())
  if exact or (same_cat and age_gap<=36 and strong_similarity(n["title"],base["title"])>=0.68):
   g.append(n); placed=True; break
 if not placed: groups.append([n])

merged=[]
now=datetime.now(timezone.utc).timestamp()
for vals in groups:
 vals.sort(key=ts,reverse=True); n=vals[0].copy()
 n["related_sources"]=list(dict.fromkeys(x["source"] for x in vals))
 n["id"]=__import__("hashlib").sha1((n["title"]+"|"+n["link"]).encode("utf-8")).hexdigest()[:16] n["source_count"]=len(n["related_sources"])
 n["verified"]=n["source_count"]>=2; n["local"]=local_score(n)==1
 age=max(0,(now-ts(n))/3600); freshness=max(0,100-age*4)
 n["score"]=round(freshness + min(n["source_count"],5)*10 + (14 if n["verified"] else 0) + (18 if n["local"] else 0) + (3 if n["image"] else 0),1)
 n["story_size"]=len(vals)
 merged.append(n)
merged.sort(key=lambda n:(n["score"],ts(n)),reverse=True)
merged=merged[:150]
today=(datetime.now(timezone.utc)+timedelta(hours=5,minutes=45)).date().isoformat()
top=[n for n in merged if ((datetime.fromtimestamp(ts(n),timezone.utc)+timedelta(hours=5,minutes=45)).date().isoformat()==today)][:8]
whatsapp="🇳🇵 आजका प्रमुख समाचार\n\n" + "\n\n".join(f"{i+1}. {n['title']}\nस्रोत: {', '.join(n['related_sources'][:3])}\n{n['link']}" for i,n in enumerate(top)) + "\n\n— I Am From Hetauda"
with open("data/news.json","w",encoding="utf-8") as f: json.dump({"updated_at":datetime.now(timezone.utc).isoformat(),"sources":[x[0] for x in FEEDS],"items":merged},f,ensure_ascii=False,indent=2)
with open("data/today-post.json","w",encoding="utf-8") as f: json.dump({"date_np":today,"generated_at":datetime.now(timezone.utc).isoformat(),"items":top,"whatsapp":whatsapp},f,ensure_ascii=False,indent=2)
print("Saved",len(merged),"stories from",len(items),"feed entries; top today:",len(top))
