# TableEase — Restaurant Reservation App

A responsive React + Vite restaurant discovery and table reservation application inspired by the provided design reference.

## Features
- State and city selectors populated from the provided API, with fallback options if the API is unavailable.
- Restaurant search using `GET /restaurants?state=<state>&city=<city>`.
- Restaurant results with name (`h3`), address, city, state and overall rating.
- Seven-day booking calendar, time slots, party-size selection, and confirmation screen.
- `/my-bookings` route with Upcoming, Past and All filters, plus cancellation.
- Reservations persist in `localStorage` using the required `bookings` key.
- Responsive design and Swiper carousel.
- Assessment selectors/requirements: `#state`, `#city`, `#searchBtn`, `h1` results count, `h1` My Bookings, `p` time-of-day headings and “Book FREE Reservation” button.

## Run locally
Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

Vite prints the local address, normally `http://localhost:5173`.

## Production build

```bash
npm run build
npm run preview
```

## Crio workspace notes
Copy the contents of this folder into your Crio project root (keep the existing `assessment/` folder and `run_assessment.sh` script if they are already there). Run the assessment script from that project root. After deploying, put only your deployed URL in `submit.txt`.

The restaurant API can take around 50–60 seconds to respond. If the API is asleep, allow the request time to complete.
