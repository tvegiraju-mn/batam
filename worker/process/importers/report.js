var _ = require('underscore');
var util = require('util');
var config = require('../../config.js');

var mongoskin = require('mongoskin'),
	dbUrl = process.env.MONGOHQ_URL || config.database.URL,
	db = mongoskin.db(dbUrl, {safe:true}),
	collections = {
		builds: db.collection('builds'),
		reports: db.collection('reports'),
		ignored: db.collection('ignored')
	};
	
//{
// * 		"id" : "Report Identifier",
// * 		"build_id" : "build identifier this test belong to",
// * 		"build_name" : "build name this test belong to",
// * 		"name" : "Report name",
// * 		"description" : "Report description",
// * 		"start_date" : "12341234", // Time in millisecond
// * 		"end_date" : "12341234", // Time in millisecond
// * 		"status" : "completed|failed|error| name it",
// * 		"logs" : ["list of html link to archived log files"]
// * }

//========================
//{
//    id: "build_1_201401010000000000200_agile_test_plan",
//    build_id: "build_1_201401010000000000200",
//    name : "agile Test Plan",
//    description: "Agile Test Plan",
//    date : { "$date": "2014-02-01T00:00:00.000+0200" },
//    status: "error",
//    duration : {value: 23, trend: 1},
//    logs: ['<a href="#">sf1pdcertapp57a</a>'],
//    tests:{
//      all:{value: 23433, trend:1},
//      regressions: {value: 23433, trend:1},
//      new_regressions: {value: 23, trend:-1},
//      fixed_regressions: {value: 2, trend:0}
//    }
//  } ,
exports.create = function(data, ack){
	
	var buildId = data.build_id;
	var buildName = data.build_name;
	
	//Check build exist using buildid and name provided
	if((_.isUndefined(buildId) || _.isNull(buildId)) && !_.isNull(buildName)){
		collections.builds.find({name: buildName, lifecycle_status : "pending"}).toArray( function(error, builds){
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
			
			//Create report.
			createReport(builds[0], data, ack);
		});
		
	}else if(!_.isNull(buildId) && !_.isNull(buildName)){
		collections.builds.find({id: buildId, name: buildName, lifecycle_status : "pending"}).toArray( function(error, builds){
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
			
			//Create report.
			createReport(builds[0], data, ack);
			
		});
	}else if(!_.isNull(buildId)){
		collections.builds.find({id: buildId, lifecycle_status : "pending"}).toArray( function(error, builds){
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
			
			//Create report.
			createReport(builds[0], data, ack);
			
		});
	}else{
		console.log("Error: build_id or build_name not valid.");
		return -1;
	}
}

function createReport(build, data, ack){
	var id = data.id;
	
	var buildId = data.build_id;
	var buildName = data.build_name;
	var name = data.name;
	var description = data.description;
	var start_date = data.start_date;
	var end_date = data.end_date;
	var status = data.status;
	var logs = data.logs;
	
	var report = {};
	report.description = description;
	report.status = status;
	report.build_id = build.id;
	report.lifecycle_status = "pending";
	build.next_id = null;
	
	//Check name
	if(_.isUndefined(name) || _.isNull(name)){
		console.log("Error: Name field not found.");
		return -1;
	}
	report.name = name;
	
	//Check id
	if(_.isUndefined(id) || _.isNull(id)){
		//If id is not given, we generate one
		var d = new Date();
		var time = d.getTime();
		id = build.id+"_"+name;
	}else{
		//TODO check it has no space
	}
	report.id = id;
	
	//Check start and end date
	if(!_.isNull(start_date) && (!_.isNumber(parseInt(start_date)) || !_.isDate(new Date(parseInt(start_date))))){
		console.log("Error: start_date field not valid.");
		return -1;
	}
	if(!_.isNull(start_date)){
		report.date = new Date(parseInt(start_date));
	}
	
	if(!_.isNull(end_date) && (!_.isNumber(parseInt(end_date)) || !_.isDate(new Date(parseInt(end_date))))){
		console.log("Error: end_date field not valid.");
		return -1;
	}
	
	//Set duration value if possible
	if(!_.isNull(report.date) && !_.isNull(end_date)){
		report.duration = {};
		report.duration.value = parseInt(end_date) - parseInt(start_date);
		report.duration.trend = 0;
	}
	
	//Check logs
	if(!_.isNull(logs) && !_.isArray(logs)){
		console.log("Error: logs field not valid.");
		return -1;
	}else{
		report.logs = [];
	}
	if(!_.isNull(logs)){
		for(var i = 0; i < logs.length; i++){
			if(!_.isString(logs[i])){
				console.log("Error: logs field "+i+" not valid.");
				return -1
			}
			report.logs[i] = logs[i];
		}
	}
	//Check if report already exist.
	collections.reports.count({id: report.id, name: report.name}, function(error, count){
		//Handle Error.
    	if(error) {
    		console.log("Error: find Report Operation failed.");
    		return -1;
	    }
    	
    	//Check if report already exist.
    	if(count > 0){
    		console.log("Error: Report already exists.");
    		return -1;
    	}
    	
    	//Fetch previous report in order to set previous_id attribute
    	collections.reports.find({name: report.name, build_id: build.previous_id, lifecycle_status : "completed", next_id : null}).toArray(function(error, previous_reports){
    		if(error){
				console.log("Error: find Report Operation failed.");
				return -1;
			}
			
			if(previous_reports.length > 1){
				console.log("Error: Multiple Reports were found.'");
				return -1;
			}
			
			//If no previous reports were found.
			if(previous_reports.length == 0){
				report.previous_id = null;
		    	//Create report.
				collections.reports.insert(report, function(error, resp){
					if(error) {
						console.log("Error: Insert new Report failed.");
				    	return -1;
				    }
					
					//Acknowledge message.
					ack.acknowledge();
					
				});
			}else{
				//If previous report exist we set the previous_id attribute
	    		report.previous_id = previous_reports[0].id;
				//Create report.
				collections.reports.insert(report, function(error, resp){
					if(error) {
						console.log("Error: Insert new Report failed.");
				    	return -1;
				    }
					
					//Acknowledge message.
					ack.acknowledge();
					
				});
			}	
		});
	});
}

exports.update = function(data){
	
	var buildId = data.build_id;
	var buildName = data.build_name;

	//Check build exist using buildId and name provided
	if((_.isUndefined(buildId) || _.isNull(buildId)) && !_.isNull(buildName)){
		collections.builds.find({name: buildName, lifecycle_status : "pending"}).toArray( function(error, builds){
			if(error){
				console.log("Error: find Build Operation failed.");
				return -1;
			}
			if(builds.length == 0){
				console.log("Error: Build doesn't exist.'");
				return -1;
			}
			if(builds.length  > 1){
				console.log("Error: Multiple Builds were found.'");
				return -1;
			}

			//Update report.
			updateBuildReport(builds[0], data);
		});
		
	}else if(!_.isNull(buildId) && !_.isNull(buildName)){
		collections.builds.find({id: buildId, name: buildName, lifecycle_status : "pending"}).toArray( function(error, builds){
			if(error){
				console.log("Error: find Build Operation failed.");
				return -1;
			}
			if(builds.length == 0){
				console.log("Error: Build doesn't exist.'");
				return -1;
			}
			if(builds.length  > 1){
				console.log("Error: Multiple Builds were found.'");
				return -1;
			}
			
			//Update report.
			updateBuildReport(builds[0], data);
			
		});
	}else if(!_.isNull(buildId)){
		console.log("flag 3 buildId = "+buildId);
		collections.builds.find({id: buildId, lifecycle_status : "pending"}).toArray( function(error, builds){
			if(error){
				console.log("Error: find Build Operation failed.");
				return -1;
			}
			if(builds.length == 0){
				console.log("Error: Build doesn't exist.'");
				return -1;
			}
			if(builds.length  > 1){
				console.log("Error: Multiple Builds were found.'");
				return -1;
			}
			
			//Update report.
			updateBuildReport(builds[0], data);
			
		});
	}else{
		//Update report.
		updateBuildReport({}, data);
	}
}

function updateBuildReport(build, data){
	var id = data.id;
	var name = data.name;
	
	//Check Report exist using id and name provided
	if((_.isUndefined(id) || _.isNull(id)) && !_.isNull(name)){
		var searchCriterias = {};
		searchCriterias.name = name;
		searchCriterias.lifecycle_status = "pending";
		if(!_.isUndefined(build.id) && _.isNull(build.id)){
			searchCriterias.build_id = build.id;
		}
		
		collections.reports.find(searchCriterias).toArray( function(error, reports){
			if(error){
				console.log("Error: find Report Operation failed.");
				return -1;
			}
			if(reports.length == 0){
				console.log("Error: Report doesn't exist.'");
				return -1;
			}
			if(reports.length  > 1){
				console.log("Error: Multiple Reports were found.'");
				return -1;
			}
			
			//Update report.
			updateReport(reports[0], build, data);
		});
		
	}else if(!_.isNull(id) && !_.isNull(name)){
		var searchCriterias = {};
		searchCriterias.name = name;
		searchCriterias.id = id;
		searchCriterias.lifecycle_status = "pending";
		if(!_.isUndefined(build.id) && _.isNull(build.id)){
			searchCriterias.build_id = build.id;
		}
		
		collections.reports.find(searchCriterias).toArray( function(error, reports){
			if(error){
				console.log("Error: find Report Operation failed.");
				return -1;
			}
			if(reports.length == 0){
				console.log("Error: Report doesn't exist.'");
				return -1;
			}
			if(reports.length  > 1){
				console.log("Error: Multiple Reports were found.'");
				return -1;
			}
			
			//Update build.
			updateReport(reports[0], build, data);
			
		});
	}else if(!_.isNull(id)){
		var searchCriterias = {};
		searchCriterias.id = id;
		searchCriterias.lifecycle_status = "pending";
		if(!_.isUndefined(build.id) && _.isNull(build.id)){
			searchCriterias.build_id = build.id;
		}
		
		collections.reports.find(searchCriterias).toArray( function(error, reports){
			if(error){
				console.log("Error: find Report Operation failed.");
				return -1;
			}
			if(reports.length == 0){
				console.log("Error: Report doesn't exist.'");
				return -1;
			}
			if(reports.length  > 1){
				console.log("Error: Multiple Reports were found.'");
				return -1;
			}
			
			//Update build.
			updateReport(reports[0], build, data);
			
		});
	}else{
		console.log("Error: id or name not valid.");
		return -1;
	}
	
}

function updateReport(report, build, data){

	var description = data.description;
	var start_date = data.start_date;
	var end_date = data.end_date;
	var status = data.status;
	var logs = data.logs;
	
	if(!_.isNull(description)){
		report.description = description;
	}
	
	if(!_.isNull(status)){
		report.status = status;
	}

	//Check start and end date
	if(!_.isNull(start_date) && (!_.isNumber(parseInt(start_date)) || !_.isDate(new Date(parseInt(start_date))))){
		console.log("Error: start_date field not valid.");
		return -1;
	}
	if(!_.isNull(start_date)){
		report.date = new Date(parseInt(start_date));
	}
	if(!_.isNull(end_date) && (!_.isNumber(parseInt(end_date)) || !_.isDate(new Date(parseInt(end_date))))){
		console.log("Error: end_date field not valid.");
		return -1;
	}

	//Set duration value if possible
	if(!_.isNull(report.date) && !_.isNull(end_date) && _.isDate(report.date)){
		report.duration = {};
		report.duration.value = parseInt(end_date) - parseInt(report.date.getTime());
		report.duration.trend = 0;
	}

	//Update logs, 
	if(!_.isNull(logs) && !_.isArray(logs)){
		console.log("Error: Logs field not valid.");
		return -1;
	}
	if(_.isNull(report.logs) || !_.isArray(report.logs)){
		report.logs = [];
	}
	var logsLength = report.logs.length;
	if(!_.isNull(logs)){
		for(var i = 0; i < logs.length; i++){
			if(!_.isString(logs[i])){
				console.log("Error: Logs object "+i+" not valid.");
				return -1;
			}
			report.logs[logsLength + i] = logs[i];
		}
	}

	//Update reports
	collections.reports.updateById(report._id, {$set: report}, function(error, count){
		if(error) {
			console.log("Error: Update Report operation failed.");
	    	return -1;
	    }
	});
}


