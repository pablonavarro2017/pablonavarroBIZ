//Funcion para obtener el File System
function getDirectories(req, res, data) {
    var folder = data.carpetaActual;
    if (validarRuta(folder)) {
        var fileSystem = getFileSystem(folder);
        fileSystem.folders.unshift('./filesUploaded');
        return sendBack(res, 'OK', 'File System', fileSystem);
    } else {
        return sendBack(res, 'ERROR', 'Acceso a Carpeta Denegado');
    }
}
//Funcion para obtnener el contenido plano de un archivo
function getPlainText(req, res, data) {
    var rutaArchivo = data.rutaArchivo;
    log("/getPlainText " + rutaArchivo);
    if (validarRuta(rutaArchivo)) {
        return returnPlainText(req, res, rutaArchivo);
    } else {
        return sendBack(res, 'ERROR', 'Acceso a Archivo Denegado');
    }
}
//Funcion para borrar un archivo
function deleteFile(req, res, data) {
    var rutaArchivo = data.rutaArchivo;
    log("/deleteFile " + rutaArchivo);
    if (validarRuta(rutaArchivo)) {
        return borrarArchivo(req, res, rutaArchivo);
    } else {
        return sendBack(res, 'ERROR', 'Acceso a Archivo Denegado');
    }
}
//Funcion para actulizar el contenido de un archivo plano
function writeOnFile(req, res, data) {
    var rutaArchivo = data.rutaArchivo;
    var nuevoContenido = data.nuevoContenido;
    log("/writeFile " + rutaArchivo);
    if (validarRuta(rutaArchivo)) {
        return writeFile(req, res, rutaArchivo, nuevoContenido);
    } else {
        return sendBack(res, 'ERROR', 'Acceso a Archivo Denegado');
    }
}
//Funcion para crear una carpeta
function mkDir(req, res, data) {
    var rutaCarpeta = data.rutaCarpeta;
    log('/mkDir ' + rutaCarpeta);
    if (validarRuta(rutaCarpeta)) {
        createDirectory(rutaCarpeta, (r) => {
            if (r == 'OK') {
                return sendBack(res, 'OK', 'Folder Created');
            } else {
                return sendBack(res, 'ERROR', s);
            }
        });
    } else {
        return sendBack(res, 'ERROR', 'Acceso a Carpeta Denegado');
    }
}
//Funcion para renombrar un archivo
function renameFile(req, res, data) {
    var rutaArchivo = data.rutaArchivo;
    var nuevoNombre = data.nuevoNombre;
    var ruta = data.ruta;
    log('/renameFile ' + rutaArchivo);
    if (validarRuta(rutaArchivo) && validarRuta(ruta)) {
        return renombrarArchivo('./' + rutaArchivo, './' + ruta, nuevoNombre, res);
    } else {
        return sendBack(res, 'ERROR', 'Acceso a Carpeta Denegado');
    }
}
//Funcion para renombrar una carpeta
function renameDir(req, res, data) {
    var rutaCarpeta = data.rutaCarpeta;
    var nuevoNombre = data.nuevoNombre;
    log('/renameDir: ' + rutaCarpeta + "-> " + nuevoNombre);
    if (validarRuta(rutaCarpeta) && validarRuta(nuevoNombre)) {
        return renombrarCarpeta(rutaCarpeta, nuevoNombre, res);
    } else {
        return sendBack(res, 'ERROR', 'Acceso a Carpeta Denegado');
    }
}
//Función para crear un archivo de texto
function mkTextFile(req, res, data) {
    var rutaArchivo = data.rutaArchivo;
    var contenido = data.contenido;
    log("/mkTextFile " + rutaArchivo);
    if (validarRuta(rutaArchivo)) {
        return writeFile(req, res, rutaArchivo, contenido);
    } else {
        return sendBack(res, 'ERROR', 'Acceso a Archivo Denegado');
    }
}
//Función para subir un archivo binario al servidor
function uploadFile(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (files['file'] && validarRuta(fields.ruta)) {
            var oldpath = files.file.path;
            files.file.name = tolowercaseExtension(files.file.name);
            var newpath = fields.ruta + '/' + files.file.name; //'./filesUploaded/' + files.file.name;
            var extension = getExtension(files.file.name);
            if (extensiones.indexOf(extension) >= 0) {
                fs.rename(oldpath, newpath, function (err) {
                    if (err) {
                        //throw err;
                        log(err);
                        return sendBack(res, 'ERROR', 'Error al subir el archivo');
                    }
                    return sendBack(res, 'OK', 'Archivo Subido: ' + files.file.name);
                });
            } else {
                return sendBack(res, 'ERROR', 'Extensión de archivo no permitida: ' + extension);
            }
        } else {
            return sendBack(res, 'ERROR', 'Archivo no se cargó al servidor');
        }
    });
}

function tolowercaseExtension(nombreArchivo) {
    return nombreArchivo.replace(new RegExp('\\.' + getExtension(nombreArchivo) + '$'), '.' + getExtension(nombreArchivo).toLowerCase());
}

//Retorna un archivo en su forma binaria
function returnFile(req, res, data) {
    var url = data ? data.rutaArchivo : '.' + req.url;
    log('ReturnFile:: ' + url);
    fs.readFile(url, function (err, content) {
        if (err) {
            res.writeHead(400, {
                'Content-type': 'text/html'
            })
            console.log(err);
            return sendBack(res, 'ERROR', 'Error al retornar el archivo');
        } else {
            //specify Content will be an attachment
            var header = asciiReplace(getFileNameFromURL(url));
            res.setHeader('Content-disposition', 'attachment; filename=' + header.replace(/,/g, "_"));
            res.setHeader('FileName', header);
            return res.end(content);
        }
    });
}
//Valida que la ruta del archivo o carpeta sea válida para el usuario
function validarRuta(r) {
    if (r.substr(0, 15) === './filesUploaded') {
        return true;
    }
    return false;
}

//Valida que los valores de un string sean ascii
function asciiReplace(nombre) {
    if (isASCII(nombre) == true) {
        return nombre;
    }
    var nuevoNombre = '';
    for (var i = 0; i < nombre.length; i++) {
        if (isASCII(nombre[i])) {
            nuevoNombre += nombre[i];
        }
    }
    if (nuevoNombre === '') {
        nuevoNombre = 'archivo';
    }
    if (nuevoNombre == '.' + getExtension(nombre)) {
        nuevoNombre = 'archivo' + nuevoNombre;
    }
    return nuevoNombre;
}

function isASCII(str) {
    return /^[\x00-\x7F]*$/.test(str);
}
//Retotna un archivo de texto plano
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
//Crea  una carpeta
function createDirectory(path, f) {
    log(path)
    fs.mkdir(path, (err) => {
        if (err) {
            log(err);
            return f(err);
        } else {
            return f('OK');
        }
    });
}

//Crea  multiples carpetas
function makeMultDirs(req, res, data) {
    var dirs = data.dirs;
    var resp = 'OK';
    for (e in dirs) {
        try {
            if (fs.existsSync(dirs[e]) == false) {
                fs.mkdirSync(dirs[e]);
            } else {
                resp = 'DUPL';
            }
        } catch (err) {
            log(err)
            resp = 'ERROR FATAL';
        }
    }
    return res.end(resp);
}


//Borra carpetas de manera recursiva
function delDir(req, res, data) {
    var dirPath = data.rutaCarpeta;
    log(dirPath)
    rimraf(dirPath, [], (err) => {
        if (err) {
            log(err);
            return res.end('ERROR');
        }
        return res.end('OK');
    });
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
function processRequestData(request, callback, procesarDatosPost) {
    if (procesarDatosPost == true) {
        let data = [];
        request.on('data', (chunk) => {
            data.push(chunk);
        }).on('end', () => {
            data = JSON.parse(Buffer.concat(data).toString());
            return callback(data);
        });
    } else {
        return callback();
    }
}

//Obtener extension de un nombre de archivo
function getExtension(filename) {
    var ext = path.extname(filename || '').split('.');
    return ext[ext.length - 1];
}

//Obtiene todos los archivos de un directorio - Obtiene el file system del usuario
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
//Obtiene el nombre del archivo segun la URL
function getFileNameFromURL(fileURL) {
    return fileURL.substr(fileURL.lastIndexOf('/') + 1)
}
//Borra un archivo
function borrarArchivo(req, res, rutaArchivo) {
    fs.unlink(rutaArchivo, (err) => {
        if (err) {
            log("FILE NOT DELETED: " + rutaArchivo + " <-> " + err);
            return res.end("No se puede borrar el archivo");
        };
        log("FILE DELETED: " + rutaArchivo);
        return res.end("OK");
    });
}
//Renombra un archivo
function renombrarArchivo(rutaArchivo, ruta, newName, res) {
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
//Renombra una Carpeta
function renombrarCarpeta(rutaCarpeta, nuevoNombre, res) {
    fs.rename(rutaCarpeta, nuevoNombre, (err) => {
        if (err) {
            log(err)
            log("FOLDER NOT UPDATED: " + rutaCarpeta);
            return res.end("ERROR");
        };
        log("FOLDER UPDATED: " + nuevoNombre);
        return res.end("OK");
    });
}
//Funcion que crea o sobre escribe un archivo de texto
function writeFile(req, res, rutaArchivo, nuevoContenido) {
    fs.writeFile(rutaArchivo, nuevoContenido, (err) => {
        if (err) {
            log("FILE NOT WRITTED: " + rutaArchivo);
            return res.end("No se puede escribir el archivo");
        };
        log("FILE WRITTED: " + rutaArchivo);
        return res.end("OK");
    });
}
//Funcion que retorna el archivo de no encontrado en caso de fallo al buscar un archivo
function notFound(req, res, msg) {
    msg = msg ? msg : '';
    log("NOT FOUND:  " + req.url);
    fs.readFile('./inc/404-Not-Found.html', function (err, text) {
        if (err) {
            log("ERROR:  " + err);
            return res.end("ERROR:  " + req.url);
        } else {
            res.setHeader("Content-Type", "text/html");
            return res.end(text + msg);
        }
    });
}
//Funcion que retorna el audio de un video de youtube
function getAudioStream(req, res, data) {
    log("/getAudioStream:  " + data.url);

    var YD = new YoutubeMp3Downloader({
        "ffmpegPath": process.platform == 'win32' ? "../../ffmpeg/bin/ffmpeg.exe" : "/usr/bin/ffmpeg", // Where is the FFmpeg binary located?
        "outputPath": "./filesUploaded", // Where should the downloaded and encoded files be stored?
        "youtubeVideoQuality": "highest", // What video quality should be used?
        "queueParallelism": 2, // How many parallel downloads/encodes should be started?
        "progressTimeout": 2000 // How long should be the interval of the progress reports
    });

    //Download video and save as MP3 file
    YD.download(youtube_parser(data.url));

    YD.on("finished", function (err, data) {
        return sendBack(res, 'OK', '', {
            videoTitle: data.videoTitle
        });
        //console.log(JSON.stringify(data));
    });

    YD.on("error", function (error) {
        res.end('ERROR');
        console.log(error);
    });

    YD.on("progress", function (progress) {
        log('Emitting' + progress.progress.percentage);
        io.emit('progressing', {
            progreso: parseInt(progress.progress.percentage)
        });
        log(formatearFloat(progress.progress.percentage, 2) + '%');
        //        console.log(JSON.stringify(progress));
    });
}


function youtube_parser(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : false;
}

// Funcion para saber si se esta accediendo desde el host del blog
function isBlog(hostName) {
    if (hostName.includes('blog.')) {
        log('Its the blog')
        return true;
    } else {
        return false;
    }
}
//Formatea un numero a d decimales o por defecto a 2
function formatearFloat(n, d) {
    // parsea el string n a float y lo limita a 2 decimales
    return parseFloat(parseFloat(n).toFixed(d ? d : 2));
}
//Imprime objeto
function log(o) {
    console.log(o);
}
