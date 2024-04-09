"use client";

import {
  Children,
  FC,
  FocusEventHandler,
  MouseEventHandler,
  PropsWithChildren,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import clsx from "clsx";

import {
  easeOutSine as _easeOutSine,
  inverseEaseOutSine as _inverseEaseOutSine
} from "@/utils/easingFunctions";
import { compressRangeSymmetric } from "@/utils/ranges";

export enum EasingDirection {
  UP,
  DOWN,
}

// TODO: create controls for these things so that I can test them all out quickly
// scale is how large the card will be with the cursor at the normed center
const SCALE = 3;
// min scale is how small the card can possibly be as a factor of `basis`
const MIN_SCALE = 1;
// falloff is how many slice lengths it takes for a card to reach MIN_SCALE
const FALLOFF = 2;
// how many MS to increase to full scaling on carousel mouse over
const EASING_MS = 200;
// kind of vague, but lower results in a tighter elbow - higher differential
// between the fastest and the slowest phases of the animation
const EASING_ELBOW = 0.5;

const easeOutSine = _easeOutSine(EASING_ELBOW);
const inverseEaseOutSine = _inverseEaseOutSine(EASING_ELBOW);

const CardSize = createContext(0);
type CardFocusContext = {
  focus: FocusEventHandler;
  blur: FocusEventHandler;
}
const CardFocus = createContext<CardFocusContext>({
  focus: () => undefined,
  blur: () => undefined,
});

const requestEasingFrames = (
  startingFactor: number,
  totalDuration: number,
  direction: EasingDirection,
  callback: (easingFactor: number) => void
) => {
  // using the current easing factor, find the time we're at in the easing
  // curve indicated by direction, then "finish" the animation from that point
  const isUp = direction === EasingDirection.UP;
  let normTime = isUp
    ? inverseEaseOutSine(startingFactor)
    : inverseEaseOutSine(1 - startingFactor);
  let prevTime = Date.now();
  let currentFrameId: number;

  const stopAnimation = () => {
    if (currentFrameId) {
      cancelAnimationFrame(currentFrameId);
    }
  }

  const updateEasingFactor: FrameRequestCallback = () => {
    const currTime = Date.now();
    const msPassed = currTime - prevTime;
    const normMsPassed = msPassed / totalDuration;
    prevTime = currTime;
    normTime = Math.min(normTime + normMsPassed, 1);

    const easingFactor = isUp
      ? easeOutSine(normTime)
      : 1 - easeOutSine(normTime);

    const limitReached = isUp
      ? easingFactor === 1
      : easingFactor === 0;

    if (limitReached) stopAnimation();
    else currentFrameId = requestAnimationFrame(updateEasingFactor);

    callback(easingFactor);
  }

  requestAnimationFrame(updateEasingFactor);

  return stopAnimation;
}

const useEasingFactor = (duration: number, direction = EasingDirection.UP) => {
  const [easingFactor, setEasingFactor] = useState(0);

  useEffect(
    () => requestEasingFrames(easingFactor, duration, direction, setEasingFactor),
    // easingFactor needs to be tracked in state to fire rerenders for components using this hook,
    // but this effect should only really fire when direction changes (otherwise animation will be
    // continually stopped and restarted)
    [duration, direction] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return easingFactor;
}

export const Card: FC<PropsWithChildren> = ({ children }) => {
  const size = useContext(CardSize);
  const { focus, blur } = useContext(CardFocus);

  return (
    <li
      tabIndex={0}
      className="outline-none focus:shadow-outline flex-shrink-0"
      onFocus={focus}
      onBlur={blur}
      style={{
        height: size,
        width: size,
      }}
    >
      {children}
    </li>
  )
}

type CardCarouselProps = {
  children?: ReactNode;
  direction?: 'horizontal' | 'vertical';
  basis: number;
  gap: number;
  className?: string;
}
export const CardCarousel: FC<CardCarouselProps> = ({ children, direction = 'horizontal', basis, gap, className }) => {
  const containerElement = useRef<HTMLUListElement>(null);
  const [normMousePosition, setNormMousePosition] = useState(0);
  const isVertical = direction === 'vertical';
  const [isMouseOver, setIsMouseOver] = useState(false);
  const easingFactor = useEasingFactor(
    EASING_MS,
    isMouseOver ? EasingDirection.UP : EasingDirection.DOWN
  );

  const {
    totalCards,
    unscaledLength,
    sliceLength,
    positions,
    focusHandlers,
    roomForPadding,
  } = useMemo(() => {
    const totalCards = Children.count(children);
    const unscaledLength = totalCards * (basis + gap) - gap;
    // percentage of total length taken up by cards
    const normTotalCardLength = totalCards * basis / unscaledLength;
    // percentage of total length taken up by gaps
    const normTotalGapLength = 1 - normTotalCardLength;
    // normed length of a single card
    const normCardLength = normTotalCardLength / totalCards;
    const halfNormCardLength = normCardLength / 2;
    // normed length of a single gap
    const normGapLength = normTotalGapLength / totalCards;
    const sliceLength = normCardLength + normGapLength;
    // calculations for container sizing need to account for additional room for padding on either
    // side of the card container, but I'm gonna be perfectly honest - this is an experimental
    // value and I have no idea why it's `4 *` instead of `2 *`...best guess is the similarly 4px
    // border, but explicitly setting box-sizing to 'border-box' doesn't seem to affect how large
    // this value needs to be
    const roomForPadding = 4 * gap;

    const positions: number[] = [];
    const focusHandlers: CardFocusContext[] = [];
    for (let i = 0; i < totalCards; i++) {
      positions.push(halfNormCardLength + i * sliceLength);

      focusHandlers.push({
        focus: () => {
          // mock the cursor being positioned over this card
          setNormMousePosition(positions[i]);

          setIsMouseOver(true);
        },
        // detect if next focus is going to another card
        blur: e => {
          const nextFocusIsCard = e.relatedTarget?.parentElement === e.currentTarget.parentElement;

          if (!nextFocusIsCard) {
            setIsMouseOver(false);
          }
        }
      });
    }

    return {
      totalCards,
      unscaledLength,
      sliceLength,
      positions,
      focusHandlers,
      roomForPadding,
    }
  }, [basis, gap, children]);

  const handleMouseMove: MouseEventHandler = useCallback(event => {
    if (containerElement.current) {
      if (isVertical) {
        const relativeY = event.pageY - containerElement.current.offsetTop;
        const normY = relativeY / unscaledLength;

        setNormMousePosition(normY);
      } else {
        const relativeX = event.pageX - containerElement.current.offsetLeft;
        const normX = relativeX / unscaledLength;

        setNormMousePosition(normX);
      }
    }
  }, [isVertical, unscaledLength]);

  const parentCrossAxisLength = containerElement?.current?.parentElement?.getBoundingClientRect()[isVertical ? 'width' : 'height'];
  // if SCALE would push beyond the bounds of the container,
  // only use up to maximum available cross-axis space
  const maxAvailableScale = parentCrossAxisLength
    ? Math.min(SCALE, parentCrossAxisLength / (basis + roomForPadding))
    : SCALE;
  // SCALE_FACTOR is how much SCALE needs to decrease to get to MIN_SCALE at max distance
  const scaleFactor = maxAvailableScale - MIN_SCALE;

  const sizes = positions.map(normCardPosition => {
    const distance = Math.abs(normMousePosition - normCardPosition);
    // linear falloff over the length of FALLOFF slices
    // scaleAdjust is a value from:
    // - 0 when mouse position is at card position
    // - to 1 when mouse position is at or beyond FALLOFF * sliceLength
    const scaleAdjust = Math.min(distance, FALLOFF * sliceLength) / (FALLOFF * sliceLength);
    const scale = maxAvailableScale - scaleFactor * scaleAdjust;
    // find difference between 1 and scale for easing -
    // this way I can blend in the effects of the scaling over the duration of the easing curve
    const scaleDifference = Math.abs(1 - scale);

    // easingFactor will automatically send scaling factor to 0 when direction changes
    return (1 + easingFactor * scaleDifference) * basis;
  });

  const scaledLength = sizes.reduce((a, b) => a + b) + gap * (totalCards - 1);
  const shift = compressRangeSymmetric(normMousePosition, sliceLength) * (scaledLength - unscaledLength);

  // when scaling, set cross axis to the maximum scale to minimize reflow (eased)
  const crossAxisLength = (1 + easingFactor * Math.abs(1 - maxAvailableScale)) * basis;

  return (
    <ul
      ref={containerElement}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
      className={clsx(
        'relative overflow-clip p-1',
        'border-4 border-solid border-foreground dark:border-background',
        className
      )}
      style={{
        // container has an additional gap on each side for padding
        [isVertical ? 'maxHeight' : 'maxWidth']: unscaledLength + roomForPadding
      }}
    >
      <div
        className="relative flex"
        style={{
          [isVertical ? 'top' : 'left']: -shift,
          [isVertical ? 'width' : 'height']: crossAxisLength,
          flexDirection: isVertical ? 'column' : 'row',
          alignItems: 'center',
          gap,
        }}
      >
        {Children.map(children, (child, index) => (
          <CardSize.Provider value={sizes[index]}>
            <CardFocus.Provider value={focusHandlers[index]}>
              {child}
            </CardFocus.Provider>
          </CardSize.Provider>
        ))}
      </div>
    </ul>
  )
}
