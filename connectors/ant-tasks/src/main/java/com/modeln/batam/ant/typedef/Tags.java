package com.modeln.batam.ant.typedef;

import java.util.ArrayList;
import java.util.List;

public class Tags {
	private List<Tag> tags = new ArrayList<Tag>();

	public Tags() {
		super();
	}
	
	public Tag createTag() {                              
		Tag tag = new Tag();
		tags.add(tag);
        return tag;
    }

	public List<Tag> getTags() {
		return tags;
	}

}
