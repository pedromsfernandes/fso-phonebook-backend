require("dotenv").config();
const express = require("express");
const morgan = require("morgan");

const Person = require("./models/person");

const app = express();

app.use(express.json());
app.use(express.static("build"));

morgan.token(
  "postData",
  req => (req.body.name !== undefined && JSON.stringify(req.body)) || ""
);

app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :postData"
  )
);

app.get("/api/persons", (req, res) => {
  Person.find({}).then(persons => res.json(persons));
});

app.post("/api/persons", (req, res, next) => {
  const { name, number } = req.body;

  if (!name || !number)
    res.status(400).json({
      error: "name or number missing"
    });

  const newPerson = new Person({
    name,
    number
  });

  newPerson
    .save()
    .then(savedPerson => res.json(savedPerson.toJSON()))
    .catch(err => next(err));
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findOne({ _id: req.params.id })
    .then(person => res.json(person.toJSON()))
    .catch(err => next(err));
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.deleteOne({ _id: req.params.id })
    .then(() => res.status(204).end())
    .catch(err => next(err));
});

app.put("/api/persons/:id", (req, res, next) => {
  const { name, number } = req.body;

  if (!name || !number)
    res.status(400).json({
      error: "name or number missing"
    });

  const updatedPerson = {
    name,
    number
  };

  Person.findByIdAndUpdate(req.params.id, updatedPerson, { new: true })
    .then(response => res.json(response.toJSON()))
    .catch(err => next(err));
});

app.get("/info", (req, res) => {
  Person.find({}).then(persons =>
    res.send(
      `<p>Phonebook has info for ${persons.length} people</p>
      <p>${new Date().toUTCString()}</p>`
    )
  );
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

// handler of requests with unknown endpoint
app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
  console.error(error.name, error.message, error.kind);

  if (error.name === "CastError" && error.kind === "ObjectId") {
    return res.status(400).send({ error: "malformatted id" });
  }

  if (error.name === "ValidationError") {
    return res.status(400).send({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
