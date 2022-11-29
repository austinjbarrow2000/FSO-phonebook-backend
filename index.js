require('dotenv').config()
const express = require('express')
var morgan = require('morgan')
const cors = require('cors')
const app = express()
const mongoose = require('mongoose')
const Person = require('./models/person')





app.use(cors())
app.use(express.static('build'))
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

// let persons = [
//     { 
//         "id": 1,
//         "name": "Arto Hellas", 
//         "number": "040-123456"
//     },
//     { 
//         "id": 2,
//         "name": "Ada Lovelace", 
//         "number": "39-44-5323523"
//     },
//     { 
//         "id": 3,
//         "name": "Dan Abramov", 
//         "number": "12-43-234345"
//     },
//     { 
//         "id": 4,
//         "name": "Mary Poppendieck", 
//         "number": "39-23-6423122"
//     }
// ]

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)    
    })
})

app.get('/info', (request, response) => {
    const currentDate = new Date().toString();
    Person.find({}).then(persons => { 
        const personsLength = persons.length;

        response.send(`
        <div>
            Phonebook has info for ${personsLength} people
        </div>
        <div>
            ${currentDate}
        </div>

        `)
    })
    
})

app.get('/api/persons/:id', (request, response, next) => {
    // const id = Number(request.params.id)
    // const person = persons.find(person => person.id === id)
    // if (person) {
    //     response.json(person)
    // } else {
    //     response.status(404).end()
    // }

    Person.findById(request.params.id).then(person => {
        if(person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    })
    .catch(err => next(err))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id).then(result => {
        response.status(204).end()
    })
    .catch(err => next(err))

    // const id = Number(request.params.id)
    // persons = persons.filter(person => person.id !== id)
    // response.status(204).end()

})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, {new: true})
    .then(updatedPerson => {
        response.json(updatedPerson)
    })
    .catch(err => next(err))

})

// const generateID = () => {
//     max = 100000
//     min = 0

//     return (Math.floor(Math.random() * (max - min) ) + min)
// }

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

    const person = new Person({
        // "id": generateID(),
        "name": body.name,
        "number": body.number
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
    
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
  
// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } 
  
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(process.env.PORT)
})