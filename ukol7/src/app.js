import express from "express";
import cookieParser from 'cookie-parser'
import { addTodo, deleteTodo, getAllTodos, getAllTodosByStatus, getTodo, updateTodoName, updateTodoStatus, createUser, getUserByToken, getUser } from "./db.js";
import { closeTodoDetailConnections, sendTodoDetailToAllConnections, sendTodosToAllConnections } from "./websockets.js";

export const app = express();

let userId;

const requiresAuth = (req, res, next) => {
  if (res.locals.user) {
    next()
  } else {
    res.redirect('/login')
  }
}

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.use(async (req, res, next) => {
  const token = req.cookies.token

  if (token) {
    res.locals.user = await getUserByToken(token)
    userId = res.locals.user.id
  } else {
    res.locals.user = null
  }

  next()
})

// render home page
app.get("/", requiresAuth, async (req, res) => {
  let todos = [];
  if (req.query.filter) {
    switch (req.query.filter) {
      case "undone":
        todos = await getAllTodosByStatus(userId, 0);
        break;
      case "done":
        todos = await getAllTodosByStatus(userId, 1);
        break;
      case "latest":
        todos = await getAllTodos(userId);
        todos.sort((a, b) => b.id - a.id);
        break;
      case "oldest":
        todos = await getAllTodos(userId);
        todos.sort((a, b) => a.id - b.id);
        break;
    }
  } else {
    todos = await getAllTodos(userId);
  }
  res.render("index", {
    title: "ToDos!",
    todos: todos,
  });
});

// render todo detail
app.get("/detail/:id", requiresAuth, async (req, res) => {
  // check that todo id is number
  const id = Number(req.params.id);
  const todo = await getTodo(userId, id);
  if (!todo) return next();

  res.render("detail", {
    todo,
  });
});

// update toggle status
app.get("/toggle/:id", requiresAuth, async (req, res) => {
  const id = Number(req.params.id);
  const todo = await getTodo(userId, id);
  console.log('GET', todo)

  if (!todo) return next();

  await updateTodoStatus(userId, todo);

  sendTodosToAllConnections(userId);
  sendTodoDetailToAllConnections(userId, id);

  res.redirect("back");
});

app.get("/delete/:id/:fromDetail", requiresAuth, async (req, res) => {
  const id = Number(req.params.id);
  const todo = await getTodo(userId, id);

  if (!todo) return next();

  await deleteTodo(userId, id);

  sendTodosToAllConnections(userId); // inform connections viewing todos list

  const deletedFromDetail = req.params.fromDetail === "true";
  closeTodoDetailConnections(id, deletedFromDetail); // inform connections viewing todo detail

  res.redirect("/");
});

app.post("/add", requiresAuth, async (req, res) => {
  if (req.body.text.length === 0) {
    res.redirect("/error/empty-text")
  } else {
    const text = String(req.body.text);
    const priority = String(req.body.priority);
    const deadline = req.body.deadline.length < 1 ? new Date().toLocaleDateString("cz-CZ") : new Date(req.body.deadline).toLocaleDateString("cs-CZ");
    if (text.length > 0) {
      await addTodo(text, priority, deadline, userId);
    }
    sendTodosToAllConnections(userId);
    res.redirect("/");
  }
});

app.post("/update-name/:id", requiresAuth, async (req, res) => {
  const newText = String(req.body.text);
  const id = Number(req.params.id);
  const todo = await getTodo(userId, id);

  if (!todo) return next();

  await updateTodoName(userId, newText, id);

  sendTodosToAllConnections(userId);
  sendTodoDetailToAllConnections(userId, id);

  res.redirect(`/detail/${id}`);
});

// render error
app.get("/error/:type", async (req, res) => {
  if (req.params.type === 'empty-text') {
    res.render("error-empty-text");
  } else if (req.params.type === 'wrong-credentials') {
    res.render("error-wrong-credentials")
  }
});

app.get('/register', async (req, res) => {
  res.render('register')
})

app.post('/register', async (req, res) => {
  const name = req.body.name
  const password = req.body.password

  const user = await createUser(name, password)

  res.cookie('token', user.token)

  res.redirect('/')
})

app.get('/login', async (req, res) => {
  res.render('login')
})

app.post('/login', async (req, res) => {
  const name = req.body.name
  const password = req.body.password

  const user = await getUser(name, password)

  if (user) {
    res.cookie('token', user.token)
    res.redirect('/')
  } else {
    res.redirect('/error/wrong-credentials')
  }

})

app.get('/signout', async (req, res) => {
  res.clearCookie('token')
  res.redirect("/");
})
