# microsoft-teams-backups

Aplicación escrita en Typescript para poder generar backups de los chats de una cuenta de empresa de Microsoft Teams.

Es necesario tener el Token Access para poder usar la API que Microsoft pone a disposición, a través de este
[enlace](https://developer.microsoft.com/en-us/graph/graph-explorer).

## Ayuda al desarrollo

Para estandarizar el proceso de desarrollo de esta aplicación y futuras posibles mejoras, este proyecto implementa las
siguientes herramientas:

1. **_Gestión de Paquetes con Yarn:_**

2. [**_Estandarización de Commits:_**](https://medium.com/nosolosoftware/estandariza-tus-commits-y-automatiza-tu-changelog-con-estas-herramientas-bb83c404f02f)
   Este template fomenta el uso de mensajes de commit estandarizados para mejorar la trazabilidad de los cambios en el
   repositorio. Para ello implementa:

    - **Commitlint:** Determina si un mensaje de commit se adecúa a un estándar en concreto
    - **Husky:** Ejecuta Commitlint antes de cada commit. Abortará el commit en caso de que el mensaje escrito no se
      adapte al estándar de Commitlint.
    - **Commitizen:** Genera mensajes compatibles con Commitlint de una forma sencilla, a través de un wizard.

3. [**_Automatizar Changelog:_**](https://medium.com/nosolosoftware/estandariza-tus-commits-y-automatiza-tu-changelog-con-estas-herramientas-bb83c404f02f)
   Automatización de la generación de changelogs basados en los mensajes de commit, lo que simplifica la documentación
   de los cambios. Se hace uso de:

    - [**standard-version**](https://github.com/conventional-changelog/standard-version) Se encarga de procesar los
      mensajes de commit para generar un Changelog y subir la versión del proyecto.

### [¿Cómo hacer commits estandarizados?](https://medium.com/nosolosoftware/estandariza-tus-commits-y-automatiza-tu-changelog-con-estas-herramientas-bb83c404f02f)

1. Los commits se hacen a partir del CLI de git para registrar los cambios de archivos/carpetas en el repositorio. Se
   pueden usar las formas usuales.

    ```bash
       git add archivo1.js archivo2.js  ## Agrega archivos específicos.
       git add "*.js"                   ## Agrega archivos por patrones.
       git add -p                       ## Agrega cambios de forma interactiva.
       git add directorio/              ## Agrega todos los archivos en un directorio.
       ...
    ```

2. Con el siguiente comando abrimos el wizard de commitizien, donde solo tendremos que seguir los pasos.

    ```bash
       yarn cz
    ```

3. Después haremos **push** al repositorio, bien a través de **CLI**, **github desktop** o **gitkraken**.

### [¿Cómo generar una nueva versión?](https://medium.com/nosolosoftware/estandariza-tus-commits-y-automatiza-tu-changelog-con-estas-herramientas-bb83c404f02f)

-   **_PRIMERA VERSIÓN:_** NO aumenta versión.

    ```bash
        yarn run release --first-release
    ```

-   **_RESTO DE VERSIONES:_** SI aumenta versión.

    ```bash
        yarn run release
    ```

El control de la versión se hace de forma automática a partir del fichero **package.json** de nuestro proyecto, y tiene
en cuenta que:

-   La versión se especifica como **MAJOR.MINOR.PATCH**.
-   Si entre una versión y la siguiente sólo hay commits de **fix**, se incrementará la versión **PATCH**.
-   Si entre una versión y la siguiente algún commit incluye **feat**, se incrementará la versión **MINOR** y la versión
    **PATCH** volverá a cero.
-   Si entre una versión y la siguiente algún commit lleva especificado un **BREAKING CHANGE**, se aumentará la versión
    **MAJOR**, devolviendo las versiones **MINOR** y **PATCH** a cero.

Por defecto, en el changelog, sólo se incluyen los commits que marquen un **BREAKING CHANGE**, **feat** y **fix**.
Aunque esto es posible configurarlo a gusto en la propia herramienta.

## ¿Cómo conseguir el ACCESS_TOKEN?

Hay dos maneras de conseguir el `ACCESS_TOKEN`. En ambos casos debes tener la sesión iniciada a tu cuenta.

### Desde 'Teams versión de navegador'

1. Inicia la sesión a Teams desde el navegador (yo lo he hecho desde Chrome), y abre la herramienta para desarrolladores
   (suele ser `F12`o `Ctrl + Shift + i`).

2. Nos vamos al apartado `Application` y en el panel de la izquierda, nos vamos a `Storage/Cookies`.

3. Hay que buscar la variable `authtoken`que tendrá el siguiente aspecto:

    ```
        Bearer%3D<.......................>%26Origin%3Dhttps%3A%2F%2Fteams.microsoft.com
    ```

4. Hay que elegir el fragmento de código que yo tengo marcado como `<.......................>`

### Desde 'Graph Explorer'

1. Inicia sesión con tu cuenta.

2. En la parte central habrá un apartado que pone `Access token`.

## ¿Cómo hacer ejecutar el programa?

1. Renombra el fichero **_'.env.example'_** como **_'.env'_** y rellenarlo con la información que en ellos se indica.

2. Ejecuta el siguiente comando para instalar las dependencias correspondientes.

    ```bash
        $ yarn
    ```

3. Inicia el proyecto en modo desarrollo.
    ```bash
        $ yarn start
    ```
