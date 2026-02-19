import React, { useEffect, useRef, useState } from 'react'
import { ImageIcon, SendHorizonal } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import api from '../api/axios';
import { addMessage, fetchMessages, resetMessages } from '../features/messages/messagesSlice';
import toast from 'react-hot-toast';

const ChatBox = () => {
  const { messages = [] } = useSelector((state) => state.messages || {});
  const connections = useSelector((state) => state.connections?.connections || []);
  const { userId } = useParams();
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  
  const messageEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Find the current user from connections
  const currentUser = connections.find(connection => connection._id === userId);

  const fetchUserMessages = async () => {
    try {
      const token = await getToken();
      dispatch(fetchMessages({ token, userId }));
    } catch (error) {
      toast.error(error.message || 'Failed to fetch messages');
    }
  };

  const sendMessage = async () => {
    if ((!text?.trim() && !image) || isSending) return;

    try {
      setIsSending(true);
      const token = await getToken();
      const formData = new FormData();
      formData.append('to_user_id', userId);
      formData.append('text', text?.trim() || '');
      
      if (image) {
        formData.append('image', image);
      }

      const { data } = await api.post('/api/message/send', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (data.success) {
        setText('');
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        dispatch(addMessage(data.message));
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const clearImagePreview = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    if (userId) {
      fetchUserMessages();
    }
    
    return () => {
      dispatch(resetMessages());
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [userId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        <p>Select a chat to start messaging</p>
      </div>
    );
  }

  // Sort messages by date
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  return (
    <div className='flex flex-col h-screen'>
      {/* Header */}
      <div className='flex items-center gap-2 p-2 md:px-10 xl:pl-42 bg-linear-to-r from-indigo-50 to-purple-50 border-b border-gray-300'>
        <img 
          src={currentUser.profile_picture || '/default-avatar.png'} 
          alt={currentUser.full_name} 
          className='size-8 rounded-full object-cover'
        />
        <div>
          <p className='font-medium'>{currentUser.full_name}</p>
          <p className='text-sm text-gray-500 -mt-1.5'>@{currentUser.username}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className='p-5 md:px-10 flex-1 overflow-y-auto'>
        <div className='space-y-4 max-w-4xl mx-auto'>
          {sortedMessages.length > 0 ? (
            sortedMessages.map((message, index) => {
              const isOwnMessage = message.from_user_id === currentUser._id;
              return (
                <div 
                  key={message._id || index} 
                  className={`flex flex-col ${isOwnMessage ? 'items-start' : 'items-end'}`}
                >
                  <div className={`p-2 text-sm max-w-sm bg-white text-slate-700 rounded-lg shadow ${
                    isOwnMessage ? 'rounded-bl-none' : 'rounded-br-none'
                  }`}>
                    {message.message_type === 'image' && message.media_url && (
                      <img 
                        src={message.media_url} 
                        className='w-full max-w-sm rounded-lg mb-1 cursor-pointer'
                        alt=""
                        onClick={() => window.open(message.media_url, '_blank')}
                      />
                    )}
                    {message.text && <p className='break-words'>{message.text}</p>}
                  </div>
                </div>
              );
            })
          ) : (
            <p className='text-center text-gray-500'>No messages yet</p>
          )}
          <div ref={messageEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className='px-4 pb-4'>
        <div className='flex items-center gap-3 pl-5 p-1.5 bg-white w-full max-w-xl mx-auto border border-gray-200 shadow rounded-full'>
          <input 
            type="text" 
            className='flex-1 outline-none text-slate-700' 
            placeholder='Type a message...' 
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} 
            onChange={(e) => setText(e.target.value)} 
            value={text}
            disabled={isSending}
          />
          
          <div className='relative'>
            {imagePreview ? (
              <div className='relative'>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className='h-8 w-8 rounded object-cover'
                />
                <button
                  onClick={clearImagePreview}
                  className='absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center'
                >
                  ×
                </button>
              </div>
            ) : (
              <label htmlFor="image" className='cursor-pointer'>
                <ImageIcon className='size-7 text-gray-400 hover:text-gray-600 transition-colors' />
              </label>
            )}
            <input 
              type="file" 
              id='image' 
              accept='image/*' 
              hidden 
              onChange={handleImageChange}
              ref={fileInputRef}
              disabled={isSending}
            />
          </div>

          <button 
            onClick={sendMessage} 
            disabled={(!text?.trim() && !image) || isSending}
            className={`bg-linear-to-br from-indigo-500 to-purple-600 text-white p-2 rounded-full transition-all ${
              (!text?.trim() && !image) || isSending
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:from-indigo-700 hover:to-purple-800 active:scale-95 cursor-pointer'
            }`}
          >
            <SendHorizonal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;