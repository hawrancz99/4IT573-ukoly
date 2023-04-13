// src/db.js
import knex from 'knex'
import knexfile from '../knexfile.js'

const db = knex(knexfile[process.env.NODE_ENV || 'development'])

export default db

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




