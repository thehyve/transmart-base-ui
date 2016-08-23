'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name CohortGridService
 */
angular.module('transmartBaseUi').factory('CohortGridService', ['$timeout', function ($timeout) {

    var service = {
        WIDTH_PER_COLUMN: 200,
        HEIGHT: 500,
        options: {
            enableGridMenu: true,
            enableSelectAll: true,
            exporterCsvFilename: 'cohort.csv',
            exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
            exporterMenuPdf: false,
            paginationPageSizes: [25, 50, 75],
            paginationPageSize: 25,
            columnDefs: [], // columns is stored here
            data: [], // data is stored here
            enableFiltering: true,
            onRegisterApi: function (gridApi) {
                service.options.gridApi = gridApi;
            }
        }
    };

    /**
     * Generate grid columns
     * @memberof CohortGridService
     * @param rawHeaders
     * @returns {Array}
     */
    service.prepareColumnDefs = function (rawHeaders) {
        var columnDefs = [];
        columnDefs.push({'field': 'id', width: service.WIDTH_PER_COLUMN});
        rawHeaders.forEach(function (label) {
            if (_.find(columnDefs, {field: label.name}) == undefined) {
                columnDefs.push({field: label.name, width: service.WIDTH_PER_COLUMN});
            }
        });
        return columnDefs;
    };

    /**
     * Format data and labels for the gridview's data
     * @memberof CohortGridService
     * @param subjects
     * @param headers
     * @returns {Array}
     */
    service.convertToTable = function (subjects, headers) {
        var formatted = [];
        subjects.forEach(function (subject) {
            var cleanSubject = {};
            cleanSubject.id = subject.id;
            headers.forEach(function (label) {
                cleanSubject[label.name] = subject.labels[label.labelId];
            });
            formatted.push(cleanSubject);
        });
        return formatted;
    };

    service.updateCohortGridView = function (subjects, labels) {
            $timeout(function () { // this is necessary for ui-grid to notice the change at all
                if (subjects) {
                    service.options.data = service.convertToTable(subjects, labels);
                    service.options.columnDefs = service.prepareColumnDefs(labels);
                }
            });
    };

    return service;
}]);
