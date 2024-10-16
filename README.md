# Northcoders News API

Hi! Welcome to my backend project.

**`Introduction to the Project`**
The aim of this project was to develop a RESTful API designed to manage and provide data, similar to any news site. The API provides endpoints for accessing resources such as articles, comments, topics, and users, which allows users to interact directly with the backend. 

To access details about all available endpoints, please see the endpoints.json file available in the repo.

**`Hosted Version`**
To access the hosted version, this is the link: https://lets-read-zbam.onrender.com
Follow the link with any of the available endpoints in order to achieve what you are interested in.

**`Minimum versions of Node and Postgres required`**
Node.js version required: v22.7.0
Postgres version required: psql (PostgreSQL) 14.13

**`Instructions for Cloning the Repository`**
To clone and access the respository, use the following commands:
```
git clone https://github.com/zhour-mt/backend-project-nc-news.git
cd backend-project-nc-news
```

**`Dependencies to Install`**
Npm packages were installed to allow for the achieved functionality. 
To install all packages used, use the following command:
```
npm install
```

**`How to Seed Local Databases`**
Use the following command:
```
npm run seed
```

**`How to run tests`**
For the tests carried out, the jest, jest-sorted and supertest were installed to drive the development of this project. 

To carry out the tests, use the following command:
```
npm test
```

**`Creating Environment Variables`**
To run the file locally, environment variables must be created in order to store the database names.

Please use the following instructions to help set up:

1. Create a file named '.env.test'. This file should contain the name of the database containing the test data required to implement any methods/ tests. Use the following structure: PGDATABASE=nc_news_test.

2. Create a second file named '.env.development'. This file contains the database name for all the actual, development data. Use the following structure: PGDATABASE=nc_news.

3. In your .gitignore file, add the names of the files created.
