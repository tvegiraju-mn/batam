var _ = require('underscore');
var util = require('util');
var config = require('../config.js');
var e = require('./error/errorHandler.js');

var mongoskin = require('mongoskin'),
dbUrl = process.env.MONGOHQ_URL || config.database.URL,
db = mongoskin.db(dbUrl, {safe:true}),
collections = {
	builds: db.collection('builds'),
	reports: db.collection('reports'),
	tests: db.collection('tests')
};

exports.run = runAnalysisEntrypoint;

function runAnalysisEntrypoint(data, ack, callback){
	var findBuildCallback = function (error, builds){
		if(error){
			return e.error(data, ack, false, "Find Build Operation failed.");
		}
		if(builds.length == 0){
			return e.error(data, ack, true, "Build doesn't exist. Please make sure to create a build using the create_build action before analyzing it.");
		}
		if(builds.length > 1){
			var corrupted_build_id = "";
			for(var bi = 0; bi < builds.length ; bi++){
				if(bi != 0){
					corrupted_build_id += ",";
				}
				corrupted_build_id += builds[bi].id;
			}
			
			return e.error(data, ack, true, "Multiple build were found. " +
					"Clean corrupted build entries (ids: "+corrupted_build_id+") from your database. " +
					"Keep the oldest entry having lifecycle_status field set to pending.");
		}
		
		//TODO check build fields
		
		//fetch all information needed.
		fetchAll(builds[0], data, ack, callback);
	};
	
	//fetch build
	var id = data.id;
	var name = data.name;
	var override = data.override;
	
	if(override){
		//Checking for lifecycle_status being completed and next_id null in order to re analyze the latest completed build.
		if((_.isUndefined(id) || _.isNull(id)) && !_.isNull(name)){
			collections.builds.find({name: name, lifecycle_status : "completed", next_id : null}).toArray(findBuildCallback);	
		}else if(!_.isNull(id) && !_.isNull(name)){
			collections.builds.find({id: id, name: name, lifecycle_status : "completed", next_id : null}).toArray(findBuildCallback);
		}else if(!_.isNull(id)){
			collections.builds.find({id: id, lifecycle_status : "completed", next_id : null}).toArray(findBuildCallback);
		}else{
			return e.error(data, ack, true, "Build Id or name not valid. Please, set at least one of them.");
		}
	}else{
		//Checking for lifecycle_status being pending doesn't allows re analysis of existing build.
		if((_.isUndefined(id) || _.isNull(id)) && !_.isNull(name)){
			collections.builds.find({name: name, lifecycle_status : "pending"}).toArray(findBuildCallback);	
		}else if(!_.isNull(id) && !_.isNull(name)){
			collections.builds.find({id: id, name: name, lifecycle_status : "pending"}).toArray(findBuildCallback);
		}else if(!_.isNull(id)){
			collections.builds.find({id: id, lifecycle_status : "pending"}).toArray(findBuildCallback);
		}else{
			return e.error(data, ack, true, "Build Id or name not valid. Please, set at least one of them.");
		}
	}
}

function fetchAll(build, data, ack, callback){
	var findPreviousBuildsCallback = function (error, previous_builds){
		var findReportsCallback = function (error, reports){
			var findPreviousReportsCallback = function (error, previous_reports){
				var findTestCallback = function (error, tests){
					
					if(error){
						return e.error(data, ack, false, "Find Tests Operation failed.");
					}
					
					processAnalysis(data, build, previous_builds, reports, previous_reports, tests, ack, callback);
				};
				
				if(error){
					return e.error(data, ack, false, "Find Report Operation failed.");
				}
				
				//Fetch current tests
				collections.tests.find({build_id: build.id}).toArray(findTestCallback);
			};
			
			if(error){
				return e.error(data, ack, false, "Find Report Operation failed.");
			}
			
			var previous_build_id = -1; // -1 should return nothing
			if(previous_builds.length  == 1){
				previous_build_id = previous_builds[0].id;
			}
			collections.reports.find({build_id: previous_build_id}).toArray(findPreviousReportsCallback);
		};
		
		if(error){
			return e.error(data, ack, false, "Find Build Operation failed.");
		}
		
		if(previous_builds.length  > 1){
			var previous_corrupted_build_id = "";
			for(var pbi = 0; pbi < previous_builds.length ; pbi++){
				if(pbi != 0){
					previous_corrupted_build_id += ",";
				}
				previous_corrupted_build_id += previous_builds[pbi].id;
			}
			
			return e.error(data, ack, true, "Multiple previous build were found. " +
					"Clean previous corrupted build entries (ids: "+previous_corrupted_build_id+") from your database. " +
					"Keep the oldest entry having previous_id field non null and next_id field null.");
		}
		
		//Fetch reports
		var override = data.override;
		if(override){
			collections.reports.find({build_id: build.id, lifecycle_status : "completed", next_id : null}).toArray(findReportsCallback);
		}else{
			collections.reports.find({build_id: build.id, lifecycle_status : "pending", next_id : null}).toArray(findReportsCallback);	
		}
		
	};

	//Fetch previous build
	collections.builds.find({id: build.previous_id}).toArray(findPreviousBuildsCallback);	
}

function processAnalysis(data, build, previous_builds, reports, previous_reports, tests, ack, callback){	
	var updatePreviousTestInfoCallback = function (error, count){
		if(error) {
			return e.error(data, ack, false, "Update Test operation failed.");
	    }
		console.log("-- "+count+ " previous test updated.");
	};	
	var updatePreviousReportInfoCallback = function (error, count){
		if(error) {
			return e.error(data, ack, false, "Update Report operation failed.");
	    }
		console.log("-- "+count+ " previous report updated.");
	};	
	var updateReportInfoCallback = function (error, count){
		if(error) {
			return e.error(data, ack, false, "Update Report operation failed.");
	    }
		console.log("-- "+count+ " report updated.");
	};

	var total_failures = 0;
	var total_errors = 0;
	var total_passes = 0;
	var total_tests = 0;
	//If build has no report.
	if(reports.length != 0){
		
		//For each current reports
		for(var index = 0; index < reports.length; index++){
			var total_report_tests = 0;
			var total_report_regressions = 0;
			var total_report_new_regression = 0;
			var total_report_fixed_regression = 0;
			var total_report_failures = 0;
			var total_report_errors = 0;
			var total_report_passes = 0;
			
			//For each current Tests
			for(var j = 0; j < tests.length; j++){
				//Only fetch test for current report
				if(tests[j].report_id == reports[index].id){
					//TODO check current test fields.
					
					//Count tests infos.
					total_report_tests ++;
					total_tests ++;
		
					if(tests[j].status != "pass"){
						total_report_regressions ++;
						if(tests[j].regression == "new"){
							total_report_new_regression ++;
						}
					}else if(tests[j].status == "pass"){
						total_report_passes ++;
						total_passes ++;
						if(tests[j].regression == "fixed"){
							total_report_fixed_regression ++;
						}
					}
					if(tests[j].status == "error"){
						total_report_errors ++;
						total_errors ++;
					}
					if(tests[j].status == "fail"){
						total_report_failures ++;
						total_failures ++;
					}
		
					//If previous test exist, we update previous test next_id
					if(!_.isUndefined(tests[j].previous_id) && !_.isNull(tests[j].previous_id)){
						//This step can be done async
						//Update previous tests with next_id
						collections.tests.updateById(tests[j].previous_id, {$set: {next_id: tests[j]._id}}, updatePreviousTestInfoCallback);
					}
				}
			}
			
			//set tests info to report
			reports[index].tests = {};
			reports[index].tests.all = {};
			reports[index].tests.all.value = total_report_tests;
			if(total_report_tests > 0){
				reports[index].tests.all.trend = 1;
			}else{
				reports[index].tests.all.trend = 0;
			}
			
			reports[index].tests.failures = {};
			reports[index].tests.failures.value = total_report_failures;
			if(total_report_failures > 0){
				reports[index].tests.failures.trend = 1;
			}else{
				reports[index].tests.failures.trend = 0;
			}
			
			reports[index].tests.errors = {};
			reports[index].tests.errors.value = total_report_errors;
			if(total_report_errors > 0){
				reports[index].tests.errors.trend = 1;
			}else{
				reports[index].tests.errors.trend = 0;
			}
			
			reports[index].tests.passes = {};
			reports[index].tests.passes.value = total_report_passes;
			if(total_report_passes > 0){
				reports[index].tests.passes.trend = 1;
			}else{
				reports[index].tests.passes.trend = 0;
			}
			
			reports[index].tests.regressions = {};
			reports[index].tests.regressions.value = total_report_regressions;
			if(total_report_regressions > 0){
				reports[index].tests.regressions.trend = 1;
			}else{
				reports[index].tests.regressions.trend = 0;
			}	
			
			reports[index].tests.new_regressions = {};
			reports[index].tests.new_regressions.value = total_report_new_regression;
			if(total_report_new_regression > 0){
				reports[index].tests.new_regressions.trend = 1;
			}else{
				reports[index].tests.new_regressions.trend = 0;
			}
			
			reports[index].tests.fixed_regressions = {};
			reports[index].tests.fixed_regressions.value = total_report_fixed_regression;
			if(total_report_fixed_regression > 0){
				reports[index].tests.fixed_regressions.trend = 1;
			}else{
				reports[index].tests.fixed_regressions.trend = 0;
			}
			
			//If there is are previous reports, we look for the one with same name then we set the trend
			if(previous_reports.length != 0){
				var previousIndex = -1;
				for(var i = 0; i < previous_reports.length; i++){
					if(reports[index].name == previous_reports[i].name){
						if(previousIndex != -1){
							return e.error(data, ack, true, "Multiple previous reports were found with same name "+reports[index].name+". " +
									"Clean previous corrupted report entries from your database. " +
									"Keep the oldest entry having name set to "+reports[index].name+" and next_id field set to null.");
						}
						
						previousIndex = i;
					}
				}
				if(previousIndex != -1){
					if(previous_reports[previousIndex].tests.all.value == total_report_tests){
						reports[index].tests.all.trend = 0;
					}else if(previous_reports[previousIndex].tests.all.value > total_report_tests){
						reports[index].tests.all.trend = -1;
					}else{
						reports[index].tests.all.trend = 1;
					}
					
					if(previous_reports[previousIndex].tests.failures.value == total_report_failures){
						reports[index].tests.failures.trend = 0;
					}else if(previous_reports[previousIndex].tests.failures.value > total_report_failures){
						reports[index].tests.failures.trend = -1;
					}else{
						reports[index].tests.failures.trend = 1;
					}
					
					if(previous_reports[previousIndex].tests.errors.value == total_report_errors){
						reports[index].tests.errors.trend = 0;
					}else if(previous_reports[previousIndex].tests.errors.value > total_report_errors){
						reports[index].tests.errors.trend = -1;
					}else{
						reports[index].tests.errors.trend = 1;
					}
					
					if(previous_reports[previousIndex].tests.passes.value == total_report_passes){
						reports[index].tests.passes.trend = 0;
					}else if(previous_reports[previousIndex].tests.passes.value > total_report_passes){
						reports[index].tests.passes.trend = -1;
					}else{
						reports[index].tests.passes.trend = 1;
					}
				
					if(previous_reports[previousIndex].tests.regressions.value == total_report_regressions){
						reports[index].tests.regressions.trend = 0;
					}else if(previous_reports[previousIndex].tests.regressions.value > total_report_regressions){
						reports[index].tests.regressions.trend = -1;
					}else{
						reports[index].tests.regressions.trend = 1;
					}
					
					if(previous_reports[previousIndex].tests.new_regressions.value == total_report_new_regression){
						reports[index].tests.new_regressions.trend = 0;
					}else if(previous_reports[previousIndex].tests.new_regressions.value > total_report_new_regression){
						reports[index].tests.new_regressions.trend = -1;
					}else{
						reports[index].tests.new_regressions.trend = 1;
					}
			
					if(previous_reports[previousIndex].tests.fixed_regressions.value == total_report_fixed_regression){
						reports[index].tests.fixed_regressions.trend = 0;
					}else if(previous_reports[previousIndex].tests.fixed_regressions.value > total_report_fixed_regression){
						reports[index].tests.fixed_regressions.trend = -1;
					}else{
						reports[index].tests.fixed_regressions.trend = 1;
					}
					
					//set duration info to report
					if(!_.isNull(previous_reports[previousIndex].duration) && !_.isUndefined(previous_reports[previousIndex].duration)){
						if(previous_reports[previousIndex].duration.value == reports[index].duration.value){
							reports[index].duration.trend = 0;
						}else if(previous_reports[previousIndex].duration.value > reports[index].duration.value){
							reports[index].duration.trend = -1;
						}else{
							reports[index].duration.trend = 1;
						}
					}else{
						reports[index].duration.trend = 1;
					}						
			
					//Update previous report next_id
					//This step can be done async
					collections.reports.updateById(previous_reports[previousIndex]._id, {$set: {next_id : reports[index].id}}, updatePreviousReportInfoCallback);
				}
			}
				
			
			reports[index].lifecycle_status = "completed";
		
			//Update report
			//This step can be done async
			collections.reports.updateById(reports[index]._id, {$set: reports[index]}, updateReportInfoCallback);
				
		}
	}
	
	finalizeAnalysis(build, total_tests, total_passes, total_errors, total_failures, previous_builds, ack, callback);
}

function finalizeAnalysis(build, total_tests, total_passes, total_errors, total_failures, previous_builds, ack, callback){
	var updatePreviousBuildInfoCallback = function (error, count){
		if(error) {
			return e.error(build, ack, true, "Update Build operation failed.");
	    }
		console.log("-- "+count+ " previous build updated.");
	};
	var updateBuildInfoCallback = function (error, count){
		if(error) {
			return e.error(build, ack, true, "Update Build operation failed.");
	    }
		console.log("-- "+count+ " build updated.");
		
		callback();
	};
	
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
	
	build.tests = {};
	build.tests.value = total_tests;
	if(total_tests > 0){
		build.tests.trend = 1;
	}else{
		build.tests.trend = 0;
	}
	
	build.passes = {};
	build.passes.value = total_passes;
	if(total_passes > 0){
		build.passes.trend = 1;
	}else{
		build.passes.trend = 0;
	}
	
	//If previous build exist.
	if(!_.isNull(previous_builds) && previous_builds.length == 1){
		
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
		
		if(previous_builds[0].tests.value == build.tests.value){
			build.tests.trend  = 0;
		}else if(previous_builds[0].tests.value > build.tests.value){
			build.tests.trend  = -1;
		}else{
			build.tests.trend  = 1;
		}
		
		if(previous_builds[0].passes.value == build.passes.value){
			build.passes.trend  = 0;
		}else if(previous_builds[0].passes.value > build.passes.value){
			build.passes.trend  = -1;
		}else{
			build.passes.trend  = 1;
		}
	
		if(!_.isUndefined(previous_builds[0].duration) && !_.isUndefined(build.duration)){
			if(previous_builds[0].duration.value == build.duration.value){
				build.duration.trend = 0;
			}else if(previous_builds[0].duration.value > build.duration.value){
				build.duration.trend = -1;
			}else{
				build.duration.trend = 1;
			}
		}else{
			if(_.isUndefined(build.duration)){
				build.duration = {};
			}
			
			build.duration.trend = 1;
		}
		
		//Update previous build next_id
		collections.builds.updateById(previous_builds[0]._id, {$set: {next_id : build.id}}, updatePreviousBuildInfoCallback);
	}
	
	build.end_date = new Date();
	build.lifecycle_status = "completed";

	//Update build
	collections.builds.updateById(build._id, {$set: build}, updateBuildInfoCallback);
}



