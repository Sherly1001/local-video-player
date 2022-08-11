import React from 'react'
import { VideoInfo } from '../../types'

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  vids: VideoInfo[]
  setVids: Function
}

const FileLoader = ({ vids, setVids, className }: Props) => {
  return (
    <input
      type="file"
      className={className}
      multiple
      onChange={(e) => {
        for (let file of e.target.files ?? []) {
          const newVids: VideoInfo[] = []
          if (file.type.startsWith('video')) {
            newVids.push({
              name: file.name,
              src: URL.createObjectURL(file),
            })
          }
          setVids([...vids, ...newVids])
        }
      }}
    />
  )
}

export default FileLoader
