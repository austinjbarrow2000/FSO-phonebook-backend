const express = require('express');
var morgan = require('morgan');
const cors = require('cors');
const app = express();

app.use(cors())
app.use(express.json())
app.use(morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      JSON.stringify(req.body)
    ].join(' ')
}))

let persons = [
    { 
        "id": 1,
        "name": "Arto Hellas", 
        "number": "040-123456"
    },
    { 
        "id": 2,
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
    },
    { 
        "id": 3,
        "name": "Dan Abramov", 
        "number": "12-43-234345"
    },
    { 
        "id": 4,
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    response.json(persons)    
})

app.get('/info', (request, response) => {
    const currentDate = new Date().toString();
    response.send(`
        <div>
            Phonebook has info for ${persons.length} people
        </div>
        <div>
            ${currentDate}
        </div>

    `)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()

})

const generateID = () => {
    max = 100000
    min = 0

    return (Math.floor(Math.random() * (max - min) ) + min)
}

app.post('/api/persons', (request,response) => {
    const body = request.body

    if( !body.name ) {
        return response.status(400).json(
            { error: "No name provided"}
        )
    }

    if( !body.number ) {
        return response.status(400).json(
            { error: "No number provided"}
        )
    }

    if( persons.filter(person => person.name === body.name).length !== 0 ) {
        return response.status(400).json(
            { error: "name must be unique"}
        )
    }

    const person = {
        "id": generateID(),
        "name": body.name,
        "number": body.number
    }

    persons = persons.concat(person)

    response.json(person)
    
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(process.env.PORT)
})