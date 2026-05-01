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

  // State: selected todo IDs
  const [selected, setSelected] = useState([]);

  const [editingId, setEditingId] = useState(null);

  // State: deleted todos for undo functionality
  const [deletedTodos, setDeletedTodos] = useState([]);

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
  const todoToDelete = todos.find(t => t.id === id);
  if (todoToDelete) {
    setDeletedTodos(prev => [...prev, { ...todoToDelete, deletedAt: Date.now() }]);
  }
  setTodos(todos.filter((todo) => todo.id !== id));
  setSelected(selected.filter((sid) => sid !== id));
}

function undoDelete() {
  if (deletedTodos.length === 0) return;
  const lastDeleted = deletedTodos[deletedTodos.length - 1];
  setTodos([lastDeleted, ...todos]);
  setDeletedTodos(prev => prev.slice(0, -1));
}

function toggleSelect(id) {
  setSelected((prev) =>
    prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
  );
}

function deleteSelected() {
  const selectedTodos = todos.filter(t => selected.includes(t.id));
  setDeletedTodos(prev => [...prev, ...selectedTodos.map(t => ({ ...t, deletedAt: Date.now() }))]);
  setTodos(todos.filter((todo) => !selected.includes(todo.id)));
  setSelected([]);
}

function handleDoubleClick(id) {
  setEditingId(id);
}

function handleBlur(){
  setEditingId(null);
}

function handleEditKeyDown(e, id){
  if(e.key === "Enter"){
    const newText = e.target.value.trim();
    if(newText){
      setTodos(todos.map(todo =>
        todo.id === id ? {...todo, text: newText} : todo
      ));
    }
    setEditingId(null);
  } else if (e.key === "Escape"){
    setEditingId(null);
  }
}

const visibleTodos =
  filter === "active"
    ? todos.filter((t) => !t.completed)
    : filter === "completed"
    ? todos.filter((t) => t.completed)
    : todos;

const remainingCount = todos.filter(t => !t.completed).length;
const completedCount = todos.filter(t => t.completed).length;
const progress = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;




  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Todo App</h1>
      
      {/* Stats and Progress */}
      <div style={{ marginBottom: 16, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <span>{remainingCount} task{remainingCount !== 1 ? 's' : ''} left</span>
        <span>{completedCount} completed</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>Progress: {progress}%</span>
          <div style={{ width: 100, height: 10, background: "#e5e5e5", borderRadius: 5, overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: "#22c55e", transition: "width 0.3s" }} />
          </div>
        </div>
        {deletedTodos.length > 0 && (
          <button
            onClick={undoDelete}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
          >
            Undo Delete ({deletedTodos.length})
          </button>
        )}
      </div>

      <h2>Percent Done</h2>
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

      <div style={{ marginTop: 14, display: "flex", gap: 8, alignItems: "center" }}>
        <FilterButton current={filter} value="all" onClick={setFilter} />
        <FilterButton current={filter} value="active" onClick={setFilter} />
        <FilterButton current={filter} value="completed" onClick={setFilter} />
        {selected.length > 0 && (
          <button
            onClick={deleteSelected}
            style={{
              marginLeft: "auto",
              padding: "8px 12px",
              borderRadius: 8,
              border: "none",
              background: "#dc2626",
              color: "white",
              cursor: "pointer",
            }}
          >
            Delete Selected ({selected.length})
          </button>
        )}
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
            onDoubleClick={(e) => {
  e.stopPropagation();
  handleDoubleClick(todo.id);
}}
            onBlur={handleBlur}
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
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="checkbox"
                checked={selected.includes(todo.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleSelect(todo.id);
                }}
                onClick={(e) => e.stopPropagation()}
              />
              {editingId === todo.id ? (
              <input
                defaultValue={todo.text}
                onKeyDown={(e) => handleEditKeyDown(e, todo.id)}
                onBlur={handleBlur}
                autoFocus
                style={{ flex: 1, padding: 4 }}
              />
            ) : (
              <span>{todo.text}</span>
            )}
            </span>

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

