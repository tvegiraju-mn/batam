package com.modeln.batam.wrapper;

import java.util.Date;

public class DateRange {
	private Date startDate;
	
	private Date endDate;

	public DateRange(Date startDate, Date endDate) {
		super();
		this.startDate = startDate;
		this.endDate = endDate;
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
	
	public String toJSON(){
		return "{start_date:\""+startDate+"\", end_date:\""+endDate+"\"}";
	}

	@Override
	public String toString() {
		return "DateRange [startDate=" + startDate + ", endDate=" + endDate
				+ "]";
	}
	
	
}
