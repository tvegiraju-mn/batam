package com.modeln.batam.ant.typedef;

import java.util.ArrayList;
import java.util.List;

public class Logs {
	private List<Log> logs = new ArrayList<Log>();

	public Logs() {
		super();
	}
	
	public Log createLog() {                              
		Log log = new Log();
		logs.add(log);
        return log;
    }

	public List<Log> getLogs() {
		return logs;
	}

}
