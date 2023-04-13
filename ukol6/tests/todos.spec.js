// tests/todos.spec.js
import test from 'ava'
import supertest from 'supertest'
import { app } from '../src/app.js'
import db, { addTodo } from '../src/db.js'
import { getAllTodos } from '../src/db.js'
import { getTodo } from '../src/db.js'

// dummy todo
const text = 'Testovací todo!!!'
const priority = '2'
const deadline = new Date().toLocaleDateString("cz-CZ")

test.beforeEach(async () => {
  await db.migrate.latest()
})

test.afterEach(async () => {
  await db.migrate.rollback()
})

test.serial('GET / lists todos', async (t) => {
  await addTodo(text, priority, deadline)

  const response = await supertest(app).get('/')

  t.assert(response.text.includes(text), 'response does not include ToDo text')
})

test.serial('POST /add creates todo', async (t) => {

  const response = await supertest(app)
    .post('/add')
    .type('form')
    .send({ text: text, priority: priority, deadline: deadline })
    .redirects(1)

  t.assert(response.text.includes(text), 'response does not include ToDo text')
})

test.serial('POST /update-name/:id change todo name from detail', async (t) => {
  await addTodo(text, priority, deadline)
  const todos = await getAllTodos()
  const newText = 'NEW TODO NAME';

  const response = await supertest(app)
    .post(`/update-name/${todos[0].id}`)
    .type('form')
    .send({ text: newText })
    .redirects(1)

  t.assert(response.text.includes(newText), 'response includes new Todo name')
})

test.serial('GET /toggle/:id change todo state', async (t) => {
  await addTodo(text, priority, deadline)
  const todos = await getAllTodos()

  await supertest(app)
    .get(`/toggle/${todos[0].id}`)

  const updatedTodo = await getTodo(todos[0].id);

  t.is(updatedTodo.done, +!todos[0].done)
})

test.serial('POST /add create todo with empty text redirects to error page', async (t) => {
  const response = await supertest(app)
    .post('/add')
    .type('form')
    .send({ text: '', priority: priority, deadline: deadline })

  t.is(response.status, 302);
  t.is(response.headers.location, '/error/empty-text');
})