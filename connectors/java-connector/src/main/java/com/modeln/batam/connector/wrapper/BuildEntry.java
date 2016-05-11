/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Model N
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
package com.modeln.batam.connector.wrapper;

import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

/**
 * {
 * 		"id" : "Unique identifier",
 * 		"name" : "Build name (used as identifier in sequential build execution)",
 * 		"start_date" : "23452345", //Time in millisecond
 * 		"end_date" : "23452345",
 * 		"status" : "completed|failed|error| name it",
 * 		"description" : "Build description",
 * 		"criterias" : [{@link com.modeln.batam.connector.wrapper.Pair}],
 * 		"infos" : [{@link com.modeln.batam.connector.wrapper.Pair}],
 * 		"reports" : [{@link com.modeln.batam.connector.wrapper.Pair}],
 * 		"steps" : [{@link com.modeln.batam.connector.wrapper.Step}],
 * 		"commits" : [{@link com.modeln.batam.connector.wrapper.Commit}],
 * 		"override" : false
 * 		"isCustomFormatEnabled" : false,
 * 	    "customFormat" : customFormat to be followed
 * 	    "customEntry" :  special entry to be added on the report
 * }
 * 
 * @author gzussa
 *
 */
public class BuildEntry {
	private String id;
	
	private String name;
	
	private Date startDate; 
	
	private Date endDate;
	
	private String status;
	
	private String description;
	
	private List<Pair> criterias;
	
	private List<Pair> infos;
	
	private List<Pair> reports;
	
	private List<Step> steps; 
	
	private List<Commit> commits;
	
	private boolean override = false;

	private boolean isCustomFormatEnabled = false;

	private String customFormat;

	private String customEntry;

	public BuildEntry(){}
	
	public BuildEntry(String id, String name, Date startDate, Date endDate, String status,
			String description, List<Pair> criterias,
			List<Pair> infos, List<Pair> reports,
			List<Step> steps, List<Commit> commits, boolean override) {
		super();
		this.id = id;
		this.name = name;
		this.startDate = startDate;
		this.endDate = endDate;
		this.status = status;
		this.description = description;
		this.criterias = criterias;
		this.infos = infos;
		this.reports = reports;
		this.steps = steps;
		this.commits = commits;
		this.override = override;
	}

	public BuildEntry(String id, String name, Date startDate, Date endDate, String status,
					  String description, List<Pair> criterias,
					  List<Pair> infos, List<Pair> reports,
					  List<Step> steps, List<Commit> commits, boolean override,
					  boolean isCustomFormatEnabled,
					  String customFormat, String customEntry) {
		this(id, name, startDate, endDate, status, description, criterias, infos, reports, steps, commits, override);
		this.isCustomFormatEnabled = isCustomFormatEnabled;
		this.customFormat = customFormat;
		this.customEntry = customEntry;
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

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public List<Pair> getCriterias() {
		return criterias;
	}

	public void setCriterias(List<Pair> criterias) {
		this.criterias = criterias;
	}

	public List<Pair> getInfos() {
		return infos;
	}

	public void setInfos(List<Pair> infos) {
		this.infos = infos;
	}

	public List<Pair> getReports() {
		return reports;
	}

	public void setReports(List<Pair> reports) {
		this.reports = reports;
	}

	public List<Step> getSteps() {
		return steps;
	}

	public void setSteps(List<Step> steps) {
		this.steps = steps;
	}

	public List<Commit> getCommits() {
		return commits;
	}

	public void setCommits(List<Commit> commits) {
		this.commits = commits;
	}
	
	public boolean isOverride() {
		return override;
	}

	public void setOverride(boolean override) {
		this.override = override;
	}

	public boolean isCustomFormatEnabled() {
		return isCustomFormatEnabled;
	}

	public void setCustomFormatEnabled(boolean isCustomFormatEnabled) {
		this.isCustomFormatEnabled = isCustomFormatEnabled;
	}

	public String getCustomFormat() {
		return customFormat;
	}

	public void setCustomFormat(String customFormat) {
		this.customFormat = customFormat;
	}

	public String getCustomEntry() {
		return customEntry;
	}

	public void setCustomEntry(String customEntry) {
		this.customEntry = customEntry;
	}

	@Override
	public String toString() {
		return toJSONString();
	}

	@SuppressWarnings("unchecked")
	public String toJSONString(){
		JSONObject obj = new JSONObject();
		obj.put("id", id);
		obj.put("name", name);
		obj.put("start_date", startDate == null ? null : String.valueOf(startDate.getTime()));
		obj.put("end_date", endDate == null ? null : String.valueOf(endDate.getTime()));
		obj.put("description", description);
		obj.put("status", status);
		obj.put("criterias", criterias);
		obj.put("infos", infos);
		obj.put("reports", reports);
		obj.put("steps", steps);
		obj.put("commits", commits);
		obj.put("override", override);
		obj.put("isCustomFormatEnabled",isCustomFormatEnabled);
		obj.put("customFormat", customFormat);
		obj.put("customEntry", customEntry);
		
		return obj.toJSONString();
	}
	
	@SuppressWarnings("unchecked")
	public static BuildEntry fromJSON(JSONObject obj){
		String id = (String)obj.get("id");
		String name = (String)obj.get("name");
		String startDate = (String)obj.get("start_date");
		String endDate = (String)obj.get("end_date");
		String status = (String)obj.get("status");
		String description = (String)obj.get("description");
		boolean override = (Boolean)obj.get("override") == null? false:(Boolean)obj.get("override");
		
		List<Pair> criterias = new ArrayList<Pair>();
		JSONArray criteriasArray = (JSONArray)obj.get("criterias");
		if(criteriasArray != null){
			for(Iterator<JSONObject> it = criteriasArray.iterator(); it.hasNext();){
				JSONObject criteria = it.next();
				criterias.add(Pair.fromJSON(criteria));
			}
		}
		
		List<Pair> infos = new ArrayList<Pair>();
		JSONArray infosArray = (JSONArray)obj.get("infos");
		if(infosArray != null){
			for(Iterator<JSONObject> it = infosArray.iterator(); it.hasNext();){
				JSONObject info = it.next();
				infos.add(Pair.fromJSON(info));
			}
		}
		
		List<Pair> reports = new ArrayList<Pair>();
		JSONArray reportsArray = (JSONArray)obj.get("reports");
		if(reportsArray != null){
			for(Iterator<JSONObject> it = reportsArray.iterator(); it.hasNext();){
				JSONObject report = it.next();
				reports.add(Pair.fromJSON(report));
			}
		}
		
		List<Step> steps = new ArrayList<Step>();
		JSONArray stepsArray = (JSONArray)obj.get("steps");
		if(stepsArray != null){
			for(Iterator<JSONObject> it = stepsArray.iterator(); it.hasNext();){
				JSONObject step = it.next();
				steps.add(Step.fromJSON(step));
			}
		}
		
		List<Commit> commits = new ArrayList<Commit>();
		JSONArray commitsArray = (JSONArray)obj.get("commits");
		if(commitsArray != null){
			for(Iterator<JSONObject> it = commitsArray.iterator(); it.hasNext();){
				JSONObject commit = it.next();
				commits.add(Commit.fromJSON(commit));
			}
		}
		boolean isCustomFormatEnabled = (Boolean)obj.get("isCustomFormatEnabled") == null? false:(Boolean)obj.get("isCustomFormatEnabled");
		String customFormat = (String)obj.get("customFormat");
		String customEntry = (String)obj.get("customEntry");
		
		return new BuildEntry(id, name, 
					startDate == null ? null : new Date(Long.valueOf(startDate)), 
					endDate == null ? null : new Date(Long.valueOf(endDate)), 
					status, description, criterias, infos, reports, steps, commits, override, isCustomFormatEnabled, customFormat, customEntry);
	}
}
