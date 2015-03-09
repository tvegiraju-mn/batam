var _ = require('underscore');
var util = require('util');
var config = require('../../config.js');
var e = require('../error/errorHandler.js');

var mongoskin = require('mongoskin'),
	dbUrl = process.env.MONGOHQ_URL || config.database.URL,
	db = mongoskin.db(dbUrl, {safe:true}),
	collections = {
		builds: db.collection('builds'),
		reports: db.collection('reports'),
		tests: db.collection('tests'),
		testcriterias: db.collection('testcriterias')
	};
	
exports.create = createTestEntrypoint;
	
function createTestEntrypoint(data, ack){
	var findReportsCallback = function (error, reports){
		if(error){
			return e.error(data, ack, false, "Find Report Operation failed.");
		}
		if(reports.length == 0){
			return e.error(data, ack, true, "Report doesn't exist.");
		}
		if(reports.length  > 1){
			return e.error(data, ack, true, "Multiple Reports were found.");
		}
		
		//Create test.
		createTest(reports[0], data, ack);
	};
	
	var reportId = data.report_id;
	var reportName = data.report_name;
	
	//Check build exist using reportId and name provided
	if((_.isUndefined(reportId) || _.isNull(reportId)) && !_.isNull(reportName)){
		collections.reports.find({name: reportName, lifecycle_status : "pending"}).toArray(findReportsCallback);		
	}else if(!_.isNull(reportId) && !_.isNull(reportName)){
		collections.reports.find({id: reportId, name: reportName, lifecycle_status : "pending"}).toArray(findReportsCallback);
	}else if(!_.isNull(reportId)){
		collections.reports.find({id: reportId, lifecycle_status : "pending"}).toArray(findReportsCallback);
	}else{
		return e.error(data, ack, true, "Report_id or report_name not valid.");
	}
}

function createTest(report, data, ack){
	var checkTestNotExistCallback = function (error, count){
		var findPriorTestCallback = function (error, tests){
			var insertTestCallback = function (error, resp){
				var findTestCriteriasCallback = function (error, test_criterias){
					var insertTestCriteriasCallback = function (error, resp){
						if(error) {
							return e.error(data, ack, false, "Insert new test criteria failed.");
					    }
						
						console.log("-- Create test criteria.");
					};
					
					if(error){
						return e.error(data, ack, false, "Find TestCriterias Operation failed.");
					}
					if(!_.isNull(criterias)){
						for(var i = 0 ; i < criterias.length; i++){
							var exist = false;
							for(var j = 0; j < test_criterias.length; j++){
								if(criterias[i].name == test_criterias[j].name){
									exist = true;
								}
							}
							if(!exist){
								//This step can be done async
								collections.testcriterias.insert({name: criterias[i].name}, insertTestCriteriasCallback);
							}
						}
					}
					
					ack.acknowledge();
				};
				
				if(error) {
					return e.error(data, ack, false, "Insert new Test failed.");
			    }
				
			    //Persist test criterias
				collections.testcriterias.find({}).toArray(findTestCriteriasCallback);
				
				console.log("-- Create test.");
			};
			
    		if(error){
				return e.error(data, ack, false, "Find Test Operation failed.");
			}
			
			if(tests.length  > 1){
				return e.error(data, ack, true, "Multiple Tests were found.");
			}

			//If previous test doesn't exist
			if(tests.length == 0 ){
				//everything that is not passing is a new regression.
				if(test.status == "pass"){
					test.regression = "same";
				}else{
					test.regression = "new";
				}
				test.duration.trend = 1;
				test.regression = "n/a"
    			test.previous_id = null;
    			
				//Create Test
				collections.tests.insert(test, insertTestCallback);
			}else{
				//if previous test exist
				var previous_test = tests[0];
				if(previous_test.status == "pass" && test.status == "fail"){
					test.regression = "new";
				}else if(previous_test.status == "fail" && test.status == "pass"){
					test.regression = "fixed";
				}else{
					test.regression = "same";
				}
				
				//set duration info to test
				if(!_.isNull(test.date) && !_.isNull(end_date) && _.isDate(test.date)){
					if(previous_test.duration.value == test.duration.value){
						test.duration.trend = 0;
					}else if(previous_test.duration.value > test.duration.value){
						test.duration.trend = -1;
					}else{
						test.duration.trend = 1;
					}
				}
				
				//set previous test id
    			test.previous_id = previous_test._id;
    				
				//Create test
				collections.tests.insert(test, insertTestCallback);
			}
    	};
		
		//Handle Error.
    	if(error) {
    		return e.error(data, ack, false, "Find Test Operation failed.");
	    }
    	
    	//Check if test already exist.
    	if(count > 0){
    		return e.error(data, ack, true, "Test already exists.");
    	}
    	var previous_report_id = -1 //-1 should return nothing.
    	//If there is no previous report then there is no previous tests.
    	if(!_.isUndefined(report.previous_id) && !_.isNull(report.previous_id)){
    		previous_report_id = report.previous_id;
    	}
    	collections.tests.find({report_id: previous_report_id, name: test.name}).toArray(findPriorTestCallback);
	};
	
	var buildId = data.build_id;
	var buildName = data.build_name;
	var name = data.name;
	var description = data.description;
	var start_date = data.start_date;
	var end_date = data.end_date;
	var status = data.status;
	var log = data.log;	
	var criterias = data.criterias;
	
	var test = {};
	test.status = status;
	test.report_id = report.id;
	test.build_id = report.build_id;
	test.description = description;
	test.log = log;
	
	//Check name
	if(_.isUndefined(name) || _.isNull(name)){
		return e.error(data, ack, true, "Name field not found.");
	}
	test.name = name;
	
	//Check start date
	if(!_.isNull(start_date) && (!_.isNumber(parseInt(start_date)) || !_.isDate(new Date(parseInt(start_date))))){
		return e.error(data, ack, true, "Start_date field not valid.");
	}
	if(!_.isNull(start_date)){
		test.date = new Date(parseInt(start_date));
	}
	
	//Set duration value if possible and time
	if(!_.isNull(end_date) && (!_.isNumber(parseInt(end_date)) || !_.isDate(new Date(parseInt(end_date))))){
		return e.error(data, ack, true, "End_date field not valid.");
	}
	test.duration = {};
	if(!_.isNull(test.date) && !_.isNull(end_date)){	
		test.duration.value = parseInt(end_date) - parseInt(start_date);
		if(test.duration.value <= 10){
			test.time = "0-10ms";
		}else if(test.duration.value <= 10){
			test.time = "10ms-30ms";
		}else if(test.duration.value <= 30){
			test.time = "30ms-1s";
		}else if(test.duration.value <= 10000){
			test.time = "1-10s";
		}else if(test.duration.value <= 30000){
			test.time = "10-30s";
		}else if(test.duration.value <= 60000){
			test.time = "30s-1min";
		}else if(test.duration.value <= 600000){
			test.time = "1min-10min";
		}else if(test.duration.value <= 1800000){
			test.time = "10min-30min";
		}else if(test.duration.value <= 3600000){
			test.time = "30min-1h";
		}else{
			test.time = "1h and more";
		}
	}
	
	//Check Criterias
	if(!_.isNull(criterias) && !_.isArray(criterias)){
		return e.error(data, ack, true, "Criterias field not valid.");
	}
	if(!_.isNull(criterias)){
		for(var i = 0; i < criterias.length; i++){
			if(_.isUndefined(criterias[i]) || _.isNull(criterias[i]) || !_.isObject(criterias[i])){
				return e.error(data, ack, true, "Criterias object "+i+" not valid.");
			}
			if(_.isUndefined(criterias[i].name) || _.isNull(criterias[i].name) || !_.isString(criterias[i].name) || 
					_.isUndefined(criterias[i].value) || _.isNull(criterias[i].value) || !_.isString(criterias[i].value)){
				return e.error(data, ack, true, "Criterias object "+i+" fields not valid.");
			}
			var currentName = criterias[i].name.toLowerCase().replace(" ", "_");

			test[currentName] = criterias[i].value;
		}
	}
	
	collections.tests.count({report_id: report.id, name: test.name}, checkTestNotExistCallback);
}

exports.update = updateTestEntrypoint;

function updateTestEntrypoint(data, ack){
	var findReportCallback = function (error, reports){
		if(error){
			return e.error(data, ack, false, "Find Report Operation failed.");
		}
		if(reports.length == 0){
			return e.error(data, ack, true, "Report doesn't exist.");
		}
		if(reports.length  > 1){
			return e.error(data, ack, true, "Multiple Reports were found.");
		}
		
		//Create test.
		updateTest(reports[0], data, ack);
	};
	
	var reportId = data.report_id;
	var reportName = data.report_name;
	var override = data.override;
	
	//Check build exist using reportId and name provided
	if(override){
		if((_.isUndefined(reportId) || _.isNull(reportId)) && !_.isNull(reportName)){
			collections.reports.find({name: reportName,  lifecycle_status : "completed", next_id : null}).toArray(findReportCallback);		
		}else if(!_.isNull(reportId) && !_.isNull(reportName)){
			collections.reports.find({id: reportId, name: reportName, lifecycle_status : "completed", next_id : null}).toArray(findReportCallback);
		}else if(!_.isNull(reportId)){
			collections.reports.find({id: reportId, lifecycle_status : "completed", next_id : null}).toArray(findReportCallback);
		}else{
			return e.error(data, ack, true, "Report_id or report_name not valid.");
		}
	}else{
		if((_.isUndefined(reportId) || _.isNull(reportId)) && !_.isNull(reportName)){
			collections.reports.find({name: reportName,  lifecycle_status : "pending", next_id : null}).toArray(findReportCallback);		
		}else if(!_.isNull(reportId) && !_.isNull(reportName)){
			collections.reports.find({id: reportId, name: reportName, lifecycle_status : "pending", next_id : null}).toArray(findReportCallback);
		}else if(!_.isNull(reportId)){
			
			collections.reports.find({id: reportId, lifecycle_status : "pending", next_id : null}).toArray(findReportCallback);
		}else{
			return e.error(data, ack, true, "Report_id or report_name not valid.");
		}
	}
}

function updateTest(report, data, ack){
	var checkTestExistCallback = function (error, tests){
		var updateTestInfoCallback = function (error, count){
			if(error) {
				return e.error(data, ack, false, "Update Test operation failed.");
		    }
			
		    ack.acknowledge();
		};
		var findPreviousTestCallback = function (error, tests){
    		if(error){
				return e.error(data, ack, false, "Find previous Test Operation failed.");
			}
			
			if(tests.length  > 1){
				return e.error(data, ack, true, "Multiple Previous Tests were found.");
			}
			
			//If previous test doesn't exist
			if(tests.length == 0 ){
				test.regression = "n/a";
				test.duration.trend = 1;
				
				//Update test
				collections.tests.updateById(test._id, {$set: test}, updateTestInfoCallback);
			}else{
				//If previous test exist.
				var previous_test = tests[0];
				if(previous_test.status == "pass" && test.status == "fail"){
					test.regression = "new";
				}else if(previous_test.status == "fail" && test.status == "pass"){
					test.regression = "fixed";
				}else{
					test.regression = "same";
				}
				
				//set previous test id
				test.previous_id = previous_test._id;
				
				//set duration info to test
				if(!_.isNull(test.date) && !_.isNull(end_date) && _.isDate(test.date)){
					if(previous_test.duration.value == test.duration.value){
						test.duration.trend = 0;
					}else if(previous_test.duration.value > test.duration.value){
						test.duration.trend = -1;
					}else{
						test.duration.trend = 1;
					}
				}
				
				//Update test
				collections.tests.updateById(test._id, {$set: test}, updateTestInfoCallback);
			}
    	};
		
		if(error){
			return e.error(data, ack, false, "Find Test Operation failed.");
		}
		if(tests.length == 0){
			return e.error(data, ack, true, "Test doesn't exist.");
		}
		if(tests.length  > 1){
			return e.error(data, ack, true, "Multiple Tests were found.");
		}
		
		var buildId = data.build_id;
		var buildName = data.build_name;
		var description = data.description;
		var start_date = data.start_date;
		var end_date = data.end_date;
		var status = data.status;
		var log = data.log;
		var criterias = data.criterias;
	
		var test = tests[0];
		
		if(!_.isNull(description)){
			test.description = description;
		}
		
		//Check start date
		if(!_.isNull(start_date) && (!_.isNumber(parseInt(start_date)) || !_.isDate(new Date(parseInt(start_date))))){
			return e.error(data, ack, true, "Start_date field not valid.");
		}
		if(!_.isNull(start_date)){
			test.date = new Date(parseInt(start_date));
		}
		
		//Set duration value if possible
		if(!_.isNull(end_date) && (!_.isNumber(parseInt(end_date)) || !_.isDate(new Date(parseInt(end_date))))){
			return e.error(data, ack, true, "End_date field not valid.");
		}
		if(!_.isNull(test.date) && !_.isNull(end_date) && _.isDate(test.date)){
			test.duration = {};
			test.duration.value = parseInt(end_date) - parseInt(test.date.getTime());
			if(test.duration.value <= 10){
				test.time = "0-10ms";
			}else if(test.duration.value <= 10){
				test.time = "10ms-30ms";
			}else if(test.duration.value <= 30){
				test.time = "30ms-1s";
			}else if(test.duration.value <= 10000){
				test.time = "1-10s";
			}else if(test.duration.value <= 30000){
				test.time = "10-30s";
			}else if(test.duration.value <= 60000){
				test.time = "30s-1min";
			}else if(test.duration.value <= 600000){
				test.time = "1min-10min";
			}else if(test.duration.value <= 1800000){
				test.time = "10min-30min";
			}else if(test.duration.value <= 3600000){
				test.time = "30min-1h";
			}else{
				test.time = "1h and more";
			}
		}
		
		//Set logs
		if(!_.isUndefined(log) && !_.isNull(log)){
			if(!_.isUndefined(log) && !_.isNull(test.log)){
				test.log += log;
			}else{
				test.log = log;
			}
		}
		
		//Check Criterias
		if(!_.isNull(criterias) && !_.isArray(criterias)){
			return e.error(data, ack, true, "Criterias field not valid.");
		}

		if(!_.isNull(criterias)){
			for(var i = 0; i < criterias.length; i++){
				if(_.isUndefined(criterias[i]) || _.isNull(criterias[i]) || !_.isObject(criterias[i])){
					return e.error(data, ack, true, "Criterias object "+i+" not valid.");
				}
				if(_.isUndefined(criterias[i].name) || _.isNull(criterias[i].name) || !_.isString(criterias[i].name) || 
						_.isUndefined(criterias[i].value) || _.isNull(criterias[i].value) || !_.isString(criterias[i].value)){
					return e.error(data, ack, true, "Criterias object "+i+" fields not valid.");
				}
				var currentName = criterias[i].name.toLowerCase().replace(" ", "_");
	
				test[currentName] = criterias[i].value;
			}
		}

		//If update status is same as before .
		if(test.status == status){    			
			//Update test
			collections.tests.updateById(test._id, {$set: test}, updateTestInfoCallback);
    	}else 
    	// If status has changed between creation and update
		if(test.status != status){ 
			//update status
			if(!_.isNull(status)){
				test.status = status
			}
			//If there is no previous test or status is not defined.
			if(_.isUndefined(test.previous_id) || _.isNull(test.previous_id)){  
				test.regression = "n/a"	
				//Update test
				collections.tests.updateById(test._id, {$set: test}, updateTestInfoCallback);
			}else {
	    		//Fetch previous test if exist
	        	collections.tests.find({_id: test.previous_id}).toArray(findPreviousTestCallback);
	    	}
		}
	};
	
	var name = data.name;
	
	//Check test exist
	collections.tests.find({report_id: report.id, name: name}).toArray(checkTestExistCallback);
}


