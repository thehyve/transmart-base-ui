'user strict'

describe('CohortExportService', function () {
    var CohortExportService, CohortExportMocks;

    beforeEach(function () {
        module('transmartBaseUi');
    });

    beforeEach(inject(function (_CohortExportService_, _CohortExportMocks_) {
        CohortExportService = _CohortExportService_;
        CohortExportMocks = _CohortExportMocks_;
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
        var elm, label;
        beforeEach(function () {
            elm = CohortExportMocks.getChartSVGMock();
            label = CohortExportMocks.getChartLabelMock();
            spyOn(angular, 'element').and.callFake(function () {
                return CohortExportMocks.getAngularElementMock(elm);
            });
            spyOn(CohortExportService, 'getElementStyles').and.callThrough();
        });

        it('should check node children and insert css', function () {
            spyOn(elm, 'hasChildNodes').and.callThrough();
            spyOn(elm, 'insertBefore').and.callThrough();
            spyOn(elm, 'querySelectorAll').and.callThrough();
            CohortExportService.getSVGString(label);
            expect(elm.hasChildNodes).toHaveBeenCalled();
            expect(elm.insertBefore).toHaveBeenCalled();
            expect(elm.querySelectorAll).toHaveBeenCalled();
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
        });

        it('should invoke getSVGString and document-related function', function () {
            spyOn(document, 'createElement').and.callThrough();
            CohortExportService.exportChartPNG(label);
            expect(document.createElement).toHaveBeenCalled();
            expect(CohortExportService.getSVGString).toHaveBeenCalled();

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
        });

        it('should invoke getSVGString and document-related function', function () {
            spyOn(document, 'createElement').and.callThrough();
            CohortExportService.exportChartPDF(label);
            expect(document.createElement).toHaveBeenCalled();
            expect(CohortExportService.getSVGString).toHaveBeenCalled();

        });
    });
});
