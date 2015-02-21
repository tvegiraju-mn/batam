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

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.json.simple.JSONObject;

/**
 * {
 * 		"build_id" : "Build identifier this commit belong to",
 * 		"build_name" : "Build name this commit belong to",
 * 		"commit_id" : "647df1d1728f7787c467d93dc5bcbb9de3ec2261",
 * 		"url" : "https://github.com/user_name/project_name/commit/647df1d1728f7787c467d93dc5bcbb9de3ec2261"
 * 		"author" : "username@company.com",
 * 		"date_committed" : "23452345" //Time in millisecond
 * }
 * 
 * @author gzussa
 *
 */
public class Commit {
	
	private String buildId;
	
	private String buildName;
	
	private String commitId;
	
	private String url;
	
	private String author;
	
	private Date dateCommitted;

	public Commit(String buildId, String buildName, String commitId, String url, String author, Date dateCommitted) {
		super();
		this.buildId = buildId;
		this.buildName = buildName;
		this.commitId = commitId;
		this.url = url;
		this.author = author;
		this.dateCommitted = dateCommitted;
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

	public String getCommitId() {
		return commitId;
	}

	public void setCommitId(String commitId) {
		this.commitId = commitId;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public String getAuthor() {
		return author;
	}

	public void setAuthor(String author) {
		this.author = author;
	}

	public Date getDateCommitted() {
		return dateCommitted;
	}

	public void setDateCommitted(Date dateCommitted) {
		this.dateCommitted = dateCommitted;
	}
	
	@SuppressWarnings("unchecked")
	public String toJSONString(){
		JSONObject obj = new JSONObject();
		obj.put("build_id", buildId);
		obj.put("build_name", buildName);
		obj.put("commit_id", commitId);
		obj.put("url", url);
		obj.put("author", author);
		//To json return date_committed as time in ms
		obj.put("date_committed", dateCommitted == null ? null : String.valueOf(dateCommitted.getTime()));
		
		return obj.toJSONString();
	}
	
	@Override
	public String toString() {
		return toJSONString();
	}
	
	public static Commit fromJSON(JSONObject obj){
		String buildId = (String)obj.get("build_id");
		String buildName = (String)obj.get("build_name");
		String commitId = (String)obj.get("commit_id");
		String url = (String)obj.get("url");
		String author = (String)obj.get("author");
		String dateCommitted = (String)obj.get("date_committed");
		DateFormat dateFormat = new SimpleDateFormat("EEE MMM d HH:mm:ss yyyy Z");
		try {
			return new Commit(buildId, buildName, commitId, url, author, dateCommitted == null ? null : dateFormat.parse(dateCommitted));
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}
	
}
