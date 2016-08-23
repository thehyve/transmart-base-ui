'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name GridsterService
 */
angular.module('transmartBaseUi').factory('GridsterService', ['$q', function ($q) {

    var service = {
        options: {
            // whether to push other items out of the way on move or resize
            pushing: true,
            // whether to automatically float items up so they stack
            floating: false,
            // whether or not to have items of the same size switch places instead
            // of pushing down if they are the same size
            swapping: true,
            // the pixel distance between each widget
            margins: [10, 10],
            // whether margins apply to outer edges of the grid
            outerMargin: false,
            // the minimum columns the grid must have
            minColumns: 1,
            // the minimum height of the grid, in rows
            minRows: 2,
            // maximum number of rows
            maxRows: 100,
            // minimum column width of an item
            minSizeX: 2,
            // maximum column width of an item
            maxSizeX: null,
            // minumum row height of an item
            minSizeY: 2,
            // maximum row height of an item
            maxSizeY: null,
            resizable: {
                enabled: true,
                handles: ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'],
                resize: function (event, $element, widget) {
                    // Resize chart container in an interactive way
                    angular.element('#cohort-chart-panel-' + widget.ids)
                        .width($element[0].clientWidth)
                        .height($element[0].clientHeight);
                }
            },
            draggable: {
                enabled: true, // whether dragging items is supported
                handle: '.chart-drag-handle', // optional selector for resize handle
            }
        },
        config: {
            // Base width for a gridster square, this value will be adapted to fit
            // exaclty an even number of squares in the grid according to window size
            G_BASE_WIDTH: 80,
            // Number of columns a gridster item will occupy by default
            G_ITEM_SPAN_X: 3,
            // Number of rows a gridster item will occupy by default
            G_ITEM_SPAN_Y: 3
        },
        cohortChartContainerLabels: []
    };

    service.resize = function (elId, labels, reDistribute) {
        // Get width of the full gridster grid
        var _gWidth = angular.element(elId).width();

        // Calculate the number of columns in the grid according to full gridster
        // grid size and the base square size. Adjust by -1 if number of columns
        // is not pair.
        var _gCols = Math.floor(_gWidth / service.config.G_BASE_WIDTH);
        _gCols = _gCols % 3 ? (_gCols % 3 === 1 ? _gCols - 1 : _gCols + 1) : _gCols;
        service.options.columns = _gCols;

        // For each label create a gridster item
        if (!labels) {
            labels = service.cohortChartContainerLabels;
        }

        labels.forEach(function (label, index) {
            if (!label.sizeX || reDistribute) {
                label.sizeX = service.config.G_ITEM_SPAN_X;
                label.sizeY = service.config.G_ITEM_SPAN_Y;
                // Spread items left to rigth
                label.col = (index * label.sizeX) % _gCols;
                // And top to bottom
                label.row = Math.floor((index * label.sizeX) / _gCols) * label.sizeY;
            }
        });

        service.cohortChartContainerLabels = labels;

        return labels;
    };

    return service;
}]);
