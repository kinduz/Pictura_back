const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const userRouter = require('./routes/user.routes');
const errorMiddleware = require('./middlewares/error-middleware');
const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
}))
app.use('/api', userRouter)



app.listen(PORT, () => {
    console.log('server is working', PORT);
})