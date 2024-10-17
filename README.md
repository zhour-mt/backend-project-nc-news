# Northcoders News API

Hi! Welcome to my backend project.

**Introduction to the Project**  
The aim of this project was to develop the backend of a web server called LetsRead.  

This server manages and provides data similar to a typical news site. The API offers several endpoints for interacting with resources such as articles, comments, topics, and users. Users can retrieve and interact with this data directly via the API.  

To see detailed information about all available endpoints, please see the endpoints.json file available in the repository.  

**Hosted Version**  
The hosted version of the API can be accessed using this link: https://lets-read-zbam.onrender.com  
Follow the link with any of the available endpoints in order to achieve what you are interested in.  

**Minimum versions of Node and Postgres required**  
Node.js version required: v22.7.0  
Postgres version required: psql (PostgreSQL) 14.13  

**Instructions for Cloning the Repository**  
To clone and access the respository, use the following commands:  

```  
git clone https://github.com/zhour-mt/backend-project-nc-news.git  
cd backend-project-nc-news  
```  

**Dependencies to Install**  
Npm packages were installed to allow for the achieved functionality.  
To install all packages used, use the following command:  

```  
npm install  
```  

For more details on the packages used, refer to the package.json file, which includes both dependencies and devDependencies.

**How to Seed Local Databases**  
To populate your local PostgreSQL database with the test and development data, run the following command

```  
npm run seed  
```  


**How to run tests**  
To ensure everything is working as expected, you can run the project's tests. This project uses the jest, jest-sorted, and supertest packages for testing.

To run all tests, execute:

```  
npm test  
```  

**Creating Environment Variables**  
To run the file locally, environment variables must be created in order to store the database names.  

Please use the following instructions to help set up:  

1. Create a file named '.env.test' within the main folder. This file should contain the name of the database containing the test data required to implement any methods/ tests. Use the following structure: PGDATABASE=nc_news_test.  

2. Create a second file named '.env.development'. This file contains the database name for all the actual, development data. Use the following structure: PGDATABASE=nc_news.  

3. In your .gitignore file, add the names of the files created to avoid pushing any sensitive information to GitHub.


