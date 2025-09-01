import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import MovieDetails from './pages/MovieDetails.jsx'

const router = createBrowserRouter([
    { path: '/', element: <App /> },
    { path: '/movie/:id', element: <MovieDetails /> },
])

createRoot(document.getElementById('root')).render(
    <RouterProvider router={router} />
)
