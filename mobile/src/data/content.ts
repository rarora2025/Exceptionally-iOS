import { colors, tint } from '../theme';

// ---- Home ----

export const COMPOSER_CHIPS = ['Take this role?', 'My resume'];

export const GHOSTS = [
  'Should I take the Head of Strategy offer?',
  'Help me answer "what are your strengths?"',
  'What roles fit me that I have not considered?',
];

export const HOME_FASCINATIONS = [
  { title: 'Industries', key: 'domains' },
  { title: 'Day-to-day', key: 'work' },
  { title: 'Environments', key: 'places' },
] as const;

export const PROGRESS_CHECKLIST = [
  { label: 'Invite 3 friends', meta: '3 of 3', done: true },
  { label: 'Add a fascination', meta: '4 added', done: true },
  { label: 'Add your resume', meta: 'Not yet', done: false },
];

// ---- Profile ----
// Three super strengths (from others' interviews) — keyed to artifacts.
export const SUPER_STRENGTHS = [
  { key: 'david', title: 'The one who names the real problem', source: 'David Okonkwo', initials: 'DO', tint: colors.accent },
  { key: 'maya', title: 'The one who finds what matters and what to do next', source: 'Maya Fischer', initials: 'MF', tint: colors.tintBlue },
  { key: 'jen', title: 'The one who makes six weeks fit on two pages', source: 'Jen Alvarez', initials: 'JA', tint: colors.tintPeach },
] as const;

// Two fascinations (from self-interviews) — editable icon + color.
export const SELF_ARTIFACTS = [
  { key: 'daily', title: 'Two days, no meetings', defaultEmoji: '🗓', defaultColor: colors.surfaceSunken },
  { key: 'delegated', title: 'AI agents, three weeks in', defaultEmoji: '🧭', defaultColor: colors.surfaceSunken },
] as const;

export const EMOJI_OPTIONS = ['🧠', '🗜', '🎯', '📈', '🧭', '🔬', '🏁', '🗝', '📚', '⚙'];
export const COLOR_OPTIONS = [colors.surfaceSunken, colors.accent, colors.tintBlue, colors.tintPeach, colors.tintLilac];

// Artifact detail content (what the person saw, story, pull quote).
export const ARTIFACTS: Record<
  string,
  { lens: string; title: string; synthesis: string; saw: string[]; story: string; quote: string; combo: string; author: string; tint: string }
> = {
  david: {
    lens: 'How David sees you',
    title: 'The one who names the real problem',
    synthesis:
      'David describes you as the person who stops a conversation that has stopped moving, writes down what is actually being decided, and gives everyone a shared thing to argue with instead of each other.',
    saw: [
      'You notice circular discussion earlier than other people do.',
      'You write the problem down before anyone proposes a solution.',
      'You make the unknown explicit rather than deciding around it.',
      'You leave people with one clear next step.',
    ],
    story:
      'A roadmap thread had been running for four days across two features. Instead of calling a meeting, you posted one paragraph describing what the team did not yet know. The thread stopped, and the group ran a week of research rather than shipping the wrong feature.',
    quote:
      'They were three replies deep into solutions and nobody had said out loud what we were solving. Noah wrote the problem on the board. The room went quiet, then started somewhere else.',
    combo: 'Pattern recognition × Restraint × Plain language',
    author: 'David Okonkwo',
    tint: colors.accent,
  },
  maya: {
    lens: 'How Maya sees you',
    title: 'The one who finds what matters and what to do next',
    synthesis:
      'Maya describes you as someone who sees the real problem inside a confusing situation, reorganises it around what matters, and builds a practical path to a decision.',
    saw: [
      'You identify the underlying issue rather than the surface symptom.',
      'You give complicated situations a structure other people can follow.',
      'You do not stop at analysis, you propose a way forward.',
      'You help the group actually act on it.',
    ],
    story:
      'At a launch review, three teams each had a different explanation for why the launch was slipping. You mapped what each team was assuming and pointed out that nobody had ever decided who owned pricing. The group left with one scoped test instead of a plan to argue about.',
    quote:
      'You do not just simplify things. You find the version of the problem everyone should have been discussing, and then you show us what to do about it.',
    combo: 'Diagnosis × Structure × Follow-through',
    author: 'Maya Fischer',
    tint: colors.tintBlue,
  },
  jen: {
    lens: 'How Jen sees you',
    title: 'The one who makes six weeks fit on two pages',
    synthesis:
      'Jen describes you as the person who writes the short document that ends a long dispute, and leaves it for people to read rather than presenting it.',
    saw: [
      'You compress weeks of debate into a page people actually read.',
      'You write the thing that settles the argument.',
      'You let the document do the persuading.',
      'You make the decision legible to everyone at once.',
    ],
    story:
      'Six weeks of pricing debate had gone in circles. You wrote a two-page one-pager, dropped it in the channel, and left. The argument closed by the next morning.',
    quote:
      'He did not even present it. He just left it in the channel. Nobody argued with it, which never happens.',
    combo: 'Synthesis × Written clarity × Restraint',
    author: 'Jen Alvarez',
    tint: colors.tintPeach,
  },
  daily: {
    lens: 'From your own interview',
    title: 'Two days, no meetings',
    synthesis:
      'You do your clearest thinking in long uninterrupted stretches, and the work that drains you is the maintenance that comes after.',
    saw: [
      'You go deep when the calendar is empty.',
      'You lose energy repeating the same explanation.',
      'You prefer making the first version to maintaining it.',
    ],
    story:
      'Two days with no meetings and you untangled a migration nobody had scoped, just by writing down what each team thought they owned.',
    quote: 'The plan wrote itself once I had written down what each team thought they owned.',
    combo: 'Deep focus × Synthesis',
    author: 'Noah',
    tint: colors.surfaceSunken,
  },
  delegated: {
    lens: 'From your own interview',
    title: 'AI agents, three weeks in',
    synthesis:
      'You keep circling the question of who gets to make the call, and when people hand decisions to an agent versus refuse to.',
    saw: [
      'You are drawn to decision rights, not the technology.',
      'You notice where accountability actually lands.',
      'You test your theory against cases that could break it.',
    ],
    story:
      'A support team let an agent write refund decisions but not the apology email. The refund is money. The apology is reputation. They were protecting the thing they would personally answer for.',
    quote: 'Accuracy cannot be what is doing the work. People refuse things the model is measurably better at.',
    combo: 'Decision rights × Accountability',
    author: 'Noah',
    tint: colors.surfaceSunken,
  },
};

// ---- Fascinations ----
export const FASC_BUCKETS = [
  {
    key: 'domains',
    emoji: '🔍',
    tint: colors.accent,
    title: 'Industries & questions',
    latest: 'Technology',
    blurb: 'The domains you are deeply drawn to, and the deeper questions inside them.',
    heading: 'What keeps pulling you back',
    intro: 'The industries and domains you are deeply drawn to, and the questions you keep circling inside them.',
    items: [
      {
        title: 'Technology',
        emoji: '💻',
        tint: colors.tintBlue,
        why: 'You are drawn to how products, systems, and incentives shape human behaviour at scale.',
        points: [
          'Why do some products become habits while others do not?',
          'How do incentives change what people actually do?',
          'Why do some systems compound while others quietly break?',
        ],
        note: 'Answer a few more questions',
      },
      {
        title: 'Markets & finance',
        emoji: '📈',
        tint: colors.tintViolet,
        why: 'You keep returning to how people make decisions under uncertainty, and how incentives drive outcomes.',
        points: [
          'Why do smart people reach different conclusions from the same evidence?',
          'How do incentives distort judgement?',
          'Why do markets become irrational?',
        ],
        note: 'Answer a few more questions',
      },
      {
        title: 'Psychology',
        emoji: '🧠',
        tint: colors.tintAmber,
        why: 'You are fascinated by what drives behaviour: motivation, status, and perception.',
        points: ['Why do people want what they want?', 'How do identity and status shape decisions?', 'Why do some ideas persuade while others do not?'],
        note: 'Go deeper on this pattern',
      },
    ],
  },
  {
    key: 'work',
    emoji: '💼',
    tint: colors.tintBlue,
    title: 'Day-to-day work',
    latest: 'Problem solving',
    blurb: 'The kinds of work you naturally love, and the work that tends to drain you.',
    heading: 'What work pulls you in',
    intro: 'The kinds of day-to-day work you naturally love, and the work that tends to drain you.',
    items: [
      {
        title: 'Problem solving',
        emoji: '🧩',
        tint: colors.tintLime,
        why: 'You love work that begins with ambiguity and rewards sharp thinking, synthesis, and clarity.',
        love: ['Investigating ambiguous problems', 'Finding the core issue', 'Turning ideas into a clear point of view'],
        avoid: ['Maintaining repetitive processes', 'Routine administrative follow-through'],
        note: 'Refine what energises you',
      },
      {
        title: 'Communication & explanation',
        emoji: '🗣',
        tint: colors.tintViolet,
        why: 'You are drawn to work that helps other people understand something important or see it more clearly.',
        love: ['Explaining what matters', 'Framing ideas simply', 'Turning complexity into language people use'],
        avoid: ['Low-value status updates', 'Transactional outreach at volume'],
        note: 'Answer a few more questions',
      },
      {
        title: 'Building & shaping',
        emoji: '🧱',
        tint: colors.tintAmber,
        why: 'You are energised when you can shape direction, create structure, and help something stronger emerge.',
        love: ['Creating the first version', 'Improving a weak system', 'Designing better ways of working'],
        avoid: ['Owning stable maintenance forever', 'Work with little room for judgement'],
        note: 'Go deeper on this pattern',
      },
    ],
  },
  {
    key: 'places',
    emoji: '👥',
    tint: colors.tintPeach,
    title: 'Work environments',
    latest: 'High-trust environments',
    blurb: 'The cultures where you expand, and the ones where you shrink.',
    heading: 'Where you love to work',
    intro: 'The cultures and environments you naturally expand in, and the ones that tend to shrink you.',
    items: [
      {
        title: 'High-trust environments',
        emoji: '🤝',
        tint: colors.tintLime,
        why: 'You do your best work where people are candid, thoughtful, and able to name what is actually going on.',
        love: ['High trust', 'Thoughtful candour', 'Clear reasoning'],
        avoid: ['Office politics', 'Hidden agendas'],
        note: 'Refine the cultures that fit',
      },
      {
        title: 'Autonomy & room to think',
        emoji: '💡',
        tint: colors.tintBlue,
        why: 'You are drawn to environments where you can think independently, shape the path, and exercise judgement.',
        love: ['Autonomy', 'Space to think', 'Ownership with trust'],
        avoid: ['Micromanagement', 'Needless process'],
        note: 'Answer a few more questions',
      },
      {
        title: 'Substance over theatre',
        emoji: '⚖',
        tint: colors.tintViolet,
        why: 'You prefer cultures that care more about the quality of the thinking than about appearances.',
        love: ['Serious, thoughtful peers', 'Real problem solving', 'Calm intensity'],
        avoid: ['Performative urgency', 'Low-trust cultures'],
        note: 'Go deeper on this pattern',
      },
    ],
  },
] as const;

export const FASC_QUESTIONS = [
  { q: 'How did you first fall into this, and what made you keep going after the first hour?', canned: 'A colleague forwarded me a thread about teams handing work to agents. The technical part was boring. What kept me reading was that two teams with the same tool made completely opposite calls about what to let it do.' },
  { q: 'What is the most common explanation for it, and where does that explanation break down for you?', canned: 'Everyone says it comes down to trust or accuracy. But people hand over things the model is measurably worse at, and refuse things it is measurably better at. Accuracy cannot be what is doing the work.' },
  { q: 'Give me the specific case that made you change your mind about it.', canned: 'A support team let an agent write refund decisions but not the apology email. The refund is money. The apology is reputation. They were protecting the thing they would personally have to answer for.' },
  { q: 'What would you have to see to conclude you are wrong?', canned: 'If teams with no individual accountability delegated exactly the same way as teams with named owners, my whole theory falls apart.' },
  { q: 'Where else in your life does this same question show up?', canned: 'Everywhere, honestly. Who signs off. Who takes the blame when it goes wrong.' },
];

// ---- Tools ----
export const TOOL_GOALS = [
  { key: 'discover', label: 'Figuring out what I could do', sub: 'No target role yet. Show me what fits.' },
  { key: 'apply', label: 'Going after a specific role', sub: 'I have something in mind and want to land it.' },
  { key: 'stuck', label: 'Something is off where I am', sub: 'Employed, but it is not using what I am good at.' },
] as const;

export const TOOL_STEPS = ['Reading your artifacts…', 'Weighing what people saw…', 'Matching against the market…', 'Ranking by fit…'];

export type Tool = {
  key: string;
  name: string;
  category: string;
  goals: string[];
  runLabel: string;
  blurb: string;
  chatPrompt: string;
  inputs: string[];
  resultLabel: string;
  why: string;
  needs?: 'paste' | 'role' | 'horizon';
  rows: { title: string; note: string; tag: string }[];
};

export const TOOLS: Tool[] = [
  {
    key: 'hidden', name: 'Hidden role finder', category: 'Discover', goals: ['discover', 'stuck'], runLabel: 'Find my roles',
    blurb: 'Job titles your evidence supports, including ones outside your industry.',
    chatPrompt: 'Which of these roles should I take seriously, and which are a stretch?',
    inputs: ['5 artifacts', 'Super strengths', 'Fascinations'], resultLabel: 'Ranked by fit',
    why: 'Every title here leans on the same pattern three people described independently: you name the decision a group has not made, and you do it in writing.',
    rows: [
      { title: 'Strategy & Operations Lead', note: 'Ambiguous mandate, written artifacts, exec exposure.', tag: '94' },
      { title: 'Founding PM, early stage', note: 'Nobody has framed the problem yet. That is the job.', tag: '91' },
      { title: 'Policy design, public sector', note: 'Decision rights are the entire domain.', tag: '86' },
      { title: 'Internal comms, technical org', note: 'Uses the writing, wastes the diagnosis.', tag: '71' },
    ],
  },
  {
    key: 'translate', name: 'Transferable skills translator', category: 'Discover', goals: ['discover', 'stuck'], runLabel: 'Extract my skills',
    blurb: 'Every skill your artifacts prove, matched to industries and departments that pay for it.',
    chatPrompt: 'How do I talk about these skills without sounding generic?',
    inputs: ['5 artifacts', 'Interview quotes'], resultLabel: 'Proven, not claimed',
    why: 'These are drawn from what people watched you do, not from a self-assessment.',
    rows: [
      { title: 'Framing an undecided problem', note: 'Consulting, product, policy, founding teams.', tag: 'Strong' },
      { title: 'Written decision-making', note: 'Any org that runs on documents rather than meetings.', tag: 'Strong' },
      { title: 'Locating authority', note: 'Governance, ops design, programme leadership.', tag: 'Strong' },
      { title: 'Sustained self-directed research', note: 'Research, strategy, analyst roles.', tag: 'Emerging' },
    ],
  },
  {
    key: 'gap', name: 'Qualification gap analyzer', category: 'Apply', goals: ['apply'], needs: 'paste', runLabel: 'Compare against my evidence',
    blurb: 'Drop in a job link and see what you already meet, what is partial, and what is missing.',
    chatPrompt: 'How do I handle the gaps in this role without lying about them?',
    inputs: ['Target role', '5 artifacts'], resultLabel: 'Against Head of Strategy, Northwind',
    why: 'Two gaps are real and one is cosmetic. The budget line can be answered with the pricing one-pager story.',
    rows: [
      { title: 'Cross-functional influence', note: 'Covered. The launch review is the exact proof.', tag: 'Met' },
      { title: 'Written strategy artifacts', note: 'Covered twice over.', tag: 'Met' },
      { title: 'Owning a budget line', note: 'Partial. You shaped pricing, never owned the number.', tag: 'Partial' },
      { title: 'People management', note: 'Missing. Nothing in your evidence shows direct reports.', tag: 'Gap' },
    ],
  },
  {
    key: 'pivot', name: 'Career pivot mapper', category: 'Discover', goals: ['stuck'], needs: 'horizon', runLabel: 'Map my pivots',
    blurb: 'Five realistic pivots, each with what carries over, what is missing, and a first month.',
    chatPrompt: 'Which of these pivots actually fits what I am good at?',
    inputs: ['Super strengths', 'Fascinations'], resultLabel: 'Five paths',
    why: 'Your fascination artifacts point at authority and accountability, so paths that make that the subject rank highest.',
    rows: [
      { title: 'Product → Strategy & Ops', note: 'Carries everything. 30 days: two written teardowns.', tag: 'Now' },
      { title: 'Product → AI governance', note: 'Your agent research is the entry ticket.', tag: '6 mo' },
      { title: 'Product → Policy design', note: 'Slower, unusually good fit for the pattern.', tag: '12 mo' },
      { title: 'Product → Founding team', note: 'Highest variance, highest use of the strength.', tag: 'Now' },
    ],
  },
  {
    key: 'industry', name: 'Best-fit industry scanner', category: 'Discover', goals: ['discover'], runLabel: 'Scan industries',
    blurb: 'Industries where this pattern is scarce, ranked by demand, pay, and how easily you enter.',
    chatPrompt: 'Why would these industries value me more than the one I am in?',
    inputs: ['5 artifacts', 'Career goal'], resultLabel: 'Ranked by entry ease',
    why: 'Scarcity matters more than interest here. These are places where nobody is doing the framing work.',
    rows: [
      { title: 'Climate infrastructure', note: 'Chronic decision-rights problems, few people naming them.', tag: 'High' },
      { title: 'Healthtech operations', note: 'Well paid, slow moving, values written clarity.', tag: 'High' },
      { title: 'AI tooling', note: 'Crowded, but your fascination work differentiates.', tag: 'Medium' },
      { title: 'Public sector delivery', note: 'Lower pay, strongest use of the strength.', tag: 'Medium' },
    ],
  },
  {
    key: 'resume', name: 'Positioning rewriter', category: 'Apply', goals: ['apply', 'stuck'], needs: 'role', runLabel: 'Rewrite for this role',
    blurb: 'Rewrites your summary and bullets for a target role using your real evidence, nothing invented.',
    chatPrompt: 'Tighten these bullets and tell me what is still weak.',
    inputs: ['Target role', 'Interview quotes'], resultLabel: 'Suggested rewrites',
    why: 'Each line traces to a specific artifact, so you can defend all of it in an interview.',
    rows: [
      { title: 'Summary', note: 'Leads with framing undecided problems, not with tools.', tag: 'Draft' },
      { title: 'Bullet: launch review', note: 'Three teams, one scoped test, one week.', tag: 'Draft' },
      { title: 'Bullet: pricing one-pager', note: 'Six weeks of debate closed by two pages.', tag: 'Draft' },
      { title: 'Cut', note: 'Two tool-list bullets that prove nothing about you.', tag: 'Cut' },
    ],
  },
];

export const tagBg = (tag: string): string => (['Gap', 'Cut', 'Partial'].includes(tag) ? colors.surfaceSunken : colors.accent);

export { tint };
