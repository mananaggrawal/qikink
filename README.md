# AI Merch Studio

An AI-powered custom merchandise store built with Next.js. Users describe a design in text, an AI generates the artwork, and they can order it printed on a t-shirt — fulfilled end-to-end by Qikink.

## How it works

1. **Design** — Describe your idea. Google Imagen 4 generates artwork, background removal cleans it up, and Vectorizer.AI traces it to a sharp vector for print.
2. **Preview** — A layered mockup editor (Fabric.js) lets you position the design on t-shirt mockup images.
3. **Checkout** — Razorpay processes payment, then the order is submitted directly to Qikink's print-on-demand API for fulfilment.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| State | Zustand |
| Image generation | Google Imagen 4 (`@google/genai`) |
| Background removal | Remove.bg API |
| Vectorization | Vectorizer.AI |
| Image hosting | Cloudinary |
| Mockup editor | Fabric.js |
| Payments | Razorpay |
| Fulfilment | Qikink print-on-demand API |
| Hosting | Railway |

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your keys (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Create `.env.local` with the following keys:

```env
# Google Imagen
GEMINI_API_KEY=

# Cloudinary (image hosting)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Remove.bg
REMOVE_BG_API_KEY=

# Vectorizer.AI
VECTORIZER_AI_API_ID=
VECTORIZER_AI_API_SECRET=

# Qikink fulfilment
QIKINK_API_URL=
QIKINK_CLIENT_ID=
QIKINK_CLIENT_SECRET=

# Razorpay payments
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

## Project structure

```
src/
  app/
    api/
      generate-image/   # Imagen 4 image generation
      remove-bg/        # Background removal
      vectorize/        # SVG vectorization
      upload-design/    # Cloudinary upload
      qikink/           # Qikink order + auth
      razorpay/         # Payment order + verification
  components/
    design/             # AI image generation + gallery
    editor/             # Fabric.js mockup editor
    order/              # Checkout form + summary
    ui/                 # Shared UI components
  hooks/                # useMockupEditor, useQikinkOrder, useRazorpay
  store/                # Zustand app state
  lib/                  # Qikink catalog, utilities
```

## Deployment

The app is deployed on [Railway](https://railway.app). Pushes to `main` trigger automatic redeployment.

Live URL: `https://zestful-radiance-production-b49e.up.railway.app`
