import json,re,urllib.request
from xml.etree import ElementTree as ET
from datetime import datetime,timezone
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
def text(node,name):
 x=node.find(name)
 return clean(x.text if x is not None else "")
def cat(t):
 t=t.lower()
 if any(x in t for x in ["खेल","फुटबल","क्रिकेट","sports"]): return "sports"
 if any(x in t for x in ["अर्थ","बैंक","सेयर","शेयर","बजार","व्यवसाय","आर्थिक"]): return "business"
 if any(x in t for x in ["प्रविधि","टेक","मोबाइल","इन्टरनेट","एआई","कम्प्युटर"]): return "tech"
 if any(x in t for x in ["विश्व","अमेरिका","भारत","चीन","अन्तर्राष्ट्रिय","विदेश"]): return "world"
 if any(x in t for x in ["सरकार","मन्त्री","संसद","राजनीति","दल","निर्वाचन","राष्ट्रपति","प्रधानमन्त्री"]): return "politics"
 if any(x in t for x in ["समाज","शिक्षा","स्वास्थ्य","दुर्घटना","अपराध","मौसम","बाढी","पहिरो"]): return "society"
 return "nepal"
def parse_date(v):
 try:return parsedate_to_datetime(v).isoformat()
 except:
  try:return datetime.fromisoformat(v.replace("Z","+00:00")).isoformat()
  except:return datetime.now(timezone.utc).isoformat()
def parse(src,xml):
 root=ET.fromstring(xml); out=[]
 atom="{http://www.w3.org/2005/Atom}"
 nodes=root.findall(".//item") or root.findall(".//"+atom+"entry")
 for n in nodes:
  title=text(n,"title") or text(n,atom+"title")
  link=text(n,"link")
  if not link:
   le=n.find(atom+"link")
   link=le.get("href","") if le is not None else ""
  desc=text(n,"description") or text(n,atom+"summary") or text(n,atom+"content")
  pub=text(n,"pubDate") or text(n,"published") or text(n,"updated") or text(n,atom+"published") or text(n,atom+"updated")
  if title and link:
   out.append({"title":title,"link":link,"description":desc[:240],"published":parse_date(pub),"source":src,"category":cat(title+" "+desc)})
 return out
items=[]
for src,url in FEEDS:
 try:
  req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 (compatible; IAmFromHetaudaNews/1.0)"})
  with urllib.request.urlopen(req,timeout=20) as r: items+=parse(src,r.read())
 except Exception as e: print("Feed failed:",src,e)

def key(title):
 return re.sub(r"[^\w\u0900-\u097F]","",title.lower())
groups={}
for n in items:
 groups.setdefault(key(n["title"]),[]).append(n)
merged=[]
for vals in groups.values():
 vals.sort(key=lambda n:n["published"],reverse=True)
 n=vals[0].copy()
 n["related_sources"]=list(dict.fromkeys(x["source"] for x in vals))
 n["source_count"]=len(n["related_sources"])
 n["verified"]=len(n["related_sources"])>=2
 merged.append(n)
def ts(n):
 try:return datetime.fromisoformat(n["published"].replace("Z","+00:00")).timestamp()
 except:return 0
merged.sort(key=lambda n:(n["source_count"]>=2,n["source_count"],ts(n)),reverse=True)
merged=merged[:150]
with open("data/news.json","w",encoding="utf-8") as f:
 json.dump({"updated_at":datetime.now(timezone.utc).isoformat(),"sources":[x[0] for x in FEEDS],"items":merged},f,ensure_ascii=False,indent=2)
print("Saved",len(merged),"items from",len(items),"feed entries")
