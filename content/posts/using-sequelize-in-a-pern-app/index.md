---
template: post
title: Using Sequelize in a PERN app
slug: /posts/using-sequelize-in-a-pern-app/
draft: false
date: '2019-04-10T22:40:32.169Z'
description: Building a full stack application is a mixture of different technologies. Choosing the technologies and understanding how they all fit together can be a daunting task, depending on your experience. In this tutorial, We'll build an event management system with Postgres, Express.Js, React.js, Node.js and sequelize.js as the ORM.
category: Software
tags:
  - sequelize
  - database
  - nodejs
  - express
  - react
# image: ./images/effective-learner.jpeg
---

Building a full stack application is a mixture of different technologies. Choosing the technologies and understanding how they all fit together can be a daunting task, depending on your experience.
In this tutorial, We'll build an event management system with Postgres, Express.Js, React.js, Node.js and sequelize.js as the ORM.

The primary goal is to see how to use Sequelize.js in a PERN app.
I assume you have a basic understanding of PostgreSQL, Express.Js, React.js, and Node.js. If you don't, never mind. Let's move on together 🎉

So, let's get started 📂

Fun part: Sequelize.js was the first ORM i used as a Software Engineer 😃

Project setup and requirements
First off, let's visualize our project directories

```js
- event-manager
  - server/
  - client/
    - api/
```
Next up, let's get down to the terminal for the actual work. The first directory to work on is the server/.

```sh
$ mkdir event-manager && cd event-manager
$ mkdir server && server
```

Initialize the app as a nodejs application and install dependencies

```sh
$ npm init -y // Initialize the project with default values
$ npm add express body-parser sequelize sequelize-cli pg pg-hstore
```
That's all we need for now. Let's move attention to the client. 
We'll use create-react-app to  setup the client so we can focus on the goal of the the tutorial. 
Back to the terminal…
```sh
$ npm install -g create-react-app # Install the package globally
$ cd event-manager
$ create-react-app client # create the client application
```
Install dependencies required for the client.

```$ npm install styled-components // awesome CSS-in-JS package for styling```

That's all for setting up… 👍
Building out the SERVER + API
First off, let's create our data access layer. Remember to cd into the server directory throughout this section.
Again, to the terminal and initialize the data access layer with sequelize-cli we earlier installed.

```$ ./node_modules/sequelize init```

This will create some directories: migrations, config, models, seeders. 
config- contains configurations on how to connect with database
models: contains all models for your project
migrations: contains all migration files for managing schema versioning
seeders: contains all seed files for your database

Now, let's edit config/config.json and set correct database credentials and dialect.
```js
{   
   "development": {
     "username": "root", // Use your postgres username
     "password": null,  // Edit if your database requires password
     "database": "event_manager_development", // Edited
     "host": "127.0.0.1",
     "dialect": "postgres" // Edited
   },
   "test": {
     "username": "root",     
     "password": null,
     "database": "event_manager_database_test", // Edited
     "host": "127.0.0.1",
     "dialect": "postgres"
   },
   "production": {
     "username": "root",
     "password": null,
     "database": "event_manager_database_test", // Edited
     "host": "127.0.0.1",
     "dialect": "postgres"
   }
}
```
If your database doesn't exists yet, you can just call db:create command. With proper access it will create that database for you.
See the docs for list of available commands.
Next up, let's create our event model with the required fields

```sh
$ ./node_modules/sequelize model:generate --name Event --attributes name:string,venue:string,date:string,organizer:string,website:string
```

The above command will create models/events.js in models folder
migrations/xxxxxxxxxxxx-create-event.js in migrations folder

Also, additional fields are auto generated for you
id, createdAt, and updatedAt 

Note: Ensure you create the database specified in config/config.json and your database server is running
It's time to run the migration files against our database.
```sh
$ ./node_modules/sequelize db:migrate // Runs all migration files
```