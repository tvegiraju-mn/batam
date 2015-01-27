var _ = require('underscore');
var util = require('util');
var config = require('../../config.js');
var e = require('../error/errorHandler.js');

var mongoskin = require('mongoskin'),
	dbUrl = process.env.MONGOHQ_URL || config.database.URL,
	db = mongoskin.db(dbUrl, {safe:true}),
	collections = {
		builds: db.collection('builds'),
		buildcriterias: db.collection('buildcriterias'),
		commits: db.collection('commits')
	};

exports.create = createBuildEntrypoint;

function createBuildEntrypoint(data, ack){
	var commitsToPersist = [];
	var checkBuildExist = function (error, count){
		var fetchPreviousBuildCallback = function (error, previous_builds){
			var persistBuildCallback = function (error, resp){
				var findBuildCriteriasCallback = function (error, build_criterias){
					var persistBuildCriteriasCallback = function (error, resp){
    					if(error) {
    				    	return e.error(data, ack, false, "Insert new build criteria failed.");
    				    }
    					
    					console.log("-- Create build criteria.");
    				};
    				
    				var persistCommitsCallback = function (error, resp){
    					if(error) {
    				    	return e.error(data, ack, false, "Insert new commits failed.");
    				    }
    					
    					console.log("-- Create commits.");
    				};
    				
		    		if(error){
						return e.error(data, ack, false, "Find BuildCriterias Operation failed.");
					}
		    		
					//At this point, it is ok to insert build Criterias, insert Commits and acknowledge in parallel.
					
	    			for(var i = 0 ; i < build.criterias.length; i++){
	    				var exist = false;
	    				for(var j = 0; j < build_criterias.length; j++){
	    					if(build.criterias[i].name == build_criterias[j].name){
	    						exist = true;
	    					}
		    			}
	    				if(!exist){
	    					collections.buildcriterias.insert({name: build.criterias[i].name}, persistBuildCriteriasCallback);
	    				}
		    		}
	    			
		    		//Persist commits
	    			if(commitsToPersist.length > 0){
	    				collections.commits.insert(commitsToPersist, persistCommitsCallback);
	    			}
	    			
	    			//Acknowledge message.
	    			ack.acknowledge();
	    		};
	    		
    			if(error) {
    		    	return e.error(data, ack, false, "Insert new Build failed.");
    		    }

    			console.log("-- Create build");
    			
    			//Persist build criterias
    			collections.buildcriterias.find({}).toArray(findBuildCriteriasCallback);
    			
    		};
    		
    		if(error){
				return e.error(data, ack, false, "Find Build Operation failed.");
			}
			
			if(previous_builds.length  > 1){
				return e.error(data, ack, true, "Multiple previous build were found.");
			}
			//If no previous build were found.
			if(previous_builds.length == 0){
				build.previous_id = null;
	    		//We create the build
	    		collections.builds.insert(build, persistBuildCallback);
	    	}else{
	    		//If previous build exist we set the previous_id attribute.
	    		build.previous_id = previous_builds[0].id;
	    		//We create the build
	    		collections.builds.insert(build, persistBuildCallback);
	    	}
    	};
    	
		//Handle Error.
    	if(error) {
    		return e.error(data, ack, false, "Count Build Operation failed.");
	    }
    	
    	//Check if build already exist.
    	if(count > 0){
    		return e.error(data, ack, true, "Build already exists.");
    	}
    	
    	//Fetch previous build in order to set previous_id attribute
    	collections.builds.find({name: build.name, lifecycle_status : "completed", next_id : null}).toArray(fetchPreviousBuildCallback);
	};
	
	var id = data.id;
	var name = data.name;
	var description = data.description;
	var start_date = data.start_date;
	var end_date = data.end_date;
	var status = data.status;	
	var criterias = data.criterias;
	var infos = data.infos;
	var reports = data.reports;	
	var steps = data.steps;
	var commits = data.commits;
	
	var build = {};
	build.lifecycle_status = "pending";
	build.description = description;
	build.status = status;
	//Set next_id to null this this build is the latest one.
	build.next_id = null;
	
	//Check name
	if(_.isUndefined(name) || _.isNull(name)){
		return e.error(data, ack, true, "Name field not found.");
	}
	build.name = name;

	//Check id
	if(_.isUndefined(id) || _.isNull(id)){
		//If id is not given, we generate one
		var d = new Date();
		var time = d.getTime();
		id = name+"_"+time;
	}else{
		id = id.replace(" ","_");
	}
	build.id = id;

	//Check start
	if(!_.isNull(start_date) && (!_.isNumber(parseInt(start_date)) || !_.isDate(new Date(parseInt(start_date))))){
		return e.error(data, ack, true, "Start_date field not valid.");
	}
	if(!_.isNull(start_date)){
		build.date = new Date(parseInt(start_date));
	}
	
	//Set duration value if possible
	if(!_.isNull(end_date) && (!_.isNumber(parseInt(end_date)) || !_.isDate(new Date(parseInt(end_date))))){
		return e.error(data, ack, true, "End_date field not valid.");
	}
	if(!_.isNull(build.date) && !_.isNull(end_date)){
		build.duration = {};
		build.duration.value = parseInt(end_date) - parseInt(start_date);
		build.duration.trend = 0;
	}

	//Check criterias
	if(!_.isNull(criterias) && !_.isArray(criterias)){
		return e.error(data, ack, true, "Criterias field not valid.");
	}else{
		build.criterias = [];
	}
	if(!_.isNull(criterias)){
		for(var i = 0; i < criterias.length; i++){
			if(_.isUndefined(criterias[i]) || _.isNull(criterias[i]) || !_.isObject(criterias[i])){
				return e.error(data, ack, true, "Criterias object "+i+" not valid.");
			}
			if(_.isUndefined(criterias[i].name) || _.isNull(criterias[i].name) || _.isUndefined(criterias[i].value) || _.isNull(criterias[i].value)){
				return e.error(data, ack, true, "Criterias object "+i+" fields not valid.");
			}

			build.criterias[i] = {};
			build.criterias[i].name = criterias[i].name;
			build.criterias[i].value = criterias[i].value;
		}
	}

	//Check infos
	if(!_.isNull(infos) && !_.isArray(infos)){
		return e.error(data, ack, true, "Infos field not valid.");
	}else{
		build.infos = [];
	}
	if(!_.isNull(infos)){
		for(var i = 0; i < infos.length; i++){
			if(_.isUndefined(infos[i]) || _.isNull(infos[i]) || !_.isObject(infos[i])){
				return e.error(data, ack, true, "Infos object "+i+" not valid.");
			}
			if(_.isUndefined(infos[i].name) || _.isNull(infos[i].name) || _.isUndefined(infos[i].value) || _.isNull(infos[i].value)){
				return e.error(data, ack, true, "Infos object "+i+" fields not valid.");
			}
			build.infos[i] = {};
			build.infos[i].name = infos[i].name;
			build.infos[i].value = infos[i].value;
		}
	}

	//Check reports
	if(!_.isNull(reports) && !_.isArray(reports)){
		return e.error(data, ack, true, "Reports field not valid.");
	}else{
		build.reports = [];
	}
	if(!_.isNull(reports)){
		for(var i = 0; i < reports.length; i++){
			if(_.isUndefined(reports[i]) || _.isNull(reports[i]) || !_.isObject(reports[i])){
				return e.error(data, ack, true, "Reports object "+i+" not valid.");
			}
			if(_.isUndefined(reports[i].name) || _.isNull(reports[i].name) || _.isUndefined(reports[i].value) || _.isNull(reports[i].value)){
				return e.error(data, ack, true, "Reports object "+i+" fields not valid.");
			}
			build.reports[i] = {};
			build.reports[i].name = reports[i].name;
			build.reports[i].value = reports[i].value;
		}
	}
		
	//Check Steps
	if(!_.isNull(steps) && !_.isArray(steps)){
		return e.error(data, ack, true, "Steps field not valid.");
	}else{
		build.build_timeline = JSON.parse('{ "cols" : [' +
			' { "label" : "Build", "type" : "string" }, ' +
			'{ "label" : "Step", "type" : "string" }, ' +
			'{ "label" : "Start", "type" : "date" }, ' +
			'{ "label" : "end", "type" : "date" } ' +
			'],"rows" : []}');
	}
	if(!_.isNull(steps)){
		for(var i = 0; i < steps.length; i++){
			if(_.isUndefined(steps[i]) || _.isNull(steps[i]) || !_.isObject(steps[i])){
				return e.error(data, ack, true, "Steps object "+i+" not valid.");
			}
			if(_.isUndefined(steps[i].name) || _.isNull(steps[i].name) || 
					_.isUndefined(steps[i].start_date) || _.isNull(steps[i].start_date) || 
					_.isUndefined(steps[i].end_date) || _.isNull(steps[i].end_date)){
				return e.error(data, ack, true, "Steps object "+i+" fields not valid.");
			}
			if(!_.isNumber(parseInt(steps[i].start_date)) || !_.isDate(new Date(parseInt(steps[i].start_date)))){
				return e.error(data, ack, true, "Steps object "+i+" start_date not valid.");
			}
			if(!_.isNumber(parseInt(steps[i].end_date)) || !_.isDate(new Date(parseInt(steps[i].end_date)))){
				return e.error(data, ack, true, "Steps object "+i+" start_date not valid.");
			}
			build.build_timeline.rows[i] = {};
			build.build_timeline.rows[i].c = [];
			build.build_timeline.rows[i].c[0] = {};
			build.build_timeline.rows[i].c[0].v = "Build Execution Timeline";
			build.build_timeline.rows[i].c[1] = {};
			build.build_timeline.rows[i].c[1].v = steps[i].name;
			build.build_timeline.rows[i].c[2] = {};
			build.build_timeline.rows[i].c[2].v = new Date(parseInt(steps[i].start_date));
			build.build_timeline.rows[i].c[3] = {};
			build.build_timeline.rows[i].c[3].v = new Date(parseInt(steps[i].end_date));
		}
	}

	//Check Commits
	if(!_.isNull(commits) && !_.isArray(commits)){
		return e.error(data, ack, true, "Commits field not valid.");
	}
	if(!_.isNull(commits)){
		for(var i = 0; i < commits.length; i++){
			if(_.isUndefined(commits[i]) || _.isNull(commits[i]) || !_.isObject(commits[i])){
				return e.error(data, ack, true, "Commits object "+i+" not valid.");
			}
			if(_.isUndefined(commits[i].commit_id) || _.isNull(commits[i].commit_id) || 
					_.isUndefined(commits[i].author) || _.isNull(commits[i].author) || 
					_.isUndefined(commits[i].date_committed) || _.isNull(commits[i].date_committed)){
				return e.error(data, ack, true, "Commits object "+i+" fields not valid.");
			}
			if(!_.isNumber(parseInt(commits[i].date_committed)) || !_.isDate(new Date(parseInt(commits[i].date_committed)))){
				return e.error(data, ack, true, "Commits object "+i+" date_committed not valid.");
			}
			commitsToPersist[i] = {};
			commitsToPersist[i].build_id = build.id;
			commitsToPersist[i].sha = commits[i].commit_id;
			commitsToPersist[i].url = commits[i].url;
			commitsToPersist[i].author = commits[i].author;
			commitsToPersist[i].date_committed = new Date(parseInt(commits[i].date_committed));
		}
		build.commits = commitsToPersist.length;
	}else{
		build.commits = 0;
	}

	//Before to create a new build, we check it doesn't exist already.
	collections.builds.count({id: build.id, name: build.name}, checkBuildExist);
}

exports.update = updateBuildEntrypoint;

function updateBuildEntrypoint(data, ack){
	var findBuildCallback = function (error, builds){
		if(error){
			return e.error(data, ack, false, "Find Build Operation failed.");
		}
		if(builds.length == 0){
			return e.error(data, ack, true, "Build doesn't exist.");
		}
		if(builds.length  > 1){
			return e.error(data, ack, true, "Multiple Build were found.");
		}
		
		//Update build.
		updateBuild(builds[0], data, ack);
	};
	
	var id = data.id;
	var name = data.name;

	//Check build exist using id and name provided
	if((_.isUndefined(id) || _.isNull(id)) && !_.isNull(name)){
		collections.builds.find({name: name, lifecycle_status : "pending"}).toArray(findBuildCallback);	
	}else if(!_.isNull(id) && !_.isNull(name)){
		collections.builds.find({id: id, name: name, lifecycle_status : "pending"}).toArray(findBuildCallback);
	}else if(!_.isNull(id)){
		collections.builds.find({id: id, lifecycle_status : "pending"}).toArray(findBuildCallback);
	}else{
		return e.error(data, ack, true, "Id or name not valid.");
	}
}

function updateBuild(build, data, ack){
	var commitsToPersist = [];
	var updateBuildInfoCallback = function (error, count){
		var findBuildCriteriasCallback = function (error, build_criterias){
			var persistBuildCriteriasCallback = function (error, resp){
				if(error) {
					return e.error(data, ack, false, "Insert new build criteria failed.");
			    }
				
				console.log("-- Create build criteria.");
				
			};
			var persistCommitsCallback = function (error, resp){
				if(error) {
					return e.error(data, ack, false, "Insert operation failed.");
			    }
				
				console.log("-- Create commits.");	
			};
			
			if(error){
				return e.error(data, ack, false, "Find BuildCriterias Operation failed.");
			}
			
			//At this point, it is ok to insert build Criterias, insert Commits and acknowledge in parallel.

			for(var i = 0 ; i < build.criterias.length; i++){
				var exist = false;
				for(var j = 0; j < build_criterias.length; j++){
					if(build.criterias[i].name == build_criterias[j].name){
						exist = true;
					}
				}
				if(!exist){
					//This step can be done async
					collections.buildcriterias.insert({name: build.criterias[i].name}, persistBuildCriteriasCallback);
				}
			}
			
			//Persist commits if they exist
			if(commitsToPersist.length > 0){
				collections.commits.insert(commitsToPersist, persistCommitsCallback);
			}
		    			
			//Acknowledge message.
			ack.acknowledge();
		};
		
		if(error) {
			return e.error(data, ack, false, "Update build operation failed.");
	    }
		
	    console.log("-- Update build");
	    
		//Persist build criterias
		collections.buildcriterias.find({}).toArray(findBuildCriteriasCallback);
		
	};
	
	var description = data.description;
	var start_date = data.start_date;
	var end_date = data.end_date;
	var status = data.status;
	var criterias = data.criterias;
	var infos = data.infos;
	var reports = data.reports;
	var steps = data.steps;
	var commits = data.commits;
	
	//Check and set description
	if(!_.isNull(description)){
		build.description = description;
	}
	
	//Check and set status
	if(!_.isNull(status)){
		build.status = status;
	}
	
	//Check and set start date
	if(!_.isNull(start_date) && (!_.isNumber(parseInt(start_date)) || !_.isDate(new Date(parseInt(start_date))))){
		return e.error(data, ack, true, "Start_date field not valid.");
	}
	if(!_.isNull(start_date)){
		build.date = new Date(parseInt(start_date));
	}
	
	//Set duration value if possible
	if(!_.isNull(end_date) && (!_.isNumber(parseInt(end_date)) || !_.isDate(new Date(parseInt(end_date))))){
		return e.error(data, ack, true, "End_date field not valid.");
	}
	if(!_.isNull(build.date) && !_.isNull(end_date) && _.isDate(build.date)){
		build.duration = {};
		build.duration.value = parseInt(end_date) - parseInt(build.date.getTime());
		build.duration.trend = 0;
	}

	//Update criterias, 
	if(!_.isNull(criterias) && !_.isArray(criterias)){
		return e.error(data, ack, true, "Criterias field not valid.");
	}
	if(_.isNull(build.criterias) || !_.isArray(build.criterias)){
		build.criterias = [];
	}
	
	var criteriasLength = build.criterias.length;
	if(!_.isNull(criterias)){
		for(var i = 0; i < criterias.length; i++){
			if(_.isUndefined(criterias[i]) || _.isNull(criterias[i]) || !_.isObject(criterias[i])){
				return e.error(data, ack, true, "Criterias object "+i+" not valid.");
			}
			if(_.isUndefined(criterias[i].name) || _.isNull(criterias[i].name) || _.isUndefined(criterias[i].value) || _.isNull(criterias[i].value)){
				return e.error(data, ack, true, "Criterias object "+i+" fields not valid.");
			}
			build.criterias[criteriasLength + i] = {};
			build.criterias[criteriasLength + i].name = criterias[i].name;
			build.criterias[criteriasLength + i].value = criterias[i].value;
		}
	}

	//Update infos, 
	if(!_.isNull(infos) && !_.isArray(infos)){
		return e.error(data, ack, true, "Infos field not valid.");
	}
	if(_.isNull(build.infos) || !_.isArray(build.infos)){
		build.infos = [];
	}
	var infosLength = build.infos.length;
	if(!_.isNull(infos)){
		for(var i = 0; i < infos.length; i++){
			if(_.isUndefined(infos[i]) || _.isNull(infos[i]) || !_.isObject(infos[i])){
				return e.error(data, ack, true, "Infos object "+i+" not valid.");
			}
			if(_.isUndefined(infos[i].name) || _.isNull(infos[i].name) || _.isUndefined(infos[i].value) || _.isNull(infos[i].value)){
				return e.error(data, ack, true, "Infos object "+i+" fields not valid.");
			}
			build.infos[infosLength + i] = {};
			build.infos[infosLength + i].name = infos[i].name;
			build.infos[infosLength + i].value = infos[i].value;
		}
	}	
	
	//Update reports, 
	if(!_.isNull(reports) && !_.isArray(reports)){
		return e.error(data, ack, true, "Report field not valid.");
	}
	if(_.isNull(build.reports) || !_.isArray(build.reports)){
		build.reports = [];
	}	
	var reportsLength = build.reports.length;
	if(!_.isNull(reports)){
		for(var i = 0; i < reports.length; i++){
			if(_.isUndefined(reports[i]) || _.isNull(reports[i]) || !_.isObject(reports[i])){
				return e.error(data, ack, true, "Reports object "+i+" not valid.");
			}
			if(_.isUndefined(reports[i].name) || _.isNull(reports[i].name) || _.isUndefined(reports[i].value) || _.isNull(reports[i].value)){
				return e.error(data, ack, true, "Reports object "+i+" fields not valid.");
			}
			build.reports[reportsLength + i] = {};
			build.reports[reportsLength + i].name = reports[i].name;
			build.reports[reportsLength + i].value = reports[i].value;
		}
	}
	
	//Update steps.
	if(!_.isNull(steps) && !_.isArray(steps)){
		return e.error(data, ack, true, "Steps field not valid.");
	}
	if(_.isNull(build.build_timeline) || !_.isObject(build.build_timeline) || _.isUndefined(build.build_timeline.rows)){
		build.build_timeline = JSON.parse('{ "cols" : [' +
			' { "label" : "Build", "type" : "string" }, ' +
			'{ "label" : "Step", "type" : "string" }, ' +
			'{ "label" : "Start", "type" : "date" }, ' +
			'{ "label" : "end", "type" : "date" } ' +
			'],"rows" : []}');
	}
	var buildTimelineLength = build.build_timeline.rows.length;
	if(!_.isNull(steps)){
		for(var i = 0; i < steps.length; i++){
			if(_.isUndefined(steps[i]) || _.isNull(steps[i]) || !_.isObject(steps[i])){
				return e.error(data, ack, true, "Steps object "+i+" not valid.");
			}
			if(_.isUndefined(steps[i].name) || _.isNull(steps[i].name) || 
					_.isUndefined(steps[i].start_date) || _.isNull(steps[i].start_date) || 
					_.isUndefined(steps[i].end_date) || _.isNull(steps[i].end_date)){
				return e.error(data, ack, true, "Steps object "+i+" fields not valid.");
			}
			if(!_.isNumber(parseInt(steps[i].start_date)) || !_.isDate(new Date(parseInt(steps[i].start_date)))){
				return e.error(data, ack, true, "Steps object "+i+" start_date not valid.");
			}
			if(!_.isNumber(parseInt(steps[i].end_date)) || !_.isDate(new Date(parseInt(steps[i].end_date)))){
				return e.error(data, ack, true, "Steps object "+i+" end_date not valid.");
			}
			build.build_timeline.rows[buildTimelineLength + i] = {};
			build.build_timeline.rows[buildTimelineLength + i].c = [];
			build.build_timeline.rows[buildTimelineLength + i].c[0] = {};
			build.build_timeline.rows[buildTimelineLength + i].c[0].v = "Build Execution Timeline";
			build.build_timeline.rows[buildTimelineLength + i].c[1] = {};
			build.build_timeline.rows[buildTimelineLength + i].c[1].v = steps[i].name;
			build.build_timeline.rows[buildTimelineLength + i].c[2] = {};
			build.build_timeline.rows[buildTimelineLength + i].c[2].v = new Date(parseInt(steps[i].start_date));
			build.build_timeline.rows[buildTimelineLength + i].c[3] = {};
			build.build_timeline.rows[buildTimelineLength + i].c[3].v = new Date(parseInt(steps[i].end_date));
		}
	}
	
	//Update commits
	if(!_.isNull(commits) && !_.isArray(commits)){
		return e.error(data, ack, true, "Commits object not valid.");
	}
	if(!_.isNull(commits)){
		for(var i = 0; i < commits.length; i++){
			if(_.isUndefined(commits[i]) || _.isNull(commits[i]) || !_.isObject(commits[i])){
				return e.error(data, ack, true, "Commits object "+i+" not valid.");
			}
			if(_.isUndefined(commits[i].commit_id) || _.isNull(commits[i].commit_id) || 
					_.isUndefined(commits[i].author) || _.isNull(commits[i].author) || 
					_.isUndefined(commits[i].date_committed) || _.isNull(commits[i].date_committed)){
				return e.error(data, ack, true, "Commits object "+i+" fields not valid.");
			}
			if(!_.isNumber(parseInt(commits[i].date_committed)) || !_.isDate(new Date(parseInt(commits[i].date_committed)))){
				return e.error(data, ack, true, "Commits object "+i+" date_committed not valid.");
			}
			commitsToPersist[i] = {};
			commitsToPersist[i].build_id = build.id;
			commitsToPersist[i].sha = commits[i].commit_id;
			commitsToPersist[i].url = commits[i].url;
			commitsToPersist[i].author = commits[i].author;
			commitsToPersist[i].date_committed = new Date(parseInt(commits[i].date_committed));
		}
		build.commits = build.commits + commitsToPersist.length;
	}
	
	//Update build
	collections.builds.updateById(build._id, {$set: build}, updateBuildInfoCallback);
}



