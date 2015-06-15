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
 * 		"name" : "step name",
 * 		"start_date" : "12341234", // Time in millisecond
 * 		"end_date" : "12341234", // Time in millisecond
 *      "order": 1,
 *      "status": "success",
 *      "result": "2",
 *      "expected": "2"
 * }
 * 
 * @author gzussa
 *
 */
public class Step {
	
	private String name;
	
	private Date startDate;
	
	private Date endDate;
	
	private Integer order;
	
	private String status;
	
	private String result;
	
	private String expected;

	public Step(String name, Date startDate, Date endDate) {
		super();
		this.name = name;
		this.startDate = startDate;
		this.endDate = endDate;
	}
	
	public Step(Integer order, String name, String status, String result, String expected) {
		super();
		this.order = order;
		this.name = name;
		this.status = status;
		this.result = result;
		this.expected = expected;
	}
	
	public Step(String name, Date startDate, Date endDate, Integer order, String status, String result, String expected) {
		super();
		this.name = name;
		this.startDate = startDate;
		this.endDate = endDate;
		this.order = order;
		this.status = status;
		this.result = result;
		this.expected = expected;
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

	
	
	public Integer getOrder() {
		return order;
	}

	public void setOrder(Integer order) {
		this.order = order;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getResult() {
		return result;
	}

	public void setResult(String result) {
		this.result = result;
	}

	public String getExpected() {
		return expected;
	}

	public void setExpected(String expected) {
		this.expected = expected;
	}

	@Override
	public String toString() {
		return toJSONString();
	}
	
	@SuppressWarnings("unchecked")
	public String toJSONString() {
		JSONObject obj = new JSONObject();
		obj.put("name", name);
		obj.put("start_date", startDate == null ? null : String.valueOf(startDate.getTime()));
		obj.put("end_date", endDate == null ? null : String.valueOf(endDate.getTime()));
		obj.put("order", order);
		obj.put("status", status);
		obj.put("result", result);
		obj.put("expected", expected);
		
		return obj.toJSONString();
	}
	
	public static Step fromJSON(JSONObject obj){
		String name = (String)obj.get("name");
		String startDate = (String)obj.get("start_date");
		String endDate = (String)obj.get("end_date");
		Integer order = (Integer)obj.get("order");
		String status = (String)obj.get("status");
		String result = (String)obj.get("result");
		String expected = (String)obj.get("expected");
		
		return new Step(name, 
				startDate == null ? null : new Date(Long.valueOf(startDate)), 
				endDate == null ? null : new Date(Long.valueOf(endDate)),
				order,
				status,
				result,
				expected);
	}
}
