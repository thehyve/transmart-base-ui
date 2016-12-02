'use strict'

/**
 * @Service CohortExportMocks
 * @Description Service layer exposing mocks for cohort data exports
 */
angular.module('transmartBaseUi')
    .factory('CohortExportService', ['UtilityService', function (UtilityService) {
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
         * Export a chart to PNG
         * @memberof CohortExportService
         * @param label
         */
        service.exportChartPNG = function (label) {
            var svgString = service.getSVGString(label);
            var chartTitle = label.name + ' - ' + label.study._embedded.ontologyTerm.name;
            var ratio = label.sizeY / label.sizeX;
            var width = 1000, height = ratio * width;

            var imgsrc = 'data:image/svg+xml;base64,' +
                btoa(decodeURIComponent(encodeURIComponent(svgString)));
            var canvas = document.createElement("canvas");
            var context = canvas.getContext("2d");
            canvas.width = width;
            canvas.height = height;

            var image = new Image;
            image.src = imgsrc;
            image.onload = function () {
                context.clearRect(0, 0, width, height);
                context.drawImage(image, 0, 0, width, height);
                canvas.toBlob(function (dataBlob) {
                    saveAs(dataBlob, chartTitle)
                });
            };
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
            saveAs(blob, chartTitle); // FileSaver function
        };

        /**
         * Export a chart to PDF
         * @memberof CohortExportService
         * @param label
         */
        service.exportChartPDF = function (label) {
            var svgString = service.getSVGString(label);
            var chartTitle = label.name + ' - ' + label.study._embedded.ontologyTerm.name;
            var ratio = label.sizeY / label.sizeX;
            var width = 1000, height = ratio * width;

            var imgsrc = 'data:image/svg+xml;base64,' +
                btoa(decodeURIComponent(encodeURIComponent(svgString)));
            var canvas = document.createElement("canvas");
            var context = canvas.getContext("2d");
            canvas.width = width;
            canvas.height = height;

            var image = new Image;
            image.src = imgsrc;
            image.onload = function () {
                context.clearRect(0, 0, width, height);
                context.drawImage(image, 0, 0, width, height);
                var imgData = canvas.toDataURL('image/png');
                var doc = new jsPDF('landscape', 'pt', [width, height]);
                doc.addImage(imgData, 'PNG', 0, 0, width, height);
                doc.save(chartTitle + '.pdf');
            };
        };

        return service;
    }]);
