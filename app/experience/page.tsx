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
          <ul className="marker:text-slate-600 list-disc pl-6 flex flex-col gap-y-2">
            <li>
              Took responsibility for the maintenance and development of the help center, reworking the search indexing process, content model, and validation to accomodate the challenges of context-sensitive help
            </li>
            <li>
              Reworked a system based on traditional rollout to enable user-driven opt in/out of a new dashboard, refactoring code across a dozen repositories to stably transition to the new flow across version mismatch and rollout stage.
            </li>
            <li>
              Worked on the Web Infrastructure team to maintain a system of runtime-included apps deployed from separate repositories using module federation.
            </li>
          </ul>
        </ExperienceItem>
        <ExperienceItem title="Internship - Focus Point Capital" timeline="March - August 2018">
          <ul className="marker:text-slate-600 list-disc pl-6 flex flex-col gap-y-2">
            <li>
              Developed a financial model for investment based on market data using the NumPy and Pandas libraries in a Jupyter Notebook
            </li>
            <li>
              Tailored model’s function based on supervisor feedback, adding and editing features as requested
            </li>
            <li>
              Produced detailed documentation for the use and expansion of the above model
            </li>
          </ul>
        </ExperienceItem>
      </ol>
    </div>
  );
}
