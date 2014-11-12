package com.modeln.batam.wrapper;

import java.util.Date;
import java.util.Iterator;
import java.util.List;

public class TestReport {
	private String id;
	
	private String buildId; 
	
	private String name; 
	
	private String description;
	
	private Date date;
	
	private String status;
	
	private Long duration;
	
	private List<String> logs;

	public TestReport(String id, String buildId, String name,
			String description, Date date, String status, Long duration,
			List<String> logs) {
		super();
		this.id = id;
		this.buildId = buildId;
		this.name = name;
		this.description = description;
		this.date = date;
		this.status = status;
		this.duration = duration;
		this.logs = logs;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getBuildId() {
		return buildId;
	}

	public void setBuildId(String buildId) {
		this.buildId = buildId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
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

	public List<String> getLogs() {
		return logs;
	}

	public void setLogs(List<String> logs) {
		this.logs = logs;
	}

	@Override
	public String toString() {
		return "TestReport [id=" + id + ", buildId=" + buildId + ", name="
				+ name + ", description=" + description + ", date=" + date
				+ ", status=" + status + ", duration=" + duration + ", logs="
				+ logs + "]";
	}
	
	public String toJSON(){
		String json = "{"+
				"id: \""+id+"\"";
		if(buildId != null){
			json += ", build_id: \""+buildId+"\"";
		}
		if(name != null){
			json += ", name: \""+name+"\"";
		}
		if(description != null){
			json += ", description: \""+description+"\"";
		}
		if(date != null){
			json += ", date: \""+date+"\"";
		}
		if(status != null){
			json += ", status: \""+status+"\"";
		}
		if(duration != null){
			json += ", duration: "+duration+"";
		}
		if(logs != null && !logs.isEmpty()){
			json += ", logs: [";
			for(Iterator<String> it = logs.iterator(); it.hasNext();){

				String log = it.next();
				json += "\""+log+"\"";
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
