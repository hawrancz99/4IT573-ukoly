import express from 'express'
import knex from 'knex'
import knexfile from './knexfile.js'

const app = express()
const db = knex(knexfile)
const port = 3000

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

// render home page
app.get('/', async (req, res) => {
  let todos = [];
  if (req.query.filter) {
    switch (req.query.filter) {
      case 'undone':
        todos = await db('todos').select('*').where('done', 0)
        break;
      case 'done':
        todos = await db('todos').select('*').where('done', 1)
        break;
      case 'latest':
        todos = await db('todos').select('*')
        todos.sort((a, b) => b.id - a.id)
        break;
      case 'oldest':
        todos = await db('todos').select('*')
        todos.sort((a, b) => a.id - b.id)
        break;
    }
  } else {
    todos = await db('todos').select('*')
  }
  res.render('index', {
    title: 'ToDos!',
    todos: todos,
  })
})

// render todo detail
app.get('/todo/:id', async (req, res) => {
  // check that todo id is number
  const id = Number(req.params.id)
  const todo = await db('todos').select('*').where('id', id).first()

  if (!todo) return next()

  res.render('detail', {
    todo
  })
})

// update toggle status
app.get('/toggle/:id', async (req, res) => {
  const id = Number(req.params.id)
  const todo = await db('todos').select('*').where('id', id).first()

  if (!todo) return next()

  await db('todos').update({ done: !todo.done }).where('id', id)

  res.redirect(`/todo/${id}`)
})

app.get('/delete/:id', async (req, res) => {
  const id = Number(req.params.id)
  const todo = await db('todos').select('*').where('id', id).first()

  if (!todo) return next()

  await db('todos').delete().where('id', id)

  res.redirect('/')

})


app.post('/add', async (req, res) => {
  const text = String(req.body.text)
  const priority = String(req.body.priority)
  const deadline = req.body.deadline.length < 1 ? new Date().toLocaleDateString("cz-CZ") : new Date(req.body.deadline).toLocaleDateString("cs-CZ");
  if (text.length > 0) {
    await db('todos').insert({ text, priority, deadline })
  }
  res.redirect('/')
})


app.post('/update-name/:id', async (req, res) => {
  const newText = String(req.body.text)
  const id = Number(req.params.id)
  const todo = await db('todos').select('*').where('id', id).first()

  if (!todo) return next()

  await db('todos').update({ text: newText }).where('id', id)

  res.redirect(`/todo/${id}`)
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})