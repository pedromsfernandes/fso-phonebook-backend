const express = require("express");
const morgan = require("morgan");

const app = express();

app.use(express.json());

morgan.token(
  "postData",
  (req, res) => (req.body.name !== undefined && JSON.stringify(req.body)) || ""
);

app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :postData"
  )
);

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4
  }
];

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.post("/api/persons", (req, res) => {
  const { name, number } = req.body;

  if (!name || !number)
    res.status(400).json({
      error: "name or number missing"
    });

  if (persons.find(person => person.name === name)) {
    res.status(400).json({
      error: "name must be unique"
    });
  }

  const id = Math.floor(Math.random() * 1000);

  const newPerson = {
    id,
    name,
    number
  };

  persons = persons.concat(newPerson);

  res.json(newPerson);
});

app.get("/api/persons/:id", (req, res) => {
  const person = persons.find(person => person.id === parseInt(req.params.id));

  if (person) res.json(person);
  else res.status(404).end();
});

app.delete("/api/persons/:id", (req, res) => {
  persons = persons.filter(person => person.id !== parseInt(req.params.id));

  res.status(204).end();
});

app.get("/info", (req, res) => {
  res.send(
    `<p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date().toUTCString()}</p>`
  );
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
