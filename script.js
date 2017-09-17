var booksApp = angular.module('booksApp', ['ngRoute','angularUtils.directives.dirPagination']);

booksApp.config(function ($routeProvider) {
    $routeProvider

        .when('/', {
            templateUrl: 'pages/login.html',
            controller: 'loginController'
        })
        .when('/add-edit-book', {
            templateUrl: 'pages/add-edit-book.html',
            controller: 'addEditBookController'
        })
        .when('/book-list', {
            templateUrl: 'pages/book-list.html',
            controller: 'BookListController'
        });
});

booksApp.controller('loginController', function ($scope, $http, $location) {

		function resetLogin(){
			$scope.username = '';
			$scope.password = '';
			
		}
		resetLogin();
    var isValid = false;
    $scope.checkIsValidUser = function () {

        for (var i = 0; i < $scope.data.length; i++) {
            if ($scope.data [i].username == $scope.username && $scope.data [i].password == $scope.password) {
                $location.path('/book-list');
                isValid = true;
            }
        }

        if (isValid == false) {
            alert("Invalid Username Or Password!!!");
			resetLogin();
        }
        $scope.loading = false;

    };

    $scope.onClickLogin = function () {
        $scope.loading = true;

        if ($scope.username != '' && $scope.password != '') {

            $http.get('http://localhost/data/admin.json').
                success(function (data) {
                    $scope.data = data;
                    $scope.checkIsValidUser();

                }).
                error(function (e) {
                    console.log("log error");
                });
        }


    };
    $scope.message = 'login';

});

booksApp.controller('BookListController', function ($scope, $http, $location, $rootScope,$timeout) {
    $scope.loading = true;
    $scope.orderDate = true;
    $scope.bookListData = [];
	 $rootScope.deleted=false;
    $scope.message = 'BookListController';
    $http({
        method: 'GET',
        url: 'http://fakerestapi.azurewebsites.net/api/Books',
        headers: {
            'Content-Type': 'application/json'
        }
    })

        .then(function (response) {
            $scope.bookListData = response.data;
            $rootScope.bookListLength = response.data.length;
            $scope.loading = false;

        });


    $scope.onClickBookEdit = function (id) {

        $rootScope.id = id;
        $location.path('/add-edit-book/');


    };


    $scope.onClickDelete = function (id) {

        if (id != null) {

            if (confirm("Are you sure?")) {
                $http({
                    method: 'DELETE',
                    url: 'http://fakerestapi.azurewebsites.net/api/Books/' + id,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })

                    .then(function (response) {
                        $scope.bookData = response.data;
						$rootScope.deleted = true;
						  $timeout(function(){  
					$rootScope.deleted = false; 
					}, 3000);
                     });
            }


        }

    };



});




booksApp.controller('addEditBookController', function ($scope, $rootScope, $http, $location, $timeout) {
	$rootScope.saved = false;
    $scope.loading = false;
    if ($rootScope.id) {
        $scope.message = 'addEditBookController.';
        $http({
            method: 'GET',
            url: 'http://fakerestapi.azurewebsites.net/api/Books/' + $rootScope.id,
            headers: {
                'Content-Type': 'application/json'
            }
        })

            .then(function (response) {
                $scope.bookData = response.data;
                console.log("response", response)
                $scope.loading = false;
				$scope.bookData.PublishDate=new Date($scope.bookData.PublishDate);
				
            });

    }

    $scope.onClickSubmit = function (bookData) {
        $scope.loading = true;
        $rootScope.saved = false;

        if (bookData != null) {

            if (bookData.ID != null || bookData.ID != 'Nan' || bookData.ID == undefined) {
                bookData.ID = $rootScope.bookListLength + 1;
            }
            $http({
                method: 'PUT',
                url: 'http://fakerestapi.azurewebsites.net/api/Books/' + bookData.ID,
                data: [bookData],
                headers: {
                    'Content-Type': 'application/json'
                }
            })

                .then(function (response) {
                    $scope.bookData = response.data;
                    $scope.loading = false;
				    $rootScope.saved = true;					
					  $timeout(function(){  
					$rootScope.saved = false; 
					}, 3000);		 
                    $location.path('/book-list/');

                });

        }

    };

    $scope.onClickCancel = function () {
        $location.path('/book-list/');

    };


});