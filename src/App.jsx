
import React, { useEffect, useMemo, useState } from 'react';
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  useParams,
} from 'react-router-dom';

import {
  Search,
  MapPin,
  CalendarDays,
  Clock3,
  Star,
  Utensils,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Users,
  Smartphone,
  Instagram,
  Facebook,
  Twitter,
  Heart,
  ArrowLeft,
} from 'lucide-react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

import {
  fallbackStates,
  fallbackCities,
  sampleRestaurants,
} from './data.js';

const API = 'https://restaurantdata.onrender.com';
const BOOKING_KEY = 'bookings';

function readBookings() {
  try {
    const data = JSON.parse(localStorage.getItem(BOOKING_KEY) || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveBookings(bookings) {
  localStorage.setItem(BOOKING_KEY, JSON.stringify(bookings));
}

function normalizeBooking(booking, index = 0) {
  return {
    ...booking,
    id: booking.id || `legacy-booking-${index}`,
    restaurantName:
      booking.restaurantName || booking.name || 'Restaurant',
    address: booking.address || '',
    date: booking.date || booking.bookingDate || '',
    time: booking.time || booking.bookingTime || '',
    guests: booking.guests || booking.numberOfGuests || '',
  };
}

function Header() {
  const [menu, setMenu] = useState(false);
  const location = useLocation();

  const closeMenu = () => setMenu(false);

  return (
    <header className="header">
      <div className="nav wrap">
        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="brand-icon"><Utensils size={20} /></span>
          <span>
            table<span className="brand-blue">ease</span>
            <small>RESTAURANT RESERVATIONS</small>
          </span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          onClick={() => setMenu((value) => !value)}
          aria-label="Toggle navigation"
        >
          {menu ? <X /> : <Menu />}
        </button>

        <nav className={menu ? 'nav-links open' : 'nav-links'}>
          <Link onClick={closeMenu} className={location.pathname === '/' ? 'active' : ''} to="/">
            Home
          </Link>
          <Link onClick={closeMenu} to="/#find">Find Restaurants</Link>
          <Link onClick={closeMenu} to="/#locations">Locations</Link>
          <Link
            onClick={closeMenu}
            className={location.pathname === '/my-bookings' ? 'active' : ''}
            to="/my-bookings"
          >
            Reservations
          </Link>
          <Link onClick={closeMenu} className="nav-cta" to="/my-bookings">
            My Bookings <ArrowRight size={15} />
          </Link>
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
            <span>
              table<span className="brand-blue">ease</span>
              <small>GOOD FOOD. GREAT MOMENTS.</small>
            </span>
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
          <Link to="/search?state=Texas&city=Austin">Find restaurants</Link>
          <Link to="/#locations">Popular locations</Link>
          <Link to="/my-bookings">My bookings</Link>
        </div>

        <div>
          <h4>Information</h4>
          <a href="#about">About us</a>
          <a href="#help">Help &amp; support</a>
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
        © 2026 TableEase. Made for memorable meals.
        <span>Terms&nbsp;&nbsp; · &nbsp;&nbsp;Privacy</span>
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
  const [showStates, setShowStates] = useState(false);
  const [showCities, setShowCities] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;

    fetch(`${API}/states`)
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load states');
        return response.json();
      })
      .then((data) => {
        if (!alive) return;

        const list = Array.isArray(data)
          ? data
          : data.states || data.data || [];

        const names = list
          .map((item) => typeof item === 'string' ? item : item.name || item.state)
          .filter(Boolean);

        if (names.length) {
          setStates([...new Set([...fallbackStates, ...names])]);
        }
      })
      .catch(() => {});

    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!state) return undefined;

    let alive = true;

    fetch(`${API}/cities/${encodeURIComponent(state)}`)
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load cities');
        return response.json();
      })
      .then((data) => {
        if (!alive) return;

        const list = Array.isArray(data)
          ? data
          : data.cities || data.data || [];

        const names = list
          .map((item) => typeof item === 'string' ? item : item.name || item.city)
          .filter(Boolean);

        const next = names.length ? names : (fallbackCities[state] || []);

        setCities((previous) => ({ ...previous, [state]: next }));
        setCity((previous) => next.includes(previous) ? previous : next[0] || '');
      })
      .catch(() => {
        if (!alive) return;

        const next = fallbackCities[state] || [];
        setCities((previous) => ({ ...previous, [state]: next }));
        setCity((previous) => next.includes(previous) ? previous : next[0] || '');
      });

    return () => { alive = false; };
  }, [state]);

  const currentCities = cities[state] || fallbackCities[state] || [];

  const search = (event) => {
    event.preventDefault();
    navigate(`/search?state=${encodeURIComponent(state)}&city=${encodeURIComponent(city)}`);
  };

  return (
    <main>
      <section className="hero">
        <div className="hero-shape shape-one" />
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              YOUR NEXT GREAT MEAL STARTS HERE
            </span>

            <h1>Skip the wait.<br /><span>Reserve</span> your table.</h1>
            <p>Discover the best restaurants around you and book your perfect table in just a few clicks.</p>

            <div className="hero-points">
              <span><CheckCircle2 size={16} /> Free reservations</span>
              <span><CheckCircle2 size={16} /> Instant confirmation</span>
            </div>

            <a className="text-link" href="#find">
              Find your next favourite <ArrowRight size={16} />
            </a>
          </div>

          <div className="hero-art">
            <div className="hero-photo">
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=90"
                alt="Restaurant interior"
              />
            </div>
            <div className="floating-card rating-float">
              <span className="float-star"><Star size={17} fill="currentColor" /></span>
              <div><strong>4.8/5</strong><small>Guest rated</small></div>
            </div>
            <div className="floating-card booking-float">
              <span className="float-check"><CheckCircle2 size={19} /></span>
              <div><strong>Table secured!</strong><small>Your next meal awaits</small></div>
            </div>
            <div className="art-circle" />
          </div>
        </div>
      </section>

      <section className="search-section" id="find">
        <div className="wrap">
          <div className="search-card">
            <div className="search-heading">
              <span className="search-icon"><Search size={21} /></span>
              <div>
                <h2>Find your perfect table</h2>
                <p>Choose your destination and we'll find the restaurants.</p>
              </div>
            </div>

            <form className="search-form" onSubmit={search}>
              <div className="select-field custom-select-field" id="state">
                <label>State</label>
                <div
                  className="field-inner"
                  onClick={() => { setShowStates((v) => !v); setShowCities(false); }}
                >
                  <MapPin size={17} />
                  <button
                    type="button"
                    id="state-select"
                    className="select-trigger"
                    aria-label="State"
                    aria-expanded={showStates}
                  >
                    {state || 'Select State'} <ChevronDown size={16} />
                  </button>
                </div>

                {showStates && (
                  <ul className="dropdown-options" role="listbox">
                    {states.map((item) => (
                      <li
                        key={item}
                        role="option"
                        aria-selected={state === item}
                        onClick={(event) => {
                          event.stopPropagation();
                          setState(item);
                          setCity((cities[item] || fallbackCities[item] || [])[0] || '');
                          setShowStates(false);
                        }}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="select-field custom-select-field" id="city">
                <label>City</label>
                <div
                  className="field-inner"
                  onClick={() => { setShowCities((v) => !v); setShowStates(false); }}
                >
                  <MapPin size={17} />
                  <button
                    type="button"
                    id="city-select"
                    className="select-trigger"
                    aria-label="City"
                    aria-expanded={showCities}
                  >
                    {city || 'Select City'} <ChevronDown size={16} />
                  </button>
                </div>

                {showCities && (
                  <ul className="dropdown-options" role="listbox">
                    {currentCities.map((item) => (
                      <li
                        key={item}
                        role="option"
                        aria-selected={city === item}
                        onClick={(event) => {
                          event.stopPropagation();
                          setCity(item);
                          setShowCities(false);
                        }}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button id="searchBtn" type="submit" className="btn btn-primary search-submit">
                <Search size={17} /> Search Restaurants
              </button>
            </form>

            <div className="search-note">
              <span /> Explore trusted local favourites and reserve at no extra cost.
            </div>
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
            <a href="#find" className="text-link">
              Find restaurants <ArrowRight size={16} />
            </a>
          </div>

          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={22}
            slidesPerView={1.08}
            breakpoints={{ 600: { slidesPerView: 2 }, 900: { slidesPerView: 3 } }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            className="restaurant-swiper"
          >
            {sampleRestaurants.slice(0, 3).map((restaurant) => (
              <SwiperSlide key={restaurant.id}>
                <article className="featured-card">
                  <div className="featured-image">
                    <img src={restaurant.image} alt={restaurant.name} />
                    <span className="cuisine-tag">{(restaurant.cuisine || 'Restaurant').split(' · ')[0]}</span>
                    <span className="rating-pill">
                      <Star size={13} fill="currentColor" />{restaurant.overallRating}
                    </span>
                  </div>
                  <div className="featured-info">
                    <div className="featured-title">
                      <h3>{restaurant.name}</h3><span>{restaurant.price}</span>
                    </div>
                    <p><MapPin size={14} />{restaurant.city}, {restaurant.state}</p>
                    <div className="featured-bottom">
                      <span><Heart size={14} /> Loved by locals</span>
                      <Link to={`/booking/${encodeURIComponent(restaurant.id)}`} state={{ restaurant }}>
                        Book FREE Reservation <ArrowRight size={14} />
                      </Link>
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
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const state = params.get('state') || 'Texas';
  const city = params.get('city') || 'Austin';

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const fallback = sampleRestaurants.filter((restaurant) =>
      String(restaurant.state || '').toLowerCase() === state.toLowerCase() &&
      String(restaurant.city || '').toLowerCase() === city.toLowerCase()
    );

    setRestaurants(fallback);
    setLoading(true);

    fetch(`${API}/restaurants?state=${encodeURIComponent(state)}&city=${encodeURIComponent(city)}`)
      .then((response) => {
        if (!response.ok) throw new Error('Restaurant request failed');
        return response.json();
      })
      .then((data) => {
        if (!alive) return;

        const list = Array.isArray(data)
          ? data
          : data.restaurants || data.data || [];

        const normalized = list.map((item, index) => ({
          ...item,
          id: String(item.id || item._id || `api-${index}`),
          name: item.name || item.restaurantName || 'Restaurant',
          address: item.address || 'Address available on request',
          city: item.city || city,
          state: item.state || state,
          overallRating: Number(item.overallRating || item.rating || 4.5),
          image: item.image || sampleRestaurants[index % Math.max(sampleRestaurants.length, 1)]?.image || '',
          cuisine: item.cuisine || 'Local favourite',
          price: item.price || '$$',
          description: item.description || 'A welcoming local restaurant.',
        }));

        setRestaurants(normalized.length ? normalized : fallback);
      })
      .catch(() => {
        if (alive) setRestaurants(fallback);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => { alive = false; };
  }, [state, city]);

  return (
    <main className="page-main">
      <section className="results-banner">
        <div className="wrap">
          <div className="crumb">
            <Link to="/">Home</Link><span>/</span><span>Search results</span>
          </div>
          <h1>
            {loading ? 'Finding restaurants…' : `${restaurants.length} restaurants available in ${city}`}
          </h1>
          <p>Explore local favourites in {city}, {state}.</p>
          <Link className="back-link" to="/"><ArrowLeft size={15} /> Change location</Link>
        </div>
      </section>

      <section className="results-content wrap">
        {loading ? (
          <p role="status">Loading restaurants...</p>
        ) : restaurants.length === 0 ? (
          <p>No restaurants found in {city}, {state}.</p>
        ) : (
          <div className="results-list">
            {restaurants.map((restaurant, index) => (
              <RestaurantCard key={restaurant.id || index} restaurant={restaurant} city={city} state={state} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function RestaurantCard({ restaurant, city, state }) {
  const navigate = useNavigate();

  const openBooking = () => {
    const id = restaurant.id || restaurant._id || restaurant.name;
    navigate(`/booking/${encodeURIComponent(id)}`, { state: { restaurant } });
  };

  return (
    <article className="result-card">
      <div className="result-image">
        <img src={restaurant.image || sampleRestaurants[0]?.image} alt={restaurant.name} />
        <span className="result-price">{restaurant.price || '$$'}</span>
      </div>

      <div className="result-details">
        <span className="result-cuisine">{restaurant.cuisine || 'RESTAURANT'}</span>
        <h3>{restaurant.name}</h3>
        <p className="address">
          <MapPin size={15} />
          {restaurant.address || 'Address available on request'}, {restaurant.city || city}, {restaurant.state || state}
        </p>
        <p className="restaurant-description">
          {restaurant.description || 'A welcoming local restaurant.'}
        </p>
        <div className="result-meta">
          <span className="rating">
            <Star size={15} fill="currentColor" />
            {Number(restaurant.overallRating || restaurant.rating || 4.5).toFixed(1)}
          </span>
          <span>Overall rating</span>
          <span className="free-reservation"><CheckCircle2 size={13} /> Free reservation</span>
        </div>
      </div>

      <div className="result-action">
        <div className="result-action-heading"><Users size={14} /> Great for your next meal</div>
        <button type="button" className="btn btn-primary mobile-toggle" onClick={openBooking}>
          Book FREE Reservation <ArrowRight size={15} />
        </button>
        <small>No booking fees. Ever.</small>
      </div>
    </article>
  );
}

function BookingPage() {
  const { id } = useParams();
  const location = useLocation();

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('2 guests');
  const [success, setSuccess] = useState(false);

  const restaurant = location.state?.restaurant ||
    sampleRestaurants.find((item) => String(item.id) === String(id)) || {
      id,
      name: 'Austin Bistro & Grill',
      address: '120 Congress Avenue',
      city: 'Austin',
      state: 'Texas',
      overallRating: 4.6,
      image: sampleRestaurants[0]?.image,
      cuisine: 'American',
    };

  const dates = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() + index);
    return day;
  }), []);

  const timeGroups = {
    Morning: ['10:00 AM', '11:00 AM'],
    Afternoon: ['12:00 PM', '1:00 PM'],
    Evening: ['5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'],
  };

  const reserve = (event) => {
    event.preventDefault();
    if (!date || !time) return;

    const booking = {
      id: `booking-${Date.now()}`,
      restaurantId: String(restaurant.id || id),
      restaurantName: restaurant.name,
      address: restaurant.address || '',
      city: restaurant.city || '',
      state: restaurant.state || '',
      date,
      time,
      bookingDate: date,
      bookingTime: time,
      guests,
      createdAt: new Date().toISOString(),
    };

    saveBookings([booking, ...readBookings()]);
    setSuccess(true);
  };

  return (
    <main className="page-main booking-page">
      <div className="wrap booking-wrap">
        {success ? (
          <div className="success-panel">
            <CheckCircle2 size={45} />
            <h2>Your table is reserved!</h2>
            <p>Your reservation at <strong>{restaurant.name}</strong> has been saved.</p>
            <Link className="btn btn-primary" to="/my-bookings">View my bookings</Link>
          </div>
        ) : (
          <form onSubmit={reserve}>
            <Link className="back-link" to="/search?state=Texas&city=Austin">
              <ArrowLeft size={15} /> Back to restaurants
            </Link>

            <h2>Reserve your table at {restaurant.name}</h2>
            <p><MapPin size={15} /> {restaurant.address}{restaurant.city ? `, ${restaurant.city}` : ''}</p>

            <h3><CalendarDays size={18} /> Choose a date</h3>
            <div className="date-options">
              {dates.map((day, index) => {
                const value = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;

                return (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setDate(value)}
                    className={`date-option ${date === value ? 'selected' : ''}`}
                    aria-pressed={date === value}
                  >
                    <span>{index === 0 ? 'Today' : day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <strong>{day.getDate()}</strong>
                  </button>
                );
              })}
            </div>

            <h3><Clock3 size={18} /> Choose a time</h3>
            {Object.entries(timeGroups).map(([period, slots]) => (
              <section className="time-period" key={period}>
                <p>{period}</p>
                <div className="time-options">
                  {slots.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setTime(slot)}
                      className={`time-option ${time === slot ? 'selected' : ''}`}
                      aria-pressed={time === slot}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </section>
            ))}

            <h3><Users size={18} /> Number of guests</h3>
            <select value={guests} onChange={(event) => setGuests(event.target.value)} aria-label="Number of guests">
              {['1 guest', '2 guests', '3 guests', '4 guests', '5 guests', '6 guests', '7 guests', '8 guests'].map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>

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
  const [bookings, setBookings] = useState(() =>
    readBookings().map((booking, index) => normalizeBooking(booking, index))
  );

  useEffect(() => {
    const refresh = () => {
      setBookings(readBookings().map((booking, index) => normalizeBooking(booking, index)));
    };

    window.addEventListener('storage', refresh);
    window.addEventListener('bookingsUpdated', refresh);

    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('bookingsUpdated', refresh);
    };
  }, []);

  const cancelBooking = (bookingToCancel) => {
    const allBookings = readBookings();

    const updated = allBookings.filter((booking) => {
      if (booking.id && bookingToCancel.originalId) {
        return booking.id !== bookingToCancel.originalId;
      }

      return !(
        booking.restaurantName === bookingToCancel.restaurantName &&
        (booking.date || booking.bookingDate || '') === bookingToCancel.date &&
        (booking.time || booking.bookingTime || '') === bookingToCancel.time
      );
    });

    saveBookings(updated);
    setBookings(updated.map((booking, index) => normalizeBooking(booking, index)));
  };

  return (
    <main className="page-main my-bookings-page">
      <div className="wrap">
        <h1>My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="empty-bookings">
            <CalendarDays size={38} />
            <h2>No bookings found.</h2>
            <p>Discover a restaurant and reserve your table.</p>
            <Link className="btn btn-primary" to="/search?state=Texas&city=Austin">
              Find Restaurants <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking, index) => (
              <div key={booking.id || `${booking.restaurantName}-${index}`} className="booking-card-item">
                <h3>{booking.restaurantName}</h3>

                {booking.address && <p>{booking.address}</p>}

                {booking.date && (
                  <p><CalendarDays size={15} /> {booking.date}</p>
                )}

                {booking.time && (
                  <p><Clock3 size={15} /> {booking.time}</p>
                )}

                {booking.guests && (
                  <p><Users size={15} /> {booking.guests}</p>
                )}

                {booking.bookingEmail && <p>{booking.bookingEmail}</p>}

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => cancelBooking({
                    ...booking,
                    originalId: readBookings()[index]?.id,
                  })}
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
