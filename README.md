# REST API Endpoints

The following are the list of REST API Endpoints

-----------------------------------------------------------
|  Sno | Name               | Method  | Endpoint           |
|------|--------------------|---------|--------------------|
|  1.  |  User registration |  POST   | /users/register    |
|  2.  |  User login        |  POST   | /users/register    |
|  3.  |  Get user details  |  GET    | /users/:user_name  |
------------------------------------------------------------

## Import .SQL file to MYSQL

Mysql dumps (.sql files) are available under **raw/mysql** directory.

import an SQL file to MySQL :
```
mysql -u username -p database_name < file.sql
```

## Installation

Clone the repo and under the repository install the required packages using :
```
npm install
```

## Run

Run the node application using :
```
npm start
```
The application is now up running in the 3000 port.

#1 - Mysql dumps (.sql files) are available under **raw/mysql** directory.

#2 - Postman files are attached to **raw/postman** directory in the repo.
