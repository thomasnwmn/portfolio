import Image from 'next/image';
import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import portrait from '@/public/aboutme.png';
import TechTags from '@/components/TechTags';
import { ActivityHeatmap } from '@/components/arc/activity-heatmap/activity-heatmap';
import { getContributions, GITHUB_USERNAME } from '@/lib/github';

export const metadata: Metadata = { title: 'About · Thomas Newman' };

const experience = [
  { role: 'Computer Engineering, third year', place: 'Lassonde School of Engineering, York University', when: 'In progress' },
  { role: 'Outreach Programs Instructor', place: 'University of Toronto', when: 'Summers 2025 and 2026' },
  { role: 'Depth Correction Officer', place: 'GeologicAI', when: '2023 to 2024', detail: 'Worked with geological data and AI tools.' },
];

const toolkit = [
  { group: 'Languages', tags: ['C/C++', 'Python', 'Java', 'TypeScript'] },
  { group: 'Hardware and systems', tags: ['RISC-V', 'Digital Logic Design', 'System Architecture'] },
  { group: 'Web and tools', tags: ['Next.js', 'Tailwind CSS', 'Node.js', 'Git'] },
];

export default async function About() {
  const contributions = await getContributions();

  return (
    <div className="page-shell about-page">
      <section className="about-intro" aria-labelledby="about-title">
        <div className="about-copy">
          <h1 id="about-title" className="page-title">About <span className="text-chrome-hi/60">me.</span></h1>
          <div className="about-bio">
            <p>
              I’m a third-year Computer Engineering student at the Lassonde School of Engineering at York University, with a passion for RISC-V and system design. I work across Python, C/C++, Java, and TypeScript.
            </p>
            <p>
              My approach focuses on engineering excellence and practical solutions. I believe that powerful systems require a deeply considered architecture underneath.
            </p>
          </div>
        </div>
        <Image src={portrait} alt="Thomas Newman in front of Niagara Falls" placeholder="blur" loading="eager" fetchPriority="high" sizes="(max-width: 900px) 100vw, 40vw" className="about-portrait" />
        <section className="about-activity" aria-labelledby="activity">
          <div className="about-heading-row">
            <h2 id="activity" className="about-subheading">GitHub activity</h2>
            <a className="text-link inline-flex items-center gap-1" href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noreferrer">
              View profile <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
            </a>
          </div>
          {contributions
            ? <ActivityHeatmap days={contributions.days} label="GitHub contributions in the last year" period="the last year" />
            : <p className="text-paper-1">Activity couldn’t load right now. The full history is on GitHub.</p>}
        </section>
      </section>

      <section className="about-section" aria-labelledby="experience">
        <h2 id="experience" className="about-heading">Experience</h2>
        <ol className="experience-list">
          {experience.map(item => (
            <li key={item.role} className="experience-row">
              <div className="min-w-0">
                <h3 className="experience-role">{item.role}</h3>
                <p className="experience-place">{item.place}</p>
                {item.detail && <p className="experience-detail">{item.detail}</p>}
              </div>
              <p className="experience-when">{item.when}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="toolkit" aria-labelledby="toolkit">
        <h2 id="toolkit" className="about-heading">Toolkit</h2>
        <dl className="toolkit-grid">
          {toolkit.map(({ group, tags }) => (
            <div key={group} className="toolkit-group">
              <dt>{group}</dt>
              <dd><TechTags tags={tags} /></dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
