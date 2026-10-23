import React, { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Search, MapPin, CalendarDays, Clock3, Star, Utensils, Menu, X, ArrowRight, CheckCircle2, Users, Smartphone, Instagram, Facebook, Twitter, Heart, ArrowLeft } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { fallbackStates, fallbackCities, sampleRestaurants } from './data.js';

const API = 'https://restaurantdata.onrender.com';

const readBookings = () => {
  try {
    return JSON.parse(localStorage.getItem('bookings') || '[]');
  } catch {
    return [];
  }
};

function Header() {
  const [menu, setMenu] = useState(false);
  const loc = useLocation();

  return (
    <header className="header">
      <div className="nav wrap">
        <Link to="/" className="brand">
          <span className="brand-icon"><Utensils size={20} /></span>
          <span>table<span className="brand-blue">ease</span><small>RESTAURANT RESERVATIONS</small></span>
        </Link>
        <button className="nav-toggle" onClick={() => setMenu(!menu)} aria-label="Toggle navigation">
          {menu ? <X /> : <Menu />}
        </button>
        <nav className={menu ? 'nav-links open' : 'nav-links'}>
          <Link onClick={() => setMenu(false)} className={loc.pathname === '/' ? 'active' : ''} to="/">Home</Link>
          <a onClick={() => setMenu(false)} href="/#find">Find Restaurants</a>
          <a onClick={() => setMenu(false)} href="/#locations">Locations</a>
          <Link onClick={() => setMenu(false)} className={loc.pathname === '/my-bookings' ? 'active' : ''} to="/my-bookings">Reservations</Link>
          <Link onClick={() => setMenu(false)} className="nav-cta" to="/my-bookings">My Bookings <ArrowRight size={15} /></Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <Link to="/" className="brand footer-brand">
            <span className="brand-icon"><Utensils size={19} /></span>
            <span>table<span className="brand-blue">ease</span><small>GOOD FOOD. GREAT MOMENTS.</small></span>
          </Link>
          <p>Find your table. Make it memorable.</p>
          <div className="socials">
            <a href="#instagram" aria-label="Instagram"><Instagram size={16} /></a>
            <a href="#facebook" aria-label="Facebook"><Facebook size={16} /></a>
            <a href="#twitter" aria-label="Twitter"><Twitter size={16} /></a>
          </div>
        </div>
        <div>
          <h4>Explore</h4>
          <a href="/#find">Find restaurants</a>
          <a href="/#locations">Popular locations</a>
          <Link to="/my-bookings">My bookings</Link>
        </div>
        <div>
          <h4>Information</h4>
          <a href="#about">About us</a>
          <a href="#help">Help & support</a>
          <a href="#privacy">Privacy policy</a>
        </div>
        <div className="app-promo">
          <div className="phone-icon"><Smartphone size={27} /></div>
          <div>
            <h4>Great food is one tap away</h4>
            <p>Discover your next favourite restaurant.</p>
            <a href="#download">Explore with TableEase <ArrowRight size={14} /></a>
          </div>
        </div>
      </div>
      <div className="wrap copyright">
        © 2026 TableEase. Made for memorable meals. <span>Terms&nbsp;&nbsp; · &nbsp;&nbsp;Privacy</span>
      </div>
    </footer>
  );
}

export function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/booking/:id" element={<BookingPage />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
    </>
  );
}

function Home() {
  const [states, setStates] = useState(fallbackStates);
  const [cities, setCities] = useState(fallbackCities);
  const [state, setState] = useState('Texas');
  const [city, setCity] = useState('Austin');
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    fetch(`${API}/states`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!alive) return;
        const arr = Array.isArray(data) ? data : data.states || data.data || [];
        const names = arr.map((x) => (typeof x === 'string' ? x : x.name || x.state)).filter(Boolean);
        if (names.length) {
          const merged = [...new Set([...fallbackStates, ...names])];
          setStates(merged);
        }
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!state) return;
    let alive = true;
    fetch(`${API}/cities/${encodeURIComponent(state)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!alive) return;
        const arr = Array.isArray(data) ? data : data.cities || data.data || [];
        const names = arr.map((x) => (typeof x === 'string' ? x : x.name || x.city)).filter(Boolean);
        const next = names.length ? names : fallbackCities[state] || [];
        setCities((p) => ({ ...p, [state]: next }));
        if (next.length && !next.includes(city)) setCity(next[0]);
      })
      .catch(() => {
        if (alive) setCities((p) => ({ ...p, [state]: fallbackCities[state] || [] }));
      });
    return () => { alive = false; };
  }, [state]);

  const currentCities = cities[state] || fallbackCities[state] || [];

  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    setState(selectedState);
    const nextCities = cities[selectedState] || fallbackCities[selectedState] || [];
    setCity(nextCities[0] || '');
  };

  const search = (e) => {
    e.preventDefault();
    navigate(`/search?state=${encodeURIComponent(state)}&city=${encodeURIComponent(city)}`);
  };

  return (
    <main>
      <section className="hero">
        <div className="hero-shape shape-one" />
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> YOUR NEXT GREAT MEAL STARTS HERE</span>
            <h1>Skip the wait.<br /> <span>Reserve</span> your table.</h1>
            <p>Discover the best restaurants around you and book your perfect table in just a few clicks.</p>
            <div className="hero-points">
              <span><CheckCircle2 size={16} /> Free reservations</span>
              <span><CheckCircle2 size={16} /> Instant confirmation</span>
            </div>
            <a className="text-link" href="#find">Find your next favourite <ArrowRight size={16} /></a>
          </div>
          <div className="hero-art">
            <div className="hero-photo"><img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=90" alt="Restaurant interior" /></div>
            <div className="floating-card rating-float"><span className="float-star"><Star size={17} fill="currentColor" /></span><div><strong>4.8/5</strong><small>Guest rated</small></div></div>
            <div className="floating-card booking-float"><span className="float-check"><CheckCircle2 size={19} /></span><div><strong>Table secured!</strong><small>Your next meal awaits</small></div></div>
            <div className="art-circle" />
          </div>
        </div>
      </section>

      <section className="search-section" id="find">
        <div className="wrap">
          <div className="search-card">
            <div className="search-heading">
              <span className="search-icon"><Search size={21} /></span>
              <div><h2>Find your perfect table</h2><p>Choose your destination and we'll find the restaurants.</p></div>
            </div>
            <form className="search-form" onSubmit={search}>
              <div className="select-field custom-select-field" id="state">
                <label htmlFor="state-select">State</label>
                <div className="field-inner">
                  <MapPin size={17} />
                  <select
                    id="state-select"
                    className="select-trigger"
                    value={state}
                    onChange={handleStateChange}
                  >
                    {states.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="select-field custom-select-field" id="city">
                <label htmlFor="city-select">City</label>
                <div className="field-inner">
                  <MapPin size={17} />
                  <select
                    id="city-select"
                    className="select-trigger"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  >
                    {currentCities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button id="searchBtn" type="submit" className="btn btn-primary search-submit">
                <Search size={17} /> Search Restaurants
              </button>
            </form>
            <div className="search-note"><span /> Explore trusted local favourites and reserve at no extra cost.</div>
          </div>
        </div>
      </section>

      <section className="popular-section" id="locations">
        <div className="wrap">
          <div className="section-heading">
            <div>
              <span className="eyebrow">A TASTE OF SOMETHING GREAT</span>
              <h2>Explore popular restaurants</h2>
              <p>Handpicked places for your next special moment.</p>
            </div>
            <a href="#find" className="text-link">Find restaurants <ArrowRight size={16} /></a>
          </div>
          <Swiper modules={[Autoplay, Pagination]} spaceBetween={22} slidesPerView={1.08} breakpoints={{ 600: { slidesPerView: 2 }, 900: { slidesPerView: 3 } }} autoplay={{ delay: 4000, disableOnInteraction: false }} pagination={{ clickable: true }} className="restaurant-swiper">
            {sampleRestaurants.slice(0, 3).map((r) => (
              <SwiperSlide key={r.id}>
                <article className="featured-card">
                  <div className="featured-image">
                    <img src={r.image} alt={r.name} />
                    <span className="cuisine-tag">{r.cuisine.split(' · ')[0]}</span>
                    <span className="rating-pill"><Star size={13} fill="currentColor" />{r.overallRating}</span>
                  </div>
                  <div className="featured-info">
                    <div className="featured-title"><h3>{r.name}</h3><span>{r.price}</span></div>
                    <p><MapPin size={14} />{r.city}, {r.state}</p>
                    <div className="featured-bottom">
                      <span><Heart size={14} /> Loved by locals</span>
                      <Link to={`/booking/${r.id}`} state={{ restaurant: r }}>Book FREE Reservation <ArrowRight size={14} /></Link>
                    </div>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
    </main>
  );
}

function SearchResults() {
  const params = new URLSearchParams(useLocation().search);
  const state = params.get('state') || 'Texas';
  const city = params.get('city') || 'Austin';
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const fallback = sampleRestaurants.filter(
      (r) => r.state.toLowerCase() === state.toLowerCase() && r.city.toLowerCase() === city.toLowerCase()
    );

    fetch(`${API}/restaurants?state=${encodeURIComponent(state)}&city=${encodeURIComponent(city)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!alive) return;
        const arr = Array.isArray(data) ? data : data.restaurants || data.data || [];
        const normalized = arr.map((r, i) => ({
          ...r,
          id: String(r.id || r._id || `api-${i}`),
          name: r.name || r.restaurantName || 'Restaurant',
          address: r.address || 'Address available on request',
          city: r.city || city,
          state: r.state || state,
          overallRating: Number(r.overallRating || r.rating || 4.5),
          image: r.image || sampleRestaurants[i % sampleRestaurants.length].image,
          cuisine: r.cuisine || 'Local favourite',
          price: r.price || '$$'
        }));
        setRestaurants(normalized.length ? normalized : fallback);
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setRestaurants(fallback);
        setLoading(false);
      });

    return () => { alive = false; };
  }, [state, city]);

  return (
    <main className="page-main">
      <section className="results-banner">
        <div className="wrap">
          <div className="crumb"><Link to="/">Home</Link><span>/</span><span>Search results</span></div>
          <h1>{loading ? 'Finding restaurants…' : `${restaurants.length} restaurants available in ${city}`}</h1>
          <p>Explore local favourites in {city}, {state}.</p>
          <Link className="back-link" to="/"><ArrowLeft size={15} /> Change location</Link>
        </div>
      </section>
      <section className="results-content wrap">
        {!loading && (
          <div className="results-list">
            {restaurants.map((r, i) => (
              <RestaurantCard key={r.id || i} restaurant={r} city={city} state={state} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function RestaurantCard({ restaurant: r, city, state }) {
  const navigate = useNavigate();
  const openBooking = () => navigate(`/booking/${encodeURIComponent(r.id || r.name)}`, { state: { restaurant: r } });

  return (
    <article className="result-card">
      <div className="result-image">
        <img src={r.image || sampleRestaurants[0].image} alt={r.name} />
        <span className="result-price">{r.price || '$$'}</span>
      </div>
      <div className="result-details">
        <span className="result-cuisine">{r.cuisine || 'RESTAURANT'}</span>
        <h3>{r.name}</h3>
        <p className="address"><MapPin size={15} />{r.address}, {r.city || city}, {r.state || state}</p>
        <p className="restaurant-description">{r.description || 'A welcoming local restaurant.'}</p>
        <div className="result-meta">
          <span className="rating"><Star size={15} fill="currentColor" />{Number(r.overallRating || 4.5).toFixed(1)}</span>
        </div>
      </div>
      <div className="result-action">
        <button type="button" className="btn btn-primary mobile-toggle" onClick={openBooking}>
          Book FREE Reservation <ArrowRight size={15} />
        </button>
      </div>
    </article>
  );
}

function BookingPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('2 guests');
  const [success, setSuccess] = useState(false);

  const restaurant = location.state?.restaurant || sampleRestaurants.find((r) => r.id === id) || {
    id, name: 'Austin Bistro & Grill', address: '120 Congress Avenue', city: 'Austin', state: 'Texas', overallRating: 4.6, image: sampleRestaurants[0].image, cuisine: 'American'
  };

  const dates = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    return d;
  }), []);

  const times = ['10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'];

  const reserve = (e) => {
    e.preventDefault();
    if (!date || !time) return;
    const bookings = readBookings();
    const booking = {
      id: `booking-${Date.now()}`,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      address: restaurant.address,
      city: restaurant.city,
      state: restaurant.state,
      date,
      time,
      guests,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('bookings', JSON.stringify([booking, ...bookings]));
    setSuccess(true);
  };

  return (
    <main className="page-main booking-page">
      <div className="wrap booking-wrap">
        {success ? (
          <div className="success-panel">
            <h2>Your table is reserved!</h2>
            <p>Reservation at <strong>{restaurant.name}</strong> confirmed.</p>
            <Link className="btn btn-primary" to="/my-bookings">View my bookings</Link>
          </div>
        ) : (
          <form onSubmit={reserve}>
            <h2>Reserve your table at {restaurant.name}</h2>
            <div className="date-options">
              {dates.map((d, i) => {
                const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                return (
                  <button type="button" key={val} onClick={() => setDate(val)} className={`date-option ${date === val ? 'selected' : ''}`}>
                    {i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' })} {d.getDate()}
                  </button>
                );
              })}
            </div>
            <div className="time-options">
              {times.map((t) => (
                <button type="button" key={t} onClick={() => setTime(t)} className={`time-option ${time === t ? 'selected' : ''}`}>
                  {t}
                </button>
              ))}
            </div>
            <button type="submit" className="btn btn-primary reserve-btn" disabled={!date || !time}>
              Confirm Reservation
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

function MyBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    setBookings(readBookings());
  }, []);

  const cancelBooking = (id) => {
    const updated = bookings.filter((b) => b.id !== id);
    localStorage.setItem('bookings', JSON.stringify(updated));
    setBookings(updated);
  };

  return (
    <main className="page-main my-bookings-page">
      <div className="wrap">
        <h1>My Bookings</h1>
        {bookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          <div className="bookings-list">
            {bookings.map((b) => (
              <div key={b.id} className="booking-card-item">
                <h3>{b.restaurantName}</h3>
                <p>{b.date} at {b.time} - {b.guests}</p>
                <button className="btn btn-outline" onClick={() => cancelBooking(b.id)}>Cancel</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default App;