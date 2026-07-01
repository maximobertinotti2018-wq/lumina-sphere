'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, UploadCloud } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import type { MoodTag } from '@/types';
import { uploadBook } from '@/lib/actions/uploadAction';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBook: (book: AddBookData) => Promise<void>;
  onUploadStart?: (title: string, author: string, mood: string) => void;
  onUploadSuccess: () => Promise<void>;
  userTier?: 'starter' | 'pro' | 'premium';
}

export interface AddBookData {
  title: string;
  author: string;
  coverUrl?: string;
  description?: string;
  mood: MoodTag;
  isbn?: string;
}

export function AddBookModal({
  isOpen,
  onClose,
  onAddBook,
  onUploadStart,
  onUploadSuccess,
}: AddBookModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, startUpload] = useTransition();
  const [error, setError] = useState<string | null>(null);
  
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<AddBookData>({
    title: '',
    author: '',
    coverUrl: '',
    description: '',
    mood: 'dark-fantasy',
    isbn: '',
  });

  const moods: { value: MoodTag; label: string }[] = [
    { value: 'dark-fantasy', label: 'Dark Fantasy' },
    { value: 'alchemy-philosophical', label: 'Alchemy & Philosophy' },
    { value: 'cyberpunk', label: 'Cyberpunk' },
    { value: 'ethereal-romance', label: 'Ethereal Romance' },
    { value: 'adventure-epic', label: 'Adventure Epic' },
    { value: 'psychological-thriller', label: 'Psychological Thriller' },
    { value: 'historical-drama', label: 'Historical Drama' },
    { value: 'sci-fi-space-opera', label: 'Sci-Fi Space Opera' },
    { value: 'cozy-mystery', label: 'Cozy Mystery' },
    { value: 'urban-fantasy', label: 'Urban Fantasy' },
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf' || ext === 'epub') {
      setSelectedFile(file);
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: file.name.replace(`.${ext}`, '') }));
      }
    } else {
      setError('Please upload a PDF or EPUB file.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedFile) {
      if (onUploadStart) {
        onUploadStart(formData.title || selectedFile.name, formData.author || 'Unknown', formData.mood);
      }
      startUpload(async () => {
        const data = new FormData();
        data.append('file', selectedFile);
        data.append('title', formData.title);
        data.append('author', formData.author);
        data.append('mood', formData.mood);

        const result = await uploadBook(data);
        if (result.success) {
          await onUploadSuccess();
          handleClose();
        } else {
          setError(result.error || 'Upload failed');
        }
      });
    } else {
      // Manual add validation
      if (!formData.title.trim()) {
        setError('Title is required');
        return;
      }
      if (!formData.author.trim()) {
        setError('Author is required');
        return;
      }

      setIsLoading(true);
      try {
        await onAddBook(formData);
        handleClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add book');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClose = () => {
    if (!isLoading && !isUploading) {
      setError(null);
      setSelectedFile(null);
      setFormData({
        title: '',
        author: '',
        coverUrl: '',
        description: '',
        mood: 'dark-fantasy',
        isbn: '',
      });
      onClose();
    }
  };

  const loading = isLoading || isUploading;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-hidden"
            >
              <GlassPanel variant="strong" className="relative">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <BookOpen className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Add Book
                      </h2>
                      <p className="text-white/60 text-sm">
                        Upload EPUB/PDF or add manually
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleClose}
                    disabled={loading}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5 text-white/60" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-red-500/20 border border-red-500/30"
                    >
                      <p className="text-red-400 text-sm">{error}</p>
                    </motion.div>
                  )}

                  {/* Drag and Drop Zone */}
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Upload File
                    </label>
                    <div 
                      className={cn(
                        "relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl transition-all",
                        dragActive ? "border-purple-500 bg-purple-500/10" : "border-white/20 bg-white/5",
                        selectedFile ? "border-green-500 bg-green-500/10" : ""
                      )}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input 
                        type="file" 
                        accept=".pdf,.epub" 
                        onChange={handleChange} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      />
                      <UploadCloud className={cn("w-8 h-8 mb-2", selectedFile ? "text-green-400" : "text-white/40")} />
                      <p className="text-white/60 text-sm text-center px-4">
                        {selectedFile ? selectedFile.name : "Drag & drop your EPUB or PDF here, or click to select"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Title {selectedFile ? '(Optional)' : '*'}
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter book title"
                      className={cn(
                        'w-full px-4 py-3 rounded-xl',
                        'bg-white/5 backdrop-blur-md border border-white/10 text-white placeholder:text-white/40',
                        'focus:bg-white/10 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all'
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Author {selectedFile ? '(Optional)' : '*'}
                    </label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="Enter author name"
                      className={cn(
                        'w-full px-4 py-3 rounded-xl',
                        'bg-white/5 backdrop-blur-md border border-white/10 text-white placeholder:text-white/40',
                        'focus:bg-white/10 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all'
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Mood
                    </label>
                    <select
                      value={formData.mood}
                      onChange={(e) => setFormData({ ...formData, mood: e.target.value as MoodTag })}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl',
                        'bg-white/5 backdrop-blur-md border border-white/10 text-white',
                        'focus:bg-white/10 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all'
                      )}
                    >
                      {moods.map((mood) => (
                        <option key={mood.value} value={mood.value} className="bg-black">
                          {mood.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </form>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
                  <Button
                    variant="ghost"
                    onClick={handleClose}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={(!selectedFile && (!formData.title || !formData.author))}
                  >
                    {loading ? 'Processing...' : (selectedFile ? 'Upload Book' : 'Add Book')}
                  </Button>
                </div>
              </GlassPanel>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}



