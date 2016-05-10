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
	var findTestCriterias = function (error, criterias){
		var findTests = function (error, tests){
			var fetchReport = function (error, report) {
				//Handle Error.
				if (error) {
					return next(error);
				}
				mkdirp('./tmp/', function (err) {

					// Create a new workbook file in current working-path 
					var workbook = excelbuilder.createWorkbook('./tmp/', report.name + '.xlsx');
					var headerTextStyle = {bold: true};
					var cellBorder = {left: 'thin', top: 'thin', right: 'thin', bottom: 'thin'};
					var redFont = {fgColor: 'FFFF0000', type: 'solid'};
					var summaryDisplayConfig = config.reports.report.display.summary;
					var testDisplayConfig = config.reports.report.display.test;
					var indexColumn = 1;
					var indexRow = 1;
					var maxRow = 0;
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
					var maxTestRow = 0;
					maxTestRow += (_.isEqual(testDisplayConfig.name, true) ? 1 : 0);
					maxTestRow += (_.isEqual(testDisplayConfig.description, true) ? 1 : 0);
					maxTestRow += (_.isEqual(testDisplayConfig.start_date, true) ? 1 : 0);
					maxTestRow += (_.isEqual(testDisplayConfig.end_date, true) ? 1 : 0);
					maxTestRow += (_.isEqual(testDisplayConfig.duration, true) ? 1 : 0);
					maxTestRow += (_.isEqual(testDisplayConfig.status, true) ? 1 : 0);
					maxTestRow += (_.isEqual(testDisplayConfig.tags, true) ? 1 : 0);
					maxTestRow += (_.isEqual(testDisplayConfig.log, true) ? 1 : 0);

					//Create summary sheet
					var summarySheet = workbook.createSheet("Summary", 4, maxRow + 2 + tests.length);
					summarySheet.width(1, 25);
					summarySheet.width(2, 100);
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

					//Populate the data array with tests found.
					var firstBodyRow = 0;
					for (var i = 0; i < tests.length; i++) {
						indexRow = 1;
						indexColumn = 1;
						// Create a new worksheet with 10 columns and 14 rows (+ step rows) 
						var stepsCount = tests[i].steps != null ? tests[i].steps.length : 0;
						var sheet = workbook.createSheet(tests[i].name, 8, maxTestRow + 1 + stepsCount + 3);
						// Fill some data 
						if (_.isEqual(testDisplayConfig.name, true)) {
							sheet.set(1, indexRow, 'Test Name');
							sheet.font(1, indexRow, headerTextStyle);
							sheet.set(2, indexRow, tests[i].name);
							indexRow++;
						}

						if (_.isEqual(testDisplayConfig.description, true)) {
							sheet.set(1, indexRow, 'Test Description');
							sheet.font(1, indexRow, headerTextStyle);
							sheet.set(2, indexRow, tests[i].description);
							indexRow++;
						}

						if (_.isEqual(testDisplayConfig.start_date, true)) {
							sheet.set(1, indexRow, 'Start Date');
							sheet.font(1, indexRow, headerTextStyle);
							sheet.set(2, indexRow, tests[i].start_date);
							indexRow++;
						}

						if (_.isEqual(testDisplayConfig.end_date, true)) {
							sheet.set(1, indexRow, 'End Date');
							sheet.font(1, indexRow, headerTextStyle);
							sheet.set(2, indexRow, tests[i].end_date);
							indexRow++;
						}

						if (_.isEqual(testDisplayConfig.duration, true)) {
							sheet.set(1, indexRow, 'Duration');
							sheet.font(1, indexRow, headerTextStyle);
							if (tests[i].start_date != null && tests[i].end_date != null &&
								_.isDate(new Date(tests[i].start_date)) && _.isDate(new Date(tests[i].end_date))) {
								sheet.set(2, indexRow, batam_util.durationToStr(tests[i].end_date - tests[i].start_date));
							}
							indexRow++;
						}

						if (_.isEqual(testDisplayConfig.status, true)) {
							sheet.set(1, indexRow, 'Status');
							sheet.font(1, indexRow, headerTextStyle);
							sheet.set(2, indexRow, tests[i].status != null ? tests[i].status.capitalize() : tests[i].status);
							if (tests[i].status != null && tests[i].status.toLowerCase() != 'pass') {
								sheet.fill(2, indexRow, redFont);
							}
							indexRow++;
						}

						if (_.isEqual(testDisplayConfig.tags, true)) {
							sheet.set(1, indexRow, 'Tags');
							sheet.font(1, indexRow, headerTextStyle);
							sheet.set(2, indexRow, tests[i].tags);
							indexRow++;
						}

						if (tests[i].steps != null && tests[i].steps.length != 0) {
							var inputVisibile = false;
							var expectedVisible = false;
							var statusVisible = false;
							var outputVisible = false;
							var durationVisible = false;
							var errorVisible = false;
							for (var j = 0; j < tests[i].steps.length; j++) {
								if (tests[i].steps[j].input != null) {
									inputVisibile = true;
								}
								if (tests[i].steps[j].expected != null) {
									expectedVisible = true;
								}
								if (tests[i].steps[j].status != null) {
									statusVisible = true;
								}
								if (tests[i].steps[j].output != null) {
									outputVisible = true;
								}
								if (tests[i].steps[j].start_date != null && tests[i].steps[j].end_date != null) {
									durationVisible = true;
								}
								if (tests[i].steps[j].error != null) {
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
								sheet.wrap(column, firstBodyRow + j, 'true');
								indexColumn++;
							}

							var column = indexColumn;

							if (inputVisibile && _.isEqual(testDisplayConfig.steps.input, true)) {
								sheet.set(column, indexRow, 'Input Data');
								sheet.border(column, indexRow, cellBorder);
								sheet.font(column, indexRow, headerTextStyle);
								column++;
							}
							if (expectedVisible && _.isEqual(testDisplayConfig.steps.expected, true)) {
								sheet.set(column, indexRow, 'Expected Result');
								sheet.border(column, indexRow, cellBorder);
								sheet.font(column, indexRow, headerTextStyle);
								column++;
							}
							if (statusVisible && _.isEqual(testDisplayConfig.steps.status, true)) {
								sheet.set(column, indexRow, 'Status');
								sheet.border(column, indexRow, cellBorder);
								sheet.font(column, indexRow, headerTextStyle);
								column++;
							}
							if (outputVisible && _.isEqual(testDisplayConfig.steps.output, true)) {
								sheet.set(column, indexRow, 'Output Data');
								sheet.border(column, indexRow, cellBorder);
								sheet.font(column, indexRow, headerTextStyle);
								column++;
							}
							if (durationVisible && _.isEqual(testDisplayConfig.steps.duration, true)) {
								sheet.set(column, indexRow, 'Execution Time');
								sheet.border(column, indexRow, cellBorder);
								sheet.font(column, indexRow, headerTextStyle);
								column++;
							}
							if (errorVisible && _.isEqual(testDisplayConfig.steps.error, true)) {
								sheet.set(column, indexRow, 'Reason for Failure');
								sheet.border(column, indexRow, cellBorder);
								sheet.font(column, indexRow, headerTextStyle);
								sheet.width(column, 75);
								column++;
							}
							firstBodyRow = indexRow + 1;
							for (var j = 0; j < tests[i].steps.length; j++) {
								indexColumn = 1;
								if (_.isEqual(testDisplayConfig.steps.order, true)) {
									sheet.set(indexColumn, firstBodyRow + j, tests[i].steps[j].order);
									sheet.border(indexColumn, firstBodyRow + j, cellBorder);
									sheet.valign(indexColumn, firstBodyRow + j, 'top');
									indexColumn++;
								}
								if (_.isEqual(testDisplayConfig.steps.name, true)) {
									sheet.set(2, firstBodyRow + j, tests[i].steps[j].name);
									sheet.border(2, firstBodyRow + j, cellBorder);
									sheet.valign(2, firstBodyRow + j, 'top');
									sheet.wrap(2, firstBodyRow + j, 'true');
									sheet.width(2, 30);
									indexColumn++;
								}
								column = indexColumn;
								if (inputVisibile && _.isEqual(testDisplayConfig.steps.input, true)) {
									sheet.set(column, firstBodyRow + j, formatStepsVariables(tests[i].steps[j].input));
									sheet.border(column, firstBodyRow + j, cellBorder);
									sheet.wrap(column, firstBodyRow + j, 'true');
									sheet.valign(column, firstBodyRow + j, 'top');
									sheet.width(column, 30);
									column++;
								}
								if (expectedVisible && _.isEqual(testDisplayConfig.steps.expected, true)) {
									sheet.set(column, firstBodyRow + j, formatStepsVariables(tests[i].steps[j].expected));
									sheet.border(column, firstBodyRow + j, cellBorder);
									sheet.wrap(column, firstBodyRow + j, 'true');
									sheet.valign(column, firstBodyRow + j, 'top');
									sheet.width(column, 30);
									column++;
								}
								if (statusVisible && _.isEqual(testDisplayConfig.steps.status, true)) {
									sheet.set(column, firstBodyRow + j, tests[i].steps[j].status != null ? tests[i].steps[j].status.capitalize() : tests[i].steps[j].status);
									sheet.border(column, firstBodyRow + j, cellBorder);
									if (tests[i].steps[j].status != null && tests[i].steps[j].status.toLowerCase() != 'pass') {
										sheet.fill(column, firstBodyRow + j, redFont);
									}
									sheet.valign(column, firstBodyRow + j, 'top');
									column++;
								}
								if (outputVisible && _.isEqual(testDisplayConfig.steps.output, true)) {
									sheet.set(column, firstBodyRow + j, formatStepsVariables(tests[i].steps[j].output));
									sheet.border(column, firstBodyRow + j, cellBorder);
									sheet.wrap(column, firstBodyRow + j, 'true');
									sheet.valign(column, firstBodyRow + j, 'top');
									sheet.width(column, 30);
									column++;
								}
								if (durationVisible && _.isEqual(testDisplayConfig.steps.duration, true)) {
									if (tests[i].steps[j].start_date != null && tests[i].steps[j].end_date != null &&
										_.isNumber(parseInt(tests[i].steps[j].start_date)) && _.isNumber(parseInt(tests[i].steps[j].end_date)) &&
										_.isDate(new Date(parseInt(tests[i].steps[j].start_date))) && _.isDate(new Date(tests[i].steps[j].end_date)) &&
										tests[i].steps[j].start_date <= tests[i].steps[j].end_date) {
										sheet.set(column, firstBodyRow + j, batam_util.durationToStr(tests[i].steps[j].end_date - tests[i].steps[j].start_date));
										sheet.border(column, firstBodyRow + j, cellBorder);
										sheet.valign(column, firstBodyRow + j, 'top');
									}
									column++;
								}
								if (errorVisible && _.isEqual(testDisplayConfig.steps.error, true)) {
									sheet.set(column, firstBodyRow + j, tests[i].steps[j].error);
									sheet.border(column, firstBodyRow + j, cellBorder);
									sheet.wrap(column, firstBodyRow + j, 'true');
									sheet.valign(column, firstBodyRow + j, 'top');
									column++;
								}
							}
						}
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
