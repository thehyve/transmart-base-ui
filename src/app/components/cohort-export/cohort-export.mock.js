'use strict';
/**
 * @Service CohortExportMocks
 * @Description Service layer exposing mocks for cohort export functions
 */
angular.module('transmartBaseUi')
    .factory('CohortExportMocks',
        function () {
            var service = {};

            service.getChartSVGMock = function () {
                var node1 = {
                    id: 'node1-id',
                    classList: ['pie-slice', '_0', 'deselected'],
                    hasAttribute: function () {
                        return true;
                    }
                };
                var node2 = {
                    id: 'node2-id',
                    classList: ['dc-legend']
                };
                var node3 = {
                    id: 'node3-id',
                    classList: []
                };

                var nodes = [node1, node2, node3];

                var elm = {
                    id: 'elm-id',
                    getElementsByTagName: function () {
                        return nodes;
                    },
                    setAttribute: function (attr) {
                    },
                    hasChildNodes: function () {
                        return true;
                    },
                    children: [{}],
                    insertBefore: function (styleElement, refNode) {
                    },
                    querySelectorAll: function () {
                        return [node1];
                    }
                };

                return elm;
            };

            service.getDocumentStylesMock = function () {
                var style1 = {
                    cssRules: [{
                        selectorText: '.dc-chart  .pie-slice',
                        cssText: '.dc-chart .pie-slice { fill: white; font-size: 12px; cursor: pointer; }'
                    }]
                };
                var style2 = {
                    cssRules: [{
                        selectorText: '.dc-legend',
                        cssText: '.dc-legend { font-size: 11px; }'
                    }]
                };
                var style3 = {
                    cssRules: [{
                        selectorText: undefined
                    }]
                };

                return [style1, style2, style3, {}];
            };

            service.getChartLabelMock = function () {
                return {
                    labelId: 'label-id',
                    name: 'label-name',
                    study: {
                        _embedded: {
                            ontologyTerm: {
                                name: 'study-name'
                            }
                        }
                    },
                    sizeX: 1,
                    sizeY: 1
                };
            };

            service.getAngularElementMock = function (elm) {
                var childNodeA = {
                    hasAttribute: function () {
                        return true;
                    }
                };
                var childNodeB = {
                    hasAttribute: function () {
                        return false;
                    }
                };
                return {
                    children: function () {
                        return [childNodeA, childNodeB]
                    },
                    find: function () {
                        return [elm];
                    },
                    attr: function () {
                    }
                };
            };


            return service;
        });
