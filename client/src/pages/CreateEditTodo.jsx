import { useState } from 'react';

export default function CreateEditTodo({ token, onSuccess, initial = {} }) {
  const [title, setTitle] = useState(initial.title || '');
  const [description, setDescription] = useState(initial.description || '');
  const [dueDate, setDueDate] = useState(initial.dueDate ? initial.dueDate.slice(0, 10) : '');
  const [category, setCategory] = useState(initial.category || 'Urgent');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const method = initial._id ? 'PUT' : 'POST';
      const url = initial._id ? `/api/todos/${initial._id}` : '/api/todos';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, dueDate, category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.errors?.[0]?.msg || data.message || 'Failed');
      onSuccess && onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4 mx-auto mt-10">
      <h2 className="text-2xl font-bold text-center">{initial._id ? 'Edit' : 'Create'} Todo</h2>
      <input
        className="input input-bordered w-full"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        maxLength={100}
        required
      />
      <textarea
        className="input input-bordered w-full"
        placeholder="Description (optional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
        maxLength={500}
      />
      <input
        className="input input-bordered w-full"
        type="date"
        value={dueDate}
        onChange={e => setDueDate(e.target.value)}
      />
      <select
        className="input input-bordered w-full"
        value={category}
        onChange={e => setCategory(e.target.value)}
        required
      >
        <option value="Urgent">Urgent</option>
        <option value="Non-Urgent">Non-Urgent</option>
      </select>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button className="btn btn-primary w-full" disabled={loading}>
        {loading ? (initial._id ? 'Saving...' : 'Creating...') : (initial._id ? 'Save' : 'Create')}
      </button>
    </form>
  );
}
