import { useEffect, useState } from 'react';

export default function Dashboard({ user, token }) {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTodos = async () => {
      setLoading(true);
      setError('');
      try {
        console.log('Using token:', token);
        const res = await fetch('/api/todos', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch todos');
        setTodos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTodos();
  }, [token]);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Todo Dashboard</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <ul className="space-y-2">
        {todos.map(todo => (
          <li key={todo._id} className="p-4 bg-white rounded shadow flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <span className="font-semibold">{todo.title}</span>
              <span className="ml-2 text-xs px-2 py-1 rounded bg-gray-200">{todo.category}</span>
              <span className="ml-2 text-xs text-gray-500">{todo.completed ? 'Completed' : 'Pending'}</span>
              <div className="text-sm text-gray-600">{todo.description}</div>
              {todo.dueDate && <div className="text-xs text-gray-400">Due: {new Date(todo.dueDate).toLocaleDateString()}</div>}
            </div>
            {/* TODO: Edit/Delete buttons here */}
          </li>
        ))}
      </ul>
    </div>
  );
}
