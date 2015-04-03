package com.modeln.batam.ant.typedef;

import java.util.ArrayList;
import java.util.List;

public class Steps {
	private List<Step> steps = new ArrayList<Step>();

	public Steps() {
		super();
	}
	
	public Step createStep() {                              
		Step step = new Step();
		steps.add(step);
        return step;
    }

	public List<Step> getSteps() {
		return steps;
	}

}
