Products = new Mongo.Collection('products');

if (Meteor.isClient) {

  // This code only runs on the client
  angular.module('daty',['angular-meteor']);

  angular.module('daty').controller('DatyListCtrl', ['$scope', '$meteor',
    function ($scope, $meteor) {

      $scope.upToDateProducts = $meteor.collection(Products);

      $scope.allProducts = $meteor.collection(Products);

      $scope.outOfDateProducts = $meteor.collection(function() {
        return Products.find({dueDate:{"$lt": new Date()}});
      });

      $scope.limitProducts = $meteor.collection(function() {
        var today = new Date(),
            to = new Date();
        to.setDate(to.getDate() + 14);
        return Products.find({dueDate:{"$lt": to, "$gt": today}});
      });

      $scope.searchProducts = function(searchProduct){
        $scope.upToDateProducts = $meteor.collection(function(){
          return Products.find({label: { $regex: searchProduct}  });
        });
      };

      $scope.addProduct = function (labelProduct, quantityProduct, dueDateProduct, locationProduct) {
        $scope.allProducts.push( {
          label: labelProduct,
          quantity: quantityProduct,
          dueDate: dueDateProduct,
          location: locationProduct,
          createdAt: new Date() }
        );

        $scope.updateListProducts('allProducts');
      };

      $scope.updateListProducts = function (type){

        switch(type){
          case "outOfDateProducts":
            $scope.upToDateProducts = $scope.outOfDateProducts;
          break;
          case "allProducts":
            $scope.upToDateProducts = $scope.allProducts;
          break;
          case "limitProducts":
            $scope.upToDateProducts = $scope.limitProducts;
          break;
        }
      };

    }]);

    // UX
    $(document).ready(function(){

      $('#btn-add').on('click', function(){
        $('#addFormProduct').toggle();
        $('#searchFormProduct').hide();
      });

      $('#btn-search').on('click', function(){
        $('#searchFormProduct').toggle();
        $('#addFormProduct').hide();
      });

      $('.navbar-menu button').on('click', function(){
        $('.navbar-menu button').each(function(){
          $(this).removeClass('selected');
        });

        $(this).addClass('selected');

      });

      $('button').on('click', function(){
        $('#addFormProduct').hide();
        $('#searchFormProduct').hide();
      });

    });

}
