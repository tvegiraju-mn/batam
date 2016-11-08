var _ = require('underscore');
var util = require('util');
var validator = require('validator');
var excelbuilder = require('msexcel-builder-colorfix');
var fs = require('fs');
var batam_util = require('../../util/util.js');
var config = require('../../config.js');
var mkdirp = require('mkdirp');

/**
 * PAGE path /:build_id/report/:report_id
 */
exports.show = showReport;

function showReport(req, res, next){
	var findBuild = function (error, build){
		var findReport = function (error, report){
			//Handle Error.
			if(error) {
				return next(error);
			}

		    if(!_.isNull(report)){
		    	res.render('build/report/view', {build_id: build.id, build_name: build.name, report_id: report.id});
		    }else{
		    	return next('Report '+req.params.report_id+' for build '+req.params.build_id+' not found.');
		   	}
		};

		//Handle Error.
		if(error) {
			return next(error);
		}

		if(_.isNull(build)){
			return next('Build '+req.params.build_id+' not found.');
		}

		req.collections.reports.findOne({id: req.params.report_id}, findReport);
	};

	//Validate inputs.
	if(!req.params.build_id || !req.params.report_id) {
		return next(new Error('No build_id or report_id params in url.'));
	}
	//if(validator.isNull(req.params.build_id) || !validator.isLength(req.params.build_id, 5, 30) || !validator.matches(req.params.build_id, '[0-9a-zA-Z_-]+')){
	if(validator.isNull(req.params.build_id) || !validator.matches(req.params.build_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('build_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	//if(validator.isNull(req.params.report_id) || !validator.isLength(req.params.report_id, 5, 60) || !validator.matches(req.params.report_id, '[0-9a-zA-Z_-]+')){
	if(validator.isNull(req.params.report_id) || !validator.matches(req.params.report_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('report_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}

    //Check if the report exist
	req.collections.builds.findOne({id: req.params.build_id}, findBuild);
}

exports.download = function(req, res, next){

	var headerTextStyle = {bold: true};
	var cellBorder = {left: 'thin', top: 'thin', right: 'thin', bottom: 'thin'};
	var redFont = {fgColor: 'FFFF0000', type: 'solid'};
	var summaryDisplayConfig = config.reports.report.display.summary;
	var testDisplayConfig = config.reports.report.display.test;
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
	var workbook;

	var findTestCriterias = function (error, criterias){
		var findTests = function (error, tests){
			var fetchReport = function (error, report) {
				//Handle Error.
				if (error) {
					return next(error);
				}
				mkdirp('./tmp/', function (err) {
					// Create a new workbook file in current working-path
					workbook = excelbuilder.createWorkbook('./tmp/', report.name + '.xlsx');
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
					maxTestRow += (_.isEqual(testDisplayConfig.name, true) ? 1 : 0);
					maxTestRow += (_.isEqual(testDisplayConfig.description, true) ? 1 : 0);
					maxTestRow += (_.isEqual(testDisplayConfig.start_date, true) ? 1 : 0);
					maxTestRow += (_.isEqual(testDisplayConfig.end_date, true) ? 1 : 0);
					maxTestRow += (_.isEqual(testDisplayConfig.duration, true) ? 1 : 0);
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
						var sheet = workbook.createSheet((tests[i].name.substring(0,29)), 8, maxTestRow + 1 + stepsCount + 3);

						sheet = writeTestCommonData(sheet, tests[i]);
						sheet = createTestTableHeader(sheet, tests[i]);
						sheet = populateTestTableData(sheet, tests[i]);
						if (tests[i].steps != null && !_.isUndefined(tests[i].steps)) {
							sheet.set(1, firstBodyRow + tests[i].steps.length + 2, "Logs");
							sheet.valign(1, firstBodyRow + tests[i].steps.length + 2, 'top');
							sheet.font(1, firstBodyRow + tests[i].steps.length + 2, headerTextStyle);
							sheet.set(2, firstBodyRow + tests[i].steps.length + 2, tests[i].log);
							sheet.wrap(2, firstBodyRow + tests[i].steps.length + 2, 'true');
							sheet.merge({col: 2, row: firstBodyRow + tests[i].steps.length + 2}, {
								col: 5,
								row: firstBodyRow + tests[i].steps.length + 2
							});
							sheet.height(firstBodyRow + tests[i].steps.length + 2, 50);
						}
					}

					// Save it
					workbook.save(function (ok) {
						if (!ok) {
							var file = fs.readFileSync('./tmp/' + report.name + '.xlsx', 'binary');
							res.setHeader('Content-disposition', 'attachment; filename=' + report.name + '.xlsx');
							res.setHeader('Content-Length', file.length);
							res.write(file, 'binary');
							fs.unlinkSync('./tmp/' + report.name + '.xlsx');
							res.end();
						} else {
							workbook.cancel();
							res.end();
						}
					});
				});

				var writePerformanceFormatHeader = function (worksheet) {
					var headings = Object.keys(JSON.parse(tests[0].customEntry));
						if(headings) {
							for (var i = 0; i < headings.length+1; i++) {
								if(!_.isUndefined(headings[i]) && !_.isNull(headings[i])) {
									worksheet.set(indexColumn, indexRow, headings[i]);
									worksheet.font(indexColumn, indexRow, headerTextStyle);
									worksheet.border(indexColumn, indexRow, cellBorder);
									indexColumn++
								}
							}
					}
					indexRow++;
					return worksheet;
				}

				var writeStandardTemplateHeader = function (summarySheet) {
						if (_.isEqual(summaryDisplayConfig.columns.order, true)) {
							summarySheet.set(indexColumn, indexRow, 'Serial Number');
							summarySheet.font(indexColumn, indexRow, headerTextStyle);
							summarySheet.border(indexColumn, indexRow, cellBorder);
							indexColumn++;
						}

						if (_.isEqual(summaryDisplayConfig.columns.name, true)) {
							summarySheet.set(indexColumn, indexRow, 'Test Name');
							summarySheet.font(indexColumn, indexRow, headerTextStyle);
							summarySheet.border(indexColumn, indexRow, cellBorder);
							indexColumn++;
						}

						if (_.isEqual(summaryDisplayConfig.columns.status, true)) {
							summarySheet.set(indexColumn, indexRow, 'Status');
							summarySheet.font(indexColumn, indexRow, headerTextStyle);
							summarySheet.border(indexColumn, indexRow, cellBorder);
							indexColumn++;
						}

						if (_.isEqual(summaryDisplayConfig.columns.duration, true)) {
							summarySheet.set(indexColumn, indexRow, 'Duration');
							summarySheet.font(indexColumn, indexRow, headerTextStyle);
							summarySheet.border(indexColumn, indexRow, cellBorder);
							indexColumn++
						}
					indexRow++;
					return summarySheet;
				}

				var writeStandardTableData = function (summarySheet) {
					for (var i = 0; i < tests.length; i++) {
						indexColumn = 1;
						if (_.isEqual(summaryDisplayConfig.columns.order, true)) {
							summarySheet.set(1, indexRow + i, i + 1);
							summarySheet.border(1, indexRow + i, cellBorder);
							indexColumn++;
						}

						if (_.isEqual(summaryDisplayConfig.columns.name, true)) {
							var testName = tests[i].name;
							if (tests[i].description != null) {
								testName += ' - ' + tests[i].description;
							}
							summarySheet.set(indexColumn, indexRow + i, testName);
							summarySheet.border(indexColumn, indexRow + i, cellBorder);
							summarySheet.wrap(indexColumn, indexRow + i, 'true');
							indexColumn++;
						}

						if (_.isEqual(summaryDisplayConfig.columns.status, true)) {
							summarySheet.set(indexColumn, indexRow + i, tests[i].status != null ? tests[i].status.capitalize() : tests[i].status);
							if (tests[i].status != null && tests[i].status.toLowerCase() != 'pass') {
								summarySheet.fill(indexColumn, indexRow + i, redFont);
							}
							summarySheet.valign(indexColumn, indexRow + i, 'top');
							summarySheet.border(indexColumn, indexRow + i, cellBorder);
							indexColumn++;
						}

						if (_.isEqual(summaryDisplayConfig.columns.status, true)) {
							summarySheet.set(indexColumn, indexRow + i, batam_util.durationToStr(tests[i].duration.value));
							summarySheet.border(indexColumn, indexRow + i, cellBorder);
							indexColumn++;
						}
					}
					indexRow++;
					return summarySheet;
				}

				var writePerformanceFormatTableData = function (worksheet) {
					for (var i = 0; i < tests.length; i++) {
						indexColumn = 1;
						var valueArr = [];
						if (_.isUndefined(tests[i].customEntry) || _.isNull(tests[i].customEntry)) {
							return worksheet;
						}
						var obj = JSON.parse(tests[i].customEntry);
						_.each(obj, function (value, key, obj) {
							worksheet.set(indexColumn, indexRow + i, value);
							worksheet.border(indexColumn, indexRow + i, cellBorder);
							indexColumn++;
						});
					}
					indexRow++;
					return worksheet;
				}

				var writeCommonAttrs = function (summarySheet) {

					if (_.isEqual(summaryDisplayConfig.name, true)) {
						summarySheet.set(1, indexRow, 'Functional Area');
						summarySheet.font(1, indexRow, headerTextStyle);
						summarySheet.set(2, indexRow, report.name);
						indexRow++;
					}

					if (_.isEqual(summaryDisplayConfig.description, true)) {
						summarySheet.set(1, indexRow, 'Description');
						summarySheet.font(1, indexRow, headerTextStyle);
						summarySheet.set(2, indexRow, report.description);
						indexRow++;
					}

					if (_.isEqual(summaryDisplayConfig.start_date, true)) {
						summarySheet.set(1, indexRow, 'Start Date');
						summarySheet.font(1, indexRow, headerTextStyle);
						summarySheet.set(2, indexRow, report.date);
						indexRow++;
					}

					if (_.isEqual(summaryDisplayConfig.end_date, true)) {
						summarySheet.set(1, indexRow, 'End Date');
						summarySheet.font(1, indexRow, headerTextStyle);
						summarySheet.set(2, indexRow, report.end_date);
						indexRow++;
					}

					if (_.isEqual(summaryDisplayConfig.status, true)) {
						summarySheet.set(1, indexRow, 'Status');
						summarySheet.font(1, indexRow, headerTextStyle);
						summarySheet.set(2, indexRow, report.status != null ? report.status.capitalize() : report.status);
						if (report.status != null && report.status.toLowerCase() != 'pass' && report.status.toLowerCase() != 'completed') {
							summarySheet.fill(2, indexRow, redFont);
						}
						summarySheet.set(2, indexRow, report.status);
						indexRow++;
					}

					if (_.isEqual(summaryDisplayConfig.duration, true)) {
						summarySheet.set(1, indexRow, 'Duration');
						summarySheet.font(1, indexRow, headerTextStyle);
						summarySheet.set(2, indexRow, batam_util.durationToStr(report.duration.value));
						indexRow++;
					}
					indexRow++;
					if (_.isEqual(summaryDisplayConfig.total, true)) {
						summarySheet.set(1, indexRow, 'Total');
						summarySheet.font(1, indexRow, headerTextStyle);
						if (!_.isUndefined(report.tests) && !_.isNull(report.tests) && !_.isUndefined(report.tests.all) && !_.isNull(report.tests.all)) {
							summarySheet.set(2, indexRow, report.tests.all.value);
						}
						indexRow++;
					}

					if (_.isEqual(summaryDisplayConfig.passes, true)) {
						summarySheet.set(1, indexRow, 'Passes');
						summarySheet.font(1, indexRow, headerTextStyle);
						if (!_.isUndefined(report.tests) && !_.isNull(report.tests) && !_.isUndefined(report.tests.passes) && !_.isNull(report.tests.passes)) {
							summarySheet.set(2, indexRow, report.tests.passes.value);
						}
						indexRow++;
					}

					if (_.isEqual(summaryDisplayConfig.failures, true)) {
						summarySheet.set(1, indexRow, 'Failures');
						summarySheet.font(1, indexRow, headerTextStyle);
						if (!_.isUndefined(report.tests) && !_.isNull(report.tests) && !_.isUndefined(report.tests.failures) && !_.isNull(report.tests.failures)) {
							summarySheet.set(2, indexRow, report.tests.failures.value);
							if (report.tests.failures.value > 0) {
								summarySheet.fill(2, indexRow, redFont);
							}
						} else {
							console.log('isCustomFormatEnabled is set to true and Custom Format is not provided');
						}
						indexRow++;
					}

					if (_.isEqual(summaryDisplayConfig.errors, true)) {
						summarySheet.set(1, indexRow, 'Not Completed');
						summarySheet.font(1, indexRow, headerTextStyle);
						if (!_.isUndefined(report.tests) && !_.isNull(report.tests) && !_.isUndefined(report.tests.regressions) && !_.isNull(report.tests.regressions) && !_.isUndefined(report.tests.failures) && !_.isNull(report.tests.failures)) {
							summarySheet.set(2, indexRow, report.tests.regressions.value - report.tests.failures.value);
							if ((report.tests.regressions.value - report.tests.failures.value) > 0) {
								summarySheet.fill(2, indexRow, redFont);
							}
						}
					}
					indexRow++;
					return summarySheet;
				}

				var createStandardFormatSummarySheet = function (workbook) {
					var summarySheet = null;
					summarySheet = workbook.createSheet("Summary", 14, maxRow + 2 + tests.length);
					summarySheet.width(1, 25);
					summarySheet.width(2, 100);
					summarySheet = writeCommonAttrs(summarySheet);
					summarySheet = writeStandardTemplateHeader(summarySheet);
					summarySheet = writeStandardTableData(summarySheet);
					return summarySheet;
				};

				var createPerfFormatSummarySheet = function (workbook) {
					var summarySheet = null;
					var headings = Object.keys(JSON.parse(tests[0].customEntry));
					summarySheet = workbook.createSheet("Summary", headings.length+1, maxRow + 2 + tests.length);
					summarySheet.width(1, 25);
					summarySheet.width(2, 100);
					summarySheet = writeCommonAttrs(summarySheet);
					summarySheet = writePerformanceFormatHeader(summarySheet);
					summarySheet = writePerformanceFormatTableData(summarySheet);

					return summarySheet;
				};

				var createTestTableHeader = function (sheet, test) {

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
						indexRow++;
						if (_.isEqual(testDisplayConfig.steps.order, true)) {
							sheet.set(indexColumn, indexRow, 'Step #');
							sheet.border(indexColumn, indexRow, cellBorder);
							sheet.font(indexColumn, indexRow, headerTextStyle);
							indexColumn++;
						}
						if (_.isEqual(testDisplayConfig.steps.name, true)) {
							sheet.set(indexColumn, indexRow, 'Description');
							sheet.border(indexColumn, indexRow, cellBorder);
							sheet.font(indexColumn, indexRow, headerTextStyle);
							sheet.width(indexColumn, 50);
							sheet.wrap(indexColumn, firstBodyRow + j, 'true');
							indexColumn++;
						}
						if (inputVisibile && _.isEqual(testDisplayConfig.steps.input, true)) {
							sheet.set(indexColumn, indexRow, 'Input Data');
							sheet.border(indexColumn, indexRow, cellBorder);
							sheet.font(indexColumn, indexRow, headerTextStyle);
							indexColumn++;
						}
						if (expectedVisible && _.isEqual(testDisplayConfig.steps.expected, true)) {
							sheet.set(indexColumn, indexRow, 'Expected Result');
							sheet.border(indexColumn, indexRow, cellBorder);
							sheet.font(indexColumn, indexRow, headerTextStyle);
							indexColumn++;
						}
						if (statusVisible && _.isEqual(testDisplayConfig.steps.status, true)) {
							sheet.set(indexColumn, indexRow, 'Status');
							sheet.border(indexColumn, indexRow, cellBorder);
							sheet.font(indexColumn, indexRow, headerTextStyle);
							indexColumn++;
						}
						if (outputVisible && _.isEqual(testDisplayConfig.steps.output, true)) {
							sheet.set(indexColumn, indexRow, 'Output Data');
							sheet.border(indexColumn, indexRow, cellBorder);
							sheet.font(indexColumn, indexRow, headerTextStyle);
							indexColumn++;
						}
						if (durationVisible && _.isEqual(testDisplayConfig.steps.duration, true)) {
							sheet.set(indexColumn, indexRow, 'Execution Time');
							sheet.border(indexColumn, indexRow, cellBorder);
							sheet.font(indexColumn, indexRow, headerTextStyle);
							indexColumn++;
						}
						if (errorVisible && _.isEqual(testDisplayConfig.steps.error, true)) {
							sheet.set(indexColumn, indexRow, 'Reason for Failure');
							sheet.border(indexColumn, indexRow, cellBorder);
							sheet.font(indexColumn, indexRow, headerTextStyle);
							sheet.width(indexColumn, 75);
							indexColumn++;
						}
						return sheet;
				};

				var populateStepData = function (sheet, test, index) {
             		var detailedSheet;

					if(test.steps[index].customFormat == 'UPGRADE_FORMAT') {
						// This is for evaluating the total number of rows that are needed for the detailed sheet while creating it.
						// But totalRows * 3 is done for all values (PreMigratedVal , PostMigratedVal and Variance) and the value is
						// incremented by 10 as buffer
						var totalRows = 0;
						var inputValue = JSON.parse(test.steps[index].input);
						_.each(inputValue, function (value, key, inputValue) {
							if (_.isObject(value)) {
								_.each(value, function (vValue, vKey, value) {

									if (_.isObject(vValue)) {
										column = 1;
										var noOfKeys = Object.keys(vValue).length;
										totalRows = totalRows + noOfKeys;
									}
								});
							}
						});
						if(totalRows == 0) {
							totalRows = 1000; //defaultRowCount
						} else {
							totalRows = (totalRows*3+10);
						}
						detailedSheet = workbook.createSheet(test.name + 'detailed', 1000, totalRows);
						writeDetailedData(detailedSheet, test, index);
					}
					if (_.isEqual(testDisplayConfig.steps.order, true)) {
						sheet.set(indexColumn, firstBodyRow + index, test.steps[index].order);
						sheet.border(indexColumn, firstBodyRow + index, cellBorder);
						sheet.valign(indexColumn, firstBodyRow + index, 'top');
						indexColumn++;
					}
					if (_.isEqual(testDisplayConfig.steps.name, true)) {
						sheet.set(2, firstBodyRow + index, test.steps[index].name);
						sheet.border(2, firstBodyRow + index, cellBorder);
						sheet.valign(2, firstBodyRow + index, 'top');
						sheet.wrap(2, firstBodyRow + index, 'true');
						sheet.width(2, 30);
						indexColumn++;
					}
					if (inputVisibile && _.isEqual(testDisplayConfig.steps.input, true)) {
						if(test.steps[index].customFormat == 'UPGRADE_FORMAT') {
							sheet.set(indexColumn, firstBodyRow + index, detailedSheet.name);
						} else {
							sheet.set(indexColumn, firstBodyRow + index, formatStepsVariables(test.steps[index].input));
						}
						sheet.border(indexColumn, firstBodyRow + index, cellBorder);
						sheet.wrap(indexColumn, firstBodyRow + index, 'true');
						sheet.valign(indexColumn, firstBodyRow + index, 'top');
						sheet.width(indexColumn, 30);
						indexColumn++;
					}
					if (expectedVisible && _.isEqual(testDisplayConfig.steps.expected, true)) {
						if(test.steps[index].customFormat == 'UPGRADE_FORMAT') {
							sheet.set(indexColumn, firstBodyRow + index, detailedSheet.name);
						} else {
							sheet.set(indexColumn, firstBodyRow + index, formatStepsVariables(test.steps[index].expected));
						}
						sheet.border(indexColumn, firstBodyRow + index, cellBorder);
						sheet.wrap(indexColumn, firstBodyRow + index, 'true');
						sheet.valign(indexColumn, firstBodyRow + index, 'top');
						sheet.width(indexColumn, 30);
						indexColumn++;
					}
					if (statusVisible && _.isEqual(testDisplayConfig.steps.status, true)) {
						sheet.set(indexColumn, firstBodyRow + index, test.steps[index].status != null ? test.steps[index].status.capitalize() : test.steps[index].status);
						sheet.border(indexColumn, firstBodyRow + index, cellBorder);
						if (test.steps[index].status != null && test.steps[index].status.toLowerCase() != 'pass') {
							sheet.fill(indexColumn, firstBodyRow + index, redFont);
						}
						sheet.valign(indexColumn, firstBodyRow + index, 'top');
						indexColumn++;
					}
					if (outputVisible && _.isEqual(testDisplayConfig.steps.output, true)) {
						if(test.steps[index].customFormat == 'UPGRADE_FORMAT') {
							sheet.set(indexColumn, firstBodyRow + index, detailedSheet.name);
						} else {
							sheet.set(indexColumn, firstBodyRow + index, formatStepsVariables(test.steps[index].output));
						}
						sheet.border(indexColumn, firstBodyRow + index, cellBorder);
						sheet.wrap(indexColumn, firstBodyRow + index, 'true');
						sheet.valign(indexColumn, firstBodyRow + index, 'top');
						sheet.width(indexColumn, 30);
						indexColumn++;
					}
					if (durationVisible && _.isEqual(testDisplayConfig.steps.duration, true)) {
						if (test.steps[index].start_date != null && test.steps[index].end_date != null &&
							_.isNumber(parseInt(test.steps[index].start_date)) && _.isNumber(parseInt(test.steps[index].end_date)) &&
							_.isDate(new Date(parseInt(test.steps[index].start_date))) && _.isDate(new Date(test.steps[index].end_date)) &&
							test.steps[index].start_date <= test.steps[index].end_date) {
							sheet.set(indexColumn, firstBodyRow + index, batam_util.durationToStr(test.steps[index].end_date - test.steps[index].start_date));
							sheet.border(indexColumn, firstBodyRow + index, cellBorder);
							sheet.valign(indexColumn, firstBodyRow + index, 'top');
						}
						indexColumn++;
					}
					if (errorVisible && _.isEqual(testDisplayConfig.steps.error, true)) {
						sheet.set(indexColumn, firstBodyRow + index, test.steps[index].error);
						sheet.border(indexColumn, firstBodyRow + index, cellBorder);
						sheet.wrap(indexColumn, firstBodyRow + index, 'true');
						sheet.valign(indexColumn, firstBodyRow + index, 'top');
						indexColumn++;
					}
					return sheet;
				};

				var createDetailedSheetData = function(detailedSheet, input, header, level) {
					var obj = JSON.parse(input);
					_.each(obj, function (value, key, obj) {
						if (_.isObject(value)) {
							var column= 1, row=2;
							var pre = [], post = [], variance = [];
							var values = ['PreMigrated Value','PostMigrated Value', 'Variance'];
							_.each(value, function (vValue, vKey, value) {

								if (_.isObject(vValue)) {
									column=1;
									var noOfKeys = Object.keys(vValue).length;
									var mergeLen = (noOfKeys*level);
									detailedSheet.set(column, row, vKey);
									for(var bIndex=0;bIndex<mergeLen;bIndex++) {
										detailedSheet.border(column, row+bIndex, cellBorder);
									}
									detailedSheet.border(column,(row+mergeLen)-1, cellBorder);
									detailedSheet.wrap(column, row, 'true');
									detailedSheet.valign(column, row, 'top');
									detailedSheet.width(column, 30);
									detailedSheet.merge({col:column,row:row},{col:column,row:(row+mergeLen)-1});
									_.each(vValue, function (vValue1, vKey1, vValue) {
										pre = [], post = [], variance = [];
										column = 2;
										var mergeLen1 = mergeLen / (noOfKeys);
										detailedSheet.set(column, row, vKey1);
										for (var bIndex = 0; bIndex < mergeLen1; bIndex++) {
											detailedSheet.border(column, row + bIndex, cellBorder);
										}
										detailedSheet.valign(column, row, 'top');
										detailedSheet.width(column, 30);
										detailedSheet.merge({col: column, row: row}, {col: column, row: row + 2});
										var oldRowVal = row;
										column++;
										detailedSheet.set(column, row, 'PreMigrated Value');
										detailedSheet.border(column, row, cellBorder);
										detailedSheet.valign(column, row, 'top');
										detailedSheet.width(column, 30);

										row++;
										detailedSheet.set(column, row, 'PostMigrated Value');
										detailedSheet.border(column, row, cellBorder);
										detailedSheet.valign(column, row, 'top');
										detailedSheet.width(column, 30);

										row++;
										detailedSheet.set(column, row, 'Variance');
										detailedSheet.border(column, row, cellBorder);
										detailedSheet.valign(column, row, 'top');
										detailedSheet.width(column, 30);

										row = oldRowVal;

										var json = JSON.stringify(vValue1);
										for (var j = 0; j < header.length; j++) {
											var preVal = vValue[vKey1][header[j]][values[0]];
											var postVal = vValue[vKey1][header[j]][values[1]];
											var varVal = vValue[vKey1][header[j]][values[2]];
											pre.push(preVal);
											post.push(postVal);
											variance.push((varVal));
										}
										column = level + 1;
										for (var i = 0; i < pre.length; i++) {
											detailedSheet.set(column, row, pre[i]);
											detailedSheet.border(column, row, cellBorder);
											detailedSheet.valign(column, row, 'top');
											detailedSheet.width(column, 20);
											column++
										}
										row++;
										column = level + 1;
										for (var i = 0; i < post.length; i++) {
											detailedSheet.set(column, row, post[i]);
											detailedSheet.border(column, row, cellBorder);
											detailedSheet.valign(column, row, 'top');
											detailedSheet.width(column, 20);
											column++
										}
										row++;
										column = level + 1;
										for (var i = 0; i < variance.length; i++) {
											detailedSheet.set(column, row, variance[i]);
											detailedSheet.border(column, row, cellBorder);
											detailedSheet.valign(column, row, 'top');
											detailedSheet.width(column, 20);
											if (variance[i] != null && variance[i] != 0) {
												detailedSheet.fill(column, row, redFont);
											}
											column++;
										}
										row++;
									});
								}
							});
						}
					});
				};

				var getNumberOfLevelsInJSON = function(input, level) {
					var value;
					for(var key in input ) {
						//Fetching the element in the map and finding the depth of the JSON
						value = input[key];
						break;
					};

					if (_.isObject(value)) {
						level++;
						level = getNumberOfLevelsInJSON(value, level);
					} else if (_.isString(value) || _.isNumber(value)) {
					}
					return level;
				};

				var writeDetailedData = function (detailedSheet, test, index) {
					var len = test.steps[index].input.length;
					var input = test.steps[index].input;
					var obj = JSON.parse(input);
					var level = 0;
					level = getNumberOfLevelsInJSON(obj[1], level);
					var column = level+1;
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
						for(var l=0; l < level ; l++) {
							headings = Object.keys(node);
							node = node[headings[0]];
						}

					}catch (exception) {
						throw exception;
					}

					if(headings) {
						for (var i = 0; i < headings.length; i++) {
							if(!_.isUndefined(headings[i]) && !_.isNull(headings[i])) {
								detailedSheet.set(column, row, headings[i]);
								detailedSheet.font(column, row, headerTextStyle);
								detailedSheet.border(column, row, cellBorder);
								column++
							}
						}
					}
					createDetailedSheetData(detailedSheet, input, headings, level);
				};

				var populateTestTableData = function (sheet, test) {
					firstBodyRow = indexRow + 1;
					for (var j = 0; j < test.steps.length; j++) {
						indexColumn = 1;
						sheet = populateStepData(sheet, test, j);
					}
					return sheet;
				};

				var writeTestCommonData = function (sheet, test) {
					// Fill some data
					if (_.isEqual(testDisplayConfig.name, true)) {
						sheet.set(1, indexRow, 'Test Name');
						sheet.font(1, indexRow, headerTextStyle);
						sheet.set(2, indexRow, test.name);
						indexRow++;
					}

					if (_.isEqual(testDisplayConfig.description, true)) {
						sheet.set(1, indexRow, 'Test Description');
						sheet.font(1, indexRow, headerTextStyle);
						sheet.set(2, indexRow, test.description);
						sheet.wrap(2, indexRow, 'false');
						indexRow++;
					}

					if (_.isEqual(testDisplayConfig.start_date, true)) {
						sheet.set(1, indexRow, 'Start Date');
						sheet.font(1, indexRow, headerTextStyle);
						sheet.set(2, indexRow, test.start_date);
						indexRow++;
					}

					if (_.isEqual(testDisplayConfig.end_date, true)) {
						sheet.set(1, indexRow, 'End Date');
						sheet.font(1, indexRow, headerTextStyle);
						sheet.set(2, indexRow, test.end_date);
						indexRow++;
					}

					if (_.isEqual(testDisplayConfig.duration, true)) {
						sheet.set(1, indexRow, 'Duration');
						sheet.font(1, indexRow, headerTextStyle);
						if (test.start_date != null && test.end_date != null &&
							_.isDate(new Date(test.start_date)) && _.isDate(new Date(test.end_date))) {
							sheet.set(2, indexRow, batam_util.durationToStr(test.end_date - test.start_date));
						}
						indexRow++;
					}

					if (_.isEqual(testDisplayConfig.status, true)) {
						sheet.set(1, indexRow, 'Status');
						sheet.font(1, indexRow, headerTextStyle);
						sheet.set(2, indexRow, test.status != null ? test.status.capitalize() : test.status);
						if (test.status != null && test.status.toLowerCase() != 'pass') {
							sheet.fill(2, indexRow, redFont);
						}
						indexRow++;
					}

					if (_.isEqual(testDisplayConfig.tags, true)) {
						sheet.set(1, indexRow, 'Tags');
						sheet.font(1, indexRow, headerTextStyle);
						sheet.set(2, indexRow, test.tags);
						indexRow++;
					}
					return sheet;
				};

				var formatStepObject = function (value, result) {
					_.each(value, function (vValue, vKey, value) {
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

				var formatStepsVariables = function (input) {
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
						_.each(obj, function (value, key, obj) {
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
			if(error){
				return next(error);
			}

			//Fetch report.
			req.collections.reports.findOne({id: req.query.report_id}, fetchReport);

		};

		//Handle Error.
		if(error){
			return next(error);
		}

		//Create searchCriteria object.
		var searchCriterias = batam_util.createSearchObject(req, criterias);
		//Fetch tests based on defined searchCriterias
		req.collections.tests.find(searchCriterias).toArray(findTests);
	};

	if(validator.isNull(req.query.build_id) || !validator.matches(req.query.build_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('build_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	if(!validator.isNull(req.query.report_id)){
		if(!validator.matches(req.query.report_id, '[0-9a-zA-Z_-]+')){
			return next(new Error('report_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
		}
	}
	//Fetch all test criterias.
	req.collections.testcriterias.find().toArray(findTestCriterias);
};
