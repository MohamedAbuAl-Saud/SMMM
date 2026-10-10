import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { apiRouter } from './src/server/routes.ts';
import { saveDbImmediately } from './src/server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  const app = express();

  // Basic security & parsing
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser());

  // Prevent clickjacking & basic headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    next();
  });

  // Block access to sensitive directories & files: data, tests, testsss, server, db, env, config files
  app.use((req, res, next) => {
    const p = req.path.toLowerCase();
    if (
      p.startsWith('/data') ||
      p.startsWith('/tests') ||
      p.startsWith('/testsss') ||
      p.startsWith('/server') ||
      p.endsWith('.sqlite') ||
      p.endsWith('.db') ||
      p.includes('.env') ||
      p.includes('/.git') ||
      p === '/package.json' ||
      p === '/tsconfig.json' ||
      p === '/server.ts' ||
      p === '/drizzle.config.ts' ||
      p === '/package-lock.json'
    ) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(403).send(`<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>خطأ - محاولة الوصول غير مسموحة</title>
  <meta http-equiv="refresh" content="2;url=/" />
</head>
<body style="font-family: Tahoma, sans-serif; text-align: center; padding: 50px; background: #fff1f2; color: #be123c;">
  <h2>⚠️ خطأ: هذا المسار أو الملف محظور وغير مسموح بالدخول إليه!</h2>
  <p>مجلد testsss والبيانات مسجلات خاصة بالمطور فقط ولا يمكن الوصول إليها.</p>
  <p>سيتم توجيهك تلقائياً إلى الصفحة الرئيسية للموقع...</p>
  <script>
    setTimeout(() => { window.location.href = '/'; }, 1500);
  </script>
</body>
</html>`);
    }
    next();
  });

  // API router
  app.use('/api', apiRouter);

  // Explicitly serve SM.jpg
  app.get('/SM.jpg', (_req, res) => {
    const smPublic = path.resolve(__dirname, 'public', 'SM.jpg');
    if (fs.existsSync(smPublic)) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.sendFile(smPublic);
    }
    const smRoot = path.resolve(__dirname, 'SM.jpg');
    if (fs.existsSync(smRoot)) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.sendFile(smRoot);
    }
    res.status(404).send('SM.jpg not found');
  });

  // Social scraper preview handler for WhatsApp, Facebook, Telegram, etc.
  app.use(async (req, res, next) => {
    if (req.method !== 'GET') return next();
    if (req.path.startsWith('/api') || req.path.startsWith('/@') || req.path.includes('.')) return next();

    const userAgent = (req.headers['user-agent'] || '').toLowerCase();
    const isSocialCrawler = /whatsapp|facebookexternalhit|twitterbot|telegrambot|linkedinbot|slackbot|discordbot|applebot/i.test(userAgent);

    if (isSocialCrawler) {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
      const host = req.headers['x-forwarded-host'] || req.get('host') || `localhost:${PORT}`;
      const origin = `${protocol}://${host}`;
      const imageUrl = `${origin}/SM.jpg`;
      const qCode = (req.query.q as string) || (req.path.startsWith('/quiz/') ? req.path.replace('/quiz/', '').trim() : '');

      if (qCode) {
        try {
          const { getDb } = await import('./src/server/db.ts');
          const db = await getDb();
          const rows = db.exec("SELECT creator_name FROM quizzes WHERE public_code = ?", [qCode]);
          if (rows.length > 0 && rows[0].values.length > 0) {
            const creatorName = String(rows[0].values[0][0]);
            const shareTitle = `اختبار بيستي تشيك: ${creatorName}`;
            const shareDesc = `${creatorName} وريني، لو كنت صاحبي/تي وحبيبي/تي بجد ولا متعرفنيش كويس ومش مهتم.. لو درجتك معجبتنيش هديك/ي احلي بلوك.. 🤨 ✨`;
            const pageUrl = `${origin}/?q=${qCode}`;

            const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <title>${shareTitle}</title>
  <meta name="description" content="${shareDesc}" />
  <meta property="og:site_name" content="Bestie Check SM" />
  <meta property="og:title" content="${shareTitle}" />
  <meta property="og:description" content="${shareDesc}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${pageUrl}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:secure_url" content="${imageUrl}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="600" />
  <meta property="og:image:height" content="600" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${shareTitle}" />
  <meta name="twitter:description" content="${shareDesc}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <link rel="icon" type="image/jpeg" href="/SM.jpg" />
  <meta http-equiv="refresh" content="0;url=${pageUrl}" />
</head>
<body>
  <p>${shareDesc}</p>
  <a href="${pageUrl}">اضغط هنا للدخول للاختبار</a>
</body>
</html>`;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.send(html);
          }
        } catch (e) {
          console.error('Social crawler preview error:', e);
        }
      }

      // General platform preview for social scrapers
      const generalTitle = "Bestie Check SM - بيستي تشيك";
      const generalDesc = "منصه Bestie Check SM لأختبارات الصداقة الفرفوشه أنشئ اختبارك واعرف مين صحابك اللي بجد ومين محتاج يركز معاك..! 👌👫";
      const generalUrl = `${origin}/`;
      const generalHtml = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <title>${generalTitle}</title>
  <meta name="description" content="${generalDesc}" />
  <meta property="og:site_name" content="Bestie Check SM" />
  <meta property="og:title" content="${generalTitle}" />
  <meta property="og:description" content="${generalDesc}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${generalUrl}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:secure_url" content="${imageUrl}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="600" />
  <meta property="og:image:height" content="600" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${generalTitle}" />
  <meta name="twitter:description" content="${generalDesc}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <link rel="icon" type="image/jpeg" href="/SM.jpg" />
  <meta http-equiv="refresh" content="0;url=${generalUrl}" />
</head>
<body>
  <p>${generalDesc}</p>
  <a href="${generalUrl}">اضغط هنا للدخول للمنصة</a>
</body>
</html>`;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(generalHtml);
    }
    next();
  });

  if (!isProduction) {
    // Mount Vite middleware in development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Bestie Check SM] Server running at http://0.0.0.0:${PORT}`);
  });

  // Handle graceful shutdown to flush SQLite DB
  const handleExit = () => {
    console.log('Flushing database before exit...');
    saveDbImmediately();
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', handleExit);
  process.on('SIGTERM', handleExit);
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
