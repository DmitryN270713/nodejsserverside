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
        "weather" : [
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
        "weather" : [
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

    let testLocationsRemove = [{
        "id": "97a999e7a2c37aa099177ac45a4de788da335a28",
        "name": "Washington",
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

    const testNewLocation = {
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
                testAllLocations.push(testNewLocation)
                return Promise.resolve(testNewLocation)
            } else {
                return Promise.reject(new Error('An error occured adding new location'))
            }
        },

        removeLocation (id) {
            let filtered = testLocationsRemove.filter((item) => {
                return item.id === id            
            })

            return Promise.resolve(filtered)
        },

        getLocationByCountryCity (name, country) {
            var result = testLocationsWithRecords.find((element) => {
                return (element.name === name && element.country === country)
            })

            return Promise.resolve({id: result.id, name: result.name, country: result.country})
        },        

        getLocationsByCountry (country) {
            var result = testLocationsWithRecords.find((element) => {
                return (element.country === country)
            })

            return Promise.resolve([{id: result.id, name: result.name, country: result.country}])
        },        

        getLocationsByCity (city) {
            var result = testLocationsWithRecords.find((element) => {
                return (element.name === city)
            })

            return Promise.resolve([{id: result.id, name: result.name, country: result.country}])
        },

        getWeatherData(id) {
            var result = testLocationsWithRecords.find((element) => {
                return (element.id === id)
            })

            return Promise.resolve({name: result.name, country: result.country, weather: result.weather})
        },

        getWeatherDataFromDateId (id, fromDate, toDate) {
            let weatherRecs = []
            var result = testLocationsWithRecords.find((element) => {
                return (element.id === id)
            })

            if (!toDate) {
                weatherRecs = result.weather.find((element) => {
                    return (new Date(element.date) >= new Date(fromDate))
                })
            } else {
                weatherRecs = result.weather.find((element) => {
                    return (new Date(element.date) >= new Date(fromDate) && new Date(element.date) <= new Date(toDate))
                })
            }

            return Promise.resolve({name: result.name, country: result.country, weather: weatherRecs})
        },

        addWeatherToLocation (id, weatherData) {

            const expectedID = "cc67b756e13580d088bb6122a6bb6490cc8a543f"
            const expectedDataLength = 6

            if (id !== expectedID || weatherData.length !== expectedDataLength)
                return Promise.reject(new Error("Monkeys swallowed some data"))

            return Promise.resolve(weatherData)
        },

        removeWeatherRecordByDate (id, fromDate, toDate) {
            const expectedID = "cc67b756e13580d088bb6122a6bb6490cc8a543f"
            const expectedFromDate = new Date("2018-5-01 14:07:09.777")
            const expectedToDate = new Date("2019-5-01 14:07:09.777")
            const actualFromDate = new Date(fromDate)
            let actualToDate
            if (toDate) {
                actualToDate = new Date(toDate)

                if (actualToDate.getDate() !== expectedToDate.getDate())
                    return Promise.reject(new Error("Monkeys swallowed toDate date"))
            }

            if (id !== expectedID || actualFromDate.getDate() !== expectedFromDate.getDate())
                return Promise.reject(new Error("Monkeys swallowed some data"))

            return Promise.resolve(id)
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

    it('Should remove one location by id', (done) => {
        request(app)
        .delete('/locations/removelocation')
        .set("Content-Type", "application/json")
        .send({"id":"97a999e7a2c37aa099177ac45a4de788da335a28"})      
        .expect(200, done)
    })

    it('Should return 1 location by the names of the city and country', (done) => {
        request(app)
        .get('/locations/location/Washington/USA')
        .expect((res) => {
            res.body.should.containEql({
                "id": "97a999e7a2c37aa099177ac45a4de788da335a28",
                "name": "Washington",
                "country": "USA"
            })
        })
        .expect(200, done)
    })

    it('Should return 1 location by country name', (done) => {
        request(app)
        .get('/locations/country/Finland')
        .expect((res) => {
            res.body[0].should.containEql({
                "id": "a96e5a1a4965ac93673625c1eec0262503824e5b",
                "name": "Oulu",
                "country": "Finland"
            })
        })
        .expect(200, done)
    })

    it('Should return 1 location by city name', (done) => {
        request(app)
        .get('/locations/city/Oulu')
        .expect((res) => {
            res.body[0].should.containEql({
                "id": "a96e5a1a4965ac93673625c1eec0262503824e5b",
                "name": "Oulu",
                "country": "Finland"
            })
        })
        .expect(200, done)
    })

    it('Should return 1 location weather by location id', (done) => {
        request(app)
        .get('/weather/locationweather/a96e5a1a4965ac93673625c1eec0262503824e5b')
        .expect((res) => {
            res.body.should.containEql({
                "name": "Oulu",
                "country": "Finland"
            })
        })
        .expect(200, done)
    })

    it('Should return 1 location weather by location id starting from date 2017-12-07 14:07:09.777', (done) => {
        request(app)
        .get('/weather/dateweather/a96e5a1a4965ac93673625c1eec0262503824e5b/2017-12-07 14:07:09.777')
        .expect((res) => {
            res.body.should.containEql({
                "name": "Oulu",
                "country": "Finland"
            })
            res.body.weather.should.have.property('date', '2018-11-01 14:07:09.777')
        })
        .expect(200, done)
    })

    it('Should return 1 location weather by location id starting from date 2015-10-01 10:07:09.777 up till 2015-12-01 11:07:09.777', (done) => {
        request(app)
        .get('/weather/dateweather/a96e5a1a4965ac93673625c1eec0262503824e5b/2015-10-01 10:07:09.777/2015-12-01 11:07:09.777')
        .expect((res) => {
            res.body.should.containEql({
                "name": "Oulu",
                "country": "Finland"
            })
            res.body.weather.should.have.property('date', '2015-11-01 10:07:09.777')
        })
        .expect(200, done)
    })

    it('Should add six records', (done) => {
        request(app)
        .post('/weather/addweather')
        .set("Content-Type", "application/json")
        .send({
                "id": "cc67b756e13580d088bb6122a6bb6490cc8a543f",
                "weatherData" : [
                    {"date": "2018-5-01 14:07:09.777", "pressure": 3, "temperature": 25, "humidity": 100 },
                    {"date": "2017-6-01 11:07:09.777", "pressure": 4, "temperature": 27, "humidity": 99 },
                    {"date": "2015-7-01 10:07:09.777", "pressure": 3, "temperature": 25, "humidity": 100 },
                    {"date": "2010-8-01 09:07:09.777", "pressure": 4, "temperature": 27, "humidity": 99 },
                    {"date": "2011-7-21 04:07:09.777", "pressure": 5, "temperature": 21, "humidity": 90 },
                    {"date": "2014-5-15 07:07:09.777", "pressure": 7, "temperature": 26, "humidity": 97 }
        ]})
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
            if (err) {
                done(err)
            } else {
                done()
            }
        })
    })

    it('Should fail to add records', (done) => {
        request(app)
        .post('/weather/addweather')
        .set("Content-Type", "application/json")
        .send({
                "id": "cc67b756e13580d088bb6122a6bb6490cc8a543f",
                "weatherData" : [
                    {"date": "2018-5-01 14:07:09.777", "pressure": 3, "temperature": 25, "humidity": 100 },
                    {"date": "2017-6-01 11:07:09.777", "pressure": 4, "temperature": 27, "humidity": 99 },
                    {"date": "2015-7-01 10:07:09.777", "pressure": 3, "temperature": 25, "humidity": 100 },
                    {"date": "2010-8-01 09:07:09.777", "pressure": 4, "temperature": 27, "humidity": 99 },
                    {"date": "2011-7-21 04:07:09.777", "pressure": 5, "temperature": 21, "humidity": 90 }
        ]})
        .expect(418)
        .expect('Content-Type', /json/)
        .end((err, res) => {
            res.body.should.have.property('error', 'Monkeys swallowed some data')
            done()
        })
    })

    it('Should remove weather records from 2018-5-01 14:07:09.777 to 2019-5-01 14:07:09.777 by id', (done) => {
        request(app)
        .delete('/weather/removeweatherrecords')
        .set("Content-Type", "application/json")
        .send({
                "id":"cc67b756e13580d088bb6122a6bb6490cc8a543f",
                "fromDate": "2018-5-01 14:07:09.777",
                "toDate": "2019-5-01 14:07:09.777"
             })      
        .expect(200, done)
    })

    it('Should remove weather records from 2018-5-01 14:07:09.777 to present by id', (done) => {
        request(app)
        .delete('/weather/removeweatherrecords')
        .set("Content-Type", "application/json")
        .send({
                "id":"cc67b756e13580d088bb6122a6bb6490cc8a543f",
                "fromDate": "2018-5-01 14:07:09.777"
             })      
        .expect(200, done)
    })
})