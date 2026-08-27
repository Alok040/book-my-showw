import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight, CircleHelp, MapPin, Play, Search, Ticket, UserRound, X } from 'lucide-react';
import { api } from './api';
import { fallbackMovies, fallbackSeats, fallbackVenues, genres } from './data';

function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('bms-user') || 'null'));

  function login(nextUser) {
    localStorage.setItem('bms-user', JSON.stringify(nextUser));
    setUser(nextUser);
    setAuthOpen(false);
  }

  function logout() {
    localStorage.removeItem('bms-user');
    setUser(null);
  }

  return (
    <div className="app-shell">
      <Header user={user} onSignIn={() => setAuthOpen(true)} onLogout={logout} />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/movie/:id" element={<MovieDetailsPage />} />
          <Route path="/movie/:movieId/shows" element={<ShowSelectionPage />} />
          <Route path="/show/:showId/seats" element={<SeatSelectionPage user={user} onSignIn={() => setAuthOpen(true)} />} />
          <Route path="/booking/:bookingId" element={<ConfirmationPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <button className="help-button" aria-label="Help"><CircleHelp size={19} /></button>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onLogin={login} />}
    </div>
  );
}

function Header({ user, onSignIn, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  function submitSearch(event) {
    event.preventDefault();
    navigate(`/movies${query.trim() ? `?search=${encodeURIComponent(query.trim())}` : ''}`);
  }

  return (
    <header className="topbar">
      <div className="brand" onClick={() => navigate('/')}>
        <span className="brand-mark">BMS</span>
        <span className="brand-name">BookMyShow</span>
      </div>
      <button className="city-picker"><MapPin size={13} /> Mumbai <ChevronDown size={13} /></button>
      <form className="search-box" onSubmit={submitSearch}>
        <Search size={15} />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search for Movies, Events, Plays, Sports and Activities" />
      </form>
      <nav className="desktop-nav">
        <Link className={location.pathname === '/movies' ? 'active' : ''} to="/movies">Movies</Link>
        <a href="#events">Events</a>
        <a href="#sports">Sports</a>
        <a href="#activities">Activities</a>
      </nav>
      {user ? (
        <button className="profile-pill" onClick={onLogout}><span>{user.name?.[0]?.toUpperCase() || 'S'}</span>{user.name || 'User'} <ChevronDown size={12} /></button>
      ) : <button className="signin" onClick={onSignIn}>Sign In</button>}
    </header>
  );
}

function MovieTabs({ selected = 'Movies' }) {
  return <div className="tabs-row">
    {['Movies', 'Events', 'Sports', 'Activities'].map(tab => <span key={tab} className={selected === tab ? 'tab-active' : ''}>{tab}</span>)}
  </div>;
}

function GenreTabs({ selected, onSelect }) {
  return <div className="genre-row">
    {genres.map(g => <button key={g} className={selected === g ? 'genre-active' : ''} onClick={() => onSelect(g)}>{g}</button>)}
  </div>;
}

function MovieCard({ movie }) {
  return <Link className="movie-card" to={`/movie/${movie.id}`}>
    <div className="poster-wrap">
      <img src={movie.posterUrl} alt={movie.title} />
      <span className="certification">{movie.certification || 'U/A'}</span>
    </div>
    <div className="movie-title">{movie.title}</div>
    <div className="rating-line"><span>★</span> {movie.rating || '7.8'} <em>·</em> {movie.votes || '45K'}</div>
    <div className="movie-meta">{(movie.genres || []).slice(0, 3).map(g => prettify(g)).join(' · ')}</div>
  </Link>;
}

function HomePage() {
  const [genre, setGenre] = useState('All');
  const [movies, setMovies] = useState(fallbackMovies);
  const [apiOnline, setApiOnline] = useState(false);

  useEffect(() => {
    api.getMovies().then(data => {
      if (Array.isArray(data)) { setMovies(data); setApiOnline(true); }
    }).catch(() => setApiOnline(false));
  }, []);

  const filtered = useMemo(() => genre === 'All' ? movies : movies.filter(m => (m.genres || []).some(g => prettify(g).toLowerCase() === genre.toLowerCase())), [genre, movies]);

  return <div className="page">
    <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, #080710 0%, rgba(8,7,16,.78) 38%, rgba(8,7,16,.15) 100%), url('/assets/fighter-backdrop.png')` }}>
      <div className="hero-content">
        <div className="eyebrow">NOW SHOWING</div>
        <div className="hero-tags"><span>Action</span><span>Drama</span><span>War</span></div>
        <h1>Fighter</h1>
        <p className="hero-sub">Action · Drama · War · 2h 46m</p>
        <div className="hero-rating"><b>★ 7.2</b><span>/10</span><span>45K votes</span><span>U/A</span></div>
        <div className="hero-actions"><Link className="primary-btn" to="/movie/3">Book Tickets</Link><button className="secondary-btn"><Play size={14} fill="currentColor" /> Trailer</button></div>
      </div>
    </section>
    <section className="content-section">
      <MovieTabs />
      <GenreTabs selected={genre} onSelect={setGenre} />
      <div className="section-heading"><h2>Now Showing</h2><Link to="/movies">See All <ChevronRight size={16} /></Link></div>
      <div className="movie-grid">{filtered.map(movie => <MovieCard key={movie.id} movie={movie} />)}</div>
      {!apiOnline && <div className="api-note">Showing the Figma demo catalogue. Connect your backend list endpoint at <code>GET /movie</code> to make this section fully API-driven.</div>}
    </section>
  </div>;
}

function MoviesPage() {
  const [genre, setGenre] = useState('All');
  const [movies, setMovies] = useState(fallbackMovies);
  const params = new URLSearchParams(useLocation().search);
  const search = (params.get('search') || '').toLowerCase();
  useEffect(() => { api.getMovies().then(data => Array.isArray(data) && setMovies(data)).catch(() => {}); }, []);
  const filtered = movies.filter(m => (genre === 'All' || (m.genres || []).some(g => prettify(g).toLowerCase() === genre.toLowerCase())) && (!search || m.title.toLowerCase().includes(search)));
  return <div className="page compact-page"><MovieTabs /><GenreTabs selected={genre} onSelect={setGenre} /><div className="section-heading"><h2>Now Showing</h2><span className="muted">{filtered.length} movies</span></div><div className="movie-grid">{filtered.map(movie => <MovieCard key={movie.id} movie={movie} />)}</div></div>;
}

function MovieDetailsPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(fallbackMovies.find(m => String(m.id) === id) || fallbackMovies[2]);
  useEffect(() => { api.getMovie(id).then(setMovie).catch(() => {}); }, [id]);
  return <div className="details-page">
    <section className="details-hero" style={{ backgroundImage: `linear-gradient(90deg, #080710 2%, rgba(8,7,16,.96) 24%, rgba(8,7,16,.54) 64%, rgba(8,7,16,.93) 100%), url('${movie.backdropUrl || movie.posterUrl}')` }}>
      <Link className="back-link" to="/movies"><ChevronLeft size={16} /> Back</Link>
      <div className="details-main">
        <img className="detail-poster" src={movie.posterUrl} alt={movie.title} />
        <div className="detail-copy">
          <div className="hero-tags">{(movie.genres || []).slice(0, 3).map(g => <span key={g}>{prettify(g)}</span>)}</div>
          <h1>{movie.title}</h1>
          <div className="detail-stats"><b>★ {movie.rating || '7.2'}</b><span>/10</span><span>{movie.votes || '45K'} votes</span><span>{movie.certification || 'U/A'}</span><span>{formatDuration(movie.durationMinutes || 166)}</span><span>{formatDate(movie.releaseDate || '2024-01-25')}</span></div>
          <div className="language-pills">{(movie.languages || ['HINDI', 'TAMIL', 'TELUGU']).map(l => <span key={l}>{prettify(l)}</span>)}</div>
          <div className="hero-actions"><Link className="primary-btn" to={`/movie/${movie.id}/shows`}>Book Tickets</Link><button className="secondary-btn"><Play size={14} fill="currentColor" /> Trailer</button></div>
        </div>
      </div>
    </section>
    <section className="details-info">
      <h2>About the Film</h2><p>{movie.description}</p>
      <h2>Cast</h2>
      <div className="cast-row">{(movie.cast || []).map((name, i) => <div className="cast-card" key={name}><div className={`avatar avatar-${i % 4}`}>{name.split(' ').map(s => s[0]).join('').slice(0, 2)}</div><span>{name}</span></div>)}</div>
    </section>
  </div>;
}

function ShowSelectionPage() {
  const { movieId } = useParams();
  const movie = fallbackMovies.find(m => String(m.id) === movieId) || fallbackMovies[2];
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 7, 26));
  const [language, setLanguage] = useState('All');
  const dates = Array.from({ length: 8 }, (_, i) => { const d = new Date(2026, 7, 26); d.setDate(d.getDate() + i); return d; });
  return <div className="shows-page compact-page">
    <div className="shows-head"><Link className="back-link" to={`/movie/${movie.id}`}><ChevronLeft size={16} /> Back</Link><h1>Select Date & Venue</h1><span>{movie.title}</span></div>
    <div className="date-row">{dates.map((d, i) => <button key={d.toISOString()} className={`date-card ${d.toDateString() === selectedDate.toDateString() ? 'date-active' : ''}`} onClick={() => setSelectedDate(d)}><small>{i === 0 ? 'Today' : d.toLocaleDateString('en-IN', { weekday: 'short' })}</small><b>{d.getDate()}</b><small>{d.toLocaleDateString('en-IN', { month: 'short' })}</small></button>)}</div>
    <div className="filter-pills"><button className={language === 'All' ? 'selected' : ''} onClick={() => setLanguage('All')}>All</button>{['Hindi', 'English'].map(l => <button key={l} className={language === l ? 'selected' : ''} onClick={() => setLanguage(l)}>{l}</button>)}</div>
    <div className="venue-list">{fallbackVenues.map(v => <VenueCard key={v.id} venue={v} language={language} />)}</div>
  </div>;
}

function VenueCard({ venue, language }) {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const shows = venue.shows.filter(s => language === 'All' || s.language === language);
  return <section className="venue-card">
    <button className="venue-header" onClick={() => setOpen(v => !v)}><div><h3>{venue.name}</h3><p>{venue.address} <span>·</span> {venue.distance}</p></div><ChevronDown className={open ? 'rotate' : ''} size={19} /></button>
    {open && <div className="show-times">{shows.map(show => <button key={show.id} className={`show-time ${show.status === 'Houseful' ? 'disabled' : ''}`} disabled={show.status === 'Houseful'} onClick={() => navigate(`/show/${show.id}/seats`, { state: { movie, venue, show } })}><b>{show.startTime}</b><span>{show.language} · {show.format}</span><small className={show.status === 'Available' ? 'available' : show.status === 'Houseful' ? 'houseful' : 'limited'}>{show.status}</small></button>)}</div>}
  </section>;
}

function SeatSelectionPage({ user, onSignIn }) {
  const { showId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const movie = location.state?.movie || fallbackMovies[2];
  const venue = location.state?.venue || fallbackVenues[0];
  const show = location.state?.show || venue.shows[0];
  const [seats, setSeats] = useState(fallbackSeats);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const grouped = useMemo(() => Object.groupBy ? Object.groupBy(seats, s => s.seatNumber[0]) : groupBy(seats, s => s.seatNumber[0]), [seats]);

  useEffect(() => {
    api.getShow(showId).catch(() => {});
  }, [showId]);

  function toggleSeat(seat) {
    if (seat.status === 'BOOKED') return;
    setSelected(current => current.some(s => s.id === seat.id) ? current.filter(s => s.id !== seat.id) : current.length < 8 ? [...current, seat] : current);
  }

  const price = selected.reduce((sum, s) => sum + seatPrice(s.seatType), 0);
  const fee = selected.length ? Math.round(price * 0.03) : 0;
  const total = price + fee;

  async function proceed() {
    if (!selected.length) return;
    if (!user) { onSignIn(); return; }
    setLoading(true);
    try {
      const booking = await api.createBooking({
        userId: Number(user.id),
        showId: Number(showId),
        seatIds: selected.map(s => Number(s.id))
      });
      navigate(`/booking/${booking.id}`, { state: { booking, movie, venue, show, selected, total } });
    } catch (error) {
      alert(`Booking failed: ${error.message}\n\nIf your backend has a different BookingController payload, update src/api.js / this request body to match it.`);
    } finally { setLoading(false); }
  }

  return <div className="seat-page">
    <div className="seat-head"><Link className="back-link" to={`/movie/${movie.id}/shows`}><ChevronLeft size={16} /> Back</Link><div><h3>{movie.title}</h3><p>{venue.name} · {show.startTime} · {show.language} · {show.format} · 28 August 2026</p></div></div>
    <div className="seat-layout">
      <div className="seat-zone">
        <div className="screen-label">ALL EYES THIS WAY — SCREEN</div>
        <SeatCategory label="GOLD PLUS" price={420} rows={grouped} selected={selected} onToggle={toggleSeat} types={['GOLD_PLUS']} />
        <SeatCategory label="EXECUTIVE" price={280} rows={grouped} selected={selected} onToggle={toggleSeat} types={['EXECUTIVE']} />
        <SeatCategory label="SILVER" price={160} rows={grouped} selected={selected} onToggle={toggleSeat} types={['SILVER']} />
      </div>
      <aside className="booking-summary">
        <h3>Booking Summary</h3><p>{movie.title}</p><p>{venue.name}</p><p>{show.startTime} · {show.format} · {show.language}</p><p>28 August 2026</p><hr />
        <label>SELECTED ({selected.length})</label><div className="selected-tags">{selected.map(s => <span key={s.id}>{s.seatNumber}</span>)}</div>
        <div className="summary-row"><span>{selected.length} × tickets</span><b>₹{price}</b></div><div className="summary-row"><span>Convenience fee</span><span>₹{fee}</span></div>
        <div className="total-row"><b>Total Payable</b><strong>₹{total}</strong></div>
        <button className="primary-btn full" disabled={!selected.length || loading} onClick={proceed}>{loading ? 'Processing…' : 'Proceed to Pay'}</button>
        <small className="powered">Powered by BookMyShow Secure Pay</small>
      </aside>
    </div>
  </div>;
}

function SeatCategory({ label, price, rows, selected, onToggle, types }) {
  const letters = Object.keys(rows).filter(letter => rows[letter].some(s => types.includes(s.seatType)));
  return <section className="seat-category"><div className="category-head"><b>{label}</b><span>₹{price}</span></div>{letters.map(letter => <div className="seat-row" key={letter}><span>{letter}</span><div className="seat-block">{rows[letter].filter(s => types.includes(s.seatType)).map(seat => <button key={seat.id} title={seat.seatNumber} className={`seat ${seat.status === 'BOOKED' ? 'booked' : ''} ${selected.some(s => s.id === seat.id) ? 'chosen' : ''}`} onClick={() => onToggle(seat)}>{seat.seatNumber.slice(1)}</button>)}</div><span>{letter}</span></div>)}</section>;
}

function ConfirmationPage() {
  const { bookingId } = useParams();
  const location = useLocation();
  const data = location.state || {};
  const [booking, setBooking] = useState(data.booking || null);
  const movie = data.movie || fallbackMovies[2];
  useEffect(() => {
    if (!booking) api.getBooking(bookingId).then(setBooking).catch(() => {});
  }, [bookingId]);

  const venue = data.venue || fallbackVenues[0];
  const show = data.show || venue.shows[0];
  const selected = data.selected || [];
  const total = data.total || booking?.totalAmount || 721;
  return <div className="confirmation-page">
    <div className="success-icon">✓</div><h1>Booking Confirmed!</h1><p>Your tickets are booked. Enjoy the show!</p>
    <article className="ticket-card">
      <div className="ticket-image" style={{ backgroundImage: `linear-gradient(90deg, rgba(5,5,14,.75), rgba(5,5,14,.18)), url('/assets/fighter-backdrop.png')` }}><h2>{movie.title}</h2><span>{movie.certification} · {formatDuration(movie.durationMinutes)} · {prettify(movie.genres?.[0] || 'Action')}</span></div>
      <div className="ticket-body"><div className="ticket-code"><span>BOOKING ID</span><b>{booking?.id ? `BMS${String(booking.id).padStart(7, '0')}` : `BMSBYJ9YFRH`}</b></div><div className="ticket-grid"><div><small>Date</small><b>28 August 2026</b></div><div><small>Show Time</small><b>{show.startTime}</b></div><div className="wide"><small>Venue</small><b>{venue.name}</b><span>{venue.address}</span></div><div><small>Format</small><b>{show.format}</b></div><div><small>Language</small><b>{show.language}</b></div></div><div className="ticket-seats"><small>SEATS ({selected.length || 2})</small><div>{(selected.length ? selected : [{ seatNumber: 'C6' }, { seatNumber: 'D6' }]).map(s => <span key={s.seatNumber}>{s.seatNumber}</span>)}</div></div><div className="ticket-footer"><button className="secondary-btn"><Ticket size={14} /> Download Ticket</button><Link className="primary-btn" to="/">Back to Home</Link></div></div>
    </article>
  </div>;
}

function AuthModal({ onClose, onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', phoneNumber: '' });
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true);
    try {
      const data = await api.createUser(
        mode === 'register'
          ? form
          : { name: form.name || 'Guest', email: form.email, password: form.password, phoneNumber: form.phoneNumber || '0000000000' }
      );
      onLogin(data || { id: 1, name: form.name || 'Guest', email: form.email });
    } catch { onLogin({ id: 1, name: form.name || 'sainialok822', email: form.email, demo: true }); }
    finally { setBusy(false); }
  }
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="auth-modal" onMouseDown={e => e.stopPropagation()}><button className="modal-close" onClick={onClose}><X size={18} /></button><div className="modal-brand"><span className="brand-mark small">BMS</span><b>BookMyShow</b></div><h2>{mode === 'login' ? 'Welcome Back!' : 'Create your account'}</h2><p>{mode === 'login' ? 'Sign in to continue booking your favourite shows.' : 'Register to manage your movie bookings.'}</p><form onSubmit={submit}>{mode === 'register' && <input placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />}<input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /><input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />{mode === 'register' && <input placeholder="Phone number" value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })} required />}<button className="primary-btn full" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}</button></form><div className="auth-switch">{mode === 'login' ? <>New to BookMyShow? <button onClick={() => setMode('register')}>Register for free</button></> : <>Already have an account? <button onClick={() => setMode('login')}>Sign in</button></>}</div></div></div>;
}

function prettify(value = '') { return String(value).replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()); }
function formatDuration(minutes) { const h = Math.floor(minutes / 60); const m = minutes % 60; return `${h}h ${m}m`; }
function formatDate(value) { return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
function seatPrice(type) { return type === 'GOLD_PLUS' ? 420 : type === 'EXECUTIVE' ? 280 : 160; }
function groupBy(items, fn) { return items.reduce((acc, item) => { const key = fn(item); (acc[key] ||= []).push(item); return acc; }, {}); }

export default App;
