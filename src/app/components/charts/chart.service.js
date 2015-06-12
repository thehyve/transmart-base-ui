'use strict';

angular.module('transmartBaseUi')

  .factory('ChartService',['Restangular', '$q', '$rootScope', '$timeout',
    function (Restangular, $q, $rootScope, $timeout) {

    var chartService = {};

    /**
     * Chart data constructor
     * @param idx
     * @param label
     * @param title
     * @param dataType
     * @param observations
     * @returns {{id: *, label: *, title: *, type: *, observations: *}}
     */
    var newChartData = function (idx, label, title, dataType, observations) {
      return {
        id: idx,
        label: label,
        title: title,
        type: dataType,
        observations: observations
      };
    };

    /**
     * Create dc.js bar chart
     * @param cDimension
     * @param cGroup
     * @param el
     * @private
     */
    var _barChart = function (cDimension, cGroup, el, min, max, nodeTitle, width) {

      width = width || 270;

      var _barChart = dc.barChart(el);
      _barChart
        .width(width)
        .height(200)
        .margins({top: 5, right: 5, bottom: 30, left: 25})
        .dimension(cDimension)
        .group(cGroup)
        .elasticY(true)
        .centerBar(true)
        .gap(1)
        .x(d3.scale.linear().domain([min, max]))
        .renderHorizontalGridLines(true)
      ;
      _barChart.xAxis().tickFormat(
        function (v) { return v; });
      _barChart.yAxis().ticks(5);
      _barChart.xAxisLabel(nodeTitle);
      _barChart.yAxisLabel('# subjects');

      return _barChart;
    };

    /**
     * Create dc.js pie chart
     * @param cDimension
     * @param cGroup
     * @param el
     * @returns {*}
     * @private
     */
    var _pieChart = function (cDimension, cGroup, el) {
      var tChart = dc.pieChart(el);

      tChart
        .width(270)
        .height(200)
        .innerRadius(0)
        .dimension(cDimension)
        .group(cGroup)
        .renderLabel(false)
        .legend(dc.legend());

     return tChart;
    };

    /**
     * To find element in array based on object's key:value
     * @param arr
     * @param propName
     * @param propValue
     * @returns {*}
     * @private
     */
    var _findElement = function (arr, propName, propValue) {
      for (var i=0; i < arr.length; i++) {
        if (arr[i][propName] === propValue) { return arr[i]; }
      }
      // will return undefined if not found; you could return a default instead
    };

    /**
     * Get the last token when requested model is a string path
     * @param what
     * @returns {*}
     * @private
     */
    var _getLastToken = function (what) {
      var _t = what.split('\\').slice(1);
      return what.indexOf('\\') === -1 ? what : _t[_t.length-2];
    };

    /**
     * get data type
     * @param val
     * @returns {string}
     * @private
     */
    var _getDataType = function (val) {
      var _type = typeof val;
      if (_type === 'string' || _type === 'number') {
        return _type;
      }
      return  'unknown';
    };

    /**
     * Group observations based on its labels
     * @param d
     * @returns {Array}
     * @private
     */
    var _createGroupBasedOnObservationsLabel = function (d) {
      var _d = [];

      d.forEach(function (o, idx) {
        var _x = _findElement(_d, 'label', o.label);
        //var _dataType = _getDataType(o.value);
        //console.log(_dataType);
        if (typeof _x === 'undefined') {
          _d.push(newChartData(idx, o.label, _getLastToken(o.label), _getDataType(o.value), [{value:o.value}]));
        } else {
          _x.observations.push({value : o.value});
        }
      });

      return _d;
    };


    var _createGroupBasedOnSubjectAttributes = function (d) {
      var _d = [],
        _keys=['trial', 'inTrialId', 'birthDate', 'deathDate', 'id'],
        _subjects = d._embedded.subjects;

      if (_subjects.length > 0) {

        angular.forEach(_subjects, function (subject) { // iterate through subjects
          var _idx = 0;
          angular.forEach(subject, function (value, key) { // iterate through subject properties

            var _x = _findElement(_d, 'label', key); // check if label is already existing
            var _dataType = _getDataType(subject[key]);

            // only for known data types and keys
            if (_dataType !== 'unknown' && (_keys.indexOf(key) === -1)) {
              if (typeof _x === 'undefined') { // create new data chart when key is not yet in the collection
                _d.push(newChartData(_idx, key, key, _dataType, [{value:subject[key]}]));
                _idx ++;
              } else { // otherwise add the data to the existing key
                _x.observations.push({value : subject[key]});
              }
            }

          }); //end forEach subject properties
        }); //end forEach subjects

      }
      return _d;
    };

    chartService.getObservations = function (node) {
      var _observationsList = [],
        _path = node.link.slice(1);

      var promise = new Promise( function (resolve, reject) {
        Restangular.all(_path + '/observations').getList()
          .then(function (d) {
            // create categorical or numerical dimension based on observation data
            _observationsList = _createGroupBasedOnObservationsLabel(d);
            resolve(_observationsList);
          }, function (err) {
            reject('Cannot get data from the end-point.' + err);
          });
      });

      return promise;
    };

    chartService.getSubjects = function (node) {
      var selectedStudy = {},
        studyLink = node._links.self.href.slice(1);

      var promise = new Promise( function (resolve, reject) {
        Restangular.one(studyLink + '/subjects').get()
          .then(function (d) {
            selectedStudy.subjects = d._embedded.subjects;
            selectedStudy.chartData = _createGroupBasedOnSubjectAttributes(d);
            resolve(selectedStudy);
          }, function (err) {
            reject('Cannot get subjects from the end-point.' + err);
          });
      }); //end Promise

      return promise;
    };

    chartService. generateCharts = function (nodes) {
      var _charts = [], _deferred = $q.defer(), idx = 0;

      angular.forEach(nodes, function (node) {
        var ndx = crossfilter(node.observations),
          tDimension = ndx.dimension(function(d) {return d.value;}),
          tGroup = tDimension.group();

        if (node.type === 'string') {
          _charts.push(_pieChart(tDimension, tGroup, '#chart_' + idx));
        } else if (node.type === 'number') {
          var _max = Math.max.apply(Math,node.observations.map(function(o){return o.value;})),
            _min = Math.min.apply(Math,node.observations.map(function(o){return o.value;}));
          _charts.push(_barChart(tDimension, tGroup, '#chart_' + idx, _min, _max, node.title));
        }

        idx++;

        if (idx === nodes.length) {
          _deferred.resolve(_charts);
        }
      });

      return _deferred.promise;

    };

    chartService.renderAll = function (charts) {
      angular.forEach (charts, function (chart) {
        chart.render();
      });
    };

    /*******************************************************************************************************************
     * Cohort chart service
     */
    var cohortState = {};

    /**
     * Reset the cohort chart service to initial state
     */
    chartService.reset = function (){
      cohortState = {
        subjects: [],
        chartId: 0,
        charts: [],
        data: {
          cross: null,
          dimensions: {},
          groups: {}
        },
        concepts: {
          labels: [],
          types: [],
          names: []
        }
      };
    };

    chartService.reset();

    /**
     * Add new label to list and check data type
     * @param label
     * @param value
     * @private
     */
    var _addLabel = function(label,value){
      if(cohortState.concepts.labels.indexOf(label) === -1) {
        cohortState.concepts.labels.push(label);
        cohortState.concepts.types.push(typeof value);
        cohortState.concepts.names.push(_getLastToken(label));
      }
    };

    /**
     * Fetch the data for the selected node
     * Add it to the current subject list
     * Recreate Crossfilter instance with all the new and old subjects
     * @param node
     * @returns {*}
     */
    chartService.addNodeToActiveCohortSelection = function (node) {
      var _deferred = $q.defer();
      var _path = node.link.slice(1);

      //Clear all existing chart containers
      $rootScope.$broadcast('prepareChartContainers', []);

      //Get all observations under the selected concept
      Restangular.all(_path + '/observations').getList().then(function (d) {
        var _found = false;
        // Group observation labels under common subject
        d.forEach(function(obs){
          _found = false;
          _addLabel(obs.label, obs.value);
          // Check if subject is already present
          cohortState.subjects.forEach(function(sub){
            if(sub.id === obs._embedded.subject.id){
              sub.labels[obs.label] = obs.value;
              _found = true;
              return;
            }
          });
          // If new subject, push to cohort selection
          if(!_found){
            var newSub = obs._embedded.subject;
            newSub.labels = {};
            newSub.labels[obs.label] = obs.value;
            cohortState.subjects.push(newSub);
          }
        });

        $rootScope.$broadcast('prepareChartContainers', cohortState.concepts.names);
        $timeout(function(){
            _populateCohortCrossfilter();
            _createCohortCharts();
            _deferred.resolve(cohortState.charts);
        });
      }, function (err) {
        //TODO: add alert
        _deferred.reject('Cannot get data from the end-point.' + err);
      });
      return _deferred.promise;
    };

    /**
     * Create the Crossfilter instance from the subject data
     * @private
     */
    var _populateCohortCrossfilter = function (){
      cohortState.data.cross = crossfilter(cohortState.subjects);
      //TODO: If already created, empty it instead, and readd with new and old data
    };

    /**
     * Create the charts for each selected label
     * TODO: Leave the existing charts in place, and only add the new ones
     * TODO: Enable removing specific charts
     * @private
     */
    var _createCohortCharts = function () {
      cohortState.chartId = 0;
      cohortState.charts = [];

      cohortState.concepts.labels.forEach(function(label, index){
        //Create dimension and grouping for the new label
        cohortState.data.dimensions[label] = cohortState.data.cross.dimension(function(d) {return d.labels[label];});
        cohortState.data.groups[label] = cohortState.data.dimensions[label].group();

        if(cohortState.concepts.types[index] === 'string'){
          cohortState.charts.push(_pieChart(cohortState.data.dimensions[label], cohortState.data.groups[label],
            '#cohort-chart-' + cohortState.chartId));
        }else if(cohortState.concepts.types[index] === 'number'){
          var max = cohortState.data.dimensions[label].top(1)[0].labels[label];
          var min = cohortState.data.dimensions[label].bottom(1)[0].labels[label];
          cohortState.charts.push(_barChart(cohortState.data.dimensions[label], cohortState.data.groups[label],
            '#cohort-chart-' + cohortState.chartId, min, max, cohortState.concepts.names[index]));
        }
        cohortState.chartId++;
      });
    };

    /**
     * Return the values for the current selection in cohort
     * @returns {{selected: (*|{returns the sum total of matching records, observes all dimension's filters}), total: *}}
     */
    chartService.getSelectionValues = function (){
      return {
        selected: cohortState.data.cross.groupAll().value(),
        total: cohortState.data.cross.size()
      };
    };

    /**
     * ChartService
     */
    return chartService;
  }]);