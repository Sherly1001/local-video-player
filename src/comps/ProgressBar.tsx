import React, { useEffect, useRef, useState } from 'react'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  min?: number
  ballSize?: number
  onValueChange?: Function
  onHover?: Function
}

const getRatio = (value: number, min: number, max: number) => {
  if (min == max) {
    return 1
  }
  let r = (value - min) / (max - min)
  if (r < 0) r = 0
  if (r > 1) r = 1
  r = +r.toFixed(4)
  return r
}

const getPos = (ratio: number, min: number, max: number) => {
  return ratio * (max - min) + min
}

const ProgressBar = ({
  className,
  value = 5,
  max = 5,
  min = 0,
  ballSize = 0.7,
  onValueChange,
  onHover,
}: Props) => {
  const bar = useRef<HTMLDivElement>(null)
  const ball = useRef<HTMLDivElement>(null)

  const [dragging, setDragging] = useState(false)
  const [ratio, setRatio] = useState(getRatio(value, min, max))
  const [ballWidth, setBallWidth] = useState(
    (bar.current?.clientHeight ?? 0) * ballSize
  )

  const getBallRatio = (clienX: number) => {
    if (bar.current) {
      const posMin = bar.current.offsetLeft + ballWidth / 2
      const posMax =
        bar.current.offsetLeft + bar.current.clientWidth - ballWidth / 2

      return getRatio(clienX, posMin, posMax)
    }
    return 1
  }

  const setBallRatio = (r: number) => {
    setRatio(r)
    onValueChange && onValueChange(getPos(r, min, max))
  }

  useEffect(() => {
    setRatio(getRatio(value, min, max))
  }, [value])

  useEffect(() => {
    if (bar.current) {
      setBallWidth(bar.current.clientHeight * ballSize)
    }
  }, [bar.current?.clientHeight])

  document.onmousemove = (e) =>
    dragging && setBallRatio(getBallRatio(e.clientX))
  document.onmouseup = () => setDragging(false)

  return (
    <div className={className}>
      <div
        ref={bar}
        className="flex items-center w-full h-full"
        style={{
          paddingLeft: ballWidth / 2 + 'px',
          paddingRight: ballWidth / 2 + 'px',
        }}
      >
        <div
          className="relative w-full h-1/5 hover:h-1/3 cursor-pointer"
          onClick={(e) => setBallRatio(getBallRatio(e.clientX))}
          onMouseDown={(e) => {
            setDragging(true)
            setBallRatio(getBallRatio(e.clientX))
          }}
          onMouseMove={(e) =>
            onHover && onHover(getBallRatio(e.clientX), e.clientX)
          }
        >
          <div className="w-full h-full top-0 left-0 bg-zinc-400" />
          <div
            className="absolute h-full top-0 left-0 bg-red-600"
            style={{
              width: ratio * 100 + '%',
            }}
          />
          <div
            ref={ball}
            className={
              'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 ' +
              'rounded-full bg-red-600'
            }
            style={{
              width: ballWidth + 'px',
              height: ballWidth + 'px',
              left: ratio * 100 + '%',
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default ProgressBar
