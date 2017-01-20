'user strict'

describe('CohortExportService', function () {
    var CohortExportService, CohortExportMocks, CohortSelectionService;

    beforeEach(function () {
        module('transmartBaseUi');
    });

    beforeEach(inject(function (_CohortExportService_, _CohortExportMocks_, _CohortSelectionService_) {
        CohortExportService = _CohortExportService_;
        CohortExportMocks = _CohortExportMocks_;
        CohortSelectionService = _CohortSelectionService_;
    }));

    describe('getConceptDataTypes', function () {
        it('should get non-empty array of data types', function () {
            var dataTypes = CohortExportService.getConceptDataTypes();
            expect(dataTypes.length).toBeGreaterThan(0);
        });
    });

    describe('getExportDataTypes', function () {
        it('should get non-empty array of export data types', function () {
            var exportDataTypes = CohortExportService.getExportDataTypes();
            expect(exportDataTypes.length).toBeGreaterThan(0);
        });
    });

    describe('getElementStyles', function () {
        var elm;
        beforeEach(function () {
            elm = CohortExportMocks.getChartSVGMock();
            spyOn(CohortExportService, 'getDocumentStyles').and.callFake(function () {
                return CohortExportMocks.getDocumentStylesMock();
            });

        });

        it('should parse the css styles of given element', function () {
            var extractedStyles = CohortExportService.getElementStyles(elm);
            var expectedStyles = '.pie-slice { fill: white; font-size: 12px; cursor: pointer; }.dc-legend {' +
                ' font-size: 11px; }';
            expect(CohortExportService.getDocumentStyles).toHaveBeenCalled();
            expect(extractedStyles).toBe(expectedStyles);
        });
    });

    describe('getDocumentStyles', function () {
        it('should return document style list', function () {
            var docStyles = CohortExportService.getDocumentStyles();
            var hasCssRules = 'cssRules' in docStyles[1];
            expect(docStyles.length).toBeGreaterThan(0);
            expect(hasCssRules).toBe(true);
        });
    });

    describe('getSVGString', function () {
        var elm, label, chartPanelId;
        beforeEach(function () {
            elm = CohortExportMocks.getChartSVGMock();
            label = CohortExportMocks.getChartLabelMock();
            chartPanelId = '#cohort-chart-panel-' + label.boxId + '-' +label.labelId;

            spyOn(angular, 'element').and.callFake(function (inputVar) {
                // to ensure that the correct chart panel is found
                if( typeof inputVar === 'string') {
                    if(inputVar === chartPanelId) {
                        return CohortExportMocks.getAngularElementMock(elm);
                    }
                    else {
                        return undefined;
                    }
                }
                else {
                    return CohortExportMocks.getAngularElementMock(elm);
                }
            });
            spyOn(CohortExportService, 'getElementStyles').and.callThrough();
        });

        it('should check node children and insert css', function () {
            spyOn(elm, 'hasChildNodes').and.callThrough();
            spyOn(elm, 'insertBefore').and.callThrough();
            spyOn(elm, 'removeChild');
            spyOn(elm, 'querySelectorAll').and.callThrough();
            CohortExportService.getSVGString(label);
            expect(elm.hasChildNodes).toHaveBeenCalled();
            expect(elm.insertBefore).toHaveBeenCalled();
            expect(elm.querySelectorAll).toHaveBeenCalled();
            expect(elm.removeChild).toHaveBeenCalled();
        });

        it('should also work when elm has no child node', function () {
            spyOn(elm, 'hasChildNodes').and.callFake(function () {
                return false;
            });
            CohortExportService.getSVGString(label);
            expect(elm.hasChildNodes).toHaveBeenCalled();
        });

        it('should check if an child node has the "fill" attribute', function () {
            var deselectedNode = elm.querySelectorAll()[0];
            spyOn(deselectedNode, 'hasAttribute').and.callFake(function () {
                return false;
            });
            CohortExportService.getSVGString(label);
            expect(deselectedNode.hasAttribute).toHaveBeenCalled();
        });
    });

    describe('exportChartPNG', function () {
        var label;
        beforeEach(function () {
            label = CohortExportMocks.getChartLabelMock();
            spyOn(CohortExportService, 'getSVGString').and.callFake(function () {
                return '';
            });
            spyOn(CohortExportService, 'getChartSize').and.callFake(function () {
                return {
                    width: 200,
                    height: 200
                };
            });
        });

        it('should invoke getSVGString, getChartSize, exportChartPNGsave and ' +
            'document-related function for PNG-export', function () {
            spyOn(document, 'createElement').and.callThrough();
            CohortExportService.exportChartPNG(label);
            expect(document.createElement).toHaveBeenCalled();
            expect(CohortExportService.getSVGString).toHaveBeenCalled();
            expect(CohortExportService.getChartSize).toHaveBeenCalled();
        });
    });

    describe('exportChartPNGsave', function () {
        var canvas, context;
        beforeEach(function () {
            canvas = {
                width: 200,
                height: 200,
                toBlob: function () {
                }
            };
            context = {
                clearRect: function () {
                },
                drawImage: function () {
                }
            };
        });

        it('should clear canvas, draw and save image', function () {
            spyOn(context, 'clearRect');
            spyOn(context, 'drawImage');
            spyOn(canvas, 'toBlob');
            CohortExportService.exportChartPNGsave(canvas, context, {}, '');
            expect(context.clearRect).toHaveBeenCalled();
            expect(context.drawImage).toHaveBeenCalled();
            expect(canvas.toBlob).toHaveBeenCalled();
        });
    });

    describe('exportChartSVG', function () {
        var label;
        beforeEach(function () {
            label = CohortExportMocks.getChartLabelMock();
            spyOn(CohortExportService, 'getSVGString').and.callFake(function () {
                return '';
            });
        });

        it('should invoke getSVGString', function () {
            spyOn(window, 'saveAs');
            CohortExportService.exportChartSVG(label);
            expect(CohortExportService.getSVGString).toHaveBeenCalled();
            expect(window.saveAs).toHaveBeenCalled();
        });
    });

    describe('exportChartPDF', function () {
        var label;
        beforeEach(function () {
            label = CohortExportMocks.getChartLabelMock();
            spyOn(CohortExportService, 'getSVGString').and.callFake(function () {
                return '';
            });
            spyOn(CohortExportService, 'getChartSize').and.callFake(function () {
                return {
                    width: 200,
                    height: 200
                };
            });
        });

        it('should invoke getSVGString, getChartSize and ' +
            'document-related function for PDF-export', function () {
            spyOn(document, 'createElement').and.callThrough();
            CohortExportService.exportChartPDF(label);
            expect(document.createElement).toHaveBeenCalled();
            expect(CohortExportService.getSVGString).toHaveBeenCalled();
            expect(CohortExportService.getChartSize).toHaveBeenCalled();
        });
    });

    describe('exportChartPDFsave', function () {
        var canvas, context, jspdf;
        beforeEach(function () {
            canvas = {
                width: 200,
                height: 200,
                toDataURL: function () {
                }
            };
            context = {
                clearRect: function () {
                },
                fillRect: function () {
                },
                drawImage: function () {
                }
            };

            spyOn(canvas, 'toDataURL').and.callFake(function () {
                return CohortExportMocks.getExampleImageDataURL();
            });

            jspdf = {
                addImage: function () {
                },
                save: function () {
                }
            };

            spyOn(window, 'jsPDF').and.callFake(function () {
                return jspdf;
            });

            spyOn(jspdf, 'addImage');
            spyOn(jspdf, 'save');
        });

        it('should clear canvas, draw and save background and image', function () {
            spyOn(context, 'clearRect');
            spyOn(context, 'fillRect');
            spyOn(context, 'drawImage');
            CohortExportService.exportChartPDFsave(canvas, context, {}, '');
            expect(context.clearRect).toHaveBeenCalled();
            expect(context.fillRect).toHaveBeenCalled();
            expect(context.drawImage).toHaveBeenCalled();
            expect(canvas.toDataURL).toHaveBeenCalled();
            expect(jspdf.addImage).toHaveBeenCalled();
            expect(jspdf.save).toHaveBeenCalled();
        });
    });

    describe('getChartSize', function () {
        it('should get chart size', function () {
            var label = {
                labelId: 1
            }
            var chart = {
                id: 1,
                width: function () {
                    return 200;
                },
                height: function () {
                    return 200;
                }
            };
            spyOn(CohortSelectionService, 'getBox').and.callFake(function () {
                return {
                    ctrl: {
                        cs: {
                            charts: [chart]
                        }
                    }
                }
            });

            var result = CohortExportService.getChartSize(label);
            expect(CohortSelectionService.getBox).toHaveBeenCalled();
            expect(result.width).toBe(200);
            expect(result.height).toBe(200);
        });

        it('should return undefined if chart is not found', function () {
            var label = {
                labelId: 1
            };
            var chart = {
                id: 2
            };
            spyOn(CohortSelectionService, 'getBox').and.callFake(function () {
                return {
                    ctrl: {
                        cs: {
                            charts: [chart]
                        }
                    }
                }
            });
            var result = CohortExportService.getChartSize(label);
            expect(CohortSelectionService.getBox).toHaveBeenCalled();
            expect(result).toBe(undefined);
        });
    });

    describe('exportWorkspaceImage', function () {
        var targetDiv, box, label;

        beforeEach(function () {
            targetDiv = {
                id: 'targetDivId'
            };
            label = {
                labelId: 'labelId1',
                col: 1,
                row: 0,
                sizeX: 1,
                sizeY: 1
            };
            box = {
                ctrl: {
                    cs: {
                        cohortLabels: [label]
                    },
                    $scope: {
                        $emit: function () {
                        }
                    }
                }
            };
            spyOn(CohortSelectionService, 'getBox').and.callFake(function () {
                return box;
            });
            spyOn(CohortExportService, 'getChartSize').and.callFake(function () {
                return {
                    width: 200,
                    height: 200
                }
            });
            spyOn(CohortExportService, 'getSVGString').and.callFake(function () {
                return CohortExportMocks.getExampleSVGString();
            });
            spyOn(box.ctrl.$scope, '$emit');
        });

        it('should draw and position charts on canvas', function () {
            CohortExportService.exportWorkspaceImage('');
            expect(CohortSelectionService.getBox).toHaveBeenCalled();
            expect(CohortExportService.getChartSize).toHaveBeenCalled();
            expect(CohortExportService.getSVGString).toHaveBeenCalled();
        });

        it('should deal with the case when label.sizeX < label.sizeY', function () {
            label.sizeX = 1; label.sizeY = 2;
            CohortExportService.exportWorkspaceImage('');
            expect(CohortSelectionService.getBox).toHaveBeenCalled();
            expect(CohortExportService.getChartSize).toHaveBeenCalled();
            expect(CohortExportService.getSVGString).toHaveBeenCalled();
        });

        it('should deal with multiple labels', function () {
            var label2 = {
                labelId: 'labelId2',
                col: 2,
                row: 0,
                sizeX: 1,
                sizeY: 1
            };
            box.ctrl.cs.cohortLabels.push(label2);

            CohortExportService.exportWorkspaceImage('');
            expect(CohortSelectionService.getBox).toHaveBeenCalled();
            expect(CohortExportService.getChartSize).toHaveBeenCalled();
            expect(CohortExportService.getSVGString).toHaveBeenCalled();
        });
    });

});
