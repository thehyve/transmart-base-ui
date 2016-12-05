'use strict';

/**
 * Tree node management service
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name TreeNodeService
 */
angular.module('transmartBaseUi').factory('TreeNodeService', ['$q', function ($q) {

    var service = {};

    /**
     * Set attributes for a root node
     * @memberof TreeNodeService
     * @param rootNode
     * @returns {object} rootNode
     */
    service.setRootNodeAttributes = function (rootNode) {
        rootNode.restObj = rootNode;
        rootNode.loaded = false;
        rootNode.study = rootNode;
        rootNode.nodes = [];

        if (rootNode.hasOwnProperty('_links')) {
            rootNode._links.children =
                rootNode.hasOwnProperty('_embedded') ? rootNode._embedded.ontologyTerm._links.children : undefined;
            rootNode.isLoading = true;
        } else {
            rootNode.isLoading = false;
        }

        return rootNode;
    };

    /**
     * Get total subjects of a node.
     * @memberof TreeNodeService
     * @param node {object} - a tree node
     * @returns {Promise}
     */
    service.getTotalSubjects = function (node) {
        var deferred = $q.defer();
        // Counting total number of subjects in a node
        node.restObj.one('subjects').get().then(function (subjects) {
            deferred.resolve(subjects._embedded.subjects.length);
        }, function () {
            deferred.reject('Cannot count subjects');
        });
        return deferred.promise;
    };

    /**
     * Load a concept path (node)
     * @memberof TreeNodeService
     * @param node {object} - a tree node
     * @param link {object} - link of associated node
     * @param prefix {string} - string to be used as prefix in ajax call
     * @returns {Promise}
     */
    service.loadNode = function (node, link, prefix) {
        var deferred = $q.defer();

        var newNode = { // prepare the node skeleton
            title: link.title,
            nodes: [],
            loaded: false,
            study: node.study
        };

        var setErrorNode = function (node) {
            node.type = 'FAILED_CALL';
            node.total = '';
            node.loaded = true;
           return node;
        };

        var nodePromise = node.restObj.one(prefix + link.title);

        nodePromise.get()
            .then(function (childObj) {
                newNode.type = childObj.type ? childObj.type : 'UNDEF';
                newNode.restObj = childObj;
                if (newNode.type === 'CATEGORICAL_OPTION') {
                    node.type = 'CATEGORICAL_CONTAINER';
                    newNode.parent = node;
                }
            })
            .catch(function (e) {
                newNode.status = e.status;
                // reject error node
                deferred.reject(setErrorNode(newNode));
            })
            .finally(function () {
                node.loaded = true;
                // and also count how many subjects in this node
                if (newNode.type !== 'FAILED_CALL') {
                    service.getTotalSubjects(newNode).then(function (total) {
                        newNode.total = total;
                        deferred.resolve(newNode);
                    }).catch(function () {
                        // reject error node
                        deferred.reject(setErrorNode(newNode));
                    });
                }
            });

        return deferred.promise;
    };

    /**
     * @memberof TreeNodeService
     * @param node {Object} - tree node
     * @param prefix {String} - string to be used as prefix in ajax call
     * @returns {Promise}
     */
    service.getNodeChildren = function (node, prefix) {
        var _this = this,  childLinks, promises = [], deferred = $q.defer();
        prefix = prefix || '';

        if (node.loaded) {
            node.isLoading = false;
            deferred.resolve(node.nodes);
            return deferred.promise;
        }

        if (node.type === 'FAILED_CALL') {
            node.isLoading = false;
            deferred.reject('Error node');
            return deferred.promise;
        }

        childLinks = node.restObj._links.children; // check if it has child links

        if (childLinks) {
            promises =  _.map(childLinks, function (link) {
               return  _this.loadNode(node, link, prefix);
            });

            $q.all(promises)
                .then (function (loadedNodes) {
                    node.isLoading = false;
                    var _tmp = _.remove(loadedNodes, function (node) {
                        return node.type === 'FAILED' && node.status === 403;
                    });
                    node.nodes = loadedNodes;
                    deferred.resolve(loadedNodes);
                });
        } else {
            // end of node
            node.loaded = true;
            node.isLoading = false;
            deferred.resolve(node.nodes);
        }
        return deferred.promise;
    };

    /**
     * @memberof TreeNodeService
     * @param node
     * @returns boolean
     */
    service.isCategoricalLeafNode = function (node) {
        return node.type === 'CATEGORICAL_OPTION';
    };

    /**
     * @memberof TreeNodeService
     * @param node
     * @returns boolean
     */
    service.isCategoricalParentNode = function (node) {
        return node.type === 'CATEGORICAL_CONTAINER';
    };

    /**
     * @memberof TreeNodeService
     * @param node
     * @returns boolean
     */
    service.isNumericalNode = function (node) {
        return node.type === 'NUMERIC';
    };

    /**
     * @memberof TreeNodeService
     * @param node
     * @returns boolean
     */
    service.isHighDimensionalNode = function (node) {
        return node.type === 'HIGH_DIMENSIONAL';
    };

    /*
     * Populate node children
     * @memberof TreeNodeService
     * @param node
     * @returns {Promise}
     */
    service.populateChildren = function (node) {
        var prefix;

        // first check if node has Restangular object or not
        // if not it means it's root node a.k.a study
        if (!node.hasOwnProperty('restObj')) {
            node = service.setRootNodeAttributes(node);
        }

        // If the node is a study, we need to prepend 'concepts' to the url
        if (node == node.study) {
            prefix = 'concepts/';
        }

        node.isLoading = true;

        return service.getNodeChildren(node, prefix);
    };

    /**
     * Expands the specified node along the concept path.
     * @param node The node to be expanded
     * @param conceptSplit List of concept path elements to be expanded
     * @returns {Promise}
     */
    service.expandConcept = function(node, conceptSplit) {
        var _this = this, deferred = $q.defer();

        _this.populateChildren(node)
            .then(function (childNodes) {
                var matchedNode = _.find(childNodes, {title:conceptSplit[0]});
                if (matchedNode) {
                    if (conceptSplit.length > 1) {
                        _this.expandConcept(matchedNode, conceptSplit.slice(1)).then(function (childNodes) {
                            deferred.resolve(childNodes);
                        });
                    } else {
                        _this.populateChildren(matchedNode).then(function (childNodes) {
                            deferred.resolve(matchedNode);
                        });
                    }
                }
            });

        return deferred.promise;
    };

    return service;

}]);
