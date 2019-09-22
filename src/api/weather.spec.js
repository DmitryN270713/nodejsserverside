const server = require('../server/weather-server')
const request = require('supertest')
const should = require('should')
const sha1 = require('sha1')
const expect = require('expect')

describe('Locations\' Weather API', () => {
    let app = null
    let testLocationsWithRecords = [{ 
        "id": "97a999e7a2c37aa099177ac45a4de788da335a28",
        "name": "Washington",
        "country": "USA",
        "weatherData" : [
            {"date": "2018-11-01 14:07:09.777", "pressure": 3, "temperature": 25, "humidity": 100 },
            {"date": "2017-12-01 11:07:09.777", "pressure": 4, "temperature": 27, "humidity": 99 },
            {"date": "2015-11-01 10:07:09.777", "pressure": 3, "temperature": 25, "humidity": 100 },
            {"date": "2010-12-01 09:07:09.777", "pressure": 4, "temperature": 27, "humidity": 99 },
            {"date": "2011-11-01 04:07:09.777", "pressure": 5, "temperature": 21, "humidity": 90 },
            {"date": "2014-11-01 07:07:09.777", "pressure": 7, "temperature": 26, "humidity": 97 },
            {"date": "2019-12-01 07:07:09.777", "pressure": 7, "temperature": 26, "humidity": 97 }
    ]}, {    
        "id": "a96e5a1a4965ac93673625c1eec0262503824e5b",
        "name": "Oulu",
        "country": "Finland",
        "weatherData" : [
            {"date": "2018-11-01 14:07:09.777", "pressure": 3, "temperature": 25, "humidity": 100 },
            {"date": "2017-12-01 11:07:09.777", "pressure": 7, "temperature": -27, "humidity": 99 },
            {"date": "2015-11-01 10:07:09.777", "pressure": 4, "temperature": 5, "humidity": 100 },
            {"date": "2010-12-01 09:07:09.777", "pressure": 5, "temperature": 27, "humidity": 99 }
    ]}]

    let testAllLocations = [{
        "id": "dd39228e281641635b87b4980cf2d3faedc5d366",
        "name": "New-York",
        "country": "USA",
        "weather": [
            {
                "date": "2019-09-21T16:10:34.805Z",
                "pressure": 0,
                "temperature": 0,
                "humidity": 0
            }
        ],
        "_id": "5d7d1de69bd4220aa019a4ed"

    }]

    let newLocation = {
            "id": "cc67b756e13580d088bb6122a6bb6490cc8a543f",
            "name": "San Francisco",
            "country": "USA",
            "weather": [
                {
                    "date": "2019-09-21T16:10:34.805Z",
                    "pressure": 0,
                    "temperature": 0,
                    "humidity": 0
                }
            ],
            "_id": "5d864b7afc567b1fa47659e4"
        }

    let testDBWorker = {
        getAllLocations (toskip, perreq) {
            let locations = []
            for (i = toskip; i < perreq; i++) {
                item = {
                    id: testLocationsWithRecords[i].id,
                    name: testLocationsWithRecords[i].name,
                    country: testLocationsWithRecords[i].country
                }
                locations.push(item)
            }
            return Promise.resolve(locations)
        },

        addLocation (name, country) {
            var result = testAllLocations.find((element) => {
                return element.id === sha1(name + country)
            })
            
            if(!result) {
                testAllLocations.push(newLocation)
                return Promise.resolve(newLocation)
            } else {
                return Promise.reject(new Error('An error occured adding new location'))
            }
        }
    }

    let testServerOptions = {
        port: 3000,
        ssl: ()=> ({        
            useSsl: false,
            validDays: 1
        })
    }

    // Can be refactored later to async function
    beforeEach(() => {
        return server.startServer(testServerOptions, testDBWorker).then(server => {
            app = server
        })
    })
    
    afterEach(() => {
        app.close()
        app = null
    })

    it('Should return all locations', (done) => {
        request(app)
        .get('/locations/alllocations/0/2')
        .expect((res) => {
           // console.log(res.body.should)
            firstObj = res.body[0]
            secondObj = res.body[1]
            firstObj.should.containEql({        
                "id": "97a999e7a2c37aa099177ac45a4de788da335a28",
                "name": "Washington",
                "country": "USA"
            })
            
            secondObj.should.containEql({
                "id": "a96e5a1a4965ac93673625c1eec0262503824e5b",
                "name": "Oulu",
                "country": "Finland"
            })
        })
        .expect(200, done)
    })

    it('Should return 1 location', (done) => {
        request(app)
        .get('/locations/alllocations/1/2')
        .expect((res) => {
            res.body[0].should.containEql({
                "id": "a96e5a1a4965ac93673625c1eec0262503824e5b",
                "name": "Oulu",
                "country": "Finland"
            })
        })
        .expect(200, done)
    })

    it('Should add one location', (done) => {
        request(app)
        .post('/locations/addlocation')
        .set("Content-Type", "application/json")
        .send({"city":"San Francisco","country":"USA"})      
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
            res.body.should.have.property('id', 'cc67b756e13580d088bb6122a6bb6490cc8a543f')
            done()
        })
    })

    it('Should fail to add one location', (done) => {
        request(app)
        .post('/locations/addlocation')
        .set("Content-Type", "application/json")
        .send({"city":"New-York","country":"USA"})      
        .expect(418)
        .expect('Content-Type', /json/)
        .end((err, res) => {
            res.body.should.have.property('error', 'An error occured adding new location')
            done()
        })
    })
})
