mongoimport --db batam --collection buildcriterias --file ./db/buildcriterias.json --jsonArray
mongoimport --db batam --collection builds --file ./db/builds.json --jsonArray 
mongoimport --db batam --collection commits --file ./db/commits.json --jsonArray
mongoimport --db batam --collection reports --file ./db/reports.json --jsonArray
mongoimport --db batam --collection testcriterias --file ./db/testcriterias.json --jsonArray 
mongoimport --db batam --collection tests --file ./db/tests.json --jsonArray
