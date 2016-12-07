'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name QueryParserService
 */
angular.module('transmartBaseUi').factory('QueryParserService',
    ['XML2JSONService', 'StudyListService', 'TreeNodeService',
    function (XML2JSONService, StudyListService, TreeNodeService) {

        var service = {};

      /**
       * Puts the variable in a list if it is not already a list.
       * @param variable The variable to return as a list
       * @returns *[] The original list or the variable put in the list
       */
        function makeList(variable) {
            return _.isArray(variable) ? variable : [variable];
        }

        service.parseQueryXMLToDescription = function (queryXML) {
            var description = '';
            var queryObj = XML2JSONService.xml2json(queryXML).query_definition;

            // Loop through the panels in the query
            _.each(makeList(queryObj.panel), function(panel) {
                var conceptPath, filters = [];

                // Loop through the items in the panel
                _.each(makeList(panel.item), function(item) {

                    // Split concept key by backslash and remove all empty entries
                    var splitKey = item.item_key.split('\\').filter(function(el) {
                        return el != "";
                    });

                    // Include study name, but only once
                    if (!description) {
                        var studyName = splitKey[2];
                        description = studyName + ' ';
                    }

                    if (splitKey.length > 3) {
                        // Save the rest of the key as the concept path
                        conceptPath = splitKey.slice(3);

                        // Extract the filters
                        if (item.constrain_by_value) {
                            // Numerical range
                            var constraint = item.constrain_by_value;
                            if (constraint.value_operator == 'BETWEEN') {
                                // Numeric range
                                // The constraint string is formatted like '34.3 and 45.6'
                                var betweenValues = constraint.value_constraint.split(' ');
                                var minValue = parseFloat(betweenValues[0]).toPrecision(3);
                                var maxValue = parseFloat(betweenValues[2]).toPrecision(3);
                                filters.push([minValue, maxValue]);
                            }
                        }
                        else {
                            // Category
                            filters.push(conceptPath[conceptPath.length - 1]);
                        }
                    }

                });

                if (conceptPath) {
                    // Include the concept
                    var conceptTerm = conceptPath[conceptPath.length - 1];
                    if (_.includes(filters, conceptTerm)) {
                        conceptTerm = conceptPath[conceptPath.length - 2];
                    }
                    description += conceptTerm + ' ';

                    // Include the filters on the concept
                    if (filters.length > 0) {
                        description += '[' + filters.join(', ') + '] ';
                    }
                }

            });

            return description;
        };

        /**
         * Converts the selections in the cohort filters from i2b2 query xml.
         * @memberof QueryParserService
         * @param queryXML String in i2b2 query XML format
         * @param cohortSelectionController the controller that can be used to update the active selection
         * @returns {Promise}
         */
        service.convertCohortFiltersFromXML = function (queryXML, cohortSelectionController) {
            var queryObj = XML2JSONService.xml2json(queryXML).query_definition;
            return service.convertCohortFiltersFromQueryDefinition(queryObj, cohortSelectionController);
        };

        /**
         * Converts the selections in the cohort filters from i2b2 query xml.
         * @memberof QueryParserService
         * @param queryObj JSON object representing the i2b2 query
         * @param cohortSelectionController the controller that can be used to update the active selection
         * @returns {Promise}
         */
        service.convertCohortFiltersFromQueryDefinition = function (queryObj, cohortSelectionController) {

            // Loop through the panels in the query
            _.each(makeList(queryObj.panel), function(panel) {

                var studyNode, conceptPath, filters = [];

                // Loop through the items in the panel
                _.each(makeList(panel.item), function(item) {

                    // Split concept key by backslash and remove all empty entries
                    var splitKey = item.item_key.split('\\').filter(function(el) {
                        return el != "";
                    });

                    // Look up study
                    var studyKey = '\\' + splitKey.slice(1, 3).join('\\') + '\\';
                    studyNode = StudyListService.getStudy(studyKey);

                    // Save the rest of the key as the concept path
                    conceptPath = splitKey.slice(3);

                    // Extract the filters
                    if (item.constrain_by_value) {
                        // Numerical range
                        var constraint = item.constrain_by_value;
                        if (constraint.value_operator == 'BETWEEN') {
                            // Numeric range
                            // The constraint string is formatted like '34.3 and 45.6'
                            var betweenValues = constraint.value_constraint.split(' ');
                            var minValue = betweenValues[0];
                            var maxValue = betweenValues[2];
                            filters.push(dc.filters.RangedFilter(minValue, maxValue));
                        }
                    }
                    else {
                        // Other type of filters, such as categorical.
                        // It could still be numerical node, but we don't know
                        // the type of node yet, so we'll figure this out later.
                        // In any case, we'll need to store the filter in case it is
                        // a categorical value and we have multiple of them
                        filters.push(conceptPath.slice(-1)[0]);
                    }

                });

                // Add a new task to the queue
                if (studyNode) {
                    TreeNodeService.expandConcept(studyNode, conceptPath)
                        .then(function (node) {
                            // Based on the type of node, make modifications to filters or node
                            if (TreeNodeService.isCategoricalParentNode(node) ||
                                TreeNodeService.isHighDimensionalNode(node)) {
                                filters = [];
                            }

                            if (TreeNodeService.isCategoricalLeafNode(node)) {
                                node = node.parent;
                            }

                            if (TreeNodeService.isNumericalNode(node)) {
                                // Now that we know the type of the node is numerical,
                                // we must check if we have the proper type of filters
                                filters = filters.filter(function(filter) {
                                    return filter.filterType == 'RangedFilter';
                                });
                            }

                            // Add the node and filters to the workspace
                            cohortSelectionController.addNodeWithFilters(node, filters);
                        });
                }
            });
        };

        return service;
}]);
