'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name StudyListService
 */
angular.module('transmartBaseUi').factory('StudyListService', ['$q', 'EndpointService', 'StudyListInterceptor',
    function ($q, EndpointService, StudyListInterceptor) {

        var service = {
            studyList: [],
            studiesResolved: false
        };

        /**
         * Empty study list
         * @memberof StudyListService
         */
        service.emptyAll = function () {
            service.studyList = [];
        };

        /**
         * Show all studies
         * @memberof StudyListService
         */
        service.showAll = function () {
            _.forEach(service.studyList, function(s){
                s.hide = false;
            });
        };

        /**
         * Get all studies. Cached versions are returned when studies have been previously fetched.
         * Can be forced through the 'force' boolean.
         * @memberof StudyListService
         * @param boolean - force the retrieval of studies from the endpoints.
         * @return promise {Promise}
         */
        service.getAllStudies = function (force) {

            var deferred = $q.defer(), defers = [];
            var fnStudyInterceptor = StudyListInterceptor.customResponseInterceptor;

	        /**
             * Have we already retrieved the studies?
             * If so resolve and return
             */
            if (service.studiesResolved && service.studyList.length > 0 && !force) {
                deferred.resolve(service.studyList);
                return deferred.promise;
            }

            EndpointService.getEndpoints().forEach(function (endpoint) {
                // add custom response interceptor
                endpoint.restangular.addResponseInterceptor(fnStudyInterceptor);
                // collects every ajax call
                defers.push(endpoint.restangular.all('studies').getList());
            });

            $q.all(defers)
                .then(function (values) {
                    var _tmp = [];
                    values.forEach(function(val) {
                        _tmp = _.union(_tmp,  val)
                    });
                    service.studyList = _tmp;
                    service.studiesResolved = true;

                    deferred.resolve(service.studyList);
                })
                .catch(function (err) {
                    service.studiesResolved = false;
                    deferred.reject(err);
                });

            return deferred.promise;
        };

        /**
         * Remove study(s) by endpoint
         * @memberof StudyListService
         * @param endpoint
         */
        service.removeStudiesByEndpoint = function (endpoint) {
            if (endpoint) {
                var studies = _.filter(service.studyList, function (study) {
                    return study.endpoint.url !== endpoint.url ? study : null;
                });
                service.studyList = studies;
            }
        };

        /**
         * Get list of searching targets in a study object. By default it should be only ontology object.
         * When ontology object contains metadata, it should include metadata object as searching target.
         * @memberof StudyListService
         * @param study - study
         * @returns {Array} - list of searching targets
         */
        var collectSearchTargetObjects = function (study) {
            var _objList = [];
            _objList.push(study._embedded.ontologyTerm);
            if (study._embedded.ontologyTerm.hasOwnProperty('metadata')) {
                _objList.push(study._embedded.ontologyTerm.metadata);
            }
            return _objList;
        };

        /**
         * Check if any search keywords are matched with searching target object's values.
         * @memberof StudyListService
         * @param obj - searching target object
         * @param searchKeywords - list of search keywords
         * @returns {boolean} - true if object contains keywords, false if otherwise
         */
        var containsSearchKeys = function (obj, searchKeywords, operator) {
            var isFound = false;
            var keyMap = [];
            var op = operator || 'OR';
            /**
             * Perform both partial and case insensitive matching
             * for string values and study object keys
             */
            _.forOwn(obj, function (v, k) { // iterate through object's properties
                var pair = [];

                // Only add string values of object's key and property to the search pair
                if (typeof v === 'string') {
                    pair.push(v);
                }
                if (typeof k === 'string') {
                    pair.push(k);
                }

	            /**
                 * Search through all the key value pairs of the study and where possible, attached metadata.
                 */
                _.each(pair, function (searchString) {
                    var idx = hasKeywordByIndex(searchString, searchKeywords);
                    _.each(idx, function(v, k){
                        if (v > -1) {
                            keyMap.push(k);
                            isFound = true;
                        }
                    });
                });

                if (isFound && op === 'OR') {
                    return false;
                }
            });

            if (isFound && op === 'AND') {
                return _.uniq(keyMap).length == searchKeywords.length;
            }

            return isFound && op === 'OR';
        };

        /**
         * Find the argumented string in one of the keywords
         * and return the index of first matched keyword element.
         * @memberof StudyListService
         * @param str - String to be searched for
         * @param keywords - Array of keywords to search in
         * @returns index {number}
         */
        var hasKeywordByIndex = function (str, keywords) {
            var s = {};
            _.each(keywords, function(k){
                if(str.match(new RegExp(k, 'i'))){
                    s[k] = 1;
                }
            });

            return s;
        };

        /**
         * Filter studies by search keywords
         * @memberof StudyListService
         * @param searchKeywords
         * @returns {Array} - studies which contains search keywords
         */
        service.showStudiesByKeys = function (searchKeywords, operator) {
            _.forEach(service.studyList, function (s) {
                _.forEach(collectSearchTargetObjects(s), function (_obj) {  // Iterate through
                                                                            // searching objects of a study
                    s.hide = !containsSearchKeys(_obj, searchKeywords, operator);   // Hide the study when it does not
                                                                                    // contain search keywords
                    if (!s.hide) return false; // Exit loop when it contains search keywords
                });
            });
        };

        return service;
    }]);

