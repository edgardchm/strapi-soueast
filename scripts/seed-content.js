'use strict';

/**
 * scripts/seed-content.js
 *
 * Sube imágenes globales (videos hero, logo, noticias, footer, gracias) desde
 * ../assets/ y las asigna a los Singles correspondientes y a las noticias del
 * Collection Type `noticia`. Idempotente — reutiliza media existente.
 *
 * Uso (desde la carpeta strapi/):
 *   export STRAPI_URL=http://localhost:1337
 *   export STRAPI_TOKEN=xxxxxxxxxx   # token Full access
 *   node scripts/seed-content.js
 *
 * Requiere Strapi corriendo (npm run develop) y `seedIfEmpty` ejecutado al
 * menos una vez (para que existan los Singles y las noticias placeholder).
 */

const fs = require('fs');
const path = require('path');

const STRAPI_URL = (process.env.STRAPI_URL || 'http://localhost:1337').replace(/\/+$/, '');
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '';

if (!STRAPI_TOKEN) {
  console.error('❌ Falta STRAPI_TOKEN. Crea un token Full access en Admin → Settings → API Tokens.');
  process.exit(1);
}

const ASSETS_ROOT = path.resolve(__dirname, '..', '..', 'assets');

// ── Plan de assets globales ────────────────────────────────────────────────
// Cada slot apunta a un archivo en assets/. Si no existe, se omite.
const GLOBAL_ASSETS = {
  // home-page
  hero_video_pc:      'banner-pc.mp4',
  hero_video_mobile:  'banner-mobile.mp4',
  hero_video_poster:  'home-hero.png',
  // gracias-page
  gracias_imagen:     'home-hero.png',
  // contacto-page
  contacto_footer:    'modelo-gallery.jpg',
  // global
  brand_logo:         null, // si tienes un logo, indícalo aquí (ej: 'logo.svg')
};

// Plan de noticias — slug ↔ imagen (mismas que soueastchile.cl / fallback estático).
const NOTICIAS_IMAGES = {
  'soueast-showroom-movicenter':         'news-showroom-movicenter.jpg',
  'soueast-nueva-marca-mercado-chileno': 'news-lanzamiento-soueast-chile.webp',
};

// ── Helpers ───────────────────────────────────────────────────────────────

const headers = (extra = {}) => ({ Authorization: `Bearer ${STRAPI_TOKEN}`, ...extra });

async function api(pathname, opts = {}) {
  const url = `${STRAPI_URL}${pathname}`;
  const res = await fetch(url, { ...opts, headers: { ...headers(), ...(opts.headers || {}) } });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${pathname}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

async function uploadOnce(filePath, cache) {
  const name = path.basename(filePath);
  if (cache[name]) return cache[name];

  const found = await api(`/api/upload/files?filters[name][$eq]=${encodeURIComponent(name)}&pagination[pageSize]=1`)
    .catch(() => []);
  if (Array.isArray(found) && found.length) {
    cache[name] = found[0];
    return found[0];
  }

  const buffer = fs.readFileSync(filePath);
  const blob = new Blob([buffer]);
  const form = new FormData();
  form.append('files', blob, name);

  const res = await fetch(`${STRAPI_URL}/api/upload`, {
    method: 'POST', headers: headers(), body: form,
  });
  if (!res.ok) throw new Error(`upload ${name}: HTTP ${res.status} ${await res.text()}`);
  const arr = await res.json();
  cache[name] = arr[0];
  console.log('  ↑ subido', name, '→ id', arr[0].id);
  return arr[0];
}

async function tryUpload(file, cache) {
  if (!file) return null;
  const full = path.join(ASSETS_ROOT, file);
  if (!fs.existsSync(full)) {
    console.warn('  ⚠ no existe', file, '— se omite');
    return null;
  }
  return uploadOnce(full, cache);
}

async function updateSingle(uid, payload) {
  const res = await fetch(`${STRAPI_URL}/api/${uid}`, {
    method: 'PUT',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ data: payload }),
  });
  if (!res.ok) {
    const t = await res.text();
    console.error(`  ✖ PUT /${uid} falló:`, res.status, t.slice(0, 200));
    return false;
  }
  console.log(`  ✓ ${uid} actualizado`);
  return true;
}

async function getNoticiaBySlug(slug) {
  const res = await api(`/api/noticias?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1`);
  return (res && res.data && res.data[0]) || null;
}

async function updateNoticiaImage(id, mediaId) {
  const res = await fetch(`${STRAPI_URL}/api/noticias/${id}`, {
    method: 'PUT',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ data: { imagen: mediaId } }),
  });
  if (!res.ok) {
    const t = await res.text();
    console.error('  ✖ PUT noticia falló:', res.status, t.slice(0, 200));
    return false;
  }
  return true;
}

// ── Run ───────────────────────────────────────────────────────────────────

async function run() {
  console.log('🌱 seed-content — STRAPI_URL=', STRAPI_URL);
  console.log('   carpeta assets:', ASSETS_ROOT);

  const cache = {};

  // 1) Subir los assets globales
  console.log('\n→ Subiendo assets globales');
  const heroPc      = await tryUpload(GLOBAL_ASSETS.hero_video_pc, cache);
  const heroMobile  = await tryUpload(GLOBAL_ASSETS.hero_video_mobile, cache);
  const heroPoster  = await tryUpload(GLOBAL_ASSETS.hero_video_poster, cache);
  const graciasImg  = await tryUpload(GLOBAL_ASSETS.gracias_imagen, cache);
  const contactoImg = await tryUpload(GLOBAL_ASSETS.contacto_footer, cache);
  const brandLogo   = await tryUpload(GLOBAL_ASSETS.brand_logo, cache);

  // 2) Asignar a los Singles
  console.log('\n→ Asignando media a Singles');
  const homePayload = {};
  if (heroPc)     homePayload.hero_video_pc = heroPc.id;
  if (heroMobile) homePayload.hero_video_mobile = heroMobile.id;
  if (heroPoster) homePayload.hero_video_poster = heroPoster.id;
  if (Object.keys(homePayload).length) {
    await updateSingle('home-page', homePayload);
  }

  if (graciasImg) {
    await updateSingle('gracias-page', { imagen: graciasImg.id });
  }

  if (contactoImg) {
    await updateSingle('contacto-page', { footer_image: contactoImg.id });
  }

  if (brandLogo) {
    await updateSingle('global', { brand_logo: brandLogo.id });
  }

  // 3) Subir imágenes y asignar a noticias
  console.log('\n→ Asignando imágenes a noticias');
  for (const [slug, file] of Object.entries(NOTICIAS_IMAGES)) {
    const noticia = await getNoticiaBySlug(slug).catch(() => null);
    if (!noticia) {
      console.warn(`  ⚠ noticia "${slug}" no existe — créala primero (seed bootstrap).`);
      continue;
    }
    const media = await tryUpload(file, cache);
    if (!media) continue;
    const ok = await updateNoticiaImage(noticia.id, media.id);
    if (ok) console.log(`  ✓ noticia ${slug} → ${file}`);
  }

  console.log('\n✅ Listo. Refresca el frontend (Ctrl+F5) para ver los assets desde Strapi.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
