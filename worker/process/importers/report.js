var _ = require('underscore');
var util = require('util');
var config = require('../../config.js');
var e = require('../error/errorHandler.js');

var mongoskin = require('mongoskin'),
	dbUrl = process.env.MONGOHQ_URL || config.database.URL,
	db = mongoskin.db(dbUrl, {safe:true}),
	collections = {
		builds: db.collection('builds'),
		reports: db.collection('reports')
	};
	
exports.create = createReportEntrypoint;

function createReportEntrypoint(data, ack){
	var findPendingBuildCallback = function (error, builds){
		if(error){
			return e.error(data, ack, false, "Find Build Operation failed.");
		}
		if(builds.length == 0){
			return e.error(data, ack, true, "Build doesn't exist. "+
				"Please make sure to create a build using the create_build action before to create a report (using create_report action) in it.");
		}
		if(builds.length  > 1){
			var corrupted_build_id = "";
			for(var bi = 0; bi < builds.length ; bi++){
				if(bi != 0){
					corrupted_build_id += ",";
				}
				corrupted_build_id += builds[bi].id;
			}
			
			return e.error(data, ack, true, "Multiple builds were found. " +
					"Clean corrupted build entries (ids: "+corrupted_build_id+") from your database. " +
					"Keep the oldest entry having lifecycle_status field set to pending.");
		}
		
		//Create report.
		createReport(builds[0], data, ack);
	};
	
	var buildId = data.build_id;
	var buildName = data.build_name;
	
	//Check build exist using buildid and name provided
	if((_.isUndefined(buildId) || _.isNull(buildId)) && !_.isNull(buildName)){
		collections.builds.find({name: buildName, lifecycle_status : "pending"}).toArray(findPendingBuildCallback);
	}else if(!_.isNull(buildId) && !_.isNull(buildName)){
		collections.builds.find({id: buildId, name: buildName, lifecycle_status : "pending"}).toArray(findPendingBuildCallback);
	}else if(!_.isNull(buildId)){
		collections.builds.find({id: buildId, lifecycle_status : "pending"}).toArray(findPendingBuildCallback);
	}else{
		return e.error(data, ack, true, "Build Id or name not valid. Please, set at least one of them.");
	}
}

function createReport(build, data, ack){
	var checkReportExistCallback = function (error, count){
		var findPreviousReportCallback = function (error, previous_reports){
			var persistReportCallback = function (error, resp){
				if(error) {
					return e.error(data, ack, false, "Insert new Report failed.");
			    }
				
			    console.log("-- Create report.");
			    
				ack.acknowledge();
				
			};
			
    		if(error){
				return e.error(data, ack, false, "Find Report Operation failed.");
			}
			
			if(previous_reports.length > 1){
				var previous_corrupted_report_id = "";
				for(var pri = 0; pri < previous_reports.length ; pri++){
					if(pri != 0){
						previous_corrupted_report_id += ",";
					}
					previous_corrupted_report_id += previous_reports[pri].id;
				}
				
				return e.error(data, ack, true, "Multiple previous reports were found. " +
						"Clean previous corrupted report entries (ids: "+previous_corrupted_report_id+") from your database. " +
						"Keep the oldest entry having lifecycle_status set to completed and next_id field set to null.");
			}
			
			//If no previous reports were found.
			if(previous_reports.length == 0){
				report.previous_id = null;
		    	//Create report.
				collections.reports.insert(report, persistReportCallback);
			}else{
				//If previous report exist we set the previous_id attribute
	    		report.previous_id = previous_reports[0].id;
				//Create report.
				collections.reports.insert(report, persistReportCallback);
			}	
		};
		
		//Handle Error.
    	if(error) {
    		return e.error(data, ack, false, "Find Report Operation failed.");
	    }
    	
    	//Check if report already exist.
    	if(count > 0){
    		return e.error(data, ack, true, "Report with id "+report.id+" and name "+report.name+" already exists. " +
			"Please, set a unique report id or let the system define one by only specifying the report name.");
    	}
    	
    	//Fetch previous report in order to set previous_id attribute
    	collections.reports.find({name: report.name, build_id: build.previous_id, lifecycle_status : "completed", next_id : null}).toArray(findPreviousReportCallback);
	};
	
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
	report.build_name = build.name;
	report.lifecycle_status = "pending";
	build.next_id = null;
	
	//Check name
	if(_.isUndefined(name) || _.isNull(name)){
		return e.error(data, ack, true, "Name field not found.");
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
	
	//Check start date
	if(!_.isNull(start_date) && (!_.isNumber(parseInt(start_date)) || !_.isDate(new Date(parseInt(start_date))))){
		return e.error(data, ack, true, "Start_date field not valid.");
	}
	if(!_.isNull(start_date)){
		report.date = new Date(parseInt(start_date));
	}
	
	//Set duration value if possible
	if(!_.isNull(end_date) && (!_.isNumber(parseInt(end_date)) || !_.isDate(new Date(parseInt(end_date))))){
		return e.error(data, ack, true, "End_date field not valid.");
	}
	if(!_.isNull(report.date) && !_.isNull(end_date)){
		report.duration = {};
		report.duration.value = parseInt(end_date) - parseInt(report.date.getTime());
		report.duration.trend = 0;
		report.end_date = new Date(parseInt(end_date));
	}
	
	//Check logs
	if(!_.isNull(logs) && !_.isArray(logs)){
		return e.error(data, ack, true, "Logs field not valid.");
	}else{
		report.logs = [];
	}
	if(!_.isNull(logs)){
		for(var i = 0; i < logs.length; i++){
			if(!_.isString(logs[i])){
				return e.error(data, ack, true, "Logs field "+i+" not valid.");
			}
			report.logs[i] = logs[i];
		}
	}
	
	//Check if report already exist.
	collections.reports.count({id: report.id, name: report.name}, checkReportExistCallback);
}

exports.update = updateReportEntrypoint;

function updateReportEntrypoint(data, ack){
	var findBuildReportCallback = function (error, builds){
		if(error){
			return e.error(data, ack, false, "Find Build Operation failed.");
		}
		if(builds.length == 0){
			return e.error(data, ack, true, "Build doesn't exist. "+
			"Please make sure to create a build using the create_build action before to update a report (using update_report action) in it.");
		}
		if(builds.length  > 1){
			var corrupted_build_id = "";
			for(var bi = 0; bi < builds.length ; bi++){
				if(bi != 0){
					corrupted_build_id += ",";
				}
				corrupted_build_id += builds[bi].id;
			}
			
			return e.error(data, ack, true, "Multiple builds were found. " +
					"Clean corrupted build entries (ids: "+corrupted_build_id+") from your database. " +
					"Keep the oldest entry having lifecycle_status field set to pending.");
		}

		//Update report.
		updateBuildReport(builds[0], data, ack);
	};
	
	var id = data.id;
	var name = data.name;
	var buildId = data.build_id;
	var buildName = data.build_name;
	
	//if build_name is defined, we need to fetch buildid
	if(!_.isNull(buildName)){
		collections.builds.find({name: buildName, lifecycle_status : "pending"}).toArray(findBuildReportCallback);
	}else{
		var build = {};
		build.id = buildId;
		
		updateBuildReport(build, data, ack);
	}
}

function updateBuildReport(build, data, ack){
	var findReportsCallback = function (error, reports){
		if(error){
			return e.error(data, ack, false, "Find Report Operation failed.");
		}
		if(reports.length == 0){
			return e.error(data, ack, true, "Report doesn't exist. Please make sure to create a report using the create_report action before to update it.");
		}
		if(reports.length  > 1){
			var corrupted_report_id = "";
			for(var ri = 0; ri < reports.length ; ri++){
				if(ri != 0){
					corrupted_report_id += ",";
				}
				corrupted_report_id += corrupted_report_id[ri].id;
			}
			return e.error(data, ack, true, "Multiple reports were found. " +
					"Clean corrupted reports entries (ids: "+corrupted_report_id+") from your database. " +
					"Keep the oldest report entry having lifecycle_status field set to pending.");
		}
		
		//Update report.
		updateReport(reports[0], data, ack);
	};
	
	var id = data.id;
	var name = data.name;
	var buildId = build.id;
	
	if(_.isNull(name) && _.isNull(id)){
		return e.error(data, ack, true, "Id or name not valid.");
	}
	
	//Check Report exist using id and name provided
	var searchCriterias = {};
	searchCriterias.lifecycle_status = "pending";
	if(!_.isNull(name)){
		searchCriterias.name = name;
	}
	if(!_.isNull(id)){
		searchCriterias.id = id;
	}
	if(!_.isNull(buildId)){
		searchCriterias.build_id = buildId;
	}
	
	collections.reports.find(searchCriterias).toArray(findReportsCallback);
	
}

function updateReport(report, data, ack){
	var updateReportInfoCallback = function (error, count){
		if(error) {
			return e.error(data, ack, false, "Update Report operation failed.");
	    }
		
		ack.acknowledge();
	};
	
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

	//Check start date
	if(!_.isNull(start_date) && (!_.isNumber(parseInt(start_date)) || !_.isDate(new Date(parseInt(start_date))))){
		return e.error(data, ack, true, "Start_date field not valid.");
	}
	if(!_.isNull(start_date)){
		report.date = new Date(parseInt(start_date));
	}
	
	//Set duration value if possible
	if(!_.isNull(end_date) && (!_.isNumber(parseInt(end_date)) || !_.isDate(new Date(parseInt(end_date))))){
		return e.error(data, ack, true, "End_date field not valid.");
	}
	if(!_.isNull(report.date) && !_.isNull(end_date) && _.isDate(report.date)){
		report.duration = {};
		report.duration.value = parseInt(end_date) - parseInt(report.date.getTime());
		report.duration.trend = 0;
		report.end_date = new Date(parseInt(end_date));
	}

	//Update logs, 
	if(!_.isNull(logs) && !_.isArray(logs)){
		return e.error(data, ack, true, "Logs field not valid.");
	}
	if(_.isNull(report.logs) || !_.isArray(report.logs)){
		report.logs = [];
	}
	var logsLength = report.logs.length;
	if(!_.isNull(logs)){
		for(var i = 0; i < logs.length; i++){
			if(!_.isString(logs[i])){
				return e.error(data, ack, true, "Logs object "+i+" not valid.");
			}
			report.logs[logsLength + i] = logs[i];
		}
	}

	//Update reports
	collections.reports.updateById(report._id, {$set: report}, updateReportInfoCallback);
}


