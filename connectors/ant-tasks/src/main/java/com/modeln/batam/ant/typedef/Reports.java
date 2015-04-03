package com.modeln.batam.ant.typedef;

import java.util.ArrayList;
import java.util.List;

public class Reports {
	private List<Report> reports = new ArrayList<Report>();

	public Reports() {
		super();
	}
	
	public Report createReport() {                              
		Report report = new Report();
		reports.add(report);
        return report;
    }

	public List<Report> getReports() {
		return reports;
	}

}
