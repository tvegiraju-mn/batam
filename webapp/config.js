module.exports = {
	database:{
		URL: 'mongodb://@localhost:27017/batam' 
	},
	reports:{
		report:{
			display:{
				summary: {
					name: true,
					description: true,
					start_date: true,
					end_date: true,
					status: true,
					duration: true,
					total : true,
					passes: true,
					failures: true,
					errors: true,
					columns:{
						order: true,
						name: true,
						status: true,
						duration: true
					}
				},
				test:{
					name: true,
					description: true,
					start_date: true,
					end_date: true,
					duration: true,
					status: true,
					tags: true,
					log: true,
					steps:{
						order: true,
						name: true,
						input: true,
						expected: true,
						status: true,
						output: true,
						duration: true,
						error: true	
					}
				}
				
			}
		}
	}
}