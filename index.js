require('dotenv').config();
const express = require('express');
const morgan = require('morgan');

const app = express();
const Person = require('./models/person');

app.use(express.json());
app.use(express.static('build'));
morgan.token('data', (request) => JSON.stringify(request.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'));

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get('/info', (request, response) => {
  Person.find({}).then((persons) => {
    const date = new Date();
    const message = `<div>Phonebook has info for ${persons.length} people </div>\
                        <div>${date.toString()}</div>`;
    console.log(date.toString());
    response.send(message);
  });
});

app.get('/api/persons/:id', (request, response, next) => {
  Person
    .findById(request.params.id)
    .then((person) => {
      if (!person) {
        return response.status(404).end();
      }
      return response.json(person);
    })
    .catch((error) => { next(error); });
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person
    .findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).send();
    })
    .catch((error) => { next(error); });
});

// const generateId = () => {
//   while (true) {
//     const id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
//     const person = persons.find((person) => person.id === id);
//     if (!person) return id;
//   }
// };

app.post('/api/persons', async (request, response, next) => {
  const { body } = request;
  // Check for empty body data: null and undefined case,
  // case with no key, and case that the object is not
  // initiated

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save()
    .then((savedPerson) => {
      response.status(201).json(savedPerson);
    })
    .catch((error) => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
  const { body } = request;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(
    request.params.id,
    person,
    { new: true, runValidators: true, context: 'query' },
  )
    .then((updatedNote) => {
      response.json(updatedNote);
    })
    .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }

  if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message });
  }

  return next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
