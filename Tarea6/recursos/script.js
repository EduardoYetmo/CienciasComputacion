var cajadatos;
var db;

function iniciar() {
    cajadatos = document.getElementById("cajadatos");

    // Configuración de IndexedDB
    var request = indexedDB.open("AlbumsDB", 1);
    request.onupgradeneeded = function(event) {
        db = event.target.result;
        if (!db.objectStoreNames.contains("albums")) {
            var store = db.createObjectStore("albums", { keyPath: "id", autoIncrement: true });
        }
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        console.log("Base de datos abierta correctamente.");
        mostrarAlbums();
    };

    request.onerror = function(event) {
        console.error("Error al abrir la base de datos:", event.target.errorCode);
    };

    var archivos = document.getElementById("archivos");
    archivos.addEventListener("change", procesarArchivo);

    // Configurar eventos
    document.getElementById("guardar").addEventListener("click", agregarAlbum);
    document.getElementById("buscar").addEventListener("click", buscarArtista);
    document.getElementById("cargarXML").addEventListener("click", leerArchivoXML);
}

function procesarArchivo(evento) {
    var archivo = evento.target.files[0];
    if (archivo) {
        var tipo = archivo.type;
        console.log("Procesando archivo: ", archivo.name, "Tipo: ", tipo);

        if (tipo == "text/xml" || tipo == "application/xml") {
            cargarXML(archivo);
        } else {
            cajadatos.innerHTML = "Tipo de archivo no soportado.";
        }
    } else {
        console.error("No se ha seleccionado ningún archivo.");
    }
}

function cargarXML(archivo) {
    var lector = new FileReader();
    lector.addEventListener("load", mostrarYGuardarXML);
    lector.readAsText(archivo);
}

function mostrarYGuardarXML(evento) {
    var resultado = evento.target.result;
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(resultado, "text/xml");

    var albums = xmlDoc.getElementsByTagName("album");
    if (albums.length === 0) {
        cajadatos.innerHTML = "No se encontraron álbumes en el archivo XML.";
        console.error("No se encontraron etiquetas <album> en el archivo XML.");
        return;
    }

    var contenido = "<ul>"; // Listado HTML para los álbumes

    // Iniciar transacción para guardar en IndexedDB
    var transaction = db.transaction(["albums"], "readwrite");
    var store = transaction.objectStore("albums");

    // Recorre cada <album> y guarda los datos en IndexedDB
    for (var i = 0; i < albums.length; i++) {
        var artist = albums[i].getElementsByTagName("artist")[0]?.textContent || "N/A";
        var title = albums[i].getElementsByTagName("title")[0]?.textContent || "N/A";
        var songs = albums[i].getElementsByTagName("songs")[0]?.textContent || "N/A";
        var year = albums[i].getElementsByTagName("year")[0]?.textContent || "N/A";
        var genre = albums[i].getElementsByTagName("genre")[0]?.textContent || "N/A";

        console.log("Guardando álbum:", artist, title, year);

        // Guardar el álbum en IndexedDB
        var albumData = { artist: artist, title: title, songs: songs, year: year, genre: genre };
        store.add(albumData);

        // Agregar cada álbum al contenido HTML para mostrarlo
        contenido += "<li><strong>Artista:</strong> " + artist +
                     " <strong>Título:</strong> " + title +
                     " <strong>Canciones:</strong> " + songs +
                     " <strong>Año:</strong> " + year +
                     " <strong>Género:</strong> " + genre + 
                     " <button onclick='eliminarAlbum(" + i + ")'>Eliminar</button></li><br>";
    }

    contenido += "</ul>";
    cajadatos.innerHTML = contenido;

    transaction.oncomplete = function() {
        console.log("Álbumes guardados correctamente en IndexedDB.");
        mostrarAlbums();
    };

    transaction.onerror = function(event) {
        console.error("Error al guardar álbumes en IndexedDB:", event.target.errorCode);
    };
}
/**
 * Lee un archivo XML seleccionado por el usuario
 */
function leerArchivoXML() {
    var archivo = document.getElementById('archivoXML').files[0];
    if (!archivo) {
        alert("Por favor, selecciona un archivo XML.");
        return;
    }

    var lector = new FileReader();
    lector.onload = function(e) {
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(e.target.result, "text/xml");

        // Procesar y mostrar los álbumes desde el XML
        var albums = xmlDoc.getElementsByTagName("album");
        for (var i = 0; i < albums.length; i++) {
            var artista = albums[i].getElementsByTagName("artista")[0].textContent;
            var titulo = albums[i].getElementsByTagName("titulo")[0].textContent;
            var canciones = albums[i].getElementsByTagName("canciones")[0].textContent;
            var anio = albums[i].getElementsByTagName("anio")[0].textContent;
            var genero = albums[i].getElementsByTagName("genero")[0].textContent;

            agregarAlbumDesdeXML(artista, titulo, canciones, anio, genero);
        }

        console.log("Archivo XML cargado y procesado correctamente.");
        mostrarAlbums();
    };

    lector.onerror = function() {
        console.error("Error al leer el archivo XML.");
    };

    lector.readAsText(archivo);
}

/**
 * Agrega un álbum desde XML a IndexedDB
 */
function agregarAlbumDesdeXML(artista, album, canciones, anio, genero) {
    var albumData = {
        artist: artista,
        title: album,
        songs: canciones,
        year: anio,
        genre: genero
    };

    var transaction = db.transaction(["albums"], "readwrite");
    var store = transaction.objectStore("albums");
    store.add(albumData);

    transaction.oncomplete = function() {
        console.log("Álbum desde XML agregado correctamente.");
    };

    transaction.onerror = function(event) {
        console.error("Error al agregar álbum desde XML:", event.target.errorCode);
    };
}

// Agregar álbum desde el formulario
function agregarAlbum() {
    var artista = document.getElementById("artista").value;
    var album = document.getElementById("album").value;
    var canciones = document.getElementById("canciones").value;
    var anio = document.getElementById("anio").value;
    var genero = document.getElementById("genero").value;

    if (artista && album && canciones && anio && genero) {
        var albumData = {
            artist: artista,
            title: album,
            songs: canciones,
            year: anio,
            genre: genero
        };

        var transaction = db.transaction(["albums"], "readwrite");
        var store = transaction.objectStore("albums");
        store.add(albumData);

        transaction.oncomplete = function() {
            console.log("Álbum agregado correctamente.");
            mostrarAlbums();  // Actualiza los datos en "cajadatos"
            document.forms["formulario"].reset();
        };

        transaction.onerror = function(event) {
            console.error("Error al agregar álbum:", event.target.errorCode);
        };
    } else {
        alert("Por favor, rellena todos los campos.");
    }
}

// Mostrar todos los álbumes almacenados en IndexedDB
function mostrarAlbums() {
    var transaction = db.transaction(["albums"], "readonly");
    var store = transaction.objectStore("albums");

    var request = store.getAll();
    request.onsuccess = function(event) {
        var albums = event.target.result;
        var contenido = "<ul>";
        if (albums.length > 0) {
            albums.forEach(function(album) {
                contenido += "<li><strong>Artista:</strong> " + album.artist +
                             " <strong>Álbum:</strong> " + album.title +
                             " <strong>Canciones:</strong> " + album.songs +
                             " <strong>Año:</strong> " + album.year +
                             " <strong>Género:</strong> " + album.genre + 
                             " <button onclick='eliminarAlbum(" + album.id + ")'>Eliminar</button></li><br>";
            });
        } else {
            contenido += "<li>No hay álbumes almacenados.</li>";
        }
        contenido += "</ul>";
        cajadatos.innerHTML = contenido;  // Actualizamos el contenedor cajadatos
    };

    request.onerror = function(event) {
        console.error("Error al obtener álbumes de IndexedDB:", event.target.errorCode);
    };
}

// Buscar álbumes según el nombre del artista
function buscarArtista() {
    var artistaBuscado = document.getElementById("busca").value.toLowerCase();
    var transaction = db.transaction(["albums"], "readonly");
    var store = transaction.objectStore("albums");

    var request = store.getAll();
    request.onsuccess = function(event) {
        var albums = event.target.result;
        var contenido = "<ul>";
        var encontrado = false;

        albums.forEach(function(album) {
            if (album.artist.toLowerCase().includes(artistaBuscado)) {
                contenido += "<li><strong>Artista:</strong> " + album.artist +
                             " <strong>Álbum:</strong> " + album.title +
                             " <strong>Canciones:</strong> " + album.songs +
                             " <strong>Año:</strong> " + album.year +
                             " <strong>Género:</strong> " + album.genre + "</li><br>";
                encontrado = true;
            }
        });

        if (!encontrado) {
            contenido += "<li>No se encontraron álbumes para el artista buscado.</li>";
        }

        contenido += "</ul>";
        cajadatos.innerHTML = contenido;  // Mostrar resultados de búsqueda en cajadatos
    };

    request.onerror = function(event) {
        console.error("Error al buscar álbumes en IndexedDB:", event.target.errorCode);
    };
}

// Eliminar álbum
function eliminarAlbum(id) {
    var transaction = db.transaction(["albums"], "readwrite");
    var store = transaction.objectStore("albums");

    var request = store.delete(id);
    request.onsuccess = function(event) {
        console.log("Álbum eliminado correctamente.");
        mostrarAlbums();  // Actualiza los datos en cajadatos
    };

    request.onerror = function(event) {
        console.error("Error al eliminar el álbum:", event.target.errorCode);
    };
}

// Inicializa el sistema cuando se carga la página
window.addEventListener("load", iniciar);
