'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name QueryBuilderService
 */
angular.module('transmartBaseUi').factory('QueryBuilderService', ['JSON2XMLService', function (JSON2XMLService) {

    var service = {};

    /**
     * Converts the selections in the cohort filters to i2b2 query xml.
     * @memberof QueryBuilderService
     * @param cohortFilters
     * @param name
     * @returns {*}
     */
    service.convertCohortFiltersToXML = function (cohortFilters, queryName) {
        var xml = JSON2XMLService.json2xml({
            'query_definition': {
                'query_name': queryName,
                'panel': service.convertCohortFiltersToI2B2Panels(cohortFilters)
            }
        });
        return xml;
    };

    /**
     * Converts the selections in the cohort filters to an array of panel
     * object structures that translate directly to the i2b2 query xml format.
     * @memberof QueryBuilderService
     * @param cohortFilters
     * @returns {Array}
     */
    service.convertCohortFiltersToI2B2Panels = function (cohortFilters) {
        var panels = [];

        _.each(cohortFilters, function (cohortFilter) {
            var items;

            // Numbers and float are constrained by a range
            if (cohortFilter.type == 'float' || cohortFilter.type == 'number') {
                items = generatePanelItemsForNumericRanges(cohortFilter);
            }

            // Constrain by one or more categories
            if (cohortFilter.type == 'string') {
                items = generatePanelItemsForCategories(cohortFilter);
            }

            if (items.length > 0) {
                panels.push({
                    'panel_number': panels.length + 1,
                    'invert': 0,
                    'total_item_occurrences': 1,
                    'item': items
                });
            }

        });

        // If we didn't find any filters, add the entire study as a filter
        if (panels.length == 0) {
            var studyKey = cohortFilters[0].study._embedded.ontologyTerm.fullName;
            panels.push({
                'panel_number': 1,
                'invert': 0,
                'total_item_occurrences': 1,
                'item': generatePanelItemForConcept(studyKey,
                    cohortFilters[0].study.id, cohortFilters[0].study.type)
            });
        }

        return panels;
    };

    /**
     * Generate a list of panel items that will be OR-ed in the query, based
     * on the selected numeric ranges. In practice only one range will be selected,
     * but multiple are supported.
     * @memberof QueryBuilderService
     * @param cohortFilter
     * @returns {Array}
     */
    function generatePanelItemsForNumericRanges(cohortFilter) {
        var items = [];

        _.each(cohortFilter.filters, function (filter) {
            items.push({
                'item_name': cohortFilter.name,
                'item_key': getStudyTypePrefix(cohortFilter.study.type) + cohortFilter.label,
                'tooltip': cohortFilter.label,
                'class': 'ENC',
                'constrain_by_value': generateConstraintByValueBetween(filter[0], filter[1])
            });
        });

        return items;
    }

    /**
     * Generate a list of panel items that will be OR-ed in the query, based
     * on the selected filters for the categories.
     * @memberof QueryBuilderService
     * @param cohortFilter
     * @returns {Array}
     */
    function generatePanelItemsForCategories(cohortFilter) {
        var items = [];
        _.each(cohortFilter.filters, function (filter) {
            items.push(generatePanelItemForConcept(cohortFilter.label + filter, filter, cohortFilter.study.type));
        });
        return items;
    }

    /**
     * Generate a value constraint for numeric ranges.
     * @memberof QueryBuilderService
     * @param value1
     * @param value2
     * @returns {{value_operator: string, value_constraint: string, value_type: string}}
     */
    function generateConstraintByValueBetween(value1, value2) {
        return {
            'value_operator': 'BETWEEN',
            'value_constraint': '' + value1 + ' and ' + value2,
            'value_type': 'NUMBER'
        }
    }

    /**
     * Generate a separate panel item for the specified concept. The type is
     * used to generate the prefix.
     * @memberof QueryBuilderService
     * @param key
     * @param name
     * @param studyType
     * @returns {{item_name: *, item_key: *, tooltip: *, class: string}}
     */
    function generatePanelItemForConcept(key, name, studyType) {
        return {
            'item_name': name,
            'item_key': getStudyTypePrefix(studyType) + key,
            'tooltip': key,
            'class': 'ENC',
        };
    }

    /**
     * Returns the study prefix (Public Studies / Private Studies) based on the study type.
     * @memberof QueryBuilderService
     * @param studyType
     * @returns {*}
     */
    function getStudyTypePrefix(studyType) {
        switch (studyType) {
            case 'public':
                return '\\\\Public Studies';
            case 'private':
                return '\\\\Private Studies';
        }
    }

    return service;
}]);
