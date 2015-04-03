package com.modeln.batam.ant.task;

import java.io.IOException;
import java.util.List;

import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.Task;

import com.modeln.batam.connector.Connector;

public abstract class AbstractBatamTask extends Task {
	protected static final String DEFAULT_DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSSZ";
	
	protected String host;
	
	protected String username; 
	
	protected String password;
	
	protected Integer port;
	
	protected String vhost;
	
	protected String queue; 
	
	protected String publisher;
	
	protected Connector connector = Connector.getInstance();

	public String getHost() {
		return host;
	}

	public void setHost(String host) {
		this.host = host;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public Integer getPort() {
		return port;
	}

	public void setPort(Integer port) {
		this.port = port;
	}

	public String getVhost() {
		return vhost;
	}

	public void setVhost(String vhost) {
		this.vhost = vhost;
	}

	public String getQueue() {
		return queue;
	}

	public void setQueue(String queue) {
		this.queue = queue;
	}

	public String getPublisher() {
		return publisher;
	}

	public void setPublisher(String publisher) {
		this.publisher = publisher;
	}

	public Connector getConnector() {
		return connector;
	}

	public void setConnector(Connector connector) {
		this.connector = connector;
	}
	
	protected void checkUnaryList(List<?> list){
		if(list != null && !list.isEmpty()){
			if(list.size() != 1){
				throw new RuntimeException("task has too many nested elements.");
			}
		}
	}
	
	public void beginConnection(){
		try {
			connector.beginConnection(host, username, password, port, vhost, queue, publisher);
		} catch (IOException e) {
			throw new BuildException("Task failed", e);
		}
	}
	
	public void endConnection(){
		try {
			connector.endConnection();
		} catch (IOException e) {
			throw new BuildException("Task failed", e);
		}
	}
	
	protected abstract void operation(Object object);
	
}
