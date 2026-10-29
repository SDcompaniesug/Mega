// src/hooks/useTitles.js
import { useState, useEffect } from 'react';

const API_URL = 'https://netowatch.app/hcgi/platform/api/collections/titles/records';

export function useTitles() {
  const [data, setData] = useState({ movies: [], series: [], topRated: [], trending: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTitles() {
      try {
        // Fetch up to 500 titles, sorted by newest first
        const res = await fetch(`${API_URL}?perPage=500&sort=-created`);
        if (!res.ok) throw new Error('Failed to fetch from API');
        
        const json = await res.json();
        
        // Ensure we have an array of items
        const items = json.items || [];

        // Format the data to match the "Mega Stream" UI requirements
        const formattedItems = items.map(item => ({
          id: item.id,
          title: item.title || 'Untitled',
          year: item.year || 2024,
          rating: typeof item.rating === 'number' ? item.rating : 0,
          kind: item.type === 'movie' ? 'Movie' : 'TV',
          genres: Array.isArray(item.genres) ? item.genres : [],
          // Fallbacks if the admin hasn't set a poster yet
          poster: item.poster || 'https://via.placeholder.com/400x600?text=No+Poster',
          backdrop: item.poster || 'https://via.placeholder.com/1600x900?text=No+Backdrop',
          overview: item.synopsis || 'No description available.',
          runtime: item.duration || 'Unknown',
          // Keep the original video link for the Watch page
          video: item.video 
        }));

        // Sort logic for the different sections
        setData({
          movies: formattedItems.filter(i => i.kind === 'Movie'),
          series: formattedItems.filter(i => i.kind === 'TV'),
          topRated: [...formattedItems].sort((a, b) => b.rating - a.rating),
          trending: formattedItems.slice(0, 5) // Just take the first 5 for the slider
        });

      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTitles();
  }, []);

  return { data, loading, error };
}