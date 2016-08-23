/**
 * Copyright (c) 2016 The Hyve B.V.
 * This code is licensed under the GNU General Public License,
 * version 3, or (at your option) any later version.
 */

/**
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name StudyListInterceptor
 */
angular.module('transmartBaseUi').factory('StudyListInterceptor', [function () {

    var service = {};

    /**
     * Study interceptor to give study type based on prefix in the ontology term
     * @memberof StudyListInterceptor
     * @param data
     * @param operation
     * @param what
     * @returns {*}
     */
    service.customResponseInterceptor = function (data, operation, what) {
        if (operation === 'getList' && what === 'studies') {
            _.forEach(data, function (study) {
                study.isLoading = true;
                if (study._embedded.ontologyTerm.fullName.split('\\')[1] === 'Public Studies') {
                    study.type = 'public';
                } else if (study._embedded.ontologyTerm.fullName.split('\\')[1] === 'Private Studies') {
                    study.type = 'private';
                } else {
                    study.type = 'other';
                }
                study.hide = false; // show study by default
                study.isLoading = false;
            });
        }
        return data;
    };

    return service;
}]);
