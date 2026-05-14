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
| Background removal | ImageKit (`e-bgremove` transformation) |
| Vectorization | Potrace (on-server, free) |
| Image hosting | ImageKit |
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

# ImageKit (image hosting + background removal)
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=   # https://ik.imagekit.io/your_id

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
