function log(o) {
    console.log(o);
}
window.onload = function () {
    $('.nav li a').on('click', function () {
        $('.navbar-collapse').collapse('hide');
    });
};


var blob = new Blob(["Hello, world!"], {
    type: "text/plain;charset=utf-8"
});
//saveAs(blob, "hello world.txt");
