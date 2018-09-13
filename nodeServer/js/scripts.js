// en caso de que necesitemos clonar un objeto JSON
JSON.clone = function (obj) {
    return JSON.parse(JSON.stringify(obj));
};

function focus(eName) {
    window.setTimeout('document.getElementById("' + eName + '").focus()', 200);
}
//alias enfocar para llamar a focus desde el html ya que al hacer onclick='focus("txtBarCode")' da error
var enfocar = focus;

function scrollToClass(idElementoPadre, classHijo) {
    // la clase del hijo debe ser única en toda la página
    // .offsetTop la distancia a la que se encuentra el hijo desde el tope del elemento padre
    // .offsetHeight height del elemento
    var ePadre = document.getElementById(idElementoPadre);
    var ehijo = document.getElementsByClassName(classHijo)[0];
    if (ePadre && ehijo) {
        ePadre.scrollTop = (ehijo.offsetTop - (((ePadre.offsetHeight / ehijo.offsetHeight) / 2) * ehijo.offsetHeight) + (ehijo.offsetHeight / 2));
    }
}

function formatearFloat(n) {
    // parsea el string n a float y lo limita a 3 decimales
    return parseFloat(parseFloat(n).toFixed(3));
}

function getMinutesSince(fecha) {
    /* retorna la cantidad de minutos que han pasado desde la fecha pasada
    por parámetro hasta la fecha actual*/
    return ((new Date()).getTime() - fecha.getTime()) / 1000 / 60;
}

function cancelFullScreen(el) {
    var requestMethod = el.cancelFullScreen || el.webkitCancelFullScreen || el.mozCancelFullScreen || el.exitFullscreen;
    if (requestMethod) { // cancel full screen.
        requestMethod.call(el);
    }
}

function requestFullScreen(el) {
    // Supports most browsers and their versions.
    var requestMethod = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
    if (requestMethod) { // Native full screen.
        requestMethod.call(el);
    }
    return false
}

function pantallaCompleta() {
    var elem = document.body; // Make the body go full screen.
    var isInFullScreen = (document.fullScreenElement && document.fullScreenElement !== null) || (document.mozFullScreen || document.webkitIsFullScreen);
    if (isInFullScreen) {
        cancelFullScreen(document);
    } else {
        requestFullScreen(elem);
    }
    return false;
}

function log(o) {
    console.log(o);
}

/* Eventos */
window.onkeydown = function (e) {
    var key = e.keyCode ? e.keyCode : e.which;
    if (key == 122) {
        pantallaCompleta();
        e.preventDefault();
    }
    //    else if (key == 116) {
    //        // si se pesiona f5 no hace nada
    //        e.preventDefault();
    //    }
};

function onlyNumbersValidate(e) {
    if (["-", "+", "e", ].includes(e.key)) {
        e.preventDefault();
    }
};

function currentDateToUTC(date) {
    var fecha = new Date(date);
    fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
    return fecha;
}

document.oncontextmenu = function () {
    return false;
}

function isBlog(a){
    if(location.hostname.includes('blog')){
        log('Its the blog')
        return true;
    }else{
        log('Its NOT the blog')
        return false;

    }
}
/* ---------------------------------------- */
