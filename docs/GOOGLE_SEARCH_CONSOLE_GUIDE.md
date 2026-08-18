# 🔍 Google Search Console & Custom Domain Setup Guide

આ ગાઈડમાં આપણી **CHARUSAT AI Assistant** ને Google Search માં top ranking પર લાવવા માટેના બધા જ steps આપેલા છે.

---

## 🌟 ૧. પ્રોજેક્ટમાં શું તૈયાર કરી દીધું છે (Pre-Configured):
* **Sitemap.xml**: [`frontend/sitemap.xml`](file:///Users/neev/Documents/CHARUSAT_AI_ASSISTAN/frontend/sitemap.xml) - Googlebot માટે બધી જ લિંક્સ અને ઈમેજ ટેગ્સ તૈયાર છે.
* **Robots.txt**: [`frontend/robots.txt`](file:///Users/neev/Documents/CHARUSAT_AI_ASSISTAN/frontend/robots.txt) - Googlebot, Bingbot અને Applebot માટે crawling allow કરેલું છે.
* **JSON-LD Schema**: `schema.org` EducationalOrganization & SoftwareApplication structured data ઉમેરેલું છે.
* **Social OpenGraph**: WhatsApp, Facebook અને Twitter પર લિંક શેર કરતાં સુંદર Logo કાર્ડ દેખાશે.

---

## 🚀 ૨. Google Search Console માં Live Submit કરવાની રીત:

1. **Google Search Console ઓપન કરો**:  
   👉 [https://search.google.com/search-console](https://search.google.com/search-console)
2. **URL Prefix** સિલેક્ટ કરો અને તમારી વેબસાઇટની લિંક નાખો (e.g. `https://charusatai.in` અથવા `https://charusat-ai.onrender.com`).
3. **HTML Tag Verification**:
   - Google તમને એક `<meta name="google-site-verification" content="...">` ટેગ આપશે.
   - તે કોડ `frontend/index.html` ના `<head>` માં પેસ્ટ કરો.
4. **Sitemap Submit કરો**:
   - Search Console ના ડાબી બાજુના મેનુમાં **"Sitemaps"** પર ક્લિક કરો.
   - ત્યાં `sitemap.xml` લખીને **Submit** બટન દબાવો.
   - Googlebot ૨૪ થી ૪૮ કલાકમાં તમારી સાઈટ ક્રોલ કરીને Google Search માં બતાવવાનું શરૂ કરી દેશે!

---

## 🌐 ૩. Free Permanent Hosting & Custom Domain Options:

જો તમારે tunnel વિના ૨૪/૭ લાઈવ ચાલતી ફ્રી વેબસાઈટ બનાવવી હોય:

### Option A: Render (Free 24/7 Python + Web Hosting)
1. તમારા કોડને GitHub પર પુશ કરો.
2. [Render.com](https://render.com) પર જઈને **"New Web Service"** બનાવો.
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
👉 તમને લાઈફટાઈમ ફ્રી કાયમી URL મળી જશે (e.g. `https://charusat-ai-assistant.onrender.com`).

### Option B: Custom Domain (જેમ કે `charusatai.in` અથવા `ai.charusat.ac.in`)
1. GoDaddy / Hostinger માંથી `charusatai.in` ખરીદો (~₹199 - ₹399/year).
2. DNS Management માં જઈને **CNAME Record** ઉમેરો (જે તમારી હોસ્ટિંગ તરફ પોઇન્ટ કરે).
3. Google Search Console માં આ ડોમેઇન Verify કરાવો.

---

## 🎯 પરિણામ (Google Search Result):
જ્યારે કોઈ Google પર સર્ચ કરશે:
> **"CHARUSAT AI Assistant"** અથવા **"CHARUSAT CSPIT admission AI"**

ત્યારે Google પર આ મુજબનું સુંદર રિઝલ્ટ દેખાશે:
```text
CHARUSAT AI Assistant | Official University Intelligence Portal
https://charusatai.in
Official AI Assistant for Charotar University of Science and Technology (CHARUSAT) - NAAC 'A+' Grade University in Changa, Anand.
```
