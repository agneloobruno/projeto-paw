const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
require('dotenv').config();
console.log('DEBUG app: OMDB_API_KEY present=', !!process.env.OMDB_API_KEY);

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'change_this',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.currentPath = req.path;
  next();
});

// Simple request logger for debugging
app.use((req, res, next) => {
  console.log('REQ', req.method, req.path);
  next();
});

const indexRouter = require('./routes/index');
app.use('/', indexRouter);
// healthcheck route
app.get('/_health', (req, res) => res.send('ok'));
const categoriasRouter = require('./routes/categorias');
app.use('/categorias', categoriasRouter);
const filmesRouter = require('./routes/filmes');
app.use('/filmes', filmesRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
