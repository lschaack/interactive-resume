import Image from "next/image";
import { FC, ReactNode } from "react";

type ExperienceItemProps = {
  title: string;
  timeline: string;
  children?: ReactNode;
}
const ExperienceItem: FC<ExperienceItemProps> = ({ title, timeline, children }) => {
  return (
    <li className="flex flex-col gap-y-1 max-w-lg">
      <div>
        <h3 className="text-lg font-bold">{title}</h3>
        <p>{timeline}</p>
      </div>
      <div className="flex flex-col gap-3 font-normal">
        {children}
      </div>
    </li>
  );
}

export default function Experience() {
  return (
    <div className="flex flex-col gap-y-3">
      <h2 className="text-xl">
        Experience
      </h2>
      <ol className="flex flex-wrap gap-x-24 gap-y-6">
        <ExperienceItem title="Software Engineer - Clover" timeline="November 2018 - Present">
          <p>
            Took responsibility for the maintenance and development of the help center, reworking the search indexing process, content model, and validation to accomodate the challenges of context-sensitive help
          </p>
          <p>
            Helped migrate a legacy application to leverage newer React infrastructure
          </p>
          <p>
            Worked with a challenging API using in-progress documentation to create a merchant support chat application, reducing call volume and improving the quality of future support calls
          </p>
        </ExperienceItem>
        <ExperienceItem title="Internship - Focus Point Capital" timeline="March - August 2018">
          <p>
            Developed a financial model for investment based on market data using the NumPy and Pandas libraries in a Jupyter Notebook
          </p>
          <p>
            Tailored model’s function based on supervisor feedback, adding and editing features as requested
          </p>
          <p>
            Produced detailed documentation for the use and expansion of the above model
          </p>
        </ExperienceItem>
      </ol>
    </div>
  );
}
