# Directrices de Desarrollo y Arquitectura para Fluxus Frontend

Este documento establece las reglas, convenciones y la arquitectura a seguir para el desarrollo del frontend de Fluxus. El objetivo es mantener un código limpio, escalable, legible y consistente. GitHub Copilot debe adherirse a estas directrices al generar código.

## 1. Arquitectura del Proyecto

Seguimos una **arquitectura basada en funcionalidades (feature-based)** dentro de una estructura de **Arquitectura Limpia**.

-   **/src/components**: Contiene componentes de UI genéricos, reutilizables y "tontos" (presentacionales). Ej: `Button`, `Input`, `Card`, `Layout`.
-   **/src/features**: Cada funcionalidad principal de la aplicación (ej: `auth`, `dashboard`, `profile`) tiene su propia carpeta aquí.
    -   Dentro de cada feature, la estructura es: `/components`, `/hooks`, `/services`, `/pages`, `/utils`.
-   **/src/hooks**: Contiene hooks personalizados que son reutilizables en múltiples funcionalidades.
-   **/src/contexts**: Para el manejo de estado global a través de la Context API de React.
-   **/src/lib**: Configuración de librerías de terceros.
-   **/src/routes**: Define las rutas de la aplicación, incluyendo rutas públicas y protegidas (`ProtectedRoute`).
-   **/src/services**: Servicios genéricos que no pertenecen a una feature específica.
-   **/src/utils**: Funciones de utilidad globales.
-   **/src/styles**: Estilos globales, temas y variables CSS.

## 2. Componentes

-   **Componentes Presentacionales (Dumb Components)**: Deben residir en `/src/components`. No deben tener lógica de negocio ni estado propio complejo. Reciben datos y funciones a través de `props`.
-   **Componentes Contenedores (Smart Components)**: Deben residir dentro de la carpeta `/components` de una `feature` específica. Orquestan los datos, manejan el estado y la lógica de negocio, y se los pasan a los componentes presentacionales.
-   **Nomenclatura**: Los componentes deben usar `PascalCase`. Ejemplo: `UserProfile.jsx`.

## 3. Manejo de Estado

-   **Estado Local**: Usa los hooks `useState` y `useReducer` para el estado que solo pertenece a un componente o a un pequeño grupo de ellos.
-   **Estado Global**: Usa la **Context API** de React para el estado que necesita ser compartido a través de la aplicación (ej: estado de autenticación, información del usuario, tema de la UI). Cada contexto debe tener su propio archivo en `/src/contexts`.

## 4. Comunicación con la API

-   **Axios**: Toda la comunicación con el backend debe realizarse a través de `axios`.
-   **Capa de Servicios**: La lógica para las llamadas a la API debe estar encapsulada en la capa de servicios (`/src/features/[feature]/services` o `/src/services`). Los componentes no deben hacer llamadas directas a la API.
-   **Manejo de Errores**: Los servicios deben manejar los errores de la API y devolver una respuesta consistente para que el hook o componente que lo llama pueda reaccionar adecuadamente.
-   **Variables de Entorno**: Las URLs base de la API y otras claves sensibles deben almacenarse en variables de entorno (`.env`).

## 5. Estilos

-   **Material UI**: El proyecto utilizará Material UI como librería principal de componentes y estilos. Se deben aprovechar los componentes y el sistema de theming de Material UI para mantener la coherencia visual y facilitar la personalización.
-   **Customización**: Para personalizaciones específicas, utiliza el sistema de overrides y el hook `makeStyles` o la API `styled` de Material UI.
-   **Estilos Globales**: Los estilos globales, reseteos de CSS y variables de tema deben estar en la carpeta `/src/styles`, preferentemente usando el sistema de theming de Material UI.
-   **Evitar CSS Modules**: No se utilizarán CSS Modules, salvo casos excepcionales donde Material UI no cubra la necesidad.

## 6. Enrutamiento

-   **React Router Dom**: Es la librería elegida para el enrutamiento.
-   **Rutas Protegidas**: Se debe usar un componente `ProtectedRoute` que verifique el estado de autenticación del usuario antes de renderizar las rutas privadas. Si el usuario no está autenticado, debe ser redirigido a `/login`.
-   **Definición de Rutas**: Todas las rutas de la aplicación se definirán en `/src/routes/AppRoutes.jsx`.

## 7. Hooks Personalizados

-   Crea hooks personalizados (`use[FeatureName]`) para encapsular lógica de negocio compleja y reutilizable, como `useAuth` para manejar la autenticación o `useFetch` para obtener datos.
-   Los hooks deben residir en `/src/hooks` (si son genéricos) o en `/src/features/[feature]/hooks` (si son específicos de una feature).

## 8. Nomenclatura y Convenciones

-   **Variables y Funciones**: `camelCase`.
-   **Componentes y Tipos**: `PascalCase`.
-   **Archivos**: `PascalCase` para componentes (`.jsx`), `camelCase` para otros archivos (`.js`, `.css`).
-   **Exportaciones**: Usa exportaciones nombradas en lugar de `export default` para mayor claridad, excepto en las páginas que se usan para el enrutamiento.

## 9. Pruebas

-   Utiliza **Vitest** y **React Testing Library** para las pruebas unitarias y de integración.
-   Cada componente debe tener al menos una prueba básica que verifique su renderizado.
-   La lógica de negocio crítica en hooks y servicios debe estar cubierta por pruebas unitarias.

## 11. Ejemplo estructura de carpetas

```
/src
|-- /assets               # Imágenes, fuentes y otros archivos estáticos
|-- /components           # Componentes de UI reutilizables y genéricos (Átomos)
|   |-- /Button
|   |-- /Input
|   |-- /Layout
|   |-- ...
|-- /config               # Configuración de la aplicación (variables de entorno, etc.)
|-- /constants            # Constantes utilizadas en la aplicación
|-- /contexts             # Contextos de React para el manejo de estado global
|-- /features             # Funcionalidades principales de la aplicación
|   |-- /auth             # Lógica de autenticación
|   |   |-- /components   # Componentes específicos de autenticación (LoginForm, RegisterForm)
|   |   |-- /hooks        # Hooks personalizados para la autenticación
|   |   |-- /services     # Servicios para interactuar con la API de autenticación
|   |   |-- /pages        # Páginas de Login y Registro
|   |   |-- index.js      # Punto de entrada de la funcionalidad de autenticación
|   |
|   |-- /dashboard        # Funcionalidad del dashboard
|   |   |-- /components   # Componentes específicos del dashboard
|   |   |-- /hooks
|   |   |-- /services
|   |   |-- /pages
|   |   |-- index.js
|   |
|   |-- ...               # Otras funcionalidades
|
|-- /hooks                # Hooks personalizados reutilizables en toda la aplicación
|-- /lib                  # Configuración de librerías externas
|-- /pages                # Páginas públicas que no pertenecen a una funcionalidad específica
|   |-- LandingPage.jsx
|-- /routes               # Configuración de las rutas de la aplicación
|   |-- ProtectedRoute.jsx
|   |-- AppRoutes.jsx
|-- /services             # Servicios genéricos (ej. notificaciones)
|-- /store                # Configuración del estado global (si se usa Redux o similar)
|-- /styles               # Estilos globales y temas
|-- /utils                # Funciones de utilidad
|-- App.jsx
|-- index.js
|-- main.jsx
```