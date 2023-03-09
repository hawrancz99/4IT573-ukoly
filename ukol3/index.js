import express from 'express'

const port = 3000

let id = 1

const todos = [
  {
    id: id++,
    text: 'Udělat úkol na Node.js',
    done: false,
    priority: '3',
    deadline: new Date('2023-03-09').toLocaleDateString("cs-CZ"),
  },
  {
    id: id++,
    text: 'Jít do hospody',
    done: false,
    priority: '1',
    deadline: new Date('2023-03-30').toLocaleDateString("cs-CZ"),
  },
]

const app = express()

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

// render home page
app.get('/', (req, res) => {
  res.render('index', {
    title: 'ToDos!',
    todos,
  })
})

// render todo detail
app.get('/todo/:id', (req, res) => {
  // check that todo id is number
  const id = Number(req.params.id)
  const todo = todos.find((todo) => todo.id === id)
  if (todo !== undefined) {
    res.render('detail', {
      todo
    })
  }

})

app.get('/toggle/:id', (req, res) => {
  const id = Number(req.params.id)
  const todo = todos.find((todo) => todo.id === id)
  if (todo !== undefined) {
    todo.done = !todo.done
  }
  res.redirect(`/todo/${id}`)
})

app.get('/delete/:id', (req, res) => {
  const id = Number(req.params.id)
  const isTodoDone = todos.find((todo) => todo.id === id && todo.done)
  if (isTodoDone) {
    const index = todos.findIndex((todo) => todo.id === id)
    if (index !== -1) {
      todos.splice(index, 1)
    }
  }
  res.redirect('/')
})

app.post('/add', (req, res) => {
  const text = String(req.body.text)
  const priority = String(req.body.priority)
  const deadline = req.body.deadline.length < 1 ? new Date().toLocaleDateString("cz-CZ") : new Date(req.body.deadline).toLocaleDateString("cs-CZ");
  if (text.length > 0) {
    todos.push({
      id: id++,
      text,
      done: false,
      priority,
      deadline
    })
  }
  res.redirect('/')
})


app.post('/update-name/:id', (req, res) => {
  const newText = String(req.body.text)
  const id = Number(req.params.id)
  const todo = todos.find((todo) => todo.id === id)
  if (todo !== undefined) {
    todo.text = newText
  }
  res.redirect(`/todo/${id}`)
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})