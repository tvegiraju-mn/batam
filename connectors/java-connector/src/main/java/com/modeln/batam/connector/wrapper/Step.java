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

import java.util.Date;

import org.json.simple.JSONObject;

/**
 * {
 * 		"order": 1,
 * 		"name" : "step name",
 * 		"start_date" : "12341234", // Time in millisecond
 * 		"end_date" : "12341234", // Time in millisecond
 *      "input": "1",
 *      "expected": "2",
 *      "output": "1",
 *      "status": "fail",
 *      "error": "addition doesn't work"
 *      "isCustomFormatEnabled" : false,
 * 	    "customFormat" : customFormat to be followed
 * 	    "customEntry" :  special entry to be added on the report
 * }
 * 
 * @author gzussa
 *
 */
public class Step {
	
	private Integer order;
	
	private String name;
	
	private Date startDate;
	
	private Date endDate;
	
	private String input;
	
	private String expected;
	
	private String output;
	
	private String status;
	
	private String error;

	private boolean isCustomFormatEnabled = false;

	private String customFormat;

	private String customEntry;

	public Step(String name, Date startDate, Date endDate) {
		super();
		this.name = name;
		this.startDate = startDate;
		this.endDate = endDate;
	}
	
	public Step(Integer order, String name, Date startDate, Date endDate, String input, String expected, String output, String status, String error) {
		super();
		this.order = order;
		this.name = name;
		this.startDate = startDate;
		this.endDate = endDate;
		this.input = input;
		this.expected = expected;
		this.output = output;
		this.status = status;
		this.error = error;
	};

	public Step(Integer order, String name, Date startDate, Date endDate, String input, String expected, String output, String status, String error,
				boolean isCustomFormatEnabled, String customFormat, String customEntry) {
		this(order, name, startDate, endDate, input, expected, output, status, error);
		this.isCustomFormatEnabled = isCustomFormatEnabled;
		this.customFormat = customFormat;
		this.customEntry = customEntry;
	}
	
	public Integer getOrder() {
		return order;
	}

	public void setOrder(Integer order) {
		this.order = order;
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

	public String getInput() {
		return input;
	}

	public void setInput(String input) {
		this.input = input;
	}
	
	public String getExpected() {
		return expected;
	}

	public void setExpected(String expected) {
		this.expected = expected;
	}

	public String getOutput() {
		return output;
	}

	public void setOutput(String output) {
		this.output = output;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}
	
	public String getError() {
		return error;
	}

	public void setError(String error) {
		this.error = error;
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
	public String toJSONString() {
		JSONObject obj = new JSONObject();
		obj.put("order", order);
		obj.put("name", name);
		obj.put("start_date", startDate == null ? null : String.valueOf(startDate.getTime()));
		obj.put("end_date", endDate == null ? null : String.valueOf(endDate.getTime()));
		obj.put("input", input);
		obj.put("expected", expected);
		obj.put("output", output);
		obj.put("status", status);
		obj.put("error", error);
		obj.put("isCustomFormatEnabled", isCustomFormatEnabled);
		obj.put("customFormat", customFormat);
		obj.put("customEntry", customEntry);


		return obj.toJSONString();
	}
	
	public static Step fromJSON(JSONObject obj){
		Integer order = (Integer)obj.get("order");
		String name = (String)obj.get("name");
		String startDate = (String)obj.get("start_date");
		String endDate = (String)obj.get("end_date");
		String input = (String)obj.get("input");
		String expected = (String)obj.get("expected");
		String output = (String)obj.get("output");
		String status = (String)obj.get("status");
		String error = (String)obj.get("error");
		boolean isCustomFormatEnabled = (Boolean)obj.get("isCustomFormatEnabled") == null? false:(Boolean)obj.get("isCustomFormatEnabled");
		String customFormat = (String)obj.get("customFormat");
		String customEntry = (String)obj.get("customEntry");
		
		return new Step(order,
				name, 
				startDate == null ? null : new Date(Long.valueOf(startDate)), 
				endDate == null ? null : new Date(Long.valueOf(endDate)),
				input,
				expected,
				output,
				status,
				error,
				isCustomFormatEnabled,
				customFormat,
				customEntry);
	}
}
