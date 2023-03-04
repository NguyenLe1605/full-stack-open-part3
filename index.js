require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const app = express();
const Person = require('./models/person');

app.use(express.json());
app.use(express.static('build'));
morgan.token('data', (request, response) => {
    return JSON.stringify(request.body);
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'));

// let persons = [
//     { 
//         "id": 1,
//         "name": "Arto Hellas", 
//         "number": "040-123456"
//       },
//       { 
//         "id": 2,
//         "name": "Ada Lovelace", 
//         "number": "39-44-5323523"
//       },
//       { 
//         "id": 3,
//         "name": "Dan Abramov", 
//         "number": "12-43-234345"
//       },
//       { 
//         "id": 4,
//         "name": "Mary Poppendieck", 
//         "number": "39-23-6423122"
//       }
// ];

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons);
    })
});

app.get('/info', (request, response) => {
    Person.find({}).then(persons => {
        const date = new Date();
        const message = `<div>Phonebook has info for ${persons.length} people </div>\
                        <div>${date.toString()}</div>`;
        console.log(date.toString());
        response.send(message);
    })
});

app.get('/api/persons/:id', (request, response) => {
    Person
        .findById(request.params.id)
        .then(person => {
            if (!person) {
                return response.status(404).end();      
            }
            response.json(person);
        })
        .catch(error => {
            return response.status(404).end();
        })

});

app.delete('/api/persons/:id', (request, response) => {
    // const id = Number(request.params.id);
    // persons = persons.filter(person => person.id !== id);

    Person
        .findByIdAndDelete(request.params.id)
        .then(person => {})
        .catch(error => {});

    // console.log(persons);
    response.status(204).send();
});

const generateId = () => {
    while(true) {
        const id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        const person = persons.find(person => person.id === id);
        if (!person) return id;
    }
}

app.post('/api/persons', async (request, response) => {
    const body = request.body;
    // Check for empty body data: null and undefined case,
    // case with no key, and case that the object is not
    // initiated
    if (body && 
        Object.keys(body).length === 0 &&
        body.constructor === Object) {
        return response.status(400).json({
            error: "Missing body data",
        });
    }

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: "Missing name or number",
        });
    }

    // if (persons.find(person => person.name === body.name)) {
    //     return response.status(400).json({
    //         error: "name must be unique",
    //     });
    // }
    const existedPerson = await Person.findOne({name: body.name});
    
    if (existedPerson) {
        return response.status(400).json({
            error: "name must be unique",
        });
    }

    const person = new Person({
        name: body.name,
        number: body.number
    });

    person.save().then(savedPerson => {
        response.status(201).json(savedPerson);
    })
})

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
