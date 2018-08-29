function log(o) {
    console.log(o);
}
window.onload = function () {
    $('.nav li a').on('click', function () {
        $('.navbar-collapse').collapse('hide');
    });
};
