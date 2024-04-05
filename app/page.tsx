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

const CarouselIndex = createContext(-1);

type CardCarouselContextType = {
  normMousePosition: number;
  totalCards: number;
  basis: number;
  gap: number;
};
const CardCarouselContext = createContext<CardCarouselContextType>({
  normMousePosition: 0,
  totalCards: 0,
  basis: 0,
  gap: 0,
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
  const [containerInfo, setContainerInfo] = useState<DOMRect>();
  const [containerWidth, setContainerWidth] = useState(0);
  const isVertical = direction === Direction.VERTICAL;

  // TODO: potentially adjust to account for non-square children
  const totalLength = useMemo(() => {
    const nChildren = Children.count(children);

    return nChildren * (basis + gap) - gap;
  }, [basis, gap, children]);

  useEffect(() => {
    if (containerElement.current) {
      setContainerInfo(containerElement.current.getBoundingClientRect());
    }
  }, [containerElement]);

  // TODO: Math.max(normPos, 1)?
  const handleMouseMove: MouseEventHandler = event => {
    // TODO: get rid of one of these if I only use one
    if (containerInfo && containerElement.current) {
      if (isVertical) {
        const relativeY = event.pageY - containerElement.current.offsetTop;
        const normY = relativeY / totalLength;

        setNormMousePosition(normY);
      } else {
        const relativeX = event.pageX - containerElement.current.offsetLeft;
        const normX = relativeX / totalLength;

        setNormMousePosition(normX);
      }
    }
  }

  return (
    <ul
      ref={containerElement}
      onMouseMove={handleMouseMove}
      style={{
        display: 'flex',
        flexDirection: isVertical ? 'column' : 'row',
        gap,
        [isVertical ? 'height' : 'width']: totalLength,
      }}
    >
      <CardCarouselContext.Provider value={{
        normMousePosition,
        totalCards: Children.count(children),
        basis,
        gap,
      }}>
        {Children.map(children, (child, index) => (
          <CarouselIndex.Provider value={index}>
            {child}
          </CarouselIndex.Provider>
        ))}
      </CardCarouselContext.Provider>
    </ul>
  )
}

const Card: FC<PropsWithChildren> = ({ children }) => {
  const index = useContext(CarouselIndex);
  const { normMousePosition, totalCards, basis } = useContext(CardCarouselContext);

  // TODO: cement unchanging values (maybe in context?)
  const normSlice = 1 / totalCards;
  const halfNormSlice = normSlice / 2;

  // represents the value of `normMousePosition` when the cursor is at the center of this card
  const normCenter = index * normSlice + halfNormSlice;

  const distance = Math.abs(normMousePosition - normCenter);
  // linear falloff over the length of one slice
  const scale = 2 - Math.min(distance, normSlice) / normSlice;
  const size = scale * basis;

  return (
    <li style={{ height: size, width: size }}>
      {
        children
      }
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
        <CardCarousel basis={160} gap={12} direction={Direction.HORIZONTAL}>
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
