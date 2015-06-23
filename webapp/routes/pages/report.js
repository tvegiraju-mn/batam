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
					var headerCellStyle = {bold: true};
					var cellBorder = {left:'thin',top:'thin',right:'thin',bottom:'thin'};
					//Populate the data array with tests found.
					for(var i = 0; i < tests.length; i++){
						// Create a new worksheet with 10 columns and 12 rows 
						var stepsCount =  tests[i].steps != null? tests[i].steps.length : 0;
						var sheet = workbook.createSheet(tests[i].name, 8, 8+stepsCount);
						// Fill some data 
						  sheet.set(1, 1, 'Test Name');
						  sheet.font(1, 1, headerTextStyle);
						  sheet.set(1, 2, 'Test Description');
						  sheet.font(1, 2, headerTextStyle);
						  sheet.set(1, 3, 'Duration');
						  sheet.font(1, 3, headerTextStyle);
						  sheet.set(1, 4, 'Tags');
						  sheet.font(1, 4, headerTextStyle);
						  
						  sheet.set(2, 1, tests[i].name);
						  sheet.set(2, 2, tests[i].description);
						  if(tests[i].start_date != null && tests[i].end_date != null &&
		  					_.isDate(new Date(tests[i].start_date)) && _.isDate(new Date(tests[i].end_date))){
							  sheet.set(2, 3, batam_util.durationToStr(tests[i].end_date - tests[i].start_date));
						  }
						  sheet.set(2, 4, tests[i].tags);
						  
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
							  
							  sheet.set(1, 6, 'Step #');
							  sheet.border(1, 6, cellBorder);
							  sheet.font(1, 6, headerTextStyle);
							  sheet.set(2, 6, 'Name');
							  sheet.border(2, 6, cellBorder);
							  sheet.font(2, 6, headerTextStyle);
							  var column = 3;
							  if(inputVisibile){
								  sheet.set(column, 6, 'Input Data');
								  sheet.border(column, 6, cellBorder);
								  sheet.font(column, 6, headerTextStyle);
								  column++;
							  }
							  if(expectedVisible){
								  sheet.set(column, 6, 'Expected Result');
								  sheet.border(column, 6, cellBorder);
								  sheet.font(column, 6, headerTextStyle);
								  column++;
							  }
							  if(statusVisible){
								  sheet.set(column, 6, 'Status');
								  sheet.border(column, 6, cellBorder);
								  sheet.font(column, 6, headerTextStyle);
								  column++;
							  }
							  if(outputVisible){
								  sheet.set(column, 6, 'Output Data');
								  sheet.border(column, 6, cellBorder);
								  sheet.font(column, 6, headerTextStyle);
								  column++;
							  }
							  if(durationVisible){
								  sheet.set(column, 6, 'Execution Time');
								  sheet.border(column, 6, cellBorder);
								  sheet.font(column, 6, headerTextStyle);
								  column++;
							  }
							  if(errorVisible){
								  sheet.set(column, 6, 'Reason for Failure');
								  sheet.border(column, 6, cellBorder);
								  sheet.font(column, 6, headerTextStyle);
								  column++;
							  }
							  for (var j = 0; j < tests[i].steps.length; j++){
								  sheet.set(1, 7+j, tests[i].steps[j].order);
								  sheet.border(1, 7+j, cellBorder);
								  sheet.set(2, 7+j, tests[i].steps[j].name);
								  sheet.border(2, 7+j, cellBorder);
								  var column = 3;
								  if(inputVisibile){
									  sheet.set(column, 7+j, tests[i].steps[j].input);
									  sheet.border(column, 7+j, cellBorder);
									  column++;
								  }
								  if(expectedVisible){
									  sheet.set(column, 7+j, tests[i].steps[j].expected);
									  sheet.border(column, 7+j, cellBorder);
									  column++;
								  }
								  if(statusVisible){
									  sheet.set(column, 7+j, tests[i].steps[j].status);
									  sheet.border(column, 7+j, cellBorder);
									  column++;
								  }
								  if(outputVisible){
									  sheet.set(column, 7+j, tests[i].steps[j].output);
									  sheet.border(column, 7+j, cellBorder);
									  column++;
								  }
								  if(durationVisible){
									  if(tests[i].steps[j].start_date != null && tests[i].steps[j].end_date != null &&
					    					_.isNumber(parseInt(tests[i].steps[j].start_date)) && _.isNumber(parseInt(tests[i].steps[j].end_date)) &&
					    					_.isDate(new Date(parseInt(tests[i].steps[j].start_date))) && _.isDate(new Date(tests[i].steps[j].end_date)) &&
					    					tests[i].steps[j].start_date >= tests[i].steps[j].end_date){
										  sheet.set(column, 7+j, batam_util.durationToStr(tests[i].steps[j].end_date - tests[i].steps[j].start_date));
										  sheet.border(column, 7+j, cellBorder);
									  }
									  column++;
								  }
								  if(errorVisible){
									  sheet.set(column, 7+j, tests[i].steps[j].error);
									  sheet.border(column, 7+j, cellBorder);
									  column++;
								  }
							  }
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

	//if(validator.isNull(req.query.build_id) || !validator.isLength(req.query.build_id, 5, 30) || !validator.matches(req.query.build_id, '[0-9a-zA-Z_-]+')){
	if(validator.isNull(req.query.build_id) || !validator.matches(req.query.build_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('build_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	//if(validator.isNull(req.query.report_id) || !validator.isLength(req.query.report_id, 5, 60) || !validator.matches(req.query.report_id, '[0-9a-zA-Z_-]+')){
	if(!validator.isNull(req.query.report_id)){
		if(!validator.matches(req.query.report_id, '[0-9a-zA-Z_-]+')){
			return next(new Error('report_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
		}
	}
	//Fetch all test criterias.
	req.collections.testcriterias.find().toArray(findTestCriterias);
};
