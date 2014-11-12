package com.modeln.batam.wrapper;

import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

public class Build {
	private String id;
	
	private String name;
	
	private Date startDate; 
	
	private Date endDate;
	
	private String status;
	
	private Long duration; 
	
	private String description;
	
	private Map<String, String> criterias;
	
	private Map<String, String> infos;
	
	private Map<String, String> reports;
	
	private Map<String, DateRange> steps; 
	
	private List<Commit> commits;

	public Build(String id, String name, Date startDate, Date endDate, String status,
			Long duration, String description, Map<String, String> criterias,
			Map<String, String> infos, Map<String, String> reports,
			Map<String, DateRange> steps, List<Commit> commits) {
		super();
		this.id = id;
		this.name = name;
		this.startDate = startDate;
		this.endDate = endDate;
		this.status = status;
		this.duration = duration;
		this.description = description;
		this.criterias = criterias;
		this.infos = infos;
		this.reports = reports;
		this.steps = steps;
		this.commits = commits;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Date getStartDate() {
		return startDate;
	}

	public void setStartDate(Date startDate) {
		this.startDate = startDate;
	}

	public Date getEndDate() {
		return endDate;
	}

	public void setEndDate(Date endDate) {
		this.endDate = endDate;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Long getDuration() {
		return duration;
	}

	public void setDuration(Long duration) {
		this.duration = duration;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Map<String, String> getCriterias() {
		return criterias;
	}

	public void setCriterias(Map<String, String> criterias) {
		this.criterias = criterias;
	}

	public Map<String, String> getInfos() {
		return infos;
	}

	public void setInfos(Map<String, String> infos) {
		this.infos = infos;
	}

	public Map<String, String> getReports() {
		return reports;
	}

	public void setReports(Map<String, String> reports) {
		this.reports = reports;
	}

	public Map<String, DateRange> getSteps() {
		return steps;
	}

	public void setSteps(Map<String, DateRange> steps) {
		this.steps = steps;
	}

	public List<Commit> getCommits() {
		return commits;
	}

	public void setCommits(List<Commit> commits) {
		this.commits = commits;
	}

	@Override
	public String toString() {
		return "Build [id=" + id + ", name=" + name + ", startDate="
				+ startDate + ", endDate=" + endDate + ", status=" + status + ", duration=" + duration
				+ ", description=" + description + ", criterias=" + criterias
				+ ", infos=" + infos + ", reports=" + reports + ", steps="
				+ steps + ", commits=" + commits + "]";
	}
	
	public String toJSON(){
		String json = "{"+
				"id: \""+id+"\"";
		if(name != null){
			json += ", name: \""+name+"\"";
		}
		if(startDate != null){
			json += ", start_date: \""+startDate+"\"";
		}
		if(endDate != null){
			json += ", end_date: \""+endDate+"\"";
		}
		if(status != null){
			json += ", status: \""+status+"\"";
		}
		if(duration != null){
			json += ", duration: "+duration.intValue()+"";
		}
		if(description != null){
			json += ", description: \""+description+"\"";
		}
		if(criterias != null && !criterias.isEmpty()){
			json += ", criterias: [";
			for(Iterator<String> it = criterias.keySet().iterator(); it.hasNext();){

				String criteriaName = it.next();
				String criteriaValue = criterias.get(criteriaName);
				json += "{name: \""+criteriaName+"\", value: \""+criteriaValue+"\"}";
				if(it.hasNext()){
					json += ",";
				}
			}
			json += "]";
		}
		if(infos != null && !infos.isEmpty()){
			json += ", infos: [";
			for(Iterator<String> it = infos.keySet().iterator(); it.hasNext();){

				String infoName = it.next();
				String infoValue = infos.get(infoName);
				json += "{name: \""+infoName+"\", value: \""+infoValue+"\"}";
				if(it.hasNext()){
					json += ",";
				}
			}
			json += "]";
		}
		if(reports != null && !reports.isEmpty()){
			json += ", reports: [";
			for(Iterator<String> it = reports.keySet().iterator(); it.hasNext();){

				String reportName = it.next();
				String reportValue = reports.get(reportName);
				json += "{name: \""+reportName+"\", value: \""+reportValue+"\"}";
				if(it.hasNext()){
					json += ",";
				}
			}
			json += "]";
		}
		if(steps != null && !steps.isEmpty()){
			json += ", steps: [";
			for(Iterator<String> it = steps.keySet().iterator(); it.hasNext();){

				String stepName = it.next();
				DateRange stepDateRange = steps.get(stepName);
				json += "{name: \""+stepName+"\", value: \""+stepDateRange.toJSON()+"\"}";
				if(it.hasNext()){
					json += ",";
				}
			}
			json += "]";
		}
		if(commits != null && !commits.isEmpty()){
			json += ", commits: [";
			for(Iterator<Commit> it = commits.iterator(); it.hasNext();){

				Commit commit = it.next();
				json += commit.toJSON();
				if(it.hasNext()){
					json += ",";
				}
			}
			json += "]";
		}
		
		json += "}";
		
		return json;
	}
}
