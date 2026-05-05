import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';
import { Music, ChevronLeft } from 'lucide-react';

const GRADIENTS = [
  { value: 'from-purple-600 to-indigo-600', label: 'Purple Indigo', colors: ['#9333ea', '#4f46e5'] },
  { value: 'from-pink-500 to-rose-500', label: 'Pink Rose', colors: ['#ec4899', '#f43f5e'] },
  { value: 'from-amber-500 to-orange-600', label: 'Amber Orange', colors: ['#f59e0b', '#ea580c'] },
  { value: 'from-emerald-500 to-teal-600', label: 'Emerald Teal', colors: ['#10b981', '#0d9488'] },
  { value: 'from-blue-500 to-cyan-600', label: 'Blue Cyan', colors: ['#3b82f6', '#0891b2'] },
  { value: 'from-fuchsia-500 to-purple-600', label: 'Fuchsia Purple', colors: ['#d946ef', '#9333ea'] },
  { value: 'from-red-500 to-pink-600', label: 'Red Pink', colors: ['#ef4444', '#db2777'] },
  { value: 'from-sky-500 to-indigo-600', label: 'Sky Indigo', colors: ['#0ea5e9', '#4f46e5'] },
];

export default function Create() {
  const { auth } = usePage().props;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGradient, setSelectedGradient] = useState(GRADIENTS[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    router.post('/my-playlists', {
      name: name.trim(),
      description: description.trim() || null,
      cover_gradient: selectedGradient,
    }, {
      onFinish: () => setIsSubmitting(false),
    });
  };

  // If not logged in, redirect to login
  if (!auth?.user) {
    return (
      <MainLayout>
        <Head title="Create Playlist | SoundWave" />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <Music size={36} className="text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Log in to create playlists</h3>
          <p className="text-gray-500 text-sm mb-6">You need an account to create and manage playlists.</p>
          <button
            onClick={() => router.visit('/login')}
            className="px-6 py-3 rounded-full bg-white text-black font-bold text-sm hover:bg-gray-100 transition"
          >
            Log in
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Head title="New Playlist | SoundWave" />

      <div className="max-w-2xl mx-auto text-white">
        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium mb-8 transition-colors"
        >
          <ChevronLeft size={18} />
          Back
        </button>

        <h1 className="text-3xl font-bold tracking-tight mb-8">Create new playlist</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Preview + Name */}
          <div className="flex gap-6 items-start">
            {/* Cover Preview */}
            <div className={`w-40 h-40 rounded-xl bg-gradient-to-br ${selectedGradient} flex items-center justify-center shadow-2xl flex-shrink-0 relative overflow-hidden`}>
              <Music size={48} className="text-white/30" />
              {name && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm px-3 py-2">
                  <p className="text-white text-xs font-bold truncate">{name}</p>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Playlist name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My awesome playlist"
                  maxLength={100}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.08] transition-all text-sm"
                  autoFocus
                />
                <p className="text-gray-600 text-xs mt-1">{name.length}/100</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Description <span className="text-gray-600">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description..."
                  maxLength={500}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.08] transition-all text-sm resize-none"
                />
                <p className="text-gray-600 text-xs mt-1">{description.length}/500</p>
              </div>
            </div>
          </div>

          {/* Cover Gradient Picker */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">Cover color</label>
            <div className="flex flex-wrap gap-3">
              {GRADIENTS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setSelectedGradient(g.value)}
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${g.value} transition-all ${
                    selectedGradient === g.value
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a12] scale-110'
                      : 'hover:scale-105 opacity-70 hover:opacity-100'
                  }`}
                  title={g.label}
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="px-8 py-3 rounded-full bg-white text-black font-bold text-sm hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create playlist'}
            </button>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-3 rounded-full border border-white/10 text-gray-400 font-medium text-sm hover:text-white hover:border-white/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
