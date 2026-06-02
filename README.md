# 🐂 Sistema Bovino - Frontend

¡Bienvenido al frontend de **Sistema Bovino**! Una plataforma moderna y altamente interactiva desarrollada con las últimas tecnologías web para la gestión eficiente y control completo de hatos ganaderos, control de salud, producción de leche y carne, y reproducción.

Este módulo de cliente está diseñado para ofrecer una experiencia fluida, responsiva en datos visuales para propietarios, veterinarios y operarios.

---

## 🚀 Tecnologías Principales

*   **Framework:** [Next.js 15+](https://nextjs.org/) con App Router (React 19)
*   **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) para robustez y tipado estático
*   **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
*   **Componentes UI:** [Shadcn UI](https://ui.shadcn.com/) (Radix Primitives, Tailwind CSS)
*   **Iconografía:** [Lucide React](https://lucide.dev/)
*   **Validaciones:** [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/)
*   **Gráficos:** [Recharts](https://recharts.org/) para visualización interactiva de KPIs

---

## ✨ Características Clave

1.  **Dashboard Interactivo Multidimensional**:
    *   **Tab de Producción:** Monitoreo y métricas de litros de leche y peso de carne.
    *   **Tab de Reproducción:** Gráficos tipo dona con histórico de montas por estado (Confirmada, En Evaluación, Aborto, etc.) y filtros de tiempo (Total vs. Este Mes).
    *   **Tab de Salud e Inventario:** Visualización rápida de tratamientos activos y conteo del hato.
2.  **Gestión de Hatos (Animales)**:
    *   Filtros inteligentes por estado productivo, lote y sexo.
    *   Registro y edición rápida de vacas, toros y terneros.
3.  **Seguridad y Autenticación**:
    *   Login robusto basado en token JWT y roles (`propietario`, `veterinario`, `operario`).
    *   Restricción de vistas y enlaces en el menú lateral (Sidebar) adaptables al rol.
    *   Modal obligatorio de cambio de contraseña en el primer inicio de sesión.
4.  **Panel de Administración de Usuarios**:
    *   Creación de operadores y veterinarios.
    *   Generación automática de contraseñas temporales.
    *   **Confirmación Robusta:** Modal de credenciales interactivo con opción de copiado rápido al portapapeles y alertas inteligentes si falla el envío de correo.

---

## 📂 Estructura de Directorios

```text
sistema-bovino-frontend/
├── app/                  # Enrutamiento App Router de Next.js
│   ├── animales/         # Módulo de gestión ganadera
│   ├── dashboard/        # Dashboard principal de métricas y gráficos
│   ├── usuarios/         # Gestión de personal (Propietario)
│   │   └── nuevo/        # Formulario de registro de nuevos operarios/veterinarios
│   ├── layout.tsx        # Layout root y configuraciones globales
│   ├── client-layout.tsx # Manejo de estados del layout (SidebarProvider)
│   └── page.tsx          # Página raíz (Formularios de Login y Registro de Finca)
├── components/           # Componentes compartidos y modulares
│   ├── ui/               # Componentes atómicos base de Shadcn UI (button, dialog, etc.)
│   ├── sidebar.tsx       # Menú lateral dinámico y responsivo
│   ├── login-form.tsx    # Manejo de login y persistencia de sesión
│   └── dashboard-section.tsx # Lógica de gráficos y tabs del panel principal
├── hooks/                # Custom React Hooks compartidos
├── lib/                  # Utilidades y configuración de clientes
└── public/               # Recursos estáticos (Logos, iconos, imágenes)
```

---

## ⚙️ Configuración del Entorno

Crea un archivo `.env.local` en la raíz del proyecto para definir la URL base de tu backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 🛠️ Instalación y Desarrollo

Sigue estos sencillos pasos para levantar el entorno de desarrollo local:

1.  **Clonar el repositorio** e ingresar al directorio:
    ```bash
    cd sistema-bovino-frontend
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    # o
    pnpm install
    ```

3.  **Iniciar servidor de desarrollo**:
    ```bash
    npm run dev
    ```

4.  **Acceder a la aplicación**:
    Abre [http://localhost:3000](http://localhost:3000) en tu navegador preferido.

---

## 📦 Construcción y Producción

Para compilar el proyecto y prepararlo para producción:

```bash
# Compilar el frontend
npm run build

# Iniciar la build compilada localmente
npm run start
``` 
