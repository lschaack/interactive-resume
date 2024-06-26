import Image from "next/image";
import { FC } from "react";

type EducationItemProps = {
  school: string;
  major: string;
  timeline: string;
  logoSrc: string;
  relevantCoursework: string[];
}
const EducationItem: FC<EducationItemProps> = ({
  school,
  major,
  timeline,
  logoSrc,
  relevantCoursework,
}) => {
  return (
    <li className="max-w-md flex flex-col gap-1">
      <div>
        <div className="flex items-center gap-x-3">
          <Image
            src={logoSrc}
            height={24}
            width={24}
            // icon is purely decorative:
            // https://www.w3.org/WAI/tutorials/images/decorative/#example-4-image-used-for-ambiance-eye-candy
            alt=""
            className="self-center"
          />
          <h3 className="text-lg">{school}</h3>
        </div>
        <div className="font-normal flex justify-between gap-6">
          <p>{major}</p>
          <p>{timeline}</p>
        </div>
      </div>
      <div>
        <h4>Relevant Coursework</h4>
        <p className="font-normal text-sm">{relevantCoursework.join(', ')}</p>
      </div>
    </li>
  );
}

export default function Education() {
  return (
    <>
      <h2 className="text-xl">
        Education
      </h2>
      <ul className="flex flex-wrap gap-x-12 gap-y-6">
        <EducationItem
          school="University of Colorado Boulder"
          major="BA in Computer Science"
          timeline="2016 - 2018"
          logoSrc="CU.svg"
          relevantCoursework={[
            "Machine Learning",
            "Intro to Artificial Intelligence",
            "Intro to Data Science",
            "Statistical Methods",
            "Computer Graphics",
          ]}
        />
        <EducationItem
          school="University of Washington Seattle"
          major="General Education"
          timeline="2014 - 2016 (transferred)"
          logoSrc="UW.svg"
          relevantCoursework={[
            "Web Development",
            "Linear Algebra",
            "Intellectual Foundations of Informatics",
          ]}
        />
      </ul>
    </>
  );
}
