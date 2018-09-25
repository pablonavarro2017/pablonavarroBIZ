var http = require("http"); //Crea servidor
var fs = require('fs'); //Acceder al file system
var path = require('path'); //Manejar rutas del FS
var formidable = require('formidable'); //Cargar archivos al servidor
var port = 8081; // 80;
var serverUrl = "127.0.0.1";
const extensiones = ['exe', 'mp4', 'avi', 'mkv', 'mp3', 'png', 'ico', 'jpg', 'jpeg', 'gif', 'pdf', 'docx', 'doc', 'xlsx', 'pptx', 'txt', 'mpp', 'html', 'css', 'js', 'php', 'apk', 'conf', 'other']; //extensiones de archivos permitidos para subir

//Crea el servidor y procesa las solicitudes de archivos o apis
var server = http.createServer(function (req, res) {
    //    t ry {
    req.url = decodeURIComponent(req.url);
    if (req.url.substring(0, 4) == "/api") {
        procesarApi(req, res);
    } else {
        procesarArchivo(req, res);
    }
    /*} catch (err) {
        return res.end("Ha ocurrido un error: " + err);
    }*/
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
                        if (folder.substr(0, 15) === './filesUploaded') {
                            var fileSystem = getFileSystem(folder);
                            fileSystem.folders.unshift('./filesUploaded');
                            return sendBack(res, 'OK', 'File System', fileSystem);
                        } else {
                            return sendBack(res, 'ERROR', 'Acceso a Carpeta Denegado');
                        }
                        break;
                    case "/getFile":
                        var rutaArchivo = data.rutaArchivo;
                        log("/getFile " + rutaArchivo);
                        if (rutaArchivo.substr(0, 15) === './filesUploaded') {
                            return returnFile(rutaArchivo, res);
                        } else {
                            return sendBack(res, 'ERROR', 'Acceso a Archivo Denegado');
                        }
                        break;
                    case "/getPlainText":
                        var rutaArchivo = data.rutaArchivo;
                        log("/getFile " + rutaArchivo);
                        if (rutaArchivo.substr(0, 15) === './filesUploaded') {
                            return returnPlainText(req, res, rutaArchivo);
                        } else {
                            return sendBack(res, 'ERROR', 'Acceso a Archivo Denegado');
                        }
                        break;
                    case "/deleteFile":
                        var rutaArchivo = data.rutaArchivo;
                        log("/deleteFile " + rutaArchivo);
                        if (rutaArchivo.substr(0, 15) === './filesUploaded') {
                            return deleteFile(req, res, rutaArchivo);
                        } else {
                            return sendBack(res, 'ERROR', 'Acceso a Archivo Denegado');
                        }
                        break;
                    case "/writeFile":
                        var rutaArchivo = data.rutaArchivo;
                        var nuevoContenido = data.nuevoContenido;
                        log("/writeFile " + rutaArchivo);
                        if (rutaArchivo.substr(0, 15) === './filesUploaded') {
                            return writeFile(req, res, rutaArchivo, nuevoContenido);
                        } else {
                            return sendBack(res, 'ERROR', 'Acceso a Archivo Denegado');
                        }
                        break;
                    case "/mkDir":
                        var rutaCarpeta = data.rutaCarpeta;
                        log('/mkDir ' + rutaCarpeta);
                        if (rutaCarpeta.substr(0, 15) === './filesUploaded') {
                            var s = mkDir(rutaCarpeta, res);
                            if (s == 'OK') {
                                return sendBack(res, 'OK', 'Folder Created');
                            } else {
                                return sendBack(res, 'ERROR', s);
                            }
                        } else {
                            return sendBack(res, 'ERROR', 'Acceso a Carpeta Denegado');
                        }
                        break;
                    case "/renameFile":
                        var rutaArchivo = data.rutaArchivo;
                        var nuevoNombre = data.nuevoNombre;
                        var ruta = data.ruta;
                        log('/renameFile ' + rutaArchivo);
                        if (rutaArchivo.substr(0, 15) === './filesUploaded' && ruta.substr(0, 15) === './filesUploaded') {
                            return renameFile('./'+rutaArchivo, './'+ruta, nuevoNombre,res)
                        } else {
                            return sendBack(res, 'ERROR', 'Acceso a Carpeta Denegado');
                        }
                        break;
                    default:
                        return res.end("ERROR API POST: " + JSON.stringify(data));
                }
            });
        } else if (req.method === 'GET') {
            return res.end("API GET PROCESADA");
        }
    } else { //To Upload a File
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            log(fields.ruta)
            if (files['file'] && fields.ruta.substr(0, 15) === './filesUploaded') {
                var oldpath = files.file.path;
                var newpath = fields.ruta + '/' + files.file.name; //'./filesUploaded/' + files.file.name;
                var extension = getExtension(files.file.name);
                if (extensiones.indexOf(extension) >= 0) {
                    fs.rename(oldpath, newpath, function (err) {
                        if (err) throw err;
                        return sendBack(res, 'OK', 'Archivo Subido');
                    });
                } else {
                    return sendBack(res, 'ERROR', 'Extensión de archivo no permitida: ' + extension);
                }
            } else {
                return sendBack(res, 'ERROR', 'Archivo no se cargó al servidor');
            }
        });
    }
}

function returnPlainText(req, res, rutaArchivo) {
    fs.readFile(rutaArchivo, function (err, text) {
        if (err) {
            return notFound(req, res);
        } else {
            res.setHeader("Content-Type", "text/plain");
            return res.end(text);
        }
    });
}

function returnFile(url, res) {
    fs.readFile(url, function (err, content) {
        if (err) {
            res.writeHead(400, {
                'Content-type': 'text/html'
            })
            console.log(err);
            return sendBack(res, 'ERROR', 'Error al retornar el archivo');
        } else {
            //specify Content will be an attachment
            res.setHeader('Content-disposition', 'attachment; filename=' + getFileNameFromURL(url).replace(/,/g, "_"));
            res.setHeader('FileName', getFileNameFromURL(url));
            return res.end(content);
        }
    });
}

function mkDir(path) {
    fs.mkdir(path, (err) => {
        if (err) {
            log(err);
            return err.message;
        } else {
            return 'OK'
        }
    });
}

//Segun el tipo de archivo solicitado configura el header correspondiente y retorna el contenido del archivo
function procesarArchivo(req, res) {
    log("Procesando ARCHIVO : " + req.url);
    if (req.url.substring(0, 3) == "/js") {
        return getFile(req, res, 'text/javascript');
    } else if (req.url.substring(0, 4) == "/css") {
        getFile(req, res, 'text/css');
    } else if (req.url.substring(0, 4) == "/img") {
        return getFile(req, res, "image/png");
    } else if (req.url.substring(0, 4) == "/inc") {
        return getFile(req, res, "text/html");
    } else if (req.url.substring(0, 4) == "/pop") {
        return getFile(req, res, "text/html");
    } else if (["mp3", "mp4", "avi", "jpg", "png"].indexOf(getExtension(req.url)) >= 0) {
        return returnFile('.' + req.url, res);
    } else if (req.url == "/") {
        return getFile(req, res, "text/html");
    } else {
        return notFound(req, res);
    }
}

//Lee un archivo y devuelve su contenido
function getFile(req, res, header) {
    if (req.url == "/") {
        url = "./index.html";
    } else {
        url = req.url;
        url = limpiarURL(url);
        url = "./" + url;
    }
    fs.readFile(url, function (err, text) {
        if (err) {
            return notFound(req, res);
        } else {
            res.setHeader("Content-Type", header);
            return res.end(text);
        }
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
        elem = fs.statSync(name);
        if (elem.isDirectory()) {
            files_.folders.push(name);
            getFileSystem(name, files_);
        } else {
            var fileSize = elem.size;
            fileSize /= 1048576;
            files_.files.push({
                name: name,
                size: formatearFloat(fileSize)
            });
        }
    }
    return files_;
}

function getFileNameFromURL(fileURL) {
    return fileURL.substr(fileURL.lastIndexOf('/') + 1)
}

function deleteFile(req, res, rutaArchivo) {
    fs.unlink(rutaArchivo, (err) => {
        if (err) {
            log("FILE NOT DELETED: " + rutaArchivo);
            return res.end("No se puede borrar el archivo");
        };
        log("FILE DELETED: " + rutaArchivo);
        return res.end("OK");
    });
}

function renameFile(rutaArchivo, ruta, newName,res) {
    fs.rename(rutaArchivo, ruta + newName, (err) => {
        if (err) {
            log(err)
            log("FILE NOT UPDATED: " + rutaArchivo);
            return res.end("ERROR");
        };
        log("FILE UPDATED: " + rutaArchivo);
        return res.end("OK");
    });
}

function writeFile(req, res, rutaArchivo, nuevoContenido) {
    fs.writeFile(rutaArchivo, nuevoContenido, (err) => {
        if (err) {
            log("FILE NOT UPDATED: " + rutaArchivo);
            return res.end("No se puede actualizar el archivo");
        };
        log("FILE UPDATED: " + rutaArchivo);
        return res.end("OK");
    });
}

function notFound(req, res) {
    log("NOT FOUND:  " + req.url);
    fs.readFile('./inc/404-Not-Found.html', function (err, text) {
        if (err) {
            log(text);
            log("ERROR:  " + err);
            return res.end("ERROR:  " + req.url);
        } else {
            res.setHeader("Content-Type", "text/html");
            return res.end(text);
        }
    });
}

function isBlog(hostName) {
    if (hostName.includes('blog.')) {
        log('Its the blog')
        return true;
    } else {
        return false;
    }
}

function formatearFloat(n, d) {
    // parsea el string n a float y lo limita a 2 decimales
    return parseFloat(parseFloat(n).toFixed(d ? d : 2));
}

//Imprime objeto
function log(o) {
    console.log(o);
}
