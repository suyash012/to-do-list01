import { useEffect, useState } from 'react';

export default function AdminDashboard({ token }) {
  const [users, setUsers] = useState([]);
  const [todos, setTodos] = useState([]);
  const [tab, setTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tab === 'users') {
      setLoading(true);
      fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          setUsers(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (tab === 'todos') {
      setLoading(true);
      fetch('/api/admin/todos', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          setTodos(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [tab, token]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="mb-4 flex gap-2">
        <button className={`btn ${tab === 'users' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('users')}>Users</button>
        <button className={`btn ${tab === 'todos' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('todos')}>Todos</button>
      </div>
      {loading && <div>Loading...</div>}
      {tab === 'users' && (
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="px-4 py-2">Username</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td className="border px-4 py-2">{u.username}</td>
                <td className="border px-4 py-2">{u.email}</td>
                <td className="border px-4 py-2">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {tab === 'todos' && (
        <ul className="space-y-2">
          {todos.map(todo => (
            <li key={todo._id} className="p-4 bg-white rounded shadow">
              <div className="font-semibold">{todo.title}</div>
              <div className="text-xs text-gray-500">{todo.category} | {todo.completed ? 'Completed' : 'Pending'} | {todo.user?.username}</div>
              <div className="text-sm text-gray-600">{todo.description}</div>
            </li>
          ))}
        </ul>
      )}
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}
