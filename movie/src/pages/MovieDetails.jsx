import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import WatchButton from '../components/WatchButton';
import HomepageButton from '../components/HomepageButton';

const MovieDetails = () => {
  const { id } = useParams();
  const [details, setDetails] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

  useEffect(() => {
    if (!TMDB_API_KEY) {
      setError('TMDB API key is not configured. Please check your environment variables.');
      setLoading(false);
      return;
    }
    
    fetchMovieDetails();
    fetchTrailer();
  }, [id, TMDB_API_KEY]);

  const fetchMovieDetails = async () => {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch movie details: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setDetails(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching movie details:', error);
      setError('Failed to load movie details. Please try again later.');
      setLoading(false);
    }
  };

  const fetchTrailer = async () => {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${id}/videos?api_key=${TMDB_API_KEY}`
      );
      
      if (!response.ok) {
        console.log('Failed to fetch trailer, continuing without trailer');
        return;
      }
      
      const data = await response.json();
      const trailerVideo = data.results.find(
        video => video.type === 'Trailer' && video.site === 'YouTube'
      );
      setTrailer(trailerVideo);
    } catch (error) {
      console.error('Error fetching trailer:', error);
    }
  };

  const formatRuntime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <Link 
            to="/"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Movie not found</div>
          <Link 
            to="/"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="relative overflow-hidden min-h-screen bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] flex items-center justify-center py-8">
      {/* Shiny border container */}
      <div className="max-w-4xl w-full p-[1px] bg-gradient-to-r from-white/35 via-white/20 to-white/10 rounded-2xl animate-border-shine">
        {/* Inner content */}
        <div className="bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] rounded-2xl p-6">
          {/* Back button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Movies
          </Link>

          {/* Hero Section */}
          <div className="mb-8">
            {/* Title and basic info */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">{details.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm">
                <span>{new Date(details.release_date).getFullYear()}</span>
                <span>•</span>
                <span>{formatRuntime(details.runtime)}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <img src="/star.svg" alt="Rating" className="w-4 h-4" />
                  {details.vote_average.toFixed(1)}
                </span>
                {details.budget > 0 && (
                  <>
                    <span>•</span>
                    <span>Budget: {formatCurrency(details.budget)}</span>
                  </>
                )}
              </div>
            </div>

            {/* Poster and Video/Info */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Poster */}
              <div className="flex-shrink-0">
                <img
                  src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
                  alt={details.title}
                  className="w-64 h-96 object-cover rounded-lg shadow-lg"
                />
              </div>

              {/* Video or Info */}
              <div className="flex-1">
                {showVideo && trailer ? (
                  <div className="relative w-full h-96 rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=1&enablejsapi=1`}
                      title="Movie Trailer"
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    <button
                      onClick={() => setShowVideo(false)}
                      className="absolute top-4 right-4 bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                    {trailer ? (
                      <>
                        <img
                          src={`https://img.youtube.com/vi/${trailer.key}/maxresdefault.jpg`}
                          alt="Trailer Thumbnail"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <button
                            onClick={() => setShowVideo(true)}
                            className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full transition-colors duration-200"
                          >
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-white/50 text-center">
                        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <p>No trailer available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Overview */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">Overview</h2>
            <p className="text-white/80 leading-relaxed">{details.overview}</p>
          </div>

          {/* Visit Homepage Button */}
          {details.homepage && (
            <div className="mb-8">
              <HomepageButton href={details.homepage} />
            </div>
          )}

          {/* Where to Watch Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Where to Watch</h2>
            
            {/* Streaming Services */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white/80 mb-3">Streaming Services</h3>
              <div className="flex flex-wrap gap-3">
                <WatchButton href="https://www.netflix.com" service="netflix" />
                <WatchButton href="https://www.disneyplus.com" service="disney" />
                <WatchButton href="https://www.primevideo.com" service="prime" />
                <WatchButton href="https://www.max.com" service="hbo" />
              </div>
            </div>

            {/* Rent or Buy */}
            <div>
              <h3 className="text-lg font-medium text-white/80 mb-3">Rent or Buy</h3>
              <div className="flex flex-wrap gap-3">
                <WatchButton href="https://www.amazon.com" service="amazon" />
                <WatchButton href="https://play.google.com" service="googleplay" />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {details.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-white/10 text-white rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Production Companies</h3>
              <div className="space-y-2">
                {details.production_companies.slice(0, 3).map((company) => (
                  <div key={company.id} className="text-white/80 text-sm">
                    {company.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MovieDetails;