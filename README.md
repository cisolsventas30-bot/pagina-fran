# 🦫 CapyABA

**Plataforma de aprendizaje online estilo Coursera.** Sistema LMS con dos roles (Admin y Alumno), certificados generados con IA, login con Google, y una interfaz limpia y profesional.

---

## ✨ Características principales

- 🎨 **Interfaz pulcra** inspirada en Coursera — blanco limpio + acentos marrón pastel
- 🔐 **Login con Google** (OAuth) o email/contraseña
- 👨‍🏫 **Panel de admin completo**:
  - CRUD de cursos (crear, editar, eliminar)
  - Constructor visual de exámenes con 5 tipos de preguntas
  - Constructor visual de tareas digitales con 7 tipos de campos
  - Asignación de cursos a alumnos
  - Vista de progreso por alumno con métricas
  - Revisión individual de ensayos con calificación manual
- 🎓 **Panel de alumno**:
  - Ver cursos asignados, progreso, certificados
  - Catálogo con candado para cursos no asignados
  - Reproductor de videos con tracking
  - Realizar exámenes con auto-calificación
  - Rellenar tareas digitales
- 🔒 **Control de acceso**: los alumnos solo acceden a cursos que el admin les asigne
- 📹 **Videos YouTube/Vimeo** embebidos con tracking
- ✅ **5 tipos de preguntas**: opción única, múltiple, V/F, respuesta corta, ensayo
- 📝 **7 tipos de campos en tareas**: texto corto/largo, número, fecha, email, URL, select
- 🏆 **Certificados con IA** (Groq + Llama 3.3) + PDF generado
- 💰 **Costo $0** en plan gratis de Supabase + Vercel

---

## 🚀 Stack técnico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| UI | Tailwind CSS con paleta custom (`brand`, `mocha`, `ink`) |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| IA | Groq API (Llama 3.3 70B) |
| PDFs | pdf-lib |
| Auth | Email/password + Google OAuth |

---

## 📦 Instalación paso a paso

### 1. Supabase (base de datos)

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto gratis.
2. Ve a **Settings → API** y copia:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Ve al **SQL Editor** y ejecuta todo el contenido de `supabase/migrations/001_initial_schema.sql`.
4. Ve a **Storage** y crea un bucket público llamado `certificates`:
   ```sql
   insert into storage.buckets (id, name, public) 
   values ('certificates', 'certificates', true);
   ```

### 2. Google OAuth (opcional pero recomendado)

Para habilitar el botón de "Continuar con Google":

1. Ve a [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services → Credentials**.
2. Crea un **OAuth 2.0 Client ID** (tipo: Web application).
3. En **Authorized redirect URIs** agrega:
   ```
   https://<TU-PROYECTO>.supabase.co/auth/v1/callback
   ```
4. Copia el Client ID y Client Secret.
5. En Supabase: **Authentication → Providers → Google** → pega ambos valores y activa.

### 3. Groq API (para certificados con IA)

1. Ve a [console.groq.com](https://console.groq.com) y crea una cuenta.
2. Genera una API Key y guárdala.

### 4. Configurar el proyecto

```bash
# Clonar o descomprimir el proyecto
cd capyaba

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales
```

### 5. Correr localmente

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### 6. Crear el primer admin

1. Regístrate en `/register` con el email que quieras usar como admin.
2. Ve al SQL Editor de Supabase y ejecuta:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'tu@email.com';
   ```
3. Cierra sesión y vuelve a entrar. Ya tienes acceso al panel admin.

### 7. Deploy en Vercel

```bash
npx vercel --prod
```

Agrega las mismas variables de entorno en el dashboard de Vercel (Settings → Environment Variables).

**Importante**: después del deploy, actualiza en Google Cloud Console la redirect URI para usar tu dominio de producción.

---

## 🔒 Cómo funciona el control de acceso

El sistema está diseñado para que los alumnos **no tengan acceso libre** a los cursos:

1. **Alumno se registra** (con Google o email) → se crea su cuenta con rol `student`.
2. **Alumno ve el catálogo** pero con candado — no puede ingresar a ningún curso.
3. **Admin asigna cursos** desde `/admin/students` → el alumno aparece con el curso disponible.
4. **Alumno ya puede acceder** al curso desde su dashboard.
5. **Al completar con 80%+** → se genera el certificado automáticamente.

Esto se enforza a nivel de base de datos con **Row Level Security** en Supabase: aunque un usuario manipule la URL, la DB no le devolverá los datos si no tiene una `enrollment` activa.

---

## 📁 Estructura del proyecto

```
capyaba/
├── app/
│   ├── page.tsx                    # Landing pública
│   ├── (auth)/
│   │   ├── login/page.tsx          # Login con Google + email
│   │   └── register/page.tsx       # Registro
│   ├── auth/callback/route.ts      # OAuth callback
│   ├── (admin)/
│   │   ├── layout.tsx
│   │   └── admin/
│   │       ├── page.tsx            # Dashboard admin
│   │       ├── courses/new/        # Crear curso
│   │       ├── students/           # Asignar cursos a alumnos
│   │       └── reviews/            # Revisar ensayos
│   ├── (student)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx      # Mis cursos
│   │   ├── catalog/page.tsx        # Catálogo (con candados)
│   │   ├── learn/[id]/             # Ver curso
│   │   └── certificates/page.tsx   # Mis certificados
│   └── api/
│       ├── certificates/route.ts   # Genera PDF con IA
│       └── quiz/grade/route.ts     # Califica intentos
├── components/
│   ├── layout/Navbar.tsx
│   ├── ui/CapyLogo.tsx             # Logo (texto, mascota, completo)
│   └── QuizRunner.tsx              # Component de examen
├── lib/
│   ├── supabase/                   # Clients server/browser
│   ├── ai/                         # Groq integration
│   └── utils.ts
├── public/
│   ├── capyaba-logo.png            # Logo completo (landing)
│   ├── capyaba-mascot.png          # Mascota sola (login, empty states)
│   └── favicon.png
├── supabase/migrations/            # Schema SQL
├── middleware.ts                   # Protección de rutas
└── tailwind.config.ts              # Paleta custom
```

---

## 🎨 Sistema de diseño

### Paleta
- **`brand-*`** → azul (enlaces, acciones secundarias)
- **`mocha-*`** → marrón pastel (acentos de marca, fondos suaves)
- **`ink-*`** → grises neutros (textos, bordes)

### Tipografía
- **Display**: Fraunces (serif, titulares)
- **Sans**: Inter (cuerpo)

### Logo
- `CapyLogoFull` — capybara + texto (SOLO en landing)
- `CapyLogoText` — solo texto "CapyABA" (en sistema, navbar)
- `CapyMascot` — solo la mascota (login, empty states, certificados)

---

## 📝 Licencia

MIT — úsalo como quieras.
