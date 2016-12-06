'use strict';

/**
 * Mainly for DC SVG chart creation/manipulation
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name DcChartsService
 */
angular.module('transmartBaseUi')
    .factory('DcChartsService', ['UtilityService', function (UtilityService) {

        var service = {};

        var _CONF = {
            WIDTH: 180, //Default width of a chart
            HEIGHT: 180, //Default height of a chart
            RAD: 0.9, // Percentage to adjust the radius of the chart
            LEG_H: 0.05,// Percentage to adjust legend position in Y
            LEG_W: 0, // Percentage to adjust legend position in X
            LEG_S: 0.03, // Legend size percentage of chart
            LEG_B: 4, // Legend size base in px
            LEG_G: 0.02, // Legend gap in percentage of chart height
            MIN_S: 180, //Default width or height
            TICK_X: 30, // Pixels per tick in x
            TICK_Y: 30, // Pixels per tick in y
            SLICE: 20, // Pixels per slice for pie charts
            SP_DOT_SIZE: 4, // Pixels per width / height
            BP_PIXELS_PER_GROUP: 110,
            HM_LEFT_MARGIN: 30,
            HM_Y_LABELS_PIXELS: 10,
            TRANSITION_DURATION: 500
        };

        /**
         * @memberof DcChartsService
         * @param _chart
         */
        service.resizeChart = function (_chart) {

            var widthOffset = 50,
                heightOffset = (_chart.type === 'BARCHART') ? 80 : 60;
            var width = (_chart.gridInfo.sizeX * _chart.gridInfo.curColWidth) - widthOffset;
            var height = (_chart.gridInfo.sizeY * _chart.gridInfo.curRowHeight) - heightOffset;

            if (width > 0 &&
                height > 0 &&
                isFinite(width) &&
                isFinite(height)
            ) {
                _CONF.WIDTH = width;
                _CONF.HEIGHT = height;
                _CONF.MIN_S = (_CONF.WIDTH > _CONF.HEIGHT ? _CONF.HEIGHT : _CONF.WIDTH); // Smallest of width or height
                _CONF.HM_LEFT_MARGIN = _CONF.WIDTH / 6;

                // Adjust width and height
                _chart.width(_CONF.WIDTH).height(_CONF.HEIGHT);

                // If the chart has a radius (ie. pie chart)
                if (_chart.type === 'PIECHART') {
                    //  set the radius to half the shortest dimension
                    _chart.radius((_CONF.MIN_S) / 2 * _CONF.RAD)
                        // Limit the number of slices in the chart
                        .slicesCap(Math.floor(_CONF.MIN_S / _CONF.SLICE));

                    if (!_chart._opt.nolegend) {
                        _chart.legend(dc.legend()
                            .x(_CONF.WIDTH * _CONF.LEG_W)
                            .y(_CONF.HEIGHT * _CONF.LEG_H)
                            .itemHeight(_CONF.LEG_B + _CONF.LEG_S * _CONF.MIN_S)
                            .gap(_CONF.MIN_S * _CONF.LEG_G));
                        // .legendText(function(d) { return d.name + ' (' + d.data + ')'; }));
                    }
                    _chart.redraw();

                } else if (_chart.type === 'BARCHART') {
                    // Adjust number of ticks to not overlap
                    // Number of ticks per pixel
                    _chart.xAxis().ticks(Math.floor(_CONF.WIDTH / _CONF.TICK_X));
                    _chart.yAxis().ticks(Math.floor(_CONF.HEIGHT / _CONF.TICK_Y));
                    _chart.rescale();
                    _chart.redraw();

                } else if (_chart.type === 'BOXPLOT') {
                    _chart.margins({top: 5, right: 5, bottom: 45, left: 40});

                    if (_chart.group().all().length > _CONF.WIDTH / _CONF.BP_PIXELS_PER_GROUP) {
                        _chart.xAxis().tickValues([]);
                        _chart.yAxis().ticks(3);
                    } else {
                        _chart.yAxis().ticks(Math.floor(_CONF.HEIGHT / _CONF.TICK_Y));
                        _chart.xAxis().tickValues(null);
                    }
                    _chart.render();

                } else if (_chart.type === 'HEATMAP') {
                    _chart
                        .keyAccessor(function (d) {
                            return d.key[0] ? d.key[0].slice(0, Math.floor(_CONF.WIDTH / 80)) : undefined;
                        })
                        .valueAccessor(function (d) {
                            return d.key[1] ? d.key[1].slice(0, Math.floor(_CONF.WIDTH / 50)) : undefined;
                        })
                        .colorAccessor(function (d) {
                            return d.value;
                        })
                        .margins({top: 5, right: 5, bottom: 40, left: _CONF.HM_LEFT_MARGIN});
                    _chart.redraw();

                } else if (_chart.type === 'SCATTER') {
                    // Adjust number of ticks to not overlap
                    // Number of ticks per pixel
                    _chart.xAxis().ticks(Math.floor(_CONF.WIDTH / _CONF.TICK_X));
                    _chart.yAxis().ticks(Math.floor(_CONF.HEIGHT / _CONF.TICK_Y));
                    // Adjust the size of the dots
                    _chart.symbolSize(_CONF.SP_DOT_SIZE);
                    _chart.rescale();
                    _chart.redraw();
                }

            }//if width and height are both > 0
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
                .renderLabel(false).legend(dc.legend())
                .transitionDuration(_CONF.TRANSITION_DURATION)
                .colors(d3.scale.category20());

            _pChart._opt = opt;

            return _pChart;
        };

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
                .transitionDuration(_CONF.TRANSITION_DURATION)
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
                .elasticY(true)
                .transitionDuration(_CONF.TRANSITION_DURATION)
                .yAxisLabel(opt.yLab ? opt.yLab : '')
                .xAxisLabel(opt.xLab ? opt.xLab : '')
                .colors(d3.scale.category20());

            if (opt.min !== undefined && opt.max !== undefined) {
                _bp.y(d3.scale.linear().domain([opt.min - 0.20 * opt.max, opt.max * 1.20]));
            }

            return _bp;
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
                .transitionDuration(_CONF.TRANSITION_DURATION)
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
                .transitionDuration(_CONF.TRANSITION_DURATION)
                .calculateColorDomain();

            return _chart;
        };

        /**
         * create dc.js number display
         * @param label
         * @param cGroup
         * @param el
         * @returns {dc.dataCount|dc.numberDisplay}
         */
        service.getNumDisplay = function (label, cGroup, el) {

            cGroup.reduce(
                function (p, v) {
                    return v.observations[label.conceptPath] ? p + 1 : p;
                },
                function (p, v) {
                    return v.observations[label.conceptPath] ? p - 1 : p;
                },
                function () {
                    return 0;
                }
            );

            return dc.numberDisplay(el)
                .group(cGroup)
                .html({
                    one: '%number',
                    some: '%number',
                    none: '%number'
                })
                .formatNumber(d3.format('.0'));
        };

        /**
         * Emphasize pie chart legends when the corresponding slices are selected
         * @memberof DcChartsService
         * @param chart
         * @param el
         */
        service.emphasizeChartLegend = function (chart) {
            var filters = chart.tsLabel.filters;
            var gs = angular.element(chart.el).find('g');
            var items = [];
            _.forEach(gs, function (g) {
                if (angular.element(g).hasClass('dc-legend-item')) {
                    var item = angular.element(g).find('text');
                    if (filters
                        && filters.length < chart.data().length
                        && filters.indexOf(item.text()) !== -1) {
                        item.addClass('pie-legend-bold');
                        items.push(item);
                    }
                    else {
                        item.addClass('pie-legend-normal');
                    }
                }
            });
            return items;
        };

        // at the end ..
        return service;

    }]);
