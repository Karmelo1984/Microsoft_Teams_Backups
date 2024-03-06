# Usa una imagen base con un servidor web ligero
FROM nginx:alpine

# Copia todos los archivos y directorios necesarios al contenedor
COPY ./salida/chats ./salida/myChat.json ./salida/myUser.json /usr/share/nginx/html/backups_json/
COPY ./salida/web /usr/share/nginx/html


# Crear el contenedor y ejecutar la imagen
# $ docker build -t nombre_de_tu_imagen .
# $ docker run -d -p 8080:80 --name nombre_contenedor nombre_de_tu_imagen


# Crear una copia del contenedor, y comprimirla (para poderla transportar)
# $ docker save -o nombre_de_la_imagen.tar nombre_de_la_imagen
# $ gzip nombre_de_la_imagen.tar

# Restaurar la imagen
# $ docker load -i nombre_de_la_imagen.tar

