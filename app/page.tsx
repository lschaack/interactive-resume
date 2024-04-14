"use client";

import { FC } from "react";
import clsx from "clsx";
import Image, { ImageProps } from "next/image";
import { Card, CardCarousel } from "./components/CardCarousel";
import { useResizeValue } from "./hooks/useResizeValue";

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
  const canFitFourCards = useResizeValue(() => window.matchMedia('(min-width: 1024px)').matches);

  return (
    <>
      <h2 className="text-xl">
        About
      </h2>
      <div className="flex flex-col gap-y-3 font-normal max-w-full">
        <h3>Hi!</h3>
        <p>
          My name is Luke Schaack, and I am a:
        </p>
        <CardCarousel
          basis={160}
          gap={4}
          direction={canFitFourCards ? 'horizontal' : 'vertical'}
          className="self-center sm:self-start"
        >
          <Card>
            <InternallyCaptionedImage
              src="/software engineer.jpeg"
              height={640}
              width={640}
              alt="A photo of me at Ocean Beach, wearing a backpack (like software engineers do) and looking out towards the water."
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
              alt="A photo of me rappelling down a slab climb on The Egg near Mickey's Beach."
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
              alt="A photo of me staring at a ball with bulging eyes while my dog Orzo sits on my shoulder doing the same thing."
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
              alt="A photo of me sitting at a desk at night, lit by the backlight of a monitor hidden behind a set of speakers."
              priority
            >
              sound tinkerer
            </InternallyCaptionedImage>
          </Card>
        </CardCarousel>
        <p>
          And a serial personal project-starter, scope expander, and pre-polish abandoner.
        </p>
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
