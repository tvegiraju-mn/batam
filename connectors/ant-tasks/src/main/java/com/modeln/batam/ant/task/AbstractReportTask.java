package com.modeln.batam.ant.task;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

import org.apache.tools.ant.BuildException;

import com.modeln.batam.connector.Connector;
import com.modeln.batam.connector.wrapper.ReportEntry;
import com.modeln.batam.ant.typedef.Logs;

public abstract class AbstractReportTask extends AbstractBatamTask {
	private String id;
	
	private String buildId; 
	
	private String buildName;
	
	private String name; 
	
	private String description;
	
	private String startDate;
	
	private String endDate;
	
	private String dateFormat;
	
	private String status;
	
	private List<Logs> logs = new ArrayList<Logs>();
	
	public Logs createLogs() {                                
		Logs log = new Logs();
        logs.add(log);
        return log;
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

	public String getBuildName() {
		return buildName;
	}

	public void setBuildName(String buildName) {
		this.buildName = buildName;
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

	public String getStartDate() {
		return startDate;
	}

	public void setStartDate(String startDate) {
		this.startDate = startDate;
	}

	public String getEndDate() {
		return endDate;
	}

	public void setEndDate(String endDate) {
		this.endDate = endDate;
	}

	public String getDateFormat() {
		return dateFormat;
	}

	public void setDateFormat(String dateFormat) {
		this.dateFormat = dateFormat;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	@Override
	public void execute(){
		//Check params.
		checkUnaryList(logs);
		
		//Build report object.
		ReportEntry report = new ReportEntry();
		report.setBuildId(buildId);
		report.setBuildName(buildName);
		report.setDescription(description);
		report.setId(id);
		report.setName(name);
		report.setStatus(status);
		SimpleDateFormat formatter = new SimpleDateFormat(dateFormat == null? DEFAULT_DATE_FORMAT: dateFormat);
		try {
			if(startDate != null){
				report.setStartDate(formatter.parse(startDate));
			}
			if(endDate != null){
				report.setEndDate(formatter.parse(endDate));
			}
		} catch (ParseException e) {
			throw new BuildException("Task failed", e);
		}
		//Add logs to report.
		List<String> reportLogs = new ArrayList<String>();
		if(!logs.isEmpty()){
			for(int i = 0; i < logs.get(0).getLogs().size(); i++){
				String log = logs.get(0).getLogs().get(i).getValue();
				reportLogs.add(log);
			}
		}
		report.setLogs(reportLogs);
		
		setConnector(Connector.getInstance());

		beginConnection();
		
		operation(report);
		
		endConnection();
	}
}
