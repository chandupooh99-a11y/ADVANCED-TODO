"use client";
import { useState, useEffect } from "react";

const API_URL = "http://localhost:8000/todos";

interface Todo { _id: string; title: string; completed: boolean; }

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");

  useEffect(() => { fetchTodos(); }, []);

  const fetchTodos = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setTodos(data);
    } catch(e) { console.error(e); }
  };

  const addTodo = async () => {
    if (!text) return;
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: text }),
    });
    setText("");
    fetchTodos();
  };

  const toggleTodo = async (id: string) => {
    await fetch(`${API_URL}/${id}`, { method: "PUT" });
    fetchTodos();
  };

  const deleteTodo = async (id: string) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchTodos();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-10 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-8 text-blue-500">Docker Todo App</h1>
      
      <div className="flex gap-2 mb-8 w-full max-w-md">
        <input 
          className="text-black bg-white p-2 rounded flex-grow" 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          placeholder="New Task" 
        />
        <button onClick={addTodo} className="bg-blue-600 px-4 py-2 rounded text-white font-bold">
          Add
        </button>
      </div>

      <ul className="w-full max-w-md space-y-2">
        {todos.map((t) => (
          <li key={t._id} className="flex justify-between items-center bg-slate-800 p-3 rounded border border-slate-700">
            <span 
              onClick={() => toggleTodo(t._id)} 
              className={`cursor-pointer select-none text-white ${t.completed ? "line-through text-slate-500" : ""}`}
            >
              {t.title}
            </span>
            <button onClick={() => deleteTodo(t._id)} className="text-red-400 hover:text-red-300 px-2 font-bold">
              X
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}