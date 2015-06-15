package com.modeln.batam.ant.task;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

import org.apache.tools.ant.BuildException;

import com.modeln.batam.connector.Connector;
import com.modeln.batam.connector.wrapper.Pair;
import com.modeln.batam.connector.wrapper.TestEntry;
import com.modeln.batam.ant.typedef.Criteria;
import com.modeln.batam.ant.typedef.Criterias;
import com.modeln.batam.ant.typedef.Step;
import com.modeln.batam.ant.typedef.Steps;
import com.modeln.batam.ant.typedef.Tag;
import com.modeln.batam.ant.typedef.Tags;

public abstract class AbstractTestTask extends AbstractBatamTask {
	
	private String reportId; 
	
	private String reportName; 
	
	private String name; 
	
	private String description; 
	
	private String startDate; 
	
	private String endDate;
	
	private String dateFormat;
	
	private String status; 
	
	private String log; 
	
	private String override = "false";
	
	private List<Criterias> criterias = new ArrayList<Criterias>();
	
	private List<Tags> tags = new ArrayList<Tags>();
	
	private List<Steps> steps = new ArrayList<Steps>();
	
	public Criterias createCriterias() {                              
		Criterias criteria = new Criterias();
		criterias.add(criteria);
        return criteria;
    }
	
	public Tags createTags() {                              
		Tags tag = new Tags();
		tags.add(tag);
        return tag;
    }
	
	public Steps createSteps() {                              
		Steps step = new Steps();
		steps.add(step);
        return step;
    }
	
	public String getReportId() {
		return reportId;
	}

	public void setReportId(String reportId) {
		this.reportId = reportId;
	}

	public String getReportName() {
		return reportName;
	}

	public void setReportName(String reportName) {
		this.reportName = reportName;
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

	public String getLog() {
		return log;
	}

	public void setLog(String log) {
		this.log = log;
	}

	public String getOverride() {
		return override;
	}

	public void setOverride(String override) {
		this.override = override;
	}

	@Override
	public void execute(){
		//Check params.
		checkUnaryList(criterias);
		checkUnaryList(tags);
		checkUnaryList(steps);
		
		//Build test object.
		TestEntry test = new TestEntry();
		test.setReportId(reportId);
		test.setReportName(reportName);
		test.setName(name);
		test.setDescription(description);
		test.setOverride(Boolean.parseBoolean(override));
		SimpleDateFormat formatter = new SimpleDateFormat(dateFormat == null? DEFAULT_DATE_FORMAT: dateFormat);
		try {
			if(startDate != null){
				test.setStartDate(formatter.parse(startDate));
			}
			if(endDate != null){
				test.setEndDate(formatter.parse(endDate));
			}
		} catch (ParseException e) {
			throw new BuildException("Task failed", e);
		}
		test.setStatus(status);
		test.setLog(log);
		
		//Add criterias to test.
		List<Pair> testCriterias = new ArrayList<Pair>();
		if(!criterias.isEmpty()){
			for(int i = 0; i < criterias.get(0).getCriterias().size(); i++){
				Criteria criteria = criterias.get(0).getCriterias().get(i);
				testCriterias.add(new Pair(criteria.getName(), criteria.getValue()));
			}
		}
		test.setCriterias(testCriterias);
		
		//Add tags to test.
		List<String> testTags = new ArrayList<String>();
		if(!tags.isEmpty()){
			for(int i = 0; i < tags.get(0).getTags().size(); i++){
				Tag tag = tags.get(0).getTags().get(i);
				testTags.add(tag.getValue());
			}
		}
		test.setTags(testTags);
		
		//Add steps to test.
		List<com.modeln.batam.connector.wrapper.Step> testSteps = new ArrayList<com.modeln.batam.connector.wrapper.Step>();
		if(!steps.isEmpty()){
			for(int i = 0; i < steps.get(0).getSteps().size(); i++){
				Step step = steps.get(0).getSteps().get(i);
				testSteps.add(new com.modeln.batam.connector.wrapper.Step(step.getOrder(), step.getName(), step.getStatus(), step.getResult(), step.getExpected()));
			}
		}
		test.setSteps(testSteps);
		
		setConnector(Connector.getInstance());

		beginConnection();
		
		operation(test);
		
		endConnection();
		
	}
}
