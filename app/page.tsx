export default function Home() {
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
        <ul className="marker:text-slate-600 list-disc pl-6">
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
        </ul>
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
