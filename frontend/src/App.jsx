import React, { useEffect, useState } from 'react';

import {
    Routes,
    Route,
    Link,
    NavLink,
    useNavigate,
    useLocation,
    useParams
} from 'react-router-dom';

import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Film,
    LayoutDashboard,
    LogOut,
    MapPin,
    Pencil,
    Plus,
    Search,
    ShieldCheck,
    Ticket,
    Trash2,
    UserRound,
    X,
    Armchair
} from 'lucide-react';

import {
    api,
    API_BASE,
    clearCredentials,
    hasCredentials,
    setCredentials
} from './api';


/* =========================================================
   CONSTANTS
========================================================= */

const FALLBACK_POSTER = '/poster-placeholder.svg';


/* =========================================================
   UTILITY FUNCTIONS
========================================================= */

function pretty(value = '') {
    return String(value)
        .replaceAll('_', ' ')
        .toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase());
}


function posterUrl(movie) {
    if (!movie?.posterUrl) {
        return FALLBACK_POSTER;
    }

    if (
        movie.posterUrl.startsWith('http://') ||
        movie.posterUrl.startsWith('https://')
    ) {
        return movie.posterUrl;
    }

    return `${API_BASE}${movie.posterUrl}`;
}


function formatDate(value) {
    if (!value) {
        return '—';
    }

    try {
        return new Date(`${value}T00:00:00`).toLocaleDateString(
            'en-IN',
            {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            }
        );
    } catch {
        return value;
    }
}


function formatTime(value) {
    if (!value) {
        return '—';
    }

    return String(value).slice(0, 5);
}


function movieShows(shows, movieId) {
    return (shows || []).filter(
        show =>
            Number(show?.movie?.id) === Number(movieId)
    );
}


function getSeatRow(seatNumber) {
    const match =
        String(seatNumber || '').match(/^[A-Za-z]+/);

    return match?.[0] || 'A';
}


function getSeatNumber(seatNumber) {
    return String(seatNumber || '')
        .replace(/^[A-Za-z]+/, '');
}


/*
 * Convert:
 *
 * [
 *   { id: 1, screenName: "Screen 1" },
 *   { id: 2, screenName: "Screen 2" }
 * ]
 *
 * from all venues into one screen array.
 */
function flattenScreens(venues) {
    return (venues || []).flatMap(
        venue =>
            (venue?.screens || []).map(
                screen => ({
                    ...screen,
                    venue: screen.venue || venue
                })
            )
    );
}


/* =========================================================
   ROOT APP
========================================================= */

function App() {

    return (
        <Routes>

            <Route
                path="/*"
                element={<CustomerApp />}
            />

            <Route
                path="/admin/*"
                element={<AdminApp />}
            />

        </Routes>
    );
}


/* =========================================================
   CUSTOMER APPLICATION
========================================================= */

function CustomerApp() {

    const [movies, setMovies] = useState([]);
    const [shows, setShows] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');


    async function loadCatalogue() {

        setLoading(true);
        setError('');

        try {

            const [
                moviesResponse,
                showsResponse
            ] = await Promise.all([
                api.getMovies(),
                api.getShows()
            ]);

            setMovies(
                Array.isArray(moviesResponse)
                    ? moviesResponse
                    : []
            );

            setShows(
                Array.isArray(showsResponse)
                    ? showsResponse
                    : []
            );

        } catch (error) {

            console.error(
                'CUSTOMER CATALOGUE ERROR:',
                error
            );

            setError(error.message);

        } finally {

            setLoading(false);

        }
    }


    useEffect(() => {
        loadCatalogue();
    }, []);


    return (
        <div className="app">

            <CustomerHeader />


            {error && (

                <div className="global-error">

              <span>
                {error}
              </span>

                    <button
                        className="retry-btn"
                        onClick={loadCatalogue}
                    >
                        Retry
                    </button>

                </div>

            )}


            <Routes>

                <Route
                    path="/"
                    element={
                        <Home
                            movies={movies}
                            shows={shows}
                            loading={loading}
                        />
                    }
                />

                <Route
                    path="/movies"
                    element={
                        <Movies
                            movies={movies}
                            shows={shows}
                        />
                    }
                />

                <Route
                    path="/movie/:id"
                    element={
                        <MovieDetails
                            movies={movies}
                            shows={shows}
                        />
                    }
                />

                <Route
                    path="/movie/:movieId/shows"
                    element={
                        <ShowsForMovie
                            movies={movies}
                            shows={shows}
                        />
                    }
                />

                <Route
                    path="/movie/:movieId/no-shows"
                    element={
                        <NoShowsPage
                            movies={movies}
                        />
                    }
                />

                <Route
                    path="/locations"
                    element={<LocationsPage />}
                />

                <Route
                    path="/about"
                    element={<AboutPage />}
                />

                <Route
                    path="/show/:showId/seats"
                    element={<SeatPage />}
                />

                <Route
                    path="/payment"
                    element={<PaymentPage />}
                />

                <Route
                    path="/booking/:id"
                    element={<BookingConfirmation />}
                />

                <Route
                    path="/bookings"
                    element={<MyBookingsPage />}
                />

                <Route
                    path="/login"
                    element={<CustomerLogin />}
                />

                <Route
                    path="/register"
                    element={<CustomerRegister />}
                />

                <Route
                    path="*"
                    element={<NotFound />}
                />

            </Routes>

        </div>
    );
}


/* =========================================================
   CUSTOMER HEADER
========================================================= */

function CustomerHeader() {

    const navigate = useNavigate();
    const location = useLocation();

    const [query, setQuery] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const [cityMenuOpen, setCityMenuOpen] = useState(false);
    const [cities, setCities] = useState([]);
    const [currentCity, setCurrentCity] = useState(
        sessionStorage.getItem('bms-city') || ''
    );

    const username =
        sessionStorage.getItem('bms-customer-user');

    useEffect(() => {
        let active = true;

        api.getCities()
            .then(result => {
                if (!active) return;
                const list = Array.isArray(result) ? result : [];
                setCities(list);

                if (!currentCity && list.length) {
                    setCurrentCity(list[0]);
                    sessionStorage.setItem('bms-city', list[0]);
                }
            })
            .catch(error => {
                console.warn('CITY LOAD ERROR:', error);
            });

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const cityFromUrl = params.get('city');
        if (cityFromUrl) {
            setCurrentCity(cityFromUrl);
            sessionStorage.setItem('bms-city', cityFromUrl);
        }
    }, [location.search]);

    function submit(event) {
        event.preventDefault();

        navigate(
            `/movies${
                query.trim()
                    ? `?q=${encodeURIComponent(query.trim())}`
                    : ''
            }`
        );

        setMenuOpen(false);
    }

    function selectCity(city) {
        setCurrentCity(city);
        sessionStorage.setItem('bms-city', city);
        setCityMenuOpen(false);
        navigate(`/locations?city=${encodeURIComponent(city)}`);
    }

    function logout() {
        clearCredentials();
        sessionStorage.removeItem('bms-customer-user');
        sessionStorage.removeItem('bms-user-id');
        sessionStorage.removeItem('bms-city');
        setMenuOpen(false);
        navigate('/');
    }

    return (
        <header className="customer-header">
            <button
                type="button"
                className="logo"
                onClick={() => navigate('/')}
            >
                <span>BMS</span> BookMyShow
            </button>

            <div className="city-selector">
                <button
                    type="button"
                    className="city-button"
                    onClick={() => setCityMenuOpen(value => !value)}
                    aria-label="Choose city"
                >
                    <MapPin size={15} />
                    <span>{currentCity || 'Select City'}</span>
                    <ChevronRight
                        size={13}
                        className={cityMenuOpen ? 'rotate-90' : ''}
                    />
                </button>

                {cityMenuOpen && (
                    <div className="city-dropdown">
                        <div className="city-dropdown-title">
                            Select your city
                        </div>
                        {cities.length ? cities.map(city => (
                            <button
                                type="button"
                                key={city}
                                className={currentCity === city ? 'selected' : ''}
                                onClick={() => selectCity(city)}
                            >
                                <MapPin size={15} />
                                {city}
                            </button>
                        )) : (
                            <span className="city-empty">
                                No cities available
                            </span>
                        )}
                    </div>
                )}
            </div>

            <form className="search" onSubmit={submit}>
                <Search size={17} />
                <input
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    placeholder="Search movies, shows..."
                />
            </form>

            <nav className="customer-nav">
                <NavLink to="/movies">
                    Movies
                </NavLink>

                <NavLink to="/about">
                    About
                </NavLink>

                {username ? (
                    <div className="user-menu">
                        <button
                            type="button"
                            className="user-button"
                            onClick={() => setMenuOpen(value => !value)}
                            aria-expanded={menuOpen}
                        >
                            <UserRound size={17} />
                            <span className="user-button-name">
                                {username}
                            </span>
                            <ChevronRight
                                size={14}
                                className={menuOpen ? 'rotate-90' : ''}
                            />
                        </button>

                        {menuOpen && (
                            <div className="user-dropdown">
                                <div className="user-dropdown-header">
                                    <div className="user-avatar">
                                        <UserRound size={20} />
                                    </div>
                                    <div>
                                        <strong>{username}</strong>
                                        <small>Customer account</small>
                                    </div>
                                </div>

                                <div className="dropdown-divider" />

                                <button
                                    type="button"
                                    className="dropdown-item"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        navigate('/bookings');
                                    }}
                                >
                                    <Ticket size={17} />
                                    My Bookings
                                </button>

                                <button
                                    type="button"
                                    className="dropdown-item logout-item"
                                    onClick={logout}
                                >
                                    <LogOut size={17} />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <NavLink
                        to="/login"
                        className="signin-link"
                    >
                        <UserRound size={17} />
                        Sign In
                    </NavLink>
                )}
            </nav>
        </header>
    );
}

/* =========================================================
   HOME
========================================================= */

function Home({
                  movies,
                  shows,
                  loading
              }) {

    if (loading) {
        return <Loading />;
    }


    if (movies.length === 0) {
        return <EmptyMovies />;
    }


    const activeMovies =
        movies.filter(
            movie =>
                movieShows(
                    shows,
                    movie.id
                ).length > 0
        );


    const comingSoon =
        movies.filter(
            movie =>
                movieShows(
                    shows,
                    movie.id
                ).length === 0
        );


    return (
        <>

            <section className="hero">

                <div className="hero-content">

            <span className="eyebrow">
              BOOK YOUR NEXT EXPERIENCE
            </span>

                    <h1>
                        Movies.
                        <br />
                        Shows.
                        <br />

                        <strong>
                            Your seats.
                        </strong>
                    </h1>

                    <p>
                        Choose a movie, select a show,
                        pick your seats and book.
                    </p>

                    <Link
                        className="btn primary"
                        to="/movies"
                    >

                        Explore Movies

                        <ChevronRight size={17} />

                    </Link>

                </div>

            </section>


            <section className="customer-section">

                <SectionTitle
                    title="Now Showing"
                    action={
                        <Link to="/movies">
                            See all
                            <ChevronRight size={15} />
                        </Link>
                    }
                />


                {activeMovies.length === 0 ? (

                    <NoShowsState compact />

                ) : (

                    <MovieGrid
                        movies={activeMovies.slice(0, 8)}
                        shows={shows}
                    />

                )}

            </section>


            {comingSoon.length > 0 && (

                <section className="customer-section">

                    <SectionTitle
                        title="Coming Soon"
                    />

                    <MovieGrid
                        movies={comingSoon.slice(0, 8)}
                        shows={shows}
                    />

                </section>

            )}

        </>
    );
}


/* =========================================================
   EMPTY MOVIES
========================================================= */

function EmptyMovies() {

    return (
        <div className="empty-page">

            <div className="empty-icon">
                <Film size={38} />
            </div>

            <h1>
                No movies available
            </h1>

            <p>
                There are currently no movies
                in the catalogue.
            </p>

            <p>
                Please check again later.
            </p>

        </div>
    );
}


/* =========================================================
   MOVIES PAGE
========================================================= */

function Movies({
                    movies,
                    shows
                }) {

    const location = useLocation();

    const params =
        new URLSearchParams(
            location.search
        );

    const query =
        (
            params.get('q') || ''
        ).toLowerCase();


    const [filter, setFilter] =
        useState('All');


    const genres = [
        'All',
        ...new Set(
            movies
                .flatMap(
                    movie =>
                        movie.genres || []
                )
                .map(pretty)
        )
    ];


    const filtered =
        movies.filter(movie => {

            const title =
                String(
                    movie.title || ''
                ).toLowerCase();


            const matchesSearch =
                !query ||
                title.includes(query);


            const matchesGenre =
                filter === 'All' ||
                (movie.genres || [])
                    .some(
                        genre =>
                            pretty(genre) === filter
                    );


            return (
                matchesSearch &&
                matchesGenre
            );
        });


    if (movies.length === 0) {
        return <EmptyMovies />;
    }


    return (
        <section className="customer-section page-top">

            <SectionTitle title="Movies" />


            <div className="chips">

                {genres.map(genre => (

                    <button
                        key={genre}
                        className={
                            filter === genre
                                ? 'selected'
                                : ''
                        }
                        onClick={() =>
                            setFilter(genre)
                        }
                    >
                        {genre}
                    </button>

                ))}

            </div>


            {filtered.length > 0 ? (

                <MovieGrid
                    movies={filtered}
                    shows={shows}
                />

            ) : (

                <NoMoviesSearch />

            )}

        </section>
    );
}


/* =========================================================
   MOVIE GRID
========================================================= */

function MovieGrid({
                       movies,
                       shows
                   }) {

    return (
        <div className="movie-grid">

            {movies.map(movie => (

                <MovieCard
                    key={movie.id}
                    movie={movie}
                    hasShows={
                        movieShows(
                            shows,
                            movie.id
                        ).length > 0
                    }
                />

            ))}

        </div>
    );
}


/* =========================================================
   MOVIE CARD
========================================================= */

function MovieCard({
                       movie,
                       hasShows
                   }) {

    return (
        <Link
            className="movie-card"
            to={`/movie/${movie.id}`}
        >

            <div className="poster">

                <img
                    src={posterUrl(movie)}
                    alt={movie.title}
                />

            </div>


            <h3>
                {movie.title}
            </h3>


            <div className="muted">

                {(movie.genres || [])
                    .slice(0, 2)
                    .map(pretty)
                    .join(' · ')}

            </div>


            <div className="card-bottom">

          <span>
            {formatDate(
                movie.releaseDate
            )}
          </span>


                <span
                    className={
                        hasShows
                            ? 'available-text'
                            : 'muted'
                    }
                >

            {hasShows
                ? 'Shows available'
                : 'No shows yet'}

          </span>

            </div>

        </Link>
    );
}


/* =========================================================
   MOVIE DETAILS
========================================================= */

function MovieDetails({
                          movies,
                          shows
                      }) {

    const { id } =
        useParams();


    const movie =
        movies.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!movie) {
        return <NotFound />;
    }


    const relatedShows =
        movieShows(
            shows,
            movie.id
        );


    return (
        <section className="details">

            <Link
                className="back"
                to="/movies"
            >

                <ChevronLeft size={17} />

                Back to movies

            </Link>


            <div className="detail-layout">

                <img
                    className="detail-poster"
                    src={posterUrl(movie)}
                    alt={movie.title}
                />


                <div className="detail-copy">

                    <div className="tag-row">

                        {(movie.genres || [])
                            .map(genre => (

                                <span key={genre}>
                        {pretty(genre)}
                      </span>

                            ))}

                    </div>


                    <h1>
                        {movie.title}
                    </h1>


                    <div className="stats">

              <span>

                <Clock3 size={15} />

                  {movie.durationMinutes
                      ? `${movie.durationMinutes} min`
                      : 'Duration —'}

              </span>


                        <span>

                <CalendarDays size={15} />

                            {formatDate(
                                movie.releaseDate
                            )}

              </span>

                    </div>


                    <p>

                        <b>
                            Languages:
                        </b>{' '}

                        {(movie.languages || [])
                            .map(pretty)
                            .join(', ') || '—'}

                    </p>


                    <p>

                        <b>
                            Cast:
                        </b>{' '}

                        {(movie.cast || [])
                            .join(', ') || '—'}

                    </p>


                    {movie.description && (

                        <p>
                            {movie.description}
                        </p>

                    )}


                    {relatedShows.length > 0 ? (

                        <Link
                            className="btn primary"
                            to={`/movie/${movie.id}/shows`}
                        >

                            Select Showtimes

                            <ChevronRight size={17} />

                        </Link>

                    ) : (

                        <Link
                            className="btn primary"
                            to={`/movie/${movie.id}/no-shows`}
                        >

                            Check Showtimes

                            <ChevronRight size={17} />

                        </Link>

                    )}

                </div>

            </div>

        </section>
    );
}


/* =========================================================
   NO SHOWS PAGE
========================================================= */

function NoShowsPage({
                         movies
                     }) {

    const { movieId } =
        useParams();


    const movie =
        movies.find(
            item =>
                Number(item.id) ===
                Number(movieId)
        );


    if (!movie) {
        return <NotFound />;
    }


    return (
        <section className="empty-page">

            <div className="empty-icon">
                <CalendarDays size={42} />
            </div>


            <h1>
                No shows available
            </h1>


            <h2>
                {movie.title}
            </h2>


            <p>
                This movie is available in our
                catalogue, but no shows have been
                scheduled yet.
            </p>


            <p>
                Please check again later.
            </p>


            <Link
                className="btn primary"
                to="/movies"
            >
                Browse Other Movies
            </Link>

        </section>
    );
}


/* =========================================================
   SHOWS FOR MOVIE
========================================================= */

function ShowsForMovie({
                           movies,
                           shows
                       }) {

    const { movieId } =
        useParams();


    const movie =
        movies.find(
            item =>
                Number(item.id) ===
                Number(movieId)
        );


    if (!movie) {
        return <NotFound />;
    }


    const list =
        movieShows(
            shows,
            movieId
        );


    if (list.length === 0) {

        return (
            <NoShowsPage
                movies={movies}
            />
        );

    }


    const sortedShows =
        [...list].sort(
            (a, b) =>
                `${a.showDate}${a.startTime}`
                    .localeCompare(
                        `${b.showDate}${b.startTime}`
                    )
        );


    return (
        <section className="customer-section page-top">

            <Link
                className="back"
                to={`/movie/${movie.id}`}
            >

                <ChevronLeft size={17} />

                Back

            </Link>


            <SectionTitle
                title={`Choose a show — ${movie.title}`}
            />


            <div className="show-list">

                {sortedShows.map(show => (

                    <Link
                        key={show.id}
                        className="show-card"
                        to={`/show/${show.id}/seats`}
                    >

                        <div>

                            <b>
                                {formatDate(
                                    show.showDate
                                )}
                            </b>

                            <span>
                    {formatTime(
                        show.startTime
                    )}

                                {' – '}

                                {formatTime(
                                    show.endTime
                                )}
                  </span>

                        </div>


                        <div>

                            <strong>
                                {
                                    show.screen?.screenName ||
                                    `Screen ${show.screen?.id || ''}`
                                }
                            </strong>

                            <span>
                    {
                        show.screen?.venue?.name ||
                        'Venue'
                    }
                  </span>

                        </div>


                        <ChevronRight />

                    </Link>

                ))}

            </div>

        </section>
    );
}


/* =========================================================
   LOCATIONS
========================================================= */

function LocationsPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(location.search);
    const requestedCity = params.get('city') || sessionStorage.getItem('bms-city') || '';

    const [cities, setCities] = useState([]);
    const [venues, setVenues] = useState([]);
    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.getCities()
            .then(data => {
                const list = Array.isArray(data) ? data : [];
                setCities(list);

                if (!requestedCity && list.length) {
                    navigate(`/locations?city=${encodeURIComponent(list[0])}`, { replace: true });
                }
            })
            .catch(e => setError(e.message));
    }, []);

    useEffect(() => {
        if (!requestedCity) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');
        sessionStorage.setItem('bms-city', requestedCity);

        Promise.all([
            api.getVenuesByCity(requestedCity),
            api.getShowsByCity(requestedCity)
        ])
            .then(([venueData, showData]) => {
                setVenues(Array.isArray(venueData) ? venueData : []);
                setShows(Array.isArray(showData) ? showData : []);
            })
            .catch(e => {
                setError(e.message);
                setVenues([]);
                setShows([]);
            })
            .finally(() => setLoading(false));
    }, [requestedCity]);

    const showsByVenue = shows.reduce((result, show) => {
        const venueId = Number(show?.screen?.venue?.id);
        if (!venueId) return result;
        (result[venueId] ||= []).push(show);
        return result;
    }, {});

    return (
        <section className="locations-page customer-section page-top">
            <div className="locations-header">
                <div>
                    <span className="eyebrow">CINEMAS NEAR YOU</span>
                    <h1>{requestedCity || 'Choose your city'}</h1>
                    <p>Find every venue available in the selected city and browse its shows.</p>
                </div>

                <div className="location-city-tabs">
                    {cities.map(city => (
                        <button
                            type="button"
                            key={city}
                            className={city === requestedCity ? 'active' : ''}
                            onClick={() => navigate(`/locations?city=${encodeURIComponent(city)}`)}
                        >
                            {city}
                        </button>
                    ))}
                </div>
            </div>

            {error && <div className="form-error">{error}</div>}

            {loading ? <Loading /> : venues.length === 0 ? (
                <div className="empty-inline">
                    <MapPin size={28} />
                    <h3>No venues found</h3>
                    <p>There are no cinema venues configured for {requestedCity || 'this city'} yet.</p>
                </div>
            ) : (
                <div className="venue-grid">
                    {venues.map(venue => {
                        const venueShows = (showsByVenue[Number(venue.id)] || [])
                            .sort((a, b) => `${a.showDate}${a.startTime}`.localeCompare(`${b.showDate}${b.startTime}`));

                        return (
                            <article className="venue-card" key={venue.id}>
                                <div className="venue-card-header">
                                    <div>
                                        <h2>{venue.name}</h2>
                                        <p>{venue.address || venue.city}</p>
                                    </div>
                                    <MapPin size={19} />
                                </div>

                                <div className="venue-shows">
                                    {venueShows.length ? venueShows.map(show => (
                                        <Link
                                            className="venue-show"
                                            key={show.id}
                                            to={`/show/${show.id}/seats`}
                                        >
                                            <div>
                                                <strong>{show.movie?.title || 'Movie'}</strong>
                                                <span>{formatDate(show.showDate)} · {formatTime(show.startTime)} – {formatTime(show.endTime)}</span>
                                                <small>{show.screen?.screenName || `Screen ${show.screen?.id || ''}`}</small>
                                            </div>
                                            <ChevronRight size={17} />
                                        </Link>
                                    )) : (
                                        <div className="venue-no-shows">
                                            No shows scheduled at this venue.
                                        </div>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}


/* =========================================================
   ABOUT
========================================================= */

function AboutPage() {
    return (
        <section className="about-page customer-section page-top">
            <div className="about-hero">
                <span className="eyebrow">ABOUT BOOKMYSHOW</span>
                <h1>One place for movies, shows and seats.</h1>
                <p>
                    Browse movies, discover cinemas by city, choose a show,
                    select your seats and complete your booking in one flow.
                </p>
            </div>

            <div className="about-grid">
                <div className="about-card">
                    <Film size={22} />
                    <h3>Discover movies</h3>
                    <p>Explore the catalogue and filter movies by genre.</p>
                </div>
                <div className="about-card">
                    <MapPin size={22} />
                    <h3>Choose your city</h3>
                    <p>See venues and their scheduled shows directly from the backend.</p>
                </div>
                <div className="about-card">
                    <Armchair size={22} />
                    <h3>Select your seats</h3>
                    <p>Live booked-seat information prevents selecting sold seats.</p>
                </div>
                <div className="about-card">
                    <Ticket size={22} />
                    <h3>Manage bookings</h3>
                    <p>View your bookings and cancel eligible bookings from your account.</p>
                </div>
            </div>
        </section>
    );
}


/* =========================================================
   NO SHOWS STATE

========================================================= */

function NoShowsState({
                          movie,
                          compact = false
                      }) {

    return (
        <div
            className={
                `no-shows ${
                    compact
                        ? 'compact'
                        : ''
                }`
            }
        >

            <CalendarDays size={28} />

            <div>

                <h3>
                    No shows available
                </h3>

                <p>

                    {movie
                        ? `There are no shows scheduled for ${movie.title} yet.`
                        : 'No shows are currently scheduled.'}

                </p>

            </div>

        </div>
    );
}


/* =========================================================
   NO MOVIE SEARCH
========================================================= */

function NoMoviesSearch() {

    return (
        <div className="empty-inline">

            <Search size={25} />

            <h3>
                No movies found
            </h3>

            <p>
                Try another search or genre.
            </p>

        </div>
    );
}


/* =========================================================
   CUSTOMER LOGIN
========================================================= */

function CustomerLogin() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: '',
        password: ''
    });

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');


    async function login(event) {

        event.preventDefault();

        setBusy(true);
        setError('');

        try {

            /*
             * Basic Auth:
             *
             * username = user's email
             * password = user's password
             */
            setCredentials(
                form.email,
                form.password
            );


            /*
             * Ask backend for the authenticated
             * database user.
             */
            const currentUser =
                await api.getCurrentUser();


            /*
             * Store user information.
             */
            sessionStorage.setItem(
                'bms-customer-user',
                currentUser.name
            );

            sessionStorage.setItem(
                'bms-user-id',
                String(currentUser.id)
            );


            navigate('/');

        } catch (error) {

            console.error(
                'CUSTOMER LOGIN FAILED:',
                error
            );

            clearCredentials();

            sessionStorage.removeItem(
                'bms-customer-user'
            );

            sessionStorage.removeItem(
                'bms-user-id'
            );

            setError(
                `Login failed: ${
                    error.status || 'NETWORK'
                } - ${error.message}`
            );

        } finally {

            setBusy(false);
        }
    }


    return (
        <AuthLayout
            title="Customer Sign In"
            subtitle="Sign in to continue booking."
        >

            <form
                onSubmit={login}
                className="form"
            >

                <label>

                    Email

                    <input
                        type="email"
                        value={form.email}
                        onChange={event =>
                            setForm({
                                ...form,
                                email: event.target.value
                            })
                        }
                        placeholder="Enter your email"
                        required
                    />

                </label>


                <label>

                    Password

                    <input
                        type="password"
                        value={form.password}
                        onChange={event =>
                            setForm({
                                ...form,
                                password: event.target.value
                            })
                        }
                        placeholder="Enter your password"
                        required
                    />

                </label>


                {error && (
                    <div className="form-error">
                        {error}
                    </div>
                )}


                <button
                    type="submit"
                    className="btn primary full"
                    disabled={busy}
                >

                    {busy
                        ? 'Signing in…'
                        : 'Sign In'}

                </button>

            </form>

            <p className="auth-switch">
                New customer? <Link to="/register">Create an account</Link>
            </p>

        </AuthLayout>
    );
}


/* =========================================================
   CUSTOMER REGISTRATION
========================================================= */

function CustomerRegister() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        dateOfBirth: ''
    });

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    function change(event) {
        setForm(current => ({
            ...current,
            [event.target.name]: event.target.value
        }));
    }

    async function register(event) {
        event.preventDefault();
        setBusy(true);
        setError('');

        try {
            await api.createUser({
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
                phoneNumber: form.phoneNumber.trim(),
                dateOfBirth: form.dateOfBirth || null
            });

            navigate('/login', {
                state: { registered: true, email: form.email.trim() }
            });
        } catch (e) {
            setError(
                `Registration failed: ${e.status || 'NETWORK'} - ${e.message}`
            );
        } finally {
            setBusy(false);
        }
    }

    return (
        <AuthLayout
            title="Create Account"
            subtitle="Create your customer account to start booking."
        >
            <form onSubmit={register} className="form">
                <label>
                    Full name
                    <input
                        name="name"
                        value={form.name}
                        onChange={change}
                        placeholder="Alok Saini"
                        required
                    />
                </label>

                <label>
                    Email
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={change}
                        placeholder="you@example.com"
                        required
                    />
                </label>

                <label>
                    Password
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={change}
                        placeholder="Create a password"
                        minLength="6"
                        required
                    />
                </label>

                <label>
                    Phone number
                    <input
                        type="tel"
                        name="phoneNumber"
                        value={form.phoneNumber}
                        onChange={change}
                        placeholder="9876543210"
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        minLength="10"
                        maxLength="10"
                        required
                    />
                </label>

                <label>
                    Date of birth
                    <input
                        type="date"
                        name="dateOfBirth"
                        value={form.dateOfBirth}
                        onChange={change}
                    />
                </label>

                {error && <div className="form-error">{error}</div>}

                <button
                    type="submit"
                    className="btn primary full"
                    disabled={busy}
                >
                    {busy ? 'Creating account…' : 'Create Account'}
                </button>
            </form>

            <p className="auth-switch">
                Already have an account? <Link to="/login">Sign in</Link>
            </p>
        </AuthLayout>
    );
}


/* =========================================================
   SEAT PAGE
========================================================= */

function SeatPage() {
    const { showId } = useParams();
    const navigate = useNavigate();

    const [show, setShow] = useState(null);
    const [booked, setBooked] = useState(new Set());
    const [selected, setSelected] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError('');
            try {
                const currentShow = await api.getShow(showId);
                setShow(currentShow);
                try {
                    const ids = await api.getBookedSeatIds(showId);
                    setBooked(new Set((ids || []).map(Number)));
                } catch (e) {
                    console.warn('BOOKED SEATS ENDPOINT ERROR:', e);
                    setBooked(new Set());
                    setError('Booked-seat information is temporarily unavailable.');
                }
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [showId]);

    if (loading) return <Loading />;
    if (!show) return <NotFound />;

    const seats = show.screen?.seatList || [];
    const selectedIds = new Set(selected.map(seat => Number(seat.id)));
    const prices = {
        RECLINER: Number(show.reclinerPrice ?? 0),
        VIP: Number(show.vipPrice ?? 0),
        COUPLE: Number(show.couplePrice ?? 0),
        PREMIUM: Number(show.premiumPrice ?? 0),
        REGULAR: Number(show.regularPrice ?? 0)
    };
    const categoryOrder = ['RECLINER', 'VIP', 'COUPLE', 'PREMIUM', 'REGULAR'];
    const grouped = categoryOrder.reduce((result, type) => {
        const typeSeats = seats.filter(seat => String(seat.seatType || 'REGULAR') === type);
        if (typeSeats.length) result[type] = typeSeats;
        return result;
    }, {});

    const ticketTotal = selected.reduce(
        (sum, seat) => sum + (prices[String(seat.seatType || 'REGULAR')] || 0),
        0
    );
    const convenienceFee = Math.round(ticketTotal * 0.05);
    const platformFee = selected.length ? 10 : 0;
    const total = ticketTotal + convenienceFee + platformFee;

    function toggleSeat(seat) {
        const id = Number(seat.id);
        if (booked.has(id)) return;
        setSelected(current => {
            if (current.some(item => Number(item.id) === id)) {
                return current.filter(item => Number(item.id) !== id);
            }
            if (current.length >= 8) return current;
            return [...current, seat];
        });
    }

    function proceedToPayment() {
        if (!selected.length) return;
        const customer = sessionStorage.getItem('bms-customer-user');
        if (!customer) {
            navigate('/login');
            return;
        }
        const userId = Number(sessionStorage.getItem('bms-user-id'));
        if (!userId) {
            setError('Your login is authenticated, but this customer account is not linked to a database User ID yet.');
            return;
        }
        navigate('/payment', {
            state: {
                show,
                selected,
                userId,
                ticketTotal,
                convenienceFee,
                platformFee,
                total
            }
        });
    }

    return (
        <section className="seat-page">
            <Link className="back" to={`/movie/${show.movie?.id}/shows`}>
                <ChevronLeft size={17} /> Back to shows
            </Link>

            <div className="seat-header">
                <div>
                    <h1>{show.movie?.title}</h1>
                    <p>{formatDate(show.showDate)} · {formatTime(show.startTime)} · {show.screen?.screenName || `Screen ${show.screen?.id || ''}`}</p>
                </div>
                <div className="seat-legend">
                    <span><i className="seat available"></i> Available</span>
                    <span><i className="seat selected"></i> Selected</span>
                    <span><i className="seat booked"></i> Booked</span>
                </div>
            </div>

            {error && <div className="notice">{error}</div>}

            <div className="seat-layout-shell">
                <div className="seat-main">
                    <div className="seat-stage">SCREEN THIS WAY</div>

                    <div className="seat-type-legend">
                        {categoryOrder.map(type => (
                            <span key={type} className={!grouped[type] ? 'hidden-seat-type' : ''}>
                                <i className={`seat-type-dot ${type.toLowerCase()}`}></i>
                                {pretty(type)} <b>₹{prices[type]}</b>
                            </span>
                        ))}
                    </div>

                    <div className="seat-map">
                        {Object.entries(grouped).map(([type, typeSeats]) => {
                            const byRow = typeSeats.reduce((acc, seat) => {
                                const row = getSeatRow(seat.seatNumber);
                                (acc[row] ||= []).push(seat);
                                return acc;
                            }, {});
                            return (
                                <div className="seat-category" key={type}>
                                    <div className="seat-category-title">
                                        <span>₹{prices[type]} {pretty(type)}</span>
                                    </div>
                                    {Object.entries(byRow).map(([row, rowSeats]) => (
                                        <div className="seat-row" key={`${type}-${row}`}>
                                            <b>{row}</b>
                                            <div className="seat-half">
                                                {rowSeats.slice(0, Math.ceil(rowSeats.length / 2)).map(seat => renderSeatButton(seat, booked, selectedIds, toggleSeat))}
                                            </div>
                                            <div className="seat-aisle" />
                                            <div className="seat-half">
                                                {rowSeats.slice(Math.ceil(rowSeats.length / 2)).map(seat => renderSeatButton(seat, booked, selectedIds, toggleSeat))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>

                    <div className="seat-bottom-legend">
                        <span><i className="legend-box available-box"></i> Available</span>
                        <span><i className="legend-box sold-box"></i> Sold</span>
                        <span><i className="legend-box selected-box"></i> Selected</span>
                    </div>
                </div>

                <aside className="booking-summary">
                    <h2>Booking Summary</h2>
                    <div className="summary-show">
                        <strong>{show.movie?.title}</strong>
                        <span>{show.screen?.screenName || 'Screen'}</span>
                        <span>{formatDate(show.showDate)} · {formatTime(show.startTime)}</span>
                    </div>

                    <div className="summary-section-title">SELECTED SEATS ({selected.length})</div>
                    <div className="selected-seat-list">
                        {selected.length ? selected.map(seat => (
                            <span key={seat.id}>{seat.seatNumber} <button onClick={() => toggleSeat(seat)}>×</button></span>
                        )) : <em>No seats selected</em>}
                    </div>

                    <div className="summary-lines">
                        <div><span>Tickets ({selected.length})</span><b>₹{ticketTotal}</b></div>
                        <div><span>Convenience Fee</span><b>₹{convenienceFee}</b></div>
                        <div><span>Platform Fee</span><b>₹{platformFee}</b></div>
                    </div>
                    <div className="summary-total"><span>Total Payable</span><strong>₹{total}</strong></div>
                    <button className="btn primary full summary-pay" disabled={!selected.length} onClick={proceedToPayment}>
                        Proceed to Pay <ChevronRight size={17} />
                    </button>
                </aside>
            </div>
        </section>
    );
}

function renderSeatButton(seat, booked, selectedIds, toggleSeat) {
    const isBooked = booked.has(Number(seat.id));
    const isSelected = selectedIds.has(Number(seat.id));
    const type = String(seat.seatType || 'REGULAR').toLowerCase();
    return (
        <button
            key={seat.id}
            disabled={isBooked}
            title={`${seat.seatNumber} · ${pretty(seat.seatType)}`}
            className={`seat seat-${type} ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
            onClick={() => toggleSeat(seat)}
        >
            {getSeatNumber(seat.seatNumber)}
        </button>
    );
}


/* =========================================================
   EXTRACT BOOKED SEATS
========================================================= */

function extractBookedSeatIds(bookings) {

    const ids = [];


    if (!Array.isArray(bookings)) {
        return ids;
    }


    bookings.forEach(booking => {

        const bookingSeats =
            booking.bookingList ||
            booking.bookingSeats ||
            booking.seats ||
            [];


        if (!Array.isArray(bookingSeats)) {
            return;
        }


        bookingSeats.forEach(bookingSeat => {

            const seat =
                bookingSeat?.seat ||
                bookingSeat;


            if (seat?.id != null) {

                ids.push(
                    Number(seat.id)
                );

            }

        });

    });


    return ids;
}


/* =========================================================
   PAYMENT PAGE
========================================================= */

function PaymentPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state;
    const [method, setMethod] = useState('UPI');
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState('');

    if (!state?.show || !state?.selected?.length) {
        return (
            <section className="empty-page">
                <h1>Payment session expired</h1>
                <Link className="btn primary" to="/movies">Back to Movies</Link>
            </section>
        );
    }

    const { show, selected, userId, ticketTotal, convenienceFee, platformFee, total } = state;

    async function payNow() {
        setPaying(true);
        setError('');
        try {
            const booking = await api.createBooking({
                userId,
                showId: Number(show.id),
                seatIds: selected.map(seat => Number(seat.id))
            });
            navigate(`/booking/${booking.id}`, { state: { booking, show } });
        } catch (e) {
            setError(e.message);
        } finally {
            setPaying(false);
        }
    }

    return (
        <section className="payment-page">
            <Link className="back" to={`/show/${show.id}/seats`}><ChevronLeft size={17} /> Back to seat selection</Link>
            <div className="payment-header">
                <div><h1>Payment</h1><p>Complete your payment to confirm the booking</p></div>
                <span className="payment-timer">09:48</span>
            </div>
            {error && <div className="form-error">{error}</div>}
            <div className="payment-grid">
                <div className="payment-card">
                    <h2>Payment Options</h2>
                    {['UPI', 'Credit / Debit Card', 'Net Banking', 'Wallets'].map(item => (
                        <button key={item} className={`payment-method ${method === item ? 'active' : ''}`} onClick={() => setMethod(item)}>
                            <span className="radio-dot">{method === item ? '●' : '○'}</span>
                            <span><b>{item}</b><small>{item === 'UPI' ? 'Pay using any UPI app' : item === 'Credit / Debit Card' ? 'Visa, Mastercard, Rupay' : item === 'Net Banking' ? 'All major banks supported' : 'Paytm, PhonePe, Amazon Pay'}</small></span>
                        </button>
                    ))}
                </div>
                <div className="payment-card payment-summary-card">
                    <h2>Payment Summary</h2>
                    <strong>{show.movie?.title}</strong>
                    <span>{show.screen?.screenName || 'Screen'}</span>
                    <span>{formatDate(show.showDate)} · {formatTime(show.startTime)}</span>
                    <hr />
                    <div className="summary-lines"><div><span>Seats ({selected.length})</span><b>{selected.map(s => s.seatNumber).join(', ')}</b></div><div><span>Tickets ({selected.length})</span><b>₹{ticketTotal}</b></div><div><span>Convenience Fee</span><b>₹{convenienceFee}</b></div><div><span>Platform Fee</span><b>₹{platformFee}</b></div></div>
                    <div className="summary-total"><span>Total Payable</span><strong>₹{total}</strong></div>
                </div>
            </div>
            <button className="btn primary payment-submit" disabled={paying} onClick={payNow}>{paying ? 'Processing…' : `Pay ₹${total} with ${method}`} <ChevronRight size={18} /></button>
            <p className="payment-note">By proceeding, you agree to our Terms & Conditions.</p>
        </section>
    );
}

/* =========================================================
   MY BOOKINGS
========================================================= */

function MyBookingsPage() {
    const navigate = useNavigate();
    const userId = Number(sessionStorage.getItem('bms-user-id'));
    const username = sessionStorage.getItem('bms-customer-user');

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    async function loadBookings() {
        if (!userId) {
            setError('Please sign in again to view your bookings.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = await api.getUserBookings(userId);
            setBookings(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadBookings();
    }, [userId]);

    async function cancelBooking(id) {
        if (!window.confirm('Cancel this booking?')) return;

        try {
            await api.cancelBooking(id);
            await loadBookings();
        } catch (e) {
            setError(e.message);
        }
    }

    if (!username) {
        return (
            <section className="empty-page">
                <Ticket size={38} />
                <h1>Sign in to see your bookings</h1>
                <Link className="btn primary" to="/login">Sign In</Link>
            </section>
        );
    }

    return (
        <section className="bookings-page customer-section page-top">
            <Link className="back" to="/movies">
                <ChevronLeft size={17} /> Back to movies
            </Link>

            <SectionTitle title="My Bookings" />

            {error && <div className="form-error">{error}</div>}

            {loading ? <Loading /> : bookings.length === 0 ? (
                <div className="empty-inline">
                    <Ticket size={30} />
                    <h3>No bookings yet</h3>
                    <p>Your confirmed movie bookings will appear here.</p>
                    <Link className="btn primary" to="/movies">Book a movie</Link>
                </div>
            ) : (
                <div className="bookings-list">
                    {bookings.map(booking => {
                        const show = booking.show;
                        const seats = booking.bookingList || booking.bookingSeats || [];
                        const status = booking.bookingStatus || 'CONFIRMED';

                        return (
                            <article className="booking-card" key={booking.id}>
                                <div className="booking-card-main">
                                    <div className="booking-poster-placeholder">
                                        <Film size={22} />
                                    </div>
                                    <div>
                                        <div className="booking-card-title-row">
                                            <h2>{show?.movie?.title || 'Movie'}</h2>
                                            <span className={`booking-status ${String(status).toLowerCase()}`}>
                                                {pretty(status)}
                                            </span>
                                        </div>
                                        <p>{show?.screen?.venue?.name || 'Venue'} · {show?.screen?.screenName || 'Screen'}</p>
                                        <p>{formatDate(show?.showDate)} · {formatTime(show?.startTime)} – {formatTime(show?.endTime)}</p>
                                        <p className="booking-seat-text">
                                            Seats: {seats.length ? seats.map(item => item?.seat?.seatNumber || item?.seatNumber).filter(Boolean).join(', ') : '—'}
                                        </p>
                                    </div>
                                </div>

                                <div className="booking-card-side">
                                    <span>Booking ID</span>
                                    <strong>BMS{String(booking.id).padStart(7, '0')}</strong>
                                    <span>Total</span>
                                    <strong>₹{booking.totalAmount ?? 0}</strong>
                                    {status !== 'CANCELLED' && (
                                        <button
                                            type="button"
                                            className="booking-cancel-btn"
                                            onClick={() => cancelBooking(booking.id)}
                                        >
                                            Cancel booking
                                        </button>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}


/* =========================================================
   BOOKING CONFIRMATION
========================================================= */

function BookingConfirmation() {

    const { id } =
        useParams();

    const location =
        useLocation();


    const [booking, setBooking] =
        useState(
            location.state?.booking ||
            null
        );


    const [loading, setLoading] =
        useState(!booking);


    useEffect(() => {

        if (booking) {
            return;
        }


        api.getBooking(id)
            .then(result => {

                setBooking(result);

            })
            .catch(error => {

                console.error(
                    'BOOKING LOAD ERROR:',
                    error
                );

            })
            .finally(() => {

                setLoading(false);

            });

    }, [id, booking]);


    if (loading) {
        return <Loading />;
    }


    return (
        <section className="confirmation">

            <div className="success">
                ✓
            </div>


            <h1>
                Booking Confirmed
            </h1>


            <p>
                Your booking has been created successfully.
            </p>


            <div className="ticket">

          <span>
            BOOKING ID
          </span>


                <strong>

                    BMS

                    {String(id).padStart(
                        7,
                        '0'
                    )}

                </strong>


                <hr />


                <p>

                    Movie:

                    {' '}

                    <b>
                        {
                            booking?.show?.movie?.title ||
                            '—'
                        }
                    </b>

                </p>


                <p>

                    Show:

                    {' '}

                    <b>

                        {formatDate(
                            booking?.show?.showDate
                        )}

                        {' · '}

                        {formatTime(
                            booking?.show?.startTime
                        )}

                    </b>

                </p>


                <p>

                    Status:

                    {' '}

                    <b>
                        {
                            booking?.bookingStatus ||
                            'CONFIRMED'
                        }
                    </b>

                </p>


                {booking?.totalAmount != null && (

                    <p>

                        Amount:

                        {' '}

                        <b>
                            ₹{booking.totalAmount}
                        </b>

                    </p>

                )}

            </div>


            <Link
                className="btn primary"
                to="/"
            >
                Back to Home
            </Link>

        </section>
    );
}


/* =========================================================
   ADMIN APPLICATION
========================================================= */

function AdminApp() {

    const [auth, setAuth] =
        useState(
            () => hasCredentials()
        );


    const [adminChecked, setAdminChecked] =
        useState(false);


    const [checking, setChecking] =
        useState(
            () => hasCredentials()
        );


    const [error, setError] =
        useState('');


    async function verifyAdmin() {

        const basicAuth =
            sessionStorage.getItem(
                'bms-basic-auth'
            );


        if (!basicAuth) {

            setAuth(false);
            setAdminChecked(false);
            setChecking(false);

            return;

        }


        setChecking(true);


        try {

            const response =
                await fetch(
                    `${API_BASE}/admin/check`,
                    {
                        method: 'GET',

                        headers: {
                            Authorization:
                                `Basic ${basicAuth}`
                        }
                    }
                );


            const text =
                await response.text();


            if (!response.ok) {

                const error =
                    new Error(
                        text ||
                        `Admin request failed (${response.status})`
                    );


                error.status =
                    response.status;


                throw error;

            }


            if (
                text.trim() !==
                'ADMIN_AUTHENTICATED'
            ) {

                throw new Error(
                    'Backend did not confirm ADMIN authority.'
                );

            }


            setAuth(true);
            setAdminChecked(true);
            setError('');

        } catch (error) {

            console.error(
                'ADMIN CHECK FAILED:',
                error
            );


            clearCredentials();

            setAuth(false);
            setAdminChecked(false);


            if (error.status === 403) {

                setError(
                    'Access denied. This account is not an ADMIN.'
                );

            } else if (error.status === 401) {

                setError(
                    'Invalid admin username or password.'
                );

            } else {

                setError(
                    `Admin request failed: ${
                        error.status ||
                        'NETWORK'
                    } - ${error.message}`
                );

            }

        } finally {

            setChecking(false);

        }
    }


    useEffect(() => {

        if (auth) {
            verifyAdmin();
        }

    }, [auth]);


    function logout() {

        clearCredentials();

        setAuth(false);
        setAdminChecked(false);
        setError('');

    }


    if (checking) {

        return (
            <div className="admin-login">

                <div className="admin-login-card">

                    <ShieldCheck size={42} />

                    <h1>
                        Checking Admin Access
                    </h1>

                    <p>
                        Verifying your ADMIN authority
                        with the Spring Security backend.
                    </p>

                    <Loading />

                </div>

            </div>
        );
    }


    if (
        !auth ||
        !adminChecked
    ) {

        return (
            <AdminLogin
                initialError={error}
                onSuccess={() => {
                    setAuth(true);
                }}
            />
        );
    }


    return (
        <div className="admin-shell">

            <aside className="admin-sidebar">

                <div className="admin-brand">

                    <ShieldCheck />

                    <span>
              BMS Admin
            </span>

                </div>


                <nav>

                    <NavLink
                        end
                        to="/admin/dashboard"
                    >

                        <LayoutDashboard />

                        <span>
                Dashboard
              </span>

                    </NavLink>


                    <NavLink to="/admin/movies">

                        <Film />

                        <span>
                Movies
              </span>

                    </NavLink>


                    <NavLink to="/admin/shows">

                        <CalendarDays />

                        <span>
                Shows
              </span>

                    </NavLink>


                    {/* NEW */}

                    <NavLink to="/admin/venues">

                        <MapPin />

                        <span>
                Venues
              </span>

                    </NavLink>


                    {/* NEW */}

                    <NavLink to="/admin/screens">

                        <Armchair />

                        <span>
                Screens
              </span>

                    </NavLink>

                </nav>


                <button
                    className="logout"
                    onClick={logout}
                >

                    <LogOut />

                    <span>
              Logout
            </span>

                </button>

            </aside>


            <main className="admin-main">

                <Routes>

                    <Route
                        path="dashboard"
                        element={
                            <AdminDashboard />
                        }
                    />


                    <Route
                        path="movies"
                        element={
                            <AdminMovies />
                        }
                    />


                    <Route
                        path="movies/new"
                        element={
                            <MovieForm />
                        }
                    />


                    <Route
                        path="movies/:id/edit"
                        element={
                            <MovieForm />
                        }
                    />


                    <Route
                        path="shows"
                        element={
                            <AdminShows />
                        }
                    />


                    <Route
                        path="shows/new"
                        element={
                            <ShowForm />
                        }
                    />


                    <Route
                        path="shows/:id/edit"
                        element={
                            <ShowForm />
                        }
                    />


                    {/* NEW VENUE ROUTES */}

                    <Route
                        path="venues"
                        element={
                            <AdminVenues />
                        }
                    />


                    <Route
                        path="venues/new"
                        element={
                            <VenueForm />
                        }
                    />


                    <Route
                        path="venues/:id/edit"
                        element={
                            <VenueForm />
                        }
                    />


                    {/* NEW SCREEN ROUTES */}

                    <Route
                        path="screens"
                        element={
                            <AdminScreens />
                        }
                    />


                    <Route
                        path="screens/new"
                        element={
                            <ScreenForm />
                        }
                    />


                    <Route
                        path="screens/:id/edit"
                        element={
                            <ScreenForm />
                        }
                    />


                    <Route
                        path="*"
                        element={
                            <AdminDashboard />
                        }
                    />

                </Routes>

            </main>

        </div>
    );
}


/* =========================================================
   ADMIN LOGIN
========================================================= */

function AdminLogin({
                        initialError,
                        onSuccess
                    }) {

    const [form, setForm] =
        useState({
            username: '',
            password: ''
        });


    const [error, setError] =
        useState(
            initialError || ''
        );


    const [busy, setBusy] =
        useState(false);


    useEffect(() => {

        setError(
            initialError || ''
        );

    }, [initialError]);


    async function submit(event) {

        event.preventDefault();

        setBusy(true);
        setError('');


        try {

            setCredentials(
                form.username,
                form.password
            );


            const encoded =
                sessionStorage.getItem(
                    'bms-basic-auth'
                );


            if (!encoded) {

                throw new Error(
                    'Unable to create authentication credentials.'
                );

            }


            const response =
                await fetch(
                    `${API_BASE}/admin/check`,
                    {
                        method: 'GET',

                        headers: {
                            Authorization:
                                `Basic ${encoded}`
                        }
                    }
                );


            const text =
                await response.text();


            if (!response.ok) {

                const error =
                    new Error(
                        text ||
                        `Authentication failed (${response.status})`
                    );


                error.status =
                    response.status;


                throw error;

            }


            if (
                text.trim() !==
                'ADMIN_AUTHENTICATED'
            ) {

                throw new Error(
                    'Authenticated account does not have ADMIN authority.'
                );

            }


            onSuccess();

        } catch (error) {

            console.error(
                'ADMIN LOGIN FAILED:',
                error
            );


            clearCredentials();


            if (error.status === 403) {

                setError(
                    'Access denied: this account is not an ADMIN.'
                );

            } else if (error.status === 401) {

                setError(
                    'Invalid admin username or password.'
                );

            } else {

                setError(
                    `Admin request failed: ${
                        error.status ||
                        'NETWORK'
                    } - ${error.message}`
                );

            }

        } finally {

            setBusy(false);

        }
    }


    return (
        <div className="admin-login">

            <div className="admin-login-card">

                <ShieldCheck size={40} />


                <h1>
                    Admin Portal
                </h1>


                <p>
                    Administrator access only.
                    Authorization is verified by
                    the Spring Security backend.
                </p>


                <form
                    className="form"
                    onSubmit={submit}
                >

                    <label>
                        Email

                        <input
                            type="email"
                            value={form.username}
                            onChange={event =>
                                setForm({
                                    ...form,
                                    username: event.target.value
                                })
                            }
                            autoComplete="username"
                            required
                        />
                    </label>


                    <label>

                        Password

                        <input
                            type="password"
                            value={form.password}
                            onChange={event =>
                                setForm({
                                    ...form,
                                    password:
                                    event.target.value
                                })
                            }
                            autoComplete="current-password"
                            required
                        />

                    </label>


                    {error && (

                        <div className="form-error">
                            {error}
                        </div>

                    )}


                    <button
                        className="btn primary full"
                        disabled={busy}
                    >

                        {busy
                            ? 'Checking…'
                            : 'Enter Admin Dashboard'}

                    </button>

                </form>


                <Link
                    to="/"
                    className="back"
                >
                    ← Customer website
                </Link>

            </div>

        </div>
    );
}


/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AdminDashboard() {

    const [movies, setMovies] =
        useState([]);

    const [shows, setShows] =
        useState([]);

    const [venues, setVenues] =
        useState([]);

    const [loading, setLoading] =
        useState(true);


    useEffect(() => {

        async function load() {

            try {

                const [
                    movieData,
                    showData,
                    venueData
                ] = await Promise.all([
                    api.getMovies(),
                    api.getShows(),
                    api.getVenues()
                ]);


                setMovies(
                    Array.isArray(movieData)
                        ? movieData
                        : []
                );


                setShows(
                    Array.isArray(showData)
                        ? showData
                        : []
                );


                setVenues(
                    Array.isArray(venueData)
                        ? venueData
                        : []
                );

            } catch (error) {

                console.error(
                    'ADMIN DASHBOARD ERROR:',
                    error
                );

            } finally {

                setLoading(false);

            }

        }


        load();

    }, []);


    if (loading) {
        return <Loading />;
    }


    const screens =
        flattenScreens(venues);


    return (
        <div>

            <AdminHeader
                title="Dashboard"
            />


            <div className="metric-grid">

                <Metric
                    icon={<Film />}
                    label="Movies"
                    value={movies.length}
                />


                <Metric
                    icon={<CalendarDays />}
                    label="Shows"
                    value={shows.length}
                />


                <Metric
                    icon={<MapPin />}
                    label="Venues"
                    value={venues.length}
                />


                <Metric
                    icon={<Armchair />}
                    label="Screens"
                    value={screens.length}
                />

            </div>


            <div className="admin-panel">

                <h2>
                    Quick Actions
                </h2>


                <div className="quick-actions">

                    <Link
                        to="/admin/movies/new"
                        className="btn primary"
                    >

                        <Plus />

                        Add Movie

                    </Link>


                    <Link
                        to="/admin/shows/new"
                        className="btn secondary"
                    >

                        <Plus />

                        Add Show

                    </Link>


                    <Link
                        to="/admin/venues/new"
                        className="btn secondary"
                    >

                        <Plus />

                        Add Venue

                    </Link>


                    <Link
                        to="/admin/screens/new"
                        className="btn secondary"
                    >

                        <Plus />

                        Add Screen

                    </Link>

                </div>

            </div>


            <div className="admin-panel">

                <h2>
                    Catalogue Status
                </h2>


                <div className="admin-status-grid">

                    <div>

                        <Film />

                        <span>
                Movies without shows
              </span>

                        <strong>

                            {
                                movies.filter(
                                    movie =>
                                        movieShows(
                                            shows,
                                            movie.id
                                        ).length === 0
                                ).length
                            }

                        </strong>

                    </div>


                    <div>

                        <CalendarDays />

                        <span>
                Scheduled shows
              </span>

                        <strong>
                            {shows.length}
                        </strong>

                    </div>


                    <div>

                        <MapPin />

                        <span>
                Venues
              </span>

                        <strong>
                            {venues.length}
                        </strong>

                    </div>


                    <div>

                        <Armchair />

                        <span>
                Screens
              </span>

                        <strong>
                            {screens.length}
                        </strong>

                    </div>

                </div>

            </div>

        </div>
    );
}


/* =========================================================
   ADMIN METRIC
========================================================= */

function Metric({
                    icon,
                    label,
                    value
                }) {

    return (
        <div className="metric">

            <div>
                {icon}
            </div>

            <span>
          {label}
        </span>

            <strong>
                {value}
            </strong>

        </div>
    );
}


/* =========================================================
   ADMIN HEADER
========================================================= */

function AdminHeader({
                         title,
                         action
                     }) {

    return (
        <header className="admin-header">

            <div>

                <h1>
                    {title}
                </h1>

                <p>
                    Manage your BookMyShow catalogue.
                </p>

            </div>


            {action}

        </header>
    );
}


/* =========================================================
   ADMIN MOVIES
========================================================= */

function AdminMovies() {

    const [movies, setMovies] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const navigate =
        useNavigate();


    async function load() {

        setLoading(true);


        try {

            const data =
                await api.getMovies();


            setMovies(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            alert(error.message);

        } finally {

            setLoading(false);

        }
    }


    useEffect(() => {
        load();
    }, []);


    async function remove(id) {

        const confirmed =
            window.confirm(
                'Delete this movie?'
            );


        if (!confirmed) {
            return;
        }


        try {

            await api.deleteMovie(id);

            await load();

        } catch (error) {

            alert(error.message);

        }
    }


    return (
        <div>

            <AdminHeader
                title="Movies"
                action={
                    <button
                        className="btn primary"
                        onClick={() =>
                            navigate(
                                '/admin/movies/new'
                            )
                        }
                    >

                        <Plus />

                        Add Movie

                    </button>
                }
            />


            <div className="admin-panel table-wrap">

                {loading ? (

                    <Loading />

                ) : movies.length === 0 ? (

                    <EmptyAdmin
                        text="No movies yet. Add your first movie."
                    />

                ) : (

                    <table>

                        <thead>

                        <tr>

                            <th>
                                Poster
                            </th>

                            <th>
                                Movie
                            </th>

                            <th>
                                Languages
                            </th>

                            <th>
                                Genres
                            </th>

                            <th>
                                Release
                            </th>

                            <th>
                                Actions
                            </th>

                        </tr>

                        </thead>


                        <tbody>

                        {movies.map(movie => (

                            <tr key={movie.id}>

                                <td>

                                    <img
                                        className="table-poster"
                                        src={posterUrl(movie)}
                                        alt={movie.title}
                                    />

                                </td>


                                <td>

                                    <b>
                                        {movie.title}
                                    </b>

                                    <small>
                                        {movie.durationMinutes}
                                        {' '}
                                        min
                                    </small>

                                </td>


                                <td>

                                    {(movie.languages || [])
                                        .map(pretty)
                                        .join(', ')}

                                </td>


                                <td>

                                    {(movie.genres || [])
                                        .map(pretty)
                                        .join(', ')}

                                </td>


                                <td>

                                    {formatDate(
                                        movie.releaseDate
                                    )}

                                </td>


                                <td className="actions">

                                    <button
                                        title="Edit movie"
                                        onClick={() =>
                                            navigate(
                                                `/admin/movies/${movie.id}/edit`
                                            )
                                        }
                                    >
                                        <Pencil />
                                    </button>


                                    <button
                                        title="Delete movie"
                                        onClick={() =>
                                            remove(movie.id)
                                        }
                                    >
                                        <Trash2 />
                                    </button>

                                </td>

                            </tr>

                        ))}

                        </tbody>

                    </table>

                )}

            </div>

        </div>
    );
}


/* =========================================================
   MOVIE FORM
========================================================= */

function MovieForm() {

    const { id } =
        useParams();

    const edit =
        Boolean(id);

    const navigate =
        useNavigate();


    const [form, setForm] =
        useState({
            title: '',
            durationMinutes: '',
            releaseDate: '',
            languages: '',
            genres: '',
            cast: '',
            description: ''
        });


    const [poster, setPoster] =
        useState(null);

    const [preview, setPreview] =
        useState('');

    const [busy, setBusy] =
        useState(false);


    useEffect(() => {

        if (!edit) {
            return;
        }


        api.getMovie(id)
            .then(movie => {

                setForm({

                    title:
                        movie.title || '',

                    durationMinutes:
                        movie.durationMinutes || '',

                    releaseDate:
                        movie.releaseDate || '',

                    languages:
                        (movie.languages || [])
                            .join(', '),

                    genres:
                        (movie.genres || [])
                            .join(', '),

                    cast:
                        (movie.cast || [])
                            .join(', '),

                    description:
                        movie.description || ''

                });


                setPreview(
                    posterUrl(movie)
                );

            })
            .catch(error => {

                alert(error.message);

            });

    }, [id, edit]);


    function change(event) {

        setForm({

            ...form,

            [event.target.name]:
            event.target.value

        });
    }


    function selectPoster(event) {

        const file =
            event.target.files?.[0];


        if (!file) {
            return;
        }


        setPoster(file);


        setPreview(
            URL.createObjectURL(file)
        );
    }


    function moviePayload() {

        return {

            title:
            form.title,

            durationMinutes:
                Number(
                    form.durationMinutes
                ),

            releaseDate:
                form.releaseDate || null,

            languages:
                form.languages
                    .split(',')
                    .map(
                        value =>
                            value.trim()
                                .toUpperCase()
                    )
                    .filter(Boolean),

            genres:
                form.genres
                    .split(',')
                    .map(
                        value =>
                            value.trim()
                                .toUpperCase()
                                .replaceAll(
                                    ' ',
                                    '_'
                                )
                    )
                    .filter(Boolean),

            cast:
                form.cast
                    .split(',')
                    .map(
                        value =>
                            value.trim()
                    )
                    .filter(Boolean),

            description:
            form.description

        };
    }


    async function submit(event) {

        event.preventDefault();


        if (!edit && !poster) {

            alert(
                'Poster is required for a new movie.'
            );

            return;
        }


        setBusy(true);


        try {

            const movie =
                moviePayload();


            if (edit) {

                await api.updateMovie({
                    id,
                    movie,
                    poster
                });

            } else {

                await api.createMovie({
                    movie,
                    poster
                });

            }


            navigate(
                '/admin/movies'
            );

        } catch (error) {

            alert(error.message);

        } finally {

            setBusy(false);

        }
    }


    return (
        <div>

            <AdminHeader
                title={
                    edit
                        ? 'Edit Movie'
                        : 'Add Movie'
                }
            />


            <form
                className="admin-panel form movie-form"
                onSubmit={submit}
            >

                <div className="form-grid">

                    <label>

                        Movie title

                        <input
                            name="title"
                            value={form.title}
                            onChange={change}
                            required
                        />

                    </label>


                    <label>

                        Duration (minutes)

                        <input
                            type="number"
                            name="durationMinutes"
                            value={
                                form.durationMinutes
                            }
                            onChange={change}
                            min="1"
                            required
                        />

                    </label>


                    <label>

                        Release date

                        <input
                            type="date"
                            name="releaseDate"
                            value={
                                form.releaseDate
                            }
                            onChange={change}
                        />

                    </label>


                    <label>

                        Languages

                        <small>
                            Example: HINDI, ENGLISH
                        </small>

                        <input
                            name="languages"
                            value={
                                form.languages
                            }
                            onChange={change}
                            required
                        />

                    </label>


                    <label>

                        Genres

                        <small>
                            Example: ACTION, DRAMA
                        </small>

                        <input
                            name="genres"
                            value={
                                form.genres
                            }
                            onChange={change}
                            required
                        />

                    </label>


                    <label>

                        Cast

                        <small>
                            Comma separated
                        </small>

                        <input
                            name="cast"
                            value={
                                form.cast
                            }
                            onChange={change}
                        />

                    </label>

                </div>


                <label>

                    Description

                    <textarea
                        name="description"
                        value={
                            form.description
                        }
                        onChange={change}
                        rows="5"
                    />

                </label>


                <label>

                    Poster

                    {!edit && (
                        <b className="required">
                            required
                        </b>
                    )}

                    <input
                        type="file"
                        accept="
                  image/jpeg,
                  image/png,
                  image/webp
                "
                        onChange={
                            selectPoster
                        }
                    />

                </label>


                {preview && (

                    <img
                        className="upload-preview"
                        src={preview}
                        alt="Poster preview"
                    />

                )}


                <div className="form-actions">

                    <button
                        type="button"
                        className="btn secondary"
                        onClick={() =>
                            navigate(
                                '/admin/movies'
                            )
                        }
                    >
                        Cancel
                    </button>


                    <button
                        className="btn primary"
                        disabled={busy}
                    >

                        {busy
                            ? 'Saving…'
                            : edit
                                ? 'Update Movie'
                                : 'Create Movie'}

                    </button>

                </div>

            </form>

        </div>
    );
}


/* =========================================================
   ADMIN SHOWS
========================================================= */

function AdminShows() {

    const [shows, setShows] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const navigate =
        useNavigate();


    async function load() {

        setLoading(true);


        try {

            const data =
                await api.getShows();


            setShows(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            alert(error.message);

        } finally {

            setLoading(false);

        }
    }


    useEffect(() => {
        load();
    }, []);


    async function remove(id) {

        if (
            !window.confirm(
                'Delete this show?'
            )
        ) {
            return;
        }


        try {

            await api.deleteShow(id);

            await load();

        } catch (error) {

            alert(error.message);

        }
    }


    return (
        <div>

            <AdminHeader
                title="Shows"
                action={
                    <button
                        className="btn primary"
                        onClick={() =>
                            navigate(
                                '/admin/shows/new'
                            )
                        }
                    >

                        <Plus />

                        Add Show

                    </button>
                }
            />


            <div className="admin-panel table-wrap">

                {loading ? (

                    <Loading />

                ) : shows.length === 0 ? (

                    <EmptyAdmin
                        text="No shows yet. Create a show for an existing movie and screen."
                    />

                ) : (

                    <table>

                        <thead>

                        <tr>

                            <th>
                                Movie
                            </th>

                            <th>
                                Date
                            </th>

                            <th>
                                Time
                            </th>

                            <th>
                                Screen
                            </th>

                            <th>
                                Venue
                            </th>

                            <th>
                                Actions
                            </th>

                        </tr>

                        </thead>


                        <tbody>

                        {shows.map(show => (

                            <tr key={show.id}>

                                <td>

                                    <b>
                                        {
                                            show.movie?.title ||
                                            `Movie #${show.movie?.id || ''}`
                                        }
                                    </b>

                                </td>


                                <td>

                                    {formatDate(
                                        show.showDate
                                    )}

                                </td>


                                <td>

                                    {formatTime(
                                        show.startTime
                                    )}

                                    {' – '}

                                    {formatTime(
                                        show.endTime
                                    )}

                                </td>


                                <td>

                                    {
                                        show.screen?.screenName ||
                                        show.screen?.id ||
                                        '—'
                                    }

                                </td>


                                <td>

                                    {
                                        show.screen?.venue?.name ||
                                        '—'
                                    }

                                </td>


                                <td className="actions">

                                    <button
                                        title="Edit show"
                                        onClick={() =>
                                            navigate(
                                                `/admin/shows/${show.id}/edit`
                                            )
                                        }
                                    >
                                        <Pencil />
                                    </button>


                                    <button
                                        title="Delete show"
                                        onClick={() =>
                                            remove(show.id)
                                        }
                                    >
                                        <Trash2 />
                                    </button>

                                </td>

                            </tr>

                        ))}

                        </tbody>

                    </table>

                )}

            </div>

        </div>
    );
}


/* =========================================================
   SHOW FORM
========================================================= */

function ShowForm() {
    const { id } = useParams();
    const edit = Boolean(id);
    const navigate = useNavigate();

    const [movies, setMovies] = useState([]);
    const [venues, setVenues] = useState([]);
    const [screens, setScreens] = useState([]);

    const [form, setForm] = useState({
        movieId: '',
        venueId: '',
        screenId: '',
        showDate: '',
        startTime: '',
        endTime: '',
        reclinerPrice: '',
        vipPrice: '',
        couplePrice: '',
        premiumPrice: '',
        regularPrice: ''
    });

    const [busy, setBusy] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const [movieData, venueData] = await Promise.all([
                    api.getMovies(),
                    api.getVenues()
                ]);

                setMovies(Array.isArray(movieData) ? movieData : []);
                setVenues(Array.isArray(venueData) ? venueData : []);

                if (edit) {
                    const show = await api.getShow(id);

                    const venueId = show.screen?.venue?.id || '';

                    setForm({
                        movieId: show.movie?.id || '',
                        venueId,
                        screenId: show.screen?.id || '',
                        showDate: show.showDate || '',
                        startTime: String(show.startTime || '').slice(0, 5),
                        endTime: String(show.endTime || '').slice(0, 5),
                        reclinerPrice: show.reclinerPrice ?? '',
                        vipPrice: show.vipPrice ?? '',
                        couplePrice: show.couplePrice ?? '',
                        premiumPrice: show.premiumPrice ?? '',
                        regularPrice: show.regularPrice ?? ''
                    });

                    if (venueId) {
                        const venue = await api.getVenue(venueId);

                        setScreens(
                            Array.isArray(venue?.screens)
                                ? venue.screens
                                : []
                        );
                    }
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [id, edit]);

    async function change(event) {
        const { name, value } = event.target;

        if (name === 'venueId') {
            setForm(current => ({
                ...current,
                venueId: value,
                screenId: ''
            }));

            setScreens([]);
            setError('');

            if (!value) {
                return;
            }

            try {
                const venue = await api.getVenue(value);

                setScreens(
                    Array.isArray(venue?.screens)
                        ? venue.screens
                        : []
                );
            } catch (error) {
                setError(error.message);
            }

            return;
        }

        setForm(current => ({
            ...current,
            [name]: value
        }));

        setError('');
    }

    async function submit(event) {
        event.preventDefault();

        setError('');

        if (!form.movieId) {
            setError('Please select a movie.');
            return;
        }

        if (!form.venueId) {
            setError('Please select a venue.');
            return;
        }

        if (!form.screenId) {
            setError('Please select a screen.');
            return;
        }

        if (!form.showDate) {
            setError('Please select a show date.');
            return;
        }
        if (form.startTime >= form.endTime) {
            setError('Start time must be before end time.');
            return;
        }
        const priceFields = ['reclinerPrice', 'vipPrice', 'couplePrice', 'premiumPrice', 'regularPrice'];
        if (priceFields.some(field => form[field] === '' || Number(form[field]) < 0)) {
            setError('Please enter a valid price for every seat category.');
            return;
        }

        setBusy(true);

        const payload = {
            movie: {
                id: Number(form.movieId)
            },
            screen: {
                id: Number(form.screenId)
            },
            showDate: form.showDate,
            startTime: `${form.startTime}:00`,
            endTime: `${form.endTime}:00`,
            reclinerPrice: Number(form.reclinerPrice),
            vipPrice: Number(form.vipPrice),
            couplePrice: Number(form.couplePrice),
            premiumPrice: Number(form.premiumPrice),
            regularPrice: Number(form.regularPrice)
        };

        try {
            if (edit) {
                await api.updateShow(id, payload);
            } else {
                await api.createShow(payload);
            }

            navigate('/admin/shows');
        } catch (error) {
            setError(error.message);
        } finally {
            setBusy(false);
        }
    }

    if (loading) {
        return <Loading />;
    }

    return (
        <div>
            <AdminHeader
                title={edit ? 'Edit Show' : 'Add Show'}
            />

            <form
                className="admin-panel form"
                onSubmit={submit}
            >
                <label>
                    Movie

                    <select
                        name="movieId"
                        value={form.movieId}
                        onChange={change}
                        required
                    >
                        <option value="">
                            Select movie
                        </option>

                        {movies.map(movie => (
                            <option
                                key={movie.id}
                                value={movie.id}
                            >
                                {movie.title}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    Venue

                    <select
                        name="venueId"
                        value={form.venueId}
                        onChange={change}
                        required
                    >
                        <option value="">
                            Select venue
                        </option>

                        {venues.map(venue => (
                            <option
                                key={venue.id}
                                value={venue.id}
                            >
                                {venue.name} — {venue.city}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    Screen

                    <select
                        name="screenId"
                        value={form.screenId}
                        onChange={change}
                        disabled={!form.venueId || screens.length === 0}
                        required
                    >
                        <option value="">
                            {form.venueId
                                ? 'Select screen'
                                : 'Select venue first'}
                        </option>

                        {screens.map(screen => (
                            <option
                                key={screen.id}
                                value={screen.id}
                            >
                                {screen.screenName}
                            </option>
                        ))}
                    </select>
                </label>

                {form.venueId && screens.length === 0 && (
                    <small>
                        No screens are available for this venue.
                    </small>
                )}

                <label>
                    Show date

                    <input
                        type="date"
                        name="showDate"
                        value={form.showDate}
                        onChange={change}
                        required
                    />
                </label>

                <div className="two-col">
                    <label>
                        Start time

                        <input
                            type="time"
                            name="startTime"
                            value={form.startTime}
                            onChange={change}
                            required
                        />
                    </label>

                    <label>
                        End time

                        <input
                            type="time"
                            name="endTime"
                            value={form.endTime}
                            onChange={change}
                            required
                        />
                    </label>
                </div>

                <div className="show-pricing-panel">
                    <div>
                        <h2>Seat Pricing</h2>
                        <p>Set the price for each seat category for this show.</p>
                    </div>
                    <div className="pricing-grid">
                        {[
                            ['reclinerPrice', 'Recliner'],
                            ['vipPrice', 'VIP'],
                            ['couplePrice', 'Couple'],
                            ['premiumPrice', 'Premium'],
                            ['regularPrice', 'Regular']
                        ].map(([name, label]) => (
                            <label key={name}>
                                {label}
                                <div className="price-input"><span>₹</span><input type="number" min="0" step="1" name={name} value={form[name]} onChange={change} placeholder="199" required /></div>
                            </label>
                        ))}
                    </div>
                    <small className="pricing-help">These prices apply to seats of the corresponding category for this show.</small>
                </div>

                {error && (
                    <div className="form-error">
                        {error}
                    </div>
                )}

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn secondary"
                        onClick={() => navigate('/admin/shows')}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="btn primary"
                        disabled={busy}
                    >
                        {busy
                            ? 'Saving…'
                            : edit
                                ? 'Update Show'
                                : 'Create Show'}
                    </button>
                </div>
            </form>
        </div>
    );
}


/* =========================================================
   ADMIN VENUES
========================================================= */

function AdminVenues() {

    const [venues, setVenues] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const navigate =
        useNavigate();


    async function load() {

        setLoading(true);


        try {

            const data =
                await api.getVenues();


            setVenues(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            alert(error.message);

        } finally {

            setLoading(false);

        }
    }


    useEffect(() => {
        load();
    }, []);


    async function remove(id) {

        if (
            !window.confirm(
                'Delete this venue? This may also delete its screens and seats depending on your backend cascade configuration.'
            )
        ) {
            return;
        }


        try {

            await api.deleteVenue(id);

            await load();

        } catch (error) {

            alert(error.message);

        }
    }


    return (
        <div>

            <AdminHeader
                title="Venues"
                action={

                    <button
                        className="btn primary"
                        onClick={() =>
                            navigate(
                                '/admin/venues/new'
                            )
                        }
                    >

                        <Plus />

                        Add Venue

                    </button>

                }
            />


            <div className="admin-panel table-wrap">

                {loading ? (

                    <Loading />

                ) : venues.length === 0 ? (

                    <EmptyAdmin
                        text="No venues yet. Add your first cinema venue."
                    />

                ) : (

                    <table>

                        <thead>

                        <tr>

                            <th>
                                Venue
                            </th>

                            <th>
                                City
                            </th>

                            <th>
                                Address
                            </th>

                            <th>
                                Screens
                            </th>

                            <th>
                                Actions
                            </th>

                        </tr>

                        </thead>


                        <tbody>

                        {venues.map(venue => (

                            <tr key={venue.id}>

                                <td>

                                    <b>
                                        {venue.name}
                                    </b>

                                </td>


                                <td>
                                    {venue.city || '—'}
                                </td>


                                <td>
                                    {venue.address || '—'}
                                </td>


                                <td>

                                    <strong>
                                        {(venue.screens || []).length}
                                    </strong>

                                </td>


                                <td className="actions">

                                    <button
                                        title="Edit venue"
                                        onClick={() =>
                                            navigate(
                                                `/admin/venues/${venue.id}/edit`
                                            )
                                        }
                                    >
                                        <Pencil />
                                    </button>


                                    <button
                                        title="Delete venue"
                                        onClick={() =>
                                            remove(venue.id)
                                        }
                                    >
                                        <Trash2 />
                                    </button>

                                </td>

                            </tr>

                        ))}

                        </tbody>

                    </table>

                )}

            </div>

        </div>
    );
}


/* =========================================================
   VENUE FORM
========================================================= */

function VenueForm() {

    const { id } =
        useParams();

    const edit =
        Boolean(id);

    const navigate =
        useNavigate();


    const [form, setForm] =
        useState({

            name: '',

            city: '',

            address: ''

        });


    const [busy, setBusy] =
        useState(false);


    useEffect(() => {

        if (!edit) {
            return;
        }


        api.getVenue(id)
            .then(venue => {

                setForm({

                    name:
                        venue.name || '',

                    city:
                        venue.city || '',

                    address:
                        venue.address || ''

                });

            })
            .catch(error => {

                alert(error.message);

            });

    }, [id, edit]);


    function change(event) {

        setForm({

            ...form,

            [event.target.name]:
            event.target.value

        });
    }


    async function submit(event) {

        event.preventDefault();

        setBusy(true);


        const payload = {

            name:
                form.name.trim(),

            city:
                form.city.trim(),

            address:
                form.address.trim()

        };


        try {

            if (edit) {

                await api.updateVenue(
                    id,
                    payload
                );

            } else {

                await api.createVenue(
                    payload
                );

            }


            navigate(
                '/admin/venues'
            );

        } catch (error) {

            alert(error.message);

        } finally {

            setBusy(false);

        }
    }


    return (
        <div>

            <AdminHeader
                title={
                    edit
                        ? 'Edit Venue'
                        : 'Add Venue'
                }
            />


            <form
                className="admin-panel form"
                onSubmit={submit}
            >

                <label>

                    Venue name

                    <input
                        name="name"
                        value={form.name}
                        onChange={change}
                        placeholder="PVR Cinemas"
                        required
                    />

                </label>


                <label>

                    City

                    <input
                        name="city"
                        value={form.city}
                        onChange={change}
                        placeholder="Mumbai"
                        required
                    />

                </label>


                <label>

                    Address

                    <textarea
                        name="address"
                        value={form.address}
                        onChange={change}
                        placeholder="Enter complete venue address"
                        rows="4"
                        required
                    />

                </label>


                <div className="form-actions">

                    <button
                        type="button"
                        className="btn secondary"
                        onClick={() =>
                            navigate(
                                '/admin/venues'
                            )
                        }
                    >
                        Cancel
                    </button>


                    <button
                        className="btn primary"
                        disabled={busy}
                    >

                        {busy
                            ? 'Saving…'
                            : edit
                                ? 'Update Venue'
                                : 'Create Venue'}

                    </button>

                </div>

            </form>

        </div>
    );
}


/* =========================================================
   ADMIN SCREENS
========================================================= */

function AdminScreens() {

    const [venues, setVenues] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const navigate =
        useNavigate();


    async function load() {

        setLoading(true);


        try {

            const data =
                await api.getVenues();


            setVenues(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            alert(error.message);

        } finally {

            setLoading(false);

        }
    }


    useEffect(() => {
        load();
    }, []);


    async function remove(id) {

        if (
            !window.confirm(
                'Delete this screen?'
            )
        ) {
            return;
        }


        try {

            await api.deleteScreen(id);

            await load();

        } catch (error) {

            alert(error.message);

        }
    }


    const screens =
        flattenScreens(venues);


    return (
        <div>

            <AdminHeader
                title="Screens"
                action={

                    <button
                        className="btn primary"
                        onClick={() =>
                            navigate(
                                '/admin/screens/new'
                            )
                        }
                    >

                        <Plus />

                        Add Screen

                    </button>

                }
            />


            <div className="admin-panel table-wrap">

                {loading ? (

                    <Loading />

                ) : screens.length === 0 ? (

                    <EmptyAdmin
                        text="No screens yet. Create a screen inside a venue."
                    />

                ) : (

                    <table>

                        <thead>

                        <tr>

                            <th>
                                Screen
                            </th>

                            <th>
                                Venue
                            </th>

                            <th>
                                City
                            </th>

                            <th>
                                Total Seats
                            </th>

                            <th>
                                Actions
                            </th>

                        </tr>

                        </thead>


                        <tbody>

                        {screens.map(screen => (

                            <tr key={screen.id}>

                                <td>

                                    <b>

                                        {
                                            screen.screenName ||
                                            `Screen ${screen.id}`
                                        }

                                    </b>

                                </td>


                                <td>

                                    {
                                        screen.venue?.name ||
                                        '—'
                                    }

                                </td>


                                <td>

                                    {
                                        screen.venue?.city ||
                                        '—'
                                    }

                                </td>


                                <td>

                                    <strong>
                                        {screen.totalSeats || 0}
                                    </strong>

                                </td>


                                <td className="actions">

                                    <button
                                        title="Edit screen"
                                        onClick={() =>
                                            navigate(
                                                `/admin/screens/${screen.id}/edit`
                                            )
                                        }
                                    >
                                        <Pencil />
                                    </button>


                                    <button
                                        title="Delete screen"
                                        onClick={() =>
                                            remove(screen.id)
                                        }
                                    >
                                        <Trash2 />
                                    </button>

                                </td>

                            </tr>

                        ))}

                        </tbody>

                    </table>

                )}

            </div>

        </div>
    );
}


/* =========================================================
   SCREEN FORM
========================================================= */

function ScreenForm() {

    const { id } =
        useParams();

    const edit =
        Boolean(id);

    const navigate =
        useNavigate();


    const [venues, setVenues] =
        useState([]);


    const [form, setForm] =
        useState({

            screenName: '',

            totalSeats: '',

            venueId: ''

        });


    const [busy, setBusy] =
        useState(false);

    const [loading, setLoading] =
        useState(true);


    useEffect(() => {

        async function load() {

            setLoading(true);


            try {

                const venueData =
                    await api.getVenues();


                setVenues(
                    Array.isArray(venueData)
                        ? venueData
                        : []
                );


                if (edit) {

                    const screen =
                        await api.getScreen(id);


                    setForm({

                        screenName:
                            screen.screenName || '',

                        totalSeats:
                            screen.totalSeats || '',

                        venueId:
                            screen.venue?.id || ''

                    });

                }

            } catch (error) {

                alert(error.message);

            } finally {

                setLoading(false);

            }

        }


        load();

    }, [id, edit]);


    function change(event) {

        setForm({

            ...form,

            [event.target.name]:
            event.target.value

        });
    }


    async function submit(event) {

        event.preventDefault();

        setBusy(true);


        /*
     * IMPORTANT:
     *
     * Screen belongs to Venue.
     *
     * We therefore send:
     *
     * {
     *   screenName: "...",
     *   totalSeats: 100,
     *   venue: {
     *     id: 1
     *   }
     * }
     */

        const payload = {

            screenName:
                form.screenName.trim(),

            totalSeats:
                Number(
                    form.totalSeats
                ),

            venue: {
                id:
                    Number(
                        form.venueId
                    )
            }

        };


        try {

            if (edit) {

                await api.updateScreen(
                    id,
                    payload
                );

            } else {

                await api.createScreen(
                    payload
                );

            }


            navigate(
                '/admin/screens'
            );

        } catch (error) {

            alert(error.message);

        } finally {

            setBusy(false);

        }
    }


    if (loading) {
        return <Loading />;
    }


    return (
        <div>

            <AdminHeader
                title={
                    edit
                        ? 'Edit Screen'
                        : 'Add Screen'
                }
            />


            <form
                className="admin-panel form"
                onSubmit={submit}
            >

                <label>

                    Venue

                    <select
                        name="venueId"
                        value={form.venueId}
                        onChange={change}
                        required
                    >

                        <option value="">
                            Select venue
                        </option>


                        {venues.map(venue => (

                            <option
                                key={venue.id}
                                value={venue.id}
                            >

                                {venue.name}

                                {venue.city
                                    ? ` — ${venue.city}`
                                    : ''}

                            </option>

                        ))}

                    </select>

                </label>


                {venues.length === 0 && (

                    <div className="notice">

                        No venues exist yet.

                        {' '}

                        <Link
                            to="/admin/venues/new"
                        >
                            Create a venue first.
                        </Link>

                    </div>

                )}


                <label>

                    Screen name

                    <input
                        name="screenName"
                        value={
                            form.screenName
                        }
                        onChange={change}
                        placeholder="Screen 1"
                        required
                    />

                </label>


                <label>

                    Total seats

                    <input
                        type="number"
                        name="totalSeats"
                        value={
                            form.totalSeats
                        }
                        onChange={change}
                        min="1"
                        placeholder="100"
                        required
                    />

                </label>


                <div className="form-actions">

                    <button
                        type="button"
                        className="btn secondary"
                        onClick={() =>
                            navigate(
                                '/admin/screens'
                            )
                        }
                    >
                        Cancel
                    </button>


                    <button
                        className="btn primary"
                        disabled={
                            busy ||
                            venues.length === 0
                        }
                    >

                        {busy
                            ? 'Saving…'
                            : edit
                                ? 'Update Screen'
                                : 'Create Screen'}

                    </button>

                </div>

            </form>

        </div>
    );
}


/* =========================================================
   COMMON COMPONENTS
========================================================= */

function EmptyAdmin({
                        text
                    }) {

    return (
        <div className="empty-admin">

            <Film size={30} />

            <p>
                {text}
            </p>

        </div>
    );
}


function AuthLayout({
                        title,
                        subtitle,
                        children
                    }) {

    return (
        <div className="auth-page">

            <div className="auth-card">

                <div className="logo big">

            <span>
              BMS
            </span>

                    BookMyShow

                </div>


                <h1>
                    {title}
                </h1>


                <p>
                    {subtitle}
                </p>


                {children}


                <Link
                    to="/"
                    className="back"
                >
                    ← Back to website
                </Link>

            </div>

        </div>
    );
}


function Loading() {

    return (
        <div className="loading">
            Loading…
        </div>
    );
}


function NotFound() {

    return (
        <div className="empty-page">

            <div className="empty-icon">
                <X size={36} />
            </div>


            <h1>
                Page not found
            </h1>


            <Link
                className="btn primary"
                to="/"
            >
                Back Home
            </Link>

        </div>
    );
}


function SectionTitle({
                          title,
                          action
                      }) {

    return (
        <div className="section-title">

            <h2>
                {title}
            </h2>

            {action}

        </div>
    );
}


/* =========================================================
   EXPORT
========================================================= */

export default App;