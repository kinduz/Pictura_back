const express = require('express');
const cors = require('cors');

const userRouter = require('./routes/user.routes');
const authRouter = require('./routes/auth.routes');
const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json())
app.use(cors())
app.use('/api', userRouter)
app.use('/api', authRouter)

app.listen(PORT, () => {
    console.log('server is working', PORT);
})