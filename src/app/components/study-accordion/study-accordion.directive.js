'use strict';

angular.module('transmartBaseUi')
    /**
     * This directive creates the study accordion
     * @memberof transmartBaseUi
     * @ngdoc directive
     * @name studyAccordion
     */
    .directive('studyAccordion', [function () {
        return {
            restrict: 'E',
            scope: {
                studies: '=studies',
                title: '=title',
                studyShown: '='
            },
            templateUrl: 'app/components/study-accordion/study-accordion.tpl.html',
            controller: 'StudyAccordionCtrl as ctrl',
            controllerAs : 'ctrl'
        };
    }])

    /**
     * Controller for study accordion
     * @memberof transmartBaseUi
     * @ngdoc controller
     * @name StudyAccordionCtrl
     */
    .controller('StudyAccordionCtrl', ['$uibModal', 'UtilService', 'TreeNodeService',
        function ($uibModal, UtilService, TreeNodeService) {

            var ctrl = this;

            ctrl.treeConfig = {
                drag: false,
                collapsed: true
            };

            ctrl.isURL = UtilService.isURL;

            ctrl.status = {
                isFirstOpen: false,
                isFirstDisabled: false,
                oneAtATime: true
            };

            /**
             * Populate node children
             * @memberof StudyAccordionCtrl
             * @param node
             */
            ctrl.populateChildren = function (node) {
                var prefix;

                // first check if node has Restangular object or not
                // if not it means it's root node a.k.a study
                if (!node.hasOwnProperty('restObj')) {
                    node = TreeNodeService.setRootNodeAttributes(node);
                    prefix = 'concepts/';
                }

                node.isLoading = true;

                TreeNodeService.getNodeChildren(node, prefix).finally(function () {
                    node.isLoading = false;
                });

            };

            ctrl.prev_node = null;

            /**
             * Clear metadata popup of a node
             * @memberof StudyAccordionCtrl
             * @param node
             * @returns {{isSame: boolean, popover: *}}
             */
            ctrl.clearMetadata = function (node) {
                //reset or toggle the flags
                var isSame = false;
                if (ctrl.prev_node !== null && ctrl.prev_node.$$hashKey == node.$$hashKey) {
                    isSame = true;
                }
                if (!isSame && ctrl.prev_node !== null) {
                    ctrl.prev_node.isPopOpen = false;
                }
                node.isPopOpen = !node.isPopOpen;
                ctrl.prev_node = node;

                //clear the html
                ctrl.metadataObj = {};
                var query = document.getElementsByClassName("popover");
                var popoverElements = angular.element(query);
                popoverElements.remove();

                return {
                    isSame: isSame,
                    popover: popoverElements
                };
            };

            /**
             * Display metadata of a node
             * @memberof StudyAccordionCtrl
             * @param node
             */
            ctrl.displayMetadata = function (node) {
                if (node) {
                    ctrl.clearMetadata(node);
                    if (node.hasOwnProperty('_embedded')) {
                        ctrl.metadataObj.title = node._embedded.ontologyTerm.name;
                        ctrl.metadataObj.fullname = node._embedded.ontologyTerm.fullName;
                        ctrl.metadataObj.body = node._embedded.ontologyTerm.metadata;
                    } else if (node.hasOwnProperty('restObj')) {
                        ctrl.metadataObj.title = node.title;
                        ctrl.metadataObj.fullname = node.restObj.fullName;
                        ctrl.metadataObj.body = node.restObj.metadata;
                    }
                }//if
            };


        }]);
