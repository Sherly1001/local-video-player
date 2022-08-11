import { useEffect, useState } from 'react'

import { VideoInfo } from './types'
import FileLoader from './comps/FileLoader'
import Video from './comps/Video'

const App = () => {
  const [vids, setVids] = useState<VideoInfo[]>([])
  const [playing, setPlaying] = useState<number | null>(null)

  useEffect(() => {
    if (vids.length === 1) {
      setPlaying(0)
    }
  }, [vids])

  return (
    <div
      className={
        'w-screen h-screen text-white ' +
        (playing !== null ? 'bg-black' : 'bg-zinc-800')
      }
    >
      <FileLoader
        className={playing !== null ? 'hidden' : ''}
        vids={vids}
        setVids={setVids}
      />
      <Video
        className={'w-full h-full ' + (playing !== null ? '' : 'hidden')}
        src={vids[playing ?? 0]?.src}
        vidName={vids[playing ?? 0]?.name}
      />
    </div>
  )
}

export default App
