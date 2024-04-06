"use client"

import { easeOutCubic } from "@/utils/easingFunctions";
import clsx from "clsx";
import Image, { ImageProps } from "next/image";
// TODO ^: make this mostly server-rendered

import {
  Children,
  FC,
  MouseEventHandler,
  PropsWithChildren,
  ReactNode,
  RefObject,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
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

// scale is how large the card will be with the cursor at the normed center
const SCALE = 3;
// min scale is how small the card can possibly be as a factor of `basis`
const MIN_SCALE = 1;
// SCALE_FACTOR is how much SCALE needs to decrease to get to MIN_SCALE at max distance
const SCALE_FACTOR = SCALE - MIN_SCALE;
// falloff is how many slice lengths it takes for a card to reach MIN_SCALE
const FALLOFF = 1;
// how many MS to increase to full scaling on carousel mouse over
const EASING_MS = 200;

const CardSize = createContext(0);

const useEasingFactor = (startTime: number | undefined, duration: number, direction = EasingDirection.UP) => {
  const [easingFactor, setEasingFactor] = useState(0);
  const frameId = useRef<number>();

  useEffect(() => {
    if (startTime) {
      const stopAnimation = () => {
        if (frameId.current) {
          cancelAnimationFrame(frameId.current);
          frameId.current = undefined;
        }
      }

      if (direction === EasingDirection.UP) setEasingFactor(0);
      else setEasingFactor(1);

      const updateEasingFactor = () => {
        const msPassed = Date.now() - startTime;
        const normTimePassed = Math.min(msPassed / duration, 1);
        const easingFactor = direction === EasingDirection.UP
          ? easeOutCubic(normTimePassed)
          : 1 - easeOutCubic(normTimePassed);

        setEasingFactor(easingFactor);

        if (easingFactor === 1) stopAnimation();
        else frameId.current = requestAnimationFrame(updateEasingFactor);
      }

      requestAnimationFrame(updateEasingFactor);

      return stopAnimation;
    }
  }, [startTime, duration, direction]);

  return easingFactor;
}

// TODO: some way to fire handleMouseMove once on scroll end?
// - seems like the only way to get mouse position is in a mouse event, which
//   makes sense but scrolling doesn't fire any mouse events, might be SOL
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
  const [mouseOverTime, setMouseOverTime] = useState<number>();
  const [isMouseOver, setIsMouseOver] = useState(false);
  const easingFactor = useEasingFactor(
    mouseOverTime,
    EASING_MS,
    isMouseOver ? EasingDirection.UP : EasingDirection.DOWN
  );

  const {
    totalCards,
    unscaledLength,
    sliceLength,
    positions,
  } = useMemo(() => {
    const totalCards = Children.count(children);
    const unscaledLength = totalCards * (basis + gap) - gap;
    // percentage of total length taken up by cards
    const normTotalCardLength = totalCards * basis / unscaledLength;
    // percentage of total length taken up by gaps
    const normTotalGapLength = 1 - normTotalCardLength;
    // normed length of a single card
    const normCardLength = normTotalCardLength / totalCards;
    // normed length of a single gap
    const normGapLength = normTotalGapLength / totalCards;
    const sliceLength = normCardLength + normGapLength;

    const halfNormCardLength = normCardLength / 2;
    const positions: number[] = [];
    for (let i = 0; i < totalCards; i++) {
      positions.push(halfNormCardLength + i * sliceLength);
    }

    return {
      totalCards,
      unscaledLength,
      sliceLength,
      positions,
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

  const scaledLength = sizes.reduce((a, b) => a + b, 0) + gap * (totalCards - 1);
  const shift = normMousePosition * (scaledLength - unscaledLength);

  return (
    <ul
      ref={containerElement}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        setMouseOverTime(Date.now());
        setIsMouseOver(true);
      }}
      onMouseLeave={() => {
        setMouseOverTime(Date.now());
        setIsMouseOver(false);
      }}
      className="relative overflow-hidden"
      style={{ [isVertical ? 'height' : 'width']: unscaledLength }}
    >
      <div
        className="absolute flex"
        style={{
          top: -shift,
          flexDirection: isVertical ? 'column' : 'row',
          gap,
        }}
      >
        {Children.map(children, (child, index) => (
          <CardSize.Provider value={sizes[index]}>
            {child}
          </CardSize.Provider>
        ))}
      </div>
    </ul>
  )
}

const Card: FC<PropsWithChildren> = ({ children }) => {
  const size = useContext(CardSize);

  return (
    <li
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
          // direction={Direction.HORIZONTAL}
        >
          <Card>
            <InternallyCaptionedImage
              src="/software engineer.jpeg"
              height={640}
              width={640}
              alt="software engineer"
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
            >
              climber
            </InternallyCaptionedImage>
          </Card>
          <Card>
            <InternallyCaptionedImage
              src="/dog owner.jpeg"
              height={640}
              width={640}
              alt="dog owner"
            >
              dog owner
            </InternallyCaptionedImage>
          </Card>
          <Card>
            <InternallyCaptionedImage
              src="/sound tinkerer.jpeg"
              height={640}
              width={640}
              alt="sound tinkerer"
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
