const axios = require('axios');
(async () => {
  try {
    const res = await axios.get('http://localhost:3000/categorias', { timeout: 5000 });
    const html = res.data;
    console.log('--- START HTML SNIPPET ---');
    console.log(html.slice(0, 4000));
    console.log('--- END HTML SNIPPET ---');
  } catch (err) {
    console.error('Erro ao buscar /categorias:', err.message || err);
    process.exit(1);
  }
})();
