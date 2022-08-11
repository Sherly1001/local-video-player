import React, { useRef } from 'react'
import Controller from './Controller'

interface Props extends React.VideoHTMLAttributes<HTMLDivElement> {
  vidName?: string
}

const Video = ({ className, src, vidName = '' }: Props) => {
  const vidRef = useRef<HTMLVideoElement>(null)
  const realRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={realRef} className={className}>
      <div className="relative w-full h-full">
        <Controller
          className="w-full h-full bg-transparent absolute z-10"
          vidRef={vidRef}
          vidName={vidName}
          realRef={realRef}
        />
        <video
          ref={vidRef}
          className="w-full h-full z-0"
          src={src}
          autoPlay
          tabIndex={-1}
        />
      </div>
    </div>
  )
}

export default Video
