import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import WatchButton from '../components/WatchButton'
import HomepageButton from '../components/HomepageButton'

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
}

const MovieDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [details, setDetails] = useState(null);
    const [videos, setVideos] = useState([]);
    const [showVideo, setShowVideo] = useState(false);

    useEffect(() => {
        let isCancelled = false;

        const load = async () => {
            setIsLoading(true);
            setErrorMessage('');

            try {
                let movieId = id;
                if (!/^\d+$/.test(id)) {
                    const searchResp = await fetch(`${API_BASE_URL}/search/movie?query=${encodeURIComponent(id)}`, API_OPTIONS);
                    if (searchResp.ok) {
                        const data = await searchResp.json();
                        if (data.results && data.results.length > 0) {
                            movieId = String(data.results[0].id);
                        }
                    }
                }

                const [detailsResp, videosResp] = await Promise.all([
                    fetch(`${API_BASE_URL}/movie/${movieId}`, API_OPTIONS),
                    fetch(`${API_BASE_URL}/movie/${movieId}/videos`, API_OPTIONS),
                ]);

                if (!detailsResp.ok) throw new Error('Failed to fetch movie details');

                const detailsJson = await detailsResp.json();
                let videosJson = { results: [] };
                if (videosResp.ok) videosJson = await videosResp.json();

                if (!isCancelled) {
                    setDetails(detailsJson);
                    setVideos(videosJson.results || []);
                }
            } catch (e) {
                if (!isCancelled) setErrorMessage('Could not load movie details.');
            } finally {
                if (!isCancelled) setIsLoading(false);
            }
        }

        load();
        return () => { isCancelled = true };
    }, [id]);

    const youtubeTrailer = useMemo(() => {
        return videos.find(v => v.site === 'YouTube' && v.type === 'Trailer');
    }, [videos]);

    const formatRuntime = (minutes) => {
        if (!minutes) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const formatCurrency = (amount) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
        }).format(amount / 1000000) + 'M';
    };

    if (isLoading) {
        return (
            <main>
                <div className="wrapper">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                    </div>
                </div>
            </main>
        )
    }

    if (errorMessage || !details) {
        return (
            <main>
                <div className="wrapper">
                    <button 
                        className="text-gray-200 hover:text-white transition-colors mb-6" 
                        onClick={() => navigate(-1)}
                    >
                        &larr; Back
                    </button>
                    <p className="text-red-500 mt-4">{errorMessage || 'Not found'}</p>
                </div>
            </main>
        )
    }

    return (
        <main className="relative overflow-hidden min-h-screen bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] flex items-center justify-center py-8">
            
            {/* Glowing border container */}
            <div className="relative w-full max-w-4xl mx-auto p-[1px] rounded-2xl bg-gradient-to-r from-white/35 via-white/20 to-white/10 animate-border-shine">
                <div className="relative bg-[#0d0d19] rounded-2xl p-6">
                    
                    <div className="relative z-10">
                        <button
                            className="text-gray-200 hover:text-white transition-colors mb-6" 
                            onClick={() => navigate(-1)}
                        >
                            &larr; Back
                        </button>

                                                 {/* Hero Section */}
                         <div className="hero-section mb-8">
                             {/* Title and Basic Info */}
                             <div className="mb-6">
                                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">{details.title}</h1>
                                
                                <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-4">
                                    <span>{details.release_date?.split('-')[0] || 'N/A'}</span>
                                    <span>•</span>
                                    <span>{details.mpaa_rating || 'N/A'}</span>
                                    <span>•</span>
                                    <span>{formatRuntime(details.runtime)}</span>
                                </div>

                                {/* Rating and Trending */}
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <img src="/star.svg" alt="Star" className="w-5 h-5" />
                                        <span className="text-white font-semibold">
                                            {details.vote_average ? details.vote_average.toFixed(1) : 'N/A'}/10
                                        </span>
                                        <span className="text-gray-400">
                                            ({details.vote_count ? Math.floor(details.vote_count / 1000) + 'K' : 'N/A'})
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 bg-purple-600/20 px-3 py-1 rounded-full">
                                        <span className="text-purple-400">↗️</span>
                                        <span className="text-purple-400 text-sm">Trending</span>
                                    </div>
                                </div>
                            </div>

                                                         {/* Poster and Video Section */}
                             <div className="flex flex-col lg:flex-row gap-6 items-start">
                                {/* Movie Poster */}
                                <div className="flex-shrink-0">
                                    <img
                                        src={details.poster_path ? `https://image.tmdb.org/t/p/w500/${details.poster_path}` : '/no-movie.png'}
                                        alt={details.title}
                                        className="w-64 h-96 object-cover rounded-lg shadow-2xl"
                                    />
                                </div>

                                {/* Trailer */}
                                {youtubeTrailer && (
                                    <div className="flex-1">
                                        <div className="w-full h-96 rounded-lg overflow-hidden shadow-2xl">
                                            {showVideo ? (
                                                <div className="relative w-full h-full">
                                                    <iframe
                                                        src={`https://www.youtube.com/embed/${youtubeTrailer.key}?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=1&enablejsapi=1`}
                                                        title="Movie Trailer"
                                                        className="w-full h-full"
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                        allowFullScreen
                                                    />
                                                    <button
                                                        onClick={() => setShowVideo(false)}
                                                        className="absolute top-2 right-2 bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition-colors"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                <div 
                                                    className="relative w-full h-full cursor-pointer group"
                                                    onClick={() => setShowVideo(true)}
                                                >
                                                    <img
                                                        src={`https://img.youtube.com/vi/${youtubeTrailer.key}/maxresdefault.jpg`}
                                                        alt="Trailer thumbnail"
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="bg-white/90 rounded-full p-6 group-hover:bg-white transition-colors group-hover:scale-110">
                                                            <div className="w-0 h-0 border-l-[16px] border-l-purple-600 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1"></div>
                                                        </div>
                                                    </div>
                                                    <div className="absolute bottom-4 left-4 text-white">
                                                        <div className="text-lg font-medium">Trailer</div>
                                                        <div className="text-sm text-gray-300">Click to play</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Detailed Information */}
                        <div className="details-section">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column - Genres and Overview */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Genres */}
                                    {details.genres && details.genres.length > 0 && (
                                        <div className="space-y-3">
                                            <h3 className="text-lg font-semibold text-white">Genres</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {details.genres.map((genre) => (
                                                    <span 
                                                        key={genre.id}
                                                        className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm hover:bg-purple-600/30 transition-colors cursor-pointer"
                                                    >
                                                        {genre.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Overview */}
                                    {details.overview && (
                                        <div className="space-y-3">
                                            <h3 className="text-lg font-semibold text-white">Overview</h3>
                                            <p className="text-gray-300 leading-relaxed">{details.overview}</p>
                                            {details.homepage && (
                                                <div className="mt-4">
                                                    <HomepageButton href={details.homepage} />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Where to Watch */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-white">Where to Watch</h3>
                                        
                                        {/* Streaming Services */}
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            <WatchButton
                                                service="netflix"
                                                href={`https://www.netflix.com/search?q=${encodeURIComponent(details.title)}`}
                                            />
                                            
                                            <WatchButton
                                                service="disney"
                                                href={`https://www.disneyplus.com/search?q=${encodeURIComponent(details.title)}`}
                                            />
                                            
                                            <WatchButton
                                                service="prime"
                                                href={`https://www.amazon.com/s?k=${encodeURIComponent(details.title + ' movie')}`}
                                            />
                                            
                                            <WatchButton
                                                service="hbo"
                                                href={`https://play.hbomax.com/search?q=${encodeURIComponent(details.title)}`}
                                            />
                                        </div>
                                        
                                        {/* Rental/Purchase Options */}
                                        <div className="pt-4 border-t border-gray-700/50">
                                            <h4 className="text-md font-medium text-white mb-3">Rent or Buy</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                <WatchButton
                                                    service="amazon"
                                                    href={`https://www.amazon.com/s?k=${encodeURIComponent(details.title + ' movie rent')}`}
                                                    className="text-xs px-3 py-2"
                                                />
                                                
                                                <WatchButton
                                                    service="googleplay"
                                                    href={`https://play.google.com/store/search?q=${encodeURIComponent(details.title + ' movie')}`}
                                                    className="text-xs px-3 py-2"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Production Details */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-white">Details</h3>
                                    
                                    <div className="space-y-4">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Release Date</span>
                                            <span className="text-white">{details.release_date ? new Date(details.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Status</span>
                                            <span className="text-white">{details.status || 'N/A'}</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Language</span>
                                            <span className="text-white">{details.original_language ? details.original_language.toUpperCase() : 'N/A'}</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Budget</span>
                                            <span className="text-white">{formatCurrency(details.budget)}</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Revenue</span>
                                            <span className="text-white">{formatCurrency(details.revenue)}</span>
                                        </div>

                                        {details.tagline && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Tagline</span>
                                                <span className="text-white italic">"{details.tagline}"</span>
                                            </div>
                                        )}

                                        {details.production_companies && details.production_companies.length > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Production</span>
                                                <span className="text-white text-right max-w-[200px]">
                                                    {details.production_companies.slice(0, 3).map(company => company.name).join(' • ')}
                                                    {details.production_companies.length > 3 && '...'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default MovieDetails