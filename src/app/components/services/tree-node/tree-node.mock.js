'use strict';
/**
 * @Service QueryBuilderMocks
 * @Description Service layer exposing a mock layer for QueryBuilder operations.
 */
angular.module('transmartBaseUi')
    .factory('TreeNodeMocks', ['ResourceService',
        function (ResourceService) {
            var mock = {};
            var _restangular = ResourceService.createResourceServiceByEndpoint({});

            mock.treenodeResponse = function() {
                return {
                    "name": "Endpoints",
                    "key": "\\\\Public Studies\\Public Studies\\GSE8581\\Endpoints\\",
                    "fullName": "\\Public Studies\\GSE8581\\Endpoints\\",
                    "type": "CATEGORICAL_OPTION",
                    "_links": {
                        "self": {
                            "href": "/studies/gse8581/concepts/Endpoints"
                        },
                        "observations": {
                            "href": "/studies/gse8581/concepts/Endpoints/observations"
                        },
                        "children": [
                            {
                                "href": "/studies/gse8581/concepts/Endpoints/Diagnosis",
                                "title": "Diagnosis"
                            },
                            {
                                "href": "/studies/gse8581/concepts/Endpoints/FEV1",
                                "title": "FEV1"
                            },
                            {
                                "href": "/studies/gse8581/concepts/Endpoints/Forced%20Expiratory%20Volume%20Ratio",
                                "title": "Forced Expiratory Volume Ratio"
                            }
                        ],
                        "parent": {
                            "href": "/studies/gse8581/concepts/ROOT"
                        }
                    }
                }
            };

            mock.subjects = function() {
                return {
                    "_links": {
                        "self": {
                            "href": "/studies/av_app_demo/subjects"
                        }
                    },
                    "_embedded": {
                        "subjects": [
                            {
                                "religion": null,
                                "maritalStatus": null,
                                "race": null,
                                "id": 1000430083,
                                "birthDate": null,
                                "age": null,
                                "deathDate": null,
                                "trial": "AV_APP_DEMO",
                                "inTrialId": "LN1",
                                "sex": "UNKOWN",
                                "_links": {
                                    "self": {
                                        "href": "/studies/av_app_demo/subjects/1000430083"
                                    }
                                }
                            },
                            {
                                "religion": null,
                                "maritalStatus": null,
                                "race": null,
                                "id": 1000430082,
                                "birthDate": null,
                                "age": null,
                                "deathDate": null,
                                "trial": "AV_APP_DEMO",
                                "inTrialId": "LN2",
                                "sex": "UNKOWN",
                                "_links": {
                                    "self": {
                                        "href": "/studies/av_app_demo/subjects/1000430082"
                                    }
                                }
                            }
                        ]
                    }
                };
            };

            mock.dummyNode = function() {
                return {
                    restObj: _restangular,
                    _links: {
                        children: []
                    },
                    _embedded: {
                        ontologyTerm: {
                            _links: {
                                children: []
                            }
                        }
                    },
                    nodes: []
                };
            };

            return mock;
        }
    ]);
