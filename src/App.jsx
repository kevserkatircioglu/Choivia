import { useEffect, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ClipboardList,
  ChevronRight,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  RotateCcw,
  Settings2,
  Sparkles,
  UserRound,
  Download,
  Upload,
  Trash2,
  Sprout,
  Target,
  Leaf,
  Clock3,
  CalendarDays,
  BookMarked,
  
} from 'lucide-react'
import {
  Link,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { buildPreferencesFromAnswers } from './utils/personalization.js'
import PreferencesQuiz from './pages/PreferencesQuiz.jsx'
import PreferencesResult from './pages/PreferencesResult.jsx'
import StudyMode from './pages/StudyMode.jsx'
import JobComparison from './pages/JobComparison.jsx'
import './App.css'
import './choivia-extra.css'
import AuthScreen from './components/AuthScreen.jsx'
import AppBar from './components/AppBar.jsx'
import Logo from './components/Logo.jsx'
import PageBanner from './components/PageBanner.jsx'
import ProfileSetup from './components/ProfileSetup.jsx'
import WateringOverlay from './components/WateringOverlay.jsx'
import Planner from './pages/Planner.jsx'
import Books from './pages/Books.jsx'
import BottomNav from './components/BottomNav.jsx'
import SaplingTransition from './components/SaplingTransition.jsx'
import ScenicHero from './components/ScenicHero.jsx'
import { Avatar, AvatarPicker } from './components/Avatar.jsx'
import { AUTH_STORAGE_KEY, SESSION_STORAGE_KEY, readAccounts } from './lib/auth.js'
import { dayKey, markWatered, touchStreak } from './utils/streak.js'
import { AVATARS } from './data/avatars.js'

const STORAGE_KEY = 'choivia:v1'


const defaultPreferences = {
  explanation: 'detailed',
  layout: 'overview',
  reminders: true,
}

const defaultCompleted = {
  internship: ['requirements', 'deadline', 'cv'],
  courses: ['degree', 'schedule'],
  jobs: [],
  documents: [],
}

const guides = [
  {
    id: 'internship',
    title: 'Internship application',
    category: 'CAREER',
    summary: 'Prepare your documents and move towards your next opportunity.',
    icon: BriefcaseBusiness,
    tone: 'sage',
    duration: '25–35 min',
    steps: [
      { id: 'requirements', title: 'Confirm internship requirements', description: 'Check your department’s official internship rules and eligibility requirements.' },
      { id: 'deadline', title: 'Check important dates', description: 'Confirm application deadlines and the dates of your planned internship.' },
      { id: 'cv', title: 'Prepare your CV', description: 'Update your contact details, education, skills and relevant experience.' },
      { id: 'transcript', title: 'Gather required documents', description: 'Check whether a transcript, student certificate or other document is needed.' },
      { id: 'coordinator', title: 'Contact your internship coordinator', description: 'Ask about any department-specific requirements.', required: false },
      { id: 'submit', title: 'Submit your application', description: 'Review the information and submit everything through the official channel.', dependsOn: ['cv', 'transcript'] },
      { id: 'confirmation', title: 'Save the confirmation', description: 'Keep the application receipt or confirmation email for your records.', dependsOn: ['submit'] },
    ],
  },
  {
    id: 'courses',
    title: 'Course registration',
    category: 'ACADEMICS',
    summary: 'Organize your course choices before completing registration.',
    icon: GraduationCap,
    tone: 'lilac',
    duration: '15–25 min',
    steps: [
      { id: 'degree', title: 'Review degree requirements', description: 'Check your curriculum and the courses you still need to complete.' },
      { id: 'schedule', title: 'Check the course schedule', description: 'Review course times and look for timetable conflicts.' },
      { id: 'prerequisites', title: 'Confirm prerequisites', description: 'Check that you meet the prerequisites for your selected courses.' },
      { id: 'shortlist', title: 'Choose your courses', description: 'Create a shortlist that fits your academic plan.' },
      { id: 'credits', title: 'Review your credit load', description: 'Confirm your total credits and any relevant registration limits.' },
      { id: 'register', title: 'Complete registration', description: 'Submit your final choices and keep a copy of the confirmation.' },
    ],
  },
  {
    id: 'jobs',
    title: 'Job application',
    category: 'CAREER',
    summary: 'Keep the important parts of your job application in one place.',
    icon: BookOpen,
    tone: 'peach',
    duration: '20–30 min',
    steps: [
      {
		
				id: 'role',
				title: 'Define your target role',
				description: 'Identify the positions that match your skills, interests and career goals.',
				details: 'Before applying, define what kind of role you are looking for. Analyse job descriptions and identify the qualifications, technical skills and responsibilities employers expect.',
				actions: [
					'Choose your target job title (e.g. Software Engineer, Frontend Developer).',
					'Identify your preferred industry and company type.',
					'Review at least two relevant job descriptions.',
					'List the technical skills and qualifications employers require.',
					'Compare the requirements with your current skills.',
					'Identify the skills you need to improve.',
				],
			},
      { 
				id: 'cv',
			  title: 'Tailor your CV',
				description: 'Create a professional CV that highlights your most relevant skills and experience.',
				details: 'Your CV should demonstrate why you are suitable for the selected position. Adapt your skills, projects, education and experience to the requirements of each job. Use clear formatting and concise descriptions.',
        actions: [
          'Add your contact information and professional profile.',
          'Include your education and relevant academic background.',
          'Highlight programming languages, frameworks and technical skills.',
          'Add relevant projects and explain your contributions.',
          'Include internships, work experience and certifications.',
          'Use keywords from the job description where accurate.',
          'Check spelling, grammar and formatting.',
          'Save your final CV as a PDF.',
        ],
			},
      { 
				id: 'letter',
				title: 'Prepare supporting materials', 
				description: 'Prepare a tailored cover letter and gather any additional documents requested by the employer.',
				details: 'Supporting materials help employers understand your motivation and suitability. Your cover letter should explain why you are interested in the position and what you can contribute. Include portfolio links and other documents when relevant.',
        actions: [
          'Write a cover letter tailored to the company and position.',
          'Explain why you are interested in the role.',
          'Highlight two or three relevant skills or achievements.',
          'Add your GitHub profile if you have relevant projects.',
          'Prepare your portfolio or personal website if applicable.',
          'Gather transcripts, certificates or references if requested.',
          'Check that all documents are readable and up to date.',
        ],
			},
      { 
				id: 'apply', 
				title: 'Submit your application', 
				description: 'Complete the employer’s application form and submit all required documents.',
				details: 'Use the official company careers page or the application platform specified in the job listing. Carefully review every field before submission and make sure the correct documents are attached.',
        actions: [
          'Open the official job application page.',
          'Read the application instructions carefully.',
          'Enter your personal and contact information.',
          'Complete education and experience sections.',
          'Upload your tailored CV and supporting documents.',
          'Review all answers and attachments.',
          'Submit your application.',
          'Save the confirmation email or application reference.',
        ],
			},
      { 
				id: 'track',
			  title: 'Record the outcome',
			  description: 'Track your application status and organise any follow-up activities.',
				details: 'Keep a record of every application so you can follow its progress. Record the company, position, application date and current status. Update your records when you receive an interview invitation, rejection or offer.',
				actions: [
          'Record the company name and job title.',
          'Save the original job listing URL.',
          'Write down the application submission date.',
          'Set the application status to Submitted.',
          'Record interview dates and important communication.',
          'Set a reminder for an appropriate follow-up date.',
          'Update the status when you receive a response.',
          'Record useful feedback for future applications.',
        ],
			},
    ],
  },
  {
    id: 'documents',
    title: 'Document preparation',
    category: 'ORGANIZATION',
    summary: 'Make sure important documents are ready when you need them.',
    icon: FileText,
    tone: 'blue',
    duration: '10–20 min',
    steps: [
      { id: 'list', title: 'List the required documents', description: 'Use the official instructions to create your document list.' },
      { id: 'validity', title: 'Check validity and dates', description: 'Review expiry dates and any document-specific conditions.' },
      { id: 'copies', title: 'Prepare digital copies', description: 'Create clear, readable files in the requested formats.' },
      { id: 'backup', title: 'Store a backup', description: 'Keep a secure backup and make sure you can find the files later.' },
    ],
  },
]


const detailedGuidance = {
  requirements: 'Check eligibility, required duration, approvals and documents in the latest official department guidance.',
  deadline: 'Write down the application deadline and planned dates. Check whether any approval must happen before the process begins.',
  cv: 'Keep the document readable and up to date. Highlight information relevant to the internship or role without adding unverified claims.',
  transcript: 'Check the requested format and whether the institution requires an official copy. Follow the receiving organisation’s instructions.',
  coordinator: 'Prepare specific questions about requirements, approval and the next action. Verify important answers with the relevant official source.',
  submit: 'Review required fields, file formats and document completeness before submitting through the official channel.',
  confirmation: 'Keep the receipt or confirmation details somewhere easy to find. Note any reference number and follow-up date.',
  degree: 'Compare completed courses with the official curriculum. If a requirement is unclear, confirm it with your academic advisor.',
  schedule: 'Check for overlapping sessions, exam dates and other fixed commitments before finalising your choices.',
  prerequisites: 'Use the official course catalogue to confirm prerequisites and any registration restrictions.',
  shortlist: 'Compare your choices with degree requirements, timetable constraints and learning priorities.',
  credits: 'Check the current credit limits and any approval requirements that apply to your programme.',
  register: 'Review the final selection before submitting. Keep a copy of the registration confirmation and verify the result in the official system.',
  role: 'Identify the main responsibilities and required skills. Note which parts of your experience provide relevant evidence.',
  letter: 'Follow the employer’s instructions and tailor your materials to the role. Check spelling, contact information and requested file formats.',
  apply: 'Check all entries and attachments against the job description before submitting through the employer’s official channel.',
  track: 'Record the application date and expected follow-up. Avoid storing confidential employer information in shared notes.',
  list: 'Use the receiving organisation’s current instructions to identify each required document and any format requirements.',
  validity: 'Check expiry dates, issue dates and whether the receiving organisation requires a recently issued copy.',
  copies: 'Use clear, legible files with descriptive filenames. Follow the requested file type and size limits.',
  backup: 'Store copies in a location you control and can retrieve later. Avoid placing sensitive documents in a public or shared folder.',
}

function loadSavedState(key = STORAGE_KEY) {
  try {
    const saved = localStorage.getItem(key)
    if (!saved) {
      return { completed: defaultCompleted, preferences: defaultPreferences, questionnaire: null }
    }

    const parsed = JSON.parse(saved)
    if (parsed?.version !== 1) {
      return { completed: defaultCompleted, preferences: defaultPreferences, questionnaire: null }
    }

    return {
      completed: { ...defaultCompleted, ...parsed.completed },
      preferences: { ...defaultPreferences, ...parsed.preferences },
      questionnaire: parsed.questionnaire ?? null,
    }
  } catch {
    return { completed: defaultCompleted, preferences: defaultPreferences, questionnaire: null }
  }
}

function getProgress(guide, completedIds = []) {
  const requiredSteps = guide.steps.filter((step) => step.required !== false)
  const done = requiredSteps.filter((step) => completedIds.includes(step.id)).length

  return {
    done,
    total: requiredSteps.length,
    percent: requiredSteps.length ? Math.round((done / requiredSteps.length) * 100) : 0,
  }
}

function ProgressBar({ percent }) {
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-label="Required steps completed"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
    >
      <div className="progress-fill" style={{ width: `${percent}%` }} />
    </div>
  )
}

function Sidebar() {
  const navigation = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/guides', label: 'All guides', icon: ListChecks },
    { to: '/planner', label: 'Daily plan', icon: CalendarDays },
    { to: '/books', label: 'Reading nook', icon: BookMarked },
    { to: '/progress', label: 'My progress', icon: CheckCircle2 },
    { to: '/profile', label: 'Preferences', icon: UserRound },
    { to: '/study', label: 'Usability study', icon: ClipboardList },
  ]

  return (
    <aside className="sidebar">
      <Link to="/" className="brand" aria-label="Choivia home">
        <Logo size={34} />
        <span className="brand-name">choivia</span>
      </Link>

      <div className="sidebar-label">YOUR WORKSPACE</div>
      <nav className="side-nav" aria-label="Main navigation">
        {navigation.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
            {label === 'All guides' && <span className="nav-count">4</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-note-icon"><Sparkles size={17} /></div>
        <p className="sidebar-note-title">Small steps add up.</p>
        <p className="sidebar-note-text">
          You don’t have to do everything today. Just find your next step.
        </p>
        <div className="sidebar-footer">
          <div className="mini-brand-mark">c.</div>
          <div>
            <strong>Choivia</strong>
            <span>Your personal guide</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {action}
    </div>
  )
}

function GuideCard({ guide, completedIds = [] }) {
  const Icon = guide.icon
  const progress = getProgress(guide, completedIds)

  return (
    <Link to={`/guide/${guide.id}`} className="guide-card">
      <div className="guide-card-top">
        <span className={`guide-icon ${guide.tone}`}><Icon size={20} strokeWidth={1.7} /></span>
        <span className="card-arrow"><ArrowUpRight size={18} /></span>
      </div>
      <p className="guide-category">{guide.category}</p>
      <h3>{guide.title}</h3>
      <p className="guide-summary">{guide.summary}</p>
      <div className="guide-card-progress">
        <div className="progress-label">
          <span>{progress.done} of {progress.total} required steps</span>
          <strong>{progress.percent}%</strong>
        </div>
        <ProgressBar percent={progress.percent} />
      </div>
    </Link>
  )
}


function Dashboard({ completed, user, streak }) {
  const totalRequired = guides.reduce(
    (sum, guide) => sum + getProgress(guide, completed[guide.id] || []).total,
    0
  )

  const totalDone = guides.reduce(
    (sum, guide) => sum + getProgress(guide, completed[guide.id] || []).done,
    0
  )

  const started = guides.filter(
    (guide) => (completed[guide.id] || []).length > 0
  ).length

  const overallPercent = totalRequired
    ? Math.round((totalDone / totalRequired) * 100)
    : 0

  const nextGuide =
    guides.find(
      (guide) =>
        getProgress(guide, completed[guide.id] || []).done <
        getProgress(guide, completed[guide.id] || []).total
    ) || guides[0]

  const nextGuideIds = completed[nextGuide.id] || []
  const nextStep = nextGuide.steps.find(
    (step) => step.required !== false && !nextGuideIds.includes(step.id)
  )

  const nextGuideProgress = getProgress(nextGuide, nextGuideIds)

  return (
    <div className="dashboard-page dashboard-v2">
      <header className="dashboard-heading-v2">
        <div>
          <p className="dashboard-overline">
            <span /> YOUR STUDENT LIFE, A LITTLE SIMPLER
          </p>
          <h1>
            Make space for <em>what matters.</em>
          </h1>
          <p className="dashboard-subtitle">
            A calmer way to handle your plans, choices and next steps.
          </p>
        </div>

        <Link to="/profile" className="dashboard-profile-chip">
          <span className="dashboard-profile-avatar"><Avatar id={user?.avatar} size={34} /></span>
          <span>
            <strong>Your space</strong>
            <small>Personalize Choivia</small>
          </span>
          <ArrowUpRight size={16} />
        </Link>
      </header>

      <ScenicHero
        user={user}
        percent={overallPercent}
        done={totalDone}
        total={totalRequired}
        nextTitle={nextStep?.title}
        nextTo={nextStep ? `/guide/${nextGuide.id}` : '/guides'}
        streak={streak}
      />

      <div className="dashboard-content-grid-v2">
        <div className="dashboard-main-column-v2">
          <section className="dashboard-next-card-v2">
            <div className="dashboard-next-topline">
              <div>
                <p className="dashboard-overline muted-overline">
                  PICK UP WHERE YOU LEFT OFF
                </p>
                <h2>Your next little win</h2>
              </div>
              <span className="dashboard-next-index">
                01 <span>/ 04</span>
              </span>
            </div>

            {nextStep ? (
              <>
                <div className="dashboard-next-guide">
                  <span className={`dashboard-next-icon ${nextGuide.tone}`}>
                    <nextGuide.icon size={19} />
                  </span>

                  <span>
                    <small>{nextGuide.category}</small>
                    <strong>{nextGuide.title}</strong>
                  </span>

                  <span className="dashboard-next-duration">
                    <Clock3 size={13} /> {nextGuide.duration}
                  </span>
                </div>

                <div className="dashboard-next-task">
                  <span className="task-number">NEXT STEP</span>
                  <h3>{nextStep.title}</h3>
                  <p>{nextStep.description}</p>
                </div>

                <div className="dashboard-next-bottom">
                  <div className="dashboard-next-track">
                    <span style={{ width: `${nextGuideProgress.percent}%` }} />
                  </div>
                  <strong>{nextGuideProgress.percent}%</strong>
                  <Link
                    to={`/guide/${nextGuide.id}`}
                    aria-label={`Continue ${nextGuide.title}`}
                  >
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </>
            ) : (
              <div className="dashboard-all-done">
                <Sprout size={25} />
                <h3>Your garden is flourishing.</h3>
                <p>
                  All required steps are complete. Choose another guide when you are ready.
                </p>
                <Link to="/guides">
                  Explore guides <ArrowRight size={15} />
                </Link>
              </div>
            )}
          </section>

          <section className="dashboard-guides-v2">
            <div className="dashboard-section-heading-v2">
              <div>
                <p className="dashboard-overline muted-overline">
                  FORMBUDDY · YOUR GUIDE LIBRARY
                </p>
                <h2>What are we working on?</h2>
              </div>
              <Link to="/guides">
                See all <ArrowUpRight size={15} />
              </Link>
            </div>

            <div className="dashboard-guide-grid-v2">
              {guides.map((guide, index) => {
                const progress = getProgress(guide, completed[guide.id] || [])
                const GuideIcon = guide.icon

                return (
                  <Link
                    to={`/guide/${guide.id}`}
                    className={`guide-tile-v2 guide-tile-${index + 1}`}
                    key={guide.id}
                  >
                    <div className="guide-tile-top">
                      <span className={`guide-tile-icon ${guide.tone}`}>
                        <GuideIcon size={22} strokeWidth={1.8} />
                      </span>
                      <ArrowUpRight size={17} className="guide-tile-arrow" />
                    </div>

                    <span className="guide-tile-category">{guide.category}</span>
                    <h3>{guide.title}</h3>
                    <p>{guide.summary}</p>

                    <div className="guide-tile-progress">
                      <span>
                        <i style={{ width: `${progress.percent}%` }} />
                      </span>
                      <strong>{progress.percent}%</strong>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        </div>

        <aside className="dashboard-side-column-v2">
          <section className="dashboard-progress-panel-v2">
            <div className="dashboard-section-heading-v2 compact-heading-v2">
              <div>
                <p className="dashboard-overline muted-overline">YOUR OVERVIEW</p>
                <h2>Growing nicely</h2>
              </div>
              <Sprout size={20} />
            </div>

            <div className="dashboard-progress-ring-row">
              <div
                className="dashboard-progress-ring"
                style={{
                  background: `conic-gradient(#6e9565 ${overallPercent * 3.6}deg, #e9eee3 0deg)`,
                }}
              >
                <div>
                  <strong>{overallPercent}%</strong>
                  <small>complete</small>
                </div>
              </div>

              <div className="dashboard-progress-summary">
                <strong>
                  {totalDone}<span> / {totalRequired}</span>
                </strong>
                <small>steps completed</small>
                <strong>
                  {started}<span> / {guides.length}</span>
                </strong>
                <small>guides started</small>
              </div>
            </div>

            <div className="dashboard-progress-caption">
              <span>Every small step counts.</span>
              <span>{totalRequired ? `${totalRequired - totalDone} left` : 'All done'}</span>
            </div>
          </section>

          <section className="dashboard-decision-panel-v2">
            <span className="decision-panel-orbit decision-panel-orbit-a" />
            <span className="decision-panel-orbit decision-panel-orbit-b" />
            <div className="decision-panel-icon">
              <Target size={23} />
            </div>
            <p className="dashboard-overline decision-overline">
              DECIDEMATE · FIND YOUR FIT
            </p>
            <h2>
              Two options.
              <br />
              <em>One you.</em>
            </h2>
            <p>
              Compare opportunities by the things that matter to you — not just a list of pros and cons.
            </p>
            <Link to="/compare-jobs">
              Make a clearer choice <ArrowUpRight size={16} />
            </Link>
          </section>

          <section className="dashboard-note-panel-v2">
            <span className="note-flower">✳</span>
            <div>
              <strong>A gentle reminder</strong>
              <p>
                You do not have to figure everything out today. Start wherever you are.
              </p>
            </div>
          </section>
        </aside>
      </div>

      <footer className="dashboard-footer-v2">
        <span>Made for the in-between moments of student life.</span>
        <span>
          GROW AT YOUR OWN PACE <Leaf size={13} />
        </span>
      </footer>
    </div>
  )
}

function GuidesPage({ completed }) {
  return (
    <>
      <PageHeading
        eyebrow="YOUR LIBRARY"
        title={<>Find your next <em>step.</em></>}
        description="Choose a guide to turn a multi-step process into a manageable plan."
      />
      <PageBanner kind="guides" />
      <div className="guide-grid guide-grid-page">
        {guides.map((guide) => (
          <GuideCard key={guide.id} guide={guide} completedIds={completed[guide.id] || []} />
        ))}
      </div>
    </>
  )
}

function ProgressPage({ completed, onExport, onImport, onClear, dataMessage }) {
  const totalRequired = guides.reduce(
    (sum, guide) => sum + getProgress(guide, completed[guide.id] || []).total,
    0,
  )
  const totalDone = guides.reduce(
    (sum, guide) => sum + getProgress(guide, completed[guide.id] || []).done,
    0,
  )
  const percentage = totalRequired ? Math.round((totalDone / totalRequired) * 100) : 0

  return (
    <>
      <PageHeading
        eyebrow="EVERY STEP COUNTS"
        title={<>Your progress, <em>at a glance.</em></>}
        description="See what you’ve completed and where you can continue."
      />
      <PageBanner kind="progress" percent={percentage} />
      <section className="data-management" aria-label="Saved data management">
        <div className="data-actions">
          <button className="button button-light" type="button" onClick={onExport}>
            <Download size={16} /> Export backup
          </button>
          <label className="button button-light import-button">
            <Upload size={16} /> Import backup
            <input
              type="file"
              accept=".json,application/json"
              aria-label="Import a Choivia JSON backup"
              onChange={onImport}
            />
          </label>
          <button className="button button-danger" type="button" onClick={onClear}>
            <Trash2 size={16} /> Clear all data
          </button>
        </div>
        {dataMessage && (
          <p className="data-message" role="status" aria-live="polite">
            {dataMessage}
          </p>
        )}
      </section>
      <section className="progress-summary-card">
        <div>
          <p className="eyebrow">OVERALL PROGRESS</p>
          <div className="big-progress-number">{percentage}<span>%</span></div>
          <p className="muted-copy">{totalDone} of {totalRequired} required steps completed across all guides.</p>
        </div>
        <div className="summary-progress-visual">
          <div className="summary-progress-ring" style={{ '--progress': `${percentage}%` }}>
            <div><CheckCircle2 size={27} /><span>{percentage}%</span></div>
          </div>
        </div>
      </section>
      <div className="section-heading progress-list-heading">
        <div><p className="eyebrow">YOUR ACTIVITY</p><h2>Guide-by-guide</h2></div>
      </div>
      <div className="progress-list">
        {guides.map((guide) => {
          const progress = getProgress(guide, completed[guide.id] || [])
          const Icon = guide.icon
          return (
            <Link to={`/guide/${guide.id}`} className="progress-row" key={guide.id}>
              <span className={`guide-icon ${guide.tone}`}><Icon size={19} /></span>
              <span className="progress-row-title"><strong>{guide.title}</strong><small>{progress.done} of {progress.total} required steps</small></span>
              <span className="progress-row-bar"><ProgressBar percent={progress.percent} /></span>
              <strong className="progress-row-percent">{progress.percent}%</strong>
              <ChevronRight size={18} className="progress-chevron" />
            </Link>
          )
        })}
      </div>
    </>
  )
}

function ProfilePage({ preferences, updatePreference, questionnaire, user, onUpdateUser, onLogout }) {
  return (
    <>
      <PageHeading
        eyebrow="MAKE IT YOURS"
        title={<>A workspace that <em>fits you.</em></>}
        description="Adjust your profile and the way Choivia presents information."
      />
      <section className="choivia-identity-card">
        <div className="choivia-identity-avatar"><Avatar id={user?.avatar} size={72} /></div>
        <div className="choivia-identity-copy">
          <p className="eyebrow">YOUR CHOIVIA ACCOUNT</p>
          <h2>{user?.username || 'Student'}</h2>
          <p>Your little corner for plans, progress and new beginnings.</p>
        </div>
        <button className="choivia-logout-button" type="button" onClick={onLogout}>Log out</button>
      </section>

      <section className="choivia-avatar-card">
        <div>
          <h2>Your avatar</h2>
          <p>Tap an icon to change it.</p>
        </div>
        <AvatarPicker value={user?.avatar} onChange={(avatar) => onUpdateUser({ avatar })} />
      </section>

      <section className="quiz-promo">
        <div className="quiz-promo-copy">
          <p className="eyebrow">WORK-PREFERENCE QUESTIONNAIRE</p>
          <h2>Personalize how you work.</h2>
          <p>Answer six quick questions to get suggested settings. You can edit every setting afterwards.</p>
        </div>
        <div className="quiz-promo-actions">
          <Link className="button button-light" to="/preferences-quiz">{questionnaire ? 'Retake the quiz' : 'Take the 6-question quiz'} <ArrowRight size={16} /></Link>
          {questionnaire && <Link className="text-link" to="/preferences-result">View my results <ArrowRight size={15} /></Link>}
        </div>
      </section>

      <section className="preferences-card">
        <div className="preference-heading">
          <span className="guide-icon sage"><Settings2 size={20} /></span>
          <div><h2>Display preferences</h2><p>Small changes can make a process feel easier to manage.</p></div>
        </div>
        <label className="preference-control">
          <span><strong>Explanation level</strong><small>Choose how much detail you see in each step.</small></span>
          <select value={preferences.explanation} onChange={(event) => updatePreference('explanation', event.target.value)}>
            <option value="medium">Balanced explanations</option><option value="detailed">Detailed explanations</option><option value="concise">Concise instructions</option>
          </select>
        </label>
        <label className="preference-control">
          <span><strong>Checklist layout</strong><small>Choose between a full overview and one step at a time.</small></span>
          <select value={preferences.layout} onChange={(event) => updatePreference('layout', event.target.value)}>
            <option value="overview">Full overview</option><option value="sequential">One step at a time</option>
          </select>
        </label>
        <label className="preference-control preference-toggle">
          <span><strong>Helpful reminders</strong><small>Show gentle notes when a step may depend on another.</small></span>
          <input type="checkbox" checked={preferences.reminders} onChange={(event) => updatePreference('reminders', event.target.checked)} />
        </label>
        <div className="privacy-note"><CheckCircle2 size={17} /><p><strong>Your preferences stay yours.</strong> Settings and guide progress are saved in this browser on this device.</p></div>
      </section>
    </>
  )
}

function GuideDetail({ completed, toggleStep, resetGuide, preferences }) {
  const { guideId } = useParams()
  const guide = guides.find((item) => item.id === guideId)

  if (!guide) {
    return (
      <div className="empty-state">
        <h2>We couldn’t find that guide.</h2>
        <Link className="button button-light" to="/guides">Back to all guides</Link>
      </div>
    )
  }

  const completedIds = completed[guide.id] || []
  const progress = getProgress(guide, completedIds)
  const isDone = progress.percent === 100
  const visibleSteps = preferences.layout === 'sequential'
    ? guide.steps.filter((step) => !completedIds.includes(step.id) || step.required === false).slice(0, 1)
    : guide.steps

  return (
    <>
      <Link className="back-link" to="/guides"><ChevronRight size={16} className="back-chevron" /> All guides</Link>
      <div className="detail-heading">
        <span className={`guide-icon detail-icon ${guide.tone}`}><guide.icon size={25} strokeWidth={1.7} /></span>
        <div>
          <p className="eyebrow">{guide.category} · {guide.duration}</p>
          <h1>{guide.title}</h1>
          <p className="page-description">{guide.summary}</p>
        </div>
      </div>

      {guide.id === 'jobs' && <PageBanner kind="jobs" />}
      <section className="detail-progress-card">
        <div className="detail-progress-top">
          <div><p className="eyebrow">YOUR PROGRESS</p><strong>{progress.done} <span>/ {progress.total} required steps</span></strong></div>
          <span className="detail-percent">{progress.percent}%</span>
        </div>
        <ProgressBar percent={progress.percent} />
        {isDone && <p className="completion-message"><CheckCircle2 size={16} /> All required steps are complete. Nice work!</p>}
      </section>

      {preferences.layout === 'sequential' && (
        <>
          <p className="layout-note">Showing the next unfinished step in your preferred sequential layout.</p>
          {guide.id === 'jobs' && (
            <section className="job-comparison-promo">
              <span className="job-comparison-promo-icon"><Sparkles size={21} /></span>
              <div className="job-comparison-promo-copy">
                <p className="eyebrow">DECISION SUPPORT</p>
                <h2>Considering two opportunities?</h2>
                <p>Compare two job options against your own priorities before deciding what to pursue.</p>
              </div>
              <Link className="button button-light" to="/compare-jobs">
                Compare opportunities <ArrowRight size={16} />
              </Link>
            </section>
          )}
        </>
    )}

      <div className="detail-list-heading">
        <div><p className="eyebrow">YOUR ACTION PLAN</p><h2>Work through the steps</h2></div>
        <button className="subtle-button" onClick={() => resetGuide(guide.id)}><RotateCcw size={15} /> Reset guide</button>
      </div>

      <section className="steps-list">
        {visibleSteps.map((step) => {
          const isComplete = completedIds.includes(step.id)
          const missingDependencies = (step.dependsOn || []).filter((id) => !completedIds.includes(id))
          return (
            <article className={`step-card${isComplete ? ' step-complete' : ''}`} key={step.id}>
              <label className="step-checkbox-wrap">
                <input
                  type="checkbox"
                  checked={isComplete}
                  onChange={() => toggleStep(guide.id, step.id)}
                  aria-label={`${isComplete ? 'Mark incomplete' : 'Mark complete'}: ${step.title}`}
                />
                <span className="custom-checkbox">{isComplete && <Check size={15} />}</span>
              </label>
              <div className="step-number">{String(guide.steps.indexOf(step) + 1).padStart(2, '0')}</div>
              <div className="step-content">
                <div className="step-title-line">
                  <h3>{step.title}</h3>
                  <span className={`step-tag ${step.required === false ? 'optional-tag' : ''}`}>
                    {step.required === false ? 'Optional' : 'Required'}
                  </span>
                </div>
                <p>{preferences.explanation === 'concise' ? step.title : step.description}</p>
                {(guide.id === 'jobs' || preferences.explanation === 'detailed') && (
                  <>
                    <p className="step-details">
                      {step.details || detailedGuidance[step.id] || 'Review this step carefully and confirm any requirements with the relevant official source.'}
                    </p>

                    {step.actions && (
                      <div className="step-action-guide">
                        <h4>What you need to do</h4>
                        <ul>
                          {step.actions.map((action, index) => (
                            <li key={index}>
                              <CheckCircle2 size={15} />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
                {preferences.reminders && missingDependencies.length > 0 && (
                  <div className="dependency-note">
                    <Sparkles size={15} />
                    <span>This step may be easier after you complete: {missingDependencies.map((id) => guide.steps.find((item) => item.id === id)?.title).filter(Boolean).join(', ')}. You can still continue.</span>
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </section>

      <section className="review-card">
        <div className="review-icon"><CheckCircle2 size={20} /></div>
        <div className="review-copy">
          <h3>Final review</h3>
          <p>{isDone ? 'You have marked every required step as complete.' : `${progress.total - progress.done} required ${progress.total - progress.done === 1 ? 'step remains' : 'steps remain'} before you finish this guide.`}</p>
          <span>Always verify requirements with the relevant official source.</span>
        </div>
      </section>
    </>
  )
}

function App() {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => {
    try { const value = localStorage.getItem(SESSION_STORAGE_KEY); return value ? JSON.parse(value) : null }
    catch { return null }
  })
  const userStorageKey = user ? `${STORAGE_KEY}:${user.id}` : STORAGE_KEY
  const [savedState, setSavedState] = useState(() => loadSavedState(userStorageKey))
  const [dataMessage, setDataMessage] = useState('')
  const [streak, setStreak] = useState(() => (user ? touchStreak(user.id) : null))
  const [watered, setWatered] = useState(false)
  const { completed, preferences, questionnaire } = savedState

  function handleAuthSuccess(nextUser) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
    setStreak(touchStreak(nextUser.id))
    setSavedState(loadSavedState(`${STORAGE_KEY}:${nextUser.id}`))
  }

  function handleLogout() {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    setUser(null)
    navigate('/')
  }

  function updateUserProfile(changes) {
    const updated = { ...user, ...changes }
    setUser(updated)
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated))
    const accounts = readAccounts().map((account) => account.id === user.id ? { ...account, ...changes } : account)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(accounts))
  }

  useEffect(() => {
    try {
      localStorage.setItem(userStorageKey, JSON.stringify({ version: 1, ...savedState }))
    } catch {
      // The app remains usable if browser storage is unavailable.
    }
  }, [savedState, userStorageKey])

  function toggleStep(guideId, stepId) {
    setSavedState((previous) => {
      const current = previous.completed[guideId] || []
      const next = current.includes(stepId)
        ? current.filter((id) => id !== stepId)
        : [...current, stepId]

      return {
        ...previous,
        completed: { ...previous.completed, [guideId]: next },
      }
    })
  }

  function updatePreference(key, value) {
    setSavedState((previous) => ({
      ...previous,
      preferences: { ...previous.preferences, [key]: value },
    }))
  }

  function resetGuide(guideId) {
    if (!window.confirm('Reset this guide? Its completed steps will be cleared.')) return
    setSavedState((previous) => ({
      ...previous,
      completed: { ...previous.completed, [guideId]: [] },
    }))
  }


  function completeQuestionnaire(answers) {
    const nextPreferences = buildPreferencesFromAnswers(answers)

    setSavedState((previous) => ({
      ...previous,
      preferences: nextPreferences,
      questionnaire: {
        answers,
        completedAt: new Date().toISOString(),
      },
    }))

    setDataMessage('')
    navigate('/preferences-result')
  }

  function exportData() {
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      completed,
      preferences,
      questionnaire: savedState.questionnaire ?? null,
    }

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `choivia-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setDataMessage('Your Choivia backup has been downloaded.')
  }

  async function importData(event) {
    const input = event.currentTarget
    const file = input.files?.[0]
    input.value = ''
    if (!file) return

    try {
      const backup = JSON.parse(await file.text())

      if (
        backup?.version !== 1 ||
        !backup.completed ||
        typeof backup.completed !== 'object' ||
        Array.isArray(backup.completed) ||
        !backup.preferences ||
        typeof backup.preferences !== 'object'
      ) {
        throw new Error('Unsupported backup format.')
      }

      const importedCompleted = {}

      for (const guide of guides) {
        const ids = backup.completed[guide.id]

        if (
          !Array.isArray(ids) ||
          ids.some(
            (id) =>
              typeof id !== 'string' ||
              !guide.steps.some((step) => step.id === id),
          )
        ) {
          throw new Error('Invalid guide progress.')
        }

        importedCompleted[guide.id] = [...new Set(ids)]
      }

      const p = backup.preferences

      if (
        !['detailed', 'medium', 'concise'].includes(p.explanation) ||
        !['overview', 'sequential'].includes(p.layout) ||
        typeof p.reminders !== 'boolean'
      ) {
        throw new Error('Invalid preferences.')
      }

      if (!window.confirm('Import this backup? Your current progress and preferences will be replaced.')) {
        setDataMessage('Import canceled. Your saved data was not changed.')
        return
      }

      setSavedState({
        completed: importedCompleted,
        preferences: {
          explanation: p.explanation,
          layout: p.layout,
          reminders: p.reminders,
        },
        questionnaire: backup.questionnaire ?? null,
      })

      setDataMessage('Backup imported successfully.')
    } catch {
      setDataMessage(
        'Import failed. Choose a valid Choivia JSON backup. Your current data was not changed.',
      )
    }
  }

  function clearAllData() {
    if (!window.confirm('Clear all saved guide progress and reset preferences? This cannot be undone.')) {
      return
    }

    setSavedState({
      completed: Object.fromEntries(guides.map((guide) => [guide.id, []])),
      preferences: { ...defaultPreferences },
      questionnaire: null,
    })

    setDataMessage('All saved progress has been cleared and preferences reset.')
  }

  if (!user) return <AuthScreen onAuthSuccess={handleAuthSuccess} />
  if (!AVATARS.some((a) => a.id === user.avatar)) return <ProfileSetup user={user} onDone={(avatar) => updateUserProfile({ avatar })} />
  const needsWater = streak && !watered && streak.watered !== dayKey()

  return (
    <div className="app-shell">
      <SaplingTransition />
      {needsWater && <WateringOverlay days={streak.current} onDone={() => { markWatered(user.id); setWatered(true) }} />}
      <Sidebar />
      <div className="app-main">
        <AppBar user={user} streak={streak} onPick={(avatar) => updateUserProfile({ avatar })} onLogout={handleLogout} />
        <main className="page-container">
          <Routes>
            <Route path="/" element={<Dashboard completed={completed} user={user} streak={streak} />} />
            <Route path="/planner" element={<Planner user={user} />} />
            <Route path="/books" element={<Books user={user} />} />
            <Route path="/guides" element={<GuidesPage completed={completed} />} />
            <Route path="/guide/:guideId" element={<GuideDetail completed={completed} toggleStep={toggleStep} resetGuide={resetGuide} preferences={preferences} />} />
            <Route path="/progress" element={<ProgressPage completed={completed} onExport={exportData} onImport={importData} onClear={clearAllData} dataMessage={dataMessage} />} />
            <Route path="/profile" element={<ProfilePage preferences={preferences} updatePreference={updatePreference} questionnaire={questionnaire} user={user} onUpdateUser={updateUserProfile} onLogout={handleLogout} />} />
            <Route path="/preferences-quiz" element={<PreferencesQuiz initialAnswers={questionnaire?.answers} onComplete={completeQuestionnaire} />} />
            <Route path="/preferences-result" element={<PreferencesResult questionnaire={questionnaire} preferences={preferences} />} />
            <Route path="/study" element={<StudyMode updatePreference={updatePreference} questionnaire={questionnaire} />} />
            <Route path="/compare-jobs" element={<JobComparison />} />
            <Route path="*" element={<div className="empty-state"><h2>Page not found</h2><Link to="/" className="text-link">Return to dashboard <ArrowRight size={15} /></Link></div>} />
          </Routes>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}

export default App