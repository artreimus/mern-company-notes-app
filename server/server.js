require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const { loggerMiddleware, logEvents } = require('./middleware/logger');
const errorHandlerMiddleware = require('./middleware/errorHandler');
const notFoundMiddleware = require('./middleware/notFound');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const connectDB = require('./config/dbConn');
const mongoose = require('mongoose');

connectDB();

// middlewares
app.use(loggerMiddleware);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
// static files can be served in 2 ways
// app.use('/', express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));

app.use('/', require('./routes/root'));
app.use('/api/v1/auth', require('./routes/authRoutes'));

app.use('/api/v1/users', require('./routes/userRoutes'));
app.use('/api/v1/notes', require('./routes/noteRoutes'));

// more middlewares
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

mongoose.connection.once('open', () => {
  console.log('Connected to DB');
  app.listen(PORT, console.log(`Listening on Port ${PORT}`));
});

mongoose.connection.on('error', (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    'mongoErrorLog.log'
  );
});
