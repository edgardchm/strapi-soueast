'use strict';

const fs = require('fs');
const path = require('path');
const LEGAL_SIMS_SEED = require('../config/seed/legal-sims.json');

// Bootstrap automático:
//   1. Habilita find/findOne públicos para todos los content types editables.
//   2. Si la base está vacía, carga seed completo (sin assets — esos se suben con
//      `npm run seed:assets`). Idempotente: detecta si ya hay datos y no duplica.

// ─── Versiones por modelo (nombres 1:1 con soueastchile.cl) ─────────────
const VERSIONES_S06 = [
  { nombre: '1.5T 6DCT LUX' },
  { nombre: '1.6T 7DCT LUX' },
  { nombre: '1.6T 7DCT LIMITED' },
];
const VERSIONES_S07 = [
  { nombre: '1.5T 6DCT' },
  { nombre: '1.6T 7DCT' },
];
const VERSIONES_S06_PHEV = [{ nombre: 'S06 PHEV LIMITED' }];
const VERSIONES_S09 = [{ nombre: '2.0T 7DCT' }];
// Colores seed — nombres, orden y hex alineados con `features/modelo/modeloFallbacks.js`
// (snapshot soueastchile.cl). Sin medias en seed: el front completa rutas locales.
const SEED_S06_COLORES = [
  { name: 'Negro', hex: '#000000', tipo: 'Exterior' },
  { name: 'Gris grafito', hex: '#5F5F5F', tipo: 'Exterior' },
  { name: 'Gris plata', hex: '#9B999A', tipo: 'Exterior' },
  { name: 'Blanco', hex: '#F0F0F0', tipo: 'Exterior' },
  { name: 'Gris niebla', hex: '#B9B9B9', tipo: 'Exterior' },
  { name: 'Verde', hex: '#92B1B9', tipo: 'Exterior' },
  { name: 'Negro', hex: '#000000', tipo: 'Interior' },
];
const SEED_S06PHEV_COLORES = [
  { name: 'Verde', hex: '#92B1B9', tipo: 'Exterior' },
  { name: 'Plata', hex: '#9B999A', tipo: 'Exterior' },
  { name: 'Gris niebla', hex: '#B9B9B9', tipo: 'Exterior' },
  { name: 'Gris grafito', hex: '#5F5F5F', tipo: 'Exterior' },
  { name: 'Blanco', hex: '#F0F0F0', tipo: 'Exterior' },
  { name: 'Negro', hex: '#000000', tipo: 'Exterior' },
  { name: 'Bi tono', hex: '#F5EDDC', tipo: 'Interior' },
];
const SEED_S07_COLORES = [
  { name: 'Azul océano', hex: '#000080', tipo: 'Exterior' },
  { name: 'Gris plata', hex: '#9A9A9A', tipo: 'Exterior' },
  { name: 'Azul claro', hex: '#87CEEB', tipo: 'Exterior' },
  { name: 'Gris niebla', hex: '#000000', tipo: 'Exterior' },
  { name: 'Blanco perlado', hex: '#EEEBD9', tipo: 'Exterior' },
  { name: 'Blanco nieve', hex: '#F0F0F0', tipo: 'Exterior' },
  { name: 'Negro', hex: '#000000', tipo: 'Interior' },
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
  '*Imágenes referenciales, pueden incluir opcionales. Precio varía según versión';

// ─── Datos por modelo ─────────────────────────────────────────────────────
const SEED_S09_COLORES = [
  { name: 'Verde', hex: '#427276', tipo: 'Exterior' },
  { name: 'Azul', hex: '#3E5D9C', tipo: 'Exterior' },
  { name: 'Gris Niebla', hex: '#D7D7D7', tipo: 'Exterior' },
  { name: 'Negro', hex: '#000000', tipo: 'Exterior' },
  { name: 'Blanco', hex: '#E5E5E5', tipo: 'Exterior' },
  { name: 'Negro', hex: '#444444', tipo: 'Interior' },
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
    descripcion_lead: 'Tecnología, espacio y eficiencia para los viajes más exigentes.',
    precio_legal: DEFAULT_PRECIO_LEGAL,
    nav_label: 'S09',
    page_url: 'modelo-s09.html',
    news_tag: 'Próximamente',
    versiones: VERSIONES_S09,
    colores: SEED_S09_COLORES,
    galeria: S09_GALERIA,
    seguridad: S09_SEGURIDAD,
  },
  {
    slug: 's07', nombre: 'S07', tagline: 'SUV familiar', categoria: 'SUV',
    precio_desde: 16990000, destacado: true, orden: 2,
    descripcion: 'Diseño moderno y equipamiento generoso para toda la familia.',
    descripcion_lead: 'El SUV mediano con autonomía extendida y asistencias inteligentes.',
    precio_legal: DEFAULT_PRECIO_LEGAL,
    nav_label: 'S07',
    page_url: 'modelo-s07.html',
    news_tag: 'Lanzamiento',
    versiones: VERSIONES_S07,
    colores: SEED_S07_COLORES,
    galeria: DEFAULT_GALERIA,
    seguridad: DEFAULT_SEGURIDAD,
  },
  {
    slug: 's06', nombre: 'S06', tagline: 'SUV compacto', categoria: 'SUV',
    precio_desde: 14990000, destacado: true, orden: 3,
    descripcion: 'Compacto, ágil y con la tecnología que esperas.',
    descripcion_lead: 'Diseño moderno, eficiencia y tecnología en un SUV compacto urbano.',
    precio_legal: DEFAULT_PRECIO_LEGAL,
    nav_label: 'S06',
    page_url: 'modelo-s06.html',
    news_tag: 'Lanzamiento',
    versiones: VERSIONES_S06,
    colores: SEED_S06_COLORES,
    galeria: DEFAULT_GALERIA,
    seguridad: DEFAULT_SEGURIDAD,
  },
  {
    slug: 's06-phev', nombre: 'S06 PHEV', tagline: 'SUV híbrido enchufable', categoria: 'Híbrido',
    precio_desde: 19990000, destacado: true, orden: 4,
    descripcion: 'SUV híbrido enchufable con gran autonomía, bajo consumo y tecnología inteligente.',
    descripcion_lead: 'Híbrido enchufable con hasta 80 km de autonomía eléctrica pura.',
    precio_legal: DEFAULT_PRECIO_LEGAL,
    nav_label: 'S06 PHEV',
    page_url: 'modelo-s06-phev.html',
    news_tag: 'Híbrido enchufable',
    versiones: VERSIONES_S06_PHEV,
    colores: SEED_S06PHEV_COLORES,
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
    orden: 1,
  },
  {
    nombre: 'SHOWROOM MOVICENTER', direccion: 'Av. Américo Vespucio 1501, Quilicura',
    comuna: 'QUILICURA', region: 'Metropolitana',
    lat: -33.3569, lng: -70.7394,
    horario: 'Lunes a Domingo 10:00 a 20:00',
    tipo_label: 'Showroom Exclusivo',
    servicios: ['ventas', 'repuestos', 'servicio'],
    orden: 2,
  },
  {
    nombre: 'SUCURSAL CONCEPCIÓN', direccion: "Av. O'Higgins 789",
    comuna: 'CONCEPCIÓN', region: 'Biobío',
    lat: -36.8270, lng: -73.0498,
    horario: 'Lunes a Viernes 9:00 a 19:00',
    tipo_label: 'Sala de ventas',
    servicios: ['ventas', 'repuestos', 'servicio'],
    orden: 3,
  },
];

// ─── Footer (estructurado con components tipados) ─────────────────────────
const SEED_FOOTER = {
  copyright: '© 2025 SOUEAST Chile · Andes Motor',
  legales: 'Las imágenes son referenciales. Precios sujetos a stock y condiciones del mercado.',
  back_to_top_label: 'VOLVER ARRIBA',
  modelos_titulo: 'Modelos',
  secondary_titulo: 'Más',
  social_titulo: 'Síguenos',
  tagline_eyebrow: { ease: 'EASE', your: 'YOUR', life: 'LIFE' },
  modelos_links: [
    { label: 'S06', href: 'modelo-s06.html' },
    { label: 'S06 PHEV', href: 'modelo-s06-phev.html' },
    { label: 'S07', href: 'modelo-s07.html' },
    { label: 'S09', href: 'modelo-s09.html' },
  ],
  secondary_links: [
    { label: 'Noticias', href: 'noticias.html' },
    // Antes apuntaban a anchors fantasma (#legales, #privacidad) que no existen
    // en ninguna página → al click no navegaban. Ahora a las páginas reales.
    { label: 'Legales', href: 'legales.html' },
    { label: 'Políticas de privacidad', href: 'politicas-de-privacidad.html' },
    { label: 'Contáctanos', href: 'contacto.html' },
  ],
  social: [
    { red: 'instagram', url: 'https://www.instagram.com/popular/soueast-chile/', aria_label: 'Instagram' },
    { red: 'facebook',  url: 'https://www.facebook.com/profile.php?id=61583520998515', aria_label: 'Facebook' },
    { red: 'tiktok',    url: 'https://www.tiktok.com/@soueast.chile?_r=1&_t=ZM-92HJTyvz3jn', aria_label: 'TikTok' },
    { red: 'youtube',   url: 'https://www.youtube.com/@SoueastChile', aria_label: 'YouTube' },
  ],
  // Mantenemos el JSON legacy por compatibilidad
  columnas: [
    { titulo: 'Modelos', links: [
      { label: 'S06', href: 'modelo-s06.html' },
      { label: 'S06 PHEV', href: 'modelo-s06-phev.html' },
      { label: 'S07', href: 'modelo-s07.html' },
      { label: 'S09', href: 'modelo-s09.html' },
    ]},
    { titulo: 'Más', links: [
      { label: 'Noticias', href: 'noticias.html' },
      { label: 'Sucursales', href: 'sucursales.html' },
      { label: 'Contáctanos', href: 'contacto.html' },
    ]},
  ],
};

// ─── Global ───────────────────────────────────────────────────────────────
const SEED_GLOBAL = {
  brand_name: 'SOUEAST Chile',
  tagline_eyebrow: { ease: 'EASE', your: 'YOUR', life: 'LIFE' },
  nav_models: [
    { label_override: 'S06', href: 'modelo-s06.html' },
    { label_override: 'S06 PHEV', href: 'modelo-s06-phev.html' },
    { label_override: 'S07', href: 'modelo-s07.html' },
    { label_override: 'S09', href: 'modelo-s09.html' },
  ],
  nav_cotizar_label: 'Cotizar',
  nav_sucursales_label: 'Sucursales',
  nav_noticias_label: 'Noticias',
  nav_noticias_href: 'noticias.html',
  nav_service_label: 'Agenda tu servicio',
  nav_service_href: '#servicio',
  nav_cta_external_url: 'https://andesmotor.in-touch.cl/agenda/jetour/',
  whatsapp_phone: '56912345678',
  whatsapp_brand_name: 'Andes Retail',
  whatsapp_subtitle: '¡Encuentra el vehículo perfecto para lo que necesitas!',
  whatsapp_bubble_text: '¿Quieres cotizar, agendar o necesitas recomendaciones? Escríbeme.',
  whatsapp_button_label: '¡Hablemos!',
  whatsapp_credit_html: '<em>desarollado por</em> <span>adereso</span>',
  default_cotizar_modelo: 'S06',
  /** Vacío en seed: el cliente pega aquí la clave de Maps (no commitear valores reales). */
  google_maps_api_key: '',
  default_seo: {
    meta_title: 'SOUEAST Chile',
    meta_description: 'SUV de última generación para Chile. Conoce los modelos S06, S06 PHEV, S07 y S09.',
  },
};

// ─── Home Page ────────────────────────────────────────────────────────────
const SEED_HOME = {
  hero_eyebrow: { ease: 'EASE', your: 'YOUR', life: 'LIFE' },
  hero_title: 'Bienvenidos a SOUEAST Chile',
  hero_cta_label: 'CONOCE MÁS',
  hero_cta_href: 'modelo-s06.html',
  modelos_section_title: 'Modelos',
  modelos_default_tag: 'Lanzamiento',
  noticias_section_title: 'Noticias',
  noticias_ver_todas_label: 'VER TODAS',
  quehacer_items: [
    { label: 'Elige tu SOUEAST', icon: 'se', href: '#modelos', primary: true },
    { label: 'Encuentra tu Sucursal', icon: 'pin', href: 'sucursales.html', primary: false },
    { label: 'Cotiza tu SOUEAST', icon: 'doc', href: 'cotizador.html', primary: false },
  ],
  seo: {
    meta_title: 'SOUEAST Chile — SUV de última generación',
    meta_description: 'Conoce los SUV S06, S06 PHEV, S07 y S09 de SOUEAST en Chile. Cotiza online y encuentra tu sucursal.',
  },
};

// ─── Noticias Page ────────────────────────────────────────────────────────
const SEED_NOTICIAS_PAGE = {
  hero_eyebrow_label: 'Últimas noticias',
  hero_title: 'Noticias',
  categorias: ['Todos', 'Marca', 'Modelos', 'Lanzamientos', 'Tecnología'],
  empty_state_text: 'No hay noticias en esta categoría por el momento.',
  seo: {
    meta_title: 'Noticias SOUEAST Chile',
    meta_description: 'Últimas novedades, lanzamientos y eventos de SOUEAST Chile.',
  },
};

// ─── Contacto Page ────────────────────────────────────────────────────────
const SEED_CONTACTO_PAGE = {
  hero_title: 'Contacto',
  nav_cotizar_label: 'Cotizar',
  nav_cotizar_href: 'cotizador.html',
  nav_sucursales_label: 'Sucursales',
  nav_sucursales_href: 'sucursales.html',
  tipos_solicitud: [
    'Consulta general',
    'Cotización',
    'Post venta',
    'Servicio técnico',
    'Garantía',
    'Repuestos',
    'Financiamiento',
    'Test drive',
  ],
  areas: [
    'Ventas',
    'Post venta',
    'Servicio técnico',
    'Repuestos',
    'Administración',
    'Otro',
  ],
  modelos_form: ['S06', 'S06 PHEV', 'S07', 'S09'],
  privacidad_label_html:
    'Acepto expresamente las <a href="#privacidad" style="color: var(--color-primary); text-decoration: underline">políticas de privacidad</a> de Andes Motor.',
  mensaje_exito_titulo: '¡Gracias por contactarnos!',
  mensaje_exito_texto: 'Hemos recibido tu solicitud y nos pondremos en contacto contigo a la brevedad.',
  mensaje_exito_cta_label: 'Enviar otra consulta',
  seo: {
    meta_title: 'Contacto · SOUEAST Chile',
    meta_description: 'Contáctanos para cotizar, agendar test drive o consultas de post-venta.',
  },
};

// ─── Cotizador Page ───────────────────────────────────────────────────────
const SEED_COTIZADOR_PAGE = {
  hero_title: 'Cotizador',
  intro_eyebrow: 'Solicita',
  intro_title: 'Cotiza tu SOUEAST',
  intro_lead: 'Te contactaremos en menos de 24 horas con una propuesta personalizada y la sucursal más cercana.',
  form_subtitle: 'Completa el formulario y nos pondremos en contacto contigo',
  form_fields: {
    modelo: { label: 'Modelo', placeholder: 'Modelo' },
    version: { label: 'Versión', placeholder: 'Seleccione una versión', empty_help: 'No hay versiones disponibles para este modelo' },
    nombre: { label: 'Nombre', placeholder: 'Nombre' },
    apellido: { label: 'Apellido', placeholder: 'Apellido' },
    rut: { label: 'Rut', placeholder: 'sin puntos y con guión' },
    email: { label: 'E-mail', placeholder: 'ejemplo@correo.cl' },
    telefono: { label: 'Teléfono', placeholder: '912345678' },
    comuna: { label: 'Comuna', placeholder: 'Selecciona una comuna' },
    sucursal: { label: 'Sucursal', placeholder: 'Selecciona una sucursal', empty_help: 'No hay sucursales disponibles en esta comuna' },
  },
  form_messages: {
    nombre_required: 'El nombre es requerido',
    apellido_required: 'El apellido es requerido',
    rut_required: 'El RUT es requerido',
    rut_invalid: 'El RUT no es válido',
    email_required: 'El email es requerido',
    email_invalid: 'El email no es válido',
    telefono_required: 'El teléfono es requerido',
    telefono_invalid: 'El teléfono debe tener exactamente 9 dígitos',
    comuna_required: 'Selecciona una comuna',
    sucursal_required: 'Selecciona una sucursal',
    modelo_required: 'Selecciona un modelo',
    version_required: 'Selecciona una versión',
    privacidad_required: 'Debes aceptar las políticas de privacidad',
  },
  modelos_form: ['S06', 'S06 PHEV', 'S07', 'S09'],
  versiones_form: {
    S06: [
      { codigo: 'S06_15T_6DCT_LUX', nombre: '1.5T 6DCT LUX' },
      { codigo: 'S06_16T_7DCT_LUX', nombre: '1.6T 7DCT LUX' },
      { codigo: 'S06_16T_7DCT_LIMITED', nombre: '1.6T 7DCT LIMITED' },
    ],
    'S06 PHEV': [{ codigo: 'S06PHEV_LIMITED', nombre: 'S06 PHEV LIMITED' }],
    S07: [
      { codigo: 'S07_15T_6DCT', nombre: '1.5T 6DCT' },
      { codigo: 'S07_16T_7DCT', nombre: '1.6T 7DCT' },
    ],
    S09: [{ codigo: 'S09_20T_7DCT', nombre: '2.0T 7DCT' }],
  },
  submit_label: 'SOLICITAR COTIZACIÓN',
  submitting_label: 'ENVIANDO…',
  mensaje_exito: '¡Cotización enviada! Recibirás respuesta en menos de 24 horas.',
  mensaje_error: 'No pudimos enviar tu cotización. Inténtalo nuevamente o contáctanos directamente.',
  privacidad_label_html:
    'Acepto las <a href="#privacidad">políticas de privacidad</a> de Andes Motor.',
  seo: {
    meta_title: 'Cotizador · SOUEAST Chile',
    meta_description: 'Cotiza tu SOUEAST en línea y recibe una propuesta personalizada en 24 horas.',
  },
};

// ─── Gracias Page ─────────────────────────────────────────────────────────
const SEED_TEST_DRIVE_PAGE = {
  hero_eyebrow: 'Agenda',
  hero_title: 'Agenda tu Test Drive',
  hero_lead:
    'Vive la experiencia SOUEAST. Coordinamos contigo la sucursal y horario para que pruebes el modelo de tu interés.',
  modelos_form: ['S06', 'S06 PHEV', 'S07', 'S09'],
  submit_label: 'AGENDAR TEST DRIVE',
  privacidad_html:
    'Acepto expresamente las <a href="politicas-de-privacidad.html">políticas de privacidad</a> de Andes Motor.',
  success_title: '¡Listo!',
  success_lead:
    'Recibimos tu solicitud. Te contactaremos muy pronto para confirmar la fecha y la sucursal del Test Drive.',
  success_cta_label: 'VOLVER AL HOME',
  success_cta_href: 'home.html',
  nota_legal: '',
  seo: {
    meta_title: 'Test Drive — SOUEAST Chile',
    meta_description: 'Agenda tu prueba de manejo SOUEAST en Chile.',
  },
};

const SEED_GRACIAS_PAGE = {
  title: '¡Gracias!',
  mensaje:
    '<p>Hemos recibido tu solicitud. Un ejecutivo se contactará contigo a la brevedad.</p>',
  cta_label: 'Volver al inicio',
  cta_href: 'home.html',
  seo: {
    meta_title: 'Gracias · SOUEAST Chile',
    no_index: true,
  },
};

// ─── Noticias (collection) — solo las dos publicadas en soueastchile.cl ─────
const SEED_NOTICIAS = [
  {
    slug: 'soueast-showroom-movicenter',
    titulo: 'Soueast avanza a paso agigantado: Inauguró showroom exclusivo en Movicenter',
    categoria: 'Marca',
    fecha: '2026-01-05',
    fecha_label: '5 ENERO, 2026',
    tag_variant: 'red',
    destacado_home: true,
    orden_home: 1,
    resumen:
      'En el marco de su estrategia de expansión por el país, la firma asiática representada por Andes Motor estrenó su primera tienda propia en la ciudad del automóvil. El espacio, que es parte de una lista de nueve vitrinas bi-marca próximas a estrenar, exhibirá la nueva gama de SUVs, junto a pruebas de manejo y venta con bonos de financiamiento.',
    cta_label: 'LEER MÁS',
    cta_href: '#',
  },
  {
    slug: 'soueast-nueva-marca-mercado-chileno',
    titulo: 'Soueast: la nueva marca oriental que irrumpe en el mercado automotriz chileno',
    categoria: 'Marca',
    fecha: '2025-12-20',
    fecha_label: '20 DICIEMBRE, 2025',
    tag_variant: 'red',
    destacado_home: true,
    orden_home: 2,
    resumen:
      'La marca china del Grupo Chery, desembarca en suelo nacional de la mano de Andes Motor con una oferta inicial conformada por cuatro SUVs.',
    cta_label: 'LEER MÁS',
    cta_href: '#',
  },
];

// ─── Permisos ─────────────────────────────────────────────────────────────
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

// ─── Helpers de seed idempotente ──────────────────────────────────────────
async function ensureSingle(strapi, uid, data, label) {
  const raw = await strapi.entityService.findMany(uid);
  // Strapi 4 suele devolver un arreglo (p. ej. un solo global); si usamos el arreglo
  // como entidad, todas las claves parecen "ausentes" y el seed loguea en cada boot.
  const existing = Array.isArray(raw) ? raw[0] : raw;
  if (existing && existing.id) {
    const missing = {};
    for (const [key, value] of Object.entries(data)) {
      if (existing[key] === undefined || existing[key] === null) {
        missing[key] = value;
      }
    }
    if (Object.keys(missing).length > 0) {
      await strapi.entityService.update(uid, existing.id, { data: missing });
      strapi.log.info(`[bootstrap] seed ${label}: campos nuevos completados`);
    }
    return;
  }
  await strapi.entityService.create(uid, { data: { ...data, publishedAt: new Date() } });
  strapi.log.info(`[bootstrap] seed ${label}`);
}

async function ensureCollection(strapi, uid, items, label) {
  const count = await strapi.entityService.count(uid);
  if (count > 0) return;
  for (const data of items) {
    await strapi.entityService.create(uid, { data: { ...data, publishedAt: new Date() } });
  }
  strapi.log.info(`[bootstrap] seed ${label}: ${items.length}`);
}

async function seedIfEmpty(strapi) {
  await ensureCollection(strapi, 'api::modelo.modelo', SEED_MODELOS, 'modelos');
  await ensureCollection(strapi, 'api::sucursal.sucursal', SEED_SUCURSALES, 'sucursales');
  await ensureCollection(strapi, 'api::noticia.noticia', SEED_NOTICIAS, 'noticias');

  await ensureSingle(strapi, 'api::footer.footer', SEED_FOOTER, 'footer');
  await ensureSingle(strapi, 'api::global.global', SEED_GLOBAL, 'global');
  await ensureSingle(strapi, 'api::home-page.home-page', SEED_HOME, 'home-page');
  await ensureSingle(strapi, 'api::noticias-page.noticias-page', SEED_NOTICIAS_PAGE, 'noticias-page');
  await ensureSingle(strapi, 'api::contacto-page.contacto-page', SEED_CONTACTO_PAGE, 'contacto-page');
  await ensureSingle(strapi, 'api::cotizador-page.cotizador-page', SEED_COTIZADOR_PAGE, 'cotizador-page');
  await ensureSingle(strapi, 'api::gracias-page.gracias-page', SEED_GRACIAS_PAGE, 'gracias-page');
  await ensureSingle(strapi, 'api::test-drive-page.test-drive-page', SEED_TEST_DRIVE_PAGE, 'test-drive-page');
  await syncSeedLegalPages(strapi);
}

const POLITICAS_CONTENIDO_SEED_PATH = path.join(__dirname, '../config/seed/politicas-contenido.html');
const SEED_LEGALES_BAJADA =
  'A continuación se detallan las simulaciones de financiamiento y condiciones ' +
  'comerciales vigentes para cada versión de los modelos SOUEAST. Las ' +
  'simulaciones son referenciales y están sujetas a las condiciones de BK ' +
  'Servicios Financieros y de los términos del crédito.';

function richTextPlainLen(val) {
  if (val == null) return 0;
  return String(val).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().length;
}

async function syncSeedLegalPages(strapi) {
  let politicasHtml = '';
  try {
    politicasHtml = fs.readFileSync(POLITICAS_CONTENIDO_SEED_PATH, 'utf8').trim();
  } catch {
    strapi.log.warn('[bootstrap] no se leyó politicas-contenido.html; políticas no se rellenan desde seed');
  }

  const rows = [
    {
      slug: 'politicas-de-privacidad',
      titulo: 'Políticas de Privacidad',
      bajada: '',
      contenido: politicasHtml,
      fecha_vigencia: '2024-01-01',
      simulaciones: [],
      seo: {
        meta_title: 'Políticas de Privacidad — SOUEAST Chile',
        meta_description:
          'Políticas de privacidad y protección de datos personales — Andes Motor / SOUEAST Chile.',
      },
    },
    {
      slug: 'legales',
      titulo: 'Legales',
      bajada: SEED_LEGALES_BAJADA,
      simulaciones: LEGAL_SIMS_SEED,
      seo: {
        meta_title: 'Legales — SOUEAST Chile',
        meta_description: 'Simulaciones de financiamiento y condiciones comerciales SOUEAST Chile.',
      },
    },
  ];

  for (const row of rows) {
    const found = await strapi.entityService.findMany('api::legal-page.legal-page', {
      filters: { slug: { $eq: row.slug } },
      limit: 1,
      // Sin populate, `simulaciones` viene vacío y el seed reescribe Legales en cada arranque.
      populate: ['simulaciones'],
    });
    const existing = found && found[0];

    const needsPoliticas =
      row.slug === 'politicas-de-privacidad' &&
      politicasHtml &&
      (!existing || richTextPlainLen(existing.contenido) < 120);
    const needsLegales =
      row.slug === 'legales' &&
      (!existing ||
        !Array.isArray(existing.simulaciones) ||
        existing.simulaciones.length === 0 ||
        richTextPlainLen(existing.bajada) < 20);

    if (!existing) {
      const createData = {
        slug: row.slug,
        titulo: row.titulo,
        bajada: row.bajada,
        seo: row.seo,
        publishedAt: new Date(),
      };
      if (row.slug === 'politicas-de-privacidad') {
        createData.contenido = row.contenido;
        createData.fecha_vigencia = row.fecha_vigencia;
        createData.simulaciones = row.simulaciones;
      } else {
        createData.simulaciones = row.simulaciones;
      }
      await strapi.entityService.create('api::legal-page.legal-page', { data: createData });
      strapi.log.info(`[bootstrap] legal-page created slug=${row.slug}`);
      continue;
    }

    if (!needsPoliticas && !needsLegales) continue;

    const update = {};
    if (needsPoliticas) {
      Object.assign(update, {
        titulo: row.titulo,
        bajada: row.bajada,
        contenido: row.contenido,
        fecha_vigencia: row.fecha_vigencia,
        seo: row.seo,
      });
    }
    if (needsLegales) {
      Object.assign(update, {
        titulo: row.titulo,
        bajada: row.bajada,
        simulaciones: row.simulaciones,
        seo: row.seo,
      });
    }
    await strapi.entityService.update('api::legal-page.legal-page', existing.id, { data: update });
    strapi.log.info(`[bootstrap] legal-page backfilled slug=${row.slug}`);
  }
}

module.exports = {
  register() {},
  async bootstrap({ strapi }) {
    await setPublicPermissions(strapi, [
      // Existentes
      'api::modelo.modelo.find',
      'api::modelo.modelo.findOne',
      'api::sucursal.sucursal.find',
      'api::sucursal.sucursal.findOne',
      'api::footer.footer.find',
      // Nuevos
      'api::global.global.find',
      'api::home-page.home-page.find',
      'api::noticias-page.noticias-page.find',
      'api::contacto-page.contacto-page.find',
      'api::cotizador-page.cotizador-page.find',
      'api::gracias-page.gracias-page.find',
      'api::test-drive-page.test-drive-page.find',
      'api::legal-page.legal-page.find',
      'api::legal-page.legal-page.findOne',
      'api::noticia.noticia.find',
      'api::noticia.noticia.findOne',
    ]);
    await seedIfEmpty(strapi);
  },
};
