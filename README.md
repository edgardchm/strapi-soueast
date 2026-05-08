# SOUEAST CMS — Strapi

Backend headless para el frontend SOUEAST Chile. Pre-configurado con los content types `modelo`, `sucursal` y `footer`, más un seed automático en el primer arranque.

## Requisitos

- Node 18 o 20
- npm 9+

## Levantar en local (3 comandos)

```bash
cd strapi
npm install
npm run develop
```

En el primer arranque:
1. Strapi crea la base SQLite en `.tmp/data.db`.
2. El bootstrap (`src/index.js`) detecta que la base está vacía y carga el seed (4 modelos: S06, S06 PHEV, S07, S09 + 3 sucursales + footer).
3. Te pide crear el primer admin en `http://localhost:1337/admin`.

Una vez creado el admin:
- API pública lista: `http://localhost:1337/api/modelos`, `/api/sucursales`, `/api/footer`.
- Los content types tienen `find` y `findOne` habilitados para el rol Public (lo hace el bootstrap).

## Frontend ya conectado

Todos los HTML del proyecto (`modelo-s06.html`, `modelo-s06-phev.html`, `modelo-s07.html`, `modelo-s09.html`, `home.html`, `sucursales.html`, `cotizador.html`, `gracias.html`, `index.html`) ya apuntan a `STRAPI_URL: "http://localhost:1337"` en su `window.__APP_CONFIG`. No tienes que tocar nada para verlos consumiendo el CMS.

Si Strapi está caído o no hay datos publicados, el frontend cae automáticamente al fallback estático (`features/modelo/modeloFallbacks.js` y datos mock de sucursales).

## Subida automática de imágenes (recomendado para el primer setup)

Las fotos reales del S09 y S06 PHEV están en `assets/s09/` y `assets/s06-phev/`. Para subirlas todas al CMS de una sola vez:

1. **Levanta Strapi** (`npm run develop`) y crea el admin.
2. **Genera un API token Full access** en Admin → Settings → Global Settings → API Tokens → Create.
3. Exporta las variables de entorno y corre el script:

```bash
cd strapi
export STRAPI_URL=http://localhost:1337
export STRAPI_TOKEN=tu_token_aquí
npm run seed:assets
```

El script (`scripts/seed-assets.js`) sube cada imagen, evita duplicados (busca por nombre antes de subir) y luego hace PUT al modelo poblando: `imagen_principal`, `imagen_lateral`, `galeria[].imagen`, `colores[].imagen_aerea`, `colores[].imagen_lateral`, `seguridad[].imagen`.

Después refresca el frontend (Ctrl+F5) y verás todas las imágenes servidas desde Strapi.

## Edición manual desde el admin (para el cliente)

`http://localhost:1337/admin` → **Content Manager → Modelo → [seleccionar modelo]**:

- **Hero principal** → campo `imagen_principal`
- **Imagen lateral (descripción)** → `imagen_lateral`
- **Galería de características** → `galeria[]` — cada entrada con `feat` (título), `desc` y su `imagen`
- **Colores** → `colores[]` — cada color con `name`, `hex`, `tipo` (Exterior/Interior), `imagen_aerea` y `imagen_lateral`
- **Sistemas de seguridad** → `seguridad[]` — cada uno con `feat`, `desc` e `imagen`
- **Datos comerciales** → `precio_desde`, `precio_legal`, `tagline`, `descripcion`

Después de guardar, **clic en "Publish"** para que aparezca en el frontend.

## CORS

Por defecto Strapi v4 permite todos los orígenes en desarrollo. Si bloquea, edita `config/middlewares.js`.

## Resetear la base

```bash
rm -rf .tmp
npm run develop
```

El seed se ejecuta de nuevo.

## Estructura

```
strapi/
├── config/                 Middlewares, base, plugins
├── scripts/
│   └── seed-assets.js      Sube imágenes de assets/sXX/ al Strapi
├── src/
│   ├── api/
│   │   ├── modelo/         schema + controller + route + service
│   │   ├── sucursal/
│   │   └── footer/         (single type)
│   ├── components/
│   │   ├── modelo/
│   │   │   ├── feature.json    { feat, desc, imagen? }   — galería + seguridad
│   │   │   └── color.json      { name, hex, tipo, imagen_aerea?, imagen_lateral? }
│   │   └── shared/
│   │       └── version.json    { nombre }                — variantes de motor
│   └── index.js            Bootstrap: seed + permisos Public
└── package.json
```

## Schema del Modelo

| Campo | Tipo | Notas |
|---|---|---|
| `slug` | uid | Generado desde `nombre` |
| `nombre` | string | Ej: "S09" |
| `tagline` | string | Bajada del hero |
| `descripcion` | text | Copy de la sección Descripción |
| `precio_desde` | integer | En CLP |
| `precio_legal` | text | Letra chica del precio |
| `imagen_principal` | media | Hero del modelo |
| `imagen_lateral` | media | Sección descripción |
| `versiones` | repeatable shared.version | Dropdown de versiones |
| `galeria` | repeatable modelo.feature | Carrusel de características |
| `colores` | repeatable modelo.color | Swatches con vistas aérea + lateral |
| `seguridad` | repeatable modelo.feature | Grid de sistemas de seguridad |
| `categoria` | enum | SUV / Sedán / Pick Up / Híbrido |
| `destacado` | boolean | Marcado en el MegaMenu |
| `orden` | integer | Sort en lineup |

## Producción

Para deploy:
- Cambiar a Postgres (`config/database.js` ya soporta env vars).
- Generar API tokens read-only en lugar de permisos Public.
- Configurar CORS con la lista exacta de orígenes.
- Variables de entorno: `DATABASE_CLIENT`, `DATABASE_URL`, `JWT_SECRET`, `ADMIN_JWT_SECRET`, `APP_KEYS`.
- En los HTML: cambiar `STRAPI_URL` al dominio de producción y poner el `STRAPI_TOKEN` read-only.
