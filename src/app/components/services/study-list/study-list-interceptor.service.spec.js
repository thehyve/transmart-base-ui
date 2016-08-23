/**
 * Copyright (c) 2016 The Hyve B.V.
 * This code is licensed under the GNU General Public License,
 * version 3, or (at your option) any later version.
 */
'use strict';

describe('StudyListInterceptor', function () {
    var StudyListInterceptor;

    beforeEach(function () {
        module('transmartBaseUi');
    });

    beforeEach(inject(function (_StudyListInterceptor_) {
        StudyListInterceptor = _StudyListInterceptor_;
    }));

    describe('customResponseInterceptor', function () {
        var dummyStudiesMore = [
            {
                "hide": false,
                "id": "AV_APP_DEMO",
                "_links": {
                    "self": {
                        "href": "/studies/av_app_demo"
                    }
                },
                "endpoint": {
                    $hashKey: "object:44",
                    access_token: "d3bd7ed8-25b1-433b-b0d9-b882184a1f97",
                    expiresAt: 1466100674734,
                    expires_in: "29288",
                    isMaster: true,
                    isOAuth: true,
                    restangular: Object,
                    scope: "write read",
                    status: "active",
                    title: "transmart-gb",
                    token_type: "bearer",
                    url: "http://www.somewebsite.net/transmart"
                },
                "_embedded": {
                    "ontologyTerm": {
                        "name": "AV_APP_DEMO",
                        "key": "\\\\Public Studies\\Public Studies\\AV_APP_DEMO\\",
                        "fullName": "\\Public Studies\\AV_APP_DEMO\\",
                        "type": "STUDY",
                        "_links": {
                            "self": {
                                "href": "/studies/av_app_demo/concepts/ROOT"
                            },
                            "observations": {
                                "href": "/studies/av_app_demo/concepts/ROOT/observations"
                            },
                            "children": [
                                {
                                    "href": "/studies/av_app_demo/concepts/Biomarker%20Data",
                                    "title": "Biomarker Data"
                                },
                                {
                                    "href": "/studies/av_app_demo/concepts/Samples%20and%20Timepoints",
                                    "title": "Samples and Timepoints"
                                },
                                {
                                    "href": "/studies/av_app_demo/concepts/Subjects",
                                    "title": "Subjects"
                                }
                            ]
                        }
                    }
                }
            },
            {
                "id": "GSE19429",
                "hide": false,
                "_links": {
                    "self": {
                        "href": "/studies/gse19429"
                    }
                },
                "endpoint": {
                    $hashKey: "object:44",
                    access_token: "d3bd7ed8-25b1-433b-b0d9-b882184a1f97",
                    expiresAt: 1466100674734,
                    expires_in: "29288",
                    isMaster: true,
                    isOAuth: true,
                    restangular: Object,
                    scope: "write read",
                    status: "active",
                    title: "transmart-gb",
                    token_type: "bearer",
                    url: "http://transmart-gb.thehyve.net/transmart"
                },
                "_embedded": {
                    "ontologyTerm": {
                        "name": "GSE19429",
                        "key": "\\\\Other Studies\\Other Studies\\GSE19429\\",
                        "fullName": "\\Other Studies\\GSE19429\\",
                        "type": "STUDY",
                        "metadata": {
                            "TITLE": "Expression data from bone marrow CD34+ cells of MDS patients and healthy controls",
                            "ORGANISM": "Homo Sapiens",
                            "Citation": "Pellagatti A, Cazzola M, Giagounidis A, Perry J et al. Deregulated gene expression " +
                            "pathways in myelodysplastic syndrome hematopoietic stem cells. Leukemia 2010 Apr;24(4):756-64.",
                            "Citation URL": "http://www.ncbi.nlm.nih.gov/pubmed/20220779",
                            "Data location": "http://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE19429",
                            "Publication date": "March 13 2010",
                            "Full description": "183 patients with MDS patients and 17 healthy controls were included in the " +
                            "study. Bone marrow samples were obtained and CD34 cells isolated from MDS patients and healthy " +
                            "controls. Samples were hybridized to Affymetrix GeneChip Human Genome U133 Plus 2.0 arrays"
                        },
                        "_links": {
                            "self": {
                                "href": "/studies/gse19429/concepts/ROOT"
                            },
                            "observations": {
                                "href": "/studies/gse19429/concepts/ROOT/observations"
                            },
                            "children": [
                                {
                                    "href": "/studies/gse19429/concepts/Demographics",
                                    "title": "Demographics"
                                }
                            ]
                        }
                    }
                }
            },
            {
                "id": "GSE8581",
                "hide": false,
                "_links": {
                    "self": {
                        "href": "/studies/gse8581"
                    }
                },
                "endpoint": {
                    $hashKey: "object:44",
                    access_token: "d3bd7ed8-25b1-433b-b0d9-b882184a1f97",
                    expiresAt: 1466100674734,
                    expires_in: "29288",
                    isMaster: true,
                    isOAuth: true,
                    restangular: Object,
                    scope: "write read",
                    status: "active",
                    title: "transmart-gb",
                    token_type: "bearer",
                    url: "http://transmart-gb.thehyve.net/transmart"
                },
                "_embedded": {
                    "ontologyTerm": {
                        "name": "GSE8581",
                        "key": "\\\\Private Studies\\Private Studies\\GSE8581\\",
                        "fullName": "\\Private Studies\\GSE8581\\",
                        "type": "STUDY",
                        "metadata": {
                            "Status": "Public on May 31, 2008",
                            "TITLE": "Human Chronic Obstructive Pulmonary Disorder (COPD) Biomarker",
                            "Organism": "Homo sapiens",
                            "Title": "Human Chronic Obstructive Pulmonary Disorder (COPD) biomarker",
                            "Summary": "Chronic obstructive pulmonary disease (COPD) is an inflammatory lung disease with complex " +
                            "pathological features and largely unknown etiologies. Identification and validation of biomarkers " +
                            "for this disease could facilitate earlier diagnosis, appreciation of disease subtypes and/or " +
                            "determination of response to therapeutic intervention. To identify gene expression markers for COPD, " +
                            "we performed genome-wide expression profiling of lung tissue from 56 subjects using the Affymetrix " +
                            "U133 Plus 2.0 array. Lung function measurements from these subjects ranged from normal, un-obstructed " +
                            "to severely obstructed. Analysis of differential expression between cases (FEV1<70%, FEV1/FVC<0.7) " +
                            "and controls (FEV1>80%, FEV1/FVC>0.7) ...... A total of 31 probe sets were identified that showed " +
                            "evidence of significant correlation with quantitative traits and differential expression between " +
                            "cases and controls. Keywords: Disease state marker"
                        },
                        "_links": {
                            "self": {
                                "href": "/studies/gse8581/concepts/ROOT"
                            },
                            "observations": {
                                "href": "/studies/gse8581/concepts/ROOT/observations"
                            },
                            "children": [
                                {
                                    "href": "/studies/gse8581/concepts/Endpoints",
                                    "title": "Endpoints"
                                },
                                {
                                    "href": "/studies/gse8581/concepts/Subjects",
                                    "title": "Subjects"
                                }
                            ]
                        }
                    }
                }
            }
        ];

        it ('should give study type based on prefixes', function () {
            var _res = StudyListInterceptor.customResponseInterceptor(dummyStudiesMore, 'getList', 'studies'),
                _publicStudies = _.filter(_res, {type: 'public'}),
                _otherStudies = _.filter(_res, {type: 'other'}),
                _privateStudies = _.filter(_res, {type: 'private'});

            expect(_publicStudies.length).toEqual(1);
            expect(_privateStudies.length).toEqual(1);
            expect(_otherStudies.length).toEqual(1);

            _res.forEach(function (study) {
               expect(study.hide).toEqual(false);
               expect(study.isLoading).toEqual(false);
            });
        });

    });
});
