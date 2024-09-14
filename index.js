const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const userRouter = require('./routes/user.routes');
const fileRouter = require('./routes/file.routes');
const pictRouter = require('./routes/pict.routes');
const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
}))
app.use('/api', userRouter)
app.use('/api', fileRouter)
app.use('/api', pictRouter)



app.listen(PORT, () => {
    console.log('server is working', PORT);
})