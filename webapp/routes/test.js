var _ = require('underscore');
var util = require('util');
var mongoskin = require('mongoskin');
var validator = require('validator');
var formatter = config = require('../util/formatter.js');
var PDFKit = require('pdfkit');

/**
 * PAGE path /:build_id/report/:report_id/test/:test_id
 */
exports.show = showTest;

function showTest(req, res, next){
	var findBuild = function (error, build){
		var findReport = function (error, report){
			var findTest = function (error, test){
				
				//Validate query result.
				if(error){
					return next(error);
				}
				if(_.isEmpty(report) || _.isNull(test)){
					return next('Test '+req.params.test_id+' for report '+req.params.report_id+' in build '+req.params.build_id+' not found.');
				}
				
				//Render page
				res.render('build/report/test/view', {build_id: build.id, build_name: build.name, report_id: report.id, report_name: report.name, test_id: test._id});
			};
		    
			//Handle Error.
			if(error){ 
				return next(error);
			}
			if(_.isEmpty(report) || _.isNull(report)){
				return next('Report '+req.params.report_id+' for build '+req.params.build_id+' not found.');
			}
			
			//Fetch test.
			req.collections.tests.findOne({_id: mongoskin.helper.toObjectID(req.params.test_id), report_id: req.params.report_id}, findTest);
		
		};
		
		//Handle Error.
		if(error){
			return next(error);
		}
		if(_.isEmpty(build) || _.isNull(build)){
			return next('Build '+req.params.build_id+' not found.');
		}
		if(build.lifecycle_status != 'completed'){
			return next('Build '+req.params.build_id+' not complete.');
		}
		
		//Fetch build report.
		req.collections.reports.findOne({id: req.params.report_id, build_id: build.id}, findReport);
	};
	
	//Validate inputs.
	if(!req.params.build_id || !req.params.report_id || !req.params.test_id){
		return next(new Error('No build_id, report_id or test_id params in url.'));
	}
	//if(validator.isNull(req.params.build_id) || !validator.isLength(req.params.build_id, 5, 30) || !validator.matches(req.params.build_id, '[0-9a-zA-Z_-]+')){
	if(validator.isNull(req.params.build_id) || !validator.matches(req.params.build_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('build_id param should not be null, between 5 and 30 characters and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	//if(validator.isNull(req.params.report_id) || !validator.isLength(req.params.report_id, 5, 60) || !validator.matches(req.params.report_id, '[0-9a-zA-Z_-]+')){
	if(validator.isNull(req.params.report_id) || !validator.matches(req.params.report_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('report_id param should not be null, between 5 and 60 characters and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	if(validator.isNull(req.params.test_id) || !validator.isMongoId(req.params.test_id)){
		return next(new Error('test_id param should not be null and correspond to a MongoDB Id.'));
	}
		
	//Fetch query result.
	req.collections.builds.findOne({id: req.params.build_id}, findBuild);
}

/**
 * API path /api/tests
 */
exports.list = findTestList; 

function findTestList(req, res, next){
	var findTestCriterias = function (error, criterias){
		var findTests = function (error, tests){
			var countTest = function (error, count){
				//Validate query result.
				if(error){
					return next(error);
				}
				if(_.isNull(count)){
					count = 0;
				}				
				
				result.recordsTotal = count;
				result.recordsFiltered = count;
				result.data = data;
				//Send result.
				res.send(result);
			};
			
			//Handle Error.
			if(error){
				return next(error);
			}
			
			//Populate the data array with tests found.
			for(var index in tests){
				data[index] = ['<a href="/'+req.query.build_id+'/report/'+req.query.report_id+'/test/'+tests[index]._id+'">'+tests[index].name+'</a>', formatter.formatStatus(tests[index].status), formatter.formatRegression(tests[index].status, tests[index].regression), formatter.formatTime(tests[index].time)]; 
				for(var i = 0; i < criterias.length; i++){
					var currentCriterias = replaceAll(" ", "_", criterias[i].name.toLowerCase());
					if(!_.isUndefined(tests[index][currentCriterias])){
						data[index][4+i] = tests[index][currentCriterias];
					}else{
						data[index][4+i] = " ";
					}
				}
			}
			
			//Count number of retuned tests and send response.
			req.collections.tests.count(searchCriterias, countTest);
		};
		
		//Handle Error.
		if(error){
			return next(error);
		}
		
		//Create searchCriteria object.
		var searchCriterias = createSearchCriterias(req, criterias);
		
		//Fetch tests based on defined searchCriterias
		req.collections.tests.find(searchCriterias)
			.limit(parseInt(req.query.length))
			.skip(parseInt(req.query.start))
				.toArray(findTests);
	};
	
	//Validate inputs.
	if(!req.query.draw || !req.query.length || !req.query.start || !req.query.build_id || !req.query.report_id){
		return next(new Error('No draw, length, start, build_id or report_id query params.'));
	}
	//if(validator.isNull(req.query.build_id) || !validator.isLength(req.query.build_id, 5, 30) || !validator.matches(req.query.build_id, '[0-9a-zA-Z_-]+')){
	if(validator.isNull(req.query.build_id) || !validator.matches(req.query.build_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('build_id param should not be null, between 5 and 30 characters and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	//if(validator.isNull(req.query.report_id) || !validator.isLength(req.query.report_id, 5, 60) || !validator.matches(req.query.report_id, '[0-9a-zA-Z_-]+')){
	if(validator.isNull(req.query.report_id) || !validator.matches(req.query.report_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('report_id param should not be null, between 5 and 60 characters and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	if(validator.isNull(req.query.draw) || !validator.isInt(req.query.draw)){
		return next(new Error('draw param should not be null and should be a number.'));
	}
	if(validator.isNull(req.query.length) || !validator.isInt(req.query.length)){
		return next(new Error('length param should not be null and should be a number.'));
	}
	if(validator.isNull(req.query.start) || !validator.isInt(req.query.start)){
		return next(new Error('start param should not be null and should be a numbe.r'));
	}
	
	//Create response object.
	var result = {};
	//Set draw value.
	result.draw = req.query.draw;
	//Create data obejct array.
	var data = [];
	
	//Fetch all test criterias.
	req.collections.testcriterias.find().toArray(findTestCriterias);
}

/**
 * PAGE path /:build_id/report/:report_id/download
 */
exports.download = downloadPDF; 

function downloadPDF(req, res, next){
	var findBuild = function(error, build){
		var findReports = function(error, reports){
			var findTests = function(error, tests){
				//Handle Error.
				if(error){
					return next(error);
				}
				
				//Create a pdf document
				var doc = new PDFKit();
				var stream = doc.pipe(res);
				
				//First page (Build infos)
				doc.fillColor('black').fontSize(30).text('Build Report', 100, 80);
				doc.moveDown();
				doc.fontSize(15).text('Build Name', {underline:true, continued: true}).text(': '+build.name, {underline:false});
				doc.moveDown();
				doc.fontSize(15).text('Date', {underline:true, continued: true}).text(': '+build.date, {underline:false});
				doc.moveDown();
				if(!_.isNull(build.duration.value)){
					doc.fontSize(15).text('Duration', {underline:true, continued: true}).text(': '+durationToStr(build.duration.value), {underline:false});
				}else{
					doc.fontSize(15).text('Duration', {underline:true, continued: true}).text(': Not Available', {underline:false});
				}	
				doc.moveDown();
				doc.fontSize(15).text('Failures', {underline:true, continued: true}).text(': '+(parseInt(build.failures.value) + parseInt(build.errors.value)), {underline:false});
				
				doc.rect(60, 350, 350, 25).fillAndStroke("#F0F0F0", "black");
				doc.rect(410, 350, 60, 25).fillAndStroke("#F0F0F0", "black");
				doc.rect(470, 350, 60, 25).fillAndStroke("#F0F0F0", "black");
				doc.fontSize(12).fillColor('black').text('Report Name', 65, 355);
				doc.fontSize(12).fillColor('black').text('Tests', 415, 355);
				doc.fontSize(12).fillColor('black').text('Failures', 475, 355);
				for(var i = 1; i <= reports.length; i++){
					doc.rect(60, 350+(i*25), 350, 25).fillAndStroke("white", "black");
					doc.rect(410, 350+(i*25), 60, 25).fillAndStroke("white", "black");
					if(reports[i-1].tests.regressions.value != 0){
						doc.rect(470, 350+(i*25), 60, 25).fillAndStroke("#990000", "black");
					}else{
						doc.rect(470, 350+(i*25), 60, 25).fillAndStroke("#669966", "black");
					}
					
					doc.fontSize(12).fillColor('black').text(reports[i-1].name, 65, 350+(i*25)+5);
					doc.fontSize(12).fillColor('black').text(reports[i-1].tests.all.value, 415, 350+(i*25)+5);
					doc.fontSize(12).fillColor('black').text(reports[i-1].tests.regressions.value, 475, 350+(i*25)+5);
				}
			
				for(var i = 0; i < reports.length; i++){
					doc.addPage();	
					doc.fontSize(15).fillColor('black').text('Report Name', {underline:true, continued: true}).text(': '+reports[i].name, {underline:false});
					doc.moveDown();
					doc.fontSize(12).text(reports[i].description, {underline:false});
					
					doc.rect(60, 150, 410, 25).fillAndStroke("#F0F0F0", "black");
					doc.rect(470, 150, 60, 25).fillAndStroke("#F0F0F0", "black");
					doc.fontSize(12).fillColor('black').text('Test Name', 65, 155);
					doc.fontSize(12).fillColor('black').text('Status', 475, 155);
					var rowPerPage = 22;
					var initialYAxis = 150;
					var pageIndex = 1;
					for(var j = 0; j < tests.length; j++){
						//fetch test that belongs to the current report
						if(tests[j].report_id == reports[i].id){
							if(pageIndex % rowPerPage == 0){
								doc.addPage();
								pageIndex = 1;
								rowPerPage = 26;
								initialYAxis = 50;
							}
						
						
							doc.rect(60, initialYAxis+(pageIndex * 25), 410, 25).fillAndStroke("white", "black");
							if(tests[j].status != 'pass'){
								doc.rect(470, initialYAxis+(pageIndex * 25), 60, 25).fillAndStroke("#990000", "black");
							}else{
								doc.rect(470, initialYAxis+(pageIndex * 25), 60, 25).fillAndStroke("#669966", "black");
							}
							
							doc.fontSize(12).fillColor('black').text(tests[j].name, 65, initialYAxis + (pageIndex * 25) + 5);
							doc.fontSize(12).fillColor('black').text(tests[j].status, 475, initialYAxis + (pageIndex * 25) + 5);
							pageIndex++;
						}
					}
				}
				
				for(var i = 0; i < reports.length; i++){
					doc.addPage();	
					doc.fontSize(15).fillColor('black').text('Report Name', {underline:true, continued: true}).text(': '+reports[i].name, {underline:false});
					doc.moveDown();
					doc.fontSize(12).text(reports[i].description, {underline:false});
					for(var j = 0; j < tests.length; j++){
						//fetch test that belongs to the current report
						if(tests[j].report_id == reports[i].id){
							doc.addPage();
							doc.fontSize(15).fillColor('black').text('Test Name', {underline:true, continued: true}).text(': '+tests[j].name, {underline:false});
							doc.moveDown();
							doc.fontSize(12).text(tests[j].description == null ? "No description available" : tests[j].description, {underline:false});
							
							doc.rect(100, initialYAxis+(0 * 25), 100, 25).fillAndStroke("#F0F0F0", "black");
							if(tests[j].status != 'pass'){
								doc.rect(200, initialYAxis+(0 * 25), 300, 25).fillAndStroke("#990000", "black");
							}else{
								doc.rect(200, initialYAxis+(0 * 25), 300, 25).fillAndStroke("#669966", "black");
							}			
							doc.fontSize(12).fillColor('black').text("Status", 105, 150 + (0 * 25) + 5);
							doc.fontSize(12).fillColor('black').text(tests[j].status, 205, 150 + (0 * 25) + 5);
							
							doc.rect(100, initialYAxis+(1 * 25), 100, 25).fillAndStroke("#F0F0F0", "black");
							doc.rect(200, initialYAxis+(1 * 25), 300, 25).fillAndStroke("white", "black");			
							doc.fontSize(12).fillColor('black').text("Start Time", 105, 150 + (1 * 25) + 5);
							doc.fontSize(12).fillColor('black').text(tests[j].date+" ms", 205, 150 + (1 * 25) + 5);
							
							doc.rect(100, initialYAxis+(2 * 25), 100, 25).fillAndStroke("#F0F0F0", "black");
							doc.rect(200, initialYAxis+(2 * 25), 300, 25).fillAndStroke("white", "black");			
							doc.fontSize(12).fillColor('black').text("Duration", 105, 150 + (2 * 25) + 5);
							doc.fontSize(12).fillColor('black').text(tests[j].duration.value+" ms", 205, 150 + (2 * 25) + 5);
							
							doc.moveDown();
							doc.fontSize(15).fillColor('black').text("Logs", 105, 250);
							doc.fontSize(12).text(tests[j].log);
						}
					}
				}
					
				   
				// end and display the document in the iframe to the right
				doc.end();
			};
			
			//Handle Error.
			if(error){
				return next(error);
			}
			
			if(reports == null){
				return next(new Error('Reports does not exist.'));
			}
			
			//Fetch all build tests
			req.collections.tests.find({build_id : build.id}).toArray(findTests);
		};
		
		//Handle Error.
		if(error){
			return next(error);
		}
		
		if(build == null){
			return next(new Error('Build does not exist.'));
		}
		
		//Fetch Reports
		req.collections.reports.find({build_id : build.id}).toArray(findReports);
	};
	
	//Validate inputs.
	if(!req.params.build_id){
		return next(new Error('No build_id param in url.'));
	}
	
	//if(validator.isNull(req.params.build_id) || !validator.isLength(req.params.build_id, 5, 30) || !validator.matches(req.params.build_id, '[0-9a-zA-Z_-]+')){
	if(validator.isNull(req.params.build_id) || !validator.matches(req.params.build_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('build_id param should not be null, between 5 and 30 characters and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	
	//Fetch Build
	req.collections.builds.findOne({id : req.params.build_id}, findBuild);
	
}
	
function durationToStr (milliseconds) {
	var result = '';
    var temp = Math.floor(milliseconds / 1000);

    var days = Math.floor((temp %= 31536000) / 86400);
    if (days) {
    	result += days + ' d ';
    }
    var hours = Math.floor((temp %= 86400) / 3600);
    if (hours) {
    	result += hours + ' h ';
    }
    var minutes = Math.floor((temp %= 3600) / 60);
    if (minutes) {
    	result += minutes + ' m ';
    }
    var seconds = temp % 60;
    if (seconds) {
    	result += seconds + ' sec ';
    }
    if(result == 0){
    	return milliseconds + ' ms ';
    }
    return result; 
}
	
/**
 * API path /api/tests/stat
 */
exports.stat = findStat; 

function findStat(req, res, next){
	var findTestCriterias = function (error, criterias){
		var aggregateTestStat = function (error, stat){
			//Handle Error.
			if(error){
				return next(error);
			}
			
			//Set name
			result.name = statName;
			
			//Set Values
			var values = [];
			for(var j = 0; j < stat.length; j++){
				values[j] = {name: stat[j][req.query.graph] == null? "Others": stat[j][req.query.graph] , value : stat[j].count};
			}
			result.values = values;
			
			//Send result.
			res.send({stat: result});
		};
		
		//Handle Error.
		if(error) {
			return next(error);
		}
		
		//Fetch the graph name that need to be returned.
		var statName;
		if(req.query.graph == 'status'){
			statName = "Status"
		}else if(req.query.graph == 'regression'){
			statName = "Regression"
		}else if(req.query.graph == 'time'){
			statName = "Time"
		}else{
			for(var i = 0; i < criterias.length; i++){
				var currentCriterias = replaceAll(" ", "_", criterias[i].name.toLowerCase());
				if(currentCriterias == req.query.graph){
					statName = criterias[i].name;
				}
			}
		}
		
		//Create searchCriteria object.
		var searchCriterias = createSearchCriterias(req, criterias);
		
		//Fetch stats based on search criterias.
		req.collections.tests.group([req.query.graph],
			searchCriterias,
			{count: 0},
			"function(curr, prev){prev.count++;}", 
			aggregateTestStat);
	};
	
	//Validate inputs.
	if(!req.query.build_id || !req.query.report_id || !req.query.graph) {
		return next(new Error('No build_id, report_id or graph query params.'));
	}
	//if(validator.isNull(req.query.build_id) || !validator.isLength(req.query.build_id, 5, 30) || !validator.matches(req.query.build_id, '[0-9a-zA-Z_-]+')){
	if(validator.isNull(req.query.build_id) || !validator.matches(req.query.build_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('build_id param should not be null, between 5 and 30 characters and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	//if(validator.isNull(req.query.report_id) || !validator.isLength(req.query.report_id, 5, 60) || !validator.matches(req.query.report_id, '[0-9a-zA-Z_-]+')){
	if(validator.isNull(req.query.report_id) || !validator.matches(req.query.report_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('report_id param should not be null, between 5 and 60 characters and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	//if(validator.isNull(req.query.graph) || !validator.isLength(req.query.graph, 3, 20) || !validator.matches(req.query.graph, '[0-9a-zA-Z_-]+')){
	if(validator.isNull(req.query.graph) || !validator.matches(req.query.graph, '[0-9a-zA-Z_-]+')){
		return next(new Error('report_id param should not be null, between 3 and 20 characters and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	
	//Create response object.
	var result = {};
	
	//Fetch all test criterias.
	req.collections.testcriterias.find().toArray(findTestCriterias);
}

/**
 * Function that create a SearchCriterias object based on query param send in the URL.
 * This Object can be then used to filter result while using MongoDb apis.
 */
function createSearchCriterias(req, criterias){
	
	var searchCriterias = {};
	//Add static criterias to searchCriterias Object.
	if(!_.isNull(req.query.status) && !_.isEmpty(req.query.status)){
		searchCriterias.status = req.query.status;
	}
	if(!_.isNull(req.query.regression) && !_.isEmpty(req.query.regression)){
		searchCriterias.regression = req.query.regression;
	}
	if(!_.isNull(req.query.time) && !_.isEmpty(req.query.time)){
		searchCriterias.time = req.query.time;
	}

	//Add dynamic criterias to searchCriterias Object.
	//Loop through name criterias and convert name field value into searchCriteria attributes set with value fetched from request query.
	for(var i = 0; i < criterias.length; i++){
		var currentCriterias = replaceAll(" ", "_", criterias[i].name.toLowerCase());
		if(!_.isUndefined(req.query[currentCriterias]) && !_.isNull(req.query[currentCriterias]) && !_.isEmpty(req.query[currentCriterias])){
			searchCriterias[currentCriterias] = req.query[currentCriterias];
		}
	}

	searchCriterias.report_id = req.query.report_id;	
	
	return searchCriterias;
}

/**
 * API path /api/tests/:test_id
 */
exports.view = findTest;

function findTest(req, res, next){
	var fetchTest = function (error, test){
	    //Handle Error.
		if(error) {
			return next(error);
		}
		var status = test.status;
		test.status = formatter.formatStatus(status);
		test.regression = formatter.formatRegression(status, test.regression);
		test.time = formatter.formatTime(test.time);
		//Send response.
	    res.send({test: test});
	};
	
	//Validate inputs.
	if(!req.params.test_id) {
		return next(new Error('No test_id param in url.'));
	}
	if(validator.isNull(req.params.test_id) || !validator.isMongoId(req.params.test_id)){
		return next(new Error('test_id param should not be null and correspond to a MongoDB Id.'));
	}
	
	//Fetch test requested.
	req.collections.tests.findOne({_id: mongoskin.helper.toObjectID(req.params.test_id)}, fetchTest);
}

/**
 * API path /api/criterias/test/:report_id
 */
exports.search = findSearchedTests;

function findSearchedTests(req, res, next){
	var findTestCriterias = function (error, criterias){
		var findTests = function (error, tests){
			//Handle Error.
			if(error){
				return next(error);
			}
				
			//For each test, we add criterias values to allCriterias objects for each criteria names.
			for(var j = 0; j < tests.length; j++){
				var currentTest = tests[j];
			
				for(var index in allCriterias){
					convertedIndex = replaceAll(" ","_", index.toLowerCase());
					if(!_.isUndefined(currentTest[convertedIndex]) && !_.isEmpty(currentTest[convertedIndex]) && !_.isNull(currentTest[convertedIndex])){
						allCriterias[index][currentTest[convertedIndex]] = true;
					}
				}
			}
			
			//Convert the allCriterias object (Map<String, List>) to the result object (Array of objects with 2 attributes, name and values, values being of type String[])
			_.each(allCriterias, function addCriteriasNameToResult(element, index, list){
				result[i] = {};
				result[i].name = index;
				var l = 0;
				result[i].values = [];
				_.each(element, function addCriteriasValueToResult(value, index, list){
					result[i].values[l] = index;
					l++;
				}, result);
				i++;
			}, result);
			
			//Send result.
			res.send({criterias: result});
		};
		//Handle Error.
		if(error){
			return next(error);
		}
		
		//Add static criterias.
		allCriterias['Status'] = {};
		allCriterias['Regression'] = {};
		allCriterias['Time'] = {};
		
		//Add dynamic criterias.
		for(var j = 0; j < criterias.length; j++){
			var currentCriterias = criterias[j].name;
			allCriterias[currentCriterias] = {};
		}

		//Fetch all tests for this report.
		req.collections.tests.find({report_id: req.params.report_id}).toArray(findTests);
	};
	
	//Validate inputs.
	if(!req.params.report_id) {
		return next(new Error('No report_id param in url.'));
	}
	//if(validator.isNull(req.params.report_id) || !validator.isLength(req.params.report_id, 5, 60) || !validator.matches(req.params.report_id, '[0-9a-zA-Z_-]+')){
	if(validator.isNull(req.params.report_id) || !validator.matches(req.params.report_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('report_id param should not be null, between 5 and 60 characters and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	
	var allCriterias = {};
	var result = [];
	var i = 0;
	
	//Fetch all tests criterias.
	req.collections.testcriterias.find().toArray(findTestCriterias);
}

function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}

