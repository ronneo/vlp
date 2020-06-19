const express = require('express')

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const compression = require('compression')
const helmet = require('helmet')
const cors = require('cors')
const fs = require('fs')
const https = require('https')
const http = require('http')

const usersRouter = require('./routes/users')

const privateKey  = fs.readFileSync(__dirname+'/../ssl/server.key', 'utf8');
const certificate = fs.readFileSync(__dirname+'/../ssl/server.cert', 'utf8');
const credentials = {key: privateKey, cert: certificate};

const PORT = process.env.PORT || 4000
const HTTPSPORT = process.env.HTTP_PORT || 5000

const app = express()

app.use(cors())
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(bodyParser.json())
if (process.env.NODE_ENV && process.env.NODE_ENV !== 'development') {
    app.get('*', (req, res) => {
      res.sendFile('build/index.html', { root: __dirname })
  })
}

app.use('/users', usersRouter)

app.use((err, req, res, next) => {
   console.error(err.stack)
   res.status(500).send('Something broke!')
})

// Start express app
const httpServer = http.createServer(app);
httpServer.listen(PORT);