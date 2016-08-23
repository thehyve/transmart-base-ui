'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name DcChartsService
 */
angular.module('transmartBaseUi').factory('DcChartsService', [function () {

    var service = {};

    /**
     * Create dc.js bar chart
     * @memberof DcChartsService
     * @param cDimension
     * @param cGroup
     * @param el
     * @param opt
     */
    service.getBarChart = function (cDimension, cGroup, el, opt) {
        opt = opt || {};
        var _barChart = dc.barChart(el);

        _barChart
            .width(opt.width || 270)
            .height(opt.height || 210)
            .margins({top: 5, right: 5, bottom: opt.btmMarg || 30, left: 25})
            .dimension(cDimension)
            .group(cGroup)
            .elasticY(true)
            .elasticX(true)
            .xAxisPadding('10%')
            .yAxisPadding('10%')
            .centerBar(true)
            .gap(1)
            .x(d3.scale.linear())
            .renderHorizontalGridLines(true);

        if (opt.float) {
            _barChart
                .centerBar(false)
                .xUnits(dc.units.fp.precision(Math.pow(0.1, opt.precision)));
        } else {
            _barChart.xUnits();
        }
        _barChart.yAxis().ticks(5);
        _barChart.yAxisLabel('# subjects');

        return _barChart;
    };


    /**
     * Create dc.js box plot
     * @memberof DcChartsService
     */
    service.getBoxPlot = function (cDimension, cGroup, el, opt) {
        opt = opt || {};
        var _bp = dc.boxPlot(el);

        _bp
            .dimension(cDimension)
            .group(cGroup)
            .elasticX(true)
            .yAxisLabel(opt.yLab ? opt.yLab : '')
            .xAxisLabel(opt.xLab ? opt.xLab : '');

        if (opt.min !== undefined && opt.max !== undefined) {
            _bp.y(d3.scale.linear().domain([opt.min - 0.20 * opt.max, opt.max * 1.20]));
        } else {
            _bp.elasticY(true);
        }

        return _bp;
    };


    /**
     * Create dc.js pie chart
     * @memberof DcChartsService
     * @param cDimension
     * @param cGroup
     * @param el
     * @returns {*}
     * @private
     */
    service.getPieChart = function (cDimension, cGroup, el, opt) {
        opt = opt || {};
        var _pChart = dc.pieChart(el);

        _pChart
            .width(opt.size || 200)
            .height(opt.size || 200)
            .innerRadius(0)
            .dimension(cDimension)
            .group(cGroup)
            .renderLabel(false)
            .colors(d3.scale.category20c());

        if (!opt.nolegend) {
            _pChart.legend(dc.legend());
        }

        return _pChart;
    };


    /**
     * Create dc.js Scatter Plot
     * @memberof DcChartsService
     * @param cDimension
     * @param cGroup
     * @param el
     * @param opt
     * @private
     */
    service.getScatterPlot = function (cDimension, cGroup, el, opt) {
        var _chart = dc.scatterPlot(el);

        //Min and max for the x dimension
        if (opt.min !== undefined && opt.max !== undefined) {
            _chart.x(d3.scale.linear().domain(
                [opt.min - opt.max * 0.1, opt.max + opt.max * 0.05]
            ));
        } else {
            _chart.x(d3.scale.linear());
        }

        _chart
            .yAxisPadding('15%')
            .dimension(cDimension)
            .margins({top: 5, right: 5, bottom: 30, left: 30})
            .yAxisLabel(opt.yLab || '')
            .xAxisLabel(opt.xLab || '')
            .group(cGroup);

        return _chart;
    };

    /**
     * Create dc.js Heatmap
     * @memberof DcChartsService
     * @param cDimension
     * @param cGroup
     * @param el
     * @param opt
     */
    service.getHeatMap = function (cDimension, cGroup, el, opt) {
        var _chart = dc.heatMap(el);

        _chart
            .dimension(cDimension)
            .group(cGroup)
            .keyAccessor(function (d) {
                return d.key[0] ? d.key[0].slice(0, 3) + '..' : undefined;
            })
            .valueAccessor(function (d) {
                return d.key[1] ? d.key[1].slice(0, 3) + '..' : undefined;
            })
            .colorAccessor(function (d) {
                return d.value;
            })
            .margins({top: 5, right: 5, bottom: 40, left: 50})
            .title(function (d) {
                return opt.xLab + ':   ' + d.key[0] + '\n' +
                    opt.yLab + ':  ' + d.key[1] + '\n' +
                    'Count: ' + ( d.value) + ' ';
            })
            .colors(['#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8',
                '#253494', '#081d58'])
            .calculateColorDomain();

        return _chart;
    };

    /**
     * Render all
     * @memberof DcChartsService
     * @param {Array} charts
     */
    service.renderAll = function (charts) {
        angular.forEach(charts, function (chart) {
            if (!chart.rendered) {
                chart.render();
                chart.rendered = true;
            }
        });
    };

    // at the end ..
    return service;

}]);
