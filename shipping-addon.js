/* ====================================================================
   shipping-addon.js
   - Thomas Koltes: Angular controller + Bootstrap layout integration
   - David Choe: AJAX transport stub + debug output
   - Jaden Reyes: read form, validate, build JSON, show JSON
   ==================================================================== */
(function () {
  'use strict';

  // tiny Angular app
  var app = angular.module('shippingApp', []);
  app.controller('ShipCtrl', ['$scope', function($scope) {
    var vm = this;
    vm.data = {};   // This will hold our shipping JSON for Angular panel
    return vm;
  }]);

  function val(id) {
    return (document.getElementById(id)?.value || '').trim();
  }

  function showJSON(obj, preId) {
    const pre = document.getElementById(preId);
    if (pre) pre.textContent = JSON.stringify(obj, null, 2);
  }

  function requiredFieldsOk(fields) {
    for (let f of fields) {
      if (!f.value) {
        f.el.classList.add('is-invalid');
        return false;
      } else {
        f.el.classList.remove('is-invalid');
      }
    }
    return true;
  }

  $(function() {
    const $form = $('#shippingForm');
    const $ajax = $('#ajaxSendBtn');

    $form.on('submit', function (e) {
      e.preventDefault();

      const data = {
        name:     val('shipName'),
        address:  val('shipAddress'),
        city:     val('shipCity'),
        state:    val('shipState'),
        zip:      val('shipZip'),
        carrier:  val('shipCarrier'),
        method:   val('shipMethod')
      };

      const ok = requiredFieldsOk([
        { el: shipName, value: data.name },
        { el: shipAddress, value: data.address },
        { el: shipCity, value: data.city },
        { el: shipState, value: data.state },
        { el: shipZip, value: data.zip },
        { el: shipCarrier, value: data.carrier },
        { el: shipMethod, value: data.method }
      ]);

      if (!ok) {
        alert("Please fill in all required fields.");
        return;
      }

      // Show JSON pretty
      showJSON(data, 'jsonOutput');

      // Update Angular panel
      const el = document.querySelector('[ng-controller]');
      const ngScope = angular.element(el).scope();
      ngScope.$applyAsync(() => { ngScope.vm.data = data; });
    });

    // AJAX stub
    $ajax.on('click', function() {

      let fakeUrl = "https://example.com/api/shipping";
      let txt = $('#jsonOutput').text().trim();
      let payload = {};

      try { payload = JSON.parse(txt); } catch(e) {}

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
