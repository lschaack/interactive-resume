import { FC } from "react";

type EducationItemProps = {
  school: string;
  major: string;
  timeline: string;
  relevantCoursework: string[];
}
const EducationItem: FC<EducationItemProps> = ({
  school,
  major,
  timeline,
  relevantCoursework,
}) => {
  return (
    <li className="max-w-sm flex flex-col gap-1">
      <div>
        <h3 className="text-lg">{school}</h3>
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
    <div className="flex flex-col gap-y-3">
      <h2 className="text-xl">
        Education
      </h2>
      <ul className="flex flex-wrap gap-x-12 gap-y-6">
        <EducationItem
          school="University of Washington Seattle"
          major="General Education"
          timeline="2014 - 2016 (transferred)"
          relevantCoursework={[
            "Web Development",
            "Linear Algebra",
            "Intellectual Foundations of Informatics",
          ]}
        />
        <EducationItem
          school="University of Colorado Boulder"
          major="BA in Computer Science"
          timeline="2016 - 2018"
          relevantCoursework={[
            "Machine Learning",
            "Intro to Artificial Intelligence",
            "Intro to Data Science",
            "Statistical Methods",
            "Computer Graphics",
          ]}
        />
      </ul>
    </div>
  );
}
