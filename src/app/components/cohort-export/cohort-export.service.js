'use strict'

/**
 * @Service CohortExportMocks
 * @Description Service layer exposing mocks for cohort data exports
 */
angular.module('transmartBaseUi')
    .factory('CohortExportService', ['UtilityService', 'CohortSelectionService',
        function (UtilityService, CohortSelectionService) {
            var service = {};

            service.getConceptDataTypes = function () {
                var arr = [
                    {
                        name: 'data type A',
                        checked: true
                    },
                    {
                        name: 'data type B',
                        checked: true
                    },
                    {
                        name: 'data type C',
                        checked: true
                    }
                ];
                return arr;
            };

            service.getExportDataTypes = function () {
                var arr = [
                    'tsv',
                    'csv',
                    'png',
                    'pdf'
                ];
                return arr;
            };

            /**
             * Get the style sheets of document
             * @memberof CohortExportService
             * @returns {Stylesheet[]}
             */
            service.getDocumentStyles = function () {
                return document.styleSheets;
            };

            /**
             * Get the css styles in a string from a given element
             * @memberof CohortExportService
             * @param elm
             * @returns {string}
             */
            service.getElementStyles = function (elm) {

                var selectorTextArr = [];

                // Add Parent element Id and Classes to the list
                selectorTextArr.push('#' + elm.id);

                // Add Children element Ids and Classes to the list
                var nodes = elm.getElementsByTagName("*");
                for (var i = 0; i < nodes.length; i++) {
                    var id = nodes[i].id;
                    if (!UtilityService.contains('#' + id, selectorTextArr)) {
                        selectorTextArr.push('#' + id);
                    }

                    var classes = nodes[i].classList;
                    for (var c = 0; c < classes.length; c++) {
                        if (!UtilityService.contains('.' + classes[c], selectorTextArr)) {
                            selectorTextArr.push('.' + classes[c]);
                        }
                    }
                }

                // Extract CSS Rules
                var extractedCSSText = "";
                var docStyles = service.getDocumentStyles();
                for (var i = 0; i < docStyles.length; i++) {
                    var s = docStyles[i];

                    try {
                        if (!s.cssRules) continue;
                    } catch (e) {
                        if (e.name !== 'SecurityError') throw e; // for Firefox
                        continue;
                    }

                    var cssRules = s.cssRules;
                    for (var r = 0; r < cssRules.length; r++) {
                        var selectorText = cssRules[r].selectorText;
                        var selectors = selectorText ? selectorText.split(' ') : [];
                        var hasSelector = false;
                        selectors.forEach(function (selector) {
                            if (UtilityService.contains(selector, selectorTextArr)) {
                                hasSelector = true;
                            }
                        });
                        if (hasSelector) {
                            var cssText = cssRules[r].cssText;
                            if (cssText.includes('.dc-chart ')) {
                                cssText = cssText.substr(10, cssText.length - 1);
                            }
                            extractedCSSText += cssText;
                        }
                    }
                }

                return extractedCSSText;
            };


            /**
             * Get the SVG string given a chart label
             * @memberof CohortExportService
             * @param label
             * @returns {string}
             */
            service.getSVGString = function (label) {
                var chartPanel = angular.element('#cohort-chart-panel-' + label.labelId);
                var svgNode = angular.element(chartPanel.children()[1]).find('svg')[0];
                svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
                //
                // append css
                //
                var cssStyleText = service.getElementStyles(svgNode);
                var styleElement = document.createElement("style");
                styleElement.setAttribute("type", "text/css");
                styleElement.innerHTML = cssStyleText;
                var refNode = svgNode.hasChildNodes() ? svgNode.children[0] : null;
                svgNode.insertBefore(styleElement, refNode);
                //
                // if there is deselected components in this chart,
                // change the corresponding fill-color to grey #b8b8b8
                //
                var grey = '#b8b8b8';
                var deselectedElms = svgNode.querySelectorAll('.deselected');
                deselectedElms.forEach(function (e) {
                    if (e.hasAttribute('fill')) {
                        angular.element(e).attr('fill', grey);
                    }
                    else {
                        var children = angular.element(e).children();
                        _.forEach(children, function (child) {
                            if (child.hasAttribute('fill')) {
                                angular.element(child).attr('fill', grey);
                            }
                        });
                    }
                });
                //
                // serialize the svg string
                //
                var serializer = new XMLSerializer();
                var svgString = serializer.serializeToString(svgNode);
                // Fix root xlink without namespace
                svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink=');
                // Safari NS namespace fix
                svgString = svgString.replace(/NS\d+:href/g, 'xlink:href');

                return svgString;
            };

            /**
             * Get the size of a chart given a chart label
             * @memberof CohortExportService
             * @param label
             * @returns {Object}
             */
            service.getChartSize = function (label) {
                var charts = CohortSelectionService.getBox(label.boxId).ctrl.cs.charts;
                var chart = _.find(charts, {id: label.labelId});
                if (chart) {
                    return {
                        width: chart.width(),
                        height: chart.height()
                    }
                }
                else {
                    return undefined;
                }
            };

            /**
             * Export a chart to PNG
             * @memberof CohortExportService
             * @param label
             */
            service.exportChartPNG = function (label) {
                var svgString = service.getSVGString(label);
                var chartSize = service.getChartSize(label);
                var chartTitle = label.name + ' - ' + label.study._embedded.ontologyTerm.name;
                var ratio = chartSize.width / chartSize.height;
                var height = 1000, width = ratio * height;

                var imgsrc = 'data:image/svg+xml;base64,' +
                    btoa(decodeURIComponent(encodeURIComponent(svgString)));
                var canvas = document.createElement("canvas");
                var context = canvas.getContext("2d");
                canvas.width = width;
                canvas.height = height;

                var image = new Image;
                image.onload = function () {
                    service.exportChartPNGsave(canvas, context, image, chartTitle);
                };
                image.src = imgsrc;
            };

            /**
             * Image onload handler to save exported chart to PNG
             * @param canvas
             * @param context
             * @param chartTitle
             */
            service.exportChartPNGsave = function (canvas, context, image, chartTitle) {
                var width = canvas.width, height = canvas.height;
                context.clearRect(0, 0, width, height);
                context.drawImage(image, 0, 0, width, height);
                canvas.toBlob(function (dataBlob) {
                    saveAs(dataBlob, chartTitle)
                });
            };

            /**
             * Export a chart to SVG
             * @memberof CohortExportService
             * @param label
             */
            service.exportChartSVG = function (label) {
                var svgString = service.getSVGString(label);
                var chartTitle = label.name + ' - ' + label.study._embedded.ontologyTerm.name;
                var blob = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
                saveAs(blob, chartTitle + '.svg'); // FileSaver function
            };

            /**
             * Export a chart to PDF
             * @memberof CohortExportService
             * @param label
             */
            service.exportChartPDF = function (label) {
                //TODO: convert to vector graphics
                var svgString = service.getSVGString(label);
                var chartSize = service.getChartSize(label);
                var chartTitle = label.name + ' - ' + label.study._embedded.ontologyTerm.name;
                var ratio = chartSize.width / chartSize.height;
                var height = 1000, width = ratio * height;

                var imgsrc = 'data:image/svg+xml;base64,' +
                    btoa(decodeURIComponent(encodeURIComponent(svgString)));
                var canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                var context = canvas.getContext("2d");
                var image = new Image;
                image.onload = function () {
                    service.exportChartPDFsave(canvas, context, image, chartTitle);
                };
                image.src = imgsrc;
            };

            /**
             * Image onload handler to save exported chart to PDF
             * @param canvas
             * @param context
             * @param image
             * @param chartTitle
             */
            service.exportChartPDFsave = function (canvas, context, image, chartTitle) {
                var width = canvas.width, height = canvas.height;
                context.clearRect(0, 0, width, height);
                context.fillStyle = "#FFFFFF";
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.drawImage(image, 0, 0, width, height);
                var imgData = canvas.toDataURL('image/png');
                var doc = new jsPDF('landscape', 'pt', [width, height]);
                doc.addImage(imgData, 'PNG', 0, 0, width, height);
                doc.save(chartTitle + '.pdf');
            }

            /**
             * Given the target div, draw the workspace charts on a canvas
             * @param targetDiv
             * @param imgType
             */
            service.exportWorkspaceImage = function (targetDiv, imgType) {
                var boxId = targetDiv.id;
                var box = CohortSelectionService.getBox(boxId);
                if (box) {
                    var ctrl = box.ctrl,
                        cs = ctrl.cs,
                        labels = cs.cohortLabels,
                        genericSize = 1000,
                        gap = 100,
                        width = gap,
                        height = gap,
                        sizes = {};

                    var prev = {};
                    labels = _.sortBy(labels, ['row', 'col']);
                    labels.forEach(function (label) {
                        var key = label.labelId;
                        sizes[key] = {};
                        var _chartSize = service.getChartSize(label);
                        if (_chartSize) {
                            sizes[key].x = label.col * (genericSize + gap) + gap;
                            sizes[key].y = label.row * (genericSize + gap) + gap;

                            var ratio = _chartSize.width / _chartSize.height;
                            if (label.sizeX >= label.sizeY) {
                                sizes[key].h = genericSize * label.sizeY;
                                sizes[key].w = sizes[key].h * ratio;
                            }
                            else {
                                sizes[key].w = genericSize * label.sizeX;
                                sizes[key].h = sizes[key].w / ratio;
                            }

                            if (prev.row === label.row &&
                                prev.col < label.col &&
                                prev.right > sizes[key].x) {
                                sizes[key].x = prev.right;
                            }

                            var right = sizes[key].x + sizes[key].w + gap;
                            if (width < right) {
                                width = right;
                            }
                            var bottom = sizes[key].y + sizes[key].h + gap;
                            if (height < bottom) {
                                height = bottom;
                            }

                            prev.row = label.row;
                            prev.col = label.col;
                            prev.right = right;
                        }
                    });

                    var canvas = document.createElement("canvas"),
                        context = canvas.getContext("2d");
                    canvas.width = width;
                    canvas.height = height;
                    context.clearRect(0, 0, width, height);

                    labels.forEach(function (label) {
                        var title = label.name;
                        var key = label.labelId;
                        var svgString = service.getSVGString(label);
                        var imgsrc = 'data:image/svg+xml;base64,' +
                            btoa(decodeURIComponent(encodeURIComponent(svgString)));

                        var image = new Image;
                        image.onload = function () {
                            var x = sizes[key].x,
                                y = sizes[key].y,
                                w = sizes[key].w,
                                h = sizes[key].h;
                            context.strokeStyle = 'grey';
                            context.strokeRect(x, y, w, h);
                            context.drawImage(image, x, y, w, h);
                            context.font = "70px Georgia";
                            context.textAlign = "center";
                            context.fillText(title, x + w / 2, y - 30);
                            var args = {
                                canvas: canvas,
                                imageType: imgType
                            };
                            ctrl.$scope.$emit('canvasImageLoadedEvent', args);
                        };
                        image.src = imgsrc;
                    });

                }//if the box exists

            };


            return service;
        }]);
