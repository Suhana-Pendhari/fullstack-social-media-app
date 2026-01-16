import React, { useEffect, useState } from 'react'
import { dummyStoriesData } from '../assets/assets';
import { Plus } from 'lucide-react';
import moment from 'moment';
import StoryModel from './StoryModel';
import StoryViewer from './StoryViewer';

const StoriesBar = () => {
    const [stories, setStories] = useState([]);
    const [showModel, setShowModel] = useState(false);
    const [viewStory, setViewStory] = useState(null);

    const fetchStories = async () => {
        setStories(dummyStoriesData);
    }

    useEffect(() => {
        fetchStories();
    }, [])

    // Function to get first 2 words of content
    const getFirstTwoWords = (text) => {
        if (!text) return '';
        const words = text.split(' ');
        return words.slice(0, 2).join(' ') + (words.length > 2 ? '...' : '');
    }

    return (
        <div className='w-screen sm:w-[calc(100vw-240px)] lg:max-w-2xl no-scrollbar overflow-x-auto px-4'>

            <div className='flex gap-4 pb-5'>
                {/* Add story card */}
                <div onClick={()=>setShowModel(true)} className='relative rounded-lg shadow-sm min-w-30 max-w-30 max-h-40 aspect-3/4 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-dashed border-indigo-300 bg-linear-to-b from-indigo-50 to-white'>
                    <div className='h-full flex flex-col items-center justify-center p-4'>
                        <div className='size-10 bg-indigo-500 rounded-full flex items-center justify-center mb-3'>
                            <Plus className='w-5 h-5 text-white' />
                        </div>
                        <p className='text-sm font-medium text-slate-700'>Create Story</p>
                    </div>
                </div>
                {/* Story cards */}
                {
                    stories.map((story, index) => (
                        <div onClick={()=>setViewStory(story)} key={index} className={`relative rounded-lg shadow min-w-30 max-w-30 max-h-40 aspect-3/4 cursor-pointer hover:shadow-lg transition-all duration-200 bg-linear-to-b from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 overflow-hidden`}>
                            {/* User Profile Picture */}
                            <img src={story.user.profile_picture} alt="" className='absolute size-8 top-3 left-3 z-10 rounded-full ring ring-gray-100 shadow' />
                            
                            {/* Content Text (First 2 words) */}
                            <p className='absolute top-11 left-3 right-3 text-white/80 text-xs font-medium truncate'>
                                {getFirstTwoWords(story.content)}
                            </p>
                            
                            {/* Time */}
                            <p className='text-white absolute bottom-1 right-2 z-10 text-xs'>{moment(story.createdAt).fromNow()}</p>
                            
                            {/* Media Preview */}
                            {story.media_type === 'image' && (
                                <div className='absolute inset-0 z-0 rounded-lg bg-black overflow-hidden'>
                                    <img 
                                        src={story.media_url} 
                                        alt="" 
                                        className='h-full w-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80' 
                                    />
                                </div>
                            )}
                            
                            {story.media_type === 'video' && (
                                <div className='absolute inset-0 z-0 rounded-lg bg-black overflow-hidden'>
                                    <video 
                                        src={story.media_url} 
                                        className='h-full w-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80' 
                                        muted
                                    />
                                </div>
                            )}
                            
                            {story.media_type === 'text' && (
                                <div className='absolute inset-0 z-0 rounded-lg overflow-hidden' style={{ backgroundColor: story.background_color }}>
                                    <div className='h-full w-full flex items-center justify-center p-4 hover:scale-110 transition duration-500'>
                                        <p className='text-white text-sm font-medium text-center line-clamp-3'>
                                            {getFirstTwoWords(story.content)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                }
            </div>

            {/* Add a Story Modal */}
            {showModel && <StoryModel setShowModel={setShowModel} fetchStories={fetchStories}/>}

            {/* View Story Model */}
            {viewStory && <StoryViewer viewStory={viewStory} setViewStory={setViewStory}/>}
        </div>
    )
}

export default StoriesBar