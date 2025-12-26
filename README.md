# 📱 Citonova Task App

Aplicación móvil desarrollada con React Native y Expo para la gestión de tareas de Citonova, integrada con una API REST para la persistencia de datos y autenticación.

## 🛠️ Tecnologías Utilizadas

*   ⚛️ **Framework**: React Native (via Expo)
*   📘 **Lenguaje**: TypeScript
*   🧭 **Navegación**: Expo Router
*   🌐 **API REST**: Integración con backend para gestión de datos.
*   💾 **Persistencia Local**: AsyncStorage (para tokens de sesión).
*   📍 **Geolocalización**: Expo Location (para capturar ubicación de tareas).
*   📸 **Manejo de Imágenes**: Expo Image Picker (visualización de imágenes remotas).
*   🎨 **Iconos**: Expo Vector Icons (FontAwesome).

## 🚀 Funcionamiento y Características

### 1. 🔐 Autenticación y Seguridad
*   **API Integration**: Autenticación segura contra backend (`/auth/login`, `/auth/register`).
*   **Persistencia de Sesión**: El token de autenticación se guarda localmente para mantener la sesión activa.
*   **Manejo de Errores**: Feedback visual en caso de credenciales incorrectas o problemas de conexión.

### 2. 📋 Gestión de Tareas (API)
*   ✏️ **CRUD Completo**: Las tareas se crean, leen, actualizan y eliminan directamente en el servidor.
*   ☁️ **Sincronización**: Los datos están centralizados en la nube, permitiendo acceso desde múltiples dispositivos.
*   � **Ubicación Real**: Al crear una tarea, se captura automáticamente la latitud y longitud del dispositivo.
*   � **Imágenes**: Soporte para visualizar imágenes asociadas a las tareas (vía URL).
*   � **Actualización en Tiempo Real**: "Pull-to-refresh" para actualizar la lista de tareas desde el servidor.

### 3. ⚙️ Configuración y Entorno
*   **Variables de Entorno**: Configuración flexible de la URL de la API mediante `.env`.
*   **Modo Debug**: Herramientas en pantalla de login para probar conectividad con el servidor.

### 4. 📡 Documentación de la API

La aplicación se comunica con una API RESTful para la gestión de datos. A continuación se detallan los endpoints principales utilizados:

#### 🔐 Autenticación (`/auth`)
*   `POST /auth/register`: Registra un nuevo usuario.
    *   **Body**: `{ email, password }`
    *   **Respuesta**: Token JWT y objeto de usuario.
*   `POST /auth/login`: Inicia sesión con credenciales existentes.
    *   **Body**: `{ email, password }`
    *   **Respuesta**: Token JWT y objeto de usuario.

#### 📝 Tareas (`/todos`)
*   `GET /todos`: Obtiene la lista de tareas del usuario autenticado.
    *   **Headers**: `Authorization: Bearer <token>`
*   `POST /todos`: Crea una nueva tarea.
    *   **Body**: `{ title, location: { latitude, longitude }, photoUri? }`
*   `PATCH /todos/:id`: Actualiza una tarea existente (ej. marcar como completada).
    *   **Body**: `{ completed, title, ... }`
*   `DELETE /todos/:id`: Elimina una tarea permanentemente.

#### 📸 Imágenes (`/images`)
*   `POST /images`: Sube una imagen al servidor.
    *   **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
    *   **Body**: FormData con campo `file`.
    *   **Respuesta**: URL de la imagen subida (`{ success: true, url: string }`).

### 5. 🧩 Arquitectura y Hooks

Para mantener una separación clara de responsabilidades, la lógica de negocio se ha desacoplado de la vista mediante Custom Hooks y Context API:

*   **`TaskContext` / `useTasks`**: Centraliza el estado global de las tareas y las operaciones CRUD, gestionando la sincronización con la API y el manejo de errores/loading.
*   **`useImageUpload`**: Hook específico para encapsular la lógica de subida de imágenes, proporcionando estados de `uploading`, `error` y la función de subida.

## 📦 Instalación y Ejecución

1.  **Clonar el repositorio** o descomprimir el archivo del proyecto.

2.  **Configurar Variables de Entorno**:
    Crear un archivo `.env` en la raíz del proyecto con el siguiente contenido:
    ```env
    EXPO_PUBLIC_API_URL=https://basic-hono-api.borisbelmarm.workers.dev
    ```

3.  **Instalar dependencias**:
    ```bash
    npm install
    ```

4.  **Iniciar la aplicación**:
    ```bash
    npx expo start --clear
    ```

    > ⚠️ **Nota Importante**: Si tienes problemas de conexión o estás intentando abrir la app desde una red diferente a la de tu computador (por ejemplo, usando datos móviles), utiliza el modo túnel:
    > ```bash
    > npx expo start --tunnel
    > ```

## 🔑 Credenciales de Prueba

Puedes registrar un nuevo usuario directamente desde la aplicación o usar credenciales existentes si ya has creado una cuenta.

## 👥 Equipo de Desarrollo

*   💻 **Benedykt Saravia**: Estructuración y detalles frontend.
*   🧪 **Mariano Hurtado**: Implementación y pruebas de aplicación.
*   💾 **Iñaky Segovia**: Implementación de AsyncStorage y API.

### 🤖 Uso de Inteligencia Artificial
Para el desarrollo de este proyecto se utilizó Inteligencia Artificial como herramienta de apoyo en organización, documentación y optimización de código.
