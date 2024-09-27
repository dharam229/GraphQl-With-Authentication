const mongoose = require("mongoose");
mongoose.set("strictQuery", true);
const DB_URL = process.env.DB_URI;
exports.connect = () => {
	
	//Connect DB
	mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
	
    // Error handler
    mongoose.connection.on('connected', function () {
        console.log('MongoDB connected!');
    });

    // Error handler
    mongoose.connection.on('error', function (err) {
        console.error('MongoDB Connection Error. Please make sure MongoDB is running. -> ' + err);
    });

    // Reconnect when closed
    mongoose.connection.on('disconnected', function () {
        connect()
    });

};