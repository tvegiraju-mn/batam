var _ = require('underscore');
var util = require('util');
var config = require('../../config.js');

var mongoskin = require('mongoskin'),
	dbUrl = process.env.MONGOHQ_URL || config.database.URL,
	db = mongoskin.db(dbUrl, {safe:true}),
	collections = {
		builds: db.collection('builds'),
		reports: db.collection('reports'),
		tests: db.collection('tests'),
		testcriterias: db.collection('testcriterias'),
		ignored: db.collection('ignored')
	};
	
// * {
// * 		"report_id" : "report identifier this test belong to",
// * 		"report_name" : "report name this test belong to",
// * 		"name" : "package#testname()",
// * 		"start_date" : "12341234", // Time in millisecond
// * 		"end_date" : "12341234", // Time in millisecond
// * 		"status" : "pass|failed|error| name it",
// * 		"log" : "test logs",
// * 		"criterias" : [{@link com.modeln.batam.connector.wrapper.Pair}]
// * }	
//=============================
//	{ 
//		report_id : "build_1_201401010000000000200_legacy_test_plan", 
//		name : "test1", 
//		date : { "$date": "2014-01-01T00:00:00.000+0200" }, 
//		status : "pass", 
//		duration : 13423, 
//		time : "10-15s", 
//		regression : "same", 
//		
//		test_flag : "cfengine2", 
//		os : "linux2", 
//		type : "UT2", 
//		host : "mn23434ph2", 
//		suite : "coreapp2", 
//		
//		log : "Logs: 19:12:02.604 - 05:45:05.443 - 05:44:18.767 - THREAD: pool-3-thread-1 05:44:18.772 - Beginning transaction. 05:44:18.787 - Logged in as anonymousTest 05:45:05.426 - Rolling back transaction. 05:45:05.433 - Error: Calculated AmountDue on the bucket line should be equals to 2 : Expected <2> Got <0> at strategy/testTricareEndToEndStrategyPullBucketingRevenueTierBasisFixedAmount.act:368 at acts.mn:174 at ACT Driver:1" 
//	},

exports.create = function(data, ack){
	
	var reportId = data.report_id;
	var reportName = data.report_name;
	
	//Check build exist using reportId and name provided
	if((_.isUndefined(reportId) || _.isNull(reportId)) && !_.isNull(reportName)){
		collections.reports.find({name: reportName, lifecycle_status : "pending"}).toArray( function(error, reports){
			if(error){
				console.log("Error: find Report Operation failed.");
				return -1;
			}
			if(reports.length == 0){
				console.log("Error: Report doesn't exist.'");
				return;
			}
			if(reports.length  > 1){
				console.log("Error: Multiple Reports were found.'");
				return -1;
			}
			
			//Create test.
			createTest(reports[0], data, ack);
		});
		
	}else if(!_.isNull(reportId) && !_.isNull(reportName)){
		collections.reports.find({id: reportId, name: reportName, lifecycle_status : "pending"}).toArray( function(error, reports){
			if(error){
				console.log("Error: find Report Operation failed.");
				return -1;
			}
			if(reports.length == 0){
				console.log("Error: Report doesn't exist.'");
				return;
			}
			if(reports.length  > 1){
				console.log("Error: Multiple Reports were found.'");
				return -1;
			}
			
			//Create test.
			createTest(reports[0], data, ack);
			
		});
	}else if(!_.isNull(reportId)){
		collections.reports.find({id: reportId, lifecycle_status : "pending"}).toArray( function(error, reports){
			if(error){
				console.log("Error: find Report Operation failed.");
				return -1;
			}
			if(reports.length == 0){
				console.log("Error: Report doesn't exist.'");
				return;
			}
			if(reports.length  > 1){
				console.log("Error: Multiple Reports were found.'");
				return -1;
			}
			
			//Create test.
			createTest(reports[0], data, ack);
			
		});
	}else{
		console.log("Error: report_id or report_name not valid.");
		return -1;
	}
}

function createTest(report, data, ack){
	
	var buildId = data.build_id;
	var buildName = data.build_name;
	var name = data.name;
	var start_date = data.start_date;
	var end_date = data.end_date;
	var status = data.status;
	var log = data.log;
	
	var criterias = data.criterias;
	
	var test = {};
	test.status = status;
	test.report_id = report.id;
	test.log = log;
	
	//Check name
	if(_.isUndefined(name) || _.isNull(name)){
		console.log("Error: Name field not found.");
		return -1;
	}
	test.name = name;
	
	//Check start and end date
	if(!_.isNull(start_date) && (!_.isNumber(parseInt(start_date)) || !_.isDate(new Date(parseInt(start_date))))){
		console.log("Error: start_date field not valid.");
		return -1;
	}
	if(!_.isNull(start_date)){
		test.date = new Date(parseInt(start_date));
	}
	
	if(!_.isNull(end_date) && (!_.isNumber(parseInt(end_date)) || !_.isDate(new Date(parseInt(end_date))))){
		console.log("Error: end_date field not valid.");
		return -1;
	}
	
	//Set duration value if possible and time
	if(!_.isNull(test.date) && !_.isNull(end_date)){
		test.duration = {};
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
		console.log("Error: Criterias field not valid.");
		return -1;
	}

	if(!_.isNull(criterias)){
		for(var i = 0; i < criterias.length; i++){
			if(_.isUndefined(criterias[i]) || _.isNull(criterias[i]) || !_.isObject(criterias[i])){
				console.log("Error: Criterias object "+i+" not valid.");
				return -1;
			}
			if(_.isUndefined(criterias[i].name) || _.isNull(criterias[i].name) || !_.isString(criterias[i].name) || 
					_.isUndefined(criterias[i].value) || _.isNull(criterias[i].value) || !_.isString(criterias[i].value)){
				console.log("Error: Criterias object "+i+" fields not valid.");
				return -1;
			}
			var currentName = criterias[i].name.toLowerCase().replace(" ", "_");

			test[currentName] = criterias[i].value;
		}
	}
	
	collections.tests.count({report_id: report.id, name: test.name}, function(error, count){
		//Handle Error.
    	if(error) {
    		console.log("Error: find Test Operation failed.");
    		return -1;
	    }
    	
    	//Check if test already exist.
    	if(count > 0){
    		console.log("Error: test already exists.");
    		return -1;
    	}
    	//If there is previous test. If there is no previous report then there is no previous tests.
    	if(_.isUndefined(report.previous_id) || _.isNull(report.previous_id)){
    		test.regression = "n/a"
    		test.previous_id = null;
    		
    		//Insert Test if it doesn't exist.
			collections.tests.insert(test, function(error, resp){
				if(error) {
					console.log("Error: Insert new Test failed.");
			    	return -1;
			    }
				
			    //Persist test criterias
				collections.testcriterias.find({}).toArray(function(error, test_criterias){
					if(error){
						console.log("Error: find TestCriterias Operation failed.");
						return -1;
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
								collections.testcriterias.insert({name: criterias[i].name}, function(error, resp){
									if(error) {
										console.log("Error: Insert new test criteria failed.");
								    	return -1;
								    }
									
									console.log("Create test criteria.");
									
								});
							}
						}
					}
				});
			    
				//Acknowledge message.
				ack.acknowledge();
			});
    	}else{
    		//If there is a prior report, we look for the prior test
        	collections.tests.find({report_id: report.previous_id, name: test.name}).toArray(function(error, tests){
        		if(error){
    				console.log("Error: find Test Operation failed.");
    				return -1;
    			}
    			
    			if(tests.length  > 1){
    				console.log("Error: Multiple Tests were found.'");
    				return -1;
    			}
    			//If previous test doesn't exist
    			if(tests.length == 0 ){
    				//everything taht is not passing is a new regression.
    				if(tests[0].status == "pass"){
    					test.regression = "same";
    				}else{
    					test.regression = "new";
    				}
    				
    				test.regression = "n/a"
        			test.previous_id = null;
        			
					//Create Test
					collections.tests.insert(test, function(error, resp){
						if(error) {
							console.log("Error: Insert new Test failed.");
					    	return -1;
					    }
						
					    //Persist test criterias
						collections.testcriterias.find({}).toArray(function(error, test_criterias){
							if(error){
								console.log("Error: find TestCriterias Operation failed.");
								return -1;
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
										collections.testcriterias.insert({name: criterias[i].name}, function(error, resp){
											if(error) {
												console.log("Error: Insert new test criteria failed.");
										    	return -1;
										    }
											
											console.log("Create test criteria.");
											
										});
									}
								}
							}
						});
					    
						//Acknowledge message.
						ack.acknowledge();
					});
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
    				//set previous test id
	    			test.previous_id = previous_test._id;
	    				
    				//Create test
					collections.tests.insert(test, function(error, resp){
						if(error) {
							console.log("Error: Insert new Test failed.");
					    	return -1;
					    }
						
						//Persist test criterias
						collections.testcriterias.find({}).toArray(function(error, test_criterias){
							if(error){
								console.log("Error: find TestCriterias Operation failed.");
								return -1;
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
										collections.testcriterias.insert({name: criterias[i].name}, function(error, resp){
											if(error) {
												console.log("Error: Insert new test criteria failed.");
										    	return -1;
										    }
											
											console.log("Create test criteria.");
											
										});
									}
								}
							}
						});

						//Acknowledge message.
						ack.acknowledge();
					});
    			}
        	});
    	}
	});
}

exports.update = function(data){
	
	var reportId = data.report_id;
	var reportName = data.report_name;
	
	//Check build exist using reportId and name provided
	if((_.isUndefined(reportId) || _.isNull(reportId)) && !_.isNull(reportName)){
		collections.reports.find({name: reportName, lifecycle_status : "pending"}).toArray( function(error, reports){
			if(error){
				console.log("Error: find Report Operation failed.");
				return -1;
			}
			if(reports.length == 0){
				console.log("Error: Report doesn't exist.'");
				return;
			}
			if(reports.length  > 1){
				console.log("Error: Multiple Reports were found.'");
				return -1;
			}
			
			//Create test.
			updateTest(reports[0], data);
		});
		
	}else if(!_.isNull(reportId) && !_.isNull(reportName)){
		collections.reports.find({id: reportId, name: reportName, lifecycle_status : "pending"}).toArray( function(error, reports){
			if(error){
				console.log("Error: find Report Operation failed.");
				return -1;
			}
			if(reports.length == 0){
				console.log("Error: Report doesn't exist.'");
				return;
			}
			if(reports.length  > 1){
				console.log("Error: Multiple Reports were found.'");
				return -1;
			}
			
			//Create test.
			updateTest(reports[0], data);
			
		});
	}else if(!_.isNull(reportId)){
		collections.reports.find({id: reportId, lifecycle_status : "pending"}).toArray( function(error, reports){
			if(error){
				console.log("Error: find Report Operation failed.");
				return -1;
			}
			if(reports.length == 0){
				console.log("Error: Report doesn't exist.'");
				return;
			}
			if(reports.length  > 1){
				console.log("Error: Multiple Reports were found.'");
				return -1;
			}
			
			//Create test.
			updateTest(reports[0], data);
			
		});
	}else{
		console.log("Error: report_id or report_name not valid.");
		return -1;
	}
}

function updateTest(report, data){
	
	var buildId = data.build_id;
	var buildName = data.build_name;
	var name = data.name;
	var start_date = data.start_date;
	var end_date = data.end_date;
	var status = data.status;
	var log = data.log;
	
	var criterias = data.criterias;
	
	//Check test exist
	collections.tests.find({report_id: report.id, name: name}).toArray( function(error, tests){
		if(error){
			console.log("Error: find Test Operation failed.");
			return -1;
		}
		if(tests.length == 0){
			console.log("Error: Test doesn't exist.'");
			return;
		}
		if(tests.length  > 1){
			console.log("Error: Multiple Tests were found.'");
			return -1;
		}
		
		var test = tests[0];
		
		//Check start and end date
		if(!_.isNull(start_date) && (!_.isNumber(parseInt(start_date)) || !_.isDate(new Date(parseInt(start_date))))){
			console.log("Error: start_date field not valid.");
			return -1;
		}
		if(!_.isNull(start_date)){
			test.date = new Date(parseInt(start_date));
		}
		if(!_.isNull(end_date) && (!_.isNumber(parseInt(end_date)) || !_.isDate(new Date(parseInt(end_date))))){
			console.log("Error: end_date field not valid.");
			return -1;
		}
		
		//Set duration value if possible
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
		
		if(!_.isUndefined(log) && !_.isNull(log)){
			if(!_.isUndefined(log) && !_.isNull(test.log)){
				test.log += log;
			}else{
				test.log = log;
			}
		}
		
		//Check Criterias
		if(!_.isNull(criterias) && !_.isArray(criterias)){
			console.log("Error: Criterias field not valid.");
			return -1;
		}

		if(!_.isNull(criterias)){
			for(var i = 0; i < criterias.length; i++){
				if(_.isUndefined(criterias[i]) || _.isNull(criterias[i]) || !_.isObject(criterias[i])){
					console.log("Error: Criterias object "+i+" not valid.");
					return -1;
				}
				if(_.isUndefined(criterias[i].name) || _.isNull(criterias[i].name) || !_.isString(criterias[i].name) || 
						_.isUndefined(criterias[i].value) || _.isNull(criterias[i].value) || !_.isString(criterias[i].value)){
					console.log("Error: Criterias object "+i+" fields not valid.");
					return -1;
				}
				var currentName = criterias[i].name.toLowerCase().replace(" ", "_");
	
				test[currentName] = criterias[i].value;
			}
		}

		//If update status is same as before .
		if(test.status == status){    			
			//Update test
			collections.tests.updateById(test._id, {$set: test}, function(error, count){
				if(error) {
					console.log("Error: Update Test operation failed.");
			    	return -1;
			    }
			});
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
				collections.tests.updateById(test._id, {$set: test}, function(error, count){
					if(error) {
						console.log("Error: Update Test operation failed.");
				    	return -1;
				    }
				});
			}else {
	    		//Fetch previous test if exist
	        	collections.tests.find({_id: test.previous_id}).toArray(function(error, tests){
	        		if(error){
	    				console.log("Error: find Test Operation failed.");
	    				return -1;
	    			}
	    			
	    			if(tests.length  > 1){
	    				console.log("Error: Multiple Tests were found.'");
	    				return -1;
	    			}
	    			
	    			//If previous test doesn't exist
	    			if(tests.length == 0 ){
	 
	    				test.regression = "n/a"
	        			
						//Update test
						collections.tests.updateById(test._id, {$set: test}, function(error, count){
							if(error) {
								console.log("Error: Update Test operation failed.");
						    	return -1;
						    }
						});
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
	    				
	    				//Update test
						collections.tests.updateById(test._id, {$set: test}, function(error, count){
							if(error) {
								console.log("Error: Update Test operation failed.");
						    	return -1;
						    }
						});
	    			}
	        	});
	    	}
		}
	});
}

