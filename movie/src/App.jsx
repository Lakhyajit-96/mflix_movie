import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import { useDebounce } from 'react-use'
import { getTrendingMovies, updateSearchCount } from './appwrite.js'

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
}

const App = () => {
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
    const [searchTerm, setSearchTerm] = useState('');

    const [movieList, setMovieList] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [trendingMovies, setTrendingMovies] = useState([]);

    // Debounce the search term to prevent making too many API requests
    // by waiting for the user to stop typing for 500ms
    useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

    const fetchMovies = async (query = '') => {
        setIsLoading(true);
        setErrorMessage('');

        // Check if API key is available
        if (!API_KEY) {
            setErrorMessage('TMDB API key is not configured. Please check your environment variables.');
            setIsLoading(false);
            return;
        }

        try {
            let endpoint;
            
            if (query) {
                // Search movies
                endpoint = `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`;
            } else {
                // Get different movies on each refresh by randomizing the page and sort criteria
                const sortOptions = [
                    'popularity.desc',
                    'vote_average.desc',
                    'release_date.desc',
                    'vote_count.desc',
                    'revenue.desc'
                ];
                
                const randomSort = sortOptions[Math.floor(Math.random() * sortOptions.length)];
                const randomPage = Math.floor(Math.random() * 5) + 1; // Random page 1-5
                
                endpoint = `${API_BASE_URL}/discover/movie?sort_by=${randomSort}&page=${randomPage}&include_adult=false&include_video=false&language=en-US`;
            }

            const response = await fetch(endpoint, API_OPTIONS);

            if(!response.ok) {
                throw new Error(`Failed to fetch movies: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if(data.Response === 'False') {
                setErrorMessage(data.Error || 'Failed to fetch movies');
                setMovieList([]);
                return;
            }

            // Shuffle the results for even more variety
            const shuffledResults = data.results ? [...data.results].sort(() => Math.random() - 0.5) : [];
            setMovieList(shuffledResults);

            if(query && data.results.length > 0) {
                try {
                    await updateSearchCount(query, data.results[0]);
                } catch (appwriteError) {
                    // Appwrite is optional, so we ignore errors here
                    console.log('Appwrite not configured, skipping search count update');
                }
            }
        } catch (error) {
            console.error(`Error fetching movies: ${error}`);
            setErrorMessage('Error fetching movies. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }

    const loadTrendingMovies = async () => {
        try {
            // Try Appwrite-sourced trending list first
            const movies = await getTrendingMovies();

            if (Array.isArray(movies) && movies.length > 0) {
                setTrendingMovies(movies);
                return;
            }

            // Fallback: fetch TMDB trending if Appwrite is not configured or empty
            if (!API_KEY) {
                console.log('TMDB API key not available, skipping trending movies');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/trending/movie/day?language=en-US`, API_OPTIONS);

            if (response.ok) {
                const data = await response.json();
                const mapped = (data.results || []).slice(0, 5).map((m) => ({
                    $id: String(m.id),
                    poster_url: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : '/no-movie.png',
                    title: m.title,
                }));
                setTrendingMovies(mapped);
            }
        } catch (error) {
            console.error(`Error fetching trending movies: ${error}`);
        }
    }

    useEffect(() => {
        fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        loadTrendingMovies();
    }, []);

    return (
        <main>
            <div className="pattern"/>

            <div className="wrapper">
                <header>
                    <img src="/logo.png" alt="Logo" className="site-logo" />
                    <img src="/hero.png" alt="Hero Banner" className="hero-img" />
                    <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>

                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </header>

                {trendingMovies.length > 0 && (
                    <section className="trending">
                        <h2>Trending Movies</h2>

                        <ul>
                            {trendingMovies.map((movie, index) => {
                                const targetId = movie.movie_id ?? movie.$id ?? movie.title;
                                return (
                                    <li key={movie.$id || movie.movie_id || index}>
                                        <p>{index + 1}</p>
                                        <Link to={`/movie/${encodeURIComponent(targetId)}`}>
                                            <img src={movie.poster_url} alt={movie.title || 'Trending movie'} />
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </section>
                )}

                <section className="all-movies">
                    <h2>All Movies</h2>

                    {isLoading ? (
                        <Spinner />
                    ) : errorMessage ? (
                        <div className="text-center py-8">
                            <p className="text-red-500 mb-4">{errorMessage}</p>
                            <button 
                                onClick={() => fetchMovies(debouncedSearchTerm)}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <ul>
                            {movieList.map((movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </main>
    )
}

export default App