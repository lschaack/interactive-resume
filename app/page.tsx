"use client"

import Image from "next/image";
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
  useMemo,
  useRef,
  useState
} from "react";

enum Direction {
  VERTICAL,
  HORIZONTAL,
}

// scale is how large the card will be with the cursor at the normed center
const SCALE = 3;
// min scale is how small the card can possibly be as a factor of `basis`
const MIN_SCALE = 1;
// SCALE_FACTOR is how much SCALE needs to decrease to get to MIN_SCALE at max distance
const SCALE_FACTOR = SCALE - MIN_SCALE;
// falloff is how many slice lengths it takes for a card to reach MIN_SCALE
const FALLOFF = 1;

const CardSize = createContext(0);

type CardCarouselContextType = {
  normMousePosition: number;
  basis: number;
  gap: number;
  totalCards: number;
  totalLength: number;
  sliceLength: number;
  positions: number[];
  isMouseOver: boolean;
};
const CardCarouselContext = createContext<CardCarouselContextType>({
  normMousePosition: 0,
  basis: 0,
  gap: 0,
  totalCards: 0,
  totalLength: 0,
  sliceLength: 0,
  positions: [],
  isMouseOver: false,
});
// TODO:
// - wait for a couple hundred ms
// - then expand to max height needed to reduce reflow
// - then smooth zooming by another couple hundred ms
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

  const {
    totalCards,
    totalLength,
    sliceLength,
    positions,
    maxScaledLength,
  } = useMemo(() => {
    const totalCards = Children.count(children);
    const totalLength = totalCards * (basis + gap) - gap;
    // percentage of total length taken up by cards
    const normTotalCardLength = totalCards * basis / totalLength;
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

    const maxScaledLength = totalLength - basis + SCALE * basis;

    return {
      totalCards,
      totalLength,
      sliceLength,
      positions,
      maxScaledLength,
    }
  }, [basis, gap, children]);

  const handleMouseMove: MouseEventHandler = useCallback(event => {
    if (containerElement.current) {
      if (isVertical) {
        const relativeY = event.pageY - containerElement.current.offsetTop;
        const normY = relativeY / totalLength;

        console.log('event.pageY', event.pageY);
        console.log('containerElement.current.offsetTop', containerElement.current.offsetTop);

        setNormMousePosition(normY);
      } else {
        const relativeX = event.pageX - containerElement.current.offsetLeft;
        const normX = relativeX / totalLength;

        setNormMousePosition(normX);
      }
    }
  }, [isVertical, totalLength]);

  // console.log('window.scrollY', window.scrollY);
  // console.log('window.innerHeight', window.innerHeight);
  // console.log('document.body.scrollHeight', document.body.scrollHeight);

  const sizes = positions.map(normCardPosition => {
    const distance = Math.abs(normMousePosition - normCardPosition);
    // linear falloff over the length of FALLOFF slices
    // scaleAdjust is a value from:
    // - 0 when mouse position is at card position
    // - to 1 when mouse position is at or beyond FALLOFF * sliceLength
    const scaleAdjust = Math.min(distance, FALLOFF * sliceLength) / (FALLOFF * sliceLength);
    const scale = SCALE - SCALE_FACTOR * scaleAdjust;

    return isMouseOver ? scale * basis : basis;
  });

  const length = sizes.reduce((a, b) => a + b, 0) + gap * (totalCards - 1);

  return (
    <ul
      ref={containerElement}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
      style={{
        display: 'flex',
        flexDirection: isVertical ? 'column' : 'row',
        gap,
        [isVertical ? 'height' : 'width']: isMouseOver ? length : totalLength,
        // alignItems: 'center',
      }}
    >
      <CardCarouselContext.Provider value={{
        normMousePosition,
        basis,
        gap,
        totalCards,
        totalLength,
        sliceLength,
        positions,
        isMouseOver,
      }}>
        {Children.map(children, (child, index) => (
          <CardSize.Provider value={sizes[index]}>
            {child}
          </CardSize.Provider>
        ))}
      </CardCarouselContext.Provider>
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
        <CardCarousel
          basis={160}
          gap={12}
          // direction={Direction.HORIZONTAL}
        >
          <Card>
            <Image
              src="/software engineer.jpeg"
              height={640}
              width={640}
              alt="software engineer"
            />
          </Card>
          <Card>
            <Image
              src="/climber.jpeg"
              height={640}
              width={640}
              alt="climber"
            />
          </Card>
          <Card>
            <Image
              src="/dog owner.jpeg"
              height={640}
              width={640}
              alt="dog owner"
            />
          </Card>
          <Card>
            <Image
              src="/sound tinkerer.jpeg"
              height={640}
              width={640}
              alt="sound tinkerer"
            />
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
