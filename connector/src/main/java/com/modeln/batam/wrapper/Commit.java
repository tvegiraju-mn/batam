package com.modeln.batam.wrapper;

import java.util.Date;

public class Commit {
	
	private String buildId;
	
	private String sha;
	
	private String url;
	
	private String author;
	
	private Date dateCommitted;

	public Commit(String buildId, String sha, String url, String author,
			Date dateCommitted) {
		super();
		this.buildId = buildId;
		this.sha = sha;
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

	public String getSha() {
		return sha;
	}

	public void setSha(String sha) {
		this.sha = sha;
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
	
	public String toJSON(){
		return "{build_id:\""+buildId+"\", sha:\""+sha+"\", url: \""+url+"\", author:\""+author+"\", date_committed: \""+dateCommitted+"\"}";
	}

	@Override
	public String toString() {
		return "Commit [buildId=" + buildId + ", sha=" + sha + ", url=" + url
				+ ", author=" + author + ", dateCommitted=" + dateCommitted
				+ "]";
	}
	
}
