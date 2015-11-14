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
			return e.error(data, ack, true, "Report doesn't exist. "+
			"Please make sure to create a report using the create_report action before to create a test (using create_test action) in it.");
		}
		if(reports.length  > 1){
			var corrupted_report_id = "";
			for(var bi = 0; bi < reports.length ; bi++){
				if(bi != 0){
					corrupted_report_id += ",";
				}
				corrupted_report_id += reports[bi].id;
			}
			
			return e.error(data, ack, true, "Multiple builds were found. " +
					"Clean corrupted report entries (ids: "+corrupted_report_id+") from your database. " +
					"Keep the oldest entry having lifecycle_status field set to pending.");
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
		return e.error(data, ack, true, "Report Id or name not valid. Please, set at least one of them.");
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
								if(criterias[i].name == test_criterias[j].name && test_criterias[j].type == 'criteria'){
									exist = true;
								}
							}
							if(!exist){
								//This step can be done async
								collections.testcriterias.insert({name: criterias[i].name, type: 'criteria'}, insertTestCriteriasCallback);
							}
						}
					}
					if(!_.isUndefined(tags) && !_.isNull(tags)){
						for(var i = 0 ; i < tags.length; i++){
							var exist = false;
							for(var j = 0; j < test_criterias.length; j++){
								if(tags[i] == test_criterias[j].name && test_criterias[j].type == 'tag'){
									exist = true;
								}
							}
							if(!exist){
								//This step can be done async
								collections.testcriterias.insert({name: tags[i], type: 'tag'}, insertTestCriteriasCallback);
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
				var corrupted_test_id = "";
				for(var ti = 0; ti < tests.length ; ti++){
					if(ti != 0){
						corrupted_test_id += ",";
					}
					corrupted_test_id += tests[ti].id;
				}
				
				return e.error(data, ack, true, "Multiple tests were found. " +
						"Clean corrupted tests entries (ids: "+corrupted_test_id+") from your database. " +
						"Keep the oldest desired test entry.");
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
				test.regression = null;
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
				if(!_.isNull(test.start_date) && !_.isNull(test.end_date) && _.isDate(test.start_date)){
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
    		return e.error(data, ack, true, "Test with test name "+test.name+" already exists. " +
    				"Please, set a unique test name per report.");
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
	var status = data.status != null ? data.status.toLowerCase() : null;
	var log = data.log;	
	var criterias = data.criterias;
	var tags = data.tags;
	var steps = data.steps;
	
	var test = {};
	test.status = status;
	test.report_id = report.id;
	test.report_name = report.name;
	test.build_name = report.build_name;
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
		test.start_date = new Date(parseInt(start_date));
	}
	
	//Check End date
	if(!_.isNull(end_date) && (!_.isNumber(parseInt(end_date)) || !_.isDate(new Date(parseInt(end_date))))){
		return e.error(data, ack, true, "End_date field not valid.");
	}
	if(!_.isNull(end_date)){
		test.end_date = new Date(parseInt(end_date));
	}
	
	//Set duration value if possible and time
	test.duration = {};
	if(!_.isNull(test.start_date) && !_.isNull(test.end_date) && _.isDate(test.end_date) && _.isDate(test.start_date)){	
		test.duration.value = parseInt(test.end_date.getTime()) - parseInt(test.start_date.getTime());
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
	
	//Check tags
	if(!_.isUndefined(tags) && !_.isNull(tags) && !_.isArray(tags)){
		return e.error(data, ack, true, "Tags field not valid.");
	}
	if(!_.isUndefined(tags) && !_.isNull(tags)){
		for(var i = 0; i < tags.length; i++){
			if(_.isUndefined(tags[i]) || _.isNull(tags[i]) || !_.isString(tags[i])){
				return e.error(data, ack, true, "Tags object "+i+" fields not valid.");
			}
		}
		test.tags = tags;
	}
	
	//Check steps
	if(!_.isUndefined(steps) && !_.isNull(steps) && !_.isArray(steps)){
		return e.error(data, ack, true, "Steps field not valid.");
	}
	if(!_.isUndefined(steps) && !_.isNull(steps)){
		for(var i = 0; i < steps.length; i++){
			if(_.isUndefined(steps[i]) || _.isNull(steps[i]) || !_.isObject(steps[i])){
				return e.error(data, ack, true, "Steps object "+i+" fields not valid.");
			}
			if(!_.isUndefined(steps[i].start_date) && !_.isNull(steps[i].start_date) && (
					!_.isNumber(parseInt(steps[i].start_date)) || !_.isDate(new Date(parseInt(steps[i].start_date))))){
				return e.error(data, ack, true, "Steps object "+i+" start_date not valid.");
			}
			if(!_.isUndefined(steps[i].end_date) && !_.isNull(steps[i].end_date) && (
					!_.isNumber(parseInt(steps[i].end_date)) || !_.isDate(new Date(parseInt(steps[i].end_date))))){
				return e.error(data, ack, true, "Steps object "+i+" end_date not valid.");
			}
			if((_.isUndefined(steps[i].name) || _.isNull(steps[i].name) || !_.isString(steps[i].name) || 
					_.isUndefined(steps[i].order) || _.isNull(steps[i].order) || !_.isNumber(steps[i].order)) ||
					(!_.isUndefined(steps[i].input) && !_.isNull(steps[i].input) && !_.isString(steps[i].input)) ||		
					(!_.isUndefined(steps[i].expected) && !_.isNull(steps[i].expected) && !_.isString(steps[i].expected)) ||
					(!_.isUndefined(steps[i].status) && !_.isNull(steps[i].status) && !_.isString(steps[i].status)) || 
					(!_.isUndefined(steps[i].output) && !_.isNull(steps[i].output) && !_.isString(steps[i].output)) ||
					(!_.isUndefined(steps[i].error) && !_.isNull(steps[i].error) && !_.isString(steps[i].error))){
				return e.error(data, ack, true, "Steps object "+i+" fields not valid.");
			}
		}
		test.steps = steps
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
			return e.error(data, ack, true, "Report doesn't exist. "+
					"Please make sure to create a report using the create_report action before to create a test (using create_test action) in it.");
		}
		if(reports.length  > 1){
			var corrupted_report_id = "";
			for(var ri = 0; ri < reports.length ; ri++){
				if(ri != 0){
					corrupted_report_id += ",";
				}
				corrupted_report_id += reports[ri].id;
			}
			
			return e.error(data, ack, true, "Multiple reports were found. " +
					"Clean corrupted report entries (ids: "+corrupted_report_id+") from your database. " +
					"Keep the oldest entry having lifecycle_status field set to pending if override field is set to false.  "+
					"Otherwise keep the oldest entry having lifecycle_status field set to completed if override field is set to true.");
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
			return e.error(data, ack, true, "Report Id or name not valid. Please, set at least one of them.");
		}
	}else{
		if((_.isUndefined(reportId) || _.isNull(reportId)) && !_.isNull(reportName)){
			collections.reports.find({name: reportName,  lifecycle_status : "pending", next_id : null}).toArray(findReportCallback);		
		}else if(!_.isNull(reportId) && !_.isNull(reportName)){
			collections.reports.find({id: reportId, name: reportName, lifecycle_status : "pending", next_id : null}).toArray(findReportCallback);
		}else if(!_.isNull(reportId)){
			
			collections.reports.find({id: reportId, lifecycle_status : "pending", next_id : null}).toArray(findReportCallback);
		}else{
			return e.error(data, ack, true, "Report Id or name not valid. Please, set at least one of them.");
		}
	}
}

function updateTest(report, data, ack){
	var checkTestExistCallback = function (error, tests){
		var updateTestInfoCallback = function (error, count){
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
							if(criterias[i].name == test_criterias[j].name && test_criterias[j].type == 'criteria'){
								exist = true;
							}
						}
						if(!exist){
							//This step can be done async
							collections.testcriterias.insert({name: criterias[i].name, type: 'criteria'}, insertTestCriteriasCallback);
						}
					}
				}
				if(!_.isUndefined(tags) && !_.isNull(tags)){
					for(var i = 0 ; i < tags.length; i++){
						var exist = false;
						for(var j = 0; j < test_criterias.length; j++){
							if(tags[i] == test_criterias[j].name && test_criterias[j].type == 'tag'){
								exist = true;
							}
						}
						if(!exist){
							//This step can be done async
							collections.testcriterias.insert({name: tags[i], type: 'tag'}, insertTestCriteriasCallback);
						}
					}
				}
				
				ack.acknowledge();
			};
			
			if(error) {
				return e.error(data, ack, false, "Update Test failed.");
		    }
			
		    //Persist test criterias
			collections.testcriterias.find({}).toArray(findTestCriteriasCallback);
			
			console.log("-- Update test.");
		};
		var findPreviousTestCallback = function (error, previous_tests){
    		if(error){
				return e.error(data, ack, false, "Find previous Test Operation failed.");
			}
			
			if(previous_tests.length  > 1){
				var previous_corrupted_test_id = "";
				for(var pti = 0; pti < previous_tests.length ; pti++){
					if(pti != 0){
						previous_corrupted_test_id += ",";
					}
					previous_corrupted_test_id += previous_tests[pti].id;
				}
				
				return e.error(data, ack, true, "Multiple previous tests were found. " +
						"Clean previous corrupted test entries (ids: "+previous_corrupted_test_id+") from your database. " +
						"Keep the oldest entry having id field set to test previous_id field.");
			}
			
			//If previous test doesn't exist
			if(previous_tests.length == 0 ){
				test.regression = null;
				test.duration.trend = 1;
				
				//Update test
				collections.tests.updateById(test._id, {$set: test}, updateTestInfoCallback);
			}else{
				//If previous test exist.
				var previous_test = previous_tests[0];
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
				if(!_.isNull(test.start_date) && !_.isNull(test.end_date) && _.isDate(test.start_date)){
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
			return e.error(data, ack, true, "Test doesn't exist. "+
					"Please make sure to create a test using the create_test action before to update a test (using update_test action) in it.");
		}
		if(tests.length  > 1){
			var corrupted_test_id = "";
			for(var ti = 0; ti < tests.length ; ti++){
				if(ti != 0){
					corrupted_test_id += ",";
				}
				corrupted_test_id += tests[ti].id;
			}
			
			return e.error(data, ack, true, "Multiple tests were found. " +
					"Clean corrupted test entries (ids: "+corrupted_test_id+") from your database. " +
					"Keep the oldest desired test entry.");
		}
		
		var buildId = data.build_id;
		var buildName = data.build_name;
		var description = data.description;
		var start_date = data.start_date;
		var end_date = data.end_date;
		var status = data.status != null ? data.status.toLowerCase() : null;
		var log = data.log;
		var criterias = data.criterias;
		var tags = data.tags;
		var steps = data.steps;
		
		var test = tests[0];
		
		if(!_.isNull(description)){
			test.description = description;
		}
		
		//Check start date
		if(!_.isNull(start_date) && (!_.isNumber(parseInt(start_date)) || !_.isDate(new Date(parseInt(start_date))))){
			return e.error(data, ack, true, "Start_date field not valid.");
		}
		if(!_.isNull(start_date)){
			test.start_date = new Date(parseInt(start_date));
		}
		
		//Check end date
		if(!_.isNull(end_date) && (!_.isNumber(parseInt(end_date)) || !_.isDate(new Date(parseInt(end_date))))){
			return e.error(data, ack, true, "End_date field not valid.");
		}
		if(!_.isNull(end_date)){
			test.end_date = new Date(parseInt(end_date));
		}
		
		//Set duration value if possible
		if(!_.isNull(test.start_date) && !_.isNull(test.end_date) && _.isDate(test.end_date) && _.isDate(test.start_date)){
			if(test.duration == undefined){
				test.duration = {};
			}
			test.duration.value = parseInt(test.end_date.getTime()) - parseInt(test.start_date.getTime());
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
		
		//Update tags, 
		if(!_.isUndefined(tags) && !_.isNull(tags) && !_.isArray(tags)){
			return e.error(data, ack, true, "Tags field not valid.");
		}
		if(_.isUndefined(tags) || _.isNull(test.tags) || !_.isArray(test.tags)){
			test.tags = [];
		}
		
		var tagsLength = test.tags.length;
		if(!_.isUndefined(tags) && !_.isNull(tags)){
			for(var i = 0; i < tags.length; i++){
				if(_.isUndefined(tags[i]) || _.isNull(tags[i]) || !_.isString(tags[i])){
					return e.error(data, ack, true, "Tags object "+i+" not valid.");
				}
				test.tags[tagsLength + i] = tags[i];
			}
		}
		
		//Update steps, 
		if(!_.isUndefined(steps) && !_.isNull(steps) && !_.isArray(steps)){
			return e.error(data, ack, true, "Steps field not valid.");
		}
		if(_.isUndefined(steps) || _.isNull(test.steps) || !_.isArray(test.steps)){
			test.steps = [];
		}
		
		
		if(!_.isUndefined(steps) && !_.isNull(steps)){
			for(var i = 0; i < steps.length; i++){
				if(_.isUndefined(steps[i]) || _.isNull(steps[i]) || !_.isObject(steps[i])){
					return e.error(data, ack, true, "Steps object "+i+" not valid.");
				}
				if(!_.isUndefined(steps[i].start_date) && !_.isNull(steps[i].start_date) && (
						!_.isNumber(parseInt(steps[i].start_date)) || !_.isDate(new Date(parseInt(steps[i].start_date))))){
					return e.error(data, ack, true, "Steps object "+i+" start_date not valid.");
				}
				if(!_.isUndefined(steps[i].end_date) && !_.isNull(steps[i].end_date) && (
						!_.isNumber(parseInt(steps[i].end_date)) || !_.isDate(new Date(parseInt(steps[i].end_date))))){
					return e.error(data, ack, true, "Steps object "+i+" end_date not valid.");
				}
				if((_.isUndefined(steps[i].name) || _.isNull(steps[i].name) || !_.isString(steps[i].name) || 
						_.isUndefined(steps[i].order) || _.isNull(steps[i].order) || !_.isNumber(steps[i].order)) ||
						(!_.isUndefined(steps[i].input) && !_.isNull(steps[i].input) && !_.isString(steps[i].input)) ||		
						(!_.isUndefined(steps[i].expected) && !_.isNull(steps[i].expected) && !_.isString(steps[i].expected)) ||
						(!_.isUndefined(steps[i].status) && !_.isNull(steps[i].status) && !_.isString(steps[i].status)) || 
						(!_.isUndefined(steps[i].output) && !_.isNull(steps[i].output) && !_.isString(steps[i].output)) ||
						(!_.isUndefined(steps[i].error) && !_.isNull(steps[i].error) && !_.isString(steps[i].error))){
					return e.error(data, ack, true, "Steps object "+i+" fields not valid.");
				}
			}
			for(var i = 0; i < steps.length; i++){
				var stepExist = false;
				for(var j = 0; j < test.steps.length; j++){
					if(steps[i].order == test.steps[j].order && 
							steps[i].name == test.steps[j].name){
						stepExist = true;
						if(steps[i].start_date != null){
							test.steps[j].start_date = steps[i].start_date;
						}
						if(steps[i].end_date != null){
							test.steps[j].end_date = steps[i].end_date;
						}
						if(steps[i].status != null){	
							test.steps[j].status = steps[i].status;
						}
						if(steps[i].input != null){	
							test.steps[j].input = steps[i].input;
						}
						if(steps[i].output != null){	
							test.steps[j].output = steps[i].output;
						}
						if(steps[i].expected != null){
							test.steps[j].expected = steps[i].expected;
						}
						if(steps[i].error != null){	
							test.steps[j].error = steps[i].error;
						}		
					}
					
				}
				var stepsLength = test.steps.length;
				if(!stepExist){
					test.steps[stepsLength] = {};
					test.steps[stepsLength].name = steps[i].name;
					test.steps[stepsLength].start_date = steps[i].start_date;
					test.steps[stepsLength].end_date = steps[i].end_date;
					test.steps[stepsLength].order = steps[i].order;
					test.steps[stepsLength].status = steps[i].status;
					test.steps[stepsLength].input = steps[i].input;
					test.steps[stepsLength].output = steps[i].output;
					test.steps[stepsLength].expected = steps[i].expected;
					test.steps[stepsLength].error = steps[i].error;
				}	
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
				test.regression = null;	
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


