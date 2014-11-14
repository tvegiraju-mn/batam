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
 * 		"report_id" : "report identifier this test belong to",
 * 		"report_name" : "report name this test belong to",
 * 		"name" : "package#testname()",
 * 		"start_date" : "12341234", // Time in millisecond
 * 		"end_date" : "12341234", // Time in millisecond
 * 		"status" : "pass|failed|error| name it",
 * 		"log" : "test logs",
 * 		"criterias" : [{@link com.modeln.batam.connector.wrapper.Pair}]
 * }
 * 
 * @author gzussa
 *
 */
public class TestInstance {
	private String reportId; 
	
	private String reportName; 
	
	private String name; 
	
	private Date startDate; 
	
	private Date endDate;
	
	private String status; 
	
	private String log; 
	
	private List<Pair> criterias;

	public TestInstance(String reportId, String reportName, String name, Date startDate, Date endDate, String status,
			List<Pair> criterias, String log) {
		super();
		this.reportId = reportId;
		this.name = name;
		this.startDate = startDate;
		this.endDate = endDate;
		this.status = status;
		this.criterias = criterias;
		this.log = log;
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

	public String getLog() {
		return log;
	}

	public void setLog(String log) {
		this.log = log;
	}

	public List<Pair> getCriterias() {
		return criterias;
	}

	public void setCriterias(List<Pair> criterias) {
		this.criterias = criterias;
	}

	public String toJSONString() {
		JSONObject obj = new JSONObject();
		obj.put("report_id", reportId);
		obj.put("report_name", reportName);
		obj.put("name", name);
		obj.put("start_date", startDate == null ? null : String.valueOf(startDate.getTime()));
		obj.put("end_date", endDate == null ? null : String.valueOf(endDate.getTime()));
		obj.put("status", status);
		obj.put("criterias", criterias);
		obj.put("log", log);
		return obj.toJSONString();
	}
	
	@Override
	public String toString() {
		return toJSONString();
	}
	
	public static TestInstance fromJSON(JSONObject obj){
		String reportId = (String)obj.get("report_id");
		String reportName = (String)obj.get("report_name");
		String name = (String)obj.get("name");
		String startDate = (String)obj.get("start_date");
		String endDate = (String)obj.get("end_date");
		String status = (String)obj.get("status");
		
		List<Pair> criterias = new ArrayList<Pair>();
		JSONArray criteriasArray = (JSONArray)obj.get("criterias");
		if(criteriasArray != null){
			for(Iterator<JSONObject> it = criteriasArray.iterator(); it.hasNext();){
				JSONObject criteria = it.next();
				criterias.add(Pair.fromJSON(criteria));
			}
		}
		
		String log = (String)obj.get("log");
		
		return new TestInstance(reportId, reportName, name, startDate == null ? null : new Date(Long.valueOf(startDate)), endDate == null ? null : new Date(Long.valueOf(endDate)), status, criterias, log);
	}
}
