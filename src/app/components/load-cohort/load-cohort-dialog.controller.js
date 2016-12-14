'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc controller
 * @name SaveCohortDialogCtrl
 */
angular.module('transmartBaseUi')
    .controller('LoadCohortDialogCtrl', ['$uibModalInstance', 'CohortSelectionService', 'param',
        function ($uibModalInstance, CohortSelectionService, param) {

            var vm = this;
            vm.boxes = CohortSelectionService.boxes;
            vm.selectedPanelIndex = '0';

            vm.ok = function () {
                var selectedBox = _.find(vm.boxes, {index: +vm.selectedPanelIndex});
                CohortSelectionService.currentBoxId = selectedBox.boxId;
                selectedBox.ctrl.clearSelection();
                CohortSelectionService.loadCohorts(param.selectedCohorts, selectedBox);
                $uibModalInstance.close();
            };

            vm.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
        }]);
