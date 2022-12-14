import React, { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {
  faPause,
  faPlay,
  faVolume,
  faVolumeHigh,
  faVolumeLow,
  faVolumeXmark,
  faExpand,
  faCompress,
  faGaugeSimpleMax,
  faSendBack,
  faForwardStep,
  faClockRotateLeft,
  faClockRotateRight,
} from '../../custom'

import ProgressBar from '../ProgressBar'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  realRef: React.RefObject<HTMLDivElement>
  vidRef: React.RefObject<HTMLVideoElement>
  vidName?: string
}

const Controller = ({ className, realRef, vidRef, vidName }: Props) => {
  const ctrlRef = useRef<HTMLDivElement>(null)
  const clickRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const progRef = useRef<HTMLDivElement>(null)
  const preTimeRef = useRef<HTMLDivElement>(null)

  const [overlayIcon, setOverlayIcon] = useState<IconDefinition | null>(null)
  const [overlayCache, setOverlayCache] = useState(0)
  const [showCtrl, setShowCtrl] = useState(true)
  const [showTimeout, setShowTimeout] = useState(0)
  const [moving, setMoving] = useState(false)
  const [preTime, setPreTime] = useState<number | null>(null)
  const [prePos, setPrePos] = useState(0)

  const [isFullscreen, setFullscreen] = useState(false)
  const [paused, setPaused] = useState(false)
  const [muted, setMuted] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)

  const setPrePosGuard = (clientX: number) => {
    if (progRef.current && preTimeRef.current) {
      if (
        clientX <
        progRef.current.offsetLeft + preTimeRef.current.clientWidth / 2
      ) {
        clientX =
          progRef.current.offsetLeft + preTimeRef.current.clientWidth / 2
      }

      if (
        clientX >
        progRef.current.offsetLeft +
          progRef.current.clientWidth -
          preTimeRef.current.clientWidth / 2
      ) {
        clientX =
          progRef.current.offsetLeft +
          progRef.current.clientWidth -
          preTimeRef.current.clientWidth / 2
      }

      setPrePos(clientX)
    }
  }

  const getVolIcon = (v: number) => {
    if (v == 0 || muted) {
      return faVolumeXmark
    } else if (v < 1 / 3) {
      return faVolumeLow
    } else if (v < 2 / 3) {
      return faVolume
    } else {
      return faVolumeHigh
    }
  }

  const togglePlay = (setPlay?: boolean) => {
    if (vidRef.current) {
      const nextState = setPlay ?? vidRef.current.paused
      const nextFunc = nextState
        ? vidRef.current.play.bind(vidRef.current)
        : vidRef.current.pause.bind(vidRef.current)
      setOverlayCache(overlayCache + 1)
      setOverlayIcon(nextState ? faPlay : faPause)
      setPaused(!nextState)
      setShowCtrl(!nextState)
      nextFunc()
    }
  }

  const toggleFullscreen = (fullscreen?: boolean) => {
    if (vidRef.current && realRef.current) {
      const nextState = fullscreen ?? !document.fullscreenElement
      const nextFunc = nextState
        ? realRef.current.requestFullscreen.bind(realRef.current)
        : document.exitFullscreen.bind(document)
      nextFunc()
    }
  }

  const seekVidTime = (t: number = 10) => {
    if (vidRef.current) {
      vidRef.current.currentTime += t
      setOverlayCache(overlayCache + 1)
      setOverlayIcon(t > 0 ? faClockRotateRight : faClockRotateLeft)
    }
  }

  const setVidTime = (t: number) => {
    if (vidRef.current) {
      vidRef.current.currentTime = t
    }
  }

  const setVidVol = (v: number) => {
    if (vidRef.current) {
      v = +v.toFixed(2)
      if (v > 1) v = 1
      if (v < 0) v = 0
      vidRef.current.volume = v
      setVolume(v)
      setOverlayCache(overlayCache + 1)
      setOverlayIcon(getVolIcon(v))
    }
  }

  const toggleMute = (mute?: boolean) => {
    if (vidRef.current) {
      const nextState =
        mute ?? (vidRef.current.volume == 0 ? false : !vidRef.current.muted)
      vidRef.current.muted = nextState
      setMuted(nextState)
      if (!nextState && vidRef.current.volume == 0) {
        vidRef.current.volume = 0.1
      }
    }
  }

  const controllIcons = [
    {
      icon: paused ? faPlay : faPause,
      onClick: () => togglePlay(),
    },
    { icon: faClockRotateLeft, onClick: () => seekVidTime(-10) },
    { icon: faClockRotateRight, onClick: () => seekVidTime(10) },
    { icon: getVolIcon(volume), onClick: () => toggleMute() },
  ]

  const settingIcons = [
    { icon: faForwardStep },
    { icon: faSendBack },
    { icon: faGaugeSimpleMax },
    {
      icon: isFullscreen ? faCompress : faExpand,
      onClick: () => toggleFullscreen(),
    },
  ]

  useEffect(() => {
    if (vidRef.current) {
      const vid = vidRef.current

      vid.onloadedmetadata = () => {
        setVolume(vid.volume)
        setDuration(vid.duration)
      }

      vid.onvolumechange = () => {
        const v = +vid.volume.toFixed(2)
        vid.volume = v
        setVolume(v)
      }

      vid.ontimeupdate = () => {
        setTime(vid.currentTime)
      }
    }
  }, [vidRef])

  useEffect(() => {
    if (overlayRef.current && overlayIcon) {
      const overlay = overlayRef.current
      overlay.style.display = 'block'
      overlay
        .animate(
          [
            { opacity: 0.8, transform: 'translate(-50%, -50%)' },
            {
              opacity: 0,
              transform: 'translate(-50%, -50%) scale(2)',
            },
          ],
          {
            duration: 500,
          }
        )
        .finished.then(() => {
          overlay.style.display = 'none'
          setOverlayCache(0)
          setOverlayIcon(null)
        })
    }
  }, [overlayIcon, overlayCache])

  useEffect(() => {
    if (showCtrl && !moving) {
      showTimeout && clearTimeout(showTimeout)
      setShowTimeout(setTimeout(() => setShowCtrl(false), 3000))
    }

    if (moving) {
      setTimeout(() => setMoving(false), 50)
    }
  }, [showCtrl, moving])

  document.onfullscreenchange = () => {
    setFullscreen(!!document.fullscreenElement)
  }

  document.onkeydown = (e) => {
    if (e.code == 'ArrowLeft') {
      seekVidTime(-10)
    } else if (e.code == 'ArrowRight') {
      seekVidTime(10)
    } else if (e.code == 'ArrowUp') {
      setVidVol(volume + 0.1)
    } else if (e.code == 'ArrowDown') {
      setVidVol(volume - 0.1)
    } else if (e.code == 'Space') {
      togglePlay()
    } else if (e.code == 'KeyF') {
      toggleFullscreen()
    } else if (e.code == 'KeyM') {
      toggleMute()
    }
  }

  const clickGuard = (target: EventTarget, func: Function, ...args: any) => {
    if (target == ctrlRef.current || target == clickRef.current) {
      func(...args)
    }
  }

  return (
    <div
      ref={ctrlRef}
      className={className + (showCtrl ? '' : ' cursor-none')}
      onClick={(e) => clickGuard(e.target, togglePlay)}
      onDoubleClick={(e) => clickGuard(e.target, toggleFullscreen)}
      onWheel={(e) =>
        clickGuard(
          e.target,
          setVidVol,
          e.deltaY < 0 ? volume + 0.1 : volume - 0.1
        )
      }
      onMouseMove={() => {
        setMoving(true)
        setShowCtrl(true)
      }}
      style={{
        userSelect: 'none',
        msUserSelect: 'none',
        msTouchSelect: 'none',
        MozUserSelect: 'none',
        KhtmlUserSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      tabIndex={-1}
    >
      <div
        ref={overlayRef}
        className={
          'flex justify-center content-center p-5 text-4xl ' +
          'absolute top-1/2 left-1/2 ' +
          'rounded-full bg-zinc-800 hidden '
        }
      >
        {overlayIcon && <FontAwesomeIcon icon={overlayIcon} />}
      </div>
      <div
        className={
          'h-full w-full flex flex-col justify-end ' +
          (showCtrl ? '' : 'hidden')
        }
      >
        <div
          ref={preTimeRef}
          className={
            'absolute bg-zinc-900 px-3 py-2 ' +
            '-translate-x-1/2 opacity-80 rounded ' +
            (preTime !== null ? '' : 'hidden')
          }
          style={{
            left: prePos + 'px',
            top: (progRef.current?.offsetTop ?? 0) - 40 + 'px',
          }}
        >
          <span>
            {new Date((preTime ?? 0) * 1000).toISOString().slice(11, 19)}
          </span>
        </div>
        <div ref={clickRef} className="flex-1"></div>
        <div className="px-4">
          <div className="flex pb-6 text-md">
            <div ref={progRef} className="flex-1">
              <ProgressBar
                className="w-full h-full"
                value={time}
                min={0}
                max={duration}
                onValueChange={setVidTime}
                onHover={(ratio?: number, clientX?: number) => {
                  if (ratio !== undefined && clientX !== undefined) {
                    setPreTime(ratio * duration)
                    setPrePosGuard(clientX)
                  } else {
                    setPreTime(null)
                  }
                }}
              />
            </div>
            <div className="flex justify-center content-center w-20">
              <span>
                {new Date((duration - time) * 1000).toISOString().slice(11, 19)}
              </span>
            </div>
          </div>
          <div className="flex xl:text-5xl lg:text-4xl md:text-3xl sm:text-xl">
            <div className="flex flex-1">
              {controllIcons.map((elm, idx) => (
                <div
                  key={idx}
                  onClick={elm.onClick}
                  className={
                    'cursor-pointer hover:scale-125 transition ' +
                    'flex flex-1 justify-center content-center'
                  }
                >
                  <FontAwesomeIcon icon={elm.icon} />
                </div>
              ))}
            </div>
            <div className="flex w-3/5 justify-center items-center truncate px-14">
              <span className="truncate text-2xl">{vidName}</span>
            </div>
            <div className="flex flex-1">
              {settingIcons.map((elm, idx) => (
                <div
                  key={idx}
                  onClick={elm.onClick}
                  className={
                    'cursor-pointer hover:scale-125 transition ' +
                    'flex flex-1 justify-center content-center'
                  }
                >
                  <FontAwesomeIcon icon={elm.icon} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="xl:h-10 lg:h-8 md:h-6 sm:h-4 h-2" />
      </div>
    </div>
  )
}

export default Controller
