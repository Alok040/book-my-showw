import { useEffect, useMemo, useState } from 'react';
import {
  Routes, Route, Link, NavLink, useNavigate, useLocation, useParams
} from 'react-router-dom';
import {
  CalendarDays, ChevronLeft, ChevronRight, Clock3, Film, LayoutDashboard,
  LogOut, MapPin, Pencil, Plus, Search, ShieldCheck, Ticket, Trash2,
  UserRound, X, Armchair
} from 'lucide-react';
import { api, API_BASE, clearCredentials, hasCredentials, setCredentials } from './api';

const FALLBACK_POSTER = '/poster-placeholder.svg';

function pretty(value = '') {
  return String(value).replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function posterUrl(movie) {
  if (!movie?.posterUrl) return FALLBACK_POSTER;
  if (movie.posterUrl.startsWith('http')) return movie.posterUrl;
  return `${API_BASE}${movie.posterUrl}`;
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

function formatTime(value) {
  if (!value) return '—';
  return value.slice(0, 5);
}

function movieShows(shows, movieId) {
  return shows.filter(s => Number(s.movie?.id) === Number(movieId));
}

function App() {
  return (
    <Routes>
      <Route path="/*" element={<CustomerApp />} />
      <Route path="/admin/*" element={<AdminApp />} />
    </Routes>
  );
}

function CustomerApp() {
  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const [m, s] = await Promise.all([api.getMovies(), api.getShows()]);
      setMovies(Array.isArray(m) ? m : []);
      setShows(Array.isArray(s) ? s : []);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="app">
      <CustomerHeader />
      {error && <div className="global-error">{error}</div>}
      <Routes>
        <Route path="/" element={<Home movies={movies} shows={shows} loading={loading} />} />
        <Route path="/movies" element={<Movies movies={movies} shows={shows} />} />
        <Route path="/movie/:id" element={<MovieDetails movies={movies} shows={shows} />} />
        <Route path="/movie/:movieId/shows" element={<ShowsForMovie movies={movies} shows={shows} />} />
        <Route path="/show/:showId/seats" element={<SeatPage />} />
        <Route path="/booking/:id" element={<BookingConfirmation />} />
        <Route path="/login" element={<CustomerLogin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function CustomerHeader() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  function submit(e) {
    e.preventDefault();
    navigate(`/movies${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`);
  }

  return (
    <header className="customer-header">
      <button className="logo" onClick={() => navigate('/')}>
        <span>BMS</span> BookMyShow
      </button>
      <div className="city"><MapPin size={15}/> Mumbai</div>
      <form className="search" onSubmit={submit}>
        <Search size={17}/>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search movies, shows..." />
      </form>
      <nav>
        <NavLink to="/movies">Movies</NavLink>
        <a href="#about">About</a>
        <NavLink to="/login">Sign In</NavLink>
      </nav>
    </header>
  );
}

function Home({ movies, shows, loading }) {
  if (!loading && movies.length === 0) return <EmptyMovies />;
  const activeMovies = movies.filter(m => movieShows(shows, m.id).length > 0);
  return (
    <>
      <section className="hero">
        <div>
          <span className="eyebrow">BOOK YOUR NEXT EXPERIENCE</span>
          <h1>Movies. Shows.<br/><strong>Your seats.</strong></h1>
          <p>Choose a movie, select a show, pick your seats and book.</p>
          <Link className="btn primary" to="/movies">Explore Movies <ChevronRight size={17}/></Link>
        </div>
      </section>
      <section className="customer-section">
        <SectionTitle title="Now Showing" action={<Link to="/movies">See all <ChevronRight size={15}/></Link>} />
        {activeMovies.length === 0
          ? <NoShowsState compact />
          : <MovieGrid movies={activeMovies.slice(0, 8)} shows={shows}/>}
      </section>
      {movies.length > activeMovies.length && (
        <section className="customer-section">
          <SectionTitle title="Coming Soon" />
          <MovieGrid movies={movies.filter(m => !movieShows(shows, m.id)).slice(0, 8)} shows={shows}/>
        </section>
      )}
    </>
  );
}

function EmptyMovies() {
  return (
    <div className="empty-page">
      <div className="empty-icon"><Film size={38}/></div>
      <h1>No movies available</h1>
      <p>There are currently no movies in the catalogue. Please check again later.</p>
    </div>
  );
}

function Movies({ movies, shows }) {
  const params = new URLSearchParams(useLocation().search);
  const q = (params.get('q') || '').toLowerCase();
  const [filter, setFilter] = useState('All');

  const genres = ['All', ...new Set(movies.flatMap(m => m.genres || []).map(pretty))];
  const filtered = movies.filter(m =>
    (!q || m.title.toLowerCase().includes(q)) &&
    (filter === 'All' || (m.genres || []).some(g => pretty(g) === filter))
  );

  return (
    <section className="customer-section page-top">
      <SectionTitle title="Movies" />
      <div className="chips">
        {genres.map(g => <button key={g} className={filter === g ? 'selected' : ''} onClick={() => setFilter(g)}>{g}</button>)}
      </div>
      {filtered.length ? <MovieGrid movies={filtered} shows={shows}/> : <NoMoviesSearch />}
    </section>
  );
}

function MovieGrid({ movies, shows }) {
  return <div className="movie-grid">
    {movies.map(movie => <MovieCard key={movie.id} movie={movie} hasShows={movieShows(shows, movie.id).length > 0}/>)}
  </div>;
}

function MovieCard({ movie, hasShows }) {
  return (
    <Link className="movie-card" to={`/movie/${movie.id}`}>
      <div className="poster"><img src={posterUrl(movie)} alt={movie.title}/></div>
      <h3>{movie.title}</h3>
      <div className="muted">{(movie.genres || []).slice(0, 2).map(pretty).join(' · ') || 'Movie'}</div>
      <div className="card-bottom">
        <span>{formatDate(movie.releaseDate)}</span>
        <span className={hasShows ? 'available-text' : 'muted'}>{hasShows ? 'Shows available' : 'No shows yet'}</span>
      </div>
    </Link>
  );
}

function MovieDetails({ movies, shows }) {
  const { id } = useParams();
  const movie = movies.find(m => Number(m.id) === Number(id));
  if (!movie) return <NotFound />;
  const relatedShows = movieShows(shows, movie.id);
  return (
    <section className="details">
      <Link className="back" to="/movies"><ChevronLeft size={17}/> Back to movies</Link>
      <div className="detail-layout">
        <img className="detail-poster" src={posterUrl(movie)} alt={movie.title}/>
        <div className="detail-copy">
          <div className="tag-row">{(movie.genres || []).map(g => <span key={g}>{pretty(g)}</span>)}</div>
          <h1>{movie.title}</h1>
          <div className="stats">
            <span><Clock3 size={15}/> {movie.durationMinutes} min</span>
            <span><CalendarDays size={15}/> {formatDate(movie.releaseDate)}</span>
          </div>
          <p>Languages: {(movie.languages || []).map(pretty).join(', ') || '—'}</p>
          <p>Cast: {(movie.cast || []).join(', ') || '—'}</p>
          {relatedShows.length
            ? <Link className="btn primary" to={`/movie/${movie.id}/shows`}>Select Showtimes <ChevronRight size={17}/></Link>
            : <NoShowsState movie={movie}/>}
        </div>
      </div>
    </section>
  );
}

function ShowsForMovie({ movies, shows }) {
  const { movieId } = useParams();
  const movie = movies.find(m => Number(m.id) === Number(movieId));
  const list = movieShows(shows, movieId);

  if (!movie) return <NotFound />;

  return (
    <section className="customer-section page-top">
      <Link className="back" to={`/movie/${movie.id}`}><ChevronLeft size={17}/> Back</Link>
      <SectionTitle title={`Choose a show — ${movie.title}`} />
      {!list.length ? <NoShowsState movie={movie}/> : (
        <div className="show-list">
          {list.sort((a,b) => `${a.showDate}${a.startTime}`.localeCompare(`${b.showDate}${b.startTime}`)).map(show => (
            <Link key={show.id} className="show-card" to={`/show/${show.id}/seats`}>
              <div><b>{formatDate(show.showDate)}</b><span>{formatTime(show.startTime)} – {formatTime(show.endTime)}</span></div>
              <div><strong>{show.screen?.screenName || `Screen ${show.screen?.id || ''}`}</strong><span>{show.screen?.venue?.name || 'Venue'}</span></div>
              <ChevronRight/>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function NoShowsState({ movie, compact = false }) {
  return (
    <div className={`no-shows ${compact ? 'compact' : ''}`}>
      <CalendarDays size={28}/>
      <div>
        <h3>No shows available</h3>
        <p>{movie ? `There are no shows scheduled for ${movie.title} yet. Please check back later.` : 'No shows are currently scheduled.'}</p>
      </div>
    </div>
  );
}

function NoMoviesSearch() {
  return <div className="empty-inline"><Search size={25}/><h3>No movies found</h3><p>Try another search or genre.</p></div>;
}

function CustomerLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({username: 'user', password: 'user123'});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function login(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      setCredentials(form.username, form.password);
      await api.getMovies();
      sessionStorage.setItem('bms-customer-user', form.username);
      navigate('/');
    } catch (err) {
      clearCredentials();
      setError('Invalid customer credentials or backend is unavailable.');
    } finally { setBusy(false); }
  }

  return <AuthLayout title="Customer Sign In" subtitle="Sign in to continue to booking.">
    <form onSubmit={login} className="form">
      <label>Username<input value={form.username} onChange={e => setForm({...form, username:e.target.value})}/></label>
      <label>Password<input type="password" value={form.password} onChange={e => setForm({...form, password:e.target.value})}/></label>
      {error && <div className="form-error">{error}</div>}
      <button className="btn primary full" disabled={busy}>{busy ? 'Signing in…' : 'Sign In'}</button>
    </form>
  </AuthLayout>;
}

function SeatPage() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [booked, setBooked] = useState(new Set());
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const customer = sessionStorage.getItem('bms-customer-user');

  useEffect(() => {
    (async () => {
      try {
        const s = await api.getShow(showId);
        setShow(s);
        try {
          const bookings = await api.getShowBookings(showId);
          const ids = new Set();
          (Array.isArray(bookings) ? bookings : []).forEach(b =>
            (b.bookingList || []).forEach(bs => ids.add(Number(bs.seat?.id)))
          );
          setBooked(ids);
        } catch (e) {
          // Until /booking/show/{showId} exists, show seats remain selectable.
          setError('Seat availability endpoint is not available yet. Booking itself is still protected by the backend.');
        }
      } catch (e) {
        setError(e.message);
      } finally { setLoading(false); }
    })();
  }, [showId]);

  if (loading) return <Loading />;
  if (!show) return <NotFound />;

  const seats = show.screen?.seatList || [];
  const selectedIds = new Set(selected.map(Number));
  const grouped = seats.reduce((a,s) => {
    const row = String(s.seatNumber || '').match(/^[A-Za-z]+/)?.[0] || 'A';
    (a[row] ||= []).push(s); return a;
  }, {});

  function toggle(seat) {
    if (booked.has(Number(seat.id))) return;
    setSelected(current => current.some(s => s.id === seat.id)
      ? current.filter(s => s.id !== seat.id)
      : current.length < 8 ? [...current, seat] : current);
  }

  async function book() {
    if (!selected.length) return;
    if (!customer) { navigate('/login'); return; }
    try {
      // Current backend expects a DB user id, not username. Replace this with
      // your authenticated customer's DB id when you move customer auth to DB.
      const userId = Number(sessionStorage.getItem('bms-user-id') || 0);
      if (!userId) throw new Error('Customer account is not linked to a database user yet.');
      const booking = await api.createBooking({ userId, showId:Number(showId), seatIds:selected.map(s=>Number(s.id)) });
      navigate(`/booking/${booking.id}`, { state:{ booking, show } });
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <section className="seat-page">
      <Link className="back" to={`/movie/${show.movie?.id}/shows`}><ChevronLeft size={17}/> Back to shows</Link>
      <div className="seat-header">
        <div><h1>{show.movie?.title}</h1><p>{formatDate(show.showDate)} · {formatTime(show.startTime)} · {show.screen?.screenName}</p></div>
        <div className="seat-legend"><span><i className="seat available"></i>Available</span><span><i className="seat selected"></i>Selected</span><span><i className="seat booked"></i>Booked</span></div>
      </div>
      {error && <div className="notice">{error}</div>}
      <div className="seat-stage">SCREEN</div>
      <div className="seat-map">
        {Object.entries(grouped).map(([row, rowSeats]) => (
          <div className="seat-row" key={row}>
            <b>{row}</b>
            {rowSeats.sort((a,b)=>String(a.seatNumber).localeCompare(String(b.seatNumber),undefined,{numeric:true})).map(seat => {
              const isBooked = booked.has(Number(seat.id));
              const isSelected = selectedIds.has(Number(seat.id));
              return <button key={seat.id} disabled={isBooked} title={`${seat.seatNumber} · ${pretty(seat.seatType)}`}
                className={`seat ${isBooked?'booked':''} ${isSelected?'selected':''}`} onClick={()=>toggle(seat)}>
                {String(seat.seatNumber).replace(/^[A-Za-z]+/,'')}
              </button>;
            })}
            <b>{row}</b>
          </div>
        ))}
      </div>
      <div className="booking-bar">
        <div><small>SELECTED SEATS</small><b>{selected.length ? selected.map(s=>s.seatNumber).join(', ') : 'None'}</b></div>
        <button className="btn primary" disabled={!selected.length} onClick={book}>Proceed to Pay <Ticket size={16}/></button>
      </div>
    </section>
  );
}

function BookingConfirmation() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  useEffect(() => { api.getBooking(id).then(setBooking).catch(()=>{}); }, [id]);
  return <section className="confirmation">
    <div className="success">✓</div><h1>Booking Confirmed</h1>
    <p>Your booking has been created successfully.</p>
    <div className="ticket">
      <span>BOOKING ID</span><strong>BMS{String(id).padStart(7,'0')}</strong>
      <hr/>
      <p>Movie: <b>{booking?.show?.movie?.title || '—'}</b></p>
      <p>Show: <b>{formatDate(booking?.show?.showDate)} · {formatTime(booking?.show?.startTime)}</b></p>
      <p>Status: <b>{booking?.bookingStatus || 'CONFIRMED'}</b></p>
    </div>
    <Link className="btn primary" to="/">Back to Home</Link>
  </section>;
}

function AdminApp() {
  const [auth, setAuth] = useState(() => hasCredentials());
  const [adminChecked, setAdminChecked] = useState(false);
  const [error, setError] = useState('');

  async function verify() {
    try {
      await api.checkAdmin();
      setAdminChecked(true);
      setError('');
    } catch (e) {
      setAdminChecked(false);
      setError(e.status === 403 ? 'This account is authenticated but is not an ADMIN.' : 'Admin authentication failed.');
      clearCredentials();
    }
  }

  useEffect(() => { if (auth) verify(); }, [auth]);

  function logout() {
    clearCredentials();
    setAuth(false);
    setAdminChecked(false);
  }

  if (!auth || !adminChecked) {
    return <AdminLogin initialError={error} onSuccess={() => setAuth(true)} />;
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand"><ShieldCheck/> BMS Admin</div>
        <nav>
          <NavLink end to="/admin/dashboard"><LayoutDashboard/> Dashboard</NavLink>
          <NavLink to="/admin/movies"><Film/> Movies</NavLink>
          <NavLink to="/admin/shows"><CalendarDays/> Shows</NavLink>
        </nav>
        <button className="logout" onClick={logout}><LogOut/> Logout</button>
      </aside>
      <main className="admin-main">
        <Routes>
          <Route path="/dashboard" element={<AdminDashboard/>}/>
          <Route path="/movies" element={<AdminMovies/>}/>
          <Route path="/movies/new" element={<MovieForm/>}/>
          <Route path="/movies/:id/edit" element={<MovieForm/>}/>
          <Route path="/shows" element={<AdminShows/>}/>
          <Route path="/shows/new" element={<ShowForm/>}/>
          <Route path="/shows/:id/edit" element={<ShowForm/>}/>
          <Route path="*" element={<AdminDashboard/>}/>
        </Routes>
      </main>
    </div>
  );
}

function AdminLogin({ initialError, onSuccess }) {
  const [form, setForm] = useState({username:'alok', password:'alok123'});
  const [error, setError] = useState(initialError || '');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      setCredentials(form.username, form.password);
      await api.checkAdmin();
      onSuccess();
    } catch (e) {
      clearCredentials();
      setError(e.status === 403 ? 'Access denied: this account is not an ADMIN.' : 'Invalid admin credentials.');
    } finally { setBusy(false); }
  }

  return <div className="admin-login">
    <div className="admin-login-card">
      <ShieldCheck size={38}/>
      <h1>Admin Portal</h1>
      <p>Administrator access only. Authorization is verified by the backend.</p>
      <form className="form" onSubmit={submit}>
        <label>Username<input value={form.username} onChange={e=>setForm({...form,username:e.target.value})}/></label>
        <label>Password<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>
        {error && <div className="form-error">{error}</div>}
        <button className="btn primary full" disabled={busy}>{busy?'Checking…':'Enter Admin Dashboard'}</button>
      </form>
      <Link to="/" className="back">← Customer website</Link>
    </div>
  </div>;
}

function AdminDashboard() {
  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  useEffect(() => { Promise.all([api.getMovies(),api.getShows()]).then(([m,s])=>{setMovies(m||[]);setShows(s||[])}).catch(()=>{}); }, []);
  return <div>
    <AdminHeader title="Dashboard"/>
    <div className="metric-grid">
      <Metric icon={<Film/>} label="Movies" value={movies.length}/>
      <Metric icon={<CalendarDays/>} label="Shows" value={shows.length}/>
      <Metric icon={<MapPin/>} label="Venues / Screens" value={new Set(shows.map(s=>s.screen?.id).filter(Boolean)).size}/>
    </div>
    <div className="admin-panel">
      <h2>Quick actions</h2>
      <div className="quick-actions">
        <Link to="/admin/movies/new" className="btn primary"><Plus/> Add Movie</Link>
        <Link to="/admin/shows/new" className="btn secondary"><Plus/> Add Show</Link>
      </div>
    </div>
  </div>;
}

function Metric({icon,label,value}) {
  return <div className="metric"><div>{icon}</div><span>{label}</span><strong>{value}</strong></div>;
}

function AdminHeader({title, action}) {
  return <header className="admin-header"><div><h1>{title}</h1><p>Manage your BookMyShow catalogue.</p></div>{action}</header>;
}

function AdminMovies() {
  const [movies,setMovies]=useState([]);
  const navigate=useNavigate();
  async function load(){ try{setMovies(await api.getMovies()||[])}catch{} }
  useEffect(()=>{load()},[]);
  async function remove(id){ if(!confirm('Delete this movie?'))return; try{await api.deleteMovie(id);load()}catch(e){alert(e.message)} }
  return <div>
    <AdminHeader title="Movies" action={<button className="btn primary" onClick={()=>navigate('/admin/movies/new')}><Plus/> Add Movie</button>}/>
    <div className="admin-panel table-wrap">
      {!movies.length ? <EmptyAdmin text="No movies yet. Add your first movie."/> :
      <table><thead><tr><th>Poster</th><th>Movie</th><th>Languages</th><th>Genres</th><th>Release</th><th>Actions</th></tr></thead>
      <tbody>{movies.map(m=><tr key={m.id}><td><img className="table-poster" src={posterUrl(m)} /></td><td><b>{m.title}</b><small>{m.durationMinutes} min</small></td><td>{(m.languages||[]).map(pretty).join(', ')}</td><td>{(m.genres||[]).map(pretty).join(', ')}</td><td>{formatDate(m.releaseDate)}</td><td className="actions"><button onClick={()=>navigate(`/admin/movies/${m.id}/edit`)}><Pencil/></button><button onClick={()=>remove(m.id)}><Trash2/></button></td></tr>)}</tbody></table>}
    </div>
  </div>;
}

function MovieForm() {
  const {id}=useParams();
  const edit=Boolean(id);
  const navigate=useNavigate();
  const [form,setForm]=useState({title:'',durationMinutes:'',releaseDate:'',languages:'',genres:'',cast:''});
  const [poster,setPoster]=useState(null);
  const [preview,setPreview]=useState('');
  const [busy,setBusy]=useState(false);

  useEffect(()=>{if(edit)api.getMovie(id).then(m=>{setForm({title:m.title||'',durationMinutes:m.durationMinutes||'',releaseDate:m.releaseDate||'',languages:(m.languages||[]).join(', '),genres:(m.genres||[]).join(', '),cast:(m.cast||[]).join(', ')});setPreview(posterUrl(m))}).catch(e=>alert(e.message))},[id]);

  function change(e){setForm({...form,[e.target.name]:e.target.value})}
  function selectPoster(e){const f=e.target.files?.[0];if(f){setPoster(f);setPreview(URL.createObjectURL(f))}}

  function moviePayload(){
    return {
      title:form.title,
      durationMinutes:Number(form.durationMinutes),
      releaseDate:form.releaseDate || null,
      languages:form.languages.split(',').map(x=>x.trim().toUpperCase()).filter(Boolean),
      genres:form.genres.split(',').map(x=>x.trim().toUpperCase().replaceAll(' ','_')).filter(Boolean),
      cast:form.cast.split(',').map(x=>x.trim()).filter(Boolean)
    };
  }

  async function submit(e){
    e.preventDefault();
    if(!edit && !poster){alert('Poster is required for a new movie.');return}
    setBusy(true);
    try{
      if(edit) await api.updateMovie({id,movie:moviePayload(),poster});
      else await api.createMovie({movie:moviePayload(),poster});
      navigate('/admin/movies');
    }catch(e){alert(e.message)}finally{setBusy(false)}
  }

  return <div>
    <AdminHeader title={edit?'Edit Movie':'Add Movie'}/>
    <form className="admin-panel form movie-form" onSubmit={submit}>
      <div className="form-grid">
        <label>Movie title<input name="title" value={form.title} onChange={change} required/></label>
        <label>Duration (minutes)<input type="number" name="durationMinutes" value={form.durationMinutes} onChange={change} min="1" required/></label>
        <label>Release date<input type="date" name="releaseDate" value={form.releaseDate} onChange={change}/></label>
        <label>Languages <small>comma separated: HINDI, ENGLISH</small><input name="languages" value={form.languages} onChange={change} required/></label>
        <label>Genres <small>comma separated: ACTION, DRAMA</small><input name="genres" value={form.genres} onChange={change} required/></label>
        <label>Cast <small>comma separated</small><input name="cast" value={form.cast} onChange={change}/></label>
      </div>
      <label>Poster {!edit && <b className="required">required</b>}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={selectPoster}/></label>
      {preview && <img className="upload-preview" src={preview} alt="Poster preview"/>}
      <div className="form-actions"><button type="button" className="btn secondary" onClick={()=>navigate('/admin/movies')}>Cancel</button><button className="btn primary" disabled={busy}>{busy?'Saving…':edit?'Update Movie':'Create Movie'}</button></div>
    </form>
  </div>;
}

function AdminShows() {
  const [shows,setShows]=useState([]);
  const [movies,setMovies]=useState([]);
  const navigate=useNavigate();
  async function load(){try{const [s,m]=await Promise.all([api.getShows(),api.getMovies()]);setShows(s||[]);setMovies(m||[])}catch{}}
  useEffect(()=>{load()},[]);
  async function remove(id){if(!confirm('Delete this show?'))return;try{await api.deleteShow(id);load()}catch(e){alert(e.message)}}
  return <div>
    <AdminHeader title="Shows" action={<button className="btn primary" onClick={()=>navigate('/admin/shows/new')}><Plus/> Add Show</button>}/>
    <div className="admin-panel table-wrap">
      {!shows.length?<EmptyAdmin text="No shows yet. Create a show for an existing movie and screen."/>:
      <table><thead><tr><th>Movie</th><th>Date</th><th>Time</th><th>Screen</th><th>Venue</th><th>Actions</th></tr></thead>
      <tbody>{shows.map(s=><tr key={s.id}><td><b>{s.movie?.title || movies.find(m=>m.id===s.movie?.id)?.title || `Movie #${s.movie?.id}`}</b></td><td>{formatDate(s.showDate)}</td><td>{formatTime(s.startTime)} – {formatTime(s.endTime)}</td><td>{s.screen?.screenName || s.screen?.id}</td><td>{s.screen?.venue?.name || '—'}</td><td className="actions"><button onClick={()=>navigate(`/admin/shows/${s.id}/edit`)}><Pencil/></button><button onClick={()=>remove(s.id)}><Trash2/></button></td></tr>)}</tbody></table>}
    </div>
  </div>;
}

function ShowForm() {
  const {id}=useParams();
  const edit=Boolean(id);
  const navigate=useNavigate();
  const [movies,setMovies]=useState([]);
  const [form,setForm]=useState({movieId:'',screenId:'',showDate:'',startTime:'',endTime:''});
  const [busy,setBusy]=useState(false);

  useEffect(()=>{
    api.getMovies().then(setMovies).catch(()=>{});
    if(edit)api.getShow(id).then(s=>setForm({movieId:s.movie?.id||'',screenId:s.screen?.id||'',showDate:s.showDate||'',startTime:s.startTime?.slice(0,5)||'',endTime:s.endTime?.slice(0,5)||''})).catch(e=>alert(e.message));
  },[id]);

  async function submit(e){
    e.preventDefault();setBusy(true);
    const payload={movie:{id:Number(form.movieId)},screen:{id:Number(form.screenId)},showDate:form.showDate,startTime:`${form.startTime}:00`,endTime:`${form.endTime}:00`};
    try{edit?await api.updateShow(id,payload):await api.createShow(payload);navigate('/admin/shows')}catch(e){alert(e.message)}finally{setBusy(false)}
  }

  return <div>
    <AdminHeader title={edit?'Edit Show':'Add Show'}/>
    <form className="admin-panel form" onSubmit={submit}>
      <label>Movie<select value={form.movieId} onChange={e=>setForm({...form,movieId:e.target.value})} required><option value="">Select movie</option>{movies.map(m=><option key={m.id} value={m.id}>{m.title}</option>)}</select></label>
      <label>Screen ID<input type="number" value={form.screenId} onChange={e=>setForm({...form,screenId:e.target.value})} required/></label>
      <label>Show date<input type="date" value={form.showDate} onChange={e=>setForm({...form,showDate:e.target.value})} required/></label>
      <div className="two-col"><label>Start time<input type="time" value={form.startTime} onChange={e=>setForm({...form,startTime:e.target.value})} required/></label><label>End time<input type="time" value={form.endTime} onChange={e=>setForm({...form,endTime:e.target.value})} required/></label></div>
      <div className="form-actions"><button type="button" className="btn secondary" onClick={()=>navigate('/admin/shows')}>Cancel</button><button className="btn primary" disabled={busy}>{busy?'Saving…':edit?'Update Show':'Create Show'}</button></div>
    </form>
  </div>;
}

function EmptyAdmin({text}){return <div className="empty-admin"><Film size={30}/><p>{text}</p></div>}
function AuthLayout({title,subtitle,children}){return <div className="auth-page"><div className="auth-card"><div className="logo big"><span>BMS</span> BookMyShow</div><h1>{title}</h1><p>{subtitle}</p>{children}<Link to="/" className="back">← Back to website</Link></div></div>}
function Loading(){return <div className="loading">Loading…</div>}
function NotFound(){return <div className="empty-page"><div className="empty-icon"><X size={36}/></div><h1>Page not found</h1><Link className="btn primary" to="/">Back Home</Link></div>}
function SectionTitle({title,action}){return <div className="section-title"><h2>{title}</h2>{action}</div>}

export default App;
