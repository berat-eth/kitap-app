import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import dotenv from 'dotenv';
import {
  fetchFeatured,
  fetchPopular,
  fetchCategories,
  fetchBook,
  fetchChapters,
  searchBooks,
  fetchBooksByCategory,
} from './lib/api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = Number(process.env.PORT) || 3010;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

function formatDur(seconds) {
  const s = Number(seconds) || 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}sa ${m}dk`;
  return `${m}dk`;
}

app.locals.formatDur = formatDur;
app.locals.apiPublicBase = (process.env.API_BASE || 'https://api.wirbooks.com.tr/api').replace(/\/+$/, '');
app.locals.apiPublicKey = process.env.API_KEY || '';

app.get('/', async (req, res, next) => {
  try {
    const [featured, popular, categories] = await Promise.all([
      fetchFeatured(),
      fetchPopular(),
      fetchCategories(),
    ]);
    const hero = featured[0] || popular[0] || null;
    res.render('home', {
      title: 'Keşfet — Wirbooks',
      activeTop: 'discover',
      activeBottom: 'now',
      hero,
      featured: featured.slice(0, 8),
      popular: popular.slice(0, 8),
      categories,
      error: !featured.length && !popular.length,
    });
  } catch (e) {
    next(e);
  }
});

app.get('/library', (req, res) => {
  res.render('library', {
    title: 'Kitaplığım — Wirbooks',
    activeTop: 'library',
    activeBottom: 'library',
  });
});

app.get('/search', async (req, res, next) => {
  try {
    const q = req.query.q || '';
    const category = req.query.category || '';
    let books = [];
    if (q.trim()) books = await searchBooks(q);
    else if (category) books = await fetchBooksByCategory(category);
    res.render('search', {
      title: 'Ara — Wirbooks',
      activeTop: 'discover',
      activeBottom: 'search',
      q,
      category,
      books,
    });
  } catch (e) {
    next(e);
  }
});

app.get('/book/:id', async (req, res, next) => {
  try {
    const book = await fetchBook(req.params.id);
    if (!book)
      return res.status(404).render('404', {
        title: 'Bulunamadı',
        activeTop: 'discover',
        activeBottom: 'now',
      });
    const chapters = await fetchChapters(book.id);
    res.render('book', {
      title: `${book.title} — Wirbooks`,
      activeTop: 'discover',
      activeBottom: 'library',
      book,
      chapters,
    });
  } catch (e) {
    next(e);
  }
});

app.get('/play/:bookId', async (req, res, next) => {
  try {
    const book = await fetchBook(req.params.bookId);
    if (!book)
      return res.status(404).render('404', {
        title: 'Bulunamadı',
        activeTop: 'discover',
        activeBottom: 'now',
      });
    const chapters = await fetchChapters(book.id);
    const chapterId = req.query.chapter || (chapters[0] && chapters[0].id) || '';
    res.render('player', {
      title: `Dinle: ${book.title} — Wirbooks`,
      activeTop: 'library',
      activeBottom: 'now',
      book,
      chapters,
      initialChapterId: chapterId,
    });
  } catch (e) {
    next(e);
  }
});

app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Bulunamadı',
    activeTop: 'discover',
    activeBottom: 'now',
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Sunucu hatası');
});

app.listen(PORT, () => {
  console.log(`Wirbooks web http://localhost:${PORT}`);
});
