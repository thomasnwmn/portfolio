// Define interfaces for all the content types
export interface Project {
  id: string;
  name: string;
  techStack: string[];
  roleAndImpact: string;
  architectureDecisions: string;
  links: {
    demo?: string;
    github?: string;
    caseStudy?: string;
  };
}

export interface WorkRole {
  id: string;
  company: string;
  title: string;
  dates: string;
  responsibilities: string[];
  achievements: string[];
}

export interface SkillCategory {
  id: string;
  categoryName: string;
  skills: string[];
}

export interface ProfileData {
  name: string;
  title: string;
  bio: string;
  contact: {
    email: string;
    linkedin: string;
    twitter: string;
    github: string;
  };
}

// User: Fill in the placeholder data below

export const projects: Project[] = [
  {
    id: "proj-1",
    name: "[Project 1 Name]",
    techStack: ["[Tech 1]", "[Tech 2]"],
    roleAndImpact: "[Describe your role and impact, e.g., 'Reduced load time by 40%']",
    architectureDecisions: "[Key architecture decisions made]",
    links: {
      demo: "https://example.com",
      github: "https://github.com",
    },
  },
  {
    id: "proj-2",
    name: "[Project 2 Name]",
    techStack: ["[Tech 1]", "[Tech 2]"],
    roleAndImpact: "[Describe your role and impact]",
    architectureDecisions: "[Key architecture decisions made]",
    links: {
      demo: "https://example.com",
      github: "https://github.com",
    },
  },
];

export const workHistory: WorkRole[] = [
  {
    id: "role-1",
    company: "[Company Name]",
    title: "[Your Job Title]",
    dates: "[Start Date] - [End Date]",
    responsibilities: [
      "[Responsibility 1]",
      "[Responsibility 2]",
    ],
    achievements: [
      "[Key Achievement 1]",
      "[Key Achievement 2]",
    ],
  },
];

export const skillsData: SkillCategory[] = [
  {
    id: "cat-frontend",
    categoryName: "Frontend Engineering",
    skills: ["[Skill 1]", "[Skill 2]", "[Skill 3]"],
  },
  {
    id: "cat-backend",
    categoryName: "Backend & Systems",
    skills: ["[Skill 1]", "[Skill 2]"],
  },
];

export const profileInfo: ProfileData = {
  name: "[Your Full Name]",
  title: "[Your Professional Title, e.g., Creative Technologist]",
  bio: "[A 1-2 sentence pitch defining your unique value as an engineer/creative]",
  contact: {
    email: "hello@example.com",
    linkedin: "https://linkedin.com/in/yourprofile",
    twitter: "https://twitter.com/yourhandle",
    github: "https://github.com/yourhandle",
  },
};
