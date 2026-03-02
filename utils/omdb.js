const axios = require('axios');

async function fetchPosterAndRating(title, year, apiKey) {
  if (!apiKey || !title) return { poster: null, imdbRating: null };
  try {
    const q = `http://www.omdbapi.com/?t=${encodeURIComponent(title)}` + (year ? `&y=${encodeURIComponent(year)}` : '') + `&apikey=${apiKey}`;
    const res = await axios.get(q, { timeout: 5000 });
    if (res.data && res.data.Response === 'True') {
      const poster = (res.data.Poster && res.data.Poster !== 'N/A') ? res.data.Poster : null;
      const imdbRating = (res.data.imdbRating && res.data.imdbRating !== 'N/A') ? res.data.imdbRating : null;
      return { poster, imdbRating };
    }
  } catch (err) {
    // do not throw; callers should tolerate missing data
    console.warn('OMDb request error:', err.message);
  }
  return { poster: null, imdbRating: null };
}

module.exports = {
  fetchPosterAndRating
};
