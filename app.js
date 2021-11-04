const port = process.env.PORT || 3000;

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();
const dataRoute = require('./routes/data')
const userRoute = require('./routes/user')


app.use(bodyParser.json());
app.use('/data', dataRoute);
app.use('/user', userRoute);
app.use(cors());



app.get('/', (req, res) => {
    res.send('Armia Riyan');
})


app.listen(port, () => {
    console.log(`Running on PORT ${port}`);
})

module.exports = app