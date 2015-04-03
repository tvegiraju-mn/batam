package com.modeln.batam.ant.typedef;

import java.util.ArrayList;
import java.util.List;

public class Criterias {
	private List<Criteria> criterias = new ArrayList<Criteria>();

	public Criterias() {
		super();
	}
	
	public Criteria createCriteria() {                              
		Criteria criteria = new Criteria();
		criterias.add(criteria);
        return criteria;
    }

	public List<Criteria> getCriterias() {
		return criterias;
	}

}
