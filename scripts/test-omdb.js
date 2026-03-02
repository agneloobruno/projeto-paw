const omdb = require('../utils/omdb');
require('dotenv').config();
(async ()=>{
  const key = process.env.OMDB_API_KEY;
  console.log('Using OMDB key:', key ? '[present]' : '[missing]');
  const res = await omdb.fetchPosterAndRating('Guardians of the Galaxy Vol. 2', '2017', key);
  console.log('Result:', res);
})();
