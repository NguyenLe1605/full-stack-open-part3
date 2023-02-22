const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(express.json());
app.use(express.static('build'));
morgan.token('data', (request, response) => {
    return JSON.stringify(request.body);
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'));

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
];

app.get('/api/persons', (request, response) => {
    response.json(persons)
});

app.get('/info', (request, response) => {
    const date = new Date();
    const message = `<div>Phonebook has info for ${persons.length} people </div>\
                    <div>${date.toString()}</div>`;
    console.log(date.toString());
    response.send(message);
});

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const person = persons.find(person => person.id === id);
    if (!person) {
        return response.status(404).end();      
    }

    response.json(person);
});

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    persons = persons.filter(person => person.id !== id);

    console.log(persons);
    response.status(204).send();
});

const generateId = () => {
    while(true) {
        const id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        const person = persons.find(person => person.id === id);
        if (!person) return id;
    }
}

app.post('/api/persons', (request, response) => {
    const body = request.body;
    if (!body) {
        return response.status(400).json({
            error: "Missing body data",
        });
    }

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: "Missing name or number",
        });
    }

    if (persons.find(person => person.name === body.name)) {
        return response.status(400).json({
            error: "name must be unique",
        });
    }

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    };
    
    persons = persons.concat(person);
    response.status(201).json(person);
})

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
