export interface NavItem {
  id: string;
  label: string;
  desc: string;
  tag: string;
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface RadarStat {
  stat: string;
  value: number;
  label: string;
}

export interface EducationItem {
  institution: string;
  degree: string;
  duration: string;
  cgpa: string;
}

export interface ExperienceItem {
  rank: number;
  role: string;
  company: string;
  period: string;
  location: string;
  description: string[];
  technologies: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  event: string;
  category: string;
  description: string[];
  tags: string[];
  githubUrl: string;
  demoUrl?: string;
  featured: boolean;
}

export interface AchievementItem {
  title: string;
  category: string;
  details: string;
  certId?: string;
}

export interface ExtracurricularItem {
  title: string;
  role: string;
  description: string;
}

export const personalInfo = {
  name: "Aryan",
  alias: "ARYAN",
  role: "Computer Science Student & Developer",
  college: "Indian Institute of Information Technology, Sonepat",
  degree: "B.Tech — Computer Science & Engineering",
  year: "2nd Year",
  cgpa: "8.35 / 10",
  headline: "Computer Science Student & Developer",
  supportingText:
    "I'm a Computer Science student at IIIT Sonepat who enjoys turning ideas into practical software. I'm passionate about building products, exploring AI and modern web technologies, and solving real-world problems through code.",
  about:
    "I'm Aryan, a second-year Computer Science Engineering student at IIIT Sonepat, currently exploring the intersection of software development, artificial intelligence, and problem solving.\n\nI enjoy building things from the ground up — from AI-powered applications and real-time platforms to solutions developed during hackathons. I like learning by experimenting, breaking down complex problems, and turning ideas into working products.\n\nI'm currently focused on strengthening my foundations in computer science while exploring modern technologies and building projects that challenge me to think beyond the classroom.",
  location: "Sonipat, India",
  email: "sarojdharan86@gmail.com",
  github: "https://github.com/Aryan86-tech",
  linkedin: "https://linkedin.com/in/aryan-319727382",
  resumeUrl: "/resume/Aryan_Resume.pdf",
};

export const navigationItems: NavItem[] = [
  { id: "persona", label: "PeRSoNA", desc: "About Aryan & Mission", tag: "PROFILE" },
  { id: "education", label: "ACaDeMY", desc: "IIIT Sonepat & Degree", tag: "EDUCATION" },
  { id: "skills", label: "SKiLL", desc: "Skills & Star Chart", tag: "TECH MATRIX" },
  { id: "projects", label: "EQUiP", desc: "Hackathon Arsenal & Projects", tag: "WEAPONS" },
  { id: "experience", label: "CoNFiDaNT", desc: "CoGrad Trainer & Ranks", tag: "EXPERIENCE" },
  { id: "achievements", label: "STaTS", desc: "Hackathons & Excellence", tag: "HONORS" },
  { id: "extracurricular", label: "ITeM", desc: "Volleyball & Orchestrixx", tag: "ACTIVITIES" },
  { id: "contact", label: "GUaRD", desc: "Direct Channel & Connect", tag: "MESSAGE" },
];

export const educationData: EducationItem = {
  institution: "Indian Institute of Information Technology, Sonepat",
  degree: "B.Tech — Computer Science & Engineering",
  duration: "Sep 2025 — Present",
  cgpa: "8.35 / 10",
};

export const radarStats: RadarStat[] = [
  { stat: "DSA & ALGOS", value: 85, label: "Advanced" },
  { stat: "FULL STACK", value: 88, label: "Proficient" },
  { stat: "AI & LANGGRAPH", value: 82, label: "Explorer" },
  { stat: "PROBLEM SOLVING", value: 90, label: "Tactician" },
  { stat: "FLUTTER & MOBILE", value: 80, label: "Skilled" },
  { stat: "CS CORE", value: 86, label: "Solid Base" },
];

export const skillCategories: SkillCategory[] = [
  {
    category: "PROGRAMMING LANGUAGES",
    skills: ["C", "C++", "JavaScript", "HTML5", "CSS3"],
  },
  {
    category: "CORE COMPUTER SCIENCE",
    skills: [
      "Object-Oriented Programming (OOP)",
      "Data Structures & Algorithms (DSA)",
      "Database Management Systems (DBMS)",
      "File Handling",
      "Problem Solving",
    ],
  },
  {
    category: "DEVELOPMENT FRAMEWORKS",
    skills: ["React", "Next.js", "Node.js", "Flutter", "Firebase", "MongoDB", "PostgreSQL"],
  },
  {
    category: "AI & DEV TOOLS",
    skills: ["LangGraph", "PyTorch", "Git", "GitHub", "VS Code"],
  },
];

export const experienceData: ExperienceItem[] = [
  {
    rank: 10,
    role: "Assistant Trainer",
    company: "CoGrad",
    period: "2026 — Present",
    location: "India",
    description: [
      "Supported technology-focused training programs and assisted participants during hands-on learning sessions involving digital tools, AI-assisted workflows and STEM technologies.",
      "Worked alongside trainers to facilitate practical activities, troubleshoot technical issues and help participants translate concepts into hands-on implementations.",
    ],
    technologies: ["Digital Tools", "AI Workflows", "STEM Technologies", "Technical Mentorship"],
  },
];

export const projectsData: ProjectItem[] = [
  {
    id: "proj-1",
    title: "Process Automation Copilot",
    subtitle: "AI-Guided Industrial Safety Assistant",
    event: "CUKCS-AITHON 2026",
    category: "AI / Industrial Safety",
    description: [
      "Designed a real-time operator-guidance system that walks users through safety-critical workflows to reduce manual-error risk.",
      "Built a safety-validation module that flags unsafe actions against a compliant-action ruleset.",
      "Owned the system architecture and led the MVP presentation to the judging panel.",
    ],
    tags: ["React", "Flutter", "Node.js", "LangGraph", "IoT APIs"],
    githubUrl: "https://github.com/Aryan86-tech",
    featured: true,
  },
  {
    id: "proj-2",
    title: "Orchestrixx",
    subtitle: "AI-Powered Sports Fan Engagement Platform",
    event: "Synapse.AI Hackathon — DTU",
    category: "AI / Sports Tech",
    description: [
      "Built a real-time platform for fans to make tactical predictions during live sporting events.",
      "Designed an Elo-based ranking and leaderboard system to drive competitive engagement.",
      "Presented the solution architecture and product concept to a judging panel.",
    ],
    tags: ["React", "Next.js", "Node.js", "MongoDB", "Firebase", "Python"],
    githubUrl: "https://github.com/Aryan86-tech",
    featured: true,
  },
  {
    id: "proj-3",
    title: "FixIt Fellows",
    subtitle: "Crowdsourced Civic Issue Resolution System",
    event: "Smart India Hackathon 2025",
    category: "Civic Tech / Geo Tracking",
    description: [
      "Designed a civic-issue reporting platform enabling geo-tagged complaints with real-time status tracking.",
      "Implemented automated issue-routing logic to improve municipal response efficiency.",
      "Led technical architecture discussions and the final project presentation.",
    ],
    tags: ["Flutter", "React.js", "Node.js", "PostgreSQL", "Firebase"],
    githubUrl: "https://github.com/Aryan86-tech",
    featured: true,
  },
];

export const achievementsData: AchievementItem[] = [
  {
    title: "Certificate of Academic Excellence",
    category: "ACADEMIC EXCELLENCE",
    details: "Awarded by Indian Institute of Information Technology, Sonepat for outstanding academic performance (CGPA 8.35/10).",
    certId: "IIITS/CERT/2026/001",
  },
  {
    title: "CUKCS-AITHON 2026 Hackathon",
    category: "HACKATHON PARTICIPATION",
    details: "Designed and presented Process Automation Copilot — an AI-guided industrial safety guidance system.",
  },
  {
    title: "Synapse.AI Hackathon — DTU",
    category: "HACKATHON PARTICIPATION",
    details: "Built Orchestrixx — an AI-powered sports fan prediction and Elo leaderboard engagement platform.",
  },
  {
    title: "Smart India Hackathon 2025",
    category: "NATIONAL HACKATHON",
    details: "Architected FixIt Fellows — a crowdsourced civic issue resolution platform with geo-tagged complaints.",
  },
];

export const extracurricularData: ExtracurricularItem[] = [
  {
    title: "IIT Delhi Volleyball Championship",
    role: "Team Captain / Leader",
    description: "Led the IIIT Sonepat volleyball team during the IIT Delhi Volleyball Championship.",
  },
  {
    title: "Team Orchestrixx",
    role: "Active Innovation Member",
    description: "Active member of Team Orchestrixx at IIIT Sonepat, contributing to collaborative hackathon and innovation activities.",
  },
];

export const statsData = {
  cgpa: "8.35 / 10",
  hackathonsCount: "3",
  projectsCount: "3",
  collegeYear: "2nd Year CSE",
  githubProfile: "Aryan86-tech",
};
