package com.modeln.batam.ant.typedef;

public class Commit {
	
	private String commitId;
	
	private String url;
	
	private String author;
	
	private String dateCommitted;

	public Commit() {
		super();
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

	public String getDateCommitted() {
		return dateCommitted;
	}

	public void setDateCommitted(String dateCommitted) {
		this.dateCommitted = dateCommitted;
	}

}
