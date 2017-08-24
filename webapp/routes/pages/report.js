var _ = require('underscore');
var util = require('util');
var validator = require('validator');
var fs = require('fs');
var batam_util = require('../../util/util.js');
var config = require('../../config.js');
var mkdirp = require('mkdirp');
var excelbuilder = require('excel4node');
var fsextra = require('fs-extra'); //copy folders recursively
var replaceall = require("replaceall"); //replacing the characters in string
var extract = require('extract-zip'); //extract zip to a particular folder
var http = require('http');
var path = require("path"); //path is used to get the absolute path of folder
var recursiveReadSync = require('recursive-readdir-sync'); //read the files recursively in folder
var request = require('request'); //to check the server status
var archiver = require('archiver'); //archieve the files
/**
 * PAGE path /:build_id/report/:report_id
 */
exports.show = showReport;

function showReport(req, res, next) {
    var findBuild = function(error, build) {
        var findReport = function(error, report) {
            var buildID = build.id;
            //Handle Error.
            if (error) {
                return next(error);
            }
            if (!_.isNull(report)) {
                res.render('build/report/view', {
                    build_id: build.id,
                    build_name: build.name,
                    report_id: report.id
                });
            } else {
                return next('Report ' + req.params.report_id + ' for build ' + req.params.build_id + ' not found.');
            }
        };
        //Handle Error.
        if (error) {
            return next(error);
        }
        if (_.isNull(build)) {
            return next('Build ' + req.params.build_id + ' not found.');
        }
        req.collections.reports.findOne({
            id: req.params.report_id
        }, findReport);
    };
    //Validate inputs.
    if (!req.params.build_id || !req.params.report_id) {
        return next(new Error('No build_id or report_id params in url.'));
    }
    //if(validator.isNull(req.params.build_id) || !validator.isLength(req.params.build_id, 5, 30) || !validator.matches(req.params.build_id, '[0-9a-zA-Z_-]+')){
    if (validator.isNull(req.params.build_id) || !validator.matches(req.params.build_id, '[0-9a-zA-Z_-]+')) {
        return next(new Error('build_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
    }
    //if(validator.isNull(req.params.report_id) || !validator.isLength(req.params.report_id, 5, 60) || !validator.matches(req.params.report_id, '[0-9a-zA-Z_-]+')){
    if (validator.isNull(req.params.report_id) || !validator.matches(req.params.report_id, '[0-9a-zA-Z_-]+')) {
        return next(new Error('report_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
    }
    //Check if the report exist
    buildID = req.params.build_id;
    req.collections.builds.findOne({
        id: req.params.build_id
    }, findBuild);
}
exports.download = function(req, res, next) {
    getImagesFromScreenshotsServer(req, res, next, function() {
        prepareExcelFile(req, res, next);
    });
}
var prepareExcelFile = function(req, res, next) {
    var archive;
    archive = archiver('zip', {
        store: true
    });
    var headerTextStyle = {
        bold: true
    };
    var cellBorder = {
        left: {
            style: 'thin'
        },
        top: {
            style: 'thin'
        },
        right: {
            style: 'thin'
        },
        bottom: {
            style: 'thin'
        }
    };
    var redFont = {
        fgColor: 'FFFF0000',
        type: 'none'
    };
    var tempPath;
    var files;
    var summaryDisplayConfig = config.reports.report.display.summary;
    var testDisplayConfig = config.reports.report.display.test;
    var screenshotBasePath = config.screenshotsLocation;
    var screenshotUrl = config.screenshotUrl;
    var indexColumn = 1;
    var indexRow = 1;
    var maxRow = 0;
    var maxTestRow = 0;
    var firstBodyRow = 0;
    var inputVisibile = false;
    var expectedVisible = false;
    var statusVisible = false;
    var outputVisible = false;
    var durationVisible = false;
    var errorVisible = false;
    var takeScreenShot = "No";
    var executed_by = "ATS";
    var workbook;
    var findTestCriterias = function(error, criterias) {
        var findTests = function(error, tests) {
            var fetchReport = function(error, report) {
                //Handle Error.
                if (error) {
                    return next(error);
                }
                mkdirp('./' + report.name + '-Report', function(err) {
                    tempPath = './' + report.name + '-Report';
                    // Create a new workbook file in current working-path
                    workbook = new excelbuilder.Workbook();
                    redFont = workbook.createStyle({
                        font: {
                            color: '#FF0000',
                            size: 11,
                            type: 'none'
                        }
                    });
                    maxRow += (_.isEqual(summaryDisplayConfig.name, true) ? 1 : 0);
                    maxRow += (_.isEqual(summaryDisplayConfig.description, true) ? 1 : 0);
                    maxRow += (_.isEqual(summaryDisplayConfig.start_date, true) ? 1 : 0);
                    maxRow += (_.isEqual(summaryDisplayConfig.end_date, true) ? 1 : 0);
                    maxRow += (_.isEqual(summaryDisplayConfig.status, true) ? 1 : 0);
                    maxRow += (_.isEqual(summaryDisplayConfig.duration, true) ? 1 : 0);
                    maxRow += (_.isEqual(summaryDisplayConfig.total, true) ? 1 : 0);
                    maxRow += (_.isEqual(summaryDisplayConfig.passes, true) ? 1 : 0);
                    maxRow += (_.isEqual(summaryDisplayConfig.failures, true) ? 1 : 0);
                    maxRow += (_.isEqual(summaryDisplayConfig.errors, true) ? 1 : 0);
                    maxTestRow += (_.isEqual(testDisplayConfig.moduleName, true) ? 1 : 0);
                    maxTestRow += (_.isEqual(testDisplayConfig.authoredBy, true) ? 1 : 0);
                    maxTestRow += (_.isEqual(testDisplayConfig.name, true) ? 1 : 0);
                    maxTestRow += (_.isEqual(testDisplayConfig.dateCreated, true) ? 1 : 0);
                    maxTestRow += (_.isEqual(testDisplayConfig.description, true) ? 1 : 0);
                    maxTestRow += (_.isEqual(testDisplayConfig.approvalStatus, true) ? 1 : 0);
                    maxTestRow += (_.isEqual(testDisplayConfig.prerequisites, true) ? 1 : 0);
                    maxTestRow += (_.isEqual(testDisplayConfig.approvedBy, true) ? 1 : 0);
                    maxTestRow += (_.isEqual(testDisplayConfig.executed_by, true) ? 1 : 0);
                    maxTestRow += (_.isEqual(testDisplayConfig.approval_date, true) ? 1 : 0);
                    maxTestRow += (_.isEqual(testDisplayConfig.start_date, true) ? 1 : 0);
                    maxTestRow += (_.isEqual(testDisplayConfig.signature, true) ? 1 : 0);
                    maxTestRow += (_.isEqual(testDisplayConfig.end_date, true) ? 1 : 0);
                    maxTestRow += (_.isEqual(testDisplayConfig.numberOfAttachments, true) ? 1 : 0);
                    maxTestRow += (_.isEqual(testDisplayConfig.duration, true) ? 1 : 0);
                    maxTestRow += (_.isEqual(testDisplayConfig.comments, true) ? 1 : 0);
                    maxTestRow += (_.isEqual(testDisplayConfig.status, true) ? 1 : 0);
                    maxTestRow += (_.isEqual(testDisplayConfig.tags, true) ? 1 : 0);
                    maxTestRow += (_.isEqual(testDisplayConfig.log, true) ? 1 : 0);
                    var customFormat = report.customFormat;
                    if (!report.isCustomFormatEnabled) {
                        createStandardFormatSummarySheet(workbook);
                    } else {
                        if (!_.isUndefined(customFormat) && !_.isNull(customFormat)) {
                            if (customFormat == 'PERFORMANCE_FORMAT') {
                                createPerfFormatSummarySheet(workbook);
                            }
                        } else {
                            console.log('isCustomFormatEnabled is set to true and Custom Format is not provided');
                        }
                    }
                    //Populate the data array with tests found.
                    for (var i = 0; i < tests.length; i++) {
                        //createSheet for every Test
                        indexRow = 1;
                        indexColumn = 1;
                        // Create a new worksheet with 10 columns and 14 rows (+ step rows)
                        var stepsCount = tests[i].steps != null ? tests[i].steps.length : 0;
                        var sheet = workbook.addWorksheet((tests[i].name.substring(0, 29)), 8, maxTestRow + 1 + stepsCount + 3);
                        sheet = writeTestCommonData(sheet, tests[i]);
                        sheet = writeTestAuthoredData(sheet, tests[i]);
                        sheet = createTestTableHeader(sheet, tests[i]);
                        sheet = populateTestTableData(sheet, tests[i]);
                        if (tests[i].steps != null && !_.isUndefined(tests[i].steps)) {
                            sheet.cell(firstBodyRow + tests[i].steps.length + 2, 1)
                                .string('Logs');
                            sheet.cell(firstBodyRow + tests[i].steps.length + 2, 1)
                                .style({
                                    alignment: {
                                        vertical: 'top'
                                    }
                                });
                            sheet.cell(firstBodyRow + tests[i].steps.length + 2, 1)
                                .style({
                                    font: headerTextStyle
                                });
                            sheet.cell(firstBodyRow + tests[i].steps.length + 2, 2)
                                .style({
                                    alignment: {
                                        wrapText: true
                                    }
                                });
                            sheet.cell(firstBodyRow + tests[i].steps.length + 2, 2, firstBodyRow + tests[i].steps.length + 2, 5, true)
                                .string(tests[i].log);
                            sheet.cell(firstBodyRow + tests[i].steps.length + 2, 2)
                                .style({
                                    alignment: {
                                        vertical: 'top'
                                    }
                                });
                            sheet.row(firstBodyRow + tests[i].steps.length + 2)
                                .setHeight(50);
                        }
                    }
                    // Save it
                    workbook.write('./' + report.name + '-Report/' + report.name + '.xlsx', function() {
                        // Create a new folder under ./'+ report.name + '-Report with name as report name
                        var buildID = req.params.build_id;
                        if (fs.existsSync(screenshotBasePath + '/' + buildID)) {
                            fs.mkdirSync('./' + report.name + '-Report/' + report.name);
                            fsextra.copySync(screenshotBasePath + '/' + buildID + '/' + report.name, './' + report.name + '-Report/' + report.name);
                        }
                        // zip this ./'+ report.name + '-Report folder
                        // send the zip file.
                        var output = fs.createWriteStream('../' + report.name + '.zip');
                        var archive = archiver('zip');
                        output.on('close', function() {
                            var file = fs.readFileSync('../' + report.name + '.zip', 'binary');
                            res.setHeader('Content-disposition', 'attachment; filename=' + report.name + '.zip');
                            res.setHeader('Content-Length', file.length);
                            res.write(file, 'binary');
                            fs.unlinkSync('./' + report.name + '-Report/' + report.name + '.xlsx');
                            res.end();
                            deleteFolderRecursive(tempPath);
                        });
                        archive.on('error', function(err) {
                            throw err;
                        });
                        archive.pipe(output);
                        archive.directory(report.name + '-Report/')
                        archive.finalize();
                    });
                });
                var writePerformanceFormatHeader = function(worksheet) {
                    var headings = Object.keys(JSON.parse(tests[0].customEntry));
                    if (headings) {
                        for (var i = 0; i < headings.length + 1; i++) {
                            if (!_.isUndefined(headings[i]) && !_.isNull(headings[i])) {
                                worksheet.cell(indexRow, indexColumn)
                                    .string(headings[i]);
                                worksheet.cell(indexRow, indexColumn)
                                    .style({
                                        font: headerTextStyle
                                    });
                                worksheet.cell(indexRow, indexColumn)
                                    .style({
                                        border: cellBorder
                                    });
                                indexColumn++
                            }
                        }
                    }
                    indexRow++;
                    return worksheet;
                }
                var writeStandardTemplateHeader = function(summarySheet) {
                    if (_.isEqual(summaryDisplayConfig.columns.order, true)) {
                        summarySheet.cell(indexRow, indexColumn)
                            .string('Test Case Id');
                        summarySheet.cell(indexRow, indexColumn)
                            .style({
                                font: headerTextStyle
                            });
                        summarySheet.cell(indexRow, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        indexColumn++;
                    }
                    if (_.isEqual(summaryDisplayConfig.columns.name, true)) {
                        summarySheet.cell(indexRow, indexColumn)
                            .string('Test Name');
                        summarySheet.cell(indexRow, indexColumn)
                            .style({
                                font: headerTextStyle
                            });
                        summarySheet.cell(indexRow, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        indexColumn++;
                    }
                    if (_.isEqual(summaryDisplayConfig.columns.status, true)) {
                        summarySheet.cell(indexRow, indexColumn)
                            .string('Status');
                        summarySheet.cell(indexRow, indexColumn)
                            .style({
                                font: headerTextStyle
                            });
                        summarySheet.cell(indexRow, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        indexColumn++;
                    }
                    if (_.isEqual(summaryDisplayConfig.columns.duration, true)) {
                        summarySheet.cell(indexRow, indexColumn)
                            .string('Duration');
                        summarySheet.cell(indexRow, indexColumn)
                            .style({
                                font: headerTextStyle
                            });
                        summarySheet.cell(indexRow, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        indexColumn++
                    }
                    indexRow++;
                    return summarySheet;
                }
                var writeStandardTableData = function(summarySheet) {
                    for (var i = 0; i < tests.length; i++) {
                        indexColumn = 1;
                        if (_.isEqual(summaryDisplayConfig.columns.order, true)) {
                            summarySheet.cell(indexRow + i, 1)
                                .string(tests[i].name);
                            summarySheet.cell(indexRow + i, 1)
                                .style({
                                    border: cellBorder
                                });
                            indexColumn++;
                        }
                        if (_.isEqual(summaryDisplayConfig.columns.name, true)) {
                            var testName = tests[i].name;
                            if (tests[i].description != null) {
                                testName += ' - ' + tests[i].description;
                            }
                            summarySheet.cell(indexRow + i, indexColumn)
                                .string(tests[i].description);
                            summarySheet.cell(indexRow + i, indexColumn)
                                .style({
                                    border: cellBorder
                                });
                            summarySheet.cell(indexRow + i, indexColumn)
                                .style({
                                    alignment: {
                                        wrapText: true
                                    }
                                });
                            indexColumn++;
                        }
                        if (_.isEqual(summaryDisplayConfig.columns.status, true)) {
                            summarySheet.cell(indexRow + i, indexColumn)
                                .string(tests[i].status != null ? tests[i].status.capitalize() : tests[i].status);
                            if (tests[i].status != null && tests[i].status.toLowerCase() != 'pass') {
                                //summarySheet.fill(indexColumn, indexRow + i, redFont);
                                summarySheet.cell(indexRow + i, indexColumn)
                                    .style(redFont);
                            }
                            summarySheet.cell(indexRow + i, indexColumn)
                                .style({
                                    alignment: {
                                        vertical: 'top'
                                    }
                                });
                            summarySheet.cell(indexRow + i, indexColumn)
                                .style({
                                    border: cellBorder
                                });
                            indexColumn++;
                        }
                        if (_.isEqual(summaryDisplayConfig.columns.status, true)) {
                            summarySheet.cell(indexRow + i, indexColumn)
                                .string(batam_util.durationToStr(tests[i].duration.value));
                            summarySheet.cell(indexRow + i, indexColumn)
                                .style({
                                    border: cellBorder
                                });
                            indexColumn++;
                        }
                    }
                    indexRow++;
                    return summarySheet;
                }
                var writePerformanceFormatTableData = function(worksheet) {
                    for (var i = 0; i < tests.length; i++) {
                        indexColumn = 1;
                        var valueArr = [];
                        if (_.isUndefined(tests[i].customEntry) || _.isNull(tests[i].customEntry)) {
                            return worksheet;
                        }
                        var obj = JSON.parse(tests[i].customEntry);
                        _.each(obj, function(value, key, obj) {
                            worksheet.cell(indexRow + i, indexColumn)
                                .string(value);
                            worksheet.cell(indexRow + i, indexColumn)
                                .style({
                                    border: cellBorder
                                });
                            indexColumn++;
                        });
                    }
                    indexRow++;
                    return worksheet;
                }
                var writeCommonAttrs = function(summarySheet) {
                    if (_.isEqual(summaryDisplayConfig.name, true)) {
                        summarySheet.cell(indexRow, 1)
                            .string('Functional Area');
                        summarySheet.cell(indexRow, 1)
                            .style({
                                font: headerTextStyle
                            });
                        summarySheet.cell(indexRow, 2)
                            .string(report.name);
                        indexRow++;
                    }
                    if (_.isEqual(summaryDisplayConfig.description, true)) {
                        summarySheet.cell(indexRow, 1)
                            .string('Description');
                        summarySheet.cell(indexRow, 1)
                            .style({
                                font: headerTextStyle
                            });
                        summarySheet.cell(indexRow, 2)
                            .string(report.description);
                        indexRow++;
                    }
                    if (_.isEqual(summaryDisplayConfig.start_date, true)) {
                        summarySheet.cell(indexRow, 1)
                            .string('Start Date');
                        summarySheet.cell(indexRow, 1)
                            .style({
                                font: headerTextStyle
                            });
                        summarySheet.cell(indexRow, 2)
                            .string('' + report.date);
                        indexRow++;
                    }
                    if (_.isEqual(summaryDisplayConfig.end_date, true)) {
                        summarySheet.cell(indexRow, 1)
                            .string('End Date');
                        summarySheet.cell(indexRow, 1)
                            .style({
                                font: headerTextStyle
                            });
                        summarySheet.cell(indexRow, 2)
                            .string('' + report.end_date);
                        indexRow++;
                    }
                    if (_.isEqual(summaryDisplayConfig.status, true)) {
                        summarySheet.cell(indexRow, 1)
                            .string('Status');
                        summarySheet.cell(indexRow, 1)
                            .style({
                                font: headerTextStyle
                            });
                        summarySheet.cell(indexRow, 2)
                            .string(report.status != null ? report.status.capitalize() : report.status);
                        if (report.status != null && report.status.toLowerCase() != 'pass' && report.status.toLowerCase() != 'completed') {
                            summarySheet.cell(indexRow, 2)
                                .style(redFont);
                        }
                        summarySheet.cell(indexRow, 2)
                            .string(report.status);
                        indexRow++;
                    }
                    if (_.isEqual(summaryDisplayConfig.duration, true)) {
                        summarySheet.cell(indexRow, 1)
                            .string('Duration');
                        summarySheet.cell(indexRow, 1)
                            .style({
                                font: headerTextStyle
                            });
                        summarySheet.cell(indexRow, 2)
                            .string(batam_util.durationToStr(report.duration.value));
                        indexRow++;
                    }
                    if (_.isEqual(summaryDisplayConfig.total, true)) {
                        summarySheet.cell(indexRow, 1)
                            .string('Total');
                        summarySheet.cell(indexRow, 1)
                            .style({
                                font: headerTextStyle
                            });
                        if (!_.isUndefined(report.tests) && !_.isNull(report.tests) && !_.isUndefined(report.tests.all) && !_.isNull(report.tests.all)) {
                            summarySheet.cell(indexRow, 2)
                                .string('' + report.tests.all.value);
                        }
                        indexRow++;
                    }
                    if (_.isEqual(summaryDisplayConfig.passes, true)) {
                        summarySheet.cell(indexRow, 1)
                            .string('Passes');
                        summarySheet.cell(indexRow, 1)
                            .style({
                                font: headerTextStyle
                            });
                        if (!_.isUndefined(report.tests) && !_.isNull(report.tests) && !_.isUndefined(report.tests.passes) && !_.isNull(report.tests.passes)) {
                            summarySheet.cell(indexRow, 2)
                                .string('' + report.tests.passes.value);
                        }
                        indexRow++;
                    }
                    if (_.isEqual(summaryDisplayConfig.failures, true)) {
                        summarySheet.cell(indexRow, 1)
                            .string('Failures');
                        summarySheet.cell(indexRow, 1)
                            .style({
                                font: headerTextStyle
                            });
                        if (!_.isUndefined(report.tests) && !_.isNull(report.tests) && !_.isUndefined(report.tests.failures) && !_.isNull(report.tests.failures)) {
                            summarySheet.cell(indexRow, 2)
                                .string('' + report.tests.failures.value);
                            if (report.tests.failures.value > 0) {
                                summarySheet.cell(indexRow, 2)
                                    .style(redFont);
                            }
                        } else {
                            console.log('isCustomFormatEnabled is set to true and Custom Format is not provided');
                        }
                        indexRow++;
                    }
                    if (_.isEqual(summaryDisplayConfig.errors, true)) {
                        summarySheet.cell(indexRow, 1)
                            .string('Not Completed');
                        summarySheet.cell(indexRow, 1)
                            .style({
                                font: headerTextStyle
                            });
                        if (!_.isUndefined(report.tests) && !_.isNull(report.tests) && !_.isUndefined(report.tests.regressions) && !_.isNull(report.tests.regressions) && !_.isUndefined(report.tests.failures) && !_.isNull(report.tests.failures)) {
                            summarySheet.cell(indexRow, 2)
                                .string('' + (report.tests.regressions.value - report.tests.failures.value));
                            if ((report.tests.regressions.value - report.tests.failures.value) > 0) {
                                summarySheet.cell(indexRow, 2)
                                    .style(redFont);
                            }
                        }
                    }
                    indexRow++;
                    return summarySheet;
                }
                var createStandardFormatSummarySheet = function(workbook) {
                    var summarySheet = null;
                    summarySheet = workbook.addWorksheet("Summary", 14, maxRow + 2 + tests.length);
                    summarySheet.column(1)
                        .setWidth(25);
                    summarySheet.column(2)
                        .setWidth(100);
                    summarySheet = writeCommonAttrs(summarySheet);
                    summarySheet = writeStandardTemplateHeader(summarySheet);
                    summarySheet = writeStandardTableData(summarySheet);
                    return summarySheet;
                };
                var createPerfFormatSummarySheet = function(workbook) {
                    var summarySheet = null;
                    var headings = Object.keys(JSON.parse(tests[0].customEntry));
                    summarySheet = workbook.addWorksheet("Summary", headings.length + 1, maxRow + 2 + tests.length);
                    summarySheet.column(1)
                        .setWidth(25);
                    summarySheet.column(2)
                        .setWidth(100);
                    summarySheet = writeCommonAttrs(summarySheet);
                    summarySheet = writePerformanceFormatHeader(summarySheet);
                    summarySheet = writePerformanceFormatTableData(summarySheet);
                    return summarySheet;
                };
                var createTestTableHeader = function(sheet, test) {
                    for (var j = 0; j < test.steps.length; j++) {
                        if (test.steps[j].input) {
                            inputVisibile = true;
                        }
                        if (test.steps[j].expected) {
                            expectedVisible = true;
                        }
                        if (test.steps[j].status) {
                            statusVisible = true;
                        }
                        if (test.steps[j].output) {
                            outputVisible = true;
                        }
                        if (test.steps[j].start_date && test.steps[j].end_date) {
                            durationVisible = true;
                        }
                        if (test.steps[j].error != null) {
                            errorVisible = true;
                        }
                    }
                    indexRow = indexRow + 5;
                    if (_.isEqual(testDisplayConfig.steps.order, true)) {
                        sheet.cell(indexRow, indexColumn)
                            .string('Step #');
                        sheet.cell(indexRow, indexColumn)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        indexColumn++;
                    }
                    if (_.isEqual(testDisplayConfig.steps.name, true)) {
                        sheet.cell(indexRow, indexColumn)
                            .string('Description');
                        sheet.cell(indexRow, indexColumn)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        sheet.column(indexColumn)
                            .setWidth(50);
                        sheet.cell(firstBodyRow + j, indexColumn)
                            .style({
                                alignment: {
                                    wrapText: true
                                }
                            });
                        indexColumn++;
                    }
                    if (inputVisibile && _.isEqual(testDisplayConfig.steps.input, true)) {
                        sheet.cell(indexRow, indexColumn)
                            .string('Input Data');
                        sheet.cell(indexRow, indexColumn)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        indexColumn++;
                    }
                    if (_.isEqual(testDisplayConfig.steps.expected, true)) {
                        sheet.cell(indexRow, indexColumn)
                            .string('Expected Result');
                        sheet.cell(indexRow, indexColumn)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        indexColumn++;
                    }
                    if (statusVisible && _.isEqual(testDisplayConfig.steps.status, true)) {
                        sheet.cell(indexRow, indexColumn)
                            .string('Status');
                        sheet.cell(indexRow, indexColumn)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        indexColumn++;
                    }
                    if (outputVisible && _.isEqual(testDisplayConfig.steps.output, true)) {
                        sheet.cell(indexRow, indexColumn)
                            .string('Output Data');
                        sheet.cell(indexRow, indexColumn)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        indexColumn++;
                    }
                    if (_.isEqual(testDisplayConfig.steps.attachment, true)) {
                        sheet.cell(indexRow, indexColumn)
                            .string('Attachment');
                        sheet.cell(indexRow, indexColumn)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        indexColumn++;
                    }
                    if (_.isEqual(testDisplayConfig.steps.screenshot, true)) {
                        sheet.cell(indexRow, indexColumn)
                            .string('Screenshot ?');
                        sheet.cell(indexRow, indexColumn)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        indexColumn++;
                    }
                    if (_.isEqual(testDisplayConfig.executed_by, true)) {
                        sheet.cell(indexRow, indexColumn)
                            .string('Execution By');
                        sheet.cell(indexRow, indexColumn)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        indexColumn++;
                    }
                    if (_.isEqual(testDisplayConfig.steps.executionDateAndTime, true)) {
                        sheet.cell(indexRow, indexColumn)
                            .string('Execution Date And Time');
                        sheet.cell(indexRow, indexColumn)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        indexColumn++;
                    }
                    if (durationVisible && _.isEqual(testDisplayConfig.steps.duration, true)) {
                        sheet.cell(indexRow, indexColumn)
                            .string('Execution Time');
                        sheet.cell(indexRow, indexColumn)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        indexColumn++;
                    }
                    if (_.isEqual(testDisplayConfig.steps.attachmentUploadedBy, true)) {
                        sheet.cell(indexRow, indexColumn)
                            .string('Attachment Uploaded By');
                        sheet.cell(indexRow, indexColumn)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        indexColumn++;
                    }
                    if (_.isEqual(testDisplayConfig.steps.attachmentUploadedDate, true)) {
                        sheet.cell(indexRow, indexColumn)
                            .string('Attachment Uploaded Date');
                        sheet.cell(indexRow, indexColumn)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        indexColumn++;
                    }
                    if (_.isEqual(testDisplayConfig.comments, true)) {
                        sheet.cell(indexRow, indexColumn)
                            .string('Comments');
                        sheet.cell(indexRow, indexColumn)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        indexColumn++;
                    }
                    if (errorVisible && _.isEqual(testDisplayConfig.steps.error, true)) {
                        sheet.cell(indexRow, indexColumn)
                            .string('Reason for Failure');
                        sheet.cell(indexRow, indexColumn)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        sheet.column(indexColumn)
                            .setWidth(75);
                        indexColumn++;
                    }
                    return sheet;
                };
                var populateStepData = function(sheet, test, index) {
                    var detailedSheet;
                    if (test.steps[index].customFormat == 'UPGRADED_DATA_VERIFICATION') {
                        test.steps[index].output = JSON.parse(JSON.parse(test.steps[index].output))
                        var totalRows = test.steps[index].output.length;
                        var cols = test.steps[index].output[0].length;
                        detailedSheet = workbook.addWorksheet(test.steps[index].name.substring(0, 10) + '-data');
                        writeUpgradedDataComparisonReport(detailedSheet, test, index);
                    }
                    if (test.steps[index].customFormat == 'UPGRADE_FORMAT') {
                        // This is for evaluating the total number of rows that are needed for the detailed sheet while creating it.
                        // But totalRows * 3 is done for all values (PreMigratedVal , PostMigratedVal and Variance) and the value is
                        // incremented by 10 as buffer
                        var totalRows = 0;
                        var inputValue = JSON.parse(test.steps[index].input);
                        _.each(inputValue, function(value, key, inputValue) {
                            if (_.isObject(value)) {
                                _.each(value, function(vValue, vKey, value) {
                                    if (_.isObject(vValue)) {
                                        column = 1;
                                        var noOfKeys = Object.keys(vValue)
                                            .length;
                                        totalRows = totalRows + noOfKeys;
                                    }
                                });
                            }
                        });
                        if (totalRows == 0) {
                            totalRows = 1000; //defaultRowCount
                        } else {
                            totalRows = (totalRows * 3 + 10);
                        }
                        detailedSheet = workbook.addWorksheet(test.name + 'detailed', 1000, totalRows);
                        writeDetailedData(detailedSheet, test, index);
                    }
                    if (_.isEqual(testDisplayConfig.steps.order, true)) {
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .string('' + test.steps[index].order);
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                alignment: {
                                    vertical: 'top'
                                }
                            });
                        indexColumn++;
                    }
                    if (_.isEqual(testDisplayConfig.steps.name, true)) {
                        var description = test.steps[index].name;
                        if (description.includes(":")) {
                            description = description.split(":");
                            sheet.cell(firstBodyRow + index, 2)
                                .string(description[1]);
                        } else {
                            sheet.cell(firstBodyRow + index, 2)
                                .string(description);
                        }
                        sheet.cell(firstBodyRow + index, 2)
                            .style({
                                border: cellBorder
                            });
                        sheet.cell(firstBodyRow + index, 2)
                            .style({
                                alignment: {
                                    vertical: 'top'
                                }
                            });
                        sheet.cell(firstBodyRow + index, 2)
                            .style({
                                alignment: {
                                    wrapText: true
                                }
                            });
                        sheet.column(2)
                            .setWidth(30);
                        indexColumn++;
                    }
                    if (inputVisibile && _.isEqual(testDisplayConfig.steps.input, true)) {
                        if (test.steps[index].customFormat == 'UPGRADE_FORMAT') {
                            sheet.cell(firstBodyRow + index, indexColumn)
                                .string(detailedSheet.name);
                        } else {
                            sheet.cell(firstBodyRow + index, indexColumn)
                                .string(formatStepsVariables(test.steps[index].input));
                        }
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                alignment: {
                                    vertical: 'top'
                                }
                            });
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                alignment: {
                                    wrapText: true
                                }
                            });
                        sheet.column(indexColumn)
                            .setWidth(30);
                        indexColumn++;
                    }
                    if (_.isEqual(testDisplayConfig.steps.expected, true)) {
                        if (test.steps[index].customFormat == 'UPGRADE_FORMAT') {
                            sheet.cell(firstBodyRow + index, indexColumn)
                                .string(detailedSheet.name);
                        } else {
                            sheet.cell(firstBodyRow + index, indexColumn)
                                .string(formatStepsVariables(test.steps[index].expected));
                        }
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                alignment: {
                                    vertical: 'top'
                                }
                            });
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                alignment: {
                                    wrapText: true
                                }
                            });
                        sheet.column(indexColumn)
                            .setWidth(30);
                        indexColumn++;
                    }
                    if (statusVisible && _.isEqual(testDisplayConfig.steps.status, true)) {
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .string(test.steps[index].status != null ? test.steps[index].status.capitalize() : test.steps[index].status);
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        if (test.steps[index].status != null && test.steps[index].status.toLowerCase() != 'pass') {
                            //sheet.fill(indexColumn, firstBodyRow + index, redFont);
                            sheet.cell(firstBodyRow + index, indexColumn)
                                .style(redFont);
                        }
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                alignment: {
                                    vertical: 'top'
                                }
                            });
                        indexColumn++;
                    }
                    if (outputVisible && _.isEqual(testDisplayConfig.steps.output, true)) {
                        if (test.steps[index].customFormat == 'UPGRADE_FORMAT') {
                            sheet.cell(firstBodyRow + index, indexColumn)
                                .string(detailedSheet.name);
                        } else
                            sheet.cell(firstBodyRow + index, indexColumn)
                            .string(formatStepsVariables(test.steps[index].output));
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                alignment: {
                                    vertical: 'top'
                                }
                            });
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                alignment: {
                                    wrapText: true
                                }
                            });
                        sheet.column(indexColumn)
                            .setWidth(30);
                        indexColumn++;
                    }
                    if (_.isEqual(testDisplayConfig.steps.attachment, true)) {
                        var buildID = replaceall(":", "", req.params.build_id);
                        var screenshotString = "";
                        var step_name = test.steps[index].name;
                        if (step_name.includes(":")) {
                            step_name = step_name.split(":");
                            step_name = step_name[0];
                        }
                        if (fs.existsSync(path.resolve(screenshotBasePath + '/' + buildID + '/' + report.name + '/' + test.name + "/" + step_name))) {
                            sheet.cell(firstBodyRow + index, indexColumn)
                                                        .link(report.name + '/' + test.name + "/" + step_name, test.name+"_"+step_name+".png");
                            takeScreenShot = "Yes";
                        } else {
                            sheet.cell(firstBodyRow + index, indexColumn).string(" ");
                            takeScreenShot = "No";
                        }
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                alignment: {
                                    vertical: 'top'
                                }
                            });
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                alignment: {
                                    wrapText: true
                                }
                            });
                        sheet.column(indexColumn)
                            .setWidth(30);
                        indexColumn++;
                    }
                    if (_.isEqual(testDisplayConfig.steps.screenshot, true)) {
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .string(takeScreenShot);
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                alignment: {
                                    vertical: 'top'
                                }
                            });
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                alignment: {
                                    wrapText: true
                                }
                            });
                        sheet.column(indexColumn)
                            .setWidth(30);
                        indexColumn++;
                    }
                    if (_.isEqual(testDisplayConfig.executed_by, true)) {
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .string(executed_by);
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                alignment: {
                                    vertical: 'top'
                                }
                            });
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                alignment: {
                                    wrapText: true
                                }
                            });
                        sheet.column(indexColumn)
                            .setWidth(30);
                        indexColumn++;
                    }
                    if (_.isEqual(testDisplayConfig.steps.executionDateAndTime, true)) {
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .string('' + test.start_date);
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                alignment: {
                                    vertical: 'top'
                                }
                            });
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                alignment: {
                                    wrapText: true
                                }
                            });
                        sheet.column(indexColumn)
                            .setWidth(30);
                        indexColumn++;
                    }
                    if (durationVisible && _.isEqual(testDisplayConfig.steps.duration, true)) {
                        if (test.steps[index].start_date != null && test.steps[index].end_date != null &&
                            _.isNumber(parseInt(test.steps[index].start_date)) && _.isNumber(parseInt(test.steps[index].end_date)) &&
                            _.isDate(new Date(parseInt(test.steps[index].start_date))) && _.isDate(new Date(test.steps[index].end_date)) &&
                            test.steps[index].start_date <= test.steps[index].end_date) {
                            sheet.cell(firstBodyRow + index, indexColumn)
                                .string(batam_util.durationToStr(test.steps[index].end_date - test.steps[index].start_date));
                            sheet.cell(firstBodyRow + index, indexColumn)
                                .style({
                                    border: cellBorder
                                });
                            sheet.cell(firstBodyRow + index, indexColumn)
                                .style({
                                    alignment: {
                                        vertical: 'top'
                                    }
                                });
                        }
                        indexColumn++;
                    }
                    if (_.isEqual(testDisplayConfig.steps.attachmentUploadedBy, true)) {
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .string(executed_by);
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                alignment: {
                                    vertical: 'top'
                                }
                            });
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                alignment: {
                                    wrapText: true
                                }
                            });
                        sheet.column(indexColumn)
                            .setWidth(30);
                        indexColumn++;
                    }
                    if (_.isEqual(testDisplayConfig.steps.attachmentUploadedDate, true)) {
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .string('' + test.start_date);
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                alignment: {
                                    vertical: 'top'
                                }
                            });
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                alignment: {
                                    wrapText: true
                                }
                            });
                        sheet.column(indexColumn)
                            .setWidth(30);
                        indexColumn++;
                    }
                    if (_.isEqual(testDisplayConfig.comments, true)) {
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .string('');
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                alignment: {
                                    vertical: 'top'
                                }
                            });
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                alignment: {
                                    wrapText: true
                                }
                            });
                        indexColumn++;
                    }
                    if (errorVisible && _.isEqual(testDisplayConfig.steps.error, true)) {
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .string('' + test.steps[index].error);
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                border: cellBorder
                            });
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                alignment: {
                                    vertical: 'top'
                                }
                            });
                        sheet.cell(firstBodyRow + index, indexColumn)
                            .style({
                                alignment: {
                                    wrapText: true
                                }
                            });
                        indexColumn++;
                    }
                    return sheet;
                };
                var writeUpgradedDataComparisonReport = function(comparisonSheet, test, index) {
                    var dataRowStart = writeUpgradeDataCompHeader(comparisonSheet, test, index);
                    writeUpgradeDataCompBody(comparisonSheet, test, index, dataRowStart);
                };
                var writeUpgradeDataCompBody = function(comparisonSheet, test, index, dataRowStart) {
                    var step = test.steps[index];
                    for (var dataRowIndex = 1; dataRowIndex < step.output.length; dataRowIndex++) {
                        var dataRow = step.output[dataRowIndex];
                        for (var colCount = 0; colCount < dataRow.length; colCount++) {
                            comparisonSheet.cell(dataRowStart, colCount + 1)
                                .string(dataRow[colCount]);
                            comparisonSheet.cell(dataRowStart, colCount + 1)
                                .style({
                                    border: cellBorder
                                });
                            if ((colCount + 1) % 3 == 0 && dataRow[colCount] == 'No') {
                                var style = workbook.createStyle({
                                    font: {
                                        color: '#FF0000',
                                        size: 11
                                    }
                                });
                                comparisonSheet.cell(dataRowStart, colCount + 1)
                                    .style(style);
                            }
                        }
                        dataRowStart += 1;
                    }
                };
                var writeUpgradeDataCompHeader = function(comparisonSheet, test, index) {
                    var currRow = 1;
                    var step = test.steps[index];
                    var headerTextStyle = {
                        bold: true,
                        iter: true,
                        alignment: {
                            horizontal: 'center'
                        }
                    };
                    var testName = test.name;
                    var stepName = step.name;
                    setVal(comparisonSheet, 1, currRow, 'Test Name', headerTextStyle, cellBorder);
                    setVal(comparisonSheet, 2, currRow, testName, null, null);
                    currRow++;
                    setVal(comparisonSheet, 1, currRow, 'Step Name', headerTextStyle, cellBorder);
                    setVal(comparisonSheet, 2, currRow, stepName, null, null);
                    currRow++;
                    var headers = step.output[0];
                    var dataHeaderColStartPoint = 1;
                    for (var headerCount = 0; headerCount < headers.length; headerCount++) {
                        // We need to merge three cells
                        var rangeEnd = (headerCount + 1) * 3;
                        var rangeStart = rangeEnd - 3 + 1;
                        for (var cellCount = rangeStart; cellCount <= rangeEnd; cellCount++) {
                            setVal(comparisonSheet, cellCount, currRow, headers[headerCount], headerTextStyle, cellBorder);
                        }
                        comparisonSheet.cell(currRow, rangeStart, currRow, rangeEnd, true);
                        setVal(comparisonSheet, rangeStart, currRow + 1, 'Pre', headerTextStyle, cellBorder);
                        setVal(comparisonSheet, rangeStart + 1, currRow + 1, 'Post', headerTextStyle, cellBorder);
                        setVal(comparisonSheet, rangeStart + 2, currRow + 1, 'Match?', headerTextStyle, cellBorder);
                    }
                    currRow++;
                    currRow++;
                    return currRow;
                };
                var setVal = function(sheet, colIndex, rowIndex, value, fontStyle, cellBorder) {
                    sheet.cell(rowIndex, colIndex)
                        .string(value);
                    if (!_.isUndefined(fontStyle)) {
                        sheet.cell(rowIndex, colIndex)
                            .style({
                                font: fontStyle
                            });
                    }
                    if (!_.isUndefined(cellBorder)) {
                        sheet.cell(rowIndex, colIndex)
                            .style({
                                border: cellBorder
                            });
                    }
                };
                var createdetailedSheetData = function(detailedSheet, input, header, level, test) {
                    var mergeVKeyCells = new Array();
                    var mergeVKeyCellsNDCLevel = new Array();
                    var obj = JSON.parse(input);
                    var i = 0;
                    _.each(obj, function(value, key, obj) {
                        if (_.isObject(value)) {
                            var column = 1,
                                row = 2;
                            var pre = [],
                                post = [],
                                variance = [];
                            var values = ['PreMigrated Value', 'PostMigrated Value', 'Variance'];
                            _.each(value, function(vValue, vKey, value) {
                                if (_.isObject(vValue)) {
                                    column = 1;
                                    var noOfKeys = Object.keys(vValue)
                                        .length;
                                    var mergeLen = (noOfKeys * level);
                                    detailedSheet.cell(row, column)
                                        .string(vKey);
                                    for (var bIndex = 0; bIndex < mergeLen; bIndex++) {
                                        detailedSheet.cell(row + bIndex, column)
                                            .style({
                                                border: cellBorder
                                            });
                                    }
                                    detailedSheet.cell((row + mergeLen) - 1, column)
                                        .style({
                                            border: cellBorder
                                        });
                                    detailedSheet.cell(row, column)
                                        .style({
                                            alignment: {
                                                wrapText: true
                                            }
                                        });
                                    detailedSheet.cell(row, column)
                                        .style({
                                            alignment: {
                                                vertical: 'top'
                                            }
                                        });
                                    detailedSheet.column(column)
                                        .setWidth(30);
                                    var NDCLableRowStart = row;
                                    var NDCLableColStart = column;
                                    mergeVKeyCells[mergeVKeyCells.length] = {
                                        rowStart: NDCLableRowStart,
                                        rowEnd: (row + mergeLen) - 1,
                                        col: column,
                                        val: '' + vKey
                                    };
                                    _.each(vValue, function(vValue1, vKey1, vValue) {
                                        pre = [], post = [], variance = [];
                                        column = 2;
                                        var mergeLen1 = mergeLen / (noOfKeys);
                                        for (var bIndex = 0; bIndex < mergeLen1; bIndex++) {
                                            detailedSheet.cell(row + bIndex, column)
                                                .style({
                                                    border: cellBorder
                                                });
                                        }
                                        detailedSheet.cell(row, column)
                                            .style({
                                                alignment: {
                                                    vertical: 'top'
                                                }
                                            });
                                        detailedSheet.column(column)
                                            .setWidth(30);
                                        var ndcNumCellRowStart = row;
                                        var ndcNumCellColStart = column;
                                        var oldRowVal = row;
                                        column++;
                                        detailedSheet.cell(row, column)
                                            .string('PreMigrated Value');
                                        detailedSheet.cell(row, column)
                                            .style({
                                                border: cellBorder
                                            });
                                        detailedSheet.cell(row, column)
                                            .style({
                                                alignment: {
                                                    vertical: 'top'
                                                }
                                            });
                                        detailedSheet.column(column)
                                            .setWidth(30);
                                        row++;
                                        detailedSheet.cell(row, column)
                                            .string('PostMigrated Value');
                                        detailedSheet.cell(row, column)
                                            .style({
                                                border: cellBorder
                                            });
                                        detailedSheet.cell(row, column)
                                            .style({
                                                alignment: {
                                                    vertical: 'top'
                                                }
                                            });
                                        detailedSheet.column(column)
                                            .setWidth(30);
                                        row++;
                                        detailedSheet.cell(row, column)
                                            .string('Variance');
                                        detailedSheet.cell(row, column)
                                            .style({
                                                border: cellBorder
                                            });
                                        detailedSheet.cell(row, column)
                                            .style({
                                                alignment: {
                                                    vertical: 'top'
                                                }
                                            });
                                        detailedSheet.column(column)
                                            .setWidth(30);
                                        row = oldRowVal;
                                        var json = JSON.stringify(vValue1);
                                        for (var j = 0; j < header.length; j++) {
                                            console.log("header[j]: " + header[j]);
                                            console.log("vKey1 " + vKey1);
                                            console.log("vValue[vKey1]: " + JSON.stringify(vValue[vKey1]));
                                            var preVal = vValue[vKey1][header[j]][values[0]];
                                            var postVal = vValue[vKey1][header[j]][values[1]];
                                            var varVal = vValue[vKey1][header[j]][values[2]];
                                            pre.push(preVal);
                                            post.push(postVal);
                                            variance.push((varVal));
                                        }
                                        column = level + 1;
                                        for (var i = 0; i < pre.length; i++) {
                                            detailedSheet.cell(row, column)
                                                .string(pre[i]);
                                            detailedSheet.cell(row, column)
                                                .style({
                                                    border: cellBorder
                                                });
                                            detailedSheet.cell(row, column)
                                                .style({
                                                    alignment: {
                                                        vertical: 'top'
                                                    }
                                                });
                                            detailedSheet.column(column)
                                                .setWidth(20);
                                            column++
                                        }
                                        row++;
                                        column = level + 1;
                                        for (var i = 0; i < post.length; i++) {
                                            detailedSheet.cell(row, column)
                                                .string(post[i]);
                                            detailedSheet.cell(row, column)
                                                .style({
                                                    border: cellBorder
                                                });
                                            detailedSheet.cell(row, column)
                                                .style({
                                                    alignment: {
                                                        vertical: 'top'
                                                    }
                                                });
                                            detailedSheet.column(column)
                                                .setWidth(20);
                                            column++
                                        }
                                        row++;
                                        column = level + 1;
                                        for (var i = 0; i < variance.length; i++) {
                                            detailedSheet.cell(row, column)
                                                .string('' + variance[i]);
                                            detailedSheet.cell(row, column)
                                                .style({
                                                    border: cellBorder
                                                });
                                            detailedSheet.cell(row, column)
                                                .style({
                                                    alignment: {
                                                        vertical: 'top'
                                                    }
                                                });
                                            detailedSheet.column(column)
                                                .setWidth(20);
                                            if (variance[i] != null && variance[i] != 0) {
                                                detailedSheet.cell(row, column)
                                                    .style(redFont);
                                            }
                                            column++;
                                        }
                                        row++;
                                        mergeVKeyCellsNDCLevel[mergeVKeyCellsNDCLevel.length] = {
                                            rowStart: ndcNumCellRowStart,
                                            rowEnd: ndcNumCellRowStart + 2,
                                            col: ndcNumCellColStart,
                                            val: '' + vKey1
                                        };
                                    });
                                }
                            });
                        }
                    });
                    for (var count = mergeVKeyCellsNDCLevel.length - 1; count >= 0; count--) {
                        detailedSheet.cell(mergeVKeyCellsNDCLevel[count].rowStart,
                                mergeVKeyCellsNDCLevel[count].col,
                                mergeVKeyCellsNDCLevel[count].rowEnd,
                                mergeVKeyCellsNDCLevel[count].col, true)
                            .string(mergeVKeyCellsNDCLevel[count].val);
                    }
                    for (var count = mergeVKeyCells.length - 1; count >= 0; count--) {
                        detailedSheet.cell(mergeVKeyCells[count].rowStart,
                                mergeVKeyCells[count].col,
                                mergeVKeyCells[count].rowEnd,
                                mergeVKeyCells[count].col, true)
                            .string(mergeVKeyCells[count].val);
                    }
                };
                var getNumberOfLevelsInJSON = function(input, level) {
                    var value;
                    for (var key in input) {
                        //Fetching the element in the map and finding the depth of the JSON
                        value = input[key];
                        break;
                    };
                    if (_.isObject(value)) {
                        level++;
                        level = getNumberOfLevelsInJSON(value, level);
                    } else if (_.isString(value) || _.isNumber(value)) {}
                    return level;
                };
                var writeDetailedData = function(detailedSheet, test, index) {
                    var len = test.steps[index].input.length;
                    var input = test.steps[index].input;
                    var obj = JSON.parse(input);
                    var level = 0;
                    level = getNumberOfLevelsInJSON(obj[1], level);
                    var column = level + 1;
                    var row = 1;
                    if (_.isNull(input) || _.isUndefined(input)) {
                        return;
                    }
                    var headings
                    try {
                        var obj = JSON.parse(input);
                        var node = obj[1];
                        //Logic for getting the heading Attrs. Traversing the one branch of data (all levels)
                        //  from root to leaf and getting the headers at the leaf node
                        for (var l = 0; l < level; l++) {
                            headings = Object.keys(node);
                            node = node[headings[0]];
                        }
                    } catch (exception) {
                        throw exception;
                    }
                    if (headings) {
                        for (var i = 0; i < headings.length; i++) {
                            if (!_.isUndefined(headings[i]) && !_.isNull(headings[i])) {
                                detailedSheet.cell(row, column)
                                    .string(headings[i]);
                                detailedSheet.cell(row, column)
                                    .style({
                                        font: headerTextStyle
                                    });
                                detailedSheet.cell(row, column)
                                    .style({
                                        border: cellBorder
                                    });
                                column++
                            }
                        }
                    }
                    createdetailedSheetData(detailedSheet, input, headings, level, test);
                };
                var populateTestTableData = function(sheet, test) {
                    firstBodyRow = indexRow + 1;
                    for (var j = 0; j < test.steps.length; j++) {
                        indexColumn = 1;
                        sheet = populateStepData(sheet, test, j);
                    }
                    return sheet;
                };
                var writeTestCommonData = function(sheet, test) {
                    // Fill some data
                    if (_.isEqual(testDisplayConfig.moduleName, true)) {
                        sheet.cell(indexRow, 1)
                            .string('Module Name');
                        sheet.cell(indexRow, 1)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, 2)
                            .string(report.name);
                        indexRow++;
                    }
                    if (_.isEqual(testDisplayConfig.name, true)) {
                        sheet.cell(indexRow, 1)
                            .string('Test Name');
                        sheet.cell(indexRow, 1)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, 2)
                            .string(test.name);
                        indexRow++;
                    }
                    if (_.isEqual(testDisplayConfig.description, true)) {
                        sheet.cell(indexRow, 1)
                            .string('Test Description');
                        sheet.cell(indexRow, 1)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, 2)
                            .style({
                                alignment: {
                                    wrapText: false
                                }
                            });
                        sheet.cell(indexRow, 2)
                            .string(test.description);
                        indexRow++;
                    }
                    if (_.isEqual(testDisplayConfig.prerequisites, true)) {
                        sheet.cell(indexRow, 1)
                            .string('Prerequisites');
                        sheet.cell(indexRow, 1)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, 2)
                            .string('None');
                        indexRow++;
                    }
                    if (_.isEqual(testDisplayConfig.name, true)) {
                        sheet.cell(indexRow, 1)
                            .string('Executed By');
                        sheet.cell(indexRow, 1)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, 2)
                            .string(executed_by);
                        indexRow++;
                    }
                    if (_.isEqual(testDisplayConfig.start_date, true)) {
                        sheet.cell(indexRow, 1)
                            .string('Execution Start Date');
                        sheet.cell(indexRow, 1)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, 2)
                            .string('' + test.start_date);
                        indexRow++;
                    }
                    if (_.isEqual(testDisplayConfig.end_date, true)) {
                        sheet.cell(indexRow, 1)
                            .string('Execution End Date');
                        sheet.cell(indexRow, 1)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, 2)
                            .string('' + test.end_date);
                        indexRow++;
                    }
                    if (_.isEqual(testDisplayConfig.duration, true)) {
                        sheet.cell(indexRow, 1)
                            .string('Duration');
                        sheet.cell(indexRow, 1)
                            .style({
                                font: headerTextStyle
                            });
                        if (test.start_date != null && test.end_date != null &&
                            _.isDate(new Date(test.start_date)) && _.isDate(new Date(test.end_date))) {
                            sheet.cell(indexRow, 2)
                                .string(batam_util.durationToStr(test.end_date - test.start_date));
                        }
                        indexRow++;
                    }
                    if (_.isEqual(testDisplayConfig.status, true)) {
                        sheet.cell(indexRow, 1)
                            .string('Status');
                        sheet.cell(indexRow, 1)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, 2)
                            .string(test.status != null ? test.status.capitalize() : test.status);
                        if (test.status != null && test.status.toLowerCase() != 'pass') {
                            sheet.cell(indexRow, 2)
                                .style(redFont);
                        }
                        indexRow++;
                    }
                    if (_.isEqual(testDisplayConfig.tags, true)) {
                        sheet.cell(indexRow, 1)
                            .string('Tags');
                        sheet.cell(indexRow, 1)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, 2)
                            .string(test.tags);
                        indexRow++;
                    }
                    return sheet;
                };
                var writeTestAuthoredData = function(sheet, test) {
                    // Fill some data
                    indexRow = 1;
                    if (_.isEqual(testDisplayConfig.authoredBy, true)) {
                        sheet.cell(indexRow, 4)
                            .string('Authored By');
                        sheet.cell(indexRow, 4)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, 5)
                            .string('');
                        indexRow++;
                    }
                    if (_.isEqual(testDisplayConfig.dateCreated, true)) {
                        sheet.cell(indexRow, 4)
                            .string('Date Created');
                        sheet.cell(indexRow, 4)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, 5)
                            .string('');
                        indexRow++;
                    }
                    if (_.isEqual(testDisplayConfig.approvalStatus, true)) {
                        sheet.cell(indexRow, 4)
                            .string('Approval Status');
                        sheet.cell(indexRow, 4)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, 5)
                            .style({
                                alignment: {
                                    wrapText: false
                                }
                            });
                        sheet.cell(indexRow, 5)
                            .string('');
                        indexRow++;
                    }
                    if (_.isEqual(testDisplayConfig.approvedBy, true)) {
                        sheet.cell(indexRow, 4)
                            .string('Approved By');
                        sheet.cell(indexRow, 4)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, 5)
                            .string('');
                        indexRow++;
                    }
                    if (_.isEqual(testDisplayConfig.approval_date, true)) {
                        sheet.cell(indexRow, 4)
                            .string('Approval Date');
                        sheet.cell(indexRow, 4)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, 5)
                            .string('');
                        indexRow++;
                    }
                    if (_.isEqual(testDisplayConfig.signature, true)) {
                        sheet.cell(indexRow, 4)
                            .string('Signature');
                        sheet.cell(indexRow, 4)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, 5)
                            .string('');
                        indexRow++;
                    }
                    if (_.isEqual(testDisplayConfig.numberOfAttachments, true)) {
                        sheet.cell(indexRow, 4)
                            .string('# Attachments');
                        sheet.cell(indexRow, 4)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, 5)
                            .string('');
                        indexRow++;
                    }
                    if (_.isEqual(testDisplayConfig.comments, true)) {
                        sheet.cell(indexRow, 4)
                            .string('Comments');
                        sheet.cell(indexRow, 4)
                            .style({
                                font: headerTextStyle
                            });
                        sheet.cell(indexRow, 5)
                            .string('');
                        indexRow++;
                    }
                    return sheet;
                };
                var formatStepObject = function(value, result) {
                    _.each(value, function(vValue, vKey, value) {
                        if (_.isObject(vValue)) {
                            result += vKey + '\r\n';
                            result = formatStepObject(vValue, result);
                            result += '\r\n';
                        } else {
                            result += vKey;
                            result += ' : ' + vValue + '\r\n';
                        }
                    });
                    return result;
                };
                var formatStepsVariables = function(input) {
                    var result = '';
                    if (_.isNull(input) || _.isUndefined(input)) {
                        return result;
                    }
                    try {
                        var obj = JSON.parse(input);
                        if (_.isNull(obj) || _.isUndefined(obj)) {
                            result = 'Data is not valid. Please correct the data string.';
                            return result;
                        }
                        var i = 0;
                        _.each(obj, function(value, key, obj) {
                            if (_.isObject(value)) {
                                result = formatStepObject(value, result);
                                if (i++ != 0) {
                                    result += '\r\n';
                                }
                            } else if (_.isString(value) || _.isNumber(value)) {
                                result += key;
                                result += ' : ' + value + '\r\n';
                            }
                        });
                    } catch (exception) {
                        result = input;
                    }
                    return result;
                };
            }
            //Handle Error.
            if (error) {
                return next(error);
            }
            //Fetch report.
            req.collections.reports.findOne({
                id: req.query.report_id
            }, fetchReport);
        };
        //Handle Error.
        if (error) {
            return next(error);
        }
        //Create searchCriteria object.
        var searchCriterias = batam_util.createSearchObject(req, criterias);
        //Fetch tests based on defined searchCriterias
        req.collections.tests.find(searchCriterias)
            .toArray(findTests);
    };
    if (validator.isNull(req.query.build_id) || !validator.matches(req.query.build_id, '[0-9a-zA-Z_-]+')) {
        return next(new Error('build_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
    }
    if (!validator.isNull(req.query.report_id)) {
        if (!validator.matches(req.query.report_id, '[0-9a-zA-Z_-]+')) {
            return next(new Error('report_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
        }
    }
    //Fetch all test criterias.
    req.collections.testcriterias.find()
        .toArray(findTestCriterias);
};
/** new code for the download */
screenshotBasePath = config.screenshotsLocation;
var finalPath = screenshotBasePath + '/test';
var extractPath = screenshotBasePath;
var deleteFolderRecursive = function(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path)
            .forEach(function(file, index) {
                var curPath = path + "/" + file;
                if (fs.lstatSync(curPath)
                    .isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
        fs.rmdirSync(path);
    }
};
var getImagesFromScreenshotsServer = function(req, res, next, callbackFn) {
    if (!fs.existsSync(screenshotBasePath)) {
        fs.mkdirSync(screenshotBasePath);
    }
    var screenshotUrl = config.screenshotUrl;
    screenshotUrl = screenshotUrl + req.params.build_id;
    if (!fs.existsSync(finalPath)) {
        fs.mkdirSync(finalPath);
    }
    var buildID = replaceall(":", "", req.params.build_id);
    if (fs.existsSync(extractPath + '/' + buildID)) {
        // The folder is already there, so we just need to prepare excel file.
        callbackFn();
        return;
    }
    var fileStream = fs.createWriteStream(finalPath + '/test.zip');
    request(screenshotUrl, function(error, response, body) {
        console.log("The folder is not there for build id:" + buildID + ", so making rest call to url" + screenshotUrl);
        if (!error && response.statusCode == 200) {
            request.get(screenshotUrl)
                .pipe(fileStream);
        } else {
            console.log("remote server is down");
            callbackFn();
            return;
        }
    });
    fileStream.on("finish", function() {
        extractAndDeleteTempZipFile(req, res, next, callbackFn);
    });
}
var extractAndDeleteTempZipFile = function(req, res, next, callbackFn) {
    var buildID = replaceall(":", "", req.params.build_id);
    extract(finalPath + '/test.zip', {
        dir: path.resolve(extractPath)
    }, function(postExtract) {
        callbackFn();
        deleteFolderRecursive(finalPath);
    });
}