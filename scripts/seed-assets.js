'use strict';

/**
 * scripts/seed-assets.js
 *
 * Sube imágenes desde ../assets/sXX/ al Strapi y las asigna al modelo
 * correspondiente (imagen_principal, imagen_lateral, galeria[].imagen,
 * colores[].imagen_aerea/lateral, seguridad[].imagen).
 *
 * Idempotente — si la imagen ya está cargada (mismo nombre), no la duplica.
 *
 * Uso (desde la carpeta strapi/):
 *   node scripts/seed-assets.js
 *
 * Requisito: tener Strapi corriendo en localhost (npm run develop) en otra terminal.
 *           El script entra en modo "remoto" via API REST, sin necesidad de
 *           inyectarse en el proceso de Strapi. Para autenticación crea un
 *           API token "Full access" en Settings → API Tokens y exportalo:
 *
 *   export STRAPI_URL=http://localhost:1337
 *   export STRAPI_TOKEN=xxxxxxxxxx
 *   node scripts/seed-assets.js
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

// ── Mapeo: cada modelo declara qué archivo va en cada slot. Los nombres
// corresponden 1:1 con lo que copiamos en assets/sXX/. Si algún archivo no
// existe, el slot queda vacío (no rompe).
const PLAN = {
  's09': {
    folder: 's09',
    imagen_principal: 'banner-desktop.webp',
    imagen_lateral: 'descripcion.webp',
    galeria: [
      { feat: 'Pantalla central de 15.6"', file: 'caracteristica-pantallas.webp' },
      { feat: 'Audio Sony premium', file: 'caracteristica-sony.webp' },
      { feat: 'Asientos eléctricos regulables', file: 'caracteristica-asientos.webp' },
      { feat: 'Techo panorámico', file: 'caracteristica-techo.webp' },
      { feat: 'Diseño exterior diamante', file: 'caracteristica-diamante.webp' },
    ],
    colores: [
      { name: 'Verde Aurora',    aerea: 'exterior-verde-aereo.webp',     lateral: 'exterior-verde-lateral.webp' },
      { name: 'Negro Estrellado', aerea: 'exterior-negro-aereo.webp',    lateral: 'exterior-negro-lateral.webp' },
      { name: 'Blanco Nieve',    aerea: 'exterior-blanco-aereo.webp',    lateral: 'exterior-blanco-lateral.webp' },
      { name: 'Azul Cósmico',    aerea: 'exterior-azul-aereo.webp',      lateral: 'exterior-azul-lateral.webp' },
      { name: 'Gris Niebla',     aerea: 'exterior-grisniebla-aereo.webp', lateral: 'exterior-grisniebla-lateral.webp' },
    ],
    seguridad: [
      { feat: 'ICA — Asistente de Crucero Integrado', file: 'seguridad-asistente-carril.jpg' },
      { feat: 'HMA — Asistente de Luces de Carretera', file: 'seguridad-luces-largas.jpg' },
      { feat: 'LKA — Asistente de Mantenimiento de Carril', file: 'seguridad-control-crucero.jpg' },
      { feat: 'LCW — Advertencia de Cambio de Carril', file: 'seguridad-cambio-carril.jpg' },
      { feat: 'FCW — Advertencia de Colisión Frontal', file: 'seguridad-colision.jpg' },
      { feat: 'AEB — Frenado Autónomo de Emergencia', file: 'seguridad-freno-autonomo.jpg' },
    ],
  },
  's06-phev': {
    folder: 's06-phev',
    imagen_principal: 'banner-desktop.webp',
    imagen_lateral: 'descripcion.webp',
    galeria: [
      { feat: 'Pantalla central', file: 'caracteristica-pantalla.webp' },
      { feat: 'Diseño exterior', file: 'caracteristica-diseno.webp' },
      { feat: 'Cargador inalámbrico', file: 'caracteristica-cargador.webp' },
      { feat: 'Techo solar panorámico', file: 'caracteristica-sunroof.webp' },
    ],
    colores: [
      { name: 'Aurora Green',  aerea: 'exterior-aurora-green-aereo.webp',  lateral: 'exterior-aurora-green-lateral.webp' },
      { name: 'Starlit Black', aerea: 'exterior-starlit-black-aereo.webp', lateral: 'exterior-starlit-black-lateral.webp' },
      { name: 'Snow White',    aerea: 'exterior-snow-white-aereo.webp',    lateral: 'exterior-snow-white-lateral.webp' },
      { name: 'Cosmic Silver', aerea: 'exterior-cosmic-silver-aereo.webp', lateral: 'exterior-cosmic-silver-lateral.webp' },
      { name: 'Moon Grey',     aerea: 'exterior-moon-grey-aereo.webp',     lateral: 'exterior-moon-grey-lateral.webp' },
      { name: 'Phantom Grey',  aerea: 'exterior-phantom-grey-aereo.webp',  lateral: 'exterior-phantom-grey-lateral.webp' },
    ],
    seguridad: [],
  },
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

// Sube un archivo a /api/upload. Si ya existe (mismo `name` en uploads),
// reutiliza el media existente sin duplicar.
async function uploadOnce(filePath, cache) {
  const name = path.basename(filePath);
  if (cache[name]) return cache[name];

  // Buscar uno existente con ese nombre
  const found = await api(`/api/upload/files?filters[name][$eq]=${encodeURIComponent(name)}&pagination[pageSize]=1`)
    .catch(() => []);
  if (Array.isArray(found) && found.length) {
    cache[name] = found[0];
    return found[0];
  }

  // Subir
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

function tryUpload(folder, file, cache) {
  if (!file) return Promise.resolve(null);
  const full = path.join(ASSETS_ROOT, folder, file);
  if (!fs.existsSync(full)) {
    console.warn('  ⚠ no existe', file, '— se omite');
    return Promise.resolve(null);
  }
  return uploadOnce(full, cache);
}

// Busca el modelo por slug. Devuelve { id, attributes } estilo v4 o null.
async function getModeloBySlug(slug) {
  const res = await api(`/api/modelos?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*&pagination[pageSize]=1`);
  return (res && res.data && res.data[0]) || null;
}

// Construye el payload del modelo aplicando los media IDs.
async function buildPayloadFor(slug, plan, cache) {
  const principalMedia = await tryUpload(plan.folder, plan.imagen_principal, cache);
  const lateralMedia   = await tryUpload(plan.folder, plan.imagen_lateral, cache);

  const galeria = [];
  for (const g of plan.galeria || []) {
    const m = await tryUpload(plan.folder, g.file, cache);
    galeria.push({ feat: g.feat, desc: '', imagen: m ? m.id : null });
  }

  const colores = [];
  for (const c of plan.colores || []) {
    const a = await tryUpload(plan.folder, c.aerea, cache);
    const l = await tryUpload(plan.folder, c.lateral, cache);
    colores.push({
      name: c.name,
      hex: c.hex || '#888888',
      tipo: 'Exterior',
      imagen_aerea: a ? a.id : null,
      imagen_lateral: l ? l.id : null,
    });
  }

  const seguridad = [];
  for (const s of plan.seguridad || []) {
    const m = await tryUpload(plan.folder, s.file, cache);
    seguridad.push({ feat: s.feat, desc: '', imagen: m ? m.id : null });
  }

  return {
    imagen_principal: principalMedia ? principalMedia.id : null,
    imagen_lateral: lateralMedia ? lateralMedia.id : null,
    galeria,
    colores,
    seguridad,
  };
}

async function run() {
  console.log('🌱 seed-assets — STRAPI_URL=', STRAPI_URL);
  console.log('   carpeta assets:', ASSETS_ROOT);

  const cache = {};
  for (const [slug, plan] of Object.entries(PLAN)) {
    console.log(`\n→ Modelo ${slug}`);
    const modelo = await getModeloBySlug(slug);
    if (!modelo) {
      console.warn(`  ⚠ modelo "${slug}" no existe en Strapi — créalo primero (npm run develop ejecuta el seed).`);
      continue;
    }
    const payload = await buildPayloadFor(slug, plan, cache);

    // PUT a /api/modelos/:id  — Strapi v4
    const res = await fetch(`${STRAPI_URL}/api/modelos/${modelo.id}`, {
      method: 'PUT',
      headers: headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ data: payload }),
    });
    if (!res.ok) {
      const t = await res.text();
      console.error('  ✖ PUT falló:', res.status, t.slice(0, 200));
      continue;
    }
    console.log(`  ✓ ${slug} actualizado (galeria=${payload.galeria.length}, colores=${payload.colores.length}, seguridad=${payload.seguridad.length})`);
  }

  console.log('\n✅ Listo. Refresca el frontend (Ctrl+F5) para ver las imágenes desde Strapi.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
