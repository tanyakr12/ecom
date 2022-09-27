const app = require("./app.js");

const dotenv = require("dotenv");
const connectDatabase = require("./config/database")

// handling uncaught exceptions
process.on("uncaughtException", err => {
    console.log(`Error: ${err}`);
    console.log(`Shutting down the server due to uncaught exceptions`);
    process.exit(1);
})

// config
dotenv.config({path:"backend/config/config.env"})

// connecting to database
connectDatabase();

const server = app.listen(process.env.PORT, () => {
    console.log(`server is working on http://localhost:${process.env.PORT}`);
});


// unhandled promise rejection
process.on("unhandledRejection", err => {
    console.log(`Error: ${err}`);
    console.log(`Shutting down the server due to unhandled promise rejection`);
    server.close(() => {
        process.exit(1);
    });
});