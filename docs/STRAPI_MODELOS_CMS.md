# Modelos en Strapi — guía editorial (CMS)

Este documento explica cómo gestionar los **modelos de vehículo** desde el administrador Strapi sin romper páginas que ya están en producción.

---

## Cómo crear un nuevo modelo

1. Entra al **panel de administración** de Strapi (tu URL de Railway + `/admin`).
2. Ve a **Content Manager → Collection Types → Modelo**.
3. Pulsa **Create new entry**.
4. Completa al menos los campos **obligatorios** y revisa los de visibilidad (más abajo).
5. Añade **versiones**, imágenes y textos según necesites.
6. Pulsa **Save** para guardar borrador.
7. Cuando todo esté listo, pulsa **Publish**. Sin publicar, el sitio público **no** mostrará el modelo.

---

## Campos obligatorios (editor)

| Campo | Qué es |
|--------|--------|
| **Nombre** | Nombre oficial del modelo (ej. `S06`, `S11`). El sistema lo usa también para ayudarte a generar el slug. |
| **Slug** | Identificador **único en URL/API** en minúsculas (ej. `s06`, `s11-test`). **No lo cambies** en modelos ya publicados: rompería enlaces y el cotizador. |

El resto de campos son opcionales según diseño editorial, pero conviene tener textos clave e imágenes para que la ficha se vea completa.

---

## Qué es el slug

Es el ID estable del modelo en la API y en rutas dinámicas del sitio:

- Ejemplo dinámico: `modelo.html?slug=mislug` o `/modelos/mislug` (según el frontend).

Si el slug cambia después de lanzar campañas o enlaces, esos enlaces dejan de funcionar.

---

## Qué es `page_url` (URL de página manual)

Es un texto opcional para apuntar a una **URL concreta** (a menudo una página “clásica” tipo `modelo-s06.html`), cuando quieras conservar rutas legacy o enlaces externos al HTML estático.

- Si **va vacío**, el frontend puede usar la plantilla dinámica con `?slug=` o `/modelos/{slug}`.
- Si está **relleno**, algunas partes del sitio pueden priorizar ese enlace donde el desarrollo lo haya configurado.

**Importante:** no inventes rutas que no existan en el servidor. Rutas conocidas tipo `modelo-s06.html`, `modelo-s07.html`, etc. son válidas donde el frontend las sirva.

---

## Cuándo dejar `page_url` vacío

- Cuando quieras que el modelo viva solo en **rutas dinámicas** (`modelo.html?slug=…` / `/modelos/…`).
- Cuando migras gradualmente desde HTML fijo al flujo nuevo.

---

## Cómo ordenar modelos

El campo **Orden** (`orden`) es un número entero. Valores más bajos suelen aparecer primero donde el frontend ordene por este campo **(solo si la web lo usa así)**.

- El valor por defecto en el sistema es `0`; en bases ya pobladas los modelos pueden tener números distintos definidos editorialmente.
- **No borres números pensando que “se recalculan solos”.** Mantén una secuencia coherente (1, 2, 3…) según decisión editorial.

Hay además campos tipo **Destacado** (`destacado`) que pueden usarse en la home como “destaque” específico, según cómo esté montado el frontend.

---

## Mostrar / ocultar en el menú

Campos booleanos:

- **Mostrar en menú** (`show_in_menu`): por defecto **sí**. Si lo desmarcas y el frontend filtra por este campo, el modelo puede dejar de listarse en el menú generado desde la API.

**Nota sobre la barra de navegación global:** En **Global → Nav models** también puedes tener ítems con `href` manual y opcionalmente un enlace al content type Modelo. Eso puede convivir con el comportamiento nuevo: **los enlaces manuales siguen válidos.**

---

## Mostrar / ocultar en la home automática

**Mostrar en home** (`show_in_home`): por defecto **sí**.

La **Home** en Strapi tiene además una relación **modelos destacados** (`home-page.modelos_destacados`) que elige explícitamente qué modelos mostrar en bloques específicos. **No borres esa relación** si ya está configurada para producción: es independiente del filtro por `show_in_home`.

---

## Mostrar / ocultar en el cotizador

**Mostrar en cotizador** (`show_in_cotizador`): por defecto **sí**. Si el cotizador lee los modelos desde la API filtrando por este campo, al desmarcarlo el modelo puede dejar de ofrecerse.

La página **Cotizador** (`cotizador-page`) tiene campos JSON de formulario (`modelos_form`, `versiones_form`, etc.). Esos textos y listados son **copia/configuración aparte**. Si cambias sólo Versiones dentro de un modelo, revisa si el equipo editorial debe alinear también esos JSON (según proceso interno).

---

## Mostrar / ocultar en el footer (`show_in_footer`)

Este campo existe para cuando el frontend decida automatizar enlaces desde los modelos. **Hoy el footer suele estar armado manualmente** con componentes tipo **Enlaces de modelos** (`footer.modelos_links`: etiqueta + `href`).

- Marcar/desmarcar `show_in_footer` **no suele mover sola** esa lista manual hasta que desarrollo active esa lógica.
- Para añadir un link en el footer, edita **Single Type Footer** y mantén etiqueta + URL correctos.

---

## Cómo agregar una versión

1. En el modelo, busca el bloque repetible **Versiones**.
2. Añade un ítem; el componente usa al menos **Nombre** (`nombre`).
3. Guarda el modelo y **vuelve a publicar** el modelo cuando quieras que los cambios sean públicos.

**Estructura actual del componente de versión:** solo expone obligatoriamente el nombre en el CMS. Precios específicos por versión, códigos de cotización muy detallados, etc., pueden estar en otros campos del modelo o en la configuración JSON del cotizador — confirma con quien mantenga la web.

---

## Qué tienes que publicar

Todo lo que lleve **Draft & Publish**:

- Cambios en un **Modelo** no son públicos hasta **Publish**.
- Cambios en **Global**, **Home Page**, **Footer**, **Cotizador Page**, etc. también requieren **Publish** en ese single type.

Los borradores **no** deben aparecer en la API pública estándar del sitio (sin modo preview).

---

## Qué cosas requieren deploy y cuáles no

| Acción editorial | ¿Deploy? |
|------------------|-----------|
| Crear/editar/publicar contenido en Modelo, Home, Footer, etc. desde el admin | **No** |
| Cambiar texto, imágenes, versiones, SEO | **No** |
| Cambiar **estructura** del proyecto (schemas, código, `package.json`) | **Sí** (rebuild/redeploy Strapi en Railway u otro hosting) |

Añadir **campos nuevos** al modelo en el código (schema) sí implica commit, push y redeploy para que Strapi ejecute migraciones/apliquen el nuevo esquema en producción.

---

## Footer manual: cómo enlazar modelos

1. Ve a **Single Type Footer**.
2. En **Enlaces de modelos** (`modelos_links`), cada fila tiene **label** y **href** (ej. `modelo-s07.html`).
3. Publica los cambios en Footer cuando termines.

Esto es independiente del campo booleano **Mostrar en footer** del modelo hasta que el frontend unifique comportamiento.

---

## Qué NO deberías tocar (para no romper el sitio)

- No **elimines campos** del modelo ni componentes relacionados desde el Content-Type Builder en producción sin plan de desarrollo.
- No **renombres slug** ni UIDs ya usados por enlaces externos.
- No pongas valores de API keys o secretos corporativos en campos públicos pensando que son “solo notas”: **Global** tiene campos sensibles que solo deben usar valores controlados por el equipo técnico.
- Si no estás segura o seguro del impacto en **cotizador o home**, consulta antes de borrar bloques relacionados (`modelos_destacados`, JSON del cotizador, etc.).

---

## Soporte técnico

Para dudas sobre **URLs exactas**, **redirects** (`/s06` → página legacy) o **filtros nuevos del frontend**, alinea esta guía con el repositorio del sitio público que consume esta API.
