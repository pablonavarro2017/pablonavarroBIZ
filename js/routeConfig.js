app.config(function ($stateProvider, $urlRouterProvider) {

    var homeState = {
        name: 'home',
        url: '/',
        templateUrl: '/inc/welcome.html',
        controller: 'mainController'
    }

    var aboutState = {
        name: 'about',
        url: '/about',
        templateUrl: 'inc/about.html',
        controller: 'mainController'
    }

    var blogState = {
        name: 'blog',
        url: '/blog',
        templateUrl: 'inc/blog.html',
        controller: 'mainController'
    }

    var uploadState = {
        name: 'upload',
        url: '/upload',
        templateUrl: '/inc/uploadFile.html',
        controller: 'fsController'
    }
    $urlRouterProvider.otherwise('/');

    $stateProvider.state(aboutState);
    $stateProvider.state(blogState);
    $stateProvider.state(homeState);
    $stateProvider.state(uploadState);
});
