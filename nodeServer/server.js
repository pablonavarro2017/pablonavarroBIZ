var http = require("http"); //Crea servidor
var fs = require('fs'); //Acceder al file system
var path = require('path'); //Manejar rutas del FS
var formidable = require('formidable'); //Cargar archivos al servidor
var rimraf = require('rimraf'); // Borrar carpetas
var YoutubeMp3Downloader = require("youtube-mp3-downloader"); // Descarga audio de video en youtube
var sizeof = require('object-sizeof');
var getYoutubeTitle = require('get-youtube-title');
var ytpl = require('ytpl'); //Nuevos paquetes que prometen Obtener listas de reproduccion de youtube.
const ytsr = require('ytsr');
eval(fs.readFileSync('functions.js') + ''); //incluye el archivo de funciones

//var ytsr = require('ytsr');//Nuevos paquetes que prometen

var port = 8081; // 80;
var serverUrl = "127.0.0.1";
const extensiones = ['exe', 'mp4', 'avi', 'mkv', 'mp3', 'ogg', 'png', 'ico', 'jpg', 'jpeg', 'gif', 'pdf', 'docx', 'doc', 'xlsx', 'pptx', 'txt', 'mpp', 'html', 'css', 'js', 'php', 'apk', 'conf', 'other']; //extensiones de archivos permitidos para subir

//Crea el servidor y procesa las solicitudes de archivos o apis
var server = http.createServer(function (req, res) {
    try {
        req.url = decodeURIComponent(req.url);
        if (req.url.substring(0, 4) == "/api") {
            procesarApi(req, res);
        } else {
            procesarArchivo(req, res);
        }
    } catch (err) {
        return res.end("Ha ocurrido un error: " + err);
    }
});
var io = require('socket.io')(server);
// START SERVER
console.log("Starting web server at " + serverUrl + ":" + port);
server.listen(port);

//Ejecuta el api solicitada
function procesarApi(req, res) {
    var api = req.url.substring(4);
    log("Procesando API : " + api);
    if (req.method === 'POST') {
        var procesarDatosPost = (api !== '/uploadFile' ? true : false);
        processRequestData(req, (data) => { //En data están todos los parámetros del post
            switch (api) {
                case "/getDirectories":
                    return getDirectories(req, res, data);
                case "/getFile":
                    return returnFile(req, res, data);
                case "/getPlainText":
                    return getPlainText(req, res, data);
                case "/deleteFile":
                    return deleteFile(req, res, data);
                case "/writeFile":
                    return writeOnFile(req, res, data);
                case "/mkDir":
                    return mkDir(req, res, data);
                case "/renameFile":
                    return renameFile(req, res, data);
                case "/mkTextFile":
                    return mkTextFile(req, res, data);
                case "/uploadFile":
                    return uploadFile(req, res);
                case "/makeMultDirs":
                    return makeMultDirs(req, res, data);
                case "/delDir":
                    return delDir(req, res, data);
                case "/renameDir":
                    return renameDir(req, res, data);
                case "/getAudioStream":
                    return getAudioStream(req, res, data);
                case "/convertToMp4":
                    return convertToMp4(req, res, data);
                case "/getPlayList":
                    return getPlayList(req, res, data);
                case "/getYTUrlInfo":
                    return getYTUrlInfo(req, res, data);
                default:
                    return res.end("ERROR API POST: " + JSON.stringify(data));
            }
        }, procesarDatosPost);
    } else if (req.method === 'GET') {
        return notFound(req, res, 'API NOT FOUND');
        //return res.end("API GET PROCESADA");
    }
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
    } else if (["mp3", "ogg", "mp4", "avi", "jpg", "png", 'gif'].indexOf(getExtension(req.url)) >= 0) {
        return returnFile(req, res);
    } else if (req.url == "/") {
        return getFile(req, res, "text/html");
    } else {
        return notFound(req, res);
    }
}
/*
const ytsr = require('ytsr');
let filter;

ytsr.getFilters('https://www.youtube.com/watch?v=uMOt1OshOJ8', function (err, filters) {
    if (err) throw err;
    filter = filters.get('Type').find(o => o.name === 'Video');
    ytsr.getFilters(filter.ref, function (err, filters) {
        if (err) throw err;
        //        filter = filters.get('Duration').find(o => o.name.startsWith('Short'));
        var options = {
            limit: 5,
            nextpageRef: filter.ref,
        }
        ytsr(null, options, function (err, searchResults) {
            if (err) throw err;
            log(searchResults);
        });
    });
});
*/
