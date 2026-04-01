=== frontend/app/data ingestion/page.tsx ===
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DataIngestionItem {
  id: string;
  filename: string;
  uploadDate: string;
  status: string;
  chunkCount: number;
}

export default function DataIngestionPage() {
  const [items, setItems] = useState<DataIngestionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/data-ingestion');
      if (!res.ok) throw new Error('Failed to fetch');
      const data: DataIngestionItem[] = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const res = await fetch(`/api/data-ingestion/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className='text-center py-8'>Loading...</p>;

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='mb-6 flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Data Ingestion</h1>
        <Link
          href='/data ingestion/new'
          className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
        >
          New Data Ingestion
        </Link>
      </div>

      {items.length === 0 ? (
        <p className='text-center text-gray-500'>No data ingestion records found.</p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='min-w-full bg-white border border-gray-200'>
            <thead className='bg-gray-100'>
              <tr>
                <th className='p-4 text-left'>Filename</th>
                <th className='p-4 text-left'>Upload Date</th>
                <th className='p-4 text-left'>Status</th>
                <th className='p-4 text-left'>Chunk Count</th>
                <th className='p-4 text-center'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {items.map((item) => (
                <tr key={item.id} className='hover:bg-gray-50'>
                  <td className='p-4'>{item.filename}</td>
                  <td className='p-4'>{new Date(item.uploadDate).toLocaleString()}</td>
                  <td className='p-4'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        item.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : item.status === 'Processing'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className='p-4'>{item.chunkCount}</td>
                  <td className='p-4 text-center space-x-2'>
                    <Link
                      href={`/data ingestion/${item.id}`}
                      className='text-blue-600 hover:underline'
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className='text-red-600 hover:underline'
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
=== frontend/app/data ingestion/new/page.tsx ===
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DataIngestionForm {
  filename: string;
  uploadDate: string;
  status: string;
  chunkCount: number;
}

export default function NewDataIngestionPage() {
  const router = useRouter();
  const [form, setForm] = useState<DataIngestionForm>({
    filename: '',
    uploadDate: '',
    status: 'Pending',
    chunkCount: 0,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof DataIngestionForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof DataIngestionForm, string>> = {};
    if (!form.filename.trim()) newErrors.filename = 'Filename is required';
    if (!form.uploadDate.trim()) newErrors.uploadDate = 'Upload date is required';
    if (!form.status.trim()) newErrors.status = 'Status is required';
    if (form.chunkCount < 0) newErrors.chunkCount = 'Chunk count must be non-negative';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/data-ingestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to create');
      const data = await res.json();
      setSuccess(true);
      setTimeout(() => {
        router.push('/data ingestion');
      }, 1500);
    } catch (err) {
      console.error(err);
      setErrors({ submit: 'Failed to create data ingestion record' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='mb-6'>
        <Link href='/data ingestion' className='text-blue-600 hover:underline'>
          ← Back to List
        </Link>
        <h1 className='mt-2 text-2xl font-bold'>New Data Ingestion</h1>
      </div>

      {success && (
        <div className='mb-4 p-4 bg-green-100 text-green-800 rounded'>
          Data ingestion created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className='bg-white p-6 rounded shadow'>
        <div className='mb-4'>
          <label className='block text-gray-700 mb-2'>Filename</label>
          <input
            type='text'
            name='filename'
            value={form.filename}
            onChange={handleChange}
            className={`w-full px-3 py-2 border border-gray-300 rounded ${
              errors.filename ? 'border-red-500' : ''
            }`}
            placeholder='Enter filename'
          />
          {errors.filename && (
            <p className='mt-1 text-sm text-red-600'>{errors.filename}</p>
          )}
        </div>

        <div className='mb-4'>
          <label className='block text-gray-700 mb-2'>Upload Date</label>
          <input
            type='datetime-local'
            name='uploadDate'
            value={form.uploadDate}
            onChange={handleChange}
            className={`w-full px-3 py-2 border border-gray-300 rounded ${
              errors.uploadDate ? 'border-red-500' : ''
            }`}
          />
          {errors.uploadDate && (
            <p className='mt-1 text-sm text-red-600'>{errors.uploadDate}</p>
          )}
        </div>

        <div className='mb-4'>
          <label className='block text-gray-700 mb-2'>Status</label>
          <select
            name='status'
            value={form.status}
            onChange={handleChange}
            className={`w-full px-3 py-2 border border-gray-300 rounded ${
              errors.status ? 'border-red-500' : ''
            }`}
          >
            <option value=''>Select status</option>
            <option value='Pending'>Pending</option>
            <option value='Processing'>Processing</option>
            <option value='Completed'>Completed</option>
            <option value='Failed'>Failed</option>
          </select>
          {errors.status && (
            <p className='mt-1 text-sm text-red-600'>{errors.status}</p>
          )}
        </div>

        <div className='mb-6'>
          <label className='block text-gray-700 mb-2'>Chunk Count</label>
          <input
            type='number'
            name='chunkCount'
            value={form.chunkCount}
            onChange={handleChange}
            className={`w-full px-3 py-2 border border-gray-300 rounded ${
              errors.chunkCount ? 'border-red-500' : ''
            }`}
            min='0'
          />
          {errors.chunkCount && (
            <p className='mt-1 text-sm text-red-600'>{errors.chunkCount}</p>
          )}
        </div>

        {errors.submit && (
          <p className='mb-4 text-sm text-red-600'>{errors.submit}</p>
        )}

        <div className='flex justify-end space-x-3'>
          <button
            type='button'
            onClick={() => router.push('/data ingestion')}
            className='px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={submitting}
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
              submitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
=== frontend/app/language model/page.tsx ===
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface LanguageModelItem {
  id: string;
  name: string;
  version: string;
  provider: string;
  endpoint: string;
}

export default function LanguageModelPage() {
  const [items, setItems] = useState<LanguageModelItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/language-model');
      if (!res.ok) throw new Error('Failed to fetch');
      const data: LanguageModelItem[] = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this language model?')) return;
    try {
      const res = await fetch(`/api/language-model/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className='text-center py-8'>Loading...</p>;

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='mb-6 flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Language Model</h1>
        <Link
          href='/language model/new'
          className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
        >
          New Language Model
        </Link>
      </div>

      {items.length === 0 ? (
        <p className='text-center text-gray-500'>No language model records found.</p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='min-w-full bg-white border border-gray-200'>
            <thead className='bg-gray-100'>
              <tr>
                <th className='p-4 text-left'>Name</th>
                <th className='p-4 text-left'>Version</th>
                <th className='p-4 text-left'>Provider</th>
                <th className='p-4 text-left'>Endpoint</th>
                <th className='p-4 text-center'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {items.map((item) => (
                <tr key={item.id} className='hover:bg-gray-50'>
                  <td className='p-4'>{item.name}</td>
                  <td className='p-4'>{item.version}</td>
                  <td className='p-4'>{item.provider}</td>
                  <td className='p-4 break-all'>{item.endpoint}</td>
                  <td className='p-4 text-center space-x-2'>
                    <Link
                      href={`={`