import React from 'react'

const StoryViewer = () => {
  return (
    <div className='fixed inset-0 h-screen bg-black bg-opacity-90 scale-z-110 flex items-center justify-center' style={{backgroundColor: viewStory.media_type === 'text' ? viewStory.background_color:'#000000'}}>

    {/* Progress bar */}
    <div className='absolute top-0 left-0 w-full h-1 bg-gray-700'>
        <div className='h-full bg-white transition-all duration-100 linear' style={{width: '50'}}>

        </div>
    </div>
    </div>
  )
}

export default StoryViewer