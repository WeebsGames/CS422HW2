import { useEffect, useState } from "react";

export default function App() {
  // State: list of todos
  const [todos, setTodos] = useState(() => {
    //load todos from localStorage
    try{
      const stored = localStorage.getItem("todos");
      if(stored != null){
        return JSON.parse(stored);
      } 
      return [];
    } catch{
      return [];
    }
  });

  // State: text inside input box
  const [draft, setDraft] = useState("");

  const [filter, setFilter] = useState("all"); // 'all' | 'active' | 'completed'

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // Function: add a new todo
  function addTodo(e) {
    e.preventDefault();

    if (draft.trim() === "") return;

    const newTodo = {
      id: Date.now(),
      text: draft,
      completed: false,
    };

    setTodos([newTodo, ...todos]);
    setDraft("");
  }

  function toggleTodo(id) {
  setTodos(
    todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )
  );
}

function deleteTodo(id) {
  setTodos(todos.filter((todo) => todo.id !== id));
}

const visibleTodos =
  filter === "active"
    ? todos.filter((t) => !t.completed)
    : filter === "completed"
    ? todos.filter((t) => t.completed)
    : todos;




  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Todo App</h1>

      {/* Input Form */}
      <form onSubmit={addTodo} style={{ display: "flex", gap: 8 }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a task..."
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            background: "black",
            color: "white",
            cursor: "pointer",
          }}
        >
          Add
        </button>
      </form>

      <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
        <FilterButton current={filter} value="all" onClick={setFilter} />
        <FilterButton current={filter} value="active" onClick={setFilter} />
        <FilterButton current={filter} value="completed" onClick={setFilter} />
      </div>


      {/* Todo List */}
      <ul style={{ marginTop: 20, paddingLeft: 0 }}>
        {visibleTodos.length === 0 && filter != "all" ? (
          <li style={{ listStyle: "none", textAlign: "center", padding: "20px", color: "#666" }}>
            No todos match that filter.
          </li>
        ) : visibleTodos.length === 0 ? (
          <li style={{ listStyle: "none", textAlign: "center", padding: "20px", color: "#666" }}>
            No todos yet! Add one above.
          </li>
        ) : (
          visibleTodos.map((todo) => (
          <li
            key={todo.id}
            onClick={() => toggleTodo(todo.id)}
            style={{
              listStyle: "none",
              padding: "10px 12px",
              border: "1px solid #eee",
              borderRadius: 8,
              marginBottom: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              textDecoration: todo.completed ? "line-through" : "none",
              opacity: todo.completed ? 0.6 : 1,
            }}
          >
            <span>{todo.text}</span>

            <button
              onClick={(e) => {
                e.stopPropagation(); // IMPORTANT: prevents toggle when deleting
                deleteTodo(todo.id);
              }}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 18,
                lineHeight: 1,
                padding: "0 6px",
              }}
              aria-label="Delete todo"
              title="Delete"
            >
              ✕
            </button>
          </li>

        )))}
      </ul>

    </div>
  );
}

function FilterButton({ current, value, onClick }) {
  const active = current === value;

  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      style={{
        padding: "8px 12px",
        borderRadius: 999,
        border: "1px solid",
        borderColor: active ? "black" : "#ccc",
        background: active ? "black" : "white",
        color: active ? "white" : "black",
        cursor: "pointer",
      }}
    >
      {value[0].toUpperCase() + value.slice(1)}
    </button>
  );
}

