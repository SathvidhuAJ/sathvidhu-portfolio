const PROJECTS = [
  {
    "name": "Smart Study Planner",
    "category": "Full Stack",
    "type": "Education / Development Project",
    "description": "A PHP study platform with weekly timetables, learning resources and chapter-based mock tests. Some modules require database and schema alignment.",
    "image": "study",
    "technologies": [
      "HTML",
      "CSS",
      "JavaScript",
      "PHP",
      "MySQL",
      "Bootstrap"
    ],
    "problem": "Students need a central place to organize study routines and access course material.",
    "solution": "Student and administrator pages connect schedules, resources and mock tests through PHP and MySQL.",
    "features": [
      "Weekly timetable generation",
      "Student accounts and profiles",
      "Video and PDF resource pages",
      "Chapter-based mock tests",
      "Administrator resource management"
    ],
    "github": "https://github.com/Sathvidhu/Mini-Project",
    "liveDemo": "",
    "featured": true
  },
  {
    "name": "Invoice App",
    "category": "Business Systems",
    "type": "Invoice Management",
    "description": "A PHP and MySQL application for managing clients, itemized invoices, tax, payment status and printable invoice views.",
    "image": "driveflow",
    "technologies": [
      "HTML",
      "CSS",
      "JavaScript",
      "PHP",
      "MySQL",
      "Docker"
    ],
    "problem": "Client details and invoice records need to stay organized together.",
    "solution": "A database-backed dashboard connects clients, invoice line items and payment status.",
    "features": [
      "Client management",
      "Itemized invoices and tax",
      "Draft, unpaid and paid statuses",
      "Invoice editing",
      "Print-friendly invoice views",
      "Docker Compose setup"
    ],
    "github": "https://github.com/Sathvidhu/invoice-app",
    "liveDemo": "",
    "featured": true
  },
  {
    "name": "Todo App",
    "category": "Full Stack",
    "type": "Task Management",
    "description": "A persistent task manager with priorities, due dates, completion tracking and task filters, backed by a PHP API and MySQL.",
    "image": "walleto",
    "technologies": [
      "HTML",
      "CSS",
      "JavaScript",
      "PHP",
      "MySQL",
      "Docker"
    ],
    "problem": "Tasks need persistent storage and clear prioritization.",
    "solution": "A JavaScript interface uses a PHP API to store and update tasks in MySQL.",
    "features": [
      "Task creation and inline editing",
      "Priority and due dates",
      "Completion tracking",
      "Active and overdue filters",
      "Task statistics",
      "Recurring task fields"
    ],
    "github": "https://github.com/Sathvidhu/todo-app",
    "liveDemo": "",
    "featured": true
  },
  {
    "name": "Local Python Chatbot",
    "category": "Python",
    "type": "AI / Learning Experiment",
    "description": "A command-line experiment using Hugging Face Transformers and DistilGPT-2 for local text generation after the model download.",
    "image": "chatbot",
    "technologies": [
      "Python",
      "Hugging Face Transformers",
      "DistilGPT-2"
    ],
    "problem": "Exploring how to run a text-generation model from a Python program.",
    "solution": "A command-line loop sends input to a local Transformers pipeline. This is a learning experiment with limited conversational quality.",
    "features": [
      "Interactive command-line loop",
      "Local model inference",
      "Configurable sampling settings",
      "Quit, exit and bye commands"
    ],
    "github": "https://github.com/Sathvidhu/Chatbot",
    "liveDemo": "",
    "featured": true
  },
  {
    "name": "Personal Website",
    "category": "Web",
    "type": "Early Portfolio",
    "description": "An early personal landing page built with HTML, CSS and JavaScript, featuring a responsive navigation menu, social links and particle effects.",
    "image": "website",
    "technologies": [
      "HTML",
      "CSS",
      "JavaScript",
      "Particles.js"
    ],
    "problem": "Creating a personal introduction and a central place for social profile links.",
    "solution": "A static landing page combines a personal introduction, profile image and interactive particle background.",
    "features": [
      "Personal introduction",
      "Social profile links",
      "Responsive navigation",
      "Interactive particle background"
    ],
    "github": "https://github.com/Sathvidhu/Website",
    "liveDemo": "",
    "featured": true
  }
];

const TECH_STACK = [
  {
    name: 'HTML',
    category: 'Frontend',
    desc: 'Semantic structure & web standards',
    color: '#e34f26',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 3l1.5 17L12 22l6.5-2L20 3H4z"/><path d="M16.5 7.5H7.5l.5 5h8l-.5 5-3.5 1-3.5-1-.2-2.5"/></svg>`
  },
  {
    name: 'CSS',
    category: 'Frontend',
    desc: 'Responsive layouts & animations',
    color: '#264de4',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 3l1.5 17L12 22l6.5-2L20 3H4z"/><path d="M7 7.5h10l-.5 4.5H7.5l.5 5 4 1.2 4-1.2.3-3.3"/></svg>`
  },
  {
    name: 'JavaScript',
    category: 'Frontend',
    desc: 'Dynamic & interactive logic',
    color: '#f7df1e',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M10 16c0 1.1-.9 2-2 2H7v-6h1c1.1 0 2 .9 2 2v2zM14 12v4.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5V14"/></svg>`
  },
  {
    name: 'React',
    category: 'Frontend',
    desc: 'Component-driven user interfaces',
    color: '#61dafb',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="9" ry="3.5"/><ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>`
  },
  {
    name: 'Next.js',
    category: 'Frontend',
    desc: 'Full-stack React & SSR apps',
    color: '#ffffff',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 8v8l7-9.5"/><path d="M15 12.5v3.5"/></svg>`
  },
  {
    name: 'Bootstrap',
    category: 'Frontend',
    desc: 'Rapid responsive UI framing',
    color: '#7952b3',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h7a4 4 0 0 1 4 4 3.5 3.5 0 0 1-2.5 3.4A4 4 0 0 1 18 15.5a4.5 4.5 0 0 1-4.5 4.5H6V4z"/><path d="M10 8h3a1.5 1.5 0 1 1 0 3h-3V8z"/><path d="M10 14h3.5a1.5 1.5 0 1 1 0 3H10v-3z"/></svg>`
  },
  {
    name: 'Node.js',
    category: 'Backend',
    desc: 'Scalable server-side runtime',
    color: '#339933',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l9 5.2v10.4L12 22.8l-9-5.2V7.2L12 2z"/><path d="M12 22.8V12"/><path d="M21 7.2L12 12 3 7.2"/></svg>`
  },
  {
    name: 'Python',
    category: 'Backend',
    desc: 'Backend services & automation',
    color: '#3776ab',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c-4 0-4.5 1.8-4.5 3.5V8h9V6.5C16.5 3.8 15 2 12 2z"/><path d="M12 22c4 0 4.5-1.8 4.5-3.5V16h-9v1.5c0 2.7 1.5 4.5 4.5 4.5z"/><circle cx="9.5" cy="5" r=".7" fill="currentColor"/><circle cx="14.5" cy="19" r=".7" fill="currentColor"/><path d="M7.5 8H5c-2 0-3 1.5-3 3.5s1 3.5 3 3.5h2.5"/><path d="M16.5 8H19c2 0 3 1.5 3 3.5s-1 3.5-3 3.5h-2.5"/></svg>`
  },
  {
    name: 'PHP',
    category: 'Backend',
    desc: 'Dynamic web applications',
    color: '#777bb4',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="10" ry="6"/><path d="M7 10v4M7 10h2a1.5 1.5 0 0 1 0 3H7"/><path d="M12 10v4M12 12h2.5"/><path d="M17 10v4M17 10h2a1.5 1.5 0 0 1 0 3h-2"/></svg>`
  },
  {
    name: 'Dart',
    category: 'Backend',
    desc: 'Multi-platform client & server code',
    color: '#0175c2',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14l5-10h7l4 4-7 12H7l-3-6z"/><path d="M9 4l4 5-3 7"/></svg>`
  },
  {
    name: 'MySQL',
    category: 'Database',
    desc: 'Structured relational storage',
    color: '#00758f',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6"/><path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"/></svg>`
  },
  {
    name: 'PostgreSQL',
    category: 'Database',
    desc: 'Advanced open-source SQL database',
    color: '#4169e1',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3C7 3 3 6.1 3 10c0 2.5 1.7 4.7 4.3 5.9L6 20l4.5-2.2c.5.1 1 .2 1.5.2 5 0 9-3.1 9-7s-4-7-9-7z"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/><circle cx="15" cy="9" r="1.2" fill="currentColor"/></svg>`
  },
  {
    name: 'Supabase',
    category: 'Database',
    desc: 'Backend-as-a-service & Postgres',
    color: '#3ecf8e',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 2L3 13.5h7.5L9 22l12-11.5h-7.5L13.5 2z"/></svg>`
  },
  {
    name: 'Firebase',
    category: 'Database',
    desc: 'Realtime database & cloud tools',
    color: '#ffca28',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18l4.5-14.5 3.5 6L4 18z"/><path d="M12 9.5l2.5-3 5.5 11.5L12 9.5z"/><path d="M4 18l8 4 8-4-8-15-8 15z"/></svg>`
  },
  {
    name: 'Flutter',
    category: 'Mobile & Cloud',
    desc: 'Cross-platform native mobile apps',
    color: '#54c5f8',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3.5L6.5 11 14 18.5"/><path d="M14 11.5L10 15.5l4 4h5.5l-4-4 4-4H14z"/></svg>`
  },
  {
    name: 'Docker',
    category: 'Mobile & Cloud',
    desc: 'Containerized application environments',
    color: '#2496ed',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="3" height="3" rx=".5"/><rect x="7" y="11" width="3" height="3" rx=".5"/><rect x="11" y="11" width="3" height="3" rx=".5"/><rect x="7" y="7" width="3" height="3" rx=".5"/><rect x="11" y="7" width="3" height="3" rx=".5"/><rect x="11" y="3" width="3" height="3" rx=".5"/><path d="M2 15c1 3 4 5 10 5s9-2 10-5c-1-1-3-2-5-1-1 0-2-1-3-2H5c-1 1-2 2-3 3z"/></svg>`
  },
  {
    name: 'Git',
    category: 'Tools',
    desc: 'Distributed version control',
    color: '#f05032',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M12 8v4a4 4 0 0 1-4 4H6"/><path d="M12 12a4 4 0 0 0 4 4h2"/></svg>`
  },
  {
    name: 'GitHub',
    category: 'Tools',
    desc: 'Code hosting & collaboration',
    color: '#e6edf3',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`
  },
  {
    name: 'JSON',
    category: 'Tools',
    desc: 'Structured data exchange format',
    color: '#6ea8ff',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H6a2 2 0 0 0-2 2v3a2 2 0 0 1-2 2 2 2 0 0 1 2 2v3a2 2 0 0 0 2 2h2"/><path d="M16 3h2a2 2 0 0 1 2 2v3a2 2 0 0 0 2 2 2 2 0 0 0-2 2v3a2 2 0 0 1-2 2h-2"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>`
  }
];