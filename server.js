const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const path = require('path');
const { logger } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');

// middlewares
app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
// static files can be served in 2 ways
// app.use('/', express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));

app.use('/', require('./routes/root'));
app.all('*', (req, res) => {
  // We can setup the status before sending the response
  // res.status(404)
  if (req.accepts('html')) {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.status(404).json({ message: '404 Not Found' });
  } else {
    res.status(404).type('txt').send('404 not found');
  }
});

// more middlewares
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
