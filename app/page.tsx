import { FC } from "react";
import clsx from "clsx";
import Image, { ImageProps } from "next/image";
import { Card, CardCarousel } from "./components/CardCarousel";

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
      <h2 className="text-xl">
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
          direction="horizontal"
          className="self-center sm:self-start"
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
