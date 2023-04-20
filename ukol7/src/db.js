// src/db.js
import knex from 'knex'
import knexfile from '../knexfile.js'
import crypto from 'crypto'

const db = knex(knexfile[process.env.NODE_ENV || 'development'])

export default db

export const getAllTodos = async (userId) => {
    return await db('todos').select('*').where('user_id',userId)
}

export const getAllTodosByStatus = async (userId, done) => {
    return await db('todos').select('*').where('user_id',userId).andWhere('done', done)
}
export const getTodo = async (userId,id) => {
    return await db('todos').select('*').where('user_id',userId).andWhere('id', id).first()
}

export const updateTodoStatus = async (userId, todo) => {
    return await db('todos').update({ done: !todo.done }).where('id', todo.id).andWhere('user_id', userId)
}

export const updateTodoName = async (userId, newText, id) => {
    return await db('todos').update({ text: newText }).where('id', id).andWhere('user_id', userId)
}

export const deleteTodo = async (userId,id) => {
    return await db('todos').delete().where('id', id).andWhere('user_id',userId)
}

export const addTodo = async (text, priority, deadline,userId) => {
    return await db('todos').insert({ text, priority, deadline, user_id: userId })
}

export const createUser = async (name, password) => {
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
    const token = crypto.randomBytes(16).toString('hex')

    const [user] = await db('users').insert({ name, salt, hash, token }).returning('*')

    return user
}

export const getUser = async (name, password) => {
    const user = await db('users').where({ name }).first()
    if (!user) return null

    const salt = user.salt
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
    if (hash !== user.hash) return null

    return user
}

export const getUserByToken = async (token) => {
    const user = await db('users').where({ token }).first()

    return user
}
