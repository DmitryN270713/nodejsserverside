# Weather microservice

This service is open for use and modification under MIT license
Code provided "as it is".

## Known vulnerabilities and build status  
  
[![Known Vulnerabilities](https://snyk.io//test/github/DmitryN270713/nodejsserverside/badge.svg?targetFile=package.json)](https://snyk.io//test/github/DmitryN270713/nodejsserverside?targetFile=package.json)

[![Build Status](https://travis-ci.org/DmitryN270713/nodejsserverside.svg?branch=master)](https://travis-ci.org/DmitryN270713/nodejsserverside)

## Microservice documentation  

Documentation can be found [here]( https://htmlpreview.github.io/?https://github.com/DmitryN270713/nodejsserverside/blob/master/docs/index.html)  
Swagger was used to generate documentation. 

## How to deploy microservice  

`npm install`  

## How to run microservice  

1. Make sure you have MongoDB installed
2. Make sure it has collection named `weathercollection`
3. To run microservice use this command `npm start`  
  
Current version of the microservice assumes that there is no authorization required on MongoDB side