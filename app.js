var app = angular.module('storeApp', []);

app.controller('BillingCtrl', ['$scope', function($scope){
  // Jaden R: using "vm = this" pattern because it’s the style many AngularJS examples use.
  var vm = this;

  // David C: This object holds the values from the form fields. Angular binds them live.
  vm.form = { firstName:'', lastName:'', email:'', phone:'', address:'', city:'', state:'', zip:'', cardNumber:'', exp:'', cvv:'' };

  // Thomas K: This function runs when the form is submitted (ng-submit).
  vm.submitBilling = function(){
    // Jaden R: payload is organized into shopper, billing, payment so it’s very readable in the preview.
    var payload = {
      shopper: { firstName: vm.form.firstName, lastName: vm.form.lastName, email: vm.form.email, phone: vm.form.phone },
      billing: { address: vm.form.address, city: vm.form.city, state: vm.form.state, zip: vm.form.zip },
      payment: { cardNumber: vm.form.cardNumber, exp: vm.form.exp, cvv: vm.form.cvv }
    };

    // David C: We stringify with pretty spaces so the JSON in the <pre> looks like a real API payload.
    document.getElementById('billingJson').textContent = JSON.stringify(payload, null, 2);

    // Thomas K: When the Node server exists, we could uncomment this and send it:
    /*
    $http.post('/api/billing', payload).then(function(res){
      console.log('Server says:', res.data);
    });
    */
    // Or jQuery style:
    /*
    $.ajax({ url:'/api/billing', method:'POST', contentType:'application/json', data: JSON.stringify(payload) })
      .done(function(msg){ console.log('posted ok', msg); });
    */
  };
}]);

// ======================= Returns Page Controller =======================
// Jaden R: This one powers the Handle Returns page. We keep a tiny fake product list,
// then allow the user to search it, set a quantity and reason, and add to a "returns" cart.
// When you click "Submit Returns" we show that as JSON in the <pre> just like the billing page.
app.controller('ReturnsCtrl', ['$scope', function($scope){
  var vm = this;

  // Thomas K: little pretend catalog for the demo, we only need a few items.
  vm.products = [
    { sku:'BL-100', name:'Blouse', price:29.99 },
    { sku:'BT-110', name:'Belt', price:19.99 },
    { sku:'TS-120', name:'T-Shirt', price:14.50 },
    { sku:'JK-130', name:'Jacket', price:79.00 },
    { sku:'SK-140', name:'Sneakers', price:64.99 }
  ];

  // David C: This is our in-memory “cart” for returns that we print below and (later) would send to the API.
  vm.returns = [];

  // Jaden R: ng-model on the search box binds to vm.query so Angular’s filter can use it.
  vm.query = '';

  // Thomas K: Add the selected product with the quantity and reason into the returns array.
  // We do a tiny validation so we don’t allow empty or zero quantities.
  vm.addReturn = function(p){
    if(!p.qty || p.qty < 1){
      alert('Please set a quantity');
      return;
    }
    // David C: we copy only the fields we need for the payload to keep it clean.
    var item = { sku:p.sku, name:p.name, qty: Number(p.qty), reason: p.reason||'' };
    vm.returns.push(item);
  };

  // Jaden R: Remove by index is the simplest way to delete one row in the table for now.
  vm.removeReturn = function(idx){
    vm.returns.splice(idx,1);
  };

  // Thomas K: Clear everything so we can start fresh during testing without reloading the page.
  vm.clearAll = function(){
    vm.returns = [];
    document.getElementById('returnsJson').textContent = '{ }';
  };

  // David C: This builds a small payload and prints it out like we do on the billing page.
  // Later when the Node server exists, we can just POST this payload to /api/returns.
  vm.submitReturns = function(){
    var payload = { shopperId: 'demo-123', returns: vm.returns };
    document.getElementById('returnsJson').textContent = JSON.stringify(payload, null, 2);

    // Angular version (leave commented until API is live):
    /*
    $http.post('/api/returns', payload).then(function(res){ console.log(res.data); });
    */

    // jQuery version (also leave commented):
    /*
    $.ajax({ url:'/api/returns', method:'POST', contentType:'application/json', data: JSON.stringify(payload) })
      .done(function(msg){ console.log('posted', msg); });
    */
  };
}]);
