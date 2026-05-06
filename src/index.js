'use strict';

// Bootstrap automático:
//   1. Habilita find/findOne públicos para modelo, sucursal, footer.
//   2. Si la base está vacía, carga el seed (3 modelos, 3 sucursales, footer).
//
// Idempotente: detecta si ya hay datos y no duplica.

// Defaults compartidos por los 3 modelos para no duplicar.
// Cuando el contenido definitivo esté listo, se editan desde el panel.
const DEFAULT_VERSIONES = [
  { nombre: '1.5T-6DCT' },
  { nombre: '1.5T-6DCT Lite' },
  { nombre: '1.6TD-7DCT Pro Max' },
];
const DEFAULT_COLORES = [
  { name: 'Color 1', hex: '#92B1B9', tipo: 'Exterior' },
  { name: 'Color 2', hex: '#1E1E1E', tipo: 'Exterior' },
  { name: 'Color 3', hex: '#F3F3F1', tipo: 'Exterior' },
  { name: 'Color 4', hex: '#D9845B', tipo: 'Exterior' },
  { name: 'Color 5', hex: '#3A6F8F', tipo: 'Exterior' },
];
const DEFAULT_GALERIA = [
  { feat: 'Característica 1', desc: 'Descripción de la característica destacada.' },
  { feat: 'Característica 2', desc: 'Descripción de la característica destacada.' },
  { feat: 'Característica 3', desc: 'Descripción de la característica destacada.' },
  { feat: 'Característica 4', desc: 'Descripción de la característica destacada.' },
];
const DEFAULT_SEGURIDAD = [
  { feat: 'Sistema de seguridad 1', desc: 'Descripción del sistema de seguridad.' },
  { feat: 'Sistema de seguridad 2', desc: 'Descripción del sistema de seguridad.' },
  { feat: 'Sistema de seguridad 3', desc: 'Descripción del sistema de seguridad.' },
];
const DEFAULT_PRECIO_LEGAL =
  '*Precio referencial. Sujeto a stock y condiciones del mercado. No incluye derechos de inscripción.';

// ── Datos reales por modelo (sin imágenes — esas se cargan luego desde Admin
// o vía script `npm run seed:assets`). Cuando se suban, los Media IDs quedan
// poblados en imagen_principal, imagen_lateral, galeria[].imagen, colores[].imagen_aerea/lateral.

const S09_COLORES = [
  { name: 'Verde Aurora', hex: '#3F5C4A', tipo: 'Exterior' },
  { name: 'Negro Estrellado', hex: '#1A1A1A', tipo: 'Exterior' },
  { name: 'Blanco Nieve', hex: '#F2F2F0', tipo: 'Exterior' },
  { name: 'Azul Cósmico', hex: '#2B4A6B', tipo: 'Exterior' },
  { name: 'Gris Niebla', hex: '#7A7E82', tipo: 'Exterior' },
];
const S09_GALERIA = [
  { feat: 'Pantalla central de 15.6"', desc: 'Pantalla inmersiva que da vida a cada momento con claridad cinematográfica.' },
  { feat: 'Audio Sony premium', desc: 'Sistema de sonido envolvente afinado por Sony para una experiencia auditiva superior.' },
  { feat: 'Asientos eléctricos regulables', desc: 'Confort máximo con regulación eléctrica y memoria en los asientos delanteros.' },
  { feat: 'Techo panorámico', desc: 'Amplio techo panorámico que llena el habitáculo de luz natural.' },
  { feat: 'Diseño exterior diamante', desc: 'Líneas afiladas y un patrón inspirado en el diamante para una presencia inconfundible.' },
];
const S09_SEGURIDAD = [
  { feat: 'ICA — Asistente de Crucero Integrado', desc: 'Mantiene la posición en el carril y ajusta la velocidad sin esfuerzo.' },
  { feat: 'HMA — Asistente de Luces de Carretera', desc: 'Alterna entre luces largas y cortas según las condiciones del camino.' },
  { feat: 'LKA — Asistente de Mantenimiento de Carril', desc: 'Reduce la desviación del carril para una conducción más segura.' },
  { feat: 'LCW — Advertencia de Cambio de Carril', desc: 'Detecta vehículos en el ángulo muerto y advierte al cambiar de carril.' },
  { feat: 'FCW — Advertencia de Colisión Frontal', desc: 'Alerta al conductor ante un riesgo inminente de impacto frontal.' },
  { feat: 'AEB — Frenado Autónomo de Emergencia', desc: 'Frena automáticamente para evitar o mitigar una colisión.' },
];

const S06PHEV_COLORES = [
  { name: 'Aurora Green', hex: '#3F5C4A', tipo: 'Exterior' },
  { name: 'Starlit Black', hex: '#1A1A1A', tipo: 'Exterior' },
  { name: 'Snow White', hex: '#F2F2F0', tipo: 'Exterior' },
  { name: 'Cosmic Silver', hex: '#C5C7CA', tipo: 'Exterior' },
  { name: 'Moon Grey', hex: '#7A7E82', tipo: 'Exterior' },
  { name: 'Phantom Grey', hex: '#3D3F44', tipo: 'Exterior' },
];
const S06PHEV_GALERIA = [
  { feat: 'Pantalla central', desc: 'Interfaz moderna con respuesta táctil precisa.' },
  { feat: 'Diseño exterior', desc: 'Líneas dinámicas con un acabado impecable.' },
  { feat: 'Cargador inalámbrico', desc: 'Carga inalámbrica integrada para tu smartphone.' },
  { feat: 'Techo solar panorámico', desc: 'Techo panorámico que potencia la sensación de amplitud.' },
];

const SEED_MODELOS = [
  {
    slug: 's09', nombre: 'S09', tagline: 'SUV insignia', categoria: 'SUV',
    precio_desde: 18990000, destacado: true, orden: 1,
    descripcion: 'El SUV más completo de SOUEAST. Espacio, tecnología y eficiencia.',
    precio_legal: DEFAULT_PRECIO_LEGAL,
    versiones: DEFAULT_VERSIONES,
    colores: S09_COLORES,
    galeria: S09_GALERIA,
    seguridad: S09_SEGURIDAD,
  },
  {
    slug: 's07', nombre: 'S07', tagline: 'SUV familiar', categoria: 'SUV',
    precio_desde: 16990000, destacado: true, orden: 2,
    descripcion: 'Diseño moderno y equipamiento generoso para toda la familia.',
    precio_legal: DEFAULT_PRECIO_LEGAL,
    versiones: DEFAULT_VERSIONES,
    colores: DEFAULT_COLORES,
    galeria: DEFAULT_GALERIA,
    seguridad: DEFAULT_SEGURIDAD,
  },
  {
    slug: 's06', nombre: 'S06', tagline: 'SUV compacto', categoria: 'SUV',
    precio_desde: 14990000, destacado: true, orden: 3,
    descripcion: 'Compacto, ágil y con la tecnología que esperas.',
    precio_legal: DEFAULT_PRECIO_LEGAL,
    versiones: DEFAULT_VERSIONES,
    colores: DEFAULT_COLORES,
    galeria: DEFAULT_GALERIA,
    seguridad: DEFAULT_SEGURIDAD,
  },
  {
    slug: 's06-phev', nombre: 'S06 PHEV', tagline: 'SUV híbrido enchufable', categoria: 'Híbrido',
    precio_desde: 19990000, destacado: true, orden: 4,
    descripcion: 'SUV híbrido enchufable con gran autonomía, bajo consumo y tecnología inteligente.',
    precio_legal: DEFAULT_PRECIO_LEGAL,
    versiones: DEFAULT_VERSIONES,
    colores: S06PHEV_COLORES,
    galeria: S06PHEV_GALERIA,
    seguridad: DEFAULT_SEGURIDAD,
  },
];

const SEED_SUCURSALES = [
  {
    nombre: 'KAUFMANN - SANTIAGO', direccion: 'Av. Vicuña Mackenna 2345',
    comuna: 'SANTIAGO', region: 'Metropolitana',
    lat: -33.4489, lng: -70.6693,
    horario: 'Lunes a Viernes 9:00 a 19:00',
    tipo_label: 'Sala de ventas',
    servicios: ['ventas', 'repuestos'],
  },
  {
    nombre: 'SHOWROOM MOVICENTER', direccion: 'Av. Américo Vespucio 1501, Quilicura',
    comuna: 'QUILICURA', region: 'Metropolitana',
    lat: -33.3569, lng: -70.7394,
    horario: 'Lunes a Domingo 10:00 a 20:00',
    tipo_label: 'Showroom Exclusivo',
    servicios: ['ventas', 'repuestos', 'servicio'],
  },
  {
    nombre: 'SUCURSAL CONCEPCIÓN', direccion: "Av. O'Higgins 789",
    comuna: 'CONCEPCIÓN', region: 'Biobío',
    lat: -36.8270, lng: -73.0498,
    horario: 'Lunes a Viernes 9:00 a 19:00',
    tipo_label: 'Sala de ventas',
    servicios: ['ventas', 'repuestos', 'servicio'],
  },
];

const SEED_FOOTER = {
  copyright: '© 2025 SOUEAST Chile',
  legales: 'Las imágenes son referenciales. Precios sujetos a stock.',
  columnas: [
    { titulo: 'Modelos', links: [
      { label: 'S09', href: '/modelos/s09' },
      { label: 'S07', href: '/modelos/s07' },
      { label: 'S06', href: '/modelos/s06' },
    ]},
    { titulo: 'Empresa', links: [
      { label: 'Sucursales', href: '/sucursales' },
      { label: 'Servicio', href: '/servicio' },
    ]},
  ],
};

async function setPublicPermissions(strapi, actions) {
  const publicRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });

  if (!publicRole) return;

  for (const action of actions) {
    const existing = await strapi
      .query('plugin::users-permissions.permission')
      .findOne({ where: { action, role: publicRole.id } });

    if (existing) {
      if (!existing.enabled) {
        await strapi.query('plugin::users-permissions.permission').update({
          where: { id: existing.id },
          data: { enabled: true },
        });
      }
    } else {
      await strapi.query('plugin::users-permissions.permission').create({
        data: { action, enabled: true, role: publicRole.id },
      });
    }
  }
  strapi.log.info('[bootstrap] permisos public configurados');
}

async function seedIfEmpty(strapi) {
  const modeloCount = await strapi.entityService.count('api::modelo.modelo');
  if (modeloCount === 0) {
    for (const data of SEED_MODELOS) {
      await strapi.entityService.create('api::modelo.modelo', {
        data: { ...data, publishedAt: new Date() },
      });
    }
    strapi.log.info(`[bootstrap] seed modelos: ${SEED_MODELOS.length}`);
  }

  const sucursalCount = await strapi.entityService.count('api::sucursal.sucursal');
  if (sucursalCount === 0) {
    for (const data of SEED_SUCURSALES) {
      await strapi.entityService.create('api::sucursal.sucursal', {
        data: { ...data, publishedAt: new Date() },
      });
    }
    strapi.log.info(`[bootstrap] seed sucursales: ${SEED_SUCURSALES.length}`);
  }

  const footer = await strapi.entityService.findMany('api::footer.footer');
  if (!footer) {
    await strapi.entityService.create('api::footer.footer', {
      data: { ...SEED_FOOTER, publishedAt: new Date() },
    });
    strapi.log.info('[bootstrap] seed footer');
  }
}

module.exports = {
  register() {},
  async bootstrap({ strapi }) {
    await setPublicPermissions(strapi, [
      'api::modelo.modelo.find',
      'api::modelo.modelo.findOne',
      'api::sucursal.sucursal.find',
      'api::sucursal.sucursal.findOne',
      'api::footer.footer.find',
    ]);
    await seedIfEmpty(strapi);
  },
};
