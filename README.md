# Citonova Task App

Aplicación móvil desarrollada con React Native y Expo para la gestión de tareas de Citonova.

## Tecnologías Utilizadas

*   **Framework**: React Native (via Expo)
*   **Lenguaje**: TypeScript
*   **Navegación**: Expo Router
*   **Persistencia de Datos**: AsyncStorage (Almacenamiento local en el dispositivo)
*   **Manejo de Imágenes**: Expo Image Picker
*   **Iconos**: Expo Vector Icons (FontAwesome)

## Funcionamiento y Características

### 1. Autenticación y Perfiles
*   **Login Seguro**: Acceso mediante correo y contraseña.
*   **Roles de Usuario**:
    *   **Superadmin**: Acceso total, gestión de usuarios y visualización de todos los perfiles.
    *   **Admin**: Gestión avanzada de tareas.
    *   **Colaborador**: Creación y ejecución de tareas.
*   **Foto de Perfil**: Los usuarios pueden subir una foto de perfil que se guarda localmente.
*   **Tema Dinámico**: La interfaz se adapta al tema del dispositivo (Claro/Oscuro), cambiando automáticamente los logos y colores.

### 2. Gestión de Tareas
*   **CRUD Completo**: Crear, Leer, Actualizar y Eliminar tareas.
*   **Asignación**: Los administradores pueden asignar tareas a usuarios específicos.
*   **Restricciones de Edición**: Si un Superadmin asigna una tarea a un Admin, este último solo puede agregar notas y fotos de término, sin modificar los detalles principales.
*   **Evidencia Fotográfica**:
    *   **Foto Principal**: Al crear la tarea.
    *   **Foto de Término**: Al finalizar la tarea.
*   **Notas de Ejecución**: Campo de texto libre para bitácora de la tarea.
*   **Ubicación**: Integración con mapas para visualizar la ubicación de la tarea.

### 3. Panel de Administración
*   Visualización de lista de usuarios.
*   Gestión de roles (Ascender/Degradar).
*   Visualización de fotos de perfil de otros usuarios (solo Superadmin).

## Instalación y Ejecución

1.  **Clonar el repositorio** o descomprimir el archivo del proyecto.

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Iniciar la aplicación**:
    ```bash
    npx expo start
    ```

    > **Nota Importante**: Si tienes problemas de conexión o estás intentando abrir la app desde una red diferente a la de tu computador (por ejemplo, usando datos móviles), utiliza el modo túnel:
    > ```bash
    > npx expo start --tunnel
    > ```
    > *Es posible que necesites instalar `ngrok` globalmente si se solicita.*

## Credenciales de Prueba

*   **Superadmin**: `citonova.admin@citonova.com` / `1234`
*   **Admin**: `admin@citonova.com` / `1234`
*   **Nuevo Usuario**: Puedes registrarte libremente desde la pantalla de login.

## Equipo de Desarrollo

*   **Benedykt Saravia**: Estructuración y detalles frontend.
*   **Mariano Hurtado**: Implementación y pruebas de aplicación.
*   **Iñaky Segovia**: Implementación de AsyncStorage.

### Uso de Inteligencia Artificial
Para el desarrollo de este proyecto se utilizó Inteligencia Artificial como herramienta de apoyo en organización, documentación y optimización de código.
