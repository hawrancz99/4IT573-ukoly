import knex from 'knex'
import knexfile from '../knexfile.js'
const db = knex(knexfile)

// Jeden ze způsobů jak exportovat věci ze souboru je 'export default'
// Defaultní exporty se importují takto:
// import libovolnyNazev from './src/db.js'
export default db

// Nebo pouze 'export' takzvaný jmenný export
// Jmenný export se importuje takto:
// import { getAllTodos } from './src/db.js'
// kde musíme dodržet název getAllTodos, pokud se nám nehodí můžeme přejmenovat:
// import { getAllTodos as libovolnyNazev } from './src/db.js'
export const getAllTodos = async () => {
    return await db('todos').select('*')
}

export const getAllTodosByStatus = async (done) => {
    return await db('todos').select('*').where('done', done)
}
export const getTodo = async (id) => {
    return await db('todos').select('*').where('id', id).first()
}

export const updateTodoStatus = async (todo) => {
    return await db('todos').update({ done: !todo.done }).where('id', todo.id)
}

export const updateTodoName = async (newText, id) => {
    return await db('todos').update({ text: newText }).where('id', id)
}

export const deleteTodo = async (id) => {
    return await db('todos').delete().where('id', id)
}

export const addTodo = async (text, priority, deadline) => {
    return await db('todos').insert({ text, priority, deadline })
}




