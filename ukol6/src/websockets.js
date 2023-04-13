import WebSocket, { WebSocketServer } from "ws";
import ejs from "ejs";
import { getAllTodos, getTodo } from "./db.js";

/** @type {Set<WebSocket>} */
const connections = new Set();

// src/websockets.js
export const createWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server });
  wss.on("connection", (ws) => {
    connections.add(ws);
    console.log(`New connection`, connections.size);
    ws.on("close", () => {
      connections.delete(ws);
      console.log(`Closed connection`, connections.size);
    });
  });
};

export const sendTodosToAllConnections = async () => {
  const todos = await getAllTodos();
  const html = await ejs.renderFile("views/_todos.ejs", {
    todos,
  });
  for (const connection of connections) {
    const message = {
      type: "todos",
      html,
    };
    const json = JSON.stringify(message);
    connection.send(json);
  }
};

export const sendTodoDetailToAllConnections = async (id) => {
  const todo = await getTodo(id);
  const html = await ejs.renderFile("views/_todo-detail.ejs", {
    todo,
  });
  for (const connection of connections) {
    const message = {
      type: "todo-detail",
      html,
      todoId: todo.id,
    };
    const json = JSON.stringify(message);
    connection.send(json);
  }
};

export const closeTodoDetailConnections = async (id, deletedFromDetail) => {
  const html = await ejs.renderFile("views/todo-deleted.ejs");
  for (const connection of connections) {
    const message = {
      type: "todo-deleted",
      html,
      todoId: id,
      deletedFromDetail: deletedFromDetail,
    };
    const json = JSON.stringify(message);
    connection.send(json);
  }
};
