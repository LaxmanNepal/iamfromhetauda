import json,re,urllib.request
from xml.etree import ElementTree as ET
from datetime import datetime,timezone
from email.utils import parsedate_to_datetime
FEEDS=[("OnlineKhabar","https://www.onlinekhabar.com/feed"),("Setopati","https://www.setopati.com/feed"),("Ratopati","https://www.ratopati.com/feed"),("Khabarhub","https://khabarhub.com/feed/"),("Lokaantar","https://www.lokaantar.com/feed"),("Nepal Samaya","https://nepalsamaya.com/feed"),("Baahrakhari","https://baahrakhari.com/feed"),("Kendrabindu","https://kendrabindu.com/feed"),("Nepal Press","https://www.nepalpress.com/feed/"),("Thaha Khabar","https://thahakhabar.com/feed/"),("BBC Nepali","https://www.bbc.com/nepali/index.xml"),("Gorkhapatra Online","https://gorkhapatraonline.com/rss")]
def clean(s): return re.sub(r"\\s+"," ",re.sub(r"<[^>]+>"," ",s or "")).strip()
def cat(t):
 t=t.lower()
 if any(x in t for x in ["खेल","फुटबल","क्रिकेट","sports"]): return "sports"
 if any(x in t for x in ["अर्थ","बैंक","सेयर","शेयर","बजार","व्यवसाय","आर्थिक"]): return "business"
 if any(x in t for x in ["प्रविधि","टेक","मोबाइल","इन्टरनेट","एआई","कम्प्युटर"]): return "tech"
 if any(x in t for x in ["विश्व","अमेरिका","भारत","चीन","अन्तर्राष्ट्रिय","विदेश"]): return "world"
 if any(x in t for x in ["सरकार","मन्त्री","संसद","राजनीति","दल","निर्वाचन","राष्ट्रपति","प्रधानमन्त्री"]): return "politics"
 if any(x in t for x in ["समाज","शिक्षा","स्वास्थ्य","दुर्घटना","अपराध","मौसम","बाढी","पहिरो"]): return "society"
 return "nepal"
def parse(src,xml):
 root=ET.fromstring(xml); out=[]
 for i in root.findall(".//item"):
  t=clean(i.findtext("title")); l=clean(i.findtext("link")); d=clean(i.findtext("description"))[:220]; p=clean(i.findtext("pubDate")) or datetime.now(timezone.utc).isoformat()
  if t and l: out.append({"title":t,"link":l,"description":d,"published":p,"source":src,"category":cat(t+" "+d)})
 return out
items=[]
for src,url in FEEDS:
 try:
  q=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0"})
  with urllib.request.urlopen(q,timeout=15) as r: items+=parse(src,r.read())
 except Exception as e: print("Feed failed:",src,e)
seen=set(); u=[]
for n in items:
 k=re.sub(r"\\W+","",n["title"].lower())
 if k not in seen: seen.add(k); u.append(n)
def ts(n):
 try:return parsedate_to_datetime(n["published"]).timestamp()
 except:return 0
u.sort(key=ts,reverse=True);u=u[:120]
with open("data/news.json","w",encoding="utf-8") as f:json.dump({"updated_at":datetime.now(timezone.utc).isoformat(),"sources":[x[0] for x in FEEDS],"items":u},f,ensure_ascii=False,indent=2)
print("Saved",len(u))
