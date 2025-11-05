(function () {
  'use strict';

  // Thomas: this creates the little AngularJS app we need, nothing fancy
  var app = angular.module('shippingApp', []);

  // Thomas: our controller basically stores data in vm.data so {{ vm.data.xxx }} can show it
  app.controller('ShipCtrl', ['$scope', function($scope) {
    var vm = this;
    vm.data = {};   // Jaden: this object updates live after user submits shipping form
    return vm;
  }]);

  // Jaden: helper gets text from an input box so we don't keep writing document.getElement...
  function val(id) {
    return (document.getElementById(id)?.value || '').trim();
  }

  // David: this takes any JS object and prints it on the screen in a <pre> nicely spaced
  function showJSON(obj, preId) {
    const pre = document.getElementById(preId);
    if (pre) pre.textContent = JSON.stringify(obj, null, 2);
  }

  // Jaden: super basic required-checker; puts red border if empty
  function requiredFieldsOk(fields) {
    for (let f of fields) {
      if (!f.value) {
        // Thomas: bootstrap “is-invalid” makes border red
        f.el.classList.add('is-invalid');
        return false;
      } else {
        f.el.classList.remove('is-invalid');
      }
    }
    return true;
  }

  // David: waiting until page loads so jQuery events work
  $(function() {

    const $form = $('#shippingForm');
    const $ajax = $('#ajaxSendBtn');

    // Jaden: when button pressed, we gather fields + build JSON
    $form.on('submit', function (e) {
      e.preventDefault();

      // Jaden: grabbing all fields into one object
      const data = {
        name:     val('shipName'),
        address:  val('shipAddress'),
        city:     val('shipCity'),
        state:    val('shipState'),
        zip:      val('shipZip'),
        carrier:  val('shipCarrier'),
        method:   val('shipMethod')
      };

      // Jaden: checking that each required field has something inside
      const ok = requiredFieldsOk([
        { el: shipName,    value: data.name },
        { el: shipAddress, value: data.address },
        { el: shipCity,    value: data.city },
        { el: shipState,   value: data.state },
        { el: shipZip,     value: data.zip },
        { el: shipCarrier, value: data.carrier },
        { el: shipMethod,  value: data.method }
      ]);

      if (!ok) {
        alert("Please fill in all required fields.");
        return;
      }

      // David: show that JSON to the user so they can see exactly what’s in data object
      showJSON(data, 'jsonOutput');

      // Thomas: now push that same data into Angular so it updates the right side display
      const el = document.querySelector('[ng-controller]');
      const ngScope = angular.element(el).scope();
      ngScope.$applyAsync(() => { ngScope.vm.data = data; });

    });

    // David: this button pretends to send to server, showing that we can do AJAX later
    $ajax.on('click', function() {

      let fakeUrl = "https://example.com/api/shipping";
      let txt = $('#jsonOutput').text().trim();
      let payload = {};

      try {
        // Jaden: if JSON is valid, parse it, otherwise leave payload empty
        payload = JSON.parse(txt);
      } catch(e) {}

      // David: here is our mock "response" object printed on page
      let simulated = {
        status: "ok",
        message: "AJAX stub success (not actually sent)",
        sentTo: fakeUrl,
        dataSent: payload
      };

      $('#ajaxResult').text(JSON.stringify(simulated, null, 2));
    });

  });

})();
