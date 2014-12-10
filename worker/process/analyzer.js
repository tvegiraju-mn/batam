var _ = require('underscore');
var util = require('util');
var config = require('../config.js');

var mongoskin = require('mongoskin'),
dbUrl = process.env.MONGOHQ_URL || config.database.URL,
db = mongoskin.db(dbUrl, {safe:true}),
collections = {
	builds: db.collection('builds'),
	reports: db.collection('reports'),
	tests: db.collection('tests'),
	ignored: db.collection('ignored')
};

exports.run = function(data, ack){
	//fetch build
	var id = data.id;
	var name = data.name;

	//Check build exist using buildid and name provided
	if((_.isUndefined(id) || _.isNull(id)) && !_.isNull(name)){
		collections.builds.find({name: name, lifecycle_status : "pending"}).toArray( function(error, builds){
			if(error){
				console.log("Error: find Build Operation failed.");
				return -1;
			}
			if(builds.length == 0){
				console.log("Error: Build doesn't exist.'");
				return;
			}
			if(builds.length  > 1){
				console.log("Error: Multiple Build were found.'");
				return -1;
			}
			//TODO check build fields
			
			//Update build.
			analyzeBuild(builds[0], data, ack);
		});
		
	}else if(!_.isNull(id) && !_.isNull(name)){
		collections.builds.find({id: id, name: name, lifecycle_status : "pending"}).toArray( function(error, builds){
			if(error){
				console.log("Error: find Build Operation failed.");
				return -1;
			}
			if(builds.length == 0){
				console.log("Error: Build doesn't exist.'");
				return;
			}
			if(builds.length  > 1){
				console.log("Error: Multiple Build were found.'");
				return -1;
			}
			//TODO check build fields
			
			//Analyse build.
			analyzeBuild(builds[0], data, ack);
			
		});
	}else if(!_.isNull(id)){
		collections.builds.find({id: id, lifecycle_status : "pending"}).toArray( function(error, builds){
			if(error){
				console.log("Error: find Build Operation failed.");
				return -1;
			}
			if(builds.length == 0){
				console.log("Error: Build doesn't exist.'");
				return;
			}
			if(builds.length  > 1){
				console.log("Error: Multiple Build were found.'");
				return -1;
			}
			//TODO check build fields
			
			//Analyse build.
			analyzeBuild(builds[0], data, ack);
			
		});
	}else{
		console.log("Error: build_id or build_name not valid.");
		return -1;
	}
}

function analyzeBuild(build, data, ack){
	var total_failures = 0;
	var total_errors = 0;

	//Fetch previous build
	collections.builds.find({id: build.previous_id}).toArray( function(error, previous_builds){
		if(error){
			console.log("Error: find Build Operation failed.");
			return -1;
		}
		
		if(previous_builds.length  > 1){
			console.log("Error: Multiple previous Build were found.'");
			return -1;
		}
		
		//Fetch reports
		collections.reports.find({build_id: build.id, lifecycle_status : "pending", next_id : null}).toArray( function(error, reports){
			if(error){
				console.log("Error: find Report Operation failed.");
				return -1;
			}
			
			//For each reports
			_.each(reports, function(reportElement, index, list){

				//Fetch previous report
				collections.reports.find({id: reportElement.previous_id}).toArray( function(error, previous_reports){
					if(error){
						console.log("Error: find Report Operation failed.");
						return -1;
					}
					if(previous_reports.length  > 1){
						console.log("Error: Multiple Report were found.'");
						return -1;
					}

					//TODO check report fields
	
					var total_test = 0;
					var total_regressions = 0;
					var total_new_regression = 0;
					var total_fixed_regression = 0;
					
					//Fetch tests
					collections.tests.find({report_id: reportElement.id}).toArray( function(error, tests){
						if(error){
							console.log("Error: find Tests Operation failed.");
							return -1;
						}
	
						//_.each(tests, function(testElement, index, list){
						for(var j = 0; j < tests.length; j++){

							//For each current tests, check fields, look for the previous one, set next_id and update
							
							//TODO check current test fields.
							
							//Count tests infos.
							total_test ++;
				
							if(tests[j].status != "pass"){
								total_regressions ++;
								if(tests[j].regression == "new"){
									total_new_regression ++;
								}
							}else if(tests[j].status == "pass"){
								if(tests[j].regression == "fixed"){
									total_fixed_regression ++;
								}
							}
							if(tests[j].status == "error"){
								total_errors ++;
							}
							if(tests[j].status == "fail"){
								total_failures ++;
							}
	
							//If previous test exist, we update previous test next_id
							//This step can be done async
							if(!_.isUndefined(tests[j].previous_id) && !_.isNull(tests[j].previous_id)){

								//Update previous tests with next_id
								collections.tests.updateById(tests[j].previous_id, {$set: {next_id: tests[j]._id}}, function(error, count){
									if(error) {
										console.log("Error: Update Test operation failed.");
								    	return -1;
								    }
								});
							}
						}
						
						//set tests info to report
						reports[index].tests = {};
						reports[index].tests.all = {};
						reports[index].tests.all.value = total_test;
						if(total_test > 0){
							reports[index].tests.all.trend = 1;
						}else{
							reports[index].tests.all.trend = 0;
						}
						reports[index].tests.regressions = {};
						reports[index].tests.regressions.value = total_regressions;
						if(total_regressions > 0){
							reports[index].tests.regressions.trend = 1;
						}else{
							reports[index].tests.regressions.trend = 0;
						}	
						reports[index].tests.new_regressions = {};
						reports[index].tests.new_regressions.value = total_regressions;
						if(total_regressions > 0){
							reports[index].tests.new_regressions.trend = 1;
						}else{
							reports[index].tests.new_regressions.trend = 0;
						}
						reports[index].tests.fixed_regressions = {};
						reports[index].tests.fixed_regressions.value = total_fixed_regression;
						reports[index].tests.fixed_regressions.trend = 0;
						//If there is a previous report, we can set the trend
						if(previous_reports.length == 1){
							reports[index].tests.new_regressions.value = total_new_regression;
							if(previous_reports[0].tests.all.value == total_test){
								reports[index].tests.all.trend = 0;
							}else if(previous_reports[0].tests.all.value > total_test){
								reports[index].tests.all.trend = -1;
							}else{
								reports[index].tests.all.trend = 1;
							}
						
							if(previous_reports[0].tests.regressions.value == total_regressions){
								reports[index].tests.regressions.trend = 0;
							}else if(previous_reports[0].tests.regressions.value > total_regressions){
								reports[index].tests.regressions.trend = -1;
							}else{
								reports[index].tests.regressions.trend = 1;
							}
							
							if(previous_reports[0].tests.new_regressions.value == total_new_regression){
								reports[index].tests.new_regressions.trend = 0;
							}else if(previous_reports[0].tests.new_regressions.value > total_new_regression){
								reports[index].tests.new_regressions.trend = -1;
							}else{
								reports[index].tests.new_regressions.trend = 1;
							}
				
							if(previous_reports[0].tests.fixed_regressions.value == total_fixed_regression){
								reports[index].tests.fixed_regressions.trend = 0;
							}else if(previous_reports[0].tests.fixed_regressions.value > total_fixed_regression){
								reports[index].tests.fixed_regressions.trend = -1;
							}else{
								reports[index].tests.fixed_regressions.trend = 1;
							}
							
							if(previous_reports[0].duration.value == reports[index].duration.value){
								reports[index].duration.trend = 0;
							}else if(previous_reports[0].duration.value > reports[index].duration.value){
								reports[index].duration.trend = -1;
							}else{
								reports[index].duration.trend = 1;
							}
	
							//Update previous report next_id
							collections.reports.updateById(previous_reports[0]._id, {$set: {next_id : reports[index].id}}, function(error, count){
								if(error) {
									console.log("Error: Update Report operation failed.");
							    	return -1;
							    }
								console.log(count+ " report entry updated ("+previous_reports[0].name+")");
							});
						}
						
						reports[index].lifecycle_status = "completed";
	
						//Update report
						collections.reports.updateById(reports[index]._id, {$set: reports[index]}, function(error, count){
							if(error) {
								console.log("Error: Update Report operation failed.");
						    	return -1;
						    }
							console.log(count+ " report entry updated ("+reports[index].name+")");
							
							//When we are done analysing all reports, re finalize build analysis.
							if(index == reports.length  -1){
								finalizeAnalysis(build, total_errors, total_failures, previous_builds, ack);
							}
						});
						
					});
					
				});
			}, reports);
			
			//TODO If build has no report.
			if(reports.length == 0){
				ack.acknowledge();
			}
			
		});
		
	});	
}

function finalizeAnalysis(build, total_errors, total_failures, previous_builds, ack){
	build.errors = {};
	build.errors.value = total_errors;
	if(total_errors > 0){
		build.errors.trend = 1;
	}else{
		build.errors.trend = 0;
	}
	build.failures = {};
	build.failures.value = total_failures;
	if(total_failures > 0){
		build.failures.trend = 1;
	}else{
		build.failures.trend = 0;
	}
	
	//If previous build exist.
	if(previous_builds.length == 1){
		
		if(previous_builds[0].errors.value == build.errors.value){
			build.errors.trend  = 0;
		}else if(previous_builds[0].errors.value > build.errors.value){
			build.errors.trend  = -1;
		}else{
			build.errors.trend  = 1;
		}
		
		if(previous_builds[0].failures.value == build.failures.value){
			build.failures.trend  = 0;
		}else if(previous_builds[0].failures.value > build.failures.value){
			build.failures.trend  = -1;
		}else{
			build.failures.trend  = 1;
		}			
	
		if(previous_builds[0].duration.value == build.duration.value){
			build.duration.trend = 0;
		}else if(previous_builds[0].duration.value > build.duration.value){
			build.duration.trend = -1;
		}else{
			build.duration.trend = 1;
		}

		//Update previous build next_id
		collections.builds.updateById(previous_builds[0]._id, {$set: {next_id : build.id}}, function(error, count){
			if(error) {
				console.log("Error: Update Build operation failed.");
		    	return -1;
		    }
			console.log(count+ " build entry updated ("+previous_builds[0].name+")");
		});
	}
	
	build.lifecycle_status = "completed";

	//Update build
	collections.builds.updateById(build._id, {$set: build}, function(error, count){
		if(error) {
			console.log("Error: Update Build operation failed.");
	    	return -1;
	    }
		console.log(count+ " build entry updated ("+build.name+")");
		
		//Acknowledge message.
		ack.acknowledge();
	});
}



