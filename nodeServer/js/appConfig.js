app.config(function ($stateProvider, $urlRouterProvider) {

    var menu = {
        name: 'menu',
        url: '/',
        templateUrl: 'inc/menu.html',
        controller: 'mainController'
    }
    var presentacion = {
        name: 'presentacion',
        url: '/presentacion',
        templateUrl: "inc/presentacion.html",
        controller: "mainController"
    }
    var archivos = {
        name: 'archivos',
        url: '/archivos',
        templateUrl: 'inc/archivos.html',
        controller: 'archivosController'
    }
    var chat = {
        name: 'chat',
        url: '/chat',
        templateUrl: 'inc/chat.html',
        controller: 'mainController'
    }
    var blog = {
        name: 'blog',
        url: '/blog',
        templateUrl: 'inc/blog.html',
        controller: 'mainController'
    }
    var pan2 = {
        name: 'pan2',
        url: '/pan2',
        templateUrl: 'inc/pan2.html',
        controller: 'mainController'
    }
    var notas = {
        name: 'notas',
        url: '/notas',
        templateUrl: 'inc/notas.html',
        controller: 'mainController'
    }
    var bienesraices = {
        name: 'bienesraices',
        url: '/bienesraices',
        templateUrl: 'inc/bienesraices.html',
        controller: 'mainController'
    }
    var linkstore = {
        name: 'linkstore',
        url: '/linkstore',
        templateUrl: 'inc/linkstore.html',
        controller: 'mainController'
    }
    var gestordescarga = {
        name: 'gestordescarga',
        url: '/descargas',
        templateUrl: 'inc/descargas.html',
        controller: 'mainController'
    }
    var login = {
        name: 'login',
        url: '/login',
        templateUrl: 'inc/login.html',
        controller: 'loginController'
    }


    $urlRouterProvider.otherwise('/');

   $stateProvider.state(presentacion);
   $stateProvider.state(menu);
   $stateProvider.state(archivos);
   $stateProvider.state(chat);
   $stateProvider.state(blog);
   $stateProvider.state(pan2);
   $stateProvider.state(notas);
   $stateProvider.state(bienesraices);
   $stateProvider.state(linkstore);
   $stateProvider.state(gestordescarga);
   $stateProvider.state(login);
});
