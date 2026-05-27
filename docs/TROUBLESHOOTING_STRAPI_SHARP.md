# 🔧 TROUBLESHOOTING: Strapi Sharp Module Error

**Error:** `Cannot find module '../build/Release/sharp-linux-arm64v8.node'`  
**Contexto:** Ocurre al hacer `npm run develop`  
**Impacto:** Strapi no puede iniciar  
**Solución:** Recompilar sharp para tu arquitectura

---

## 🔍 DIAGNÓSTICO

### ¿Tienes este error?

```
Error: Could not load js config file ...
Something went wrong installing the "sharp" module
Cannot find module '../build/Release/sharp-linux-arm64v8.node'
```

### Causas comunes

1. **Node version incompatible**
   - Requerido: Node 18.x o 20.x
   - Problem: Tienes Node 22.x

2. **sharp no se compiló para tu arquitectura**
   - macOS: ARM64 (Apple Silicon)
   - Linux: ARM64 (algunos servidores)
   - Windows: x64

3. **node_modules corrupto**
   - `npm install` incompleto
   - Permisos incorrectos
   - Versión Node cambió

---

## ✅ SOLUCIONES

### OPCIÓN A: Verificar y Usar Node Correcto (MÁS RÁPIDO)

#### Paso 1: Verificar versión actual
```bash
node --version
# Debe mostrar v18.x.x o v20.x.x
# Si muestra v22.x.x → PROBLEMA
```

#### Paso 2: Instalar Node 20 (si tienes nvm)
```bash
# Si usas NVM (Node Version Manager)
nvm install 20
nvm use 20
node --version  # Debe mostrar v20.x.x
```

#### Paso 3: Limpiar e reinstalar
```bash
rm -rf node_modules package-lock.json
npm install
```

#### Paso 4: Iniciar Strapi
```bash
npm run develop
```

**Tiempo estimado:** 5-10 minutos

---

### OPCIÓN B: Recompilar sharp (Más confiable)

Si OPCIÓN A no funciona o prefieres mantener tu Node actual:

#### Paso 1: Limpiar
```bash
rm -rf node_modules package-lock.json
rm -rf ~/.npm
```

#### Paso 2: Instalar con build from source
```bash
npm install --build-from-source
# Esto toma MÁS tiempo pero compila sharp para tu arquitectura
```

#### Paso 3: Esperar (esto toma 5-15 minutos)
```
npm WARN npm npm does not support Node.js v22.22.0
...
gyp info ok                                            (genera binarios nativos)
...
added 680 packages in 10m 23s
```

#### Paso 4: Iniciar Strapi
```bash
npm run develop
```

**Tiempo estimado:** 10-20 minutos

---

### OPCIÓN C: Usar legacy-peer-deps (Más permisivo)

Si las opciones A y B fallan:

```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps --build-from-source
npm run develop
```

---

## 💻 GUÍAS ESPECÍFICAS POR SISTEMA

### macOS (M1/M2/M3 - Apple Silicon)

```bash
# 1. Verifica Node versión
node --version  # Debe ser v18 o v20

# 2. Si tienes v22, downgrade
nvm install 20
nvm use 20

# 3. Limpia
rm -rf node_modules package-lock.json

# 4. Reinstala
npm install

# 5. Inicia
npm run develop
```

### macOS (Intel)

```bash
# Mismo proceso que Apple Silicon
node --version
npm install
npm run develop
```

### Linux (Ubuntu/Debian)

```bash
# 1. Verifica Node
node --version

# 2. Si necesitas cambiar Node
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Limpia e instala
rm -rf node_modules package-lock.json
npm install --build-from-source

# 4. Inicia Strapi
npm run develop
```

### Linux (Fedora/CentOS)

```bash
# 1. Verifica
node --version

# 2. Cambia Node si es necesario
sudo dnf install nodejs20

# 3. Limpia e instala
rm -rf node_modules package-lock.json
npm install --build-from-source

# 4. Inicia
npm run develop
```

### Windows

```bash
# 1. Verifica Node
node --version

# 2. Descarga Node 20 desde https://nodejs.org
# Instala versión LTS 20.x

# 3. En PowerShell (como Admin):
rmdir -r node_modules
del package-lock.json
npm install
npm run develop
```

---

## ✔️ VALIDACIÓN

### Después de instalar, verifica:

```bash
# 1. Sharp debe estar instalado
npm list sharp
# Output: sharp@x.x.x

# 2. Node version correcto
node --version
# Output: v18.x.x o v20.x.x

# 3. Strapi levanta sin errores
npm run develop
# Output: Strapi listening on http://localhost:1337
```

### Primera ejecución esperada:

```
> soueast-cms@0.1.0 develop
> strapi develop

- Building build context
✔ Building build context (120ms)
- Creating admin
✔ Creating admin (12096ms)
- Loading Strapi
✔ Loading Strapi (8234ms)

✓ You are all set! Strapi is running at: http://localhost:1337
⏱ Time to start: 2.343s
```

---

## 🐛 SI SIGUE FALLANDO

### Debug paso a paso

```bash
# 1. Verifica arquitectura
node -p "process.arch"
# Output: arm64, x64, etc

# 2. Verifica Node instalado
which node
node --version

# 3. Verifica npm
npm --version

# 4. Limpia todo
rm -rf node_modules package-lock.json ~/.npm

# 5. Reinstala verbose
npm install --verbose 2>&1 | tee npm-install.log

# 6. Busca errores en log
grep -i error npm-install.log
grep -i sharp npm-install.log

# 7. Intenta build from source
npm install --build-from-source --verbose
```

### Verifica si sharp se compiló

```bash
ls -la node_modules/sharp/build/Release/
# Debe haber sharp-*.node file para tu arquitectura
```

---

## 🆘 SOPORTE ADICIONAL

### Recursos oficiales

- Sharp installation: https://sharp.pixelplumbing.com/install
- Node.js versions: https://nodejs.org
- Strapi docs: https://docs.strapi.io

### Comandos útiles para troubleshoot

```bash
# Limpia cache npm agresivamente
npm cache clean --force

# Limpia node_modules completamente
rm -rf node_modules/.bin
rm -rf node_modules
rm -rf package-lock.json

# Verifica integridad de instalación
npm audit
npm ls

# Instala específicamente sharp
npm install sharp --build-from-source

# Si todo falla, usa versión más antigua de sharp
npm install sharp@0.32.0 --build-from-source
```

---

## 🎯 RESUMEN RÁPIDO

| Problema | Solución |
|----------|----------|
| Node v22 | Cambiar a Node 20 |
| sharp no compila | `npm install --build-from-source` |
| node_modules corrupto | `rm -rf node_modules && npm install` |
| Permisos | Ejecutar sin `sudo` |
| Sigue fallando | Revisar logs con `npm install --verbose` |

---

## ✅ UNA VEZ RESUÉLTO

Cuando Strapi levante exitosamente:

```bash
# 1. Accede a admin
open http://localhost:1337/admin

# 2. Verifica colecciones
# Content Manager → Debes ver:
#   - modelo-version
#   - import-log

# 3. Prueba import endpoint
curl -X POST http://localhost:1337/api/import/preview \
  -H "Authorization: Bearer {JWT}" \
  -F "file=@TEST_IMPORT_DATA.csv" \
  -F "type=modelo-version"

# 4. Verifica resultado
# Deberías recibir JSON con preview de importación
```

---

**Una vez Strapi levante, la validación real puede proceder.**

