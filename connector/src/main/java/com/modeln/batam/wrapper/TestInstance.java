package com.modeln.batam.wrapper;

import java.util.Date;
import java.util.Iterator;
import java.util.Map;

public class TestInstance {
	private String reportId; 
	
	private String name; 
	
	private Date date; 
	
	private String status; 
	
	private Long duration; 
	
	private String log; 
	
	private Map<String, String> criterias;

	public TestInstance(String reportId, String name, Date date, String status,
			Long duration, String log, Map<String, String> criterias) {
		super();
		this.reportId = reportId;
		this.name = name;
		this.date = date;
		this.status = status;
		this.duration = duration;
		this.log = log;
		this.criterias = criterias;
	}

	public String getReportId() {
		return reportId;
	}

	public void setReportId(String reportId) {
		this.reportId = reportId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Date getDate() {
		return date;
	}

	public void setDate(Date date) {
		this.date = date;
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

	public String getLog() {
		return log;
	}

	public void setLog(String log) {
		this.log = log;
	}

	public Map<String, String> getCriterias() {
		return criterias;
	}

	public void setCriterias(Map<String, String> criterias) {
		this.criterias = criterias;
	}

	@Override
	public String toString() {
		return "TestInstance [reportId=" + reportId + ", name=" + name
				+ ", date=" + date + ", status=" + status + ", duration="
				+ duration + ", log=" + log + ", criterias=" + criterias + "]";
	}
	
	public String toJSON(){
		String json = "{"+
				"report_id: \""+reportId+"\"," +
				"name: \""+name+"\"," +
				"date: \""+date+"\"," +
				"status: \""+date+"\"," + 
				"duration: \""+duration+"\"";
		if(criterias != null && !criterias.isEmpty()){
			json += ",";
		
			for(Iterator<String> it = criterias.keySet().iterator(); it.hasNext();){
	
				String criteriaName = it.next();
				String criteriaValue = criterias.get(criteriaName);
				json += criteriaName+": \""+criteriaValue+"\"";
				if(it.hasNext()){
					json += ",";
				}
			}
		}
		
		json += "}";
		return json;
		
	}
}
