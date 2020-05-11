import 'newrelic'
import mongoose from 'mongoose'
import { app } from './app.ts'
import { database } from './config'

// Database
mongoose.connect(database, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
  console.log('Connected to database')
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log('Listening on port ' + port)
})
