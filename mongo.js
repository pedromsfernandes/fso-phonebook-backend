const mongoose = require("mongoose");

if (process.argv.length !== 3 && process.argv.length !== 5) {
  console.log(
    `Usage: ${process.argv[0]} ${process.argv[1]} <password> [<name> <number>]`
  );
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://mrzephyr:${password}@cluster0-allbq.mongodb.net/phonebook?retryWrites=true&w=majority`;

mongoose.connect(url, { useNewUrlParser: true });

const personSchema = new mongoose.Schema({
  name: String,
  number: String
});

const Person = new mongoose.model("Person", personSchema);

if (process.argv.length === 3) {
  Person.find({}).then(res => {
    console.log("phonebook:");
    res.forEach(person => console.log(`${person.name} ${person.number}`));
    mongoose.connection.close();
  });
} else {
  const name = process.argv[3];
  const number = process.argv[4];

  const person = new Person({
    name,
    number
  });

  person.save().then(() => {
    console.log(`added ${name} number ${number} to phonebook`);
    mongoose.connection.close();
  });
}
