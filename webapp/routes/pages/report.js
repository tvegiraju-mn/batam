var _ = require('underscore');
var util = require('util');
var validator = require('validator');
var excelbuilder = require('msexcel-builder-colorfix');
var fs = require('fs');
var batam_util = config = require('../../util/util.js');
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
			var fetchReport = function (error, report){
				//Handle Error.
				if(error){
					return next(error);
				}
				mkdirp('./tmp/', function(err) { 

					// Create a new workbook file in current working-path 
					var workbook = excelbuilder.createWorkbook('./tmp/', report.name+'.xlsx');
					var headerTextStyle = {bold: true};
					var cellBorder = {left:'thin',top:'thin',right:'thin',bottom:'thin'};
					var redFont = {fgColor:'FFFF0000', type:'solid'};
					
					//Create summary sheet
					var summarySheet = workbook.createSheet("Summary", 4, 14+tests.length);
					summarySheet.width(1, 25);
					summarySheet.width(2, 100);
					summarySheet.set(1, 1, 'Functional Area');
					summarySheet.font(1, 1, headerTextStyle);
					summarySheet.set(2, 1, report.name);
					
					summarySheet.set(1, 2, 'Description');
					summarySheet.font(1, 2, headerTextStyle);
					summarySheet.set(2, 2, report.description);
					
					summarySheet.set(1, 3, 'Start Date');
					summarySheet.font(1, 3, headerTextStyle);
					summarySheet.set(2, 3, report.date);
					
					summarySheet.set(1, 4, 'End Date');
					summarySheet.font(1, 4, headerTextStyle);
					summarySheet.set(2, 4, report.end_date);
					
					summarySheet.set(1, 5, 'Status');
					summarySheet.font(1, 5, headerTextStyle);
					summarySheet.set(2, 5, report.status != null ? report.status.capitalize() : report.status);
					if(report.status != null && report.status.toLowerCase() != 'pass' && report.status.toLowerCase() != 'completed'){
						summarySheet.fill(2, 5, redFont);
	  				}
					summarySheet.set(2, 5, report.status);
					
					summarySheet.set(1, 6, 'Duration');
					summarySheet.font(1, 6, headerTextStyle);
					summarySheet.set(2, 6, batam_util.durationToStr(report.duration.value));
					
					summarySheet.set(1, 8, 'Total');
					summarySheet.font(1, 8, headerTextStyle);
					if(!_.isUndefined(report.tests.all) && !_.isNull(report.tests.all)){
						summarySheet.set(2, 8, report.tests.all.value); 
					}
					
					summarySheet.set(1, 9, 'Passes');
					summarySheet.font(1, 9, headerTextStyle);
					if(!_.isUndefined(report.tests.passes) && !_.isNull(report.tests.passes)){
						summarySheet.set(2, 9, report.tests.passes.value);
					}
					
					summarySheet.set(1, 10, 'Failures');
					summarySheet.font(1, 10, headerTextStyle);
					if(!_.isUndefined(report.tests.failures) && !_.isNull(report.tests.failures)){
						summarySheet.set(2, 10, report.tests.failures.value);
						if(report.tests.failures.value > 0){
							summarySheet.fill(2, 10, redFont);
						}
					}	
					
					summarySheet.set(1, 11, 'Not Completed');
					summarySheet.font(1, 11, headerTextStyle);
					if(!_.isUndefined(report.tests.regressions) && !_.isNull(report.tests.regressions) && 
							!_.isUndefined(report.tests.failures) && !_.isNull(report.tests.failures)){
						summarySheet.set(2, 11, report.tests.regressions.value - report.tests.failures.value);
						if((report.tests.regressions.value - report.tests.failures.value) > 0){
							summarySheet.fill(2, 11, redFont);
						}
					}
					
					summarySheet.set(1, 13, 'Serial Number');
					summarySheet.font(1, 13, headerTextStyle);
					summarySheet.border(1, 13, cellBorder);
					
					summarySheet.set(2, 13, 'Test Name');
					summarySheet.font(2, 13, headerTextStyle);
					summarySheet.border(2, 13, cellBorder);
					
					summarySheet.set(3, 13, 'Status');
					summarySheet.font(3, 13, headerTextStyle);
					summarySheet.border(3, 13, cellBorder);
					
					summarySheet.set(4, 13, 'Duration');
					summarySheet.font(4, 13, headerTextStyle);
					summarySheet.border(4, 13, cellBorder);
					
					for(var i = 0; i < tests.length; i++){
						summarySheet.set(1, 14+i, i+1);
						summarySheet.border(1, 14+i, cellBorder);
						var testName = tests[i].name;
						if(tests[i].description != null){
							testName += ' - '+tests[i].description;
						}
						summarySheet.set(2, 14+i, testName);
						summarySheet.border(2, 14+i, cellBorder);
						summarySheet.wrap(2, 14+i, 'true');
						summarySheet.set(3, 14+i, tests[i].status != null ? tests[i].status.capitalize() : tests[i].status);
						if(tests[i].status != null && tests[i].status.toLowerCase() != 'pass'){
							summarySheet.fill(3, 14+i, redFont);
		  				}
						summarySheet.valign(3, 14+i, 'top');
						summarySheet.border(3, 14+i, cellBorder);
						summarySheet.set(4, 14+i, batam_util.durationToStr(tests[i].duration.value));
						summarySheet.border(4, 14+i, cellBorder);
					}
					
					//Populate the data array with tests found.
					for(var i = 0; i < tests.length; i++){
						// Create a new worksheet with 10 columns and 12 rows 
						var stepsCount =  tests[i].steps != null? tests[i].steps.length : 0;
						var sheet = workbook.createSheet(tests[i].name, 8, 11+stepsCount);
						// Fill some data 
						  sheet.set(1, 1, 'Test Name');
						  sheet.font(1, 1, headerTextStyle);
						  sheet.set(2, 1, tests[i].name);
						  
						  sheet.set(1, 2, 'Test Description');
						  sheet.font(1, 2, headerTextStyle);
						  sheet.set(2, 2, tests[i].description);
						  
						  sheet.set(1, 3, 'Duration');
						  sheet.font(1, 3, headerTextStyle);
						  if(tests[i].start_date != null && tests[i].end_date != null &&
		  					_.isDate(new Date(tests[i].start_date)) && _.isDate(new Date(tests[i].end_date))){
							  sheet.set(2, 3, batam_util.durationToStr(tests[i].end_date - tests[i].start_date));
						  }
						  
						  sheet.set(1, 4, 'Status');
						  sheet.font(1, 4, headerTextStyle);
						  sheet.set(2, 4, tests[i].status != null ? tests[i].status.capitalize() : tests[i].status);
						  if(tests[i].status != null && tests[i].status.toLowerCase() != 'pass'){
							  sheet.fill(2, 4, redFont);
		  				  }
						  
						  sheet.set(1, 5, 'Tags');
						  sheet.font(1, 5, headerTextStyle);
						  sheet.set(2, 5, tests[i].tags);
						  
						  if(tests[i].steps != null && tests[i].steps.length != 0){
							  var inputVisibile = false;
							  var expectedVisible = false;
							  var statusVisible = false;
							  var outputVisible = false;
							  var durationVisible = false;
							  var errorVisible = false;
							  for (var j = 0; j < tests[i].steps.length; j++){
								  if(tests[i].steps[j].input != null){
									  inputVisibile = true;
								  }
								  if(tests[i].steps[j].expected != null){
									  expectedVisible = true;
								  }
								  if(tests[i].steps[j].status != null){
									  statusVisible = true;
								  }
								  if(tests[i].steps[j].output != null){
									  outputVisible = true;
								  }
								  if(tests[i].steps[j].start_date != null && tests[i].steps[j].end_date != null){
									  durationVisible = true;
								  }
								  if(tests[i].steps[j].error != null){
									  errorVisible = true;
								  }
							  }
							  
							  sheet.set(1, 7, 'Step #');
							  sheet.border(1, 7, cellBorder);
							  sheet.font(1, 7, headerTextStyle);
							  sheet.set(2, 7, 'Description');
							  sheet.border(2, 7, cellBorder);
							  sheet.font(2, 7, headerTextStyle);
							  sheet.width(2, 50);
							  var column = 3;
							  if(inputVisibile){
								  sheet.set(column, 7, 'Input Data');
								  sheet.border(column, 7, cellBorder);
								  sheet.font(column, 7, headerTextStyle);
								  column++;
							  }
							  if(expectedVisible){
								  sheet.set(column, 7, 'Expected Result');
								  sheet.border(column, 7, cellBorder);
								  sheet.font(column, 7, headerTextStyle);
								  column++;
							  }
							  if(statusVisible){
								  sheet.set(column, 7, 'Status');
								  sheet.border(column, 7, cellBorder);
								  sheet.font(column, 7, headerTextStyle);
								  column++;
							  }
							  if(outputVisible){
								  sheet.set(column, 7, 'Output Data');
								  sheet.border(column, 7, cellBorder);
								  sheet.font(column, 7, headerTextStyle);
								  column++;
							  }
							  if(durationVisible){
								  sheet.set(column, 7, 'Execution Time');
								  sheet.border(column, 7, cellBorder);
								  sheet.font(column, 7, headerTextStyle);
								  column++;
							  }
							  if(errorVisible){
								  sheet.set(column, 7, 'Reason for Failure');
								  sheet.border(column, 7, cellBorder);
								  sheet.font(column, 7, headerTextStyle);
								  sheet.width(column, 75);
								  column++;
							  }
							  for (var j = 0; j < tests[i].steps.length; j++){
								  sheet.set(1, 8+j, tests[i].steps[j].order);
								  sheet.border(1, 8+j, cellBorder);
								  sheet.valign(1, 8+j, 'top');

								  sheet.set(2, 8+j, tests[i].steps[j].name);
								  sheet.border(2, 8+j, cellBorder);
								  sheet.valign(2, 8+j, 'top');

								  column = 3;
								  if(inputVisibile){
									  sheet.set(column, 8+j, tests[i].steps[j].input);
									  sheet.border(column, 8+j, cellBorder);
									  sheet.wrap(column, 8+j, 'true');
									  sheet.valign(column, 8+j, 'top');
									  column++;
								  }
								  if(expectedVisible){
									  sheet.set(column, 8+j, tests[i].steps[j].expected);
									  sheet.border(column, 8+j, cellBorder);
									  sheet.wrap(column, 8+j, 'true');
									  sheet.valign(column, 8+j, 'top');
									  column++;
								  }
								  if(statusVisible){
									  sheet.set(column, 8+j, tests[i].steps[j].status != null ? tests[i].steps[j].status.capitalize() : tests[i].steps[j].status);
									  sheet.border(column, 8+j, cellBorder);
									  if(tests[i].steps[j].status != null && tests[i].steps[j].status.toLowerCase() != 'pass'){
										  sheet.fill(column, 8+j, redFont);
					  				  }
									  sheet.valign(column, 8+j, 'top');
									  column++;
								  }
								  if(outputVisible){
									  sheet.set(column, 8+j, tests[i].steps[j].output);
									  sheet.border(column, 8+j, cellBorder);
									  sheet.wrap(column, 8+j, 'true');
									  sheet.valign(column, 8+j, 'top');
									  column++;
								  }
								  if(durationVisible){
									  if(tests[i].steps[j].start_date != null && tests[i].steps[j].end_date != null &&
					    					_.isNumber(parseInt(tests[i].steps[j].start_date)) && _.isNumber(parseInt(tests[i].steps[j].end_date)) &&
					    					_.isDate(new Date(parseInt(tests[i].steps[j].start_date))) && _.isDate(new Date(tests[i].steps[j].end_date)) &&
					    					tests[i].steps[j].start_date <= tests[i].steps[j].end_date){
										  sheet.set(column, 8+j, batam_util.durationToStr(tests[i].steps[j].end_date - tests[i].steps[j].start_date));
										  sheet.border(column, 8+j, cellBorder);
										  sheet.valign(column, 8+j, 'top');
									  }
									  column++;
								  }
								  if(errorVisible){
									  sheet.set(column, 8+j, tests[i].steps[j].error);
									  sheet.border(column, 8+j, cellBorder);
									  sheet.wrap(column, 8+j, 'true');
									  sheet.valign(column, 8+j, 'top');
									  column++;
								  }
							  }
						}
						if(tests[i].steps != null && !_.isUndefined(tests[i].steps)){
							sheet.set(1, 8+tests[i].steps.length+2, "Logs");
							sheet.valign(1, 8+tests[i].steps.length+2, 'top');
							sheet.font(1, 8+tests[i].steps.length+2, headerTextStyle);
							sheet.set(2, 8+tests[i].steps.length+2, tests[i].log);
							sheet.wrap(2, 8+tests[i].steps.length+2, 'true');
							sheet.merge({col:2,row:8+tests[i].steps.length+2},{col:5,row:8+tests[i].steps.length+2});
							sheet.height(8+tests[i].steps.length+2, 50);
						}
					}  
					
					// Save it 
					workbook.save(function(ok){
					    if (!ok) {
						      var file = fs.readFileSync('./tmp/'+report.name+'.xlsx', 'binary');
						      res.setHeader('Content-disposition', 'attachment; filename='+report.name+'.xlsx');
						      res.setHeader('Content-Length', file.length);
						      res.write(file, 'binary');
						      fs.unlinkSync('./tmp/'+report.name+'.xlsx');
						      res.end();
					    }else{
						      workbook.cancel();
						      res.end();
					    }
					  });
				});
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
