var http = require("http"); //Crea servidor
var fs = require('fs'); //Acceder al file system
var path = require('path'); //Manejar rutas del FS
var formidable = require('formidable'); //Cargar archivos al servidor
var port = 80;
var serverUrl = "127.0.0.1";
const extensiones = ['exe', 'mp4', 'avi', 'mkv', 'mp3', 'png', 'ico', 'jpg', 'jpeg', 'gif', 'pdf', 'docx', 'doc', 'xlsx', 'pptx', 'txt', 'mpp', 'html', 'css', 'js', 'other']; //extensiones de archivos permitidos para subir

//Crea el servidor y procesa las solicitudes de archivos o apis
var server = http.createServer(function (req, res) {
    try {
        if (req.url.substring(0, 4) == "/api") {
            procesarApi(req, res);
        } else {
            procesarArchivo(req, res);
        }
    } catch (err) {
        return res.end("Ha ocurrido un error: " + err);
    }
});

// START SERVER
console.log("Starting web server at " + serverUrl + ":" + port);
server.listen(port);


//Ejecuta el api solicitada
function procesarApi(req, res) {
    var api = req.url.substring(4);
    log("Procesando API : " + api);
    if (api != '/uploadFile') {
        if (req.method === 'POST') {
            processRequestData(req, (data) => { //En data están todos los parámetros del post
                switch (api) {
                    case "/getDirectories":
                        var folder = data.carpetaActual;
                        log('0000000000000000000');
                        log(folder);
                        if (folder.substr(0, 15) === './filesUploaded') {
                            var fileSystem = getFileSystem(folder);
                            log(fileSystem);
                            return sendBack(res, 'OK', 'File System', fileSystem);
                        } else {
                            return sendBack(res, 'ERROR', 'Acceso a Carpeta Denegado', fileSystem);
                        }
                        break;
                    default:
                        return res.end("ERROR API POST: " + JSON.stringify(data));
                }
            });
        } else if (req.method === 'GET') {
            return res.end("API GET PROCESADA");

        }
    } else {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (files['file']) {
                var oldpath = files.file.path;
                var newpath = './filesUploaded/' + files.file.name;
                var extension = getExtension(files.file.name);
                if (extensiones.indexOf(extension) >= 0) {
                    fs.rename(oldpath, newpath, function (err) {
                        if (err) throw err;
                        return sendBack(res, 'OK', 'Archivo Subido');
                    });
                } else {
                    return sendBack(res, 'ERROR', 'Extensión de archivo no permitida');
                }
            } else {
                return sendBack(res, 'ERROR', 'Archivo no se cargó al servidor');
            }
        });
    }
}

//Segun el tipo de archivo solicitado configura el header correspondiente y retorna el contenido del archivo
function procesarArchivo(req, res) {
    if (req.url.substring(0, 3) == "/js") {
        getFile(req.url, function (text) {
            res.setHeader("Content-Type", "text/javascript");
            return res.end(text);
        });
    } else if (req.url.substring(0, 4) == "/css") {
        getFile(req.url, function (text) {
            res.setHeader("Content-Type", "text/css");
            return res.end(text);
        });
    } else if (req.url.substring(0, 4) == "/img") {
        getFile(req.url, function (text) {
            res.setHeader("Content-Type", "image/png");
            return res.end(text);
        });
    } else if (req.url.substring(0, 4) == "/inc") {
        getFile(req.url, function (text) {
            res.setHeader("Content-Type", "text/html");
            return res.end(text);
        });
    } else {
        getFile('index.html', function (text) {
            res.setHeader("Content-Type", "text/html");
            return res.end(text);
        });
    }
}

//Lee un archivo y devuelve su contenido
function getFile(url, f) {
    url = limpiarURL(url);
    log("URL SOLICITADA: " + url)
    url = "./" + url;
    fs.readFile(url, function (err, text) {
        if (err) {
            log("Error:  " + url);
            throw err;
        }
        f(text);
    });
}

// Sirve para quitar lo que haya después de que aparece un '?' en la url (solicitudes POST)
function limpiarURL(url) {
    var indexPreg = url.indexOf("?");
    url = url.indexOf("?") != -1 ? url.substring(0, indexPreg) : url;
    return url
}

// envía al cliente un un objeto en formato string
function sendBack(res, estado, mensaje, data) {
    var obj = {
        estado: estado,
        mensaje: mensaje,
        data: data
    }
    return res.end(JSON.stringify(obj));
}

//Procesa los parametros de la solicitud POST
function processRequestData(request, callback) {
    let data = [];
    request.on('data', (chunk) => {
        data.push(chunk);
    }).on('end', () => {
        data = JSON.parse(Buffer.concat(data).toString());
        callback(data);
    });
}

//Obtener extension de un nombre de archivo
function getExtension(filename) {
    var ext = path.extname(filename || '').split('.');
    return ext[ext.length - 1];
}

//Obtiene todos los archivos de un directorio
function getFileSystem(dir, files_) {
    files_ = files_ || {
        files: [],
        folders: []
    };
    var files = fs.readdirSync(dir);
    for (var i in files) {
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()) {
            files_.folders.push(name);
            getFileSystem(name, files_);
        } else {
            files_.files.push(name);
        }
    }
    return files_;
}


//Imprime objeto
function log(o) {
    console.log(o);
}
