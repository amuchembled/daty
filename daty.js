Products = new Mongo.Collection('products');

if(Meteor.isClient || Meteor.isServer){

  Meteor.methods({
    searchProducts: function(searchProduct){
      if (! Meteor.userId()) {
        throw new Meteor.Error('not-authorized');
      }
      return Products.find({label: { $regex: searchProduct} });

    },
    addProduct: function (labelProduct, quantityProduct, dueDateProduct, locationProduct) {
      if (! Meteor.userId()) {
        throw new Meteor.Error('not-authorized');
      }
      Products.insert( {
        label: labelProduct,
        quantity: quantityProduct,
        dueDate: dueDateProduct,
        location: locationProduct,
        createdAt: new Date(),
        owner: Meteor.userId(),
        username: Meteor.user().username }
      );
    },
    deleteProduct: function(productId){
      if (! Meteor.userId()) {
        throw new Meteor.Error('not-authorized');
      }
      Products.remove(productId);
    }

  });
}


if (Meteor.isClient) {

  // This code only runs on the client
  angular.module('daty',['angular-meteor', 'accounts.ui', 'pascalprecht.translate']);

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

  angular.module('daty').config(['$translateProvider', function ($translateProvider) {

    $translateProvider.useStaticFilesLoader({
      prefix: 'lang/',
      suffix: '.json'
    });

    $translateProvider.preferredLanguage('fr');
  }]);

  angular.module('daty').controller('DatyListCtrl', ['$scope', '$meteor',
    function ($scope, $meteor) {

      // COLLECTIONS
      $scope.allProducts = $meteor.collection(function() {
        return Products.find({
          owner: Meteor.userId()
        });
      });
      
      $scope.upToDateProducts = $scope.allProducts;

      $scope.outOfDateProducts = $meteor.collection(function() {
        return Products.find({
          owner: Meteor.userId(),
          dueDate:{"$lt": new Date()}
        });
      });

      $scope.limitProducts = $meteor.collection(function() {
        var today = new Date(),
            to = new Date();
        to.setDate(to.getDate() + 14);
        return Products.find({
          owner: Meteor.userId(),
          dueDate:{"$lt": to, "$gt": today}
        });
      });

      // FUNCTIONS
      $scope.searchProducts = function (searchProduct) {
          $scope.upToDateProducts = $meteor.collection(
            $meteor.call('searchProducts', searchProduct)
          );
      };

      $scope.addProduct = function (labelProduct, quantityProduct, dueDateProduct, locationProduct) {
        $meteor.call('addProduct', labelProduct, quantityProduct, dueDateProduct, locationProduct);
        $scope.updateListProducts('allProducts');
      };

      $scope.deleteProduct = function (product) {
        $meteor.call('deleteProduct', product._id);
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
