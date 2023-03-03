const mongoose = require('mongoose');

if (process.argv.length != 3 && process.argv.length != 5) {
    console.log("Invalid number of arguments");
    process.exit(0);
}

const [,,password, person_name, person_number] = process.argv;

const url = `mongodb+srv://fullstack:${password}@cluster0.9ve27hb.mongodb.net/phonebook?retryWrites=true&w=majority`;

mongoose.set('strictQuery', false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
});

const Person = mongoose.model('Person', personSchema);

if (process.argv.length === 5) {

    const person = new Person({
        name: person_name,
        number: person_number
    });

    person.save().then(result => {
        console.log(`added ${person_name} number ${person_number} to phonebook`);
        mongoose.connection.close();
    });
}

if (process.argv.length === 3) {
    Person
        .find({})
        .then(result => {
            console.log("phonebook: ");
            result.forEach(person => {
                console.log(`${person.name} ${person.number}`);
            });
            mongoose.connection.close();
        });
}
