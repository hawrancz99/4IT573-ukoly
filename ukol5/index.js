import express from 'express'
import { addTodo, deleteTodo, getAllTodos, getAllTodosByStatus, getTodo, updateTodoName, updateTodoStatus } from './src/db.js'
import { closeTodoDetailConnections, createWebSocketServer, sendTodoDetailToAllConnections, sendTodosToAllConnections } from './src/websockets.js'

const app = express()
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
        todos = await getAllTodosByStatus(0)
        break;
      case 'done':
        todos = await getAllTodosByStatus(1)
        break;
      case 'latest':
        todos = await getAllTodos()
        todos.sort((a, b) => b.id - a.id)
        break;
      case 'oldest':
        todos = await getAllTodos()
        todos.sort((a, b) => a.id - b.id)
        break;
    }
  } else {
    todos = await getAllTodos();
  }
  res.render('index', {
    title: 'ToDos!',
    todos: todos,
  })
})

// render todo detail
app.get('/detail/:id', async (req, res) => {
  // check that todo id is number
  const id = Number(req.params.id)
  const todo = await getTodo(id)
  if (!todo) return next()

  res.render('detail', {
    todo,
  })
})

// update toggle status
app.get('/toggle/:id', async (req, res) => {
  const id = Number(req.params.id)
  const todo = await getTodo(id)

  if (!todo) return next()

  await updateTodoStatus(todo)

  sendTodosToAllConnections()
  sendTodoDetailToAllConnections(id)

})

app.get('/delete/:id/:fromDetail', async (req, res) => {
  const id = Number(req.params.id)
  const todo = await getTodo(id)

  if (!todo) return next()

  await deleteTodo(id)

  sendTodosToAllConnections() // inform connections viewing todos list

  const deletedFromDetail = (req.params.fromDetail === 'true');
  closeTodoDetailConnections(id,deletedFromDetail) // inform connections viewing todo detail

})

app.get('/todo-deleted', async (req, res) => {
  res.render('todo-deleted')
})

app.post('/add', async (req, res) => {
  const text = String(req.body.text)
  const priority = String(req.body.priority)
  const deadline = req.body.deadline.length < 1 ? new Date().toLocaleDateString("cz-CZ") : new Date(req.body.deadline).toLocaleDateString("cs-CZ");
  if (text.length > 0) {
    await addTodo(text, priority, deadline)
  }
  sendTodosToAllConnections()
  res.redirect('/')
})


app.post('/update-name/:id', async (req, res) => {
  const newText = String(req.body.text)
  const id = Number(req.params.id)
  const todo = await getTodo(id)

  if (!todo) return next()

  await updateTodoName(newText,id)

  sendTodosToAllConnections()
  sendTodoDetailToAllConnections(id)

  res.redirect(`/detail/${id}`)
})

const server = app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})

createWebSocketServer(server)