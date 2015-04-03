package com.modeln.batam.ant.task;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

import org.apache.tools.ant.BuildException;

import com.modeln.batam.connector.Connector;
import com.modeln.batam.connector.wrapper.BuildEntry;
import com.modeln.batam.connector.wrapper.Pair;
import com.modeln.batam.ant.typedef.Commit;
import com.modeln.batam.ant.typedef.Commits;
import com.modeln.batam.ant.typedef.Criteria;
import com.modeln.batam.ant.typedef.Criterias;
import com.modeln.batam.ant.typedef.Info;
import com.modeln.batam.ant.typedef.Infos;
import com.modeln.batam.ant.typedef.Report;
import com.modeln.batam.ant.typedef.Reports;
import com.modeln.batam.ant.typedef.Step;
import com.modeln.batam.ant.typedef.Steps;

public abstract class AbstractBuildTask extends AbstractBatamTask {

	private String id;
	
	private String name;
	
	private String startDate; 
	
	private String endDate;
	
	private String dateFormat;
	
	private String status;
	
	private String description;
	
	private String override = "false";
	
	private List<Criterias> criterias = new ArrayList<Criterias>();
	
	private List<Infos> infos = new ArrayList<Infos>();
	
	private List<Reports> reports = new ArrayList<Reports>();
	
	private List<Steps> steps = new ArrayList<Steps>(); 
	
	private List<Commits> commits = new ArrayList<Commits>();
	
	public Criterias createCriterias() {                              
		Criterias criteria = new Criterias();
		criterias.add(criteria);
        return criteria;
    }
	
	public Infos createInfos() {                                
		Infos info = new Infos();
		infos.add(info);
        return info;
    }
	
	public Reports createReports() {                                
		Reports report = new Reports();
		reports.add(report);
        return report;
    }
	
	public Steps createSteps() {                                
		Steps step = new Steps();
		steps.add(step);
        return step;
    }
	
	public Commits createCommits() {                                
		Commits commit = new Commits();
		commits.add(commit);
        return commit;
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

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
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
		checkUnaryList(infos);
		checkUnaryList(reports);
		checkUnaryList(steps);
		checkUnaryList(commits);
		
		//Build build object.
		BuildEntry build = new BuildEntry();
		build.setId(id);
		build.setName(name);
		build.setDescription(description);
		build.setOverride(Boolean.parseBoolean(override));
		SimpleDateFormat formatter = new SimpleDateFormat(dateFormat == null? DEFAULT_DATE_FORMAT: dateFormat);
		try {
			if(startDate != null){
				build.setStartDate(formatter.parse(startDate));
			}
			if(endDate != null){
				build.setEndDate(formatter.parse(endDate));
			}
		} catch (ParseException e) {
			throw new BuildException("Task failed", e);
		}
		build.setStatus(status);
		//Add criterias to build.
		List<Pair> buildCriterias = new ArrayList<Pair>();
		if(!criterias.isEmpty()){
			for(int i = 0; i < criterias.get(0).getCriterias().size(); i++){
				Criteria criteria = criterias.get(0).getCriterias().get(i);
				buildCriterias.add(new Pair(criteria.getName(), criteria.getValue()));
			}
		}
		build.setCriterias(buildCriterias);
		//Add infos to build.
		List<Pair> buildInfos = new ArrayList<Pair>();
		if(!infos.isEmpty()){
			for(int i = 0; i < infos.get(0).getInfos().size(); i++){
				Info info = infos.get(0).getInfos().get(i);
				buildInfos.add(new Pair(info.getName(), info.getValue()));
			}
		}
		build.setInfos(buildInfos);
		//Add reports to build.
		List<Pair> buildReports = new ArrayList<Pair>();
		if(!reports.isEmpty()){
			for(int i = 0; i < reports.get(0).getReports().size(); i++){
				Report report = reports.get(0).getReports().get(i);
				buildReports.add(new Pair(report.getName(), report.getValue()));
			}
		}
		build.setReports(buildReports);
		//Add steps to build.
		List<com.modeln.batam.connector.wrapper.Step> buildSteps = new ArrayList<com.modeln.batam.connector.wrapper.Step>();
		if(!steps.isEmpty()){
			for(int i = 0; i < steps.get(0).getSteps().size(); i++){
				Step step = steps.get(0).getSteps().get(i);
				try {
					buildSteps.add(new com.modeln.batam.connector.wrapper.Step(step.getName(), formatter.parse(step.getStartDate()), formatter.parse(step.getEndDate())));
				} catch (ParseException e) {
					throw new BuildException("Task failed", e);
				}
			}
		}
		build.setSteps(buildSteps);
		//Add commits to build.
		List<com.modeln.batam.connector.wrapper.Commit> buildCommits = new ArrayList<com.modeln.batam.connector.wrapper.Commit>();
		if(!commits.isEmpty()){
			for(int i = 0; i < commits.get(0).getCommits().size(); i++){
				Commit commit = commits.get(0).getCommits().get(i);
				try {
					buildCommits.add(new com.modeln.batam.connector.wrapper.Commit(id, name, commit.getCommitId(), commit.getUrl(), commit.getAuthor(), formatter.parse(commit.getDateCommitted())));
				} catch (ParseException e) {
					throw new BuildException("Task failed", e);
				}
			}
		}
		build.setCommits(buildCommits);
		
		setConnector(Connector.getInstance());

		beginConnection();
		
		operation(build);
		
		endConnection();
	}
}
