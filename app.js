const express = require('express');
const app = express();
const queueRouter = require('./router/queueRouter');
const patientRouter = require('./router/patientRouter');
const router = express.Router();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.use('/queue', queueRouter);
app.use('/patient', patientRouter);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor Express en ejecución en http://localhost:${PORT}`);
});

module.exports = router;
