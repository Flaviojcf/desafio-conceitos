const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userExist = users.find((user) => user.username === username);

  if (!userExist) {
    return response
      .status(400)
      .json({ error: "Usuário não existe no sistema" });
  }

  request.userExist = userExist;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const newUser = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: [],
  };
  const findUser = users.find(
    (usernameAlreadyExist) => usernameAlreadyExist.username === username
  );
  if(findUser){
    return response.status(400).send({error:'Usuário ja cadastrado'})
  } 

  users.push(newUser);
  response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { userExist } = request;
  return response.json(userExist.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { userExist } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  userExist.todos.push(newTodo);
  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { userExist } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const patchTodo = userExist.todos.find((todo) => todo.id === id);
  if (!patchTodo)
    return response.status(404).send({ error: "Erro encontrado" });

  patchTodo.title = title;
  patchTodo.deadline = deadline;
  return response.status(201).json(patchTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { userExist } = request;
  const { id } = request.params;

  const putTodo = userExist.todos.find((todo) => todo.id === id);

  if (!putTodo)
    return response.status(404).json({ error: "Todo não encontrado" });

  putTodo.done = true;

  response.status(200).json(putTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { userExist } = request;
  const { id } = request.params;

  const deleteTodo = userExist.todos.find((todo) => todo.id === id);
  const findIndexTodo = userExist.todos.findIndex((todo) => todo.id === id);

  if (!deleteTodo)
    return response.status(404).json({ error: "Todo não encontrado" });

  userExist.todos.splice(findIndexTodo, 1);

  response.status(204).json(userExist);
});

module.exports = app;
