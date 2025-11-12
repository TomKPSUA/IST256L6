var app = angular.module('storeApp', []);

// Billing page controller
app.controller('BillingCtrl', ['$scope', function($scope){
  var vm = this;
  vm.form = { firstName:'', lastName:'', email:'', phone:'', address:'', city:'', state:'', zip:'', cardNumber:'', exp:'', cvv:'' };
  vm.submitBilling = function(){
    var payload = {
      shopper: { firstName: vm.form.firstName, lastName: vm.form.lastName, email: vm.form.email, phone: vm.form.phone },
      billing: { address: vm.form.address, city: vm.form.city, state: vm.form.state, zip: vm.form.zip },
      payment: { cardNumber: vm.form.cardNumber, exp: vm.form.exp, cvv: vm.form.cvv }
    };
    document.getElementById('billingJson').textContent = JSON.stringify(payload, null, 2);
  };
}]);

// Returns page controller
app.controller('ReturnsCtrl', ['$scope', function($scope){
  var vm = this;
  vm.products = [
    { sku:'BL-100', name:'Blouse', price:29.99 },
    { sku:'BT-110', name:'Belt', price:19.99 },
    { sku:'TS-120', name:'T-Shirt', price:14.50 },
    { sku:'JK-130', name:'Jacket', price:79.00 },
    { sku:'SK-140', name:'Sneakers', price:64.99 }
  ];
  vm.returns = [];
  vm.query = '';
  vm.addReturn = function(p){ if(!p.qty || p.qty < 1){ alert('Please set a quantity'); return; } vm.returns.push({ sku:p.sku, name:p.name, qty:Number(p.qty), reason:p.reason||'' }); };
  vm.removeReturn = function(idx){ vm.returns.splice(idx,1); };
  vm.clearAll = function(){ vm.returns = []; document.getElementById('returnsJson').textContent = '{ }'; };
  vm.submitReturns = function(){ var payload = { shopperId: 'demo-123', returns: vm.returns }; document.getElementById('returnsJson').textContent = JSON.stringify(payload, null, 2); };
}]);
