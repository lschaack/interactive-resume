"use client"

import {
  easeOutCubic,
  easeOutSine as _easeOutSine,
  inverseEaseOutSine as _inverseEaseOutSine
} from "@/utils/easingFunctions";
import { compressRangeSymmetric } from "@/utils/ranges";
import clsx from "clsx";
import Image, { ImageProps } from "next/image";
// TODO ^: make this mostly server-rendered

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

enum Direction {
  VERTICAL,
  HORIZONTAL,
}

enum EasingDirection {
  UP,
  DOWN,
}

// TODO: create controls for these things so that I can test them all out quickly
// scale is how large the card will be with the cursor at the normed center
const SCALE = 3;
// min scale is how small the card can possibly be as a factor of `basis`
const MIN_SCALE = 1;
// SCALE_FACTOR is how much SCALE needs to decrease to get to MIN_SCALE at max distance
const SCALE_FACTOR = SCALE - MIN_SCALE;
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

type CardCarouselProps = {
  children?: ReactNode;
  direction?: Direction;
  basis: number;
  gap: number;
}
const CardCarousel: FC<CardCarouselProps> = ({ children, direction = Direction.VERTICAL, basis, gap }) => {
  const containerElement = useRef<HTMLUListElement>(null);
  const [normMousePosition, setNormMousePosition] = useState(0);
  const isVertical = direction === Direction.VERTICAL;
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
  } = useMemo(() => {
    const totalCards = Children.count(children);
    const unscaledLength = totalCards * (basis + gap) + gap;
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

  const sizes = positions.map(normCardPosition => {
    const distance = Math.abs(normMousePosition - normCardPosition);
    // linear falloff over the length of FALLOFF slices
    // scaleAdjust is a value from:
    // - 0 when mouse position is at card position
    // - to 1 when mouse position is at or beyond FALLOFF * sliceLength
    const scaleAdjust = Math.min(distance, FALLOFF * sliceLength) / (FALLOFF * sliceLength);
    const scale = SCALE - SCALE_FACTOR * scaleAdjust;
    // find difference between 1 and scale for easing -
    // this way I can blend in the effects of the scaling over the duration of the easing curve
    const scaleDifference = Math.abs(1 - scale);

    // easingFactor will automatically send scaling factor to 0 when direction changes
    return (1 + easingFactor * scaleDifference) * basis;
  });

  const scaledLength = sizes.reduce((a, b) => a + b, 0) + gap * (totalCards + 1);
  const shift = compressRangeSymmetric(normMousePosition, sliceLength) * (scaledLength - unscaledLength);

  // when scaling, set cross axis to the maximum scale to minimize reflow (eased)
  const crossAxisLength = (1 + easingFactor * Math.abs(1 - SCALE)) * basis + 2 * gap;

  return (
    <ul
      ref={containerElement}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
      className="relative overflow-clip"
      style={{
        // height: isVertical ? unscaledLength : 'unset',
        [isVertical ? 'height' : 'width']: unscaledLength
      }}
    >
      <div
        className="relative flex"
        style={{
          [isVertical ? 'top' : 'left']: -shift,
          [isVertical ? 'width' : 'height']: crossAxisLength,
          flexDirection: isVertical ? 'column' : 'row',
          alignItems: isVertical ? 'unset' : 'center',
          gap,
          padding: gap,
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

const Card: FC<PropsWithChildren> = ({ children }) => {
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

type InternallyCaptionedImageProps = ImageProps & {
  children: string;
  alt: string;
};
const InternallyCaptionedImage: FC<InternallyCaptionedImageProps> = ({ children, alt, ...imageProps }) => {
  return (
    <figure className="relative border-4 border-solid border-foreground dark:border-background">
      <Image alt={alt} {...imageProps} />
      <figcaption className={clsx(
        'absolute bottom-0',
        'bg-background dark:bg-foreground',
        'border-t-4 border-solid border-foreground dark:border-background',
        'p-1 w-full text-center'
      )}>
        {children}
      </figcaption>
    </figure>
  );
}

// FIXME: edge case when focused on link below carousel w/cursor near the bottom
// of the horizontal carousel
export default function About() {
  return (
    <>
      <h2 className="text-xl font-bold">
        About
      </h2>
      <div className="flex flex-col gap-y-3 font-normal">
        <h3>Hi!</h3>
        <p>
          My name is Luke Schaack, and I am a:
        </p>
        {/* <ul className="marker:text-slate-600 list-disc pl-6">
          <li>
            Software engineer
          </li>
          <li>
            Climber
          </li>
          <li>
            Dog owner
          </li>
          <li>
            Sound tinkerer
          </li>
          <li>
            Serial personal project-starter, scope expander, and pre-polish abandoner
          </li>
        </ul> */}
        {/* TODO: more descriptive alt text for all images */}
        <CardCarousel
          basis={160}
          gap={4}
          direction={Direction.HORIZONTAL}
        >
          <Card>
            <InternallyCaptionedImage
              src="/software engineer.jpeg"
              height={640}
              width={640}
              alt="software engineer"
              priority
            >
              software engineer
            </InternallyCaptionedImage>
          </Card>
          <Card>
            <InternallyCaptionedImage
              src="/climber.jpeg"
              height={640}
              width={640}
              alt="climber"
              priority
            >
              climber
            </InternallyCaptionedImage>
          </Card>
          <Card>
            <InternallyCaptionedImage
              src="/ball thrower.jpeg"
              height={640}
              width={640}
              alt="ball thrower"
              priority
            >
              ball thrower
            </InternallyCaptionedImage>
          </Card>
          <Card>
            <InternallyCaptionedImage
              src="/sound tinkerer.jpeg"
              height={640}
              width={640}
              alt="sound tinkerer"
              priority
            >
              sound tinkerer
            </InternallyCaptionedImage>
          </Card>
          <Card>
            <InternallyCaptionedImage
              src="/DSCF3628.jpeg"
              height={640}
              width={640}
              alt="DSCF3628"
              priority
            >
              DSCF3628
            </InternallyCaptionedImage>
          </Card>
          <Card>
            <InternallyCaptionedImage
              src="/DSCF4344.jpeg"
              height={640}
              width={640}
              alt="DSCF4344"
              priority
            >
              DSCF4344
            </InternallyCaptionedImage>
          </Card>
        </CardCarousel>
        <p>
          That last one might sound like a bad thing, but my professional track record is very different! The same standard that prevents me from putting out work until it’s highly polished drives me to make features watertight when scope is limited.
        </p>
        <p>
          If you’re reading this as a talent seeker or hiring manager, the content of this site is my resume. If you’re more the engineering type, though, check out<a href="https://github.com/lschaack/interactive-resume" className="text-blue-600 visited:text-purple-600 underline">the source code</a>which will probably tell you more of what you need to know.
        </p>
      </div>
    </>
  );
}
