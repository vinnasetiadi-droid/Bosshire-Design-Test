// UpNext Mobile Prototype — 100% Strict Option A Design System + Option A Motion
// Screens:
// 0. Welcome ("Your next career move starts here.")
// 1. Meet NEX ("Hi! I'm NEX 👋 Your AI career companion at UpNext.")
// 2. Step 1 of 5 ("What jobs do you want?")
// 3. Step 2 of 5 ("Where can you work?")
// 4. Step 3 of 5 ("Where do you currently live?")
// 5. Step 4 of 5 ("What is your minimum expected salary?")
// 6. Step 5 of 5 ("Where are you in your job search?")
// 7. Matched roles ("We've found 84 matching remote jobs")

const workbenchState = {
  activeScreenId: 0, // Welcome: onboarding starts empty, so the prototype starts there too
  prevScreenId: 0,
  navDirection: 'forward', // 'forward' | 'back' | 'none'
  lastChangedRole: null,
  uiState: 'default',
  viewMode: 'single', // 'single' | 'canvas'

  // User Profile
  userFirstName: 'Vinna',

  // Step 1 of 4: Career Profile (plus optional Screen 1.5 CV / LinkedIn import)
  uploadedCvName: '',
  // What NEX read from the CV (fixed sample values; no real parser in the prototype)
  cvExtract: null, // { experienceLevel, experienceText, roles: [], skills: [] }
  experienceFromCv: false, // true while experienceLevel is the CV's value, not one the user picked
  experienceEditing: false, // "Change" on the CV confirmation card reopens the full list
  linkedinConnected: false,
  experienceLevel: '', // '' until chosen | 'fresh' | 'lt_1' | '1_2' | '3_5' | 'gt_5'
  selectedRoles: [], // Starts empty (0/3); recommendations appear after picking first role from search
  roleSearchQuery: '',
  roleDropdownOpen: false,
  activeRoleCategory: 'Design',

  // Step 2 of 4: Work Preferences
  country: 'Indonesia',
  city: '', // '' -> 'Select your city'
  cityDropdownOpen: false,
  timezone: 'GMT+7 (WIB)',
  workHours: { start: 9, end: 17 }, // Office hours by default (a real answer the user can change), local hours 0–24 in the city's timezone
  timezoneChangedFrom: null, // previous timezone when picking a city changed it, so the change is shown
  workArrangements: [], // multi-select: 'fully_remote' | 'remote_id' | 'hybrid', or exclusive 'open_all'
  employmentTypes: [], // multi-select pills, or exclusive 'Open to all'

  // Step 3 of 4: Salary Expectations
  currency: 'IDR', // 'IDR' | 'USD' | 'SGD' | 'AUD' | 'EUR' | 'GBP'
  minSalaryInput: '',
  idealSalaryInput: '',
  salaryError: '',

  // Step 4 of 4: Career Goals
  careerPriorities: [],
  availability: '', // '' until chosen | 'immediately' | '2_weeks' | '1_month' | '2_3_months' | 'exploring'

  // AI Personalization: processing screen after the 4 steps, not a step itself (0..3 = processing, 4 = ready)
  processingStep: 0,
  processingTimer: null,

  // Screen 7, 8 & 9: Recommendations, Dashboard Routes, & Navigation Drawer
  savedJobIds: ['job-1'],
  activeJobDetailId: null, // Lightweight Quick Job Preview bottom sheet
  selectedJobId: 'job-1', // Active job for Full Job Details & AI tools
  jobDetailsTab: 'overview', // 'overview' | 'description' | 'company'
  fitBreakdownSheetOpen: false,
  previousDashboardRoute: 'home',
  previousScreenBeforeJobDetails: 8,
  jobShareCopiedId: null,
  drawerOpen: false,
  dashboardRoute: 'home', // 'home' | 'explore' | 'saved' | 'applications' | 'profile' | 'cover_letter' | 'job_details' | 'reality_check'
  realityCheckReturn: null, // where Back goes from Reality Check: { screen } or { screen: 8, route }
  recruiterDraftOpen: false,
  recruiterDraftCopied: false,
  dashboardSearchQuery: '',
  dashboardFiltersOpen: false,
  activeCategoryFilter: '',

  appliedJobTracker: { 'job-2': 'submitted', 'job-3': 'submitted' },

  extraCountriesShown: false,
  selectedCountries: ['ID'],
  liveLocation: 'indonesia', // 'indonesia' | 'other'
  salaryStepIndex: 2,
  searchStatus: 'actively_applying',
};

const salaryPresets = {
  IDR: [
    { num: '20', unit: 'IDR · M/mo', prefix: 'IDR ', suffix: 'M' },
    { num: '30', unit: 'IDR · M/mo', prefix: 'IDR ', suffix: 'M' },
    { num: '40', unit: 'IDR · M/mo', prefix: 'IDR ', suffix: 'M' },
    { num: '55', unit: 'IDR · M/mo', prefix: 'IDR ', suffix: 'M' },
    { num: '70', unit: 'IDR · M/mo', prefix: 'IDR ', suffix: 'M' },
  ],
  USD: [
    { num: '1,500', unit: 'USD / mo', prefix: '$', suffix: '' },
    { num: '2,000', unit: 'USD / mo', prefix: '$', suffix: '' },
    { num: '2,500', unit: 'USD / mo', prefix: '$', suffix: '' },
    { num: '3,500', unit: 'USD / mo', prefix: '$', suffix: '' },
    { num: '4,500', unit: 'USD / mo', prefix: '$', suffix: '' },
  ],
  GBP: [
    { num: '1,200', unit: 'GBP / mo', prefix: '£', suffix: '' },
    { num: '1,600', unit: 'GBP / mo', prefix: '£', suffix: '' },
    { num: '2,000', unit: 'GBP / mo', prefix: '£', suffix: '' },
    { num: '2,800', unit: 'GBP / mo', prefix: '£', suffix: '' },
    { num: '3,500', unit: 'GBP / mo', prefix: '£', suffix: '' },
  ],
  EUR: [
    { num: '1,400', unit: 'EUR / mo', prefix: '€', suffix: '' },
    { num: '1,800', unit: 'EUR / mo', prefix: '€', suffix: '' },
    { num: '2,300', unit: 'EUR / mo', prefix: '€', suffix: '' },
    { num: '3,200', unit: 'EUR / mo', prefix: '€', suffix: '' },
    { num: '4,000', unit: 'EUR / mo', prefix: '€', suffix: '' },
  ],
};

function formatPresetInline(preset) {
  return `${preset.prefix}<span class="font-mono-ds">${preset.num}</span>${preset.suffix}`;
}

// Helper: wraps only digit sequences in Geist Mono (.font-mono-ds), keeping all letters/symbols/units in DM Sans
function numText(str) {
  return String(str).replace(/(\d[\d,.]*)/g, '<span class="font-mono-ds">$1</span>');
}

// Onboarding Step 2: the hours (WIB, 0–24) the user can be online; used by Timezone Compatibility
const workHoursPresets = [
  { id: 'office', label: 'Office hours', start: 9, end: 17 },
  { id: 'evening', label: 'Into the evening', start: 9, end: 22 },
  { id: 'any', label: 'Any time', start: 0, end: 24 },
];

function formatWibHour(h) {
  return `${String(h).padStart(2, '0')}:00`;
}

// "GMT+8 (WITA)" -> { offset: 8, abbr: 'WITA' }
function parseTimezone(tz) {
  const match = /GMT([+-]\d+)\s*\((\w+)\)/.exec(tz || '');
  return match ? { offset: Number(match[1]), abbr: match[2] } : { offset: 7, abbr: 'WIB' };
}

// Local hours -> WIB (may run past 0 or 24; only used for comparing and display)
function toWibHours(hours, tz) {
  const shift = parseTimezone(tz).offset - 7;
  return { start: hours.start - shift, end: hours.end - shift };
}

function formatClockHour(h) {
  return formatWibHour(((h % 24) + 24) % 24);
}

// 24h track shared by Step 2 (editable window) and the fit breakdown (you vs listing)
function renderHoursTrack({ segments = [], attrs = '', extra = '', size = 'md' }) {
  const dims = size === 'lg' ? { row: 'h-[32px]', bar: 'h-[12px]' } : { row: 'h-[24px]', bar: 'h-[8px]' };
  return `
    <div ${attrs} class="relative ${dims.row} mx-3 touch-none select-none">
      <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 ${dims.bar} rounded-full bg-[#e4e6ea]"></div>
      ${segments
        .map(
          (seg) =>
            `<div ${seg.attrs || ''} class="absolute top-1/2 -translate-y-1/2 ${dims.bar} rounded-full ${seg.cls}" style="left: ${(seg.start / 24) * 100}%; width: ${((seg.end - seg.start) / 24) * 100}%"></div>`
        )
        .join('')}
      ${extra}
    </div>
  `;
}

function renderHoursTicks() {
  return `
    <div class="flex justify-between text-[10.5px] text-[#a4a7ae]">
      ${[0, 6, 12, 18, 24].map((h) => `<span class="font-mono-ds">${formatWibHour(h)}</span>`).join('')}
    </div>
  `;
}

function renderWorkHoursSummary(hours, tz) {
  const zone = parseTimezone(tz);
  const wib = toWibHours(hours, tz);
  return numText(
    `${hours.end - hours.start} hours a day, ${formatWibHour(hours.start)}–${formatWibHour(hours.end)} ${zone.abbr}.${
      zone.offset !== 7 ? ` That’s ${formatClockHour(wib.start)}–${formatClockHour(wib.end)} WIB.` : ''
    }`
  );
}

// Illustrative conversion rates for Reality Check (not live market data)
const illustrativeRatesToIdr = { IDR: 1, USD: 16300, GBP: 21500, EUR: 18900, SGD: 12500, AUD: 10700 };

// Step 4 priorities NEX can check against a listing (working style or reach); other choices are not scored
const careerPriorityOptions = [
  { label: 'Work-life balance', matches: (job) => /async|flexible/i.test(job.companyInfo.workingStyle) },
  { label: 'Flexible working hours', matches: (job) => /async|flexible/i.test(job.companyInfo.workingStyle) },
  { label: 'International exposure', matches: (job) => /worldwide|apac|global/i.test(job.location) },
];

// A typed salary (digits only) in the chosen currency -> rupiah; small IDR numbers are read as millions
function userSalaryToIdr(raw, currency) {
  const num = Number(String(raw || '').replace(/[^\d]/g, '')) || 0;
  if (!num) return 0;
  const amount = currency === 'IDR' && num < 1000 ? num * 1000000 : num;
  return amount * (illustrativeRatesToIdr[currency] || 1);
}

const screensConfig = [
  { id: 0, stepTag: 'Welcome', title: 'Your next career move, from home.' },
  { id: 1, stepTag: 'Meet NEX', title: "Hi, I'm NEX" },
  { id: 1.5, stepTag: 'Import profile', title: 'Upload CV or Connect LinkedIn' },
  { id: 2, stepTag: 'Step 1 of 4', stepNum: 1, title: 'Career profile' },
  { id: 3, stepTag: 'Step 2 of 4', stepNum: 2, title: 'Work preferences' },
  { id: 4, stepTag: 'Step 3 of 4', stepNum: 3, title: 'Salary expectations' },
  { id: 5, stepTag: 'Step 4 of 4', stepNum: 4, title: 'Career goals' },
  { id: 6, stepTag: 'AI personalization', title: 'AI personalization' },
  { id: 7, stepTag: 'Recommended', title: "NEX's recommended jobs" },
  { id: 8, stepTag: 'Home', title: 'Main home dashboard' },
];

function getRevealClass(staggerIdx, animatePage) {
  if (!animatePage) return '';
  const base = workbenchState.navDirection === 'back' ? 'oa-reveal-back' : 'oa-reveal';
  const stagger = staggerIdx ? ` oa-stagger-${Math.min(staggerIdx, 4)}` : '';
  return `${base}${stagger}`;
}

function renderStatusBar(screen) {
  const bgClass = screen && screen.id <= 1 ? 'bg-white' : 'bg-[#f5f6f8]';
  return `
    <div id="status-bar" class="w-full px-6 pt-3.5 pb-1.5 flex items-center justify-between text-[12px] text-[#181d27] select-none ${bgClass} shrink-0 transition-colors duration-300">
      <span class="text-[12px] text-[#181d27]"><span class="font-mono-ds">9</span>:<span class="font-mono-ds">41</span></span>
      <div class="flex items-center gap-1.5 text-[#535862]">
        <i data-lucide="signal" class="w-3.5 h-3.5"></i>
        <i data-lucide="wifi" class="w-3.5 h-3.5"></i>
        <i data-lucide="battery-full" class="w-4 h-4"></i>
      </div>
    </div>
  `;
}

const ONBOARDING_STEP_COUNT = 4;

// Progress counts only the 4 question steps; welcome, import and personalization sit outside it
function getOnboardingProgressPct(screen) {
  return screen && screen.stepNum ? Math.round((screen.stepNum / ONBOARDING_STEP_COUNT) * 100) : 0;
}

function renderOnboardingHeader(screen) {
  if (screen.id <= 1 || screen.id === 8) {
    return `<div id="onboarding-header" class="hidden"></div>`;
  }
  const isResults = screen.id === 7;
  const hasStep = Boolean(screen.stepNum);
  const prevScreenTarget = screen.id === 1.5 ? 1 : screen.id === 2 ? 1.5 : screen.id - 1;

  return `
    <div id="onboarding-header" class="px-4 pt-1.5 pb-3 bg-[#f5f6f8] shrink-0">
      <div class="flex items-center justify-between ${hasStep ? 'mb-2.5' : ''}">
        <div class="flex items-center gap-1 h-8">
          <button onclick="setScreen(${prevScreenTarget})" aria-label="Back" class="oa-press w-6 h-6 -ml-1 text-[#414651] hover:text-[#181d27] flex items-center justify-center cursor-pointer">
            <i data-lucide="arrow-left" class="w-[18px] h-[18px]"></i>
          </button>
          <span class="upnext-logo text-[18px] leading-none select-none inline-flex items-baseline">
            <span class="text-[#44658b]">Up</span><span class="text-[#f79626]">Next</span>
          </span>
        </div>

        <!-- Plain Step Counter (No white pill frame, no dot) -->
        <span class="text-[12px] text-[#717680] inline-flex items-center">
          <span class="oa-fade-val">
            ${
              isResults
                ? `<span>Matched feed</span>`
                : hasStep
                  ? `<span>Step <span class="font-mono-ds text-[#181d27]">${screen.stepNum}</span> of <span class="font-mono-ds text-[#181d27]">${ONBOARDING_STEP_COUNT}</span></span>`
                  : ''
            }
          </span>
        </span>
      </div>

      ${
        hasStep
          ? `<!-- Option A Full-Pill Progress Track (#E4E6EA -> #44658B, smooth 500ms EASE_OUT width morph) -->
             <div class="w-full h-[6px] rounded-full bg-[#e4e6ea] overflow-hidden">
               <div class="oa-progress-fill h-full rounded-full bg-[#44658b]" style="width: ${getOnboardingProgressPct(screen)}%"></div>
             </div>`
          : ''
      }
    </div>
  `;
}

// Onboarding footer: the primary action always sits at the bottom of the screen, below the cards,
// and stays disabled until the step has a real answer
function renderOnboardingFooter({ onclick, enabled = true, label = 'Continue', hint = '', secondary = '' }, animatePage) {
  return `
    <div class="mt-auto pt-1 space-y-1.5 ${getRevealClass(4, animatePage)}">
      <button
        onclick="${onclick}"
        data-onboarding-continue
        ${enabled ? '' : 'disabled aria-disabled="true"'}
        class="oa-press w-full h-[40px] rounded-full bg-[#44658b] text-white text-[13px] enabled:hover:bg-[#355070] enabled:cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
      >
        ${label}
      </button>
      ${hint ? `<p data-onboarding-hint class="${enabled ? 'hidden ' : ''}text-center text-[11.5px] leading-[16px] text-[#717680]">${hint}</p>` : ''}
      ${secondary}
    </div>
  `;
}

// Enables or disables the current step's Continue without re-rendering, so a text field keeps focus
function syncOnboardingContinue(enabled) {
  const button = document.querySelector('[data-onboarding-continue]');
  if (!button) return;
  button.disabled = !enabled;
  if (enabled) button.removeAttribute('aria-disabled');
  else button.setAttribute('aria-disabled', 'true');
  document.querySelector('[data-onboarding-hint]')?.classList.toggle('hidden', enabled);
}

// ── SCREEN 0: Welcome / Splash Screen ──
function renderScreen0(animatePage) {
  return `
    <div class="bg-white flex-1 flex flex-col px-6 pt-3 pb-7 select-none">
      <!-- Top Bar: UpNext Logo at Top-Left, language on the right -->
      <div class="flex items-center justify-between ${getRevealClass(1, animatePage)}">
        <span class="upnext-logo text-[20px] leading-none inline-flex items-baseline">
          <span class="text-[#44658b]">Up</span><span class="text-[#f79626]">Next</span>
        </span>
        <button type="button" class="oa-press h-[32px] pl-2.5 pr-2 rounded-full bg-[#f5f6f8] hover:bg-[#edeef1] text-[#414651] text-[12.5px] inline-flex items-center gap-1.5 cursor-pointer" aria-label="Language: Indonesia">
          <i data-lucide="globe" class="w-4 h-4 text-[#717680]"></i>
          <span>Indonesia</span>
          <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-[#717680]"></i>
        </button>
      </div>

      <!-- Center Content Group: 24px+ breathing room below UpNext logo -->
      <div class="mt-8 mb-auto flex flex-col">
        <!-- 1. Hero Illustration -->
        <div class="flex items-center justify-center mb-[48px] ${getRevealClass(2, animatePage)}">
          <img
            src="./onboarding-hero.png"
            alt="Remote work illustration"
            class="w-[326px] max-w-full h-auto object-contain"
          />
        </div>

        <!-- 2. 2-Line Headline: aspirational promise; the fake-remote problem is carried by the subhead -->
        <div class="space-y-3.5 ${getRevealClass(3, animatePage)}">
          <h1 class="text-[38px] leading-[46px] font-normal text-[#181d27] tracking-[-0.025em] whitespace-nowrap">
            Your next career<br />
            move, <span class="inline-block bg-[#ffe07a] px-2 py-0.5 rounded-[5px]">from home.</span>
          </h1>
          <p class="text-[14px] leading-[21px] text-[#535862]">
            Many global remote roles quietly require a UK, US or EU work permit. UpNext checks eligibility, WIB overlap, and real pay in rupiah before you apply.
          </p>
        </div>
      </div>

      <!-- 3. Bottom Action Row (Full-Width Primary Pill CTA -> Goes to Screen 1 Meet NEX) -->
      <div class="pt-3 ${getRevealClass(4, animatePage)}">
        <button
          onclick="setScreen(1)"
          class="oa-press w-full h-[44px] rounded-full bg-[#44658b] hover:bg-[#355070] text-white text-[13.5px] cursor-pointer inline-flex items-center justify-center gap-2"
        >
          <span>Get started</span>
          <i data-lucide="arrow-right" class="w-4 h-4"></i>
        </button>
      </div>
    </div>
  `;
}

// ── SCREEN 1: Meet NEX (AI Career Companion Intro Screen per Reference Image) ──
function renderScreen1(animatePage) {
  return `
    <div class="bg-white flex-1 flex flex-col justify-between px-6 pt-3 pb-7 select-none">
      <!-- Top Bar: Back Button + UpNext Logo -->
      <div class="flex items-center justify-between ${getRevealClass(1, animatePage)}">
        <div class="flex items-center gap-1">
          <button
            onclick="setScreen(0)"
            aria-label="Back"
            class="oa-press w-6 h-6 -ml-1 text-[#414651] hover:text-[#181d27] flex items-center justify-center cursor-pointer"
          >
            <i data-lucide="arrow-left" class="w-[18px] h-[18px]"></i>
          </button>
          <span class="upnext-logo text-[20px] leading-none inline-flex items-baseline">
            <span class="text-[#44658b]">Up</span><span class="text-[#f79626]">Next</span>
          </span>
        </div>
      </div>

      <!-- Center Content: NEX AI Blob + Centered Greeting + Description -->
      <div class="my-auto flex flex-col items-center text-center">
        <!-- 1. NEX AI Blob with slow swirl + subtle pulsing halo -->
        <div class="relative w-[250px] h-[250px] flex items-center justify-center ${animatePage ? 'oa-orb-reveal' : ''}">
          <div class="nex-halo"></div>
          <img
            src="./bosshire-ai-blob.png"
            alt="NEX AI Companion"
            class="nex-orb relative z-10 w-[164px] h-[164px] rounded-full object-contain"
          />
        </div>

        <!-- 2. Centered Greeting (no emoji, no logo styling) -->
        <h1 class="mt-4 text-[26px] leading-[34px] font-medium text-[#181d27] ${getRevealClass(2, animatePage)}">
          Hi, I’m NEX.<br />
          Consider me your inside guy for remote work.
        </h1>

        <!-- 3. What NEX will check for every role -->
        <p class="mt-3 text-[14px] leading-[22px] text-[#535862] px-2 ${getRevealClass(3, animatePage)}">
          I’ll tell you which roles can really hire you from Indonesia, how their hours land in WIB, and what the pay is worth in rupiah. First, ${numText('4')} quick questions.
        </p>
      </div>

      <!-- Bottom Section: Full-Width "Let's go →" Button -->
      <div class="pt-2 ${getRevealClass(4, animatePage)}">

        <button
          onclick="setScreen(1.5)"
          class="oa-press w-full h-[44px] rounded-full bg-[#44658b] hover:bg-[#355070] text-white text-[14px] cursor-pointer px-6 flex items-center justify-between"
        >
          <span class="w-4"></span>
          <span>Let's go</span>
          <i data-lucide="arrow-right" class="w-4 h-4"></i>
        </button>
      </div>
    </div>
  `;
}

// ── SCREEN 1.5: Import Profile (Upload CV or Connect LinkedIn) ──
function renderScreen1_5(animatePage) {
  const hasCv = Boolean(workbenchState.uploadedCvName);
  const hasLinkedin = Boolean(workbenchState.linkedinConnected);
  const hasAnyImport = hasCv || hasLinkedin;
  // Once one source is in, the other becomes an optional extra: still usable, just quieter
  const cvSecondary = hasLinkedin && !hasCv;
  const linkedinSecondary = hasCv && !hasLinkedin;
  const continueLabel =
    hasCv && hasLinkedin ? 'Continue with CV and LinkedIn' : hasCv ? 'Continue with this CV' : hasLinkedin ? 'Continue with LinkedIn' : 'Continue';

  return `
    <div class="flex-1 flex flex-col justify-between px-3 pb-4">
      <div class="space-y-3">
        <!-- NEX Chat Bubble -->
        <div class="flex items-start gap-2.5 px-1 ${getRevealClass(0, animatePage)}">
          <img src="./bosshire-ai-blob.png" alt="NEX" class="nex-orb w-6 h-6 rounded-full shrink-0 mt-1" />
          <div class="bg-[#ebf2fa] rounded-[16px] rounded-tl-[4px] px-3.5 py-2.5 text-[12.5px] leading-[18px] text-[#181d27]">
            Want a faster start? Upload your CV or connect LinkedIn so I can pre-fill your career profile.
          </div>
        </div>

        <!-- Card 1: Upload CV -->
        ${
          cvSecondary
            ? `<div class="bg-[#f9fafb] rounded-[18px] p-4 flex items-center justify-between gap-3 ${getRevealClass(1, animatePage)}">
                 <div class="flex items-center gap-2.5 min-w-0">
                   <div class="w-9 h-9 rounded-full bg-[#f0f1f3] text-[#717680] flex items-center justify-center shrink-0">
                     <i data-lucide="file-text" class="w-4 h-4"></i>
                   </div>
                   <div class="min-w-0">
                     <h2 class="text-[13.5px] text-[#414651]">Or add your CV too</h2>
                     <p class="text-[12px] text-[#717680] truncate">Optional · PDF or DOCX</p>
                   </div>
                 </div>
                 <label class="oa-press h-[32px] px-3.5 rounded-full bg-[#f0f1f3] hover:bg-[#e6e8eb] text-[#414651] text-[12px] font-medium inline-flex items-center cursor-pointer shrink-0">
                   <input type="file" accept=".pdf,.doc,.docx" class="hidden" onchange="handleOnboardingCvUpload(this)" />
                   Choose file
                 </label>
               </div>`
            : `<div class="bg-white rounded-[18px] p-4 space-y-3 ${getRevealClass(1, animatePage)}">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-full bg-[#ebf2fa] text-[#44658b] flex items-center justify-center shrink-0">
              <i data-lucide="file-text" class="w-4 h-4"></i>
            </div>
            <div>
              <h2 class="text-[15px] font-medium text-[#181d27]">Upload your CV</h2>
              <p class="text-[12px] text-[#717680]">PDF or DOCX · Max ${numText('5')} MB</p>
            </div>
          </div>

          ${
            hasCv
              ? `<div class="bg-[#ecfdf3] rounded-[14px] p-3 flex items-center justify-between gap-2">
                   <div class="min-w-0">
                     <div class="text-[12.5px] font-medium text-[#027a48] truncate">${workbenchState.uploadedCvName}</div>
                     <div class="text-[11px] text-[#027a48]/80">Experience read · role ideas ready</div>
                   </div>
                   <button onclick="removeOnboardingCv()" class="oa-press text-[11.5px] text-[#535862] hover:text-[#181d27] px-2 py-1 cursor-pointer shrink-0">
                     Remove
                   </button>
                 </div>`
              : `<label class="oa-press block bg-[#f7f8fa] hover:bg-[#ebf2fa]/60 rounded-[14px] p-4 text-center space-y-2 cursor-pointer transition-colors">
                   <input type="file" accept=".pdf,.doc,.docx" class="hidden" onchange="handleOnboardingCvUpload(this)" />
                   <div class="w-9 h-9 rounded-full bg-white text-[#44658b] flex items-center justify-center mx-auto">
                     <i data-lucide="upload" class="w-4 h-4"></i>
                   </div>
                   <div class="text-[13px] font-medium text-[#181d27]">Choose CV file</div>
                   <div class="text-[11.5px] text-[#717680]">We'll read your experience and suggest roles</div>
                 </label>`
          }
        </div>`
        }

        <!-- Card 2: Connect LinkedIn (quieter once a CV is in) -->
        <div class="${linkedinSecondary ? 'bg-[#f9fafb]' : 'bg-white'} rounded-[18px] p-4 space-y-3 ${getRevealClass(2, animatePage)}">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-9 h-9 rounded-full ${linkedinSecondary ? 'bg-[#f0f1f3]' : 'bg-[#ebf2fa]'} flex items-center justify-center shrink-0">
                <img src="./linkedin-logo.svg" alt="LinkedIn" class="w-[18px] h-[18px] object-contain ${linkedinSecondary ? 'opacity-60' : ''}" />
              </div>
              <div class="min-w-0">
                <h2 class="${linkedinSecondary ? 'text-[13.5px] text-[#414651]' : 'text-[15px] font-medium text-[#181d27]'}">
                  ${linkedinSecondary ? 'Or add LinkedIn too' : 'Connect LinkedIn'}
                </h2>
                <p class="text-[12px] text-[#717680] truncate">
                  ${hasLinkedin ? 'Connected · Product Designer (3–5 yrs)' : linkedinSecondary ? 'Optional · Headline & work history' : 'Import your headline & experience'}
                </p>
              </div>
            </div>
            <button
              onclick="toggleOnboardingLinkedin()"
              class="oa-press h-[32px] px-3.5 rounded-full text-[12px] font-medium cursor-pointer shrink-0 ${
                hasLinkedin
                  ? 'bg-[#ecfdf3] text-[#027a48]'
                  : linkedinSecondary
                    ? 'bg-[#f0f1f3] hover:bg-[#e6e8eb] text-[#414651]'
                    : 'bg-[#ebf2fa] hover:bg-[#d4e4f7] text-[#355070]'
              }"
            >
              ${hasLinkedin ? 'Connected' : 'Connect'}
            </button>
          </div>
        </div>
      </div>

      ${renderOnboardingFooter(
        {
          onclick: 'setScreen(2)',
          enabled: hasAnyImport,
          label: continueLabel,
          hint: 'Add a CV or LinkedIn to continue with it, or fill in your profile yourself.',
          secondary: `<button
            onclick="setScreen(2)"
            class="oa-press w-full h-[40px] rounded-full bg-[#f0f1f3] hover:bg-[#e6e8eb] text-[#181d27] text-[13px] cursor-pointer"
          >
            Skip for now, fill manually
          </button>`,
        },
        animatePage
      )}
    </div>
  `;
}

const allRoleCatalog = [
  'Product Designer',
  'UI/UX Designer',
  'Graphic Designer',
  'UX Researcher',
  'Design Systems Lead',
  'Visual Designer',
  'Frontend Engineer',
  'Full-Stack Engineer',
  'Backend Engineer',
  'Mobile Engineer (iOS / Android)',
  'Product Manager',
  'Data Analyst',
  'Growth Marketer',
  'Content Strategist',
];

const roleRecommendationsMap = {
  'Product Designer': ['UI/UX Designer', 'Design Systems Lead', 'UX Researcher', 'Graphic Designer'],
  'UI/UX Designer': ['Product Designer', 'UX Researcher', 'Visual Designer', 'Design Systems Lead'],
  'Graphic Designer': ['Visual Designer', 'UI/UX Designer', 'Product Designer', 'Content Strategist'],
  'Frontend Engineer': ['Full-Stack Engineer', 'Mobile Engineer (iOS / Android)', 'UI/UX Designer'],
  'Product Manager': ['Product Designer', 'Data Analyst', 'Growth Marketer'],
};

function getFilteredRoles(query) {
  const q = (query || '').trim().toLowerCase();
  return allRoleCatalog
    .filter((r) => !workbenchState.selectedRoles.includes(r))
    .filter((r) => !q || r.toLowerCase().includes(q))
    .slice(0, 5);
}

function getRecommendedRoles() {
  if (workbenchState.selectedRoles.length === 0) return [];
  const primary = workbenchState.selectedRoles[0];
  const base =
    roleRecommendationsMap[primary] || ['Product Designer', 'UI/UX Designer', 'UX Researcher', 'Product Manager'];
  return base.filter((r) => !workbenchState.selectedRoles.includes(r)).slice(0, 4);
}

function renderRoleDropdownHTML() {
  if (!workbenchState.roleDropdownOpen || workbenchState.selectedRoles.length >= 3) return '';
  const matches = getFilteredRoles(workbenchState.roleSearchQuery);
  return `
    <div class="absolute left-0 right-0 top-[calc(100%+6px)] z-30 bg-white rounded-[14px] p-1.5 shadow-[0_8px_24px_-6px_rgba(16,24,40,0.18),0_2px_4px_rgba(16,24,40,0.04)]">
      ${
        matches.length > 0
          ? matches
              .map(
                (role) => `
              <button
                type="button"
                onmousedown="selectRoleFromSearch('${role}')"
                class="w-full px-3 py-2 rounded-[10px] text-left text-[13px] text-[#181d27] hover:bg-[#f5f6f8] flex items-center justify-between cursor-pointer transition-colors"
              >
                <span>${role}</span>
                <span class="text-[11px] text-[#717680]">Add</span>
              </button>
            `
              )
              .join('')
          : `<div class="px-3 py-2.5 text-[12px] text-[#717680]">No matching roles found.</div>`
      }
    </div>
  `;
}

// ── SCREEN 2 (Step 1 of 5): Career Background (NEX Message + Experience + Preferred Roles Search) ──
function renderScreen2(animatePage) {
  const experienceOptions = [
    { id: 'fresh', label: 'Fresh graduate / No experience' },
    { id: 'lt_1', label: 'Less than 1 year' },
    { id: '1_2', label: '1–2 years' },
    { id: '3_5', label: '3–5 years' },
    { id: 'gt_5', label: 'More than 5 years' },
  ];

  const selectedCount = workbenchState.selectedRoles.length;
  const recommendations = getRecommendedRoles();
  const canContinue = Boolean(workbenchState.experienceLevel) && selectedCount >= 1;
  const cv = workbenchState.uploadedCvName ? workbenchState.cvExtract : null;
  const showCvExperience = Boolean(cv) && !workbenchState.experienceEditing;
  const cvRoleIdeas = cv ? cv.roles.filter((r) => !workbenchState.selectedRoles.includes(r)) : [];
  const chosenExperience = experienceOptions.find((o) => o.id === workbenchState.experienceLevel);

  return `
    <div class="px-3 pb-3 flex-1 flex flex-col gap-3">
      <!-- NEX AI Companion Message (Smaller 24px blob, tight gap, clear #EBF2FA chat bubble, smaller 11.5px text) -->
      <div class="flex items-start gap-2 px-0.5 ${getRevealClass(1, animatePage)}">
        <img src="./bosshire-ai-blob.png" alt="NEX AI" class="w-6 h-6 rounded-full shrink-0 mt-0.5" />
        <div class="${animatePage ? 'oa-ai-sweep' : ''} bg-[#ebf2fa] rounded-[14px] rounded-tl-[4px] px-3 py-2 text-[11.5px] leading-[16px] text-[#282828]">
          First, tell me a little about your career background. I'll use this to find opportunities that match your experience.
        </div>
      </div>

      <!-- Section 1 — Experience: confirm what the CV says, or pick from the list -->
      ${
        showCvExperience
          ? `<div class="bg-white rounded-[18px] p-4 flex items-center justify-between gap-3 ${getRevealClass(2, animatePage)}">
               <div class="min-w-0">
                 <div class="text-[15px] leading-[21px] font-medium text-[#181d27]">${numText(cv.experienceText)}</div>
                 <div class="text-[12px] leading-[17px] text-[#717680] truncate">
                   ${numText(`From your CV · Counts as ${chosenExperience ? chosenExperience.label : '—'}`)}
                 </div>
               </div>
               <button onclick="editCvExperience()" class="oa-press h-[32px] px-3.5 rounded-full bg-[#f0f1f3] hover:bg-[#e6e8eb] text-[#414651] text-[12px] font-medium cursor-pointer shrink-0">
                 Change
               </button>
             </div>`
          : `<div class="bg-white rounded-[18px] p-4 space-y-2.5 ${getRevealClass(2, animatePage)}">
        <h2 class="text-[16px] leading-[22px] font-medium text-[#181d27]">
          What best describes your professional experience?
        </h2>

        <div class="space-y-1.5">
          ${experienceOptions
            .map((opt) => {
              const active = workbenchState.experienceLevel === opt.id;
              return `
                <button
                  onclick="setExperienceLevel('${opt.id}')"
                  class="oa-press w-full px-3.5 py-2.5 rounded-[14px] text-left flex items-center justify-between gap-2 cursor-pointer ${
                    active ? 'oa-tile-selected' : 'oa-row-muted'
                  }"
                >
                  <span class="text-[13px] leading-[19px] text-[#181d27]">${numText(opt.label)}</span>
                  <span class="w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors duration-150 ${
                    active ? 'bg-[#44658b]' : 'bg-white border-[1.5px] border-[#d0d5dd]'
                  }">
                    ${active ? `<span class="oa-check-pop w-1.5 h-1.5 rounded-full bg-white"></span>` : ''}
                  </span>
                </button>
              `;
            })
            .join('')}
        </div>
      </div>`
      }

      <!-- Section 2 — Preferred roles (Search first -> Recommendations appear after picking 1 role) -->
      <div class="bg-white rounded-[18px] p-4 space-y-3 ${getRevealClass(3, animatePage)}">
        <div>
          <div class="flex items-center justify-between gap-2">
            <h2 class="text-[16px] leading-[22px] font-medium text-[#181d27]">
              What roles are you interested in?
            </h2>
            <span class="text-[12px] text-[#717680] shrink-0">
              <span class="oa-fade-val font-mono-ds text-[#44658b]">${selectedCount}</span>/<span class="font-mono-ds">3</span>
            </span>
          </div>
          <p class="text-[12.5px] leading-[18px] text-[#717680] mt-0.5">
            ${numText('Search and choose up to 3 roles that match your career goals.')}
          </p>
        </div>

        ${
          cv && cvRoleIdeas.length > 0 && selectedCount < 3
            ? `<!-- Role ideas from the CV: suggestions only, nothing is selected until the user taps -->
               <div class="bg-[#f4f8fc] rounded-[14px] p-3 space-y-2">
                 <div class="flex items-start gap-1.5 text-[11.5px] leading-[16px] text-[#414651]">
                   <img src="./bosshire-ai-blob.png" alt="NEX" class="w-3.5 h-3.5 rounded-full shrink-0 mt-px" />
                   <span>From your CV, this looks like your field. Want to keep going here, or look for something else?</span>
                 </div>
                 <div class="flex flex-wrap gap-1.5">
                   ${cvRoleIdeas
                     .map(
                       (role) => `
                         <button
                           onclick="toggleRoleSelection('${role}')"
                           class="oa-press h-[28px] px-2.5 rounded-full bg-white hover:bg-[#ebf2fa] text-[#355070] text-[11.5px] inline-flex items-center gap-1 cursor-pointer"
                         >
                           <i data-lucide="plus" class="w-3 h-3"></i>
                           <span>${role}</span>
                         </button>
                       `
                     )
                     .join('')}
                 </div>
               </div>`
            : ''
        }

        <!-- Option A SearchField (40px full pill, --oa-surface #F5F6F8, borderless; white + 2px blue ring on focus) -->
        <div class="relative">
          <div class="h-[40px] px-3.5 rounded-full bg-[#f5f6f8] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#44658b]/25 flex items-center gap-2.5 transition">
            <i data-lucide="search" class="w-4 h-4 text-[#717680] shrink-0"></i>
            <input
              id="role-search-input"
              type="text"
              value="${workbenchState.roleSearchQuery.replace(/"/g, '&quot;')}"
              placeholder="${selectedCount >= 3 ? 'Maximum 3 roles selected' : 'Search roles (e.g. Product Designer)...'}"
              ${selectedCount >= 3 ? 'disabled' : ''}
              onfocus="openRoleDropdown()"
              onblur="closeRoleDropdownDelayed()"
              oninput="handleRoleSearchInput(this.value)"
              class="w-full bg-transparent text-[13px] text-[#181d27] placeholder:text-[#a4a7ae] focus:outline-none disabled:opacity-50"
            />
          </div>
          <div id="role-search-dropdown">${renderRoleDropdownHTML()}</div>
        </div>

        <!-- Selected Role Pills (Only shown after user selects from search) -->
        ${
          selectedCount > 0
            ? `<div class="flex flex-wrap gap-1.5">
                 ${workbenchState.selectedRoles
                   .map((role) => {
                     const popClass = workbenchState.lastChangedRole === role ? 'oa-chip-pop' : '';
                     return `
                       <button
                         onclick="toggleRoleSelection('${role}')"
                         class="oa-press ${popClass} h-[30px] px-3 rounded-full bg-[#ebf2fa] hover:bg-[#d4e4f7] text-[#355070] text-[12px] inline-flex items-center gap-1.5 cursor-pointer"
                       >
                         <span>${role}</span>
                         <i data-lucide="x" class="w-3 h-3 text-[#355070]"></i>
                       </button>
                     `;
                   })
                   .join('')}
               </div>`
            : ''
        }

        <!-- NEX Tailored Recommendations (Shown ONLY after user picks at least 1 role from search) -->
        ${
          selectedCount > 0 && recommendations.length > 0
            ? `<div class="pt-2 border-t border-[#edeef1] space-y-2 oa-chip-pop">
                 <div class="flex items-center gap-1.5 text-[11.5px] text-[#717680]">
                   <img src="./bosshire-ai-blob.png" alt="NEX" class="w-3.5 h-3.5 rounded-full" />
                   <span>NEX also recommends based on <span class="text-[#181d27]">${workbenchState.selectedRoles[0]}</span></span>
                 </div>
                 <div class="flex flex-wrap gap-1.5">
                   ${recommendations
                     .map((role) => {
                       const disabled = selectedCount >= 3;
                       return `
                         <button
                           onclick="toggleRoleSelection('${role}')"
                           class="oa-press h-[28px] px-2.5 rounded-full bg-[#f5f6f8] text-[#535862] text-[11.5px] inline-flex items-center gap-1 cursor-pointer ${
                             disabled ? 'opacity-45' : 'hover:bg-[#e4e6ea]'
                           }"
                         >
                           <i data-lucide="plus" class="w-3 h-3 text-[#717680]"></i>
                           <span>${role}</span>
                         </button>
                       `;
                     })
                     .join('')}
                 </div>
               </div>`
            : ''
        }
      </div>

      ${renderOnboardingFooter(
        {
          onclick: 'setScreen(3)',
          enabled: canContinue,
          hint: workbenchState.experienceLevel
            ? 'Choose at least one role to continue.'
            : 'Choose your experience and at least one role to continue.',
        },
        animatePage
      )}
    </div>
  `;
}

// ── SCREEN 3 (Step 2 of 5): Working Preferences (NEX Message + Location + Work Arrangement + Employment Type) ──
function renderScreen3(animatePage) {
  const cities = [
    { name: 'Jakarta', tz: 'GMT+7 (WIB)' },
    { name: 'Tangerang', tz: 'GMT+7 (WIB)' },
    { name: 'Bandung', tz: 'GMT+7 (WIB)' },
    { name: 'Surabaya', tz: 'GMT+7 (WIB)' },
    { name: 'Yogyakarta', tz: 'GMT+7 (WIB)' },
    { name: 'Denpasar, Bali', tz: 'GMT+8 (WITA)' },
  ];

  const arrangements = [
    { id: 'fully_remote', title: 'Fully remote' },
    { id: 'remote_id', title: 'Remote within Indonesia' },
    { id: 'hybrid', title: 'Hybrid' },
  ];

  const employmentOptions = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];

  const hours = workbenchState.workHours;
  const hourPct = (h) => (h / 24) * 100;
  const zone = parseTimezone(workbenchState.timezone);
  const canContinue =
    Boolean(workbenchState.city) &&
    workbenchState.workArrangements.length > 0 && workbenchState.employmentTypes.length > 0 && Boolean(workbenchState.workHours);

  // 6. Small marker on a question that still needs an answer (instead of counting questions in the hint)
  const requiredMark = (answered) =>
    answered
      ? ''
      : `<span class="h-[20px] px-2 rounded-full bg-[#fffaeb] text-[#b54708] text-[10.5px] inline-flex items-center gap-1 shrink-0 mt-0.5">
           <span class="w-1.5 h-1.5 rounded-full bg-[#f79626]"></span>Required
         </span>`;

  // 7. "Open to all" replaces every other choice (see toggles), so it leads the group in the tint style
  // with a globe icon, instead of looking like one more option
  const renderOpenToAll = (active, onclick) => `
    <button
      onclick="${onclick}"
      aria-pressed="${active}"
      class="oa-press h-[32px] px-3.5 rounded-full text-[12.5px] cursor-pointer inline-flex items-center gap-1.5 ${
        active ? 'bg-[#44658b] text-white' : 'bg-[#ebf2fa] text-[#355070] hover:bg-[#d4e4f7]'
      }"
    >
      <i data-lucide="globe" class="w-3.5 h-3.5"></i>
      <span>Open to all</span>
    </button>
  `;

  // Multi-select pill shared by arrangement and employment type; "Open to all" is exclusive (see toggles)
  const renderChoicePill = (label, active, onclick) => `
    <button
      onclick="${onclick}"
      aria-pressed="${active}"
      class="oa-press h-[32px] px-3.5 rounded-full text-[12.5px] cursor-pointer ${
        active ? 'bg-[#44658b] text-white' : 'bg-[#f5f6f8] text-[#414651] hover:bg-[#e4e6ea]'
      }"
    >
      ${label}
    </button>
  `;

  return `
    <div class="px-3 pb-3 flex-1 flex flex-col gap-3">
      <!-- NEX AI Companion Message (24px blob, #EBF2FA chat bubble, 11.5px text) -->
      <div class="flex items-start gap-2 px-0.5 ${getRevealClass(1, animatePage)}">
        <img src="./bosshire-ai-blob.png" alt="NEX AI" class="w-6 h-6 rounded-full shrink-0 mt-0.5" />
        <div class="${animatePage ? 'oa-ai-sweep' : ''} bg-[#ebf2fa] rounded-[14px] rounded-tl-[4px] px-3 py-2 text-[11.5px] leading-[16px] text-[#282828]">
          Great! Now let's find out how and where you'd like to work.
        </div>
      </div>

      <!-- Section 1 — Working hours (first: the one answer that decides every Reality Check) -->
      <div data-hours-card class="bg-white rounded-[18px] p-4 space-y-3 ${getRevealClass(2, animatePage)}">
        <div>
          <div class="flex items-start justify-between gap-2">
            <h2 class="text-[16px] leading-[22px] font-medium text-[#181d27]">
              Which hours can you work?
            </h2>
            ${requiredMark(Boolean(hours))}
          </div>
          <p class="text-[12.5px] leading-[18px] text-[#717680] mt-0.5">
            Global teams often need overlap outside WIB office hours. NEX checks every role against this window.
          </p>
        </div>

        <div class="flex flex-wrap gap-1.5">
          ${workHoursPresets
            .map((preset) =>
              renderChoicePill(preset.label, hours.start === preset.start && hours.end === preset.end, `setWorkHoursPreset('${preset.id}')`)
            )
            .join('')}
        </div>

        <!-- 24h track: drag either handle, or use the steppers below -->
        <div class="space-y-1.5">
          ${renderHoursTrack({
            attrs: 'data-hours-track',
            segments: [{ start: hours.start, end: hours.end, cls: 'bg-[#44658b]', attrs: 'data-hours-segment' }],
            extra: ['start', 'end']
              .map(
                (edge) => `
              <button
                type="button"
                data-hours-handle="${edge}"
                role="slider"
                aria-label="${edge === 'start' ? 'From' : 'Until'}"
                aria-valuemin="0"
                aria-valuemax="24"
                aria-valuenow="${hours[edge]}"
                aria-valuetext="${formatWibHour(hours[edge])}"
                onpointerdown="startWorkHoursDrag(event, '${edge}')"
                onkeydown="handleWorkHoursKey(event, '${edge}')"
                class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-2 border-[#44658b] cursor-grab active:cursor-grabbing flex items-center justify-center gap-[2px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#44658b]/30"
                style="left: ${hourPct(hours[edge])}%"
              >
                <span class="w-[1.5px] h-2 rounded-full bg-[#44658b]/50"></span>
                <span class="w-[1.5px] h-2 rounded-full bg-[#44658b]/50"></span>
              </button>
            `
              )
              .join(''),
          })}
          ${renderHoursTicks()}
        </div>

        <div class="grid grid-cols-2 gap-2">
          ${[
            { edge: 'start', label: 'From' },
            { edge: 'end', label: 'Until' },
          ]
            .map(
              (f) => `
            <div class="space-y-1">
              <div class="text-[11.5px] text-[#717680] px-1">${f.label}</div>
              <div class="h-[40px] rounded-full bg-[#f5f6f8] flex items-center justify-between px-1">
                <button onclick="stepWorkHours('${f.edge}', -1)" aria-label="${f.label} one hour earlier" class="oa-press w-8 h-8 rounded-full bg-white text-[#414651] flex items-center justify-center cursor-pointer">
                  <i data-lucide="minus" class="w-3.5 h-3.5"></i>
                </button>
                <span data-hours-value="${f.edge}" class="font-mono-ds text-[14px] text-[#181d27]">${formatWibHour(hours[f.edge])}</span>
                <button onclick="stepWorkHours('${f.edge}', 1)" aria-label="${f.label} one hour later" class="oa-press w-8 h-8 rounded-full bg-white text-[#414651] flex items-center justify-center cursor-pointer">
                  <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </div>
          `
            )
            .join('')}
        </div>

        <p data-hours-summary class="text-[12px] leading-[17px] text-[#414651]">${renderWorkHoursSummary(hours, workbenchState.timezone)}</p>
      </div>

      <!-- Section 2 — Current location (18px Flat White Card) -->
      <div class="bg-white rounded-[18px] p-4 space-y-3 ${getRevealClass(3, animatePage)}">
        <div>
          <div class="flex items-start justify-between gap-2">
            <h2 class="text-[16px] leading-[22px] font-medium text-[#181d27]">
              Where are you currently based?
            </h2>
            ${requiredMark(Boolean(workbenchState.city))}
          </div>
          <p class="text-[12.5px] leading-[18px] text-[#717680] mt-0.5">
            We'll use your location to find remote opportunities available in your area.
          </p>
        </div>

        <div class="space-y-2">
          <!-- Country -->
          <div class="px-3.5 py-2.5 rounded-[14px] bg-[#f7f8fa] flex items-center justify-between text-[13px]">
            <span class="text-[#717680]">Country</span>
            <span class="text-[#181d27] inline-flex items-center gap-1.5">
              <span>🇮🇩</span>
              <span>${workbenchState.country}</span>
            </span>
          </div>

          <!-- City Selector (40px Pill Dropdown) -->
          <div class="relative">
            <button
              type="button"
              onclick="toggleCityDropdown()"
              class="oa-press w-full px-3.5 py-2.5 rounded-[14px] bg-[#f7f8fa] hover:bg-[#f0f1f3] flex items-center justify-between text-[13px] cursor-pointer"
            >
              <span class="text-[#717680]">City</span>
              <span class="inline-flex items-center gap-1.5 ${workbenchState.city ? 'text-[#181d27]' : 'text-[#44658b]'}">
                <span>${workbenchState.city || 'Select your city'}</span>
                <i data-lucide="chevron-down" class="w-4 h-4 text-[#717680] transition-transform duration-150 ${workbenchState.cityDropdownOpen ? 'rotate-180' : ''}"></i>
              </span>
            </button>

            ${
              workbenchState.cityDropdownOpen
                ? `<div class="absolute left-0 right-0 top-[calc(100%+6px)] z-30 bg-white rounded-[14px] p-1.5 shadow-[0_8px_24px_-6px_rgba(16,24,40,0.18),0_2px_4px_rgba(16,24,40,0.04)] oa-chip-pop">
                     ${cities
                       .map((c) => {
                         const active = workbenchState.city === c.name;
                         return `
                           <button
                             type="button"
                             onclick="selectCity('${c.name}', '${c.tz}')"
                             class="w-full px-3 py-2 rounded-[10px] text-left text-[13px] flex items-center justify-between cursor-pointer ${
                               active ? 'bg-[#ebf2fa] text-[#355070]' : 'text-[#181d27] hover:bg-[#f5f6f8]'
                             }"
                           >
                             <span>${c.name}</span>
                             <span class="text-[11.5px] text-[#717680]">${numText(c.tz)}</span>
                           </button>
                         `;
                       })
                       .join('')}
                   </div>`
                : ''
            }
          </div>

          <!-- Timezone: set by the city; a change is called out instead of happening silently -->
          <div class="px-3.5 py-2.5 rounded-[14px] ${workbenchState.timezoneChangedFrom ? 'bg-[#ebf2fa]' : 'bg-[#f7f8fa]'} flex items-center justify-between text-[13px] transition-colors duration-300">
            <span class="text-[#717680]">Timezone</span>
            ${
              workbenchState.city
                ? `<span class="oa-fade-val inline-flex items-center gap-1.5 ${workbenchState.timezoneChangedFrom ? 'text-[#355070] font-medium' : 'text-[#181d27]'}">
                     ${workbenchState.timezoneChangedFrom ? '<span class="h-[20px] px-2 rounded-full bg-white text-[#44658b] text-[10.5px] font-normal inline-flex items-center">Updated</span>' : ''}
                     <span>${numText(workbenchState.timezone)}</span>
                   </span>`
                : `<span class="text-[#a4a7ae]">Set by your city</span>`
            }
          </div>
          ${
            workbenchState.city
              ? `<p class="px-1 text-[11.5px] leading-[16px] ${workbenchState.timezoneChangedFrom ? 'text-[#355070]' : 'text-[#717680]'}">
                   ${numText(
                     workbenchState.timezoneChangedFrom
                       ? `${workbenchState.city} is on ${zone.abbr}, not ${parseTimezone(workbenchState.timezoneChangedFrom).abbr}. Your working hours above are now read as ${zone.abbr}.`
                       : `${workbenchState.city} is on ${zone.abbr}. Your working hours above are read as ${zone.abbr}.`
                   )}
                 </p>`
              : ''
          }
        </div>
      </div>

      <!-- Section 3 — Work arrangement (18px Flat White Card, multi-select pills) -->
      <div class="bg-white rounded-[18px] p-4 space-y-3 ${getRevealClass(4, animatePage)}">
        <div>
          <div class="flex items-start justify-between gap-2">
            <h2 class="text-[16px] leading-[22px] font-medium text-[#181d27]">
              How would you like to work?
            </h2>
            ${requiredMark(workbenchState.workArrangements.length > 0)}
          </div>
          <p class="text-[12.5px] leading-[18px] text-[#717680] mt-0.5">
            Choose all the arrangements that work for you, or Open to all.
          </p>
        </div>

        <div class="flex flex-wrap gap-1.5">
          ${renderOpenToAll(workbenchState.workArrangements.includes('open_all'), "toggleWorkArrangement('open_all')")}
          ${arrangements
            .map((arr) => renderChoicePill(arr.title, workbenchState.workArrangements.includes(arr.id), `toggleWorkArrangement('${arr.id}')`))
            .join('')}
        </div>
      </div>

      <!-- Section 4 — Employment type (18px Flat White Card) -->
      <div class="bg-white rounded-[18px] p-4 space-y-3 ${getRevealClass(4, animatePage)}">
        <div>
          <div class="flex items-start justify-between gap-2">
            <h2 class="text-[16px] leading-[22px] font-medium text-[#181d27]">
              What type of employment are you looking for?
            </h2>
            ${requiredMark(workbenchState.employmentTypes.length > 0)}
          </div>
          <p class="text-[12.5px] leading-[18px] text-[#717680] mt-0.5">
            Choose all that apply, or Open to all.
          </p>
        </div>

        <div class="flex flex-wrap gap-1.5">
          ${renderOpenToAll(workbenchState.employmentTypes.includes('Open to all'), "toggleEmploymentType('Open to all')")}
          ${employmentOptions
            .map((type) => renderChoicePill(type, workbenchState.employmentTypes.includes(type), `toggleEmploymentType('${type}')`))
            .join('')}
        </div>
      </div>

      ${renderOnboardingFooter(
        { onclick: 'setScreen(4)', enabled: canContinue, hint: 'Answer the questions marked Required to continue.' },
        animatePage
      )}
    </div>
  `;
}

// ── SCREEN 4 (Step 3 of 5): Salary Expectations (NEX Message + Currency + Minimum Salary + Preferred Salary) ──
function renderScreen4(animatePage) {
  const currencies = [
    { id: 'IDR', label: 'IDR (Rp)', symbol: 'Rp', minPh: '10,000,000', idealPh: '15,000,000' },
    { id: 'USD', label: 'USD ($)', symbol: '$', minPh: '2,000', idealPh: '3,000' },
    { id: 'SGD', label: 'SGD (S$)', symbol: 'S$', minPh: '3,000', idealPh: '4,500' },
    { id: 'AUD', label: 'AUD (A$)', symbol: 'A$', minPh: '3,500', idealPh: '5,000' },
    { id: 'EUR', label: 'EUR (€)', symbol: '€', minPh: '2,200', idealPh: '3,200' },
    { id: 'GBP', label: 'GBP (£)', symbol: '£', minPh: '2,000', idealPh: '3,000' },
  ];

  const activeCurr = currencies.find((c) => c.id === workbenchState.currency) || currencies[0];

  return `
    <div class="px-3 pb-3 flex-1 flex flex-col gap-3">
      <!-- NEX AI Companion Message (24px blob, #EBF2FA chat bubble, 11.5px text) -->
      <div class="flex items-start gap-2 px-0.5 ${getRevealClass(1, animatePage)}">
        <img src="./bosshire-ai-blob.png" alt="NEX AI" class="w-6 h-6 rounded-full shrink-0 mt-0.5" />
        <div class="${animatePage ? 'oa-ai-sweep' : ''} bg-[#ebf2fa] rounded-[14px] rounded-tl-[4px] px-3 py-2 text-[11.5px] leading-[16px] text-[#282828]">
          Almost there! Let's talk about your salary expectations so I can find opportunities that fit your goals.
        </div>
      </div>

      <!-- Section 1 — Currency (18px Flat White Card) -->
      <div class="bg-white rounded-[18px] p-4 space-y-3 ${getRevealClass(2, animatePage)}">
        <div>
          <h2 class="text-[16px] leading-[22px] font-medium text-[#181d27]">
            Which currency do you prefer?
          </h2>
          <p class="text-[12.5px] leading-[18px] text-[#717680] mt-0.5">
            Set your expectations in any currency. NEX always shows what a role really pays in rupiah.
          </p>
        </div>

        <div class="flex flex-wrap gap-1.5">
          ${currencies
            .map((c) => {
              const active = workbenchState.currency === c.id;
              return `
                <button
                  onclick="setSalaryCurrency('${c.id}')"
                  class="oa-press h-[32px] px-3.5 rounded-full text-[12.5px] cursor-pointer ${
                    active
                      ? 'bg-[#44658b] text-white'
                      : 'bg-[#f5f6f8] text-[#414651] hover:bg-[#e4e6ea]'
                  }"
                >
                  ${c.label}
                </button>
              `;
            })
            .join('')}
        </div>
      </div>

      <!-- Section 2 — Minimum salary (18px Flat White Card) -->
      <div class="bg-white rounded-[18px] p-4 space-y-3 ${getRevealClass(3, animatePage)}">
        <div>
          <h2 class="text-[16px] leading-[22px] font-medium text-[#181d27]">
            What's the minimum monthly salary you'd accept?
          </h2>
          <p class="text-[12.5px] leading-[18px] text-[#717680] mt-0.5">
            Roles that can't reach this are flagged as below your minimum.
          </p>
        </div>
          <div class="h-[40px] px-4 rounded-full bg-[#f5f6f8] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#44658b]/25 flex items-center gap-2 transition">
            <span class="text-[13px] text-[#535862] shrink-0">${activeCurr.symbol}</span>
            <input
              type="text"
              inputmode="numeric"
              value="${formatSalaryDigits(workbenchState.minSalaryInput)}"
              placeholder="${activeCurr.minPh}"
              oninput="updateMinSalaryInput(this)"
              class="w-full bg-transparent font-mono-ds text-[13px] text-[#181d27] placeholder:text-[#a4a7ae] focus:outline-none"
            />
          </div>
      </div>

      <!-- Section 3 — Ideal salary (18px Flat White Card) -->
      <div class="bg-white rounded-[18px] p-4 space-y-3 ${getRevealClass(4, animatePage)}">
        <div>
          <h2 class="text-[16px] leading-[22px] font-medium text-[#181d27]">
            What's your ideal monthly salary?
          </h2>
          <p class="text-[12.5px] leading-[18px] text-[#717680] mt-0.5">
            Roles that reach it rank above ones that only clear your minimum.
          </p>
        </div>
          <div class="h-[40px] px-4 rounded-full bg-[#f5f6f8] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#44658b]/25 flex items-center gap-2 transition">
            <span class="text-[13px] text-[#535862] shrink-0">${activeCurr.symbol}</span>
            <input
              type="text"
              inputmode="numeric"
              value="${formatSalaryDigits(workbenchState.idealSalaryInput)}"
              placeholder="${activeCurr.idealPh}"
              oninput="updateIdealSalaryInput(this)"
              class="w-full bg-transparent font-mono-ds text-[13px] text-[#181d27] placeholder:text-[#a4a7ae] focus:outline-none"
            />
          </div>

        ${
          workbenchState.salaryError
            ? `<div class="bg-[#fef3f2] text-[#b42318] rounded-[14px] px-3.5 py-2.5 text-[12px] leading-[17px] flex items-center gap-2 oa-chip-pop">
                 <i data-lucide="alert-circle" class="w-4 h-4 shrink-0"></i>
                 <span>${workbenchState.salaryError}</span>
               </div>`
            : ''
        }
      </div>

      <!-- Helper text (14px soft frame) -->
      <div class="bg-[#f7f8fa] rounded-[14px] px-3.5 py-2.5 flex items-start gap-2.5 text-[12px] leading-[17px] text-[#535862]">
        <i data-lucide="info" class="w-4 h-4 text-[#44658b] shrink-0 mt-0.5"></i>
        <span>Only the minimum is needed. Your ideal salary is optional, and you can change both later in your profile.</span>
      </div>

      ${renderOnboardingFooter(
        {
          onclick: 'validateSalaryAndContinue()',
          enabled: Number(String(workbenchState.minSalaryInput || '').replace(/[^\d]/g, '')) > 0,
          hint: 'Add your minimum salary so NEX can compare pay in rupiah.',
        },
        animatePage
      )}
    </div>
  `;
}

const processingStepsList = [
  'Reviewing your career profile',
  'Understanding your skills and preferences',
  'Matching relevant remote opportunities',
  'Preparing your personalized job recommendations',
];

function renderProcessingStepsHTML(step) {
  return processingStepsList
    .map((label, idx) => {
      const done = step > idx;
      const active = step === idx;
      return `
        <div class="px-3.5 py-2.5 rounded-[14px] flex items-center gap-3 transition-colors duration-300 ${
          done ? 'bg-[#ecfdf3]/70' : active ? 'bg-[#ebf2fa]' : 'bg-[#f7f8fa]'
        }">
          ${
            done
              ? `<span class="oa-check-pop w-5 h-5 rounded-full bg-[#039855] text-white flex items-center justify-center shrink-0">
                   <i data-lucide="check" class="w-3 h-3"></i>
                 </span>`
              : active
              ? `<span class="w-5 h-5 rounded-full bg-[#44658b]/15 flex items-center justify-center shrink-0">
                   <span class="w-2 h-2 rounded-full bg-[#44658b] animate-ping"></span>
                 </span>`
              : `<span class="w-5 h-5 rounded-full bg-white border-[1.5px] border-[#d0d5dd] shrink-0"></span>`
          }
          <span class="text-[12.5px] leading-[18px] ${
            done ? 'text-[#027a48]' : active ? 'text-[#181d27]' : 'text-[#717680]'
          }">${label}</span>
        </div>
      `;
    })
    .join('');
}

// ── SCREEN 5 (Step 4 of 5): Career Goals (Priorities up to 3 + Availability) ──
function renderScreen5(animatePage) {
  const priorities = [
    'Better compensation',
    'Career growth',
    'Work-life balance',
    'International exposure',
    'Learning opportunities',
    'Flexible working hours',
    'Job security',
    'Meaningful work',
  ];

  const availabilityOptions = [
    { id: 'immediately', label: 'Immediately' },
    { id: '2_weeks', label: 'Within 2 weeks' },
    { id: '1_month', label: 'Within 1 month' },
    { id: '2_3_months', label: 'Within 2–3 months' },
    { id: 'exploring', label: 'Still exploring' },
  ];

  const count = workbenchState.careerPriorities.length;
  const canContinue = count > 0 && Boolean(workbenchState.availability);

  return `
    <div class="px-3 pb-3 flex-1 flex flex-col gap-3">
      <!-- NEX AI Companion Message -->
      <div class="flex items-start gap-2 px-0.5 ${getRevealClass(1, animatePage)}">
        <img src="./bosshire-ai-blob.png" alt="NEX AI" class="w-6 h-6 rounded-full shrink-0 mt-0.5" />
        <div class="${animatePage ? 'oa-ai-sweep' : ''} bg-[#ebf2fa] rounded-[14px] rounded-tl-[4px] px-3 py-2 text-[11.5px] leading-[16px] text-[#282828]">
          Last one! What would make your next job feel like the right move for you?
        </div>
      </div>

      <!-- Section 1 — Career Priorities (18px Flat White Card) -->
      <div class="bg-white rounded-[18px] p-4 space-y-2.5 ${getRevealClass(2, animatePage)}">
        <div>
          <div class="flex items-center justify-between gap-2">
            <h2 class="text-[16px] leading-[22px] font-medium text-[#181d27]">
              What matters most in your next opportunity?
            </h2>
            <span class="text-[12px] text-[#717680] shrink-0">
              <span class="oa-fade-val font-mono-ds text-[#44658b]">${count}</span>/<span class="font-mono-ds">3</span>
            </span>
          </div>
          <p class="text-[12.5px] leading-[18px] text-[#717680] mt-0.5">
            ${numText('Choose up to 3 priorities.')}
          </p>
        </div>

        <div class="flex flex-wrap gap-1.5">
          ${priorities
            .map((p) => {
              const active = workbenchState.careerPriorities.includes(p);
              const disabled = !active && count >= 3;
              return `
                <button
                  onclick="toggleCareerPriority('${p}')"
                  class="oa-press h-[32px] px-3.5 rounded-full text-[12px] cursor-pointer ${
                    active
                      ? 'bg-[#44658b] text-white'
                      : disabled
                      ? 'bg-[#f5f6f8] text-[#a4a7ae] opacity-55'
                      : 'bg-[#f5f6f8] text-[#414651] hover:bg-[#e4e6ea]'
                  }"
                >
                  ${p}
                </button>
              `;
            })
            .join('')}
        </div>
      </div>

      <!-- Section 2 — Availability (18px Flat White Card) -->
      <div class="bg-white rounded-[18px] p-4 space-y-3 ${getRevealClass(3, animatePage)}">
        <h2 class="text-[16px] leading-[22px] font-medium text-[#181d27]">
          When could you start a new role?
        </h2>

        <div class="space-y-1.5">
          ${availabilityOptions
            .map((opt) => {
              const active = workbenchState.availability === opt.id;
              return `
                <button
                  onclick="setAvailability('${opt.id}')"
                  class="oa-press w-full px-3.5 py-2.5 rounded-[14px] text-left flex items-center justify-between gap-2 cursor-pointer ${
                    active ? 'oa-tile-selected' : 'oa-row-muted'
                  }"
                >
                  <span class="text-[13px] leading-[19px] text-[#181d27]">${numText(opt.label)}</span>
                  <span class="w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors duration-150 ${
                    active ? 'bg-[#44658b]' : 'bg-white border-[1.5px] border-[#d0d5dd]'
                  }">
                    ${active ? `<span class="oa-check-pop w-1.5 h-1.5 rounded-full bg-white"></span>` : ''}
                  </span>
                </button>
              `;
            })
            .join('')}
        </div>

        <!-- Helper Text -->
        <div class="bg-[#f7f8fa] rounded-[14px] px-3.5 py-2.5 flex items-start gap-2.5 text-[12px] leading-[17px] text-[#535862]">
          <i data-lucide="info" class="w-4 h-4 text-[#44658b] shrink-0 mt-0.5"></i>
          <span>You can always update your preferences as your career goals evolve.</span>
        </div>
      </div>

      ${renderOnboardingFooter(
        { onclick: 'setScreen(6)', enabled: canContinue, hint: 'Choose at least one priority and when you could start.' },
        animatePage
      )}
    </div>
  `;
}

// ── SCREEN 6: AI Personalization (processing after the 4 steps; not counted as a step) ──
function renderScreen6(animatePage) {
  const step = workbenchState.viewMode === 'canvas' ? 4 : workbenchState.processingStep;
  const isReady = step >= 4;
  const pct = Math.min(100, Math.round((step / 4) * 100));

  return `
    <div class="px-3 pb-3 flex-1 flex flex-col gap-3">
      <!-- Main Processing / Success Card (18px Flat White Card) -->
      <div class="bg-white rounded-[18px] p-5 flex-1 flex flex-col justify-between ${getRevealClass(1, animatePage)}">
        <!-- Top Animated NEX Orb + Title -->
        <div class="flex flex-col items-center text-center pt-1">
          <div class="relative w-[136px] h-[136px] flex items-center justify-center">
            <div class="nex-halo" style="width: 136px; height: 136px;"></div>
            <img
              src="./bosshire-ai-blob.png"
              alt="NEX AI"
              class="nex-orb relative z-10 w-[88px] h-[88px] rounded-full object-contain"
            />
          </div>

          <div id="processing-header-block" class="mt-2 space-y-1.5">
            ${
              isReady
                ? `<div class="oa-fade-val space-y-1.5">
                     <span class="h-[26px] px-3 rounded-full bg-[#ecfdf3] text-[#027a48] text-[11.5px] inline-flex items-center gap-1.5">
                       <span class="w-1.5 h-1.5 rounded-full bg-[#039855]"></span>
                       <span>Profile ready</span>
                     </span>
                     <h1 class="text-[20px] leading-[26px] font-medium text-[#181d27]">
                       Your career profile is ready!
                     </h1>
                     <p class="text-[12.5px] leading-[18px] text-[#535862] px-2">
                       I've found opportunities worth exploring. Let's take a look at what's next.
                     </p>
                   </div>`
                : `<h1 class="text-[20px] leading-[26px] font-medium text-[#181d27]">
                     Finding the right<br />opportunities for you...
                   </h1>`
            }
          </div>
        </div>

        <!-- 4 Processing Steps List -->
        <div id="processing-steps-list" class="space-y-2 my-3">
          ${renderProcessingStepsHTML(step)}
        </div>

        <!-- Bottom Bar: Progress during processing -> Explore opportunities CTA on Success -->
        <div id="processing-footer-block" class="pt-1">
          ${
            isReady
              ? `<div class="w-full oa-reveal space-y-2">
                   <button
                     onclick="setScreen(7)"
                     class="oa-press w-full h-[42px] rounded-full bg-[#44658b] hover:bg-[#355070] text-white text-[13px] cursor-pointer inline-flex items-center justify-center gap-2"
                   >
                     <span>Explore opportunities</span>
                     <i data-lucide="arrow-right" class="w-4 h-4"></i>
                   </button>
                 </div>`
              : `<div class="space-y-2">
                   <div class="w-full h-[6px] rounded-full bg-[#e4e6ea] overflow-hidden">
                     <div class="oa-progress-fill h-full rounded-full bg-[#44658b]" style="width: ${Math.max(18, pct)}%"></div>
                   </div>
                   <div class="text-center text-[11.5px] text-[#717680]">
                     Matching profile · <span class="font-mono-ds text-[#181d27]">${pct}</span>%
                   </div>
                 </div>`
          }
        </div>
      </div>
    </div>
  `;
}

// Illustrative sample jobs catalog (clearly labeled as sample data)
const sampleJobsCatalog = [
  {
    id: 'job-1',
    title: 'Product Designer',
    company: 'Karya Cloud (Sample)',
    initials: 'KC',
    logo: './logos/logo-01.svg',
    avatarBg: 'bg-[#ebf2fa] text-[#355070]',
    arrangement: 'Fully remote',
    location: 'Worldwide · Indonesia eligible',
    locationFlag: '🇮🇩',
    type: 'Full-time',
    salary: 'IDR 14–20M / month',
    timezone: 'GMT+7 (WIB) · Async-first',
    category: 'recommended',
    shareUrl: 'https://upnext.id/check/karya-cloud-product-designer', // UpNext's Reality Check of this listing, not the listing itself
    source: 'Karya Cloud careers page', // where UpNext read this listing
    sourceUrl: 'https://karyacloud.example/careers/product-designer', // the original listing UpNext read
    lastCheckedAt: '2026-11-16', // when NEX last re-read it (YYYY-MM-DD)
    whoIsHiring: {
      // What UpNext can see about who is behind the listing: a trace, never a judgement that the company is genuine
      postedBy: 'employer', // 'employer' | 'agency' | 'repost'
      poster: 'Karya Cloud',
      posterRole: 'the employer',
      applyHostIs: 'Karya Cloud’s careers page',
      summary: 'Karya Cloud posted this on its own careers page, and applications go straight to it.',
    },
    reasons: [
      'Matches your design experience.',
      'Fits your salary expectations.',
      'Available to candidates in Indonesia.',
    ],
    summary:
      'Lead end-to-end product design for remote collaboration tools used across APAC and Europe. Flexible async schedule with 3h afternoon WIB overlap.',
    companyInfo: {
      overview:
        'Karya Cloud is a remote-first technology company developing collaboration tools for distributed teams across APAC and Europe.',
      industry: 'SaaS & Collaboration Technology',
      size: '45–80 people',
      headquarters: 'Singapore (Remote-first)',
      website: 'karyacloud.example',
      teamLocations: 'Indonesia, Singapore, Philippines, Germany',
      remotePolicy: 'Remote-first · Async-first documentation culture',
      hiringCountries: ['Indonesia', 'Singapore', 'Philippines', 'Germany'],
      teamCollab: 'APAC and Europe',
      workingStyle: 'Async-first',
      employeeInsightsAvailable: true,
    },
    roleDetails: {
      overview:
        'You will own core product workflows from discovery and wireframing through design system implementation, partnering closely with engineering and product leads across APAC and Europe.',
      responsibilities: [
        'Lead end-to-end UX/UI design for workspace and async collaboration features.',
        'Maintain and evolve our Figma component library and design tokens.',
        'Conduct lightweight remote usability testing with distributed users.',
        'Document design decisions clearly for async engineering handoff.',
      ],
      requiredQualifications: [
        '3+ years of experience designing SaaS or mobile web products.',
        'Strong portfolio demonstrating end-to-end product problem solving.',
        'Proficiency in Figma and component-driven design systems.',
      ],
      preferredQualifications: [
        'Experience collaborating with distributed international teams.',
        'Familiarity with Web3 or developer productivity workflows.',
      ],
      requiredSkills: ['Product Design', 'Figma', 'Design Systems', 'Prototyping', 'UX Research'],
      niceToHaveSkills: ['HTML/CSS', 'Web3 UX', 'Async Documentation'],
      experienceYears: { min: 3, max: 5, label: '3–5 years' },
    },
    compensation: {
      min: 14000000,
      max: 20000000,
      currency: 'IDR',
      period: 'month',
      arrangement: 'Fully remote',
      eligibilityStatus: 'eligible',
      eligibilityLabel: 'Worldwide, explicitly including Indonesia',
      timezone: 'GMT+7 (WIB)',
      timezoneOffset: 7,
      requiredOverlapHours: 3,
      overlapLabel: '3 hours in the afternoon WIB',
      overlapWibHours: { start: 14, end: 17 },
      scheduleConfirmed: true,
      benefits: ['Remote workstation stipend', 'Flexible PTO', 'Annual learning budget'],
    },
    applicationMethod: {
      type: 'company_site',
      label: 'Apply through company website',
      url: 'https://karyacloud.example/careers/product-designer',
      note: 'Employer accepts applications via their official careers page. UpNext does not submit on your behalf.',
    },
  },
  {
    id: 'job-2',
    title: 'UI/UX Designer',
    company: 'Nusantara Studio (Sample)',
    initials: 'NS',
    logo: './logos/logo-03.svg',
    avatarBg: 'bg-[#ecfdf3] text-[#027a48]',
    arrangement: 'Remote within Indonesia',
    location: 'Indonesia only',
    locationFlag: '🇮🇩',
    type: 'Full-time',
    salary: 'IDR 12–16M / month',
    timezone: 'GMT+7 (WIB) · 09:00–17:00',
    category: 'recommended',
    shareUrl: 'https://upnext.id/check/nusantara-studio-ui-ux-designer',
    source: 'LinkedIn Jobs',
    sourceUrl: 'https://www.linkedin.com/jobs/view/sample-nusantara-studio-ui-ux-designer',
    lastCheckedAt: '2026-11-15',
    whoIsHiring: {
      postedBy: 'employer',
      poster: 'Nusantara Studio',
      posterRole: 'the employer, from its LinkedIn page',
      applyHostIs: 'LinkedIn Jobs, inside the employer’s post',
      summary: 'Nusantara Studio posted this from its own LinkedIn company page, and you apply inside that post.',
    },
    reasons: [
      'Aligned with Indonesia remote hours.',
      'Strong focus on mobile UI systems.',
      'Direct local payroll in IDR.',
    ],
    summary:
      'Design consumer mobile interfaces and component libraries with an Indonesian product team working 100% remotely.',
    companyInfo: {
      overview:
        'Nusantara Studio builds consumer fintech and productivity apps tailored for Indonesian mobile users, operating with a fully remote team across Java and Bali.',
      industry: 'Consumer Mobile & Digital Studio',
      size: '20–40 people',
      headquarters: 'Bandung, Indonesia',
      website: 'nusantarastudio.example',
      teamLocations: 'Indonesia (Jakarta, Bandung, Yogyakarta, Bali)',
      remotePolicy: '100% remote within Indonesia',
      hiringCountries: ['Indonesia'],
      teamCollab: 'Indonesia-wide',
      workingStyle: 'Synchronous WIB core hours',
      employeeInsightsAvailable: false,
    },
    roleDetails: {
      overview:
        'Join our product squad to craft intuitive iOS and Android flows, iterate from user feedback, and keep our mobile UI kit consistent.',
      responsibilities: [
        'Design high-craft mobile screens and interactive prototypes in Figma.',
        'Partner with iOS/Android engineers during sprint reviews.',
        'Refine onboarding and checkout funnels based on analytics.',
      ],
      requiredQualifications: [
        '2+ years of mobile UI/UX design experience.',
        'Fluency in Figma auto-layout and mobile design guidelines.',
      ],
      preferredQualifications: [
        'Experience with fintech or consumer marketplace apps.',
      ],
      requiredSkills: ['Mobile UI', 'Figma', 'Prototyping', 'Design Systems'],
      niceToHaveSkills: ['Micro-interactions', 'Usability Testing'],
      experienceYears: { min: 2, max: 4, label: '2–4 years' },
    },
    compensation: {
      min: 12000000,
      max: 16000000,
      currency: 'IDR',
      period: 'month',
      arrangement: 'Remote within Indonesia',
      eligibilityStatus: 'eligible',
      eligibilityLabel: 'Indonesia residents only',
      timezone: 'GMT+7 (WIB)',
      timezoneOffset: 7,
      requiredOverlapHours: 6,
      overlapLabel: '09:00–17:00 WIB',
      overlapWibHours: { start: 9, end: 17 },
      scheduleConfirmed: true,
      benefits: ['BPJS Kesehatan & Ketenagakerjaan', 'THR', 'Home office allowance'],
    },
    applicationMethod: {
      type: 'job_board',
      label: 'Apply on LinkedIn Jobs',
      url: 'https://www.linkedin.com/jobs/view/sample-nusantara-studio-ui-ux-designer',
      note: 'The employer takes applications through its LinkedIn Jobs post. UpNext does not submit on your behalf.',
    },
  },
  {
    id: 'job-3',
    title: 'Visual & Product Designer',
    company: 'Pacific Remote Lab (Sample)',
    initials: 'PR',
    logo: './logos/logo-08.svg',
    avatarBg: 'bg-[#ffe4d5] text-[#414651]',
    arrangement: 'Fully remote',
    location: 'APAC · Indonesia eligible',
    locationFlag: '🌏',
    type: 'Contract',
    salary: 'USD 1,800–2,400 / month',
    timezone: 'GMT+7 / GMT+8 overlap',
    category: 'popular',
    shareUrl: 'https://upnext.id/check/pacific-remote-lab-visual-product',
    source: 'Remote OK',
    sourceUrl: 'https://remoteok.com/remote-jobs/sample-pacific-remote-lab-visual-product-designer',
    lastCheckedAt: '2026-11-12',
    whoIsHiring: {
      postedBy: 'repost',
      poster: 'Pacific Remote Lab',
      posterRole: 'the employer, on its Lever page',
      applyHostIs: 'Lever, the hiring system Pacific Remote Lab uses',
      summary: 'Remote OK reposted this from Pacific Remote Lab’s own hiring page. Applying takes you back to the original on Lever.',
    },
    reasons: [
      'Accepts Indonesian remote contractors.',
      'Supports flexible working hours.',
      'International product exposure.',
    ],
    summary:
      'Partner with product managers in Singapore and Sydney on design systems, onboarding flows, and marketing visuals.',
    companyInfo: {
      overview:
        'Pacific Remote Lab is a distributed digital product consultancy serving startups across Singapore, Australia, and Southeast Asia.',
      industry: 'Digital Product Consultancy',
      size: '15–30 people',
      headquarters: 'Singapore',
      website: 'pacificremotelab.example',
      teamLocations: 'Singapore, Australia, Indonesia, Vietnam',
      remotePolicy: 'Remote-first contractor & full-time model',
      hiringCountries: ['Indonesia', 'Singapore', 'Vietnam', 'Australia'],
      teamCollab: 'APAC',
      workingStyle: 'Flexible remote (overlap varies by client)',
      employeeInsightsAvailable: true,
    },
    roleDetails: {
      overview:
        'Work directly with international founders on brand-to-product UI systems, landing pages, and web app interfaces on a 6-month renewable contract.',
      responsibilities: [
        'Design clean product interfaces and responsive marketing pages.',
        'Build reusable Figma component kits for client handoff.',
        'Present design rationale clearly in weekly product syncs.',
      ],
      requiredQualifications: [
        '2+ years in visual and product design.',
        'Strong portfolio showing both brand polish and UI structure.',
      ],
      preferredQualifications: [
        'Prior remote contract experience with APAC clients.',
      ],
      requiredSkills: ['Visual Design', 'Product Design', 'Figma', 'Responsive Web'],
      niceToHaveSkills: ['Motion Design', 'Webflow'],
      experienceYears: { min: 2, max: 5, label: '2–5 years' },
    },
    compensation: {
      min: 1800,
      max: 2400,
      currency: 'USD',
      period: 'month',
      arrangement: 'Fully remote',
      eligibilityStatus: 'eligible',
      eligibilityLabel: 'APAC · Indonesia explicitly accepted',
      timezone: 'GMT+7 / GMT+8',
      timezoneOffset: 8,
      requiredOverlapHours: null,
      overlapLabel: 'Not specified by employer',
      overlapWibHours: null,
      scheduleConfirmed: false,
      benefits: ['USD international payout', 'Contract renewal bonus'],
    },
    applicationMethod: {
      type: 'external_ats',
      label: 'Apply through external ATS',
      url: 'https://jobs.lever.co/pacific-remote-lab/visual-designer',
      note: 'You will continue to the employer’s external ATS to submit your application.',
    },
  },
  {
    id: 'job-4',
    title: 'Frontend Product Engineer',
    company: 'Harbor Tech (Sample)',
    initials: 'HT',
    logo: './logos/logo-09.svg',
    avatarBg: 'bg-[#e9d7fe] text-[#414651]',
    arrangement: 'Hybrid',
    location: 'Jakarta · Indonesia',
    locationFlag: '🇮🇩',
    type: 'Full-time',
    salary: 'IDR 16–22M / month',
    timezone: 'GMT+7 (WIB)',
    category: 'recent',
    shareUrl: 'https://upnext.id/check/harbor-tech-frontend-engineer',
    source: 'Glints',
    sourceUrl: 'https://glints.com/id/opportunities/jobs/sample-harbor-tech-frontend-product-engineer',
    lastCheckedAt: '2026-11-10',
    whoIsHiring: {
      postedBy: 'agency',
      poster: 'Talentra',
      posterRole: 'a recruitment agency',
      applyHostIs: 'Talentra’s own application form',
      summary: 'Talentra, a recruitment agency, posted this for Harbor Tech. Your application and your details go to the agency first, not to Harbor Tech.',
    },
    reasons: [
      'Growth-stage engineering team.',
      'Hybrid 2 days/week in South Jakarta.',
      'Competitive local compensation.',
    ],
    summary:
      'Build accessible web interfaces in React and TypeScript alongside a multidisciplinary product squad.',
    companyInfo: {
      overview:
        'Harbor Tech builds logistics and supply-chain visibility software for Indonesian enterprises.',
      industry: 'Logistics & Supply Chain SaaS',
      size: '80–150 people',
      headquarters: 'Jakarta, Indonesia',
      website: 'harbortech.example',
      teamLocations: 'Jakarta, Indonesia',
      remotePolicy: 'Hybrid (2 days/week in South Jakarta)',
      hiringCountries: ['Indonesia'],
      teamCollab: 'Jakarta squad',
      workingStyle: 'Hybrid · Core office hours',
      employeeInsightsAvailable: false,
    },
    roleDetails: {
      overview:
        'Collaborate with designers and backend engineers to ship fast, accessible React applications.',
      responsibilities: [
        'Implement responsive UI components in React and TypeScript.',
        'Optimize dashboard rendering and accessibility.',
      ],
      requiredQualifications: [
        '2+ years with React, TypeScript, and modern CSS.',
      ],
      preferredQualifications: [
        'Experience collaborating closely with design systems.',
      ],
      requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Design Systems'],
      niceToHaveSkills: ['Next.js', 'Accessibility'],
      experienceYears: { min: 2, max: 5, label: '2–5 years' },
    },
    compensation: {
      min: 16000000,
      max: 22000000,
      currency: 'IDR',
      period: 'month',
      arrangement: 'Hybrid',
      eligibilityStatus: 'eligible',
      eligibilityLabel: 'Jakarta, Indonesia (Hybrid)',
      timezone: 'GMT+7 (WIB)',
      timezoneOffset: 7,
      requiredOverlapHours: 6,
      overlapLabel: '09:00–17:00 WIB (2 days onsite in South Jakarta)',
      overlapWibHours: { start: 9, end: 17 },
      scheduleConfirmed: true,
      benefits: ['Health insurance', 'Commuter stipend'],
    },
    applicationMethod: {
      type: 'agency',
      label: 'Apply through Talentra',
      url: 'https://talentra.example/jobs/harbor-tech-frontend-product-engineer',
      note: 'A recruitment agency posted this for Harbor Tech, so the agency receives your application first. UpNext does not submit on your behalf.',
    },
  },
  // "Fake remote": tagged Remote, but the eligibility clause excludes Indonesia
  {
    id: 'job-5',
    title: 'Senior Product Designer',
    company: 'Thames Ledger (Sample)',
    initials: 'TL',
    logo: './logos/logo-11.svg',
    avatarBg: 'bg-[#fce7f6] text-[#414651]',
    arrangement: 'Fully remote',
    location: 'Remote · UK team',
    locationFlag: '🇬🇧',
    type: 'Full-time',
    salary: 'GBP 4,500–5,500 / month',
    timezone: 'GMT+0 (London) · Core hours 10:00–15:00',
    category: 'recent',
    shareUrl: 'https://upnext.id/check/thames-ledger-senior-product-designer',
    source: 'Thames Ledger careers page',
    sourceUrl: 'https://thamesledger.example/careers/senior-product-designer',
    lastCheckedAt: '2026-11-16',
    whoIsHiring: {
      postedBy: 'employer',
      poster: 'Thames Ledger',
      posterRole: 'the employer',
      applyHostIs: 'Thames Ledger’s careers page',
      summary: 'Thames Ledger posted this on its own careers page, and applications go straight to it.',
    },
    reasons: [
      'Senior product design scope fits your experience.',
      'Salary range is well above your expectation.',
      'Mature design system and research practice.',
    ],
    summary:
      'Lead product design for business payments in a regulated fintech. Listing is marked Remote, with core hours on UK time.',
    companyInfo: {
      overview:
        'Thames Ledger builds payment and invoicing software for small businesses across the United Kingdom.',
      industry: 'Fintech & Payments',
      size: '200–350 people',
      headquarters: 'London, United Kingdom',
      website: 'thamesledger.example',
      teamLocations: 'London, Manchester, Edinburgh',
      remotePolicy: 'Remote within the UK · Quarterly team days in London',
      hiringCountries: ['United Kingdom'],
      teamCollab: 'UK product',
      workingStyle: 'Synchronous UK core hours',
      employeeInsightsAvailable: true,
    },
    roleDetails: {
      overview:
        'Own the end-to-end experience for invoicing and business payments, working with product, engineering, and compliance in a regulated environment.',
      responsibilities: [
        'Lead discovery and design for invoicing and payment flows.',
        'Contribute to and govern the shared design system.',
        'Run usability sessions with UK small-business customers.',
        'Present design decisions in live weekly product reviews.',
      ],
      requiredQualifications: [
        '5+ years designing complex SaaS or fintech products.',
        'Right to work in the UK. Visa sponsorship is not available.',
        'Strong portfolio showing end-to-end product problem solving.',
      ],
      preferredQualifications: [
        'Experience designing in a regulated industry.',
      ],
      requiredSkills: ['Product Design', 'Figma', 'Design Systems', 'User Research', 'Prototyping'],
      niceToHaveSkills: ['Fintech', 'Accessibility (WCAG)'],
      experienceYears: { min: 5, max: 8, label: '5+ years' },
    },
    compensation: {
      min: 4500,
      max: 5500,
      currency: 'GBP',
      period: 'month',
      arrangement: 'Fully remote',
      eligibilityStatus: 'not_eligible',
      eligibilityLabel: 'UK right to work required · No visa sponsorship',
      timezone: 'GMT+0 (London)',
      timezoneOffset: 0,
      requiredOverlapHours: 5,
      overlapLabel: 'Core hours 10:00–15:00 UK time (17:00–22:00 WIB)',
      overlapWibHours: { start: 17, end: 22 },
      scheduleConfirmed: true,
      benefits: ['Private medical insurance', '25 days annual leave', 'Pension contribution'],
    },
    applicationMethod: {
      type: 'company_site',
      label: 'Apply through company website',
      url: 'https://thamesledger.example/careers/senior-product-designer',
      note: 'The employer’s application form asks you to confirm UK right to work before you can submit.',
    },
  },
  // Incomplete listing: says "Remote (Global)" with no hiring countries or required hours
  {
    id: 'job-6',
    title: 'Product Designer, Growth',
    company: 'Brightloop (Sample)',
    initials: 'BL',
    logo: './logos/logo-10.svg',
    avatarBg: 'bg-[#cff9fe] text-[#414651]',
    arrangement: 'Fully remote',
    location: 'Remote (Global)',
    locationFlag: '🌐',
    type: 'Full-time',
    salary: 'USD 4,000–5,500 / month',
    timezone: 'Not specified',
    category: 'recent',
    shareUrl: 'https://upnext.id/check/brightloop-product-designer-growth',
    source: 'We Work Remotely',
    sourceUrl: 'https://weworkremotely.com/remote-jobs/sample-brightloop-product-designer-growth',
    lastCheckedAt: '2026-11-09',
    whoIsHiring: {
      postedBy: 'employer',
      poster: 'Brightloop',
      posterRole: 'the employer',
      applyHostIs: 'Brightloop’s own jobs page',
      summary: 'Brightloop posted this on We Work Remotely, and applications go to its own jobs page.',
    },
    reasons: [
      'Growth product design fits your experience.',
      'Listed as Remote (Global).',
      'Early-stage team with broad ownership.',
    ],
    summary:
      'Own onboarding and growth experiments for an e-commerce SaaS product used by small online stores.',
    companyInfo: {
      overview:
        'Brightloop is an early-stage startup building storefront and checkout tools for small online stores.',
      industry: 'E-commerce SaaS',
      size: null,
      headquarters: 'San Francisco, United States',
      website: 'brightloop.example',
      teamLocations: 'Not disclosed',
      remotePolicy: 'Remote (Global) · No further detail in listing',
      hiringCountries: [],
      teamCollab: 'distributed',
      workingStyle: 'Distributed remote',
      employeeInsightsAvailable: false,
    },
    roleDetails: {
      overview:
        'Design and test onboarding, activation, and upgrade flows with a small product and engineering team.',
      responsibilities: [
        'Design onboarding and activation flows end to end.',
        'Plan and analyse growth experiments with the PM.',
        'Keep the Figma component library up to date.',
      ],
      requiredQualifications: [
        '3+ years of product design experience.',
        'Portfolio showing measurable impact on activation or conversion.',
      ],
      preferredQualifications: [
        'Experience with e-commerce or merchant tools.',
      ],
      requiredSkills: ['Product Design', 'Figma', 'Growth Experiments', 'Prototyping'],
      niceToHaveSkills: ['Shopify ecosystem', 'Webflow'],
      experienceYears: { min: 3, max: 6, label: '3+ years' },
    },
    compensation: {
      min: 4000,
      max: 5500,
      currency: 'USD',
      period: 'month',
      arrangement: 'Fully remote',
      eligibilityStatus: 'unknown',
      eligibilityLabel: 'Remote (Global) · Hiring countries not specified',
      timezone: 'Not specified',
      timezoneOffset: -8,
      requiredOverlapHours: null,
      overlapLabel: 'Not specified by employer',
      overlapWibHours: null,
      scheduleConfirmed: false,
      benefits: ['Equity (amount not listed)'],
    },
    applicationMethod: {
      type: 'external_ats',
      label: 'Apply through external ATS',
      url: 'https://brightloop.example/jobs/product-designer-growth',
      note: 'The listing does not say which countries the employer can hire from. Confirm before applying.',
    },
  },
];

function computeAiJobFit(job, state) {
  const userRoles = state.selectedRoles.length > 0 ? state.selectedRoles : ['Product Designer'];
  // The range behind each experience option. The user picked a range, not a number,
  // so NEX compares against both ends and only ever quotes the label back
  const expBandMap = {
    fresh: { min: 0, max: 0, label: 'no professional experience yet' },
    lt_1: { min: 0, max: 1, label: 'less than 1 year' },
    '1_2': { min: 1, max: 2, label: '1–2 years' },
    '3_5': { min: 3, max: 5, label: '3–5 years' },
    gt_5: { min: 5, max: 99, label: 'more than 5 years' },
  };

  // A. Experience: the listing's minimum against the chosen range. No score, and never a
  // blocker: applying a little above your level is the user's call
  const band = expBandMap[state.experienceLevel];
  const reqYears = job.roleDetails?.experienceYears;
  const reqMin = reqYears?.min;
  const yearsLine = (job.roleDetails?.requiredQualifications || []).find((q) => /\d+\s*\+?\s*year/i.test(q));
  const asksFor = `The listing asks for at least ${reqMin} ${reqMin === 1 ? 'year' : 'years'}.`;
  const [expStatus, expTone, expExplanation] =
    reqMin == null
      ? ['Not stated', 'unknown', 'The listing doesn’t say how many years it expects.']
      : !band
        ? ['Not in your profile', 'unknown', `${asksFor} Add your experience in Career profile to compare.`]
        : band.min >= reqMin
          ? ['Meets the minimum', 'good', `${asksFor} You selected ${band.label}.`]
          : band.max < reqMin
            ? ['Below the minimum', 'bad', `${asksFor} You selected ${band.label}.`]
            : ['Depends where you are in that range', 'warn', `${asksFor} You selected ${band.label}, so this one is borderline.`];
  const experienceDim = {
    key: 'experience',
    label: 'Experience',
    status: expStatus,
    tone: expTone,
    score: null,
    explanation: numText(expExplanation),
    evidence: reqMin == null ? null : numText(`From the listing: “${yearsLine || reqYears.label}”`),
    youLabel: 'You selected',
    you: band ? band.label : 'Not set',
    listingLabel: 'Listing asks for',
    listing: reqYears?.label || 'Not stated',
  };

  // B. Tools & Skills: the tools the listing names against the ones NEX read from the CV.
  // Without a CV there is nothing to compare, so the dimension says so instead of guessing
  const normSkill = (s) => s.trim().replace(/\s+/g, ' ').toLowerCase();
  const askedTools = job.roleDetails?.requiredSkills || [];
  const cvSkills = new Set((state.cvExtract?.skills || []).map(normSkill));
  const missingTools = askedTools.filter((s) => !cvSkills.has(normSkill(s)));
  const foundCount = askedTools.length - missingTools.length;
  const namedMissing =
    missingTools.length <= 2
      ? missingTools.join(' or ')
      : `${missingTools.slice(0, 2).join(', ')} and ${missingTools.length - 2} more`;
  const [toolsStatus, toolsTone, toolsExplanation] =
    cvSkills.size === 0
      ? ['NEX hasn’t read your CV yet', 'unknown', 'Upload your CV and NEX will check this against the listing.']
      : askedTools.length === 0
        ? ['Not stated', 'unknown', 'The listing doesn’t name any tools.']
        : missingTools.length === 0
          ? ['All listed tools are in your CV', 'good', `All ${askedTools.length} tools the listing names appear in your CV.`]
          : foundCount === 0
            ? ['Not found in your CV', 'bad', 'None of the tools the listing names appear in your CV.']
            : [`${foundCount} of ${askedTools.length} in your CV`, 'warn', `Your CV doesn’t mention ${namedMissing}.`];
  const toolsDim = {
    key: 'tools',
    label: 'Tools & Skills',
    status: toolsStatus,
    tone: toolsTone,
    score: null,
    explanation: numText(toolsExplanation),
    evidence: askedTools.length ? `From the listing: “${askedTools.join(', ')}”` : null,
    youLabel: 'From your CV',
    you: cvSkills.size ? askedTools.filter((s) => cvSkills.has(normSkill(s))).join(', ') || 'None of these' : 'No CV yet',
    listingLabel: 'Listing asks for',
    listing: askedTools.join(', ') || 'Not stated',
  };

  // B. Industry Experience
  const isDesignTech = job.companyInfo.industry.toLowerCase().includes('saas') || job.companyInfo.industry.toLowerCase().includes('mobile') || job.companyInfo.industry.toLowerCase().includes('product');
  const industryScore = isDesignTech ? 88 : 74;
  const industryDim = {
    key: 'industry',
    label: 'Industry Experience',
    status: industryScore >= 80 ? 'Strong match' : 'Partial match',
    score: industryScore,
    explanation: isDesignTech
      ? `Your digital product experience translates well to ${job.companyInfo.industry}.`
      : `Your product skills are transferable, though ${job.companyInfo.industry} domain familiarity may need highlighting.`,
    youLabel: 'Your background',
    you: userRoles.join(', '),
    listingLabel: 'Company industry',
    listing: job.companyInfo.industry,
  };

  // C. Location Eligibility (Never infer solely from Worldwide!)
  const elig = job.compensation.eligibilityStatus;
  const userPlace = state.city ? `${state.city}, ${state.country}` : state.country;
  const locSides = { youLabel: 'You are in', you: userPlace, listingLabel: 'Employer accepts', listing: job.compensation.eligibilityLabel };
  let locDim;
  if (elig === 'eligible') {
    locDim = {
      key: 'location',
      label: 'Location Eligibility',
      status: 'Strong match',
      score: 100,
      explanation: `Indonesia is explicitly included in the employer's accepted hiring locations (${job.compensation.eligibilityLabel}).`,
      ...locSides,
    };
  } else if (elig === 'not_eligible') {
    locDim = {
      key: 'location',
      label: 'Location Eligibility',
      status: 'Not eligible',
      score: 20,
      explanation: `Listed as ${job.arrangement.toLowerCase()}, but Indonesia is not among the employer’s accepted hiring locations.`,
      ...locSides,
    };
  } else {
    locDim = {
      key: 'location',
      label: 'Location Eligibility',
      status: 'Not enough information',
      score: null,
      explanation: 'Location eligibility for Indonesia has not been explicitly confirmed by the employer.',
      ...locSides,
    };
  }

  // D. Timezone Compatibility: the employer's required WIB window vs the user's local hours converted to WIB
  const wibHour = formatWibHour;
  const userHours = state.workHours;
  const userZone = parseTimezone(state.timezone);
  const userWib = userHours ? toWibHours(userHours, state.timezone) : null;
  const userHoursText = userHours
    ? `${wibHour(userHours.start)}–${wibHour(userHours.end)} ${userZone.abbr}${
        userZone.offset !== 7 ? ` (${formatClockHour(userWib.start)}–${formatClockHour(userWib.end)} WIB)` : ''
      }`
    : '';
  const reqHours = job.compensation.overlapWibHours;
  let tzDim;
  if (!job.compensation.scheduleConfirmed || !reqHours) {
    tzDim = {
      key: 'timezone',
      label: 'Timezone Compatibility',
      status: 'Not enough information',
      score: null,
      explanation: 'Working-hour compatibility cannot be fully assessed yet because required overlap hours are not specified.',
      youLabel: 'Your hours',
      you: userHoursText || 'Not set',
      listingLabel: 'Required',
      listing: 'Not specified by employer',
    };
  } else if (!userHours) {
    tzDim = {
      key: 'timezone',
      label: 'Timezone Compatibility',
      status: 'Not enough information',
      score: null,
      explanation: numText(`This role needs ${wibHour(reqHours.start)}–${wibHour(reqHours.end)} WIB. Set the hours you can work to check it against your day.`),
      youLabel: 'Your hours',
      you: 'Not set',
      listingLabel: 'Required',
      listing: job.compensation.overlapLabel,
    };
  } else {
    const hoursOutside = Math.max(0, userWib.start - reqHours.start) + Math.max(0, reqHours.end - userWib.end);
    const tzStatus = hoursOutside === 0 ? 'Strong match' : hoursOutside <= 1 ? 'Partial match' : 'Potential mismatch';
    tzDim = {
      key: 'timezone',
      label: 'Timezone Compatibility',
      status: tzStatus,
      score: hoursOutside === 0 ? 95 : hoursOutside <= 1 ? 70 : 38,
      explanation: numText(
        `This role needs ${wibHour(reqHours.start)}–${wibHour(reqHours.end)} WIB every working day. You can work ${userHoursText}, ${
          hoursOutside === 0 ? 'so it fits inside your window.' : `so ${hoursOutside} hour${hoursOutside > 1 ? 's fall' : ' falls'} outside it.`
        }`
      ),
      youLabel: 'Your hours',
      you: userHoursText,
      listingLabel: 'Required',
      listing: job.compensation.overlapLabel,
    };
  }

  // G. Work Arrangement Fit: onboarding "How would you like to work?" vs the listing's arrangement
  const arrangementKeys = { 'Fully remote': 'fully_remote', 'Remote within Indonesia': 'remote_id', Hybrid: 'hybrid' };
  const arrangementNames = { fully_remote: 'fully remote', remote_id: 'remote within Indonesia', hybrid: 'hybrid', open_all: 'open to all arrangements' };
  const userArrangements = state.workArrangements || [];
  const jobArrangementKey = arrangementKeys[job.arrangement];
  const userArrangementText = userArrangements.map((a) => arrangementNames[a]).join(' or ');
  const jobArrangementText = `${job.arrangement.toLowerCase()} (${job.companyInfo.remotePolicy})`;
  let arrScore = null;
  let arrStatus = 'Not enough information';
  let arrExplanation = 'You haven’t chosen how you’d like to work yet, so NEX can’t compare it with this role.';
  if (userArrangements.length > 0 && jobArrangementKey) {
    if (userArrangements.includes('open_all') || userArrangements.includes(jobArrangementKey)) {
      arrScore = 95;
      arrStatus = 'Strong match';
      arrExplanation = `You chose ${userArrangementText}, and this role is ${jobArrangementText}.`;
    } else if (jobArrangementKey === 'fully_remote' && userArrangements.includes('remote_id')) {
      arrScore = 88;
      arrStatus = 'Strong match';
      arrExplanation = `You chose ${userArrangementText}. This role is fully remote, which you can do from Indonesia.`;
    } else if (jobArrangementKey === 'hybrid') {
      arrScore = 35;
      arrStatus = 'Potential mismatch';
      arrExplanation = `You chose ${userArrangementText}, but this role is ${jobArrangementText} and needs you in the office.`;
    } else {
      arrScore = 70;
      arrStatus = 'Partial match';
      arrExplanation = `You chose ${userArrangementText}, while this role is ${jobArrangementText}.`;
    }
  }
  const arrangementDim = {
    key: 'arrangement',
    label: 'Work Arrangement Fit',
    status: arrStatus,
    score: arrScore,
    explanation: numText(arrExplanation),
    youLabel: 'Your preference',
    you: userArrangementText || 'Not set',
    listingLabel: 'Listing',
    listing: job.companyInfo.remotePolicy,
  };

  // E. Salary Alignment: compared in rupiah (illustrative rates); the ideal salary ranks roles that reach it
  const userCurrency = state.currency || 'IDR';
  const userMinIdr = userSalaryToIdr(state.minSalaryInput, userCurrency);
  const userIdealIdr = userSalaryToIdr(state.idealSalaryInput, userCurrency);
  const pay = formatListingPay(job);
  const jobMaxIdr = pay ? pay.maxIdr : null;
  const idr = (v) => `IDR ${formatIdrMillions(v)}`;
  const userTargetsText = userMinIdr ? `Min ${idr(userMinIdr)}${userIdealIdr ? ` · Ideal ${idr(userIdealIdr)}` : ''}` : 'Not set';
  const salSides = {
    youLabel: 'Your target',
    you: userTargetsText,
    listingLabel: 'Listed',
    listing: pay ? pay.rangeWithUnit : 'No salary listed',
    listingQuote: pay ? pay.quoteLine : null,
  };
  let salDim;
  if (jobMaxIdr === null) {
    salDim = {
      key: 'salary',
      label: 'Salary Alignment',
      status: 'Not enough information',
      score: null,
      explanation: 'The listing doesn’t include a salary range.',
      ...salSides,
    };
  } else if (!userMinIdr) {
    salDim = {
      key: 'salary',
      label: 'Salary Alignment',
      status: 'Not enough information',
      score: null,
      explanation: numText(`Pays ${pay.rangeWithUnit}. Add your minimum salary to compare.`),
      ...salSides,
    };
  } else if (jobMaxIdr < userMinIdr) {
    salDim = {
      key: 'salary',
      label: 'Salary Alignment',
      status: 'Potential mismatch',
      score: 45,
      explanation: numText(`Tops out at ${idr(jobMaxIdr)}, below your minimum of ${idr(userMinIdr)}.`),
      ...salSides,
    };
  } else if (userIdealIdr && jobMaxIdr >= userIdealIdr) {
    salDim = {
      key: 'salary',
      label: 'Salary Alignment',
      status: 'Strong match',
      score: 95,
      explanation: numText(`Reaches your ideal of ${idr(userIdealIdr)} (up to ${idr(jobMaxIdr)}).`),
      ...salSides,
    };
  } else if (userIdealIdr) {
    salDim = {
      key: 'salary',
      label: 'Salary Alignment',
      status: 'Partial match',
      score: 76,
      explanation: numText(`Clears your minimum of ${idr(userMinIdr)}, but stops at ${idr(jobMaxIdr)}, short of your ideal ${idr(userIdealIdr)}.`),
      ...salSides,
    };
  } else {
    salDim = {
      key: 'salary',
      label: 'Salary Alignment',
      status: 'Strong match',
      score: 85,
      explanation: numText(`Clears your minimum of ${idr(userMinIdr)} (up to ${idr(jobMaxIdr)}). Add an ideal salary to rank roles that reach it.`),
      ...salSides,
    };
  }

  // F. Career Priorities: matched against working style and reach; no listing evidence, no match
  const chosenPriorities = careerPriorityOptions.filter((o) => (state.careerPriorities || []).includes(o.label));
  const matchedPriorities = chosenPriorities.filter((o) => o.matches(job));
  const missedPriorities = chosenPriorities.filter((o) => !o.matches(job));
  const prioRatio = chosenPriorities.length ? matchedPriorities.length / chosenPriorities.length : 0;
  const listingSignals = `${job.companyInfo.workingStyle} · ${job.location}`;
  const lowerJoin = (list) => list.map((o) => o.label.toLowerCase()).join(' and ');
  const prioDim =
    chosenPriorities.length === 0
      ? {
          key: 'priorities',
          label: 'Career Priorities',
          status: 'Not enough information',
          score: null,
          explanation: (state.careerPriorities || []).length
            ? 'NEX can’t check these priorities from a listing yet.'
            : 'You haven’t picked any priorities yet.',
          youLabel: 'Your priorities',
          you: (state.careerPriorities || []).join(', ') || 'None picked',
          listingLabel: 'Listing',
          listing: listingSignals,
        }
      : {
          key: 'priorities',
          label: 'Career Priorities',
          status: prioRatio === 1 ? 'Strong match' : prioRatio > 0 ? 'Partial match' : 'Potential mismatch',
          score: prioRatio === 1 ? 92 : prioRatio > 0 ? 70 : 40,
          explanation: matchedPriorities.length
            ? `Supports ${lowerJoin(matchedPriorities)}${missedPriorities.length ? `, but nothing in the listing points to ${lowerJoin(missedPriorities)}` : ''}.`
            : `Nothing in the listing points to ${lowerJoin(chosenPriorities)}.`,
          youLabel: 'Your priorities',
          you: chosenPriorities.map((o) => o.label).join(', '),
          listingLabel: 'Listing',
          listing: listingSignals,
        };

  // Reality Check dimensions first: they decide whether the role is workable from Indonesia at all
  // Experience and Tools bring their own evidence: a quote from the listing, not a summary
  const withEvidence = (dim) => ({
    ...dim,
    evidence:
      'evidence' in dim
        ? dim.evidence
        : numText(`${dim.youLabel}: ${dim.you} · ${dim.listingLabel}: ${dim.listing}${dim.listingQuote ? `. ${dim.listingQuote}` : ''}`),
  });
  const dimensions = [locDim, tzDim, arrangementDim, salDim, experienceDim, toolsDim, industryDim, prioDim].map(withEvidence);
  const scored = dimensions.filter((d) => typeof d.score === 'number');
  const overallScore = scored.length > 0 ? Math.round(scored.reduce((acc, d) => acc + d.score, 0) / scored.length) : null;
  const overallLabel =
    overallScore === null ? 'Not enough information' : overallScore >= 88 ? 'Excellent match' : overallScore >= 75 ? 'Good match' : 'Partial match';

  return {
    overallScore,
    overallLabel,
    dimensions,
  };
}

// How a job's fit is shown everywhere. Eligibility gates the score: a listing Indonesia
// can't apply to gets a verdict instead of a number, and an unconfirmed one is marked unverified.
function getMatchDisplay(job, fit = computeAiJobFit(job, workbenchState)) {
  const elig = job.compensation.eligibilityStatus;
  if (elig === 'not_eligible') {
    return { kind: 'blocked', score: null, label: 'Can’t apply from Indonesia', chipCls: 'bg-[#fef3f2] text-[#b42318]', textCls: 'text-[#b42318]' };
  }
  if (elig !== 'eligible') {
    return { kind: 'unverified', score: fit.overallScore, label: 'Unverified · Indonesia eligibility not confirmed', chipCls: 'bg-[#fffaeb] text-[#b54708]', textCls: 'text-[#b54708]' };
  }
  return { kind: 'scored', score: fit.overallScore, label: fit.overallLabel, chipCls: 'bg-[#ecfdf3] text-[#027a48]', textCls: 'text-[#027a48]' };
}

function renderMatchChipContent(display) {
  if (display.kind === 'blocked') return display.label;
  if (display.kind === 'unverified') return `<span><span class="font-mono-ds">${display.score}</span>% · unverified</span>`;
  return `<span><span class="font-mono-ds">${display.score}</span>% Match</span>`;
}

function getEligibilityChip(job) {
  const comp = job.compensation;
  if (comp.eligibilityStatus === 'not_eligible') return { text: comp.eligibilityLabel.split(' · ')[0], cls: 'bg-[#fef3f2] text-[#b42318]' };
  if (comp.eligibilityStatus !== 'eligible') return { text: `${job.location} · Indonesia not confirmed`, cls: 'bg-[#fffaeb] text-[#b54708]' };
  return { text: job.location, cls: 'bg-[#ecfdf3] text-[#027a48]' };
}

// B-2: cards show a fit band (existing overallLabel thresholds) instead of near-identical percentages
function getFitBand(fit) {
  if (fit.overallScore === null) return null;
  if (fit.overallLabel === 'Excellent match') return { label: 'Strong fit', level: 3 };
  if (fit.overallLabel === 'Good match') return { label: 'Medium fit', level: 2 };
  return { label: 'Weak fit', level: 1 };
}

// C-2: money values wrap only the digit groups in mono, so thousands separators keep normal width
function moneyText(str) {
  return String(str).replace(/\d+/g, '<span class="font-mono-ds">$&</span>');
}

// Matched feed: verified listings ranked by fit, then the best unverified and the best
// ineligible listing, so NEX's eligibility check is visible and neither can rank first
function getMatchedFeedJobs(state) {
  const ranked = sampleJobsCatalog
    .map((job) => ({ job, score: computeAiJobFit(job, state).overallScore ?? -1 }))
    .sort((a, b) => b.score - a.score);
  const withStatus = (status) => ranked.filter((r) => r.job.compensation.eligibilityStatus === status).map((r) => r.job);
  return [...withStatus('eligible').slice(0, 2), ...withStatus('unknown').slice(0, 1), ...withStatus('not_eligible').slice(0, 1)];
}

// "2026-11-09" -> "9 Nov 2026" without depending on the viewer's locale
function formatCheckedDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[month - 1]} ${year}`;
}

/**
 * Company mark: dummy flat logo when the job has one, initials as the fallback.
 */
function renderCompanyMark(job, size, extraClass = '') {
  const box = size === 'lg' ? 'w-10 h-10' : 'w-9 h-9';
  const pad = size === 'lg' ? 'p-[9px]' : 'p-2';
  const type = size === 'lg' ? 'text-[12px] font-medium' : 'text-[11px]';
  return job.logo
    ? `<div class="${box} ${pad} rounded-full ${job.avatarBg} flex items-center justify-center shrink-0 ${extraClass}"><img src="${job.logo}" alt="" class="w-full h-full object-contain" /></div>`
    : `<div class="${box} rounded-full ${job.avatarBg} flex items-center justify-center ${type} shrink-0 ${extraClass}">${job.initials}</div>`;
}

function renderSampleJobCard(job, idx, animatePage, showReasons = true) {
  const isSaved = workbenchState.savedJobIds.includes(job.id);
  const fit = computeAiJobFit(job, workbenchState);
  const display = getMatchDisplay(job, fit);
  const eligChip = getEligibilityChip(job);
  const locDim = fit.dimensions.find((d) => d.key === 'location');
  const band = display.kind === 'blocked' ? null : getFitBand(fit);
  const pay = formatListingPay(job);
  const missing = display.kind === 'unverified' ? getRealityCheck(job, workbenchState).missing : [];
  return `
    <div class="oa-lift bg-white rounded-[18px] p-4 space-y-3 ${getRevealClass(idx + 2, animatePage)}">
      <div class="flex items-start gap-3">
        <div
          onclick="openJobDetail('${job.id}')"
          class="shrink-0 cursor-pointer"
          title="Quick preview"
        >
          ${renderCompanyMark(job, 'sm')}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <h3
              onclick="openJobDetail('${job.id}')"
              class="text-[15px] leading-[22px] font-medium text-[#181d27] truncate cursor-pointer hover:text-[#44658b]"
              title="${job.title}"
            >
              ${job.title}
            </h3>
            <button
              onclick="toggleSaveJob('${job.id}', event)"
              aria-label="Save job"
              class="oa-press w-7 h-7 rounded-full flex items-center justify-center shrink-0 cursor-pointer ${
                isSaved ? 'bg-[#ebf2fa] text-[#44658b]' : 'bg-[#f5f6f8] text-[#717680] hover:text-[#181d27]'
              }"
            >
              <i data-lucide="bookmark" class="w-3.5 h-3.5 ${isSaved ? 'fill-[#44658b]' : ''}"></i>
            </button>
          </div>
          <p class="text-[12px] leading-[18px] text-[#717680] truncate">
            ${job.company} · ${job.arrangement}
          </p>
        </div>
      </div>

      <!-- Eligibility leads; the fit band is secondary -->
      <div class="flex flex-wrap items-center gap-1.5">
        <span class="h-[26px] px-2.5 rounded-full ${eligChip.cls} text-[11.5px] inline-flex items-center gap-1">
          <span>${job.locationFlag}</span>
          <span>${eligChip.text}</span>
        </span>
        <span class="h-[26px] px-2.5 rounded-full bg-[#f5f6f8] text-[#414651] text-[11.5px] inline-flex items-center">
          ${job.type}
        </span>
        ${
          band
            ? `<span class="ml-auto inline-flex items-center gap-1.5 text-[11px] leading-[15px] ${display.kind === 'unverified' ? 'text-[#b54708]' : 'text-[#535862]'}" title="Profile fit ${fit.overallScore}%">
                 <span class="inline-flex items-end gap-[2px] h-[11px]" aria-hidden="true">
                   ${[5, 8, 11]
                     .map(
                       (h, i) =>
                         `<span class="w-[3px] rounded-full ${i < band.level ? (display.kind === 'unverified' ? 'bg-[#f79626]' : 'bg-[#44658b]') : 'bg-[#e4e6ea]'}" style="height: ${h}px"></span>`
                     )
                     .join('')}
                 </span>
                 <span>${band.label}${display.kind === 'unverified' ? ' · unverified' : ''}</span>
               </span>`
            : ''
        }
      </div>

      <!-- Where the listing was read and when NEX last checked it, so every verdict can be traced -->
      <div class="flex items-center gap-1.5 text-[11px] leading-[15px] text-[#717680] min-w-0">
        <i data-lucide="link" class="w-3 h-3 shrink-0"></i>
        <span class="truncate">Source: ${job.source} · Checked ${numText(formatCheckedDate(job.lastCheckedAt))}</span>
      </div>

      <!-- Salary Line -->
      <div class="flex items-center justify-between gap-3 text-[12.5px] text-[#181d27]">
        <div class="min-w-0">
          <div>${moneyText(pay ? pay.rangeWithUnit : job.salary)}</div>
          ${pay && pay.quoteLine ? `<div class="text-[11px] leading-[15px] text-[#717680]">${moneyText(pay.quoteLine)}</div>` : ''}
        </div>
        <button
          onclick="openRealityCheck('${job.id}')"
          class="oa-press shrink-0 whitespace-nowrap text-[12px] text-[#44658b] hover:text-[#355070] cursor-pointer inline-flex items-center gap-1"
        >
          <span>Reality check</span>
          <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
        </button>
      </div>

      ${
        showReasons && display.kind === 'blocked'
          ? `<div class="bg-[#fef3f2] rounded-[14px] p-3 space-y-1">
               <div class="flex items-center gap-1.5 text-[11.5px] text-[#b42318]">
                 <img src="./bosshire-ai-blob.png" alt="NEX" class="w-3.5 h-3.5 rounded-full shrink-0" />
                 <span>Why NEX flagged this:</span>
               </div>
               <p class="text-[11.5px] leading-[16px] text-[#414651]">${locDim.explanation}</p>
               <p class="text-[11px] leading-[15px] text-[#717680]">${locDim.evidence}</p>
             </div>`
          : showReasons && display.kind === 'unverified'
          ? `<div class="bg-[#fffaeb] rounded-[14px] p-3 space-y-2">
               <div class="flex items-center gap-1.5 text-[11.5px] text-[#b54708]">
                 <img src="./bosshire-ai-blob.png" alt="NEX" class="w-3.5 h-3.5 rounded-full shrink-0" />
                 <span>What NEX can’t confirm yet:</span>
               </div>
               <ul class="space-y-1 text-[11.5px] leading-[16px] text-[#414651] pl-1">
                 ${missing
                   .map(
                     (m) => `
                   <li class="flex items-start gap-1.5">
                     <span class="w-1 h-1 rounded-full bg-[#b54708] mt-1.5 shrink-0"></span>
                     <span>${m.label}</span>
                   </li>
                 `
                   )
                   .join('')}
               </ul>
               <p class="text-[11px] leading-[15px] text-[#717680]">The ${job.source} listing only says “${job.location}”.</p>
               <button
                 onclick="askRecruiterAbout('${job.id}')"
                 class="oa-press w-full h-[40px] rounded-full bg-white hover:bg-[#fde3bd] text-[#b54708] text-[12.5px] font-medium cursor-pointer inline-flex items-center justify-center gap-1.5"
               >
                 <i data-lucide="message-square" class="w-4 h-4"></i>
                 <span>Ask the recruiter</span>
               </button>
             </div>`
          : showReasons
          ? `<div class="bg-[#f4f8fc] rounded-[14px] p-3 space-y-1.5">
               <div class="flex items-center gap-1.5 text-[11.5px] text-[#44658b]">
                 <img src="./bosshire-ai-blob.png" alt="NEX" class="w-3.5 h-3.5 rounded-full shrink-0" />
                 <span>Why this matches you:</span>
               </div>
               <ul class="space-y-1 text-[11.5px] leading-[16px] text-[#414651] pl-1">
                 ${job.reasons
                   .map(
                     (r) => `
                   <li class="flex items-start gap-1.5">
                     <span class="w-1 h-1 rounded-full bg-[#44658b] mt-1.5 shrink-0"></span>
                     <span>${r}</span>
                   </li>
                 `
                   )
                   .join('')}
               </ul>
             </div>`
          : ''
      }
    </div>
  `;
}

// ── SCREEN 7: Recommended Jobs (NEX blob on left of Recommended for you, no dialog above, no Sample data pill) ──
function renderScreen7(animatePage) {
  const feedJobs = getMatchedFeedJobs(workbenchState);
  // Listings NEX found can't hire from Indonesia get their own group, so "Recommended" keeps its promise
  const recommendedJobs = feedJobs.filter((j) => j.compensation.eligibilityStatus !== 'not_eligible');
  const ruledOutJobs = feedJobs.filter((j) => j.compensation.eligibilityStatus === 'not_eligible');

  return `
    <div class="px-3 pb-4">
      <!-- Bottom padding = sticky action height + gap, so the last card always scrolls clear of it -->
      <div class="space-y-3 pb-[108px]">
        <!-- Frameless Header: NEX Blob on the LEFT of "Recommended for you" -->
        <div class="px-1 pt-1 flex items-center gap-2.5 ${getRevealClass(1, animatePage)}">
          <img src="./bosshire-ai-blob.png" alt="NEX AI" class="w-8 h-8 rounded-full shrink-0" />
          <div>
            <h1 class="text-[18px] leading-[24px] font-medium text-[#181d27]">
              Recommended for you
            </h1>
            <p class="text-[12px] leading-[17px] text-[#717680]">
              Handpicked opportunities based on your career profile.
            </p>
          </div>
        </div>

        <!-- Recommended Job Cards -->
        ${recommendedJobs.map((job, idx) => renderSampleJobCard(job, idx, animatePage, true)).join('')}

        ${
          ruledOutJobs.length
            ? `<!-- Checked and ruled out: still shown, because catching these is the point -->
               <div class="px-1 pt-3 space-y-0.5 ${getRevealClass(4, animatePage)}">
                 <h2 class="text-[14.5px] leading-[20px] font-medium text-[#181d27]">
                   Checked, can’t apply from Indonesia <span class="font-normal text-[#717680]">(<span class="font-mono-ds">${ruledOutJobs.length}</span>)</span>
                 </h2>
                 <p class="text-[12px] leading-[17px] text-[#717680]">
                   They look open, but NEX found the employer only hires elsewhere. Kept here so you don’t spend an application on them.
                 </p>
               </div>
               ${ruledOutJobs.map((job, idx) => renderSampleJobCard(job, recommendedJobs.length + idx, animatePage, true)).join('')}`
            : ''
        }
      </div>

      <!-- Sticky Bottom Actions (96px tall): pulled up into the list's bottom padding -->
      <div class="sticky bottom-0 -mt-[96px] h-[96px] bg-[#f5f6f8]/95 backdrop-blur-sm pt-2 pb-1 space-y-1.5 ${getRevealClass(4, animatePage)}">
        <button
          onclick="goToHomepage()"
          class="oa-press w-full h-[42px] rounded-full bg-[#44658b] hover:bg-[#355070] text-white text-[13px] cursor-pointer"
        >
          Explore all opportunities
        </button>
        <button
          onclick="goToHomepage()"
          class="oa-press w-full h-[36px] rounded-full bg-transparent hover:bg-white text-[#535862] text-[12.5px] cursor-pointer"
        >
          Skip for now
        </button>
      </div>
    </div>
  `;
}

// ── PART 1 & 3: MAIN HOME DASHBOARD & CONNECTED ROUTES (NO BOTTOM NEXGATION) ──
function renderDashboardHeader(route) {
  const isSubRoute = route !== 'home';
  const routeTitles = {
    explore: 'Find jobs',
    saved: 'Saved jobs',
    applications: 'My applications',
    profile: 'Career profile',
    cover_letter: 'Cover letter generator',
    job_details: 'Job details',
    reality_check: 'Reality check',
  };

  const headerTitle = routeTitles[route] || 'UpNext';

  const backAction =
    route === 'job_details'
      ? 'goBackFromJobDetails()'
      : route === 'reality_check'
        ? 'goBackFromRealityCheck()'
        : "navigateDashboardRoute('home')";

  return `
    <div class="px-4 pt-1.5 pb-3 bg-[#f5f6f8] flex items-center justify-between shrink-0">
      <div class="flex items-center gap-1.5 h-8">
        ${
          isSubRoute
            ? `<button onclick="${backAction}" aria-label="Back" class="oa-press w-6 h-6 -ml-1 text-[#414651] hover:text-[#181d27] flex items-center justify-center cursor-pointer">
                 <i data-lucide="arrow-left" class="w-[18px] h-[18px]"></i>
               </button>
               <span class="text-[16px] font-medium text-[#181d27]">${headerTitle}</span>`
            : `<span class="upnext-logo text-[20px] leading-none inline-flex items-baseline">
                 <span class="text-[#44658b]">Up</span><span class="text-[#f79626]">Next</span>
               </span>`
        }
      </div>

      <div class="flex items-center gap-1.5">
        <button
          onclick="setScreen(7)"
          aria-label="Notifications"
          class="oa-press relative w-8 h-8 rounded-full bg-white text-[#414651] flex items-center justify-center cursor-pointer"
        >
          <i data-lucide="bell" class="w-4 h-4"></i>
          <span class="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-[#f79626]"></span>
        </button>
        <button
          id="hamburger-menu-btn"
          onclick="openDrawer()"
          aria-label="Open navigation menu"
          class="oa-press w-8 h-8 rounded-full bg-white text-[#181d27] flex items-center justify-center cursor-pointer hover:bg-[#ebf2fa]"
        >
          <i data-lucide="menu" class="w-4 h-4"></i>
        </button>
      </div>
    </div>
  `;
}

function renderHomeDashboardBody(animatePage) {
  const query = (workbenchState.dashboardSearchQuery || '').trim().toLowerCase();
  const filteredJobs = sampleJobsCatalog.filter(
    (j) =>
      !query ||
      j.title.toLowerCase().includes(query) ||
      j.company.toLowerCase().includes(query) ||
      j.arrangement.toLowerCase().includes(query)
  );

  const categories = [
    { name: 'Design & Creative', icon: 'palette' },
    { name: 'Technology', icon: 'code-2' },
    { name: 'Marketing', icon: 'megaphone' },
    { name: 'Business & Management', icon: 'briefcase' },
    { name: 'Customer Support', icon: 'headphones' },
    { name: 'Data & Analytics', icon: 'bar-chart-2' },
    { name: 'Finance & Accounting', icon: 'wallet' },
    { name: 'Sales & Business Development', icon: 'trending-up' },
  ];

  return `
    <!-- 2. Personalized Greeting (Compact) -->
    <div class="px-1 space-y-0.5 ${getRevealClass(1, animatePage)}">
      <h1 class="text-[20px] leading-[26px] font-medium text-[#181d27]">
        Good morning, ${workbenchState.userFirstName} 👋
      </h1>
      <p class="text-[12.5px] leading-[18px] text-[#535862]">
        Ready for your next career move?
      </p>
    </div>

    <!-- 4. NEX AI Assistant Banner ("Meet NEX" with animated subtle blue gradient + animated NEX orb + frameless transparent menu) -->
    <div class="oa-ai-banner rounded-[18px] p-4 space-y-3 ${getRevealClass(2, animatePage)}">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <div class="relative w-10 h-10 flex items-center justify-center shrink-0">
            <div class="nex-halo" style="width: 48px; height: 48px; filter: blur(8px);"></div>
            <img src="./bosshire-ai-blob.png" alt="NEX" class="nex-orb relative z-10 w-9 h-9 rounded-full object-contain" />
          </div>
          <div>
            <h2 class="text-[15px] leading-[20px] font-medium text-[#181d27]">Meet NEX</h2>
            <p class="text-[12px] text-[#717680]">Your AI career companion.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 4b. Job Search + Advanced Filters (Right above Picked for you, with balanced divider spacing) -->
    <div class="pt-4 border-t border-[#e4e6ea] space-y-2 ${getRevealClass(3, animatePage)}" style="margin-top: 16px;">
      <div class="flex items-center gap-2">
        <div class="flex-1 h-[40px] px-3.5 rounded-full bg-white focus-within:ring-2 focus-within:ring-[#44658b]/25 flex items-center gap-2 transition">
          <i data-lucide="search" class="w-4 h-4 text-[#717680] shrink-0"></i>
          <input
            id="dashboard-search-input"
            type="text"
            value="${workbenchState.dashboardSearchQuery.replace(/"/g, '&quot;')}"
            placeholder="Search jobs, companies, or roles..."
            oninput="handleDashboardSearch(this.value)"
            onkeydown="if(event.key==='Enter'){navigateDashboardRoute('explore')}"
            class="w-full bg-transparent text-[13px] text-[#181d27] placeholder:text-[#a4a7ae] focus:outline-none"
          />
        </div>
        <button
          id="dashboard-filters-btn"
          onclick="toggleDashboardFilters()"
          aria-label="Advanced filters"
          class="oa-press h-[40px] px-3.5 rounded-full text-[12px] inline-flex items-center gap-1.5 cursor-pointer shrink-0 ${
            workbenchState.dashboardFiltersOpen ? 'bg-[#44658b] text-white' : 'bg-white text-[#414651]'
          }"
        >
          <i data-lucide="sliders-horizontal" class="w-3.5 h-3.5"></i>
          <span>Filters</span>
        </button>
      </div>
    </div>

    <!-- 5. Personalized Job Recommendations ("Picked for you by NEX") -->
    <div class="space-y-2.5 ${getRevealClass(3, animatePage)}">
      <div class="px-1 flex items-center justify-between gap-2">
        <div>
          <h2 class="text-[16px] leading-[22px] font-medium text-[#181d27]">Picked for you by NEX</h2>
          <p class="text-[12px] text-[#717680]">Opportunities that match your career profile.</p>
        </div>
        <button onclick="setScreen(7)" class="text-[12px] text-[#44658b] cursor-pointer shrink-0">See all</button>
      </div>
      ${(filteredJobs.slice(0, 2).length > 0 ? filteredJobs.slice(0, 2) : sampleJobsCatalog.slice(0, 2))
        .map((job, idx) => renderSampleJobCard(job, idx, false, true))
        .join('')}
    </div>

    <!-- 8. Application Progress ("Your career progress") -->
    <div class="bg-white rounded-[18px] p-4 space-y-3 ${getRevealClass(4, animatePage)}">
      <div class="flex items-center justify-between gap-2">
        <div>
          <h2 class="text-[16px] leading-[22px] font-medium text-[#181d27]">Your career progress</h2>
          <p class="text-[12px] text-[#717680]">Keep track of your job applications.</p>
        </div>
        <button onclick="navigateDashboardRoute('applications')" class="text-[12px] text-[#44658b] cursor-pointer shrink-0">View all</button>
      </div>
      <div class="grid grid-cols-4 gap-2">
        <button onclick="navigateDashboardRoute('applications')" class="oa-press bg-[#f7f8fa] rounded-[14px] py-2.5 px-2 text-center cursor-pointer">
          <div class="font-mono-ds text-[18px] leading-[22px] text-[#181d27]">3</div>
          <div class="text-[11px] text-[#717680] mt-0.5">Applied</div>
        </button>
        <button onclick="navigateDashboardRoute('applications')" class="oa-press bg-[#ebf2fa] rounded-[14px] py-2.5 px-2 text-center cursor-pointer">
          <div class="font-mono-ds text-[18px] leading-[22px] text-[#355070]">1</div>
          <div class="text-[11px] text-[#355070] mt-0.5">Interview</div>
        </button>
        <button onclick="navigateDashboardRoute('applications')" class="oa-press bg-[#f7f8fa] rounded-[14px] py-2.5 px-2 text-center cursor-pointer">
          <div class="font-mono-ds text-[18px] leading-[22px] text-[#181d27]">1</div>
          <div class="text-[11px] text-[#717680] mt-0.5">Assessment</div>
        </button>
        <button onclick="navigateDashboardRoute('applications')" class="oa-press bg-[#ecfdf3] rounded-[14px] py-2.5 px-2 text-center cursor-pointer">
          <div class="font-mono-ds text-[18px] leading-[22px] text-[#027a48]">0</div>
          <div class="text-[11px] text-[#027a48] mt-0.5">Offer</div>
        </button>
      </div>
      <button
        onclick="navigateDashboardRoute('applications')"
        class="oa-press w-full h-[38px] rounded-full bg-[#f0f1f3] hover:bg-[#e6e8eb] text-[#181d27] text-[12.5px] cursor-pointer"
      >
        View all applications
      </button>
    </div>
  `;
}

function renderDashboardSubRoute(route, animatePage) {
  const query = (workbenchState.dashboardSearchQuery || '').trim().toLowerCase();
  const filteredJobs = sampleJobsCatalog.filter(
    (j) =>
      !query ||
      j.title.toLowerCase().includes(query) ||
      j.company.toLowerCase().includes(query) ||
      j.arrangement.toLowerCase().includes(query)
  );
  const savedJobs = sampleJobsCatalog.filter((j) => workbenchState.savedJobIds.includes(j.id));

  if (route === 'explore') {
    return `
      <div class="space-y-2.5 ${getRevealClass(1, animatePage)}">
        <div class="h-[40px] px-3.5 rounded-full bg-white focus-within:ring-2 focus-within:ring-[#44658b]/25 flex items-center gap-2.5">
          <i data-lucide="search" class="w-4 h-4 text-[#717680] shrink-0"></i>
          <input
            id="dashboard-search-input"
            type="text"
            value="${workbenchState.dashboardSearchQuery.replace(/"/g, '&quot;')}"
            placeholder="Search jobs, companies, or roles..."
            oninput="handleDashboardSearch(this.value)"
            class="w-full bg-transparent text-[13px] text-[#181d27] placeholder:text-[#a4a7ae] focus:outline-none"
          />
        </div>
        ${
          workbenchState.activeCategoryFilter
            ? `<div class="flex items-center justify-between px-1">
                 <span class="h-[28px] px-3 rounded-full bg-[#ebf2fa] text-[#355070] text-[12px] inline-flex items-center gap-1.5">
                   <span>Filter: ${workbenchState.activeCategoryFilter}</span>
                   <button onclick="clearCategoryFilter()" class="cursor-pointer"><i data-lucide="x" class="w-3 h-3"></i></button>
                 </span>
                 <span class="text-[11.5px] text-[#717680]">Sample data</span>
               </div>`
            : ''
        }
      </div>
      ${filteredJobs.map((job, idx) => renderSampleJobCard(job, idx, false, true)).join('')}
      ${
        filteredJobs.length === 0
          ? `<div class="bg-white rounded-[18px] p-6 text-center text-[12.5px] text-[#717680]">
               No sample roles match "${workbenchState.dashboardSearchQuery}".
             </div>`
          : ''
      }
    `;
  }

  if (route === 'saved') {
    return savedJobs.length > 0
      ? savedJobs.map((job, idx) => renderSampleJobCard(job, idx, false, true)).join('')
      : `<div class="bg-white rounded-[18px] p-8 text-center space-y-2 ${getRevealClass(1, animatePage)}">
           <div class="w-10 h-10 rounded-full bg-[#f5f6f8] mx-auto flex items-center justify-center text-[#717680]">
             <i data-lucide="bookmark" class="w-4 h-4"></i>
           </div>
           <div class="text-[14px] font-medium text-[#181d27]">No saved jobs yet</div>
           <p class="text-[12px] text-[#717680]">Tap the bookmark icon on any role to save it here.</p>
         </div>`;
  }

  if (route === 'applications') {
    const apps = [
      { title: 'Product Designer', company: 'Karya Cloud (Sample)', stage: 'Interviewing', tone: 'bg-[#ebf2fa] text-[#355070]', date: 'Updated 2d ago' },
      { title: 'UI/UX Designer', company: 'Nusantara Studio (Sample)', stage: 'Assessment', tone: 'bg-[#fffaeb] text-[#b54708]', date: 'Updated 4d ago' },
      { title: 'Visual & Product Designer', company: 'Pacific Remote Lab (Sample)', stage: 'Applied', tone: 'bg-[#f5f6f8] text-[#535862]', date: 'Applied 1w ago' },
    ];
    return `
      <div class="bg-white rounded-[18px] p-4 space-y-2.5 ${getRevealClass(1, animatePage)}">
        <div class="flex items-center justify-between">
          <span class="text-[14px] font-medium text-[#181d27]">Active applications</span>
          <span class="text-[11px] text-[#717680]">Sample tracker</span>
        </div>
        ${apps
          .map(
            (a) => `
          <div class="p-3.5 rounded-[14px] bg-[#f7f8fa] flex items-center justify-between gap-2">
            <div class="min-w-0">
              <div class="text-[13.5px] font-medium text-[#181d27] truncate">${a.title}</div>
              <div class="text-[11.5px] text-[#717680] truncate">${a.company} · ${numText(a.date)}</div>
            </div>
            <span class="h-[26px] px-2.5 rounded-full ${a.tone} text-[11.5px] shrink-0 inline-flex items-center">${a.stage}</span>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  if (route === 'job_details') {
    return renderJobDetailsRoute(animatePage);
  }

  if (route === 'reality_check') {
    return renderRealityCheckRoute(animatePage);
  }

  if (route === 'cover_letter') {
    const firstQuestions = [
      { icon: 'globe', text: 'Can the employer hire someone based in Indonesia?' },
      { icon: 'clock', text: 'Do the required hours fit a working day in WIB?' },
      { icon: 'coins', text: 'Does the pay clear your minimum in rupiah?' },
    ];
    return `
      <div class="bg-white rounded-[18px] p-4 space-y-4 ${getRevealClass(1, animatePage)}">
        <div class="space-y-3">
          <span class="h-[24px] px-2.5 rounded-full bg-[#f5f6f8] text-[#414651] text-[11.5px] inline-flex items-center gap-1.5">
            <i data-lucide="map" class="w-3.5 h-3.5 text-[#717680]"></i>
            <span>On the roadmap · not in this round</span>
          </span>
          <div class="space-y-1.5">
            <h2 class="text-[18px] leading-[24px] font-medium text-[#181d27]">We left cover letters out on purpose</h2>
            <p class="text-[13px] leading-[19px] text-[#535862]">
              This round, UpNext focuses on one problem: making sure a remote job can actually be taken from Indonesia. A cover letter generator would pull attention away from that, so we chose not to build it yet.
            </p>
          </div>
        </div>

        <div class="bg-[#f7f8fa] rounded-[14px] p-3 space-y-2.5">
          <div class="text-[12px] text-[#717680]">What every listing has to answer first</div>
          ${firstQuestions
            .map(
              (q) => `
            <div class="flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-[10px] bg-white text-[#44658b] flex items-center justify-center shrink-0">
                <i data-lucide="${q.icon}" class="w-4 h-4"></i>
              </span>
              <span class="text-[12.5px] leading-[18px] text-[#181d27]">${q.text}</span>
            </div>
          `
            )
            .join('')}
        </div>

        <p class="text-[12.5px] leading-[18px] text-[#535862]">
          A tailored letter is only worth writing once all three answers are yes. When it ships, it will only draft for roles that pass the reality check.
        </p>

        <button
          onclick="setScreen(7)"
          class="oa-press w-full h-[40px] rounded-full bg-[#44658b] hover:bg-[#355070] text-white text-[13px] cursor-pointer inline-flex items-center justify-center gap-1.5"
        >
          <span>Browse matched jobs</span>
          <i data-lucide="arrow-right" class="w-4 h-4"></i>
        </button>
      </div>
    `;
  }

  if (route === 'profile') {
    const expMap = {
      fresh: 'Fresh graduate / No experience',
      lt_1: 'Less than 1 year',
      '1_2': '1–2 years',
      '3_5': '3–5 years',
      gt_5: 'More than 5 years',
    };
    return `
      <div class="bg-white rounded-[18px] p-4 space-y-3 ${getRevealClass(1, animatePage)}">
        <div class="flex items-center gap-3 pb-2 border-b border-[#edeef1]">
          <div class="w-11 h-11 rounded-full bg-[#ebf2fa] text-[#355070] flex items-center justify-center text-[14px] font-medium">
            ${workbenchState.userFirstName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div class="text-[15px] font-medium text-[#181d27]">${workbenchState.userFirstName}</div>
            <div class="text-[12px] text-[#717680]">${workbenchState.city || 'Jakarta'}, ${workbenchState.country} · ${numText(workbenchState.timezone)}</div>
          </div>
        </div>
        <div class="flex items-center justify-between text-[13px]">
          <span class="text-[#717680]">Experience</span>
          <span class="text-[#181d27]">${numText(expMap[workbenchState.experienceLevel] || 'Not set')}</span>
        </div>
        <div class="flex items-center justify-between text-[13px] pt-2 border-t border-[#edeef1]">
          <span class="text-[#717680]">Preferred roles</span>
          <span class="text-[#181d27] text-right">${workbenchState.selectedRoles.join(', ') || 'Not set yet'}</span>
        </div>
        <div class="flex items-center justify-between text-[13px] pt-2 border-t border-[#edeef1]">
          <span class="text-[#717680]">Preferred currency</span>
          <span class="text-[#181d27]">${workbenchState.currency}</span>
        </div>
        <div class="flex items-center justify-between text-[13px] pt-2 border-t border-[#edeef1]">
          <span class="text-[#717680]">Priorities</span>
          <span class="text-[#181d27] text-right">${workbenchState.careerPriorities.join(', ') || 'None'}</span>
        </div>
        <div class="pt-2">
          <button onclick="setScreen(2)" class="oa-press w-full h-[38px] rounded-full bg-[#ebf2fa] hover:bg-[#d4e4f7] text-[#355070] text-[12.5px] cursor-pointer">
            Edit onboarding preferences
          </button>
        </div>
      </div>
    `;
  }

  return '';
}

function renderJobDetailsTabContent(job, fit, animatePage) {
  const tab = workbenchState.jobDetailsTab || 'overview';

  if (tab === 'description') {
    return `
      <div class="bg-white rounded-[18px] p-4 space-y-4 ${getRevealClass(0, animatePage)}">
        <div class="space-y-1.5">
          <h2 class="text-[14.5px] font-medium text-[#181d27]">About the Role</h2>
          <p class="text-[12.5px] leading-[19px] text-[#414651]">${job.roleDetails.overview}</p>
        </div>

        <div class="space-y-1.5 pt-3 border-t border-[#edeef1]">
          <h2 class="text-[14.5px] font-medium text-[#181d27]">Responsibilities</h2>
          <ul class="space-y-1 text-[12px] leading-[18px] text-[#414651] list-disc pl-4">
            ${job.roleDetails.responsibilities.map((r) => `<li>${r}</li>`).join('')}
          </ul>
        </div>

        <div class="space-y-1.5 pt-3 border-t border-[#edeef1]">
          <h2 class="text-[14.5px] font-medium text-[#181d27]">Requirements</h2>
          <ul class="space-y-1 text-[12px] leading-[18px] text-[#414651] list-disc pl-4">
            ${job.roleDetails.requiredQualifications.map((q) => `<li>${numText(q)}</li>`).join('')}
          </ul>
        </div>

        <div class="space-y-1.5 pt-3 border-t border-[#edeef1]">
          <h2 class="text-[14.5px] font-medium text-[#181d27]">Preferred Qualifications</h2>
          <ul class="space-y-1 text-[12px] leading-[18px] text-[#414651] list-disc pl-4">
            ${job.roleDetails.preferredQualifications.map((q) => `<li>${q}</li>`).join('')}
          </ul>
        </div>

        <div class="space-y-2 pt-3 border-t border-[#edeef1]">
          <h2 class="text-[14.5px] font-medium text-[#181d27]">Skills</h2>
          <div class="flex flex-wrap gap-1.5">
            ${job.roleDetails.requiredSkills.map((s) => `<span class="h-[26px] px-2.5 rounded-full bg-[#ebf2fa] text-[#355070] text-[11.5px] inline-flex items-center">${s}</span>`).join('')}
            ${job.roleDetails.niceToHaveSkills.map((s) => `<span class="h-[26px] px-2.5 rounded-full bg-[#f5f6f8] text-[#535862] text-[11.5px] inline-flex items-center">${s}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  }

  if (tab === 'company') {
    return `
      <div class="bg-white rounded-[18px] p-4 space-y-3 ${getRevealClass(0, animatePage)}">
        <h2 class="text-[14.5px] font-medium text-[#181d27]">Company Overview</h2>
        <p class="text-[12.5px] leading-[19px] text-[#414651]">${job.companyInfo.overview}</p>
        <div class="divide-y divide-[#edeef1] text-[12px]">
          <div class="py-2 flex justify-between gap-4"><span class="text-[#717680] shrink-0 whitespace-nowrap">Company</span><span class="text-[#181d27] text-right">${job.company}</span></div>
          <div class="py-2 flex justify-between gap-4"><span class="text-[#717680] shrink-0 whitespace-nowrap">Industry</span><span class="text-[#181d27] text-right">${job.companyInfo.industry}</span></div>
          <div class="py-2 flex justify-between gap-4"><span class="text-[#717680] shrink-0 whitespace-nowrap">Company size</span><span class="text-[#181d27] text-right">${numText(job.companyInfo.size || 'Not available')}</span></div>
          <div class="py-2 flex justify-between gap-4"><span class="text-[#717680] shrink-0 whitespace-nowrap">Headquarters</span><span class="text-[#181d27] text-right">${job.companyInfo.headquarters || 'Not available'}</span></div>
          <div class="pt-2 flex justify-between gap-4"><span class="text-[#717680] shrink-0 whitespace-nowrap">Website</span><span class="text-[#44658b] text-right">${job.companyInfo.website || 'Not available'}</span></div>
        </div>
      </div>

      ${renderWhoIsHiring(job, getRevealClass(1, animatePage))}

      <div class="bg-white rounded-[18px] p-4 space-y-3 ${getRevealClass(2, animatePage)}">
        <h2 class="text-[14.5px] font-medium text-[#181d27]">Remote Work & Hiring</h2>

        <div class="divide-y divide-[#edeef1] text-[12px]">
          <div class="py-2 flex justify-between gap-4">
            <span class="text-[#717680] shrink-0 whitespace-nowrap">Accepted countries</span>
            <span class="text-[#181d27] text-right">${job.companyInfo.employeeInsightsAvailable ? job.companyInfo.hiringCountries.join(', ') : 'Not available'}</span>
          </div>
          <div class="py-2 flex justify-between gap-4">
            <span class="text-[#717680] shrink-0 whitespace-nowrap">Working style</span>
            <span class="text-[#181d27] text-right">${job.companyInfo.remotePolicy || 'Not available'}</span>
          </div>
          <div class="py-2 flex justify-between gap-4">
            <span class="text-[#717680] shrink-0 whitespace-nowrap">Team locations</span>
            <span class="text-[#181d27] text-right">${job.companyInfo.employeeInsightsAvailable ? job.companyInfo.teamLocations : 'Not available'}</span>
          </div>
          <div class="pt-2 flex justify-between gap-4">
            <span class="text-[#717680] shrink-0 whitespace-nowrap">Working timezone</span>
            <span class="text-[#181d27] text-right">${numText(job.compensation.timezone)}</span>
          </div>
        </div>
      </div>
    `;
  }

  // Default Tab 1 — Overview: what the listing is. Whether it fits is Reality Check's job, linked in one line
  const display = getMatchDisplay(job, fit);
  const listingPay = formatListingPay(job);
  const flaggedRows = getRealityCheck(job, workbenchState).rows.filter((r) => r.tone === 'bad' || r.tone === 'unknown').length;
  const verdictLine =
    display.kind === 'blocked'
      ? { text: 'Can’t apply from Indonesia', cls: 'text-[#b42318]' }
      : display.kind === 'unverified'
        ? { text: 'Indonesia not confirmed by the listing', cls: 'text-[#b54708]' }
        : flaggedRows
          ? { text: `Can apply from Indonesia · ${flaggedRows} thing${flaggedRows > 1 ? 's' : ''} to check`, cls: 'text-[#b54708]' }
          : { text: 'Can apply from Indonesia', cls: 'text-[#027a48]' };
  const eligibilityRow =
    display.kind === 'blocked'
      ? { text: job.compensation.eligibilityLabel, cls: 'text-[#b42318]' }
      : display.kind === 'unverified'
        ? { text: 'Not confirmed by employer', cls: 'text-[#b54708]' }
        : { text: job.location, cls: 'text-[#027a48]' };

  return `
    <!-- A. One line to Reality Check: the short verdict, not scores -->
    <button
      onclick="openRealityCheck('${job.id}')"
      class="oa-press w-full bg-white rounded-[18px] px-4 py-3 flex items-center justify-between gap-3 text-left cursor-pointer ${getRevealClass(0, animatePage)}"
    >
      <div class="flex items-center gap-2.5 min-w-0">
        <img src="./bosshire-ai-blob.png" alt="NEX" class="w-6 h-6 rounded-full shrink-0" />
        <div class="min-w-0">
          <div class="text-[11px] leading-[15px] text-[#717680]">Reality check</div>
          <div class="text-[13px] leading-[18px] font-medium truncate ${verdictLine.cls}">${numText(verdictLine.text)}</div>
        </div>
      </div>
      <span class="shrink-0 text-[12px] text-[#44658b] inline-flex items-center gap-1">
        <span>See why</span>
        <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
      </span>
    </button>

    <!-- B. Listing specs: the one place salary, arrangement, hours and eligibility are written -->
    <div class="bg-white rounded-[18px] p-4 ${getRevealClass(1, animatePage)}">
      <div class="divide-y divide-[#edeef1] text-[12px]">
        <div class="pb-2 flex justify-between gap-3">
          <span class="text-[#717680]">Salary</span>
          <span class="text-right">
            <span class="block text-[#181d27] font-medium">${moneyText(listingPay ? listingPay.rangeWithUnit : job.salary)}</span>
            ${listingPay && listingPay.quoteLine ? `<span class="block mt-0.5 text-[11px] leading-[15px] text-[#717680]">${moneyText(listingPay.quoteLine)}</span>` : ''}
          </span>
        </div>
        <div class="py-2 flex justify-between gap-3"><span class="text-[#717680]">Experience</span><span class="text-[#181d27] text-right">${numText(job.roleDetails.experienceYears.label)}</span></div>
        <div class="py-2 flex justify-between gap-3"><span class="text-[#717680]">Arrangement</span><span class="text-[#181d27] text-right">${job.arrangement} · ${job.type}</span></div>
        <div class="py-2 flex justify-between gap-3"><span class="text-[#717680]">Timezone overlap</span><span class="text-[#181d27] text-right">${job.compensation.scheduleConfirmed ? numText(job.compensation.overlapLabel) : 'Not verified'}</span></div>
        <div class="pt-2 flex justify-between gap-3"><span class="text-[#717680]">Eligibility</span><span class="${eligibilityRow.cls} font-medium text-right">${eligibilityRow.text}</span></div>
      </div>
    </div>
  `;
}

// Reality Check answers one question per job: can this person take it from Indonesia?
// Three verdict rows (eligibility, hours, real pay), each with a plain-language reason and the listing text it rests on.
const realityToneStyles = {
  good: { chip: 'bg-[#ecfdf3] text-[#027a48]', text: 'text-[#027a48]', icon: 'check-circle' },
  bad: { chip: 'bg-[#fef3f2] text-[#b42318]', text: 'text-[#b42318]', icon: 'x-circle' },
  unknown: { chip: 'bg-[#fffaeb] text-[#b54708]', text: 'text-[#b54708]', icon: 'help-circle' },
  info: { chip: 'bg-[#f5f6f8] text-[#414651]', text: 'text-[#181d27]', icon: 'info' },
};

function formatIdrMillions(value) {
  return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
}

// The one place a listing's pay becomes text. NEX's own numbers are always rupiah; the listing's
// original currency is kept only as a quote beside them. Returns null when the listing names no salary.
function formatListingPay(job) {
  const comp = job.compensation;
  const rate = illustrativeRatesToIdr[comp.currency];
  if (comp.min == null || !rate) return null;
  const minIdr = comp.min * rate;
  const maxIdr = comp.max * rate;
  const range = `IDR ${formatIdrMillions(minIdr).replace(/M$/, '')}–${formatIdrMillions(maxIdr)}`;
  const isIdr = comp.currency === 'IDR';
  const rateNote = isIdr ? null : `1 ${comp.currency} ≈ IDR ${rate.toLocaleString('en-US')} (illustrative rate)`;
  return {
    minIdr,
    maxIdr,
    isIdr,
    range, // "IDR 65.2–89.7M"
    rangeWithUnit: `${range} / month`,
    quote: job.salary, // "USD 4,000–5,500 / month"
    rateNote,
    // Already-rupiah listings get no quote line: it would repeat the rupiah figure word for word
    quoteLine: isIdr ? null : `From the listing: “${job.salary}” · ${rateNote}`,
  };
}

function getRealityCheck(job, state) {
  const comp = job.compensation;
  const fit = computeAiJobFit(job, state);
  const tzDim = fit.dimensions.find((d) => d.key === 'timezone');

  const eligibility =
    comp.eligibilityStatus === 'eligible'
      ? {
          tone: 'good',
          status: 'Indonesia accepted',
          explanation: 'The employer names Indonesia among the places it hires from, so you can apply from here.',
        }
      : comp.eligibilityStatus === 'not_eligible'
        ? {
            tone: 'bad',
            status: 'Not open to Indonesia',
            explanation: `It’s tagged “${job.arrangement}”, but the hiring requirement excludes Indonesia: you’d need the right to work in the employer’s country first. Remote here doesn’t mean remote from anywhere.`,
          }
        : {
            tone: 'unknown',
            status: 'Can’t verify',
            explanation: `The listing says “${job.location}” but never names the countries the employer can hire from, so NEX can’t confirm Indonesia is included.`,
          };
  eligibility.evidence = `From the listing: “${comp.eligibilityLabel}”`;

  const hours = !comp.scheduleConfirmed
    ? {
        tone: 'unknown',
        status: 'Not specified',
        explanation: 'The listing doesn’t say which hours you’d need to share with the team, so NEX can’t check them against your WIB day.',
        evidence: `From the listing: “${comp.overlapLabel}”`,
      }
    : {
        tone: tzDim.score === null || tzDim.status === 'Partial match' ? 'unknown' : tzDim.status === 'Strong match' ? 'good' : 'bad',
        status:
          tzDim.score === null
            ? 'Set your hours'
            : tzDim.status === 'Strong match'
              ? 'Fits your hours'
              : tzDim.status === 'Partial match'
                ? 'Slightly outside'
                : 'Outside your hours',
        explanation: tzDim.explanation,
        evidence: `From the listing: “${numText(comp.overlapLabel)}”`,
      };

  const userMinRaw = Number(String(state.minSalaryInput || '').replace(/[^\d]/g, '')) || 0;
  const userCurrency = state.currency || 'IDR';
  const userMinIdr =
    userMinRaw > 0 ? (userCurrency === 'IDR' && userMinRaw < 1000 ? userMinRaw * 1000000 : userMinRaw) * (illustrativeRatesToIdr[userCurrency] || 1) : 0;
  let salary;
  let payRange = null;
  let payMinIdr = 0;
  let payMaxIdr = 0;
  const pay = formatListingPay(job);
  if (!pay) {
    salary = { tone: 'unknown', status: 'Not specified', explanation: 'The listing doesn’t include a salary range.', evidence: 'From the listing: no salary stated' };
  } else {
    const { minIdr, maxIdr } = pay;
    payRange = pay.range;
    payMinIdr = minIdr;
    payMaxIdr = maxIdr;
    const converted = pay.isIdr
      ? `Paid in rupiah: ${pay.rangeWithUnit}.`
      : `Converts to ${pay.rangeWithUnit} before tax and transfer fees.`;
    // Same order as the verdict's pay clause: below the minimum, then the ideal, then the whole range vs the top only
    const idealIdr = userSalaryToIdr(state.idealSalaryInput, userCurrency);
    const reachesIdeal = userMinIdr > 0 && maxIdr >= userMinIdr && idealIdr > 0 && maxIdr >= idealIdr;
    const tone = userMinIdr === 0 ? 'info' : maxIdr < userMinIdr ? 'bad' : reachesIdeal || minIdr >= userMinIdr ? 'good' : 'unknown';
    const comparison =
      userMinIdr === 0
        ? ' Add your minimum salary to compare.'
        : maxIdr < userMinIdr
          ? ` That’s below your minimum of IDR ${formatIdrMillions(userMinIdr)}.`
          : reachesIdeal
            ? ` ${minIdr >= idealIdr ? 'The whole range clears' : 'The top of the range reaches'} your ideal of IDR ${formatIdrMillions(idealIdr)}.`
            : minIdr >= userMinIdr
              ? ` The whole range clears your minimum of IDR ${formatIdrMillions(userMinIdr)}.`
              : ` Only the top of the range reaches your minimum of IDR ${formatIdrMillions(userMinIdr)}.`;
    salary = {
      tone,
      status:
        tone === 'info'
          ? 'Minimum not set'
          : tone === 'bad'
            ? 'Below your minimum'
            : reachesIdeal
              ? 'Reaches your ideal'
              : tone === 'good'
                ? 'Above your minimum'
                : 'Top of range only',
      explanation: numText(converted + comparison),
      evidence: pay.quoteLine ? numText(pay.quoteLine) : null,
    };
  }

  // What NEX could not find, phrased as questions the recruiter can answer
  const missing = [];
  if (comp.eligibilityStatus === 'unknown') {
    missing.push({ label: 'Which countries they can hire from', question: 'Can you hire someone based in Indonesia, as an employee or a contractor?' });
  }
  if (!comp.scheduleConfirmed) {
    missing.push({ label: 'Which working hours you’d need to overlap', question: `Which hours would I need to overlap with the team? I’m on ${state.timezone}.` });
  }
  if (comp.min == null) {
    missing.push({ label: 'The salary range', question: 'What is the salary range for this role?' });
  }

  // The verdict names the employer and backs it with this listing's own numbers or words
  const company = job.company.replace(' (Sample)', '');
  const req = comp.overlapWibHours;
  const idrM = (v) => `IDR ${formatIdrMillions(v)}`;
  const userIdealIdr = userSalaryToIdr(state.idealSalaryInput, userCurrency);
  const hoursClause = req ? `needs ${req.end - req.start} hours of overlap, ${formatWibHour(req.start)}–${formatWibHour(req.end)} WIB` : '';
  const payClause = !payRange
    ? 'doesn’t list a salary'
    : !userMinIdr
      ? `pays about ${payRange}`
      : payMaxIdr < userMinIdr
        ? `tops out at ${idrM(payMaxIdr)}, under the ${idrM(userMinIdr)} minimum you set`
        : userIdealIdr && payMaxIdr >= userIdealIdr
          ? `pays ${payRange}, reaching the ${idrM(userIdealIdr)} ideal you set`
          : payMinIdr >= userMinIdr
            ? `pays ${payRange}, above the ${idrM(userMinIdr)} minimum you set`
            : `pays ${payRange}, though only the top reaches the ${idrM(userMinIdr)} minimum you set`;

  let verdict;
  if (eligibility.tone === 'bad') {
    const [requirement, ...conditions] = comp.eligibilityLabel.split(' · ');
    const needs = requirement.replace(/\s+required$/i, '');
    const noSponsorship = conditions.some((c) => /no visa sponsorship/i.test(c));
    const saysRemote = /remote/i.test(job.arrangement) ? 'remote' : `“${job.arrangement}”`;
    verdict = {
      tone: 'bad',
      title: `${company} can’t hire you from Indonesia.`,
      sub: `The listing says ${saysRemote}, but the employer only accepts candidates with ${needs}${noSponsorship ? ', and offers no visa sponsorship' : ''}.`,
    };
  } else if (eligibility.tone === 'unknown') {
    verdict = {
      tone: 'unknown',
      title: `${company} hasn’t said if it can hire from Indonesia.`,
      sub: `The listing only says “${job.location}” and never names the countries it hires from.`,
    };
  } else if (hours.tone === 'bad') {
    verdict = {
      tone: 'unknown',
      title: `${company} can hire you from Indonesia, but the hours don’t fit.`,
      sub: `It ${hoursClause} every working day, and you can work ${tzDim.you}.`,
    };
  } else if (salary.tone === 'bad') {
    verdict = { tone: 'unknown', title: `${company} can hire you from Indonesia, but pays below your minimum.`, sub: `It ${payClause}.` };
  } else if (!req) {
    verdict = {
      tone: 'good',
      title: `${company} can hire you from Indonesia.`,
      sub: `It ${payClause}, but the listing doesn’t say which hours you’d need to overlap.`,
    };
  } else {
    verdict = {
      tone: 'good',
      title: `${company} can hire you from Indonesia.`,
      sub: `It ${hoursClause}${hours.tone === 'unknown' ? ', slightly past your window,' : ','} and ${payClause}.`,
    };
  }

  return { fit, verdict, rows: [
    { key: 'eligibility', label: 'Eligibility', icon: 'globe', ...eligibility },
    { key: 'hours', label: 'Working hours', icon: 'clock', ...hours },
    { key: 'salary', label: 'Real salary', icon: 'coins', ...salary },
  ], missing };
}

function buildRecruiterDraft(job, missing, state) {
  const company = job.company.replace(' (Sample)', '');
  const role = state.selectedRoles[0] || 'product designer';
  const city = state.city || 'Jakarta';
  const questions = missing.map((m, idx) => `${idx + 1}. ${m.question}`).join('\n');
  return `Hi ${company} team,\n\nThanks for sharing the ${job.title} role. I’m a ${role} based in ${city}, Indonesia. Before I apply, could you confirm:\n\n${questions}\n\nThank you,\n${state.userFirstName}`;
}

// Who's hiring: who posted the listing, where UpNext read it, and where the application lands.
// A statement of what is visible, kept out of computeAiJobFit and never scored or labelled genuine
function renderWhoIsHiring(job, revealClass = '') {
  const who = job.whoIsHiring;
  if (!who) return '';
  let applyHost = '';
  try {
    applyHost = new URL(job.applicationMethod.url).hostname.replace(/^www\./, '');
  } catch (e) {}
  const rows = [
    { label: 'Posted by', value: who.poster, sub: who.posterRole },
    { label: 'Read from', value: job.source, sub: who.postedBy === 'repost' ? 'a repost of the original' : '' },
    { label: 'Applications go to', value: applyHost || 'Not stated', sub: who.applyHostIs },
  ];
  return `
    <div class="bg-white rounded-[18px] p-4 space-y-3 ${revealClass}">
      <div class="flex items-center gap-2">
        <i data-lucide="building-2" class="w-4 h-4 text-[#44658b]"></i>
        <h2 class="text-[14px] font-medium text-[#181d27]">Who’s hiring</h2>
      </div>
      <p class="text-[12.5px] leading-[18px] text-[#414651]">${who.summary}</p>
      <div class="divide-y divide-[#edeef1] text-[12px]">
        ${rows
          .map(
            (r, i) => `
          <div class="${i === 0 ? 'pb-2' : i === rows.length - 1 ? 'pt-2' : 'py-2'} flex justify-between gap-4">
            <span class="text-[#717680] shrink-0 whitespace-nowrap">${r.label}</span>
            <span class="min-w-0 text-right">
              <span class="block text-[#181d27] break-words">${r.value}</span>
              ${r.sub ? `<span class="block text-[11px] leading-[15px] text-[#717680]">${r.sub}</span>` : ''}
            </span>
          </div>
        `
          )
          .join('')}
      </div>
      <p class="text-[11px] leading-[15px] text-[#717680]">UpNext can see where a listing came from, not whether the company behind it is genuine.</p>
    </div>
  `;
}

function renderRealityCheckRoute(animatePage) {
  const job = sampleJobsCatalog.find((j) => j.id === workbenchState.selectedJobId) || sampleJobsCatalog[0];
  const check = getRealityCheck(job, workbenchState);
  const display = getMatchDisplay(job, check.fit);
  const verdictStyle = realityToneStyles[check.verdict.tone];
  const draft = buildRecruiterDraft(job, check.missing, workbenchState);

  return `
    <!-- A. Verdict: NEX's result for this listing (named employer + its own numbers), identity as a thin line -->
    <div class="oa-ai-banner rounded-[18px] p-4 space-y-3 ${getRevealClass(0, animatePage)}">
      <div class="flex items-center gap-2">
        <img src="./bosshire-ai-blob.png" alt="NEX" class="nex-orb w-6 h-6 rounded-full object-contain shrink-0" />
        <span class="text-[12px] text-[#44658b]">NEX’s read</span>
      </div>
      <div class="space-y-1">
        <h1 class="text-[20px] leading-[26px] font-medium ${verdictStyle.text}">${check.verdict.title}</h1>
        <p class="text-[12.5px] leading-[18px] text-[#414651]">${numText(check.verdict.sub)}</p>
      </div>
      <div class="pt-2.5 border-t border-[#44658b]/10 flex items-center justify-between gap-3 text-[11.5px] leading-[16px]">
        <span class="text-[#535862] truncate">${job.title} · ${job.arrangement}</span>
        ${
          display.kind === 'blocked'
            ? ''
            : `<span class="shrink-0 ${display.kind === 'unverified' ? 'text-[#b54708]' : 'text-[#717680]'}">${
                display.kind === 'unverified'
                  ? `<span class="font-mono-ds">${display.score}</span>% · unverified`
                  : `<span class="font-mono-ds">${display.score}</span>% match`
              }</span>`
        }
      </div>
    </div>

    ${
      check.missing.length > 0
        ? `<!-- B. Low confidence: say what is missing, then hand the user a question to send -->
           <div class="bg-[#fffaeb] rounded-[18px] p-4 space-y-3 ${getRevealClass(1, animatePage)}">
             <div class="flex items-start gap-2.5">
               <i data-lucide="help-circle" class="w-4 h-4 text-[#b54708] shrink-0 mt-0.5"></i>
               <div class="space-y-1">
                 <h2 class="text-[14.5px] font-medium text-[#181d27]">What NEX couldn’t find in the listing</h2>
                 <ul class="space-y-0.5 text-[12.5px] leading-[18px] text-[#414651]">
                   ${check.missing.map((m) => `<li class="flex items-start gap-1.5"><span class="w-1 h-1 rounded-full bg-[#b54708] mt-2 shrink-0"></span><span>${m.label}</span></li>`).join('')}
                 </ul>
               </div>
             </div>
             ${
               workbenchState.recruiterDraftOpen
                 ? `<div class="bg-white rounded-[14px] p-3 space-y-2.5 oa-chip-pop">
                      <div class="text-[11px] text-[#717680]">Draft message · edit before sending</div>
                      <p class="text-[12.5px] leading-[18px] text-[#181d27] whitespace-pre-line">${numText(draft)}</p>
                      <div class="flex items-center gap-2">
                        <button onclick="copyRecruiterDraft()" class="oa-press flex-1 h-[40px] rounded-full bg-[#44658b] hover:bg-[#355070] text-white text-[13px] cursor-pointer inline-flex items-center justify-center gap-1.5">
                          <i data-lucide="${workbenchState.recruiterDraftCopied ? 'check' : 'copy'}" class="w-4 h-4"></i>
                          <span>${workbenchState.recruiterDraftCopied ? 'Copied' : 'Copy message'}</span>
                        </button>
                        <button onclick="toggleRecruiterDraft()" class="oa-press h-[40px] px-4 rounded-full bg-[#f0f1f3] hover:bg-[#e6e8eb] text-[#181d27] text-[13px] cursor-pointer">Close</button>
                      </div>
                      <p class="text-[11px] leading-[15px] text-[#717680]">UpNext doesn’t send this for you. Paste it into your reply to the recruiter.</p>
                    </div>`
                 : `<button onclick="toggleRecruiterDraft()" class="oa-press w-full h-[40px] rounded-full bg-[#44658b] hover:bg-[#355070] text-white text-[13px] cursor-pointer inline-flex items-center justify-center gap-1.5">
                      <i data-lucide="message-square" class="w-4 h-4"></i>
                      <span>Ask the recruiter</span>
                    </button>`
             }
           </div>`
        : ''
    }

    <!-- C. Three verdict rows, each with its source -->
    <div class="bg-white rounded-[18px] px-4 py-1 divide-y divide-[#edeef1] ${getRevealClass(2, animatePage)}">
      ${check.rows
        .map((row) => {
          const style = realityToneStyles[row.tone];
          return `
            <div class="py-3.5 space-y-1.5">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <i data-lucide="${row.icon}" class="w-4 h-4 text-[#44658b]"></i>
                  <h2 class="text-[14px] font-medium text-[#181d27]">${row.label}</h2>
                </div>
                <span class="h-[24px] px-2.5 rounded-full ${style.chip} text-[11px] inline-flex items-center gap-1 shrink-0">
                  <i data-lucide="${style.icon}" class="w-3 h-3"></i>
                  <span>${numText(row.status)}</span>
                </span>
              </div>
              <p class="text-[12.5px] leading-[18px] text-[#414651]">${row.explanation}</p>
              ${row.evidence ? `<p class="text-[11px] leading-[15px] text-[#717680]">${row.evidence}</p>` : ''}
            </div>
          `;
        })
        .join('')}
    </div>

    <!-- C2. Who's hiring: a trace of who is behind the listing, separate from the verdict -->
    ${renderWhoIsHiring(job, getRevealClass(3, animatePage))}

    <!-- D. Actions: the decision stays with the user -->
    <div class="space-y-2 pb-4 ${getRevealClass(4, animatePage)}">
      <div class="flex items-center gap-2">
        ${
          check.verdict.tone === 'bad'
            ? `<button onclick="navigateDashboardRoute('explore')" class="oa-press flex-1 h-[40px] rounded-full bg-[#44658b] hover:bg-[#355070] text-white text-[13px] cursor-pointer">Find roles open to Indonesia</button>`
            : `<button onclick="openFullJobDetails('${job.id}')" class="oa-press flex-1 h-[40px] rounded-full bg-[#44658b] hover:bg-[#355070] text-white text-[13px] cursor-pointer">View job details</button>`
        }
      </div>
      <button onclick="openFitBreakdownSheet()" class="oa-press w-full h-[36px] rounded-full bg-transparent hover:bg-white text-[#44658b] text-[12.5px] cursor-pointer">
        See full fit breakdown
      </button>
    </div>
  `;
}

function renderJobDetailsRoute(animatePage) {
  const job = sampleJobsCatalog.find((j) => j.id === workbenchState.selectedJobId) || sampleJobsCatalog[0];
  const isSaved = workbenchState.savedJobIds.includes(job.id);
  const isShared = workbenchState.jobShareCopiedId === job.id;
  const fit = computeAiJobFit(job, workbenchState);
  const activeTab = workbenchState.jobDetailsTab || 'overview';

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'description', label: 'Job Description' },
    { id: 'company', label: 'Company' },
  ];

  return `
    <!-- 1. Compact Job Header (unframed, on the page background) -->
    <div class="px-1 pt-1 pb-1 space-y-2.5 ${getRevealClass(0, animatePage)}">
      <div class="flex items-start justify-between gap-2.5">
        <div class="flex items-start gap-3 min-w-0">
          ${renderCompanyMark(job, 'lg')}
          <div class="min-w-0">
            <h1 class="text-[17px] leading-[22px] font-medium text-[#181d27]">${job.title}</h1>
            <p class="text-[12px] text-[#535862] mt-0.5">${job.company}</p>
          </div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <button
            onclick="shareJob('${job.id}')"
            aria-label="Share job"
            class="oa-press h-8 px-2.5 rounded-full bg-white hover:bg-[#ebf2fa] text-[#414651] text-[11.5px] flex items-center gap-1 cursor-pointer"
          >
            <i data-lucide="share-2" class="w-3.5 h-3.5"></i>
            <span>${isShared ? 'Copied' : 'Share'}</span>
          </button>
          <button
            onclick="toggleSaveJob('${job.id}', event)"
            aria-label="Save job"
            class="oa-press w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
              isSaved ? 'bg-[#ebf2fa] text-[#44658b]' : 'bg-white text-[#717680]'
            }"
          >
            <i data-lucide="bookmark" class="w-4 h-4 ${isSaved ? 'fill-[#44658b]' : ''}"></i>
          </button>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] leading-[15px] text-[#717680]">
        <i data-lucide="link" class="w-3 h-3 shrink-0"></i>
        <span>Read from ${job.source} · Checked ${numText(formatCheckedDate(job.lastCheckedAt))}</span>
        <a href="${job.sourceUrl}" target="_blank" rel="noopener noreferrer" class="shrink-0 text-[#44658b] hover:text-[#355070] inline-flex items-center gap-0.5">
          <span>Original listing</span>
          <i data-lucide="external-link" class="w-3 h-3"></i>
        </a>
      </div>

      ${
        job.compensation.eligibilityStatus !== 'eligible'
          ? `<div class="flex">
               <span class="h-[24px] px-2.5 rounded-full ${getEligibilityChip(job).cls} text-[11px] inline-flex items-center gap-1">
                 <span>${job.locationFlag}</span>
                 <span>${getEligibilityChip(job).text}</span>
               </span>
             </div>`
          : ''
      }
    </div>

    <!-- 2. Sticky Tab Navigation -->
    <div id="job-details-tabs" class="sticky top-0 z-10 bg-[#f5f6f8] pt-0.5 pb-1">
      <div class="bg-white rounded-full p-1 grid grid-cols-3 gap-1">
        ${tabs
          .map(
            (t) => `
          <button
            onclick="setJobDetailsTab('${t.id}')"
            class="oa-press h-[32px] rounded-full text-[12px] font-medium cursor-pointer transition-colors ${
              activeTab === t.id ? 'bg-[#44658b] text-white' : 'text-[#535862] hover:text-[#181d27]'
            }"
          >${t.label}</button>
        `
          )
          .join('')}
      </div>
    </div>

    <!-- 3. Active Tab Content -->
    <div id="job-details-tab-content" class="space-y-4">
      ${renderJobDetailsTabContent(job, fit, animatePage)}
    </div>
  `;
}

// Strip visual, Working hours: you vs this role on one 24h WIB axis. Bars use neutral identity colours,
// only the overlap carries status colour; the only animated visual (bars grow in, then the overlap lights up)
function renderHoursComparison(job, state) {
  const zone = parseTimezone(state.timezone);
  const req = job.compensation.scheduleConfirmed ? job.compensation.overlapWibHours : null;
  const userRaw = state.workHours ? toWibHours(state.workHours, state.timezone) : null;
  const user = userRaw ? { start: Math.max(0, userRaw.start), end: Math.min(24, userRaw.end) } : null;
  const overlap = user && req ? { start: Math.max(user.start, req.start), end: Math.min(user.end, req.end) } : null;
  const overlapHours = overlap ? Math.max(0, overlap.end - overlap.start) : 0;
  const outsideHours = req ? req.end - req.start - overlapHours : 0;
  const overlapCls =
    outsideHours === 0
      ? 'bg-[#039855] shadow-[0_0_0_3px_rgba(3,152,85,0.18)] rc-overlap-in'
      : 'bg-[#f79626] shadow-[0_0_0_3px_rgba(247,150,38,0.2)] rc-overlap-in';
  const overlapSeg = overlapHours > 0 ? [{ ...overlap, cls: overlapCls }] : [];
  const rowLabel = (text) => `<span class="text-[11px] leading-[15px] text-[#535862]">${text}</span>`;
  const swatchCls = outsideHours === 0 ? 'bg-[#039855]' : 'bg-[#f79626]';

  return `
    <div class="space-y-2">
      <div class="grid grid-cols-[60px_1fr] items-center gap-x-1 gap-y-1">
        ${rowLabel('You')}
        ${
          user
            ? renderHoursTrack({ size: 'lg', segments: [{ ...user, cls: 'bg-[#b0cfee] rc-bar-in' }, ...overlapSeg] })
            : `<span class="px-3 text-[11.5px] text-[#b54708]">Hours not set</span>`
        }
        ${rowLabel('This role')}
        ${
          req
            ? renderHoursTrack({ size: 'lg', segments: [{ ...req, cls: 'bg-[#a4a7ae] rc-bar-in' }, ...overlapSeg] })
            : `<span class="px-3 h-[32px] inline-flex items-center text-[11.5px] text-[#b54708]">Not stated in the listing</span>`
        }
        <span></span>
        ${renderHoursTicks()}
      </div>
      <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-[15px] text-[#535862]">
        ${
          req && user
            ? overlapHours > 0
              ? `<span class="inline-flex items-center gap-1"><span class="w-2 h-2 rounded-full ${swatchCls}"></span><span>${numText(
                  `${overlapHours}h overlap, ${formatWibHour(overlap.start)}–${formatWibHour(overlap.end)} WIB`
                )}</span></span>${outsideHours > 0 ? `<span>${numText(`· ${outsideHours}h outside your hours`)}</span>` : ''}`
              : `<span>${numText(`No overlap · ${outsideHours}h outside your hours`)}</span>`
            : ''
        }
        ${zone.offset !== 7 && user ? `<span class="text-[#717680]">${numText(`Shown in WIB (you’re on ${zone.abbr})`)}</span>` : ''}
      </div>
    </div>
  `;
}

// Strip visual, Real salary: the listing's range on one rupiah axis with the user's minimum and ideal as markers
function renderSalaryComparison(job, state) {
  const pay = formatListingPay(job);
  if (!pay) {
    return `<div class="h-[96px] flex items-center justify-center text-[11.5px] text-[#b54708]">The listing doesn’t include a salary range.</div>`;
  }
  const currency = state.currency || 'IDR';
  const minIdr = userSalaryToIdr(state.minSalaryInput, currency);
  const idealIdr = userSalaryToIdr(state.idealSalaryInput, currency);
  const lo = pay.minIdr;
  const hi = pay.maxIdr;
  const axisMax = Math.ceil((Math.max(hi, minIdr, idealIdr) * 1.15) / 5000000) * 5000000;
  const pct = (v) => (v / axisMax) * 100;
  const bar = (from, to, cls) =>
    to > from ? `<div class="absolute top-[22px] h-[12px] rounded-full ${cls}" style="left: ${pct(from)}%; width: ${pct(to) - pct(from)}%"></div>` : '';
  const anchor = (v) => (pct(v) < 10 ? 'translate-x-0' : pct(v) > 90 ? '-translate-x-full' : '-translate-x-1/2');
  const marker = (v, label, below) =>
    v
      ? `<div class="absolute top-[16px] w-[2px] h-[24px] -translate-x-1/2 rounded-full bg-[#181d27]" style="left: ${pct(v)}%"></div>
         <span class="absolute ${below ? 'top-[42px]' : 'top-0'} ${anchor(v)} text-[11px] leading-[15px] text-[#181d27] whitespace-nowrap" style="left: ${pct(v)}%">${moneyText(`${label} ${formatIdrMillions(v)}`)}</span>`
      : '';

  return `
    <div class="space-y-1.5">
      <div class="relative h-[58px] mx-3">
        <div class="absolute inset-x-0 top-[22px] h-[12px] rounded-full bg-[#e4e6ea]"></div>
        ${minIdr ? bar(lo, Math.min(hi, minIdr), 'bg-[#f79626]') : ''}
        ${bar(minIdr ? Math.max(lo, minIdr) : lo, hi, 'bg-[#44658b]')}
        ${marker(minIdr, 'Min', false)}
        ${marker(idealIdr, 'Ideal', true)}
      </div>
      <div class="flex justify-between text-[10.5px] text-[#a4a7ae] mx-3">
        <span class="font-mono-ds">0</span>
        <span>${moneyText(`IDR ${formatIdrMillions(axisMax / 2)}`)}</span>
        <span>${moneyText(`IDR ${formatIdrMillions(axisMax)}`)}</span>
      </div>
      ${!minIdr ? '<p class="text-[11px] leading-[15px] text-[#717680]">Add your minimum salary to see where it sits.</p>' : ''}
    </div>
  `;
}

// Strip visual, Eligibility: the employer's actual country list as chips, Indonesia marked apart. Real data, no score
const countryFlags = {
  Indonesia: '🇮🇩', Singapore: '🇸🇬', Philippines: '🇵🇭', Germany: '🇩🇪', Vietnam: '🇻🇳', Australia: '🇦🇺', 'United Kingdom': '🇬🇧',
};

function renderEligibilityCountries(job) {
  const status = job.compensation.eligibilityStatus;
  const countries = job.companyInfo.hiringCountries || [];
  const chip = (name, cls, icon) =>
    `<span class="h-[28px] px-2.5 rounded-full ${cls} text-[11.5px] inline-flex items-center gap-1">
       <span>${countryFlags[name] || '🌐'}</span><span>${name}</span>${icon ? `<i data-lucide="${icon}" class="w-3 h-3"></i>` : ''}
     </span>`;
  const others = countries.filter((c) => c !== 'Indonesia');

  if (status === 'unknown') {
    return `
      <div class="space-y-2">
        <div class="text-[11px] text-[#535862]">Employer hires in</div>
        <div class="h-[40px] rounded-[10px] border border-dashed border-[#d0d5dd] flex items-center justify-center text-[11.5px] text-[#717680]">
          No countries named in the listing
        </div>
        <div class="flex flex-wrap gap-1.5">${chip('Indonesia', 'bg-[#fffaeb] text-[#b54708]', 'help-circle')}</div>
      </div>
    `;
  }
  if (status === 'not_eligible') {
    return `
      <div class="space-y-2">
        <div class="text-[11px] text-[#535862]">Employer hires in</div>
        <div class="flex flex-wrap gap-1.5">${others.map((c) => chip(c, 'bg-white text-[#414651]')).join('')}</div>
        <div class="text-[11px] text-[#535862]">Not included</div>
        <div class="flex flex-wrap gap-1.5">${chip('Indonesia', 'bg-[#fef3f2] text-[#b42318] line-through decoration-[#b42318]/50', 'x-circle')}</div>
      </div>
    `;
  }
  return `
    <div class="space-y-2">
      <div class="text-[11px] text-[#535862]">Employer hires in</div>
      <div class="flex flex-wrap gap-1.5">
        ${chip('Indonesia', 'bg-[#ecfdf3] text-[#027a48]', 'check-circle')}
        ${others.map((c) => chip(c, 'bg-white text-[#414651]')).join('')}
      </div>
    </div>
  `;
}

// Swipe strip: the three Reality Check essentials only. Each card is status, visual, listing quote and a NEX line;
// the visual replaces the sentences and columns that would repeat it. Dots show each card's status up front
function renderFitStrip(job, state, fit, ui) {
  const comp = job.compensation;
  const req = comp.scheduleConfirmed ? comp.overlapWibHours : null;
  const userHours = state.workHours ? toWibHours(state.workHours, state.timezone) : null;
  const outsideHours = req && userHours
    ? Math.max(0, Math.max(0, userHours.start) - req.start) + Math.max(0, req.end - Math.min(24, userHours.end))
    : 0;
  const currency = state.currency || 'IDR';
  const minIdr = userSalaryToIdr(state.minSalaryInput, currency);
  const idealIdr = userSalaryToIdr(state.idealSalaryInput, currency);
  const pay = formatListingPay(job);
  const lo = pay ? pay.minIdr : null;
  const hi = pay ? pay.maxIdr : null;
  const countries = job.companyInfo.hiringCountries || [];

  const essentials = {
    location: {
      title: 'Eligibility',
      icon: 'globe',
      visual: renderEligibilityCountries(job),
      headline: null,
      nex:
        comp.eligibilityStatus === 'eligible'
          ? { bold: 'Indonesia is on the list.', text: `You can apply from ${state.city || state.country}.` }
          : comp.eligibilityStatus === 'not_eligible'
            ? { bold: 'Indonesia isn’t on the list.', text: `The employer only hires in ${countries.join(', ') || 'other countries'}.` }
            : { bold: 'No country list.', text: 'Ask the recruiter before you apply.' },
    },
    timezone: {
      title: 'Working hours',
      icon: 'clock',
      visual: renderHoursComparison(job, state),
      // Jam mulai dan selesainya sudah ada di baris overlap dan di kutipan listing
      headline: null,
      nex: !req
        ? { bold: 'Not stated.', text: 'The listing doesn’t say which hours you’d overlap.' }
        : outsideHours === 0
          ? { bold: 'Fits your day.', text: 'It sits inside the hours you can work.' }
          : { bold: outsideHours <= 1 ? 'Slightly outside.' : 'Outside your hours.', text: `You’d work until ${formatWibHour(req.end)} WIB, ${outsideHours}h past your window.` },
    },
    salary: {
      title: 'Real salary',
      icon: 'coins',
      visual: renderSalaryComparison(job, state),
      headline: pay ? pay.rangeWithUnit : 'No salary listed',
      nex:
        lo == null
          ? { bold: 'No range.', text: 'The listing doesn’t include a salary.' }
          : !minIdr
            ? { bold: 'No minimum set.', text: 'Add one in your profile to compare.' }
            : hi < minIdr
              ? { bold: 'Below your minimum.', text: `It tops out at IDR ${formatIdrMillions(hi)}.` }
              : idealIdr && hi >= idealIdr
                ? { bold: 'Reaches your ideal.', text: `${lo >= idealIdr ? 'The whole range' : 'The top of the range'} clears IDR ${formatIdrMillions(idealIdr)}.` }
                : lo >= minIdr
                  ? { bold: 'Above your minimum.', text: 'The whole range clears it.' }
                  : { bold: 'Top of range only.', text: `Only the upper end reaches IDR ${formatIdrMillions(minIdr)}.` },
    },
  };
  const dims = ['location', 'timezone', 'salary'].map((key) => fit.dimensions.find((d) => d.key === key)).filter(Boolean);

  return `
    <div class="space-y-2">
      <div
        id="fit-strip"
        onscroll="updateFitStripDots(this)"
        class="flex gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory"
      >
        ${dims
          .map((dim) => {
            const extra = essentials[dim.key];
            return `
              <div class="snap-start shrink-0 w-[88%] bg-[#f7f8fa] rounded-[18px] p-3.5 flex flex-col gap-2.5">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-1.5 text-[12.5px] font-medium text-[#181d27] min-w-0">
                    <i data-lucide="${extra.icon}" class="w-4 h-4 text-[#44658b] shrink-0"></i>
                    <span class="truncate">${extra.title}</span>
                  </div>
                  <span class="h-[22px] px-2 rounded-full text-[10.5px] font-medium inline-flex items-center shrink-0 ${ui.statusBadgeClass(dim.status)}">${dim.status}</span>
                </div>
                <div class="bg-white rounded-[14px] p-3 flex flex-col justify-center gap-2">
                  ${extra.visual}
                  ${extra.headline ? `<div class="text-[14px] leading-[20px] font-medium text-[#181d27]">${moneyText(extra.headline)}</div>` : ''}
                </div>
                ${ui.renderEvidence(dim)}
                <div class="mt-auto pt-0.5 flex items-start gap-2">
                  <img src="./bosshire-ai-blob.png" alt="NEX" class="w-5 h-5 rounded-full shrink-0 mt-0.5" />
                  <div class="bg-[#ebf2fa] rounded-[14px] rounded-tl-[4px] px-3 py-2 text-[11.5px] leading-[16px] text-[#282828]">
                    <span class="font-medium">${extra.nex.bold}</span> ${numText(extra.nex.text)}
                  </div>
                </div>
              </div>
            `;
          })
          .join('')}
      </div>
      <div class="flex items-center justify-center gap-1.5" role="tablist" aria-label="Fit dimensions">
        ${dims
          .map(
            (dim, idx) =>
              `<button onclick="scrollFitStripTo(${idx})" role="tab" aria-label="${essentials[dim.key].title}: ${dim.status}" aria-selected="${idx === 0}" data-fit-dot="${idx}" class="h-1.5 rounded-full transition-all duration-200 cursor-pointer ${ui.statusBarColor(dim.status)} ${
                idx === 0 ? 'w-4' : 'w-1.5'
              }"></button>`
          )
          .join('')}
      </div>
    </div>
  `;
}

function renderFitBreakdownSheet() {
  if (!workbenchState.fitBreakdownSheetOpen) return '';
  const job = sampleJobsCatalog.find((j) => j.id === workbenchState.selectedJobId) || sampleJobsCatalog[0];
  const fit = computeAiJobFit(job, workbenchState);
  const display = getMatchDisplay(job, fit);
  const showDimScore = (dim) => typeof dim.score === 'number' && display.kind !== 'blocked';
  const pay = formatListingPay(job);
  const listingQuotes = {
    location: `From the listing: “${job.compensation.eligibilityLabel}”`,
    timezone: `From the listing: “${numText(job.compensation.overlapLabel)}”`,
    salary: pay ? pay.quoteLine && moneyText(pay.quoteLine) : `From the listing: “${moneyText(job.salary)}”`,
  };
  const renderEvidence = (dim) => {
    const text = dim.key in listingQuotes ? listingQuotes[dim.key] : dim.evidence;
    return text ? `<p class="text-[10.5px] leading-[14px] text-[#717680]">${text}</p>` : '';
  };
  const headerVerdict =
    display.kind === 'blocked'
      ? display.label
      : `<span class="font-mono-ds">${display.score}%</span> (${display.kind === 'unverified' ? 'unverified' : display.label})`;

  // Experience and Tools statuses are sentences, not match levels, so those dimensions carry a tone
  const toneBadgeClass = {
    good: 'bg-[#ecfdf3] text-[#027a48]',
    warn: 'bg-[#fffaeb] text-[#b54708]',
    bad: 'bg-[#fef3f2] text-[#b42318]',
    unknown: 'bg-[#f0f1f3] text-[#535862]',
  };
  const statusTone = (st) =>
    st === 'Strong match' ? 'good' : st === 'Partial match' ? 'warn' : st === 'Potential mismatch' || st === 'Not eligible' ? 'bad' : 'unknown';
  const statusBadgeClass = (st) => toneBadgeClass[statusTone(st)];

  const statusBarColor = (st) => {
    if (st === 'Strong match') return 'bg-[#039855]';
    if (st === 'Partial match') return 'bg-[#f79626]';
    if (st === 'Potential mismatch' || st === 'Not eligible') return 'bg-[#d92d20]';
    return 'bg-[#d0d5dd]';
  };

  return `
    <div class="oa-drawer-overlay absolute inset-0 z-40 bg-[#101828]/50 backdrop-blur-[2px] flex items-end justify-center" onclick="closeFitBreakdownSheet(event)">
      <div class="oa-sheet-up w-full max-h-[84%] flex flex-col bg-[#fdfdfd] rounded-t-[24px] px-5 pt-3 pb-5 shadow-[0_-16px_48px_-12px_rgba(16,24,40,0.22)]" onclick="event.stopPropagation()">
        <div class="w-10 h-1 rounded-full bg-[#d0d5dd] mx-auto shrink-0 mb-3"></div>
        <div class="flex items-start justify-between gap-2 pb-3 border-b border-[#edeef1] shrink-0">
          <div>
            <div class="text-[11px] ${display.kind === 'scored' ? 'text-[#44658b]' : display.textCls} font-medium">NEX AI Job Fit · ${headerVerdict}</div>
            <h3 class="text-[16px] font-medium text-[#181d27]">Full compatibility breakdown</h3>
          </div>
          <button onclick="closeFitBreakdownSheet()" aria-label="Close" class="oa-press w-8 h-8 rounded-full bg-[#f5f6f8] text-[#535862] flex items-center justify-center cursor-pointer">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto no-scrollbar py-3 space-y-2.5">
          ${renderFitStrip(job, workbenchState, fit, { showDimScore, statusBadgeClass, statusBarColor, renderEvidence })}
          <div class="pt-1 px-1 text-[11.5px] text-[#717680]">Other dimensions</div>
          ${fit.dimensions
            .filter((dim) => !['location', 'timezone', 'salary'].includes(dim.key))
            .map(
              (dim) => `
            <div class="bg-[#f7f8fa] rounded-[14px] p-3 space-y-1.5">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[12.5px] font-medium text-[#181d27]">${dim.label}</span>
                <span class="h-[22px] px-2 rounded-full text-[10.5px] font-medium inline-flex items-center shrink-0 ${toneBadgeClass[dim.tone || statusTone(dim.status)]}">
                  <span>${showDimScore(dim) ? `<span class="font-mono-ds">${dim.score}%</span> · ` : ''}${numText(dim.status)}</span>
                </span>
              </div>
              ${
                showDimScore(dim)
                  ? `<div class="h-1.5 w-full rounded-full bg-[#e4e6ea] overflow-hidden">
                       <div class="h-full rounded-full ${statusBarColor(dim.status)}" style="width: ${dim.score}%"></div>
                     </div>`
                  : ''
              }
              <p class="text-[11.5px] leading-[17px] text-[#414651]">${dim.explanation}</p>
              ${renderEvidence(dim)}
            </div>
          `
            )
            .join('')}
        </div>

        <div class="pt-2 flex items-center gap-2 shrink-0">
          <button onclick="closeFitBreakdownSheet()" class="oa-press flex-1 h-[40px] rounded-full bg-[#44658b] text-white text-[13px] cursor-pointer">
            Done
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderScreen8(animatePage) {
  const route = workbenchState.dashboardRoute || 'home';
  const bodyHTML =
    route === 'home' ? renderHomeDashboardBody(animatePage) : renderDashboardSubRoute(route, animatePage);

  const activeJob = sampleJobsCatalog.find((j) => j.id === workbenchState.selectedJobId) || sampleJobsCatalog[0];
  const isSaved = workbenchState.savedJobIds.includes(activeJob.id);

  const persistentJobBar =
    route === 'job_details'
      ? `
      <div class="sticky bottom-0 z-20 bg-[#f5f6f8]/95 backdrop-blur-md px-3 pt-2.5 pb-4 border-t border-[#edeef1] flex items-center gap-2 shrink-0">
        <button
          onclick="toggleSaveJob('${activeJob.id}', event)"
          class="oa-press h-[42px] px-4 rounded-full bg-white hover:bg-[#ebf2fa] text-[#181d27] text-[13px] cursor-pointer inline-flex items-center gap-1.5 shrink-0"
        >
          <i data-lucide="bookmark" class="w-4 h-4 ${isSaved ? 'fill-[#44658b] text-[#44658b]' : ''}"></i>
          <span>${isSaved ? 'Saved' : 'Save'}</span>
        </button>
        ${
          activeJob.compensation.eligibilityStatus === 'not_eligible'
            ? `<button
                 onclick="openRealityCheck('${activeJob.id}')"
                 class="oa-press flex-1 h-[42px] rounded-full bg-[#fef3f2] text-[#b42318] text-[13.5px] font-medium cursor-pointer inline-flex items-center justify-center gap-1.5"
               >
                 <span>Why you can’t apply</span>
                 <i data-lucide="arrow-right" class="w-4 h-4"></i>
               </button>`
            : `<a
                 href="${activeJob.applicationMethod.url || activeJob.sourceUrl}"
                 target="_blank"
                 rel="noopener noreferrer"
                 class="oa-press flex-1 min-w-0 h-[42px] px-4 rounded-full bg-[#44658b] hover:bg-[#355070] text-white text-[13.5px] font-medium cursor-pointer inline-flex items-center justify-center gap-1.5"
               >
                 <span class="truncate">${
                   ['job_board', 'agency'].includes(activeJob.applicationMethod.type)
                     ? activeJob.applicationMethod.label
                     : `Apply on ${activeJob.company.replace(' (Sample)', '')}’s site`
                 }</span>
                 <i data-lucide="external-link" class="w-4 h-4 shrink-0"></i>
               </a>`
        }
      </div>`
      : '';

  return `
    <div class="flex-1 flex flex-col">
      ${renderDashboardHeader(route)}
      <div class="px-3 pb-5 space-y-3 flex-1 flex flex-col">
        ${bodyHTML}
      </div>
      ${persistentJobBar}
    </div>
  `;
}

// ── PART 2: NEXGATION DRAWER (SCREEN 09) ──
function renderNavigationDrawer() {
  if (!workbenchState.drawerOpen) return '';
  const current = workbenchState.dashboardRoute || 'home';

  const group1 = [
    { route: 'explore', icon: 'search', label: 'Find Jobs' },
    { screen: 7, icon: 'sparkles', label: 'Recommended Jobs' },
    { route: 'saved', icon: 'bookmark', label: 'Saved Jobs' },
  ];

  const group2 = [{ route: 'cover_letter', icon: 'file-text', label: 'Cover Letter Generator', tag: 'Roadmap' }];

  const group3 = [
    { route: 'applications', icon: 'briefcase', label: 'My Applications' },
    { route: 'profile', icon: 'user', label: 'Career Profile' },
  ];

  const renderNavItem = (item, isAI = false) => {
    const active = item.route && current === item.route;
    const onclick = item.screen ? `closeDrawerAndGoScreen(${item.screen})` : `closeDrawerAndNavigate('${item.route}')`;
    return `
      <button
        onclick="${onclick}"
        class="oa-press w-full px-3 py-2 rounded-[10px] text-left text-[13px] flex items-center gap-2.5 cursor-pointer ${
          active
            ? 'bg-[#ebf2fa] text-[#355070]'
            : isAI
            ? 'text-[#181d27] hover:bg-white'
            : 'text-[#414651] hover:bg-[#f5f6f8]'
        }"
      >
        <i data-lucide="${item.icon}" class="w-4 h-4 ${active || isAI ? 'text-[#44658b]' : 'text-[#717680]'} shrink-0"></i>
        <span class="truncate">${item.label}</span>
        ${item.tag ? `<span class="ml-auto h-[20px] px-2 rounded-full bg-white text-[#717680] text-[10.5px] inline-flex items-center shrink-0">${item.tag}</span>` : ''}
      </button>
    `;
  };

  return `
    <div class="oa-drawer-overlay absolute inset-0 z-50 bg-[#101828]/50 backdrop-blur-[2px] flex justify-end" onclick="closeDrawer()">
      <aside class="oa-drawer-panel w-[82%] max-w-[320px] h-full bg-white flex flex-col justify-between p-4 shadow-[-12px_0_40px_-12px_rgba(16,24,40,0.22)]" onclick="event.stopPropagation()">
        <!-- Top Bar -->
        <div class="flex items-center justify-between pb-3 border-b border-[#edeef1] shrink-0">
          <span class="upnext-logo text-[19px] leading-none inline-flex items-baseline">
            <span class="text-[#44658b]">Up</span><span class="text-[#f79626]">Next</span>
          </span>
          <button onclick="closeDrawer()" aria-label="Close menu" class="oa-press w-8 h-8 rounded-full bg-[#f5f6f8] text-[#535862] flex items-center justify-center cursor-pointer">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Scrollable 3 Groups -->
        <div class="flex-1 overflow-y-auto no-scrollbar py-3 space-y-4">
          <!-- GROUP 01 — DISCOVER -->
          <div class="space-y-1">
            <div class="px-3 text-[11px] text-[#717680]">Discover</div>
            ${group1.map((it) => renderNavItem(it, false)).join('')}
          </div>

          <!-- GROUP 02 — AI CAREER TOOLS (Blue & White Iridescent Fill) -->
          <div class="oa-ai-iridescent rounded-[14px] p-2 space-y-1">
            <div class="px-2 py-1 flex items-center gap-1.5 text-[11px] font-medium text-[#355070]">
              <img src="./bosshire-ai-blob.png" alt="NEX" class="nex-orb w-3.5 h-3.5 rounded-full" />
              <span>AI Career Tools · NEX</span>
            </div>
            ${group2.map((it) => renderNavItem(it, true)).join('')}
          </div>

          <!-- GROUP 03 — MY CAREER -->
          <div class="space-y-1">
            <div class="px-3 text-[11px] text-[#717680]">My career</div>
            ${group3.map((it) => renderNavItem(it, false)).join('')}
          </div>
        </div>

        <!-- Bottom User Profile Section -->
        <button
          onclick="closeDrawerAndNavigate('profile')"
          class="oa-press w-full p-3 rounded-[14px] bg-[#f7f8fa] hover:bg-[#ebf2fa] flex items-center justify-between gap-2.5 text-left shrink-0 cursor-pointer"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-9 h-9 rounded-full bg-[#ebf2fa] text-[#355070] flex items-center justify-center text-[12px] font-medium shrink-0">
              ${workbenchState.userFirstName.slice(0, 2).toUpperCase()}
            </div>
            <div class="min-w-0">
              <div class="text-[13px] font-medium text-[#181d27] truncate">${workbenchState.userFirstName}</div>
              <div class="text-[11px] text-[#717680] truncate">View profile</div>
            </div>
          </div>
          <i data-lucide="chevron-right" class="w-4 h-4 text-[#717680] shrink-0"></i>
        </button>
      </aside>
    </div>
  `;
}

function renderFiltersSheet() {
  if (!workbenchState.dashboardFiltersOpen) return '';
  return `
    <div class="oa-drawer-overlay absolute inset-0 z-40 bg-[#101828]/50 backdrop-blur-[2px] flex items-end justify-center" onclick="closeDashboardFilters()">
      <div class="oa-sheet-up w-full bg-[#fdfdfd] rounded-t-[24px] px-5 pt-3 pb-6 space-y-4 shadow-[0_-16px_48px_-12px_rgba(16,24,40,0.22)]" onclick="event.stopPropagation()">
        <div class="w-10 h-1 rounded-full bg-[#d0d5dd] mx-auto"></div>

        <div class="flex items-center justify-between">
          <h2 class="text-[17px] font-medium text-[#181d27]">Filter opportunities</h2>
          <button onclick="closeDashboardFilters()" aria-label="Close filters" class="oa-press w-8 h-8 rounded-full bg-[#f5f6f8] text-[#535862] flex items-center justify-center cursor-pointer">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <div class="space-y-3">
          <div class="space-y-1.5">
            <div class="text-[12px] text-[#717680]">Location &amp; remote eligibility</div>
            <div class="flex flex-wrap gap-1.5">
              <button onclick="applyFilterPocket('Remote · Indonesia')" class="oa-press h-[32px] px-3.5 rounded-full bg-[#ebf2fa] text-[#355070] text-[12px] cursor-pointer">🇮🇩 Indonesia eligible</button>
              <button onclick="applyFilterPocket('Fully remote')" class="oa-press h-[32px] px-3.5 rounded-full bg-[#f5f6f8] hover:bg-[#ebf2fa] text-[#414651] text-[12px] cursor-pointer">Fully remote</button>
              <button onclick="applyFilterPocket('Hybrid')" class="oa-press h-[32px] px-3.5 rounded-full bg-[#f5f6f8] hover:bg-[#ebf2fa] text-[#414651] text-[12px] cursor-pointer">Hybrid</button>
            </div>
          </div>

          <div class="space-y-1.5">
            <div class="text-[12px] text-[#717680]">Employment type</div>
            <div class="flex flex-wrap gap-1.5">
              <button onclick="applyFilterPocket('Full-time')" class="oa-press h-[32px] px-3.5 rounded-full bg-[#f5f6f8] hover:bg-[#ebf2fa] text-[#414651] text-[12px] cursor-pointer">Full-time</button>
              <button onclick="applyFilterPocket('Contract')" class="oa-press h-[32px] px-3.5 rounded-full bg-[#f5f6f8] hover:bg-[#ebf2fa] text-[#414651] text-[12px] cursor-pointer">Contract</button>
              <button onclick="applyFilterPocket('Part-time')" class="oa-press h-[32px] px-3.5 rounded-full bg-[#f5f6f8] hover:bg-[#ebf2fa] text-[#414651] text-[12px] cursor-pointer">Part-time</button>
              <button onclick="applyFilterPocket('Freelance')" class="oa-press h-[32px] px-3.5 rounded-full bg-[#f5f6f8] hover:bg-[#ebf2fa] text-[#414651] text-[12px] cursor-pointer">Freelance</button>
            </div>
          </div>
        </div>

        <button onclick="closeDashboardFilters()" class="oa-press w-full h-[42px] rounded-full bg-[#44658b] hover:bg-[#355070] text-white text-[13px] cursor-pointer">
          Apply filters
        </button>
      </div>
    </div>
  `;
}

function renderJobDetailSheet() {
  if (!workbenchState.activeJobDetailId) return '';
  const job = sampleJobsCatalog.find((j) => j.id === workbenchState.activeJobDetailId);
  if (!job) return '';
  const isSaved = workbenchState.savedJobIds.includes(job.id);
  const display = getMatchDisplay(job);
  const sheetPay = formatListingPay(job);

  return `
    <div class="oa-drawer-overlay absolute inset-0 z-40 bg-[#101828]/50 backdrop-blur-[2px] flex items-end justify-center" onclick="closeJobDetail(event)">
      <div class="oa-sheet-up w-full bg-[#fdfdfd] rounded-t-[24px] px-5 pt-3 pb-6 space-y-4 shadow-[0_-16px_48px_-12px_rgba(16,24,40,0.22)]" onclick="event.stopPropagation()">
        <div class="w-10 h-1 rounded-full bg-[#d0d5dd] mx-auto"></div>
        <div class="flex items-start justify-between gap-3">
          <div>
            <span class="h-[24px] px-2.5 rounded-full ${display.chipCls} text-[11.5px] inline-flex items-center gap-1 mb-1.5">
              ${renderMatchChipContent(display)}
            </span>
            <h2 class="text-[18px] leading-[24px] font-medium text-[#181d27]">${job.title}</h2>
            <p class="text-[12.5px] text-[#717680] mt-0.5">${job.company} · ${job.arrangement}</p>
          </div>
          <button onclick="closeJobDetail()" aria-label="Close" class="oa-press w-8 h-8 rounded-full bg-[#f5f6f8] text-[#535862] flex items-center justify-center cursor-pointer">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <div class="bg-[#f7f8fa] rounded-[14px] p-3.5 space-y-2 text-[12.5px]">
          <div class="flex items-center justify-between">
            <span class="text-[#717680]">Salary</span>
            <span class="text-[#181d27]">${moneyText(sheetPay ? sheetPay.rangeWithUnit : job.salary)}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[#717680]">Eligibility</span>
            <span class="text-[#181d27]">${job.locationFlag} ${job.location}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[#717680]">Timezone</span>
            <span class="text-[#181d27]">${numText(job.timezone)}</span>
          </div>
        </div>

        <p class="text-[12.5px] leading-[19px] text-[#414651]">${job.summary}</p>

        <div class="flex items-center gap-2 pt-1">
          <button
            onclick="toggleSaveJob('${job.id}')"
            class="oa-press h-[40px] px-4 rounded-full bg-[#f0f1f3] hover:bg-[#e6e8eb] text-[#181d27] text-[13px] cursor-pointer inline-flex items-center gap-1.5"
          >
            <i data-lucide="bookmark" class="w-4 h-4 ${isSaved ? 'fill-[#44658b] text-[#44658b]' : ''}"></i>
            <span>${isSaved ? 'Saved' : 'Save'}</span>
          </button>
          <button
            onclick="openFullJobDetails('${job.id}')"
            class="oa-press flex-1 h-[40px] rounded-full bg-[#44658b] hover:bg-[#355070] text-white text-[13px] cursor-pointer inline-flex items-center justify-center gap-1.5"
          >
            <span>View full job details</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderScreenContent(screen, animatePage = true) {
  switch (screen.id) {
    case 0:
      return renderScreen0(animatePage);
    case 1:
      return renderScreen1(animatePage);
    case 1.5:
      return renderScreen1_5(animatePage);
    case 2:
      return renderScreen2(animatePage);
    case 3:
      return renderScreen3(animatePage);
    case 4:
      return renderScreen4(animatePage);
    case 5:
      return renderScreen5(animatePage);
    case 6:
      return renderScreen6(animatePage);
    case 7:
      return renderScreen7(animatePage);
    case 8:
      return renderScreen8(animatePage);
    default:
      return renderScreen0(animatePage);
  }
}

function renderBottomBar() {
  return '';
}

function renderPhoneFrame(screen, animatePage = true) {
  return `
    <div class="flex flex-col items-center gap-2.5">
      ${
        workbenchState.viewMode === 'canvas'
          ? `<span class="h-[28px] px-3 rounded-full bg-white text-[12px] text-[#535862] inline-flex items-center gap-1.5">
               <span class="w-1.5 h-1.5 rounded-full bg-[#44658b]"></span>
               <span>${numText(screen.stepTag)}</span>
             </span>`
          : ''
      }
      <div class="phone-frame" data-screen-id="${screen.id}">
        ${renderStatusBar(screen)}
        ${renderOnboardingHeader(screen)}
        <main id="screen-main-${screen.id}" class="screen-main flex-1 overflow-y-auto no-scrollbar ${screen.id <= 1 ? 'bg-white' : 'bg-[#f5f6f8]'} flex flex-col">
          ${renderScreenContent(screen, animatePage)}
        </main>
        <div id="job-detail-layer">${workbenchState.viewMode === 'single' ? renderJobDetailSheet() : ''}</div>
        <div id="fit-breakdown-layer">${workbenchState.viewMode === 'single' ? renderFitBreakdownSheet() : ''}</div>
        <div id="filters-sheet-layer">${workbenchState.viewMode === 'single' ? renderFiltersSheet() : ''}</div>
        <div id="drawer-layer">${workbenchState.viewMode === 'single' ? renderNavigationDrawer() : ''}</div>
      </div>
    </div>
  `;
}

function hydrateIcons(rootEl = document) {
  if (window.OA_ICONS_MAP) {
    rootEl.querySelectorAll('[data-lucide]').forEach((el) => {
      const name = el.getAttribute('data-lucide');
      const inner = window.OA_ICONS_MAP[name] || window.OA_ICONS_MAP[(name || '').toLowerCase()];
      if (inner) {
        const cls = el.getAttribute('class') || 'w-4 h-4';
        el.outerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" color="currentColor" class="${cls}" stroke-width="1.5" stroke="currentColor">${inner}</svg>`;
      }
    });
  }
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Smoothly updates active screen content without remounting the outer .phone-frame
function updateActiveScreenDOM(animatePage = false) {
  if (workbenchState.viewMode !== 'single') {
    renderWorkbench(animatePage);
    return;
  }

  const phoneFrame = document.querySelector('#phone-viewport .phone-frame');
  if (!phoneFrame) {
    renderWorkbench(animatePage);
    return;
  }

  const activeScreen =
    screensConfig.find((s) => s.id === workbenchState.activeScreenId) || screensConfig[0];

  // 0. Update status bar background
  const statusEl = phoneFrame.querySelector('#status-bar');
  if (statusEl) {
    statusEl.outerHTML = renderStatusBar(activeScreen);
  }

  // 1. Smoothly update header (keeping progress bar element alive so width transitions over 500ms EASE_OUT)
  const headerEl = phoneFrame.querySelector('#onboarding-header');
  if (headerEl) {
    const progressPct = getOnboardingProgressPct(activeScreen);
    const fillEl = headerEl.querySelector('.oa-progress-fill');
    const prevScreenObj = screensConfig.find((s) => s.id === workbenchState.prevScreenId);

    if (fillEl && animatePage && activeScreen.stepNum) {
      headerEl.outerHTML = renderOnboardingHeader(activeScreen);
      const newFill = phoneFrame.querySelector('.oa-progress-fill');
      const prevPct = getOnboardingProgressPct(prevScreenObj);
      if (newFill && workbenchState.prevScreenId !== activeScreen.id) {
        newFill.style.width = `${prevPct}%`;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            newFill.style.width = `${progressPct}%`;
          });
        });
      }
    } else {
      headerEl.outerHTML = renderOnboardingHeader(activeScreen);
    }
  }

  // 2. Update main screen content
  const mainEl = phoneFrame.querySelector('.screen-main');
  if (mainEl) {
    mainEl.id = `screen-main-${activeScreen.id}`;
    mainEl.className = `screen-main flex-1 overflow-y-auto no-scrollbar ${activeScreen.id <= 1 ? 'bg-white' : 'bg-[#f5f6f8]'} flex flex-col`;
    mainEl.innerHTML = renderScreenContent(activeScreen, animatePage);
    if (animatePage) {
      mainEl.scrollTop = 0;
    }
  }

  // 3. Update job detail, filters sheet & drawer modal layers
  const detailLayer = phoneFrame.querySelector('#job-detail-layer');
  if (detailLayer) {
    detailLayer.innerHTML = renderJobDetailSheet();
  }

  const filtersLayer = phoneFrame.querySelector('#filters-sheet-layer');
  if (filtersLayer) {
    filtersLayer.innerHTML = renderFiltersSheet();
  }

  const drawerLayer = phoneFrame.querySelector('#drawer-layer');
  if (drawerLayer) {
    drawerLayer.innerHTML = renderNavigationDrawer();
  }

  hydrateIcons(phoneFrame);
}

// Specialized in-place update for Screen 5 Salary Dial so the SVG ring glides without remounting
function updateSalaryDialInPlace() {
  const arc = document.getElementById('salary-dial-arc');
  const valEl = document.getElementById('salary-center-val');
  const segEl = document.getElementById('currency-segmented');

  if (!arc || !valEl || !segEl || workbenchState.viewMode !== 'single') {
    updateActiveScreenDOM(false);
    return;
  }

  const currentList = salaryPresets[workbenchState.currency] || salaryPresets.IDR;
  const currentPreset = currentList[workbenchState.salaryStepIndex] || currentList[2];
  const pct = (workbenchState.salaryStepIndex + 1) / currentList.length;
  const radius = 76;
  const circumference = Math.round(2 * Math.PI * radius);
  const dashOffset = Math.round(circumference * (1 - pct));

  arc.setAttribute('stroke-dashoffset', String(dashOffset));

  valEl.classList.remove('oa-fade-val');
  void valEl.offsetWidth;
  valEl.innerHTML = formatPresetInline(currentPreset);
  valEl.classList.add('oa-fade-val');

  const currencies = [
    { id: 'IDR', label: 'IDR (Rp)' },
    { id: 'USD', label: 'USD ($)' },
    { id: 'GBP', label: 'GBP (£)' },
    { id: 'EUR', label: 'EUR (€)' },
  ];
  segEl.innerHTML = currencies
    .map((c) => {
      const active = workbenchState.currency === c.id;
      return `
        <button
          onclick="setSalaryCurrency('${c.id}')"
          class="oa-press flex-1 h-[30px] rounded-full text-[12px] cursor-pointer ${
            active
              ? 'oa-thumb-active text-[#181d27]'
              : 'text-[#717680] hover:text-[#181d27]'
          }"
        >
          ${c.label}
        </button>
      `;
    })
    .join('');
}

function renderWorkbench(animatePage = true) {
  const viewport = document.getElementById('phone-viewport');
  const viewModeBtn = document.getElementById('view-mode-label');

  if (viewModeBtn) {
    viewModeBtn.innerHTML =
      workbenchState.viewMode === 'canvas'
        ? 'Single prototype'
        : 'All <span class="font-mono-ds">10</span> screens';
  }

  if (workbenchState.viewMode === 'single') {
    const activeScreen =
      screensConfig.find((s) => s.id === workbenchState.activeScreenId) || screensConfig[0];
    viewport.className = 'w-full min-h-screen flex items-center justify-center p-6 overflow-auto';
    viewport.innerHTML = renderPhoneFrame(activeScreen, animatePage);
  } else {
    viewport.className =
      'w-full min-h-screen flex items-start justify-start gap-6 p-8 overflow-x-auto overflow-y-auto';
    viewport.innerHTML = screensConfig.map((s) => renderPhoneFrame(s, true)).join('');
  }

  hydrateIcons(viewport);
}

// ── Interactive Handlers ──
window.setExperienceLevel = function (level) {
  workbenchState.experienceLevel = level;
  workbenchState.experienceFromCv = false;
  updateActiveScreenDOM(false);
};

window.editCvExperience = function () {
  workbenchState.experienceEditing = true;
  updateActiveScreenDOM(false);
};

window.openRoleDropdown = function () {
  workbenchState.roleDropdownOpen = true;
  const dd = document.getElementById('role-search-dropdown');
  if (dd) dd.innerHTML = renderRoleDropdownHTML();
};

window.openRoleDropdownAndFocus = function () {
  const input = document.getElementById('role-search-input');
  if (input) {
    input.focus();
  }
  window.openRoleDropdown();
};

window.closeRoleDropdownDelayed = function () {
  setTimeout(() => {
    workbenchState.roleDropdownOpen = false;
    const dd = document.getElementById('role-search-dropdown');
    if (dd) dd.innerHTML = '';
  }, 150);
};

window.handleRoleSearchInput = function (val) {
  workbenchState.roleSearchQuery = val;
  workbenchState.roleDropdownOpen = true;
  const dd = document.getElementById('role-search-dropdown');
  if (dd) dd.innerHTML = renderRoleDropdownHTML();
};

window.selectRoleFromSearch = function (roleName) {
  if (!workbenchState.selectedRoles.includes(roleName) && workbenchState.selectedRoles.length < 3) {
    workbenchState.selectedRoles.push(roleName);
    workbenchState.lastChangedRole = roleName;
  }
  workbenchState.roleSearchQuery = '';
  workbenchState.roleDropdownOpen = false;
  updateActiveScreenDOM(false);
};

window.toggleRoleSelection = function (roleName) {
  const idx = workbenchState.selectedRoles.indexOf(roleName);
  if (idx > -1) {
    workbenchState.selectedRoles.splice(idx, 1);
    workbenchState.lastChangedRole = null;
  } else if (workbenchState.selectedRoles.length < 3) {
    workbenchState.selectedRoles.push(roleName);
    workbenchState.lastChangedRole = roleName;
  }
  updateActiveScreenDOM(false);
};

window.setRoleCategory = function (cat) {
  workbenchState.activeRoleCategory = cat;
  workbenchState.lastChangedRole = null;
  updateActiveScreenDOM(false);
};

window.toggleCityDropdown = function () {
  workbenchState.cityDropdownOpen = !workbenchState.cityDropdownOpen;
  updateActiveScreenDOM(false);
};

window.selectCity = function (cityName, tz) {
  workbenchState.timezoneChangedFrom = tz !== workbenchState.timezone ? workbenchState.timezone : null;
  workbenchState.city = cityName;
  workbenchState.timezone = tz;
  workbenchState.cityDropdownOpen = false;
  updateActiveScreenDOM(false);
};

window.toggleWorkArrangement = function (arrId) {
  if (arrId === 'open_all') {
    workbenchState.workArrangements = workbenchState.workArrangements.includes('open_all') ? [] : ['open_all'];
  } else {
    workbenchState.workArrangements = workbenchState.workArrangements.filter((id) => id !== 'open_all');
    const idx = workbenchState.workArrangements.indexOf(arrId);
    if (idx > -1) {
      workbenchState.workArrangements.splice(idx, 1);
    } else {
      workbenchState.workArrangements.push(arrId);
    }
  }
  updateActiveScreenDOM(false);
};

window.setWorkHoursPreset = function (id) {
  const preset = workHoursPresets.find((p) => p.id === id);
  if (preset) workbenchState.workHours = { start: preset.start, end: preset.end };
  updateActiveScreenDOM(false);
};

// Paints the track, steppers and summary in place while dragging (a full re-render would drop the pointer)
function paintWorkHours(card) {
  const { start, end } = workbenchState.workHours;
  const pct = (h) => `${(h / 24) * 100}%`;
  const segment = card.querySelector('[data-hours-segment]');
  segment.style.left = pct(start);
  segment.style.width = pct(end - start);
  ['start', 'end'].forEach((edge) => {
    const value = edge === 'start' ? start : end;
    const handle = card.querySelector(`[data-hours-handle="${edge}"]`);
    handle.style.left = pct(value);
    handle.setAttribute('aria-valuenow', value);
    card.querySelector(`[data-hours-value="${edge}"]`).textContent = formatWibHour(value);
  });
  card.querySelector('[data-hours-summary]').innerHTML = renderWorkHoursSummary(workbenchState.workHours, workbenchState.timezone);
}

window.startWorkHoursDrag = function (event, edge) {
  const track = event.currentTarget.closest('[data-hours-track]');
  const card = event.currentTarget.closest('[data-hours-card]');
  if (!track || !card) return;
  event.preventDefault();
  event.currentTarget.focus();
  const rect = track.getBoundingClientRect();
  const move = (e) => {
    const hour = Math.round(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)) * 24);
    let { start, end } = workbenchState.workHours;
    if (edge === 'start') start = Math.min(hour, end - 1);
    else end = Math.max(hour, start + 1);
    workbenchState.workHours = { start, end };
    paintWorkHours(card);
  };
  const up = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    updateActiveScreenDOM(false);
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  move(event);
};

window.handleWorkHoursKey = function (event, edge) {
  const delta = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[event.key];
  if (!delta) return;
  event.preventDefault();
  stepWorkHours(edge, delta);
  const handle = document.querySelector(`[data-hours-handle="${edge}"]`);
  if (handle) handle.focus();
};

// Moves one edge of the window by an hour, keeping at least one hour between From and Until
window.stepWorkHours = function (edge, delta) {
  let { start, end } = workbenchState.workHours || { start: 9, end: 17 };
  if (edge === 'start') start = Math.min(Math.max(0, start + delta), end - 1);
  else end = Math.max(Math.min(24, end + delta), start + 1);
  workbenchState.workHours = { start, end };
  updateActiveScreenDOM(false);
};

window.toggleEmploymentType = function (type) {
  if (type === 'Open to all') {
    workbenchState.employmentTypes = workbenchState.employmentTypes.includes('Open to all') ? [] : ['Open to all'];
  } else {
    workbenchState.employmentTypes = workbenchState.employmentTypes.filter((t) => t !== 'Open to all');
    const idx = workbenchState.employmentTypes.indexOf(type);
    if (idx > -1) {
      workbenchState.employmentTypes.splice(idx, 1);
    } else {
      workbenchState.employmentTypes.push(type);
    }
  }
  updateActiveScreenDOM(false);
};

window.toggleCountry = function (code) {
  const idx = workbenchState.selectedCountries.indexOf(code);
  if (idx > -1) {
    if (workbenchState.selectedCountries.length > 1) {
      workbenchState.selectedCountries.splice(idx, 1);
    }
  } else {
    workbenchState.selectedCountries.push(code);
  }
  updateActiveScreenDOM(false);
};

window.toggleExtraCountries = function () {
  workbenchState.extraCountriesShown = !workbenchState.extraCountriesShown;
  updateActiveScreenDOM(false);
};

window.setLiveLocation = function (loc) {
  workbenchState.liveLocation = loc;
  updateActiveScreenDOM(false);
};

window.setSalaryCurrency = function (curr) {
  workbenchState.currency = curr;
  if (workbenchState.activeScreenId === 4 && workbenchState.viewMode === 'single') {
    updateActiveScreenDOM(false);
  } else {
    updateSalaryDialInPlace();
  }
};

function formatSalaryDigits(digits) {
  return digits ? Number(digits).toLocaleString('en-US') : '';
}

// Stores the digits for scoring and redraws the field with thousands separators, keeping the caret in place
function applySalaryInput(input, stateKey) {
  const digits = input.value.replace(/[^\d]/g, '').slice(0, 12);
  const caretFromEnd = input.value.length - (input.selectionEnd ?? input.value.length);
  workbenchState[stateKey] = digits;
  const formatted = formatSalaryDigits(digits);
  input.value = formatted;
  const caret = Math.max(0, formatted.length - caretFromEnd);
  input.setSelectionRange(caret, caret);
}

window.updateMinSalaryInput = function (input) {
  applySalaryInput(input, 'minSalaryInput');
  syncOnboardingContinue(Number(workbenchState.minSalaryInput) > 0);
};

window.updateIdealSalaryInput = function (input) {
  applySalaryInput(input, 'idealSalaryInput');
};

window.stepSalary = function (delta) {
  const list = salaryPresets[workbenchState.currency] || salaryPresets.IDR;
  const next = workbenchState.salaryStepIndex + delta;
  if (next >= 0 && next < list.length) {
    workbenchState.salaryStepIndex = next;
  } else if (delta > 0) {
    workbenchState.salaryStepIndex = 0;
  }
  updateSalaryDialInPlace();
};

window.setSearchStatus = function (statusId) {
  workbenchState.searchStatus = statusId;
  updateActiveScreenDOM(false);
};

window.validateSalaryAndContinue = function () {
  const minVal = parseFloat((workbenchState.minSalaryInput || '').replace(/[^\d.]/g, ''));
  const idealVal = parseFloat((workbenchState.idealSalaryInput || '').replace(/[^\d.]/g, ''));
  if (!isNaN(minVal) && !isNaN(idealVal) && idealVal < minVal) {
    workbenchState.salaryError = 'Preferred salary cannot be lower than your minimum salary.';
    updateActiveScreenDOM(false);
    return;
  }
  workbenchState.salaryError = '';
  setScreen(5);
};

window.toggleCareerPriority = function (priority) {
  const idx = workbenchState.careerPriorities.indexOf(priority);
  if (idx > -1) {
    workbenchState.careerPriorities.splice(idx, 1);
  } else if (workbenchState.careerPriorities.length < 3) {
    workbenchState.careerPriorities.push(priority);
  }
  updateActiveScreenDOM(false);
};

window.setAvailability = function (avail) {
  workbenchState.availability = avail;
  updateActiveScreenDOM(false);
};

window.toggleSaveJob = function (jobId, e) {
  if (e && e.stopPropagation) e.stopPropagation();
  const idx = workbenchState.savedJobIds.indexOf(jobId);
  if (idx > -1) {
    workbenchState.savedJobIds.splice(idx, 1);
  } else {
    workbenchState.savedJobIds.push(jobId);
  }
  updateActiveScreenDOM(false);
};

window.openJobDetail = function (jobId) {
  workbenchState.activeJobDetailId = jobId;
  const detailLayer = document.getElementById('job-detail-layer');
  if (detailLayer) {
    detailLayer.innerHTML = renderJobDetailSheet();
    hydrateIcons(detailLayer);
  }
};

window.closeJobDetail = function () {
  workbenchState.activeJobDetailId = null;
  const detailLayer = document.getElementById('job-detail-layer');
  if (detailLayer) {
    detailLayer.innerHTML = '';
  }
};

window.openDrawer = function () {
  workbenchState.drawerOpen = true;
  const layer = document.getElementById('drawer-layer');
  if (layer) {
    layer.innerHTML = renderNavigationDrawer();
    hydrateIcons(layer);
  }
};

window.closeDrawer = function () {
  workbenchState.drawerOpen = false;
  const layer = document.getElementById('drawer-layer');
  if (layer) {
    layer.innerHTML = '';
  }
};

window.navigateDashboardRoute = function (route) {
  workbenchState.dashboardRoute = route;
  workbenchState.activeScreenId = 8;
  updateActiveScreenDOM(true);
};

window.closeDrawerAndNavigate = function (route) {
  workbenchState.drawerOpen = false;
  workbenchState.dashboardRoute = route;
  if (workbenchState.activeScreenId === 8 && workbenchState.viewMode === 'single') {
    updateActiveScreenDOM(true);
  } else {
    setScreen(8);
  }
};

window.closeDrawerAndGoScreen = function (screenId) {
  workbenchState.drawerOpen = false;
  setScreen(screenId);
};

window.toggleDashboardFilters = function () {
  workbenchState.dashboardFiltersOpen = !workbenchState.dashboardFiltersOpen;
  const layer = document.getElementById('filters-sheet-layer');
  if (layer) {
    layer.innerHTML = renderFiltersSheet();
    hydrateIcons(layer);
  }
};

window.closeDashboardFilters = function () {
  workbenchState.dashboardFiltersOpen = false;
  const layer = document.getElementById('filters-sheet-layer');
  if (layer) {
    layer.innerHTML = '';
  }
};

window.applyFilterPocket = function (cat) {
  workbenchState.dashboardFiltersOpen = false;
  selectCategoryAndExplore(cat);
};

window.selectCategoryAndExplore = function (cat) {
  workbenchState.activeCategoryFilter = cat;
  workbenchState.dashboardRoute = 'explore';
  updateActiveScreenDOM(true);
};

window.clearCategoryFilter = function () {
  workbenchState.activeCategoryFilter = '';
  updateActiveScreenDOM(false);
};

window.goToHomepage = function () {
  workbenchState.dashboardRoute = 'home';
  workbenchState.drawerOpen = false;
  setScreen(8);
};

window.handleDashboardSearch = function (val) {
  workbenchState.dashboardSearchQuery = val;
  updateActiveScreenDOM(false);
  const input = document.getElementById('dashboard-search-input');
  if (input) {
    input.focus();
    const len = val.length;
    input.setSelectionRange(len, len);
  }
};

function updateProcessingStepsInPlace() {
  const stepsEl = document.getElementById('processing-steps-list');
  const headerBlockEl = document.getElementById('processing-header-block');
  const footerBlockEl = document.getElementById('processing-footer-block');
  if (!stepsEl || !headerBlockEl || !footerBlockEl) return;

  const step = workbenchState.processingStep;
  const isReady = step >= 4;
  const pct = Math.min(100, Math.round((step / 4) * 100));

  stepsEl.innerHTML = renderProcessingStepsHTML(step);

  if (isReady) {
    headerBlockEl.innerHTML = `
      <div class="oa-fade-val space-y-1.5">
        <span class="h-[26px] px-3 rounded-full bg-[#ecfdf3] text-[#027a48] text-[11.5px] inline-flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-[#039855]"></span>
          <span>Profile ready</span>
        </span>
        <h1 class="text-[20px] leading-[26px] font-medium text-[#181d27]">
          Your career profile is ready!
        </h1>
        <p class="text-[12.5px] leading-[18px] text-[#535862] px-2">
          I've found opportunities worth exploring. Let's take a look at what's next.
        </p>
      </div>
    `;
    footerBlockEl.innerHTML = `
      <div class="w-full oa-reveal space-y-2">
        <button
          onclick="setScreen(7)"
          class="oa-press w-full h-[42px] rounded-full bg-[#44658b] hover:bg-[#355070] text-white text-[13px] cursor-pointer inline-flex items-center justify-center gap-2"
        >
          <span>Explore opportunities</span>
          <i data-lucide="arrow-right" class="w-4 h-4"></i>
        </button>
      </div>
    `;
  } else {
    footerBlockEl.innerHTML = `
      <div class="space-y-2">
        <div class="w-full h-[6px] rounded-full bg-[#e4e6ea] overflow-hidden">
          <div class="oa-progress-fill h-full rounded-full bg-[#44658b]" style="width: ${Math.max(18, pct)}%"></div>
        </div>
        <div class="text-center text-[11.5px] text-[#717680]">
          Matching profile · <span class="font-mono-ds text-[#181d27]">${pct}</span>%
        </div>
      </div>
    `;
  }

  hydrateIcons(stepsEl.parentElement);
}

function startProcessingSequence() {
  if (workbenchState.processingTimer) {
    clearInterval(workbenchState.processingTimer);
    workbenchState.processingTimer = null;
  }
  workbenchState.processingStep = 0;
  workbenchState.processingTimer = setInterval(() => {
    if (workbenchState.activeScreenId !== 6 || workbenchState.viewMode !== 'single') {
      clearInterval(workbenchState.processingTimer);
      workbenchState.processingTimer = null;
      return;
    }
    workbenchState.processingStep += 1;
    updateProcessingStepsInPlace();
    if (workbenchState.processingStep >= 4) {
      clearInterval(workbenchState.processingTimer);
      workbenchState.processingTimer = null;
    }
  }, 600);
}

window.setScreen = function (id) {
  if (id === workbenchState.activeScreenId && workbenchState.viewMode === 'single') return;
  if (workbenchState.processingTimer) {
    clearInterval(workbenchState.processingTimer);
    workbenchState.processingTimer = null;
  }
  workbenchState.prevScreenId = workbenchState.activeScreenId;
  workbenchState.navDirection = id < workbenchState.activeScreenId ? 'back' : 'forward';
  workbenchState.activeScreenId = id;
  workbenchState.lastChangedRole = null;
  workbenchState.activeJobDetailId = null;
  if (id === 6) {
    workbenchState.processingStep = 0;
  }

  if (workbenchState.viewMode !== 'single') {
    workbenchState.viewMode = 'single';
    renderWorkbench(true);
  } else {
    updateActiveScreenDOM(true);
  }

  if (id === 6) {
    startProcessingSequence();
  }
};

window.toggleViewMode = function () {
  workbenchState.viewMode = workbenchState.viewMode === 'canvas' ? 'single' : 'canvas';
  renderWorkbench(true);
};

window.openFullJobDetails = function (jobId) {
  workbenchState.activeJobDetailId = null;
  if (workbenchState.activeScreenId !== 8) {
    workbenchState.previousScreenBeforeJobDetails = workbenchState.activeScreenId;
    workbenchState.previousDashboardRoute = 'home';
  } else if (workbenchState.dashboardRoute !== 'job_details') {
    workbenchState.previousScreenBeforeJobDetails = 8;
    workbenchState.previousDashboardRoute = workbenchState.dashboardRoute || 'home';
  }
  workbenchState.selectedJobId = jobId;
  workbenchState.jobDetailsTab = 'overview';
  workbenchState.fitBreakdownSheetOpen = false;
  workbenchState.dashboardRoute = 'job_details';
  workbenchState.activeScreenId = 8;
  if (workbenchState.viewMode !== 'single') {
    workbenchState.viewMode = 'single';
    renderWorkbench(true);
  } else {
    updateActiveScreenDOM(true);
  }
};

window.setJobDetailsTab = function (tab) {
  workbenchState.jobDetailsTab = tab;
  const job = sampleJobsCatalog.find((j) => j.id === workbenchState.selectedJobId) || sampleJobsCatalog[0];
  const fit = computeAiJobFit(job, workbenchState);
  const contentEl = document.getElementById('job-details-tab-content');
  const tabsEl = document.getElementById('job-details-tabs');
  if (contentEl && tabsEl) {
    const tabs = [
      { id: 'overview', label: 'Overview' },
      { id: 'description', label: 'Job Description' },
      { id: 'company', label: 'Company' },
    ];
    tabsEl.innerHTML = `
      <div class="bg-white rounded-full p-1 grid grid-cols-3 gap-1">
        ${tabs
          .map(
            (t) => `
          <button
            onclick="setJobDetailsTab('${t.id}')"
            class="oa-press h-[32px] rounded-full text-[12px] font-medium cursor-pointer transition-colors ${
              tab === t.id ? 'bg-[#44658b] text-white' : 'text-[#535862] hover:text-[#181d27]'
            }"
          >${t.label}</button>
        `
          )
          .join('')}
      </div>
    `;
    contentEl.innerHTML = renderJobDetailsTabContent(job, fit, false);
    hydrateIcons(contentEl);
  } else {
    updateActiveScreenDOM(false);
  }
};

window.updateFitStripDots = function (strip) {
  const card = strip.firstElementChild;
  if (!card) return;
  const step = card.getBoundingClientRect().width + 8;
  const active = Math.round(strip.scrollLeft / step);
  document.querySelectorAll('[data-fit-dot]').forEach((dot) => {
    const on = Number(dot.dataset.fitDot) === active;
    dot.setAttribute('aria-selected', String(on));
    dot.classList.toggle('w-4', on);
    dot.classList.toggle('w-1.5', !on);
  });
};

window.scrollFitStripTo = function (idx) {
  const strip = document.getElementById('fit-strip');
  const card = strip && strip.children[idx];
  if (card) strip.scrollTo({ left: card.offsetLeft - strip.firstElementChild.offsetLeft, behavior: 'smooth' });
};

window.openFitBreakdownSheet = function () {
  workbenchState.fitBreakdownSheetOpen = true;
  const layer = document.getElementById('fit-breakdown-layer');
  if (layer) {
    layer.innerHTML = renderFitBreakdownSheet();
    hydrateIcons(layer);
  }
};

window.closeFitBreakdownSheet = function () {
  workbenchState.fitBreakdownSheetOpen = false;
  const layer = document.getElementById('fit-breakdown-layer');
  if (layer) {
    layer.innerHTML = '';
  }
};

window.openRealityCheck = function (jobId) {
  workbenchState.activeJobDetailId = null;
  workbenchState.realityCheckReturn =
    workbenchState.activeScreenId !== 8
      ? { screen: workbenchState.activeScreenId }
      : { screen: 8, route: workbenchState.dashboardRoute || 'home' };
  workbenchState.selectedJobId = jobId;
  workbenchState.recruiterDraftOpen = false;
  workbenchState.recruiterDraftCopied = false;
  workbenchState.fitBreakdownSheetOpen = false;
  workbenchState.dashboardRoute = 'reality_check';
  workbenchState.activeScreenId = 8;
  if (workbenchState.viewMode !== 'single') {
    workbenchState.viewMode = 'single';
    renderWorkbench(true);
  } else {
    updateActiveScreenDOM(true);
  }
};

window.goBackFromRealityCheck = function () {
  const back = workbenchState.realityCheckReturn || { screen: 8, route: 'home' };
  if (back.screen !== 8) {
    setScreen(back.screen);
    return;
  }
  navigateDashboardRoute(back.route === 'reality_check' ? 'home' : back.route);
};

window.askRecruiterAbout = function (jobId) {
  openRealityCheck(jobId);
  workbenchState.recruiterDraftOpen = true;
  updateActiveScreenDOM(false);
};

window.toggleRecruiterDraft = function () {
  workbenchState.recruiterDraftOpen = !workbenchState.recruiterDraftOpen;
  workbenchState.recruiterDraftCopied = false;
  updateActiveScreenDOM(false);
};

window.copyRecruiterDraft = function () {
  const job = sampleJobsCatalog.find((j) => j.id === workbenchState.selectedJobId) || sampleJobsCatalog[0];
  const draft = buildRecruiterDraft(job, getRealityCheck(job, workbenchState).missing, workbenchState);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(draft).catch(() => {});
  }
  workbenchState.recruiterDraftCopied = true;
  updateActiveScreenDOM(false);
};

window.goBackFromJobDetails = function () {
  if (workbenchState.previousScreenBeforeJobDetails && workbenchState.previousScreenBeforeJobDetails !== 8) {
    setScreen(workbenchState.previousScreenBeforeJobDetails);
    return;
  }
  navigateDashboardRoute(workbenchState.previousDashboardRoute || 'home');
};

window.shareJob = function (jobId) {
  const job = sampleJobsCatalog.find((j) => j.id === jobId);
  if (job && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(job.shareUrl || window.location.href).catch(() => {});
  }
  workbenchState.jobShareCopiedId = jobId;
  updateActiveScreenDOM(false);
  setTimeout(() => {
    if (workbenchState.jobShareCopiedId === jobId) {
      workbenchState.jobShareCopiedId = null;
      updateActiveScreenDOM(false);
    }
  }, 1800);
};

/**
 * Returns a single compact status chip ('Applied' or 'Saved') for job picker cards.
 */
window.renderJobStatusChip = function (jobId) {
  const isApplied = workbenchState.appliedJobTracker?.[jobId] === 'submitted';
  if (isApplied) {
    return '<span class="h-[18px] px-1.5 rounded-full bg-[#ecfdf3] text-[#027a48] text-[10px] font-medium inline-flex items-center shrink-0">Applied</span>';
  }
  const isSaved = workbenchState.savedJobIds?.includes(jobId);
  if (isSaved) {
    return '<span class="h-[18px] px-1.5 rounded-full bg-white text-[#44658b] text-[10px] font-medium inline-flex items-center shrink-0">Saved</span>';
  }
  return '';
};

function escapeUrlText(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Builds a structured Digital Banking UI/UX Design Intern JD object for any pasted job URL.
 */
window.buildFetchedJobFromUrl = function (rawUrl) {
  const trimmed = String(rawUrl || '').trim();
  const normalizedUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let hostLabel = 'job posting';
  try {
    hostLabel = new URL(normalizedUrl).hostname.replace(/^www\./, '');
  } catch (e) {}
  return {
    id: 'url-fetched-jd',
    title: 'UI/UX Design Intern',
    company: 'Digital Banking Product',
    arrangement: 'Hybrid / Remote',
    type: 'Internship',
    location: 'Indonesia',
    sourceHost: hostLabel,
    sourceUrl: normalizedUrl,
    companyInfo: { industry: 'Digital Banking', overview: '' },
    roleDetails: {
      experienceYears: { label: 'Intern / Fresh graduate' },
      requiredSkills: ['Figma', 'UI/UX Design', 'Wireframing'],
    },
    compensation: { overlapLabel: 'WIB business hours' },
    jdContent: {
      responsibilities: [
        'Membantu tim Research & Design dalam merancang tampilan dan pengalaman pengguna untuk produk digital perbankan.',
        'Melakukan riset dan survei sederhana untuk memahami kebutuhan dan preferensi pengguna.',
        'Menyusun ide dan flow user journey bersama tim terkait.',
        'Membuat wireframe dan desain low-fidelity untuk pengembangan awal produk.',
        'Mendesain tampilan aplikasi (UI/UX) yang menarik dan fungsional, termasuk aset visual untuk developer.',
      ],
      requirements: [
        'Mahasiswa aktif semester akhir / fresh graduate dari jurusan Desain Komunikasi Visual, Informatika, Sistem Informasi, atau bidang terkait.',
        'Memiliki portofolio desain UI/UX (proyek kampus, pribadi, atau freelance).',
        'Menguasai tools desain seperti Figma, Adobe XD, atau Sketch.',
        'Memahami prinsip dasar desain UI/UX dan user-centered design.',
        'Kreatif, detail-oriented, dan memiliki sense visual yang baik.',
        'Mampu bekerja dalam tim dan terbuka terhadap feedback.',
      ],
    },
    applicationMethod: { type: 'company_site', label: 'Apply via job posting link', url: normalizedUrl },
  };
};

/**
 * Triggers simulated async URL loading and then hydrates the fetched JD into state.
 */
window.startSharedUrlCheck = function (stateObj, refreshFn) {
  const raw = String(stateObj.pastedJobUrl || '').trim();
  if (!raw || !raw.includes('.')) {
    stateObj.urlParseError = 'Please enter a valid job URL first.';
    stateObj.urlFetchStatus = 'idle';
    refreshFn();
    return;
  }
  if (stateObj.urlTimer) {
    clearTimeout(stateObj.urlTimer);
    stateObj.urlTimer = null;
  }
  stateObj.urlParseError = '';
  stateObj.urlFetchStatus = 'loading';
  refreshFn();
  stateObj.urlTimer = setTimeout(() => {
    stateObj.urlTimer = null;
    stateObj.urlParsedJob = buildFetchedJobFromUrl(stateObj.pastedJobUrl);
    stateObj.urlFetchStatus = 'loaded';
    refreshFn();
  }, 1050);
};

/**
 * Renders the shared Job URL input + loading skeleton + fetched "About the job" JD preview.
 */
window.renderJobUrlTabHtml = function (stateVarName, checkHandlerName, s) {
  const rawVal = escapeUrlText(s.pastedJobUrl || '');
  const jd = s.urlParsedJob?.jdContent;
  let hostPreview = 'job link';
  try {
    const t = String(s.pastedJobUrl || '').trim();
    if (t) hostPreview = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`).hostname.replace(/^www\./, '');
  } catch (e) {}

  return `
    <div class="space-y-2.5">
      <div class="flex gap-2">
        <input
          type="url"
          value="${rawVal}"
          placeholder="https://www.linkedin.com/jobs/view/..."
          oninput="${stateVarName}.pastedJobUrl = this.value; ${stateVarName}.urlParseError = '';"
          onkeydown="if(event.key==='Enter'){event.preventDefault();${checkHandlerName}();}"
          class="flex-1 h-[38px] px-3 rounded-full bg-[#f5f6f8] text-[12px] text-[#181d27] focus:outline-none focus:ring-2 focus:ring-[#44658b]/25"
        />
        <button
          onclick="${checkHandlerName}()"
          class="oa-press h-[38px] px-3.5 rounded-full bg-[#ebf2fa] hover:bg-[#d4e4f7] text-[#355070] text-[12px] font-medium cursor-pointer shrink-0"
        >
          ${s.urlFetchStatus === 'loading' ? 'Loading…' : 'Check URL'}
        </button>
      </div>
      ${
        s.urlParseError
          ? `<div class="bg-[#fffaeb] rounded-[12px] p-2.5 text-[11.5px] text-[#b54708]">${s.urlParseError}</div>`
          : s.urlFetchStatus === 'loading'
            ? `<div class="bg-[#f7f8fa] rounded-[14px] p-3.5 space-y-2.5">
                 <div class="flex items-center gap-2 text-[12px] text-[#355070] font-medium">
                   <span class="w-3.5 h-3.5 rounded-full border-2 border-[#44658b] border-t-transparent animate-spin shrink-0"></span>
                   <span>Loading job description from ${escapeUrlText(hostPreview)}…</span>
                 </div>
                 <div class="space-y-1.5 pt-0.5">
                   <div class="h-2.5 w-2/5 rounded-full bg-[#e4e6ea] animate-pulse"></div>
                   <div class="h-2.5 w-full rounded-full bg-[#e4e6ea] animate-pulse"></div>
                   <div class="h-2.5 w-11/12 rounded-full bg-[#e4e6ea] animate-pulse"></div>
                   <div class="h-2.5 w-4/5 rounded-full bg-[#e4e6ea] animate-pulse"></div>
                 </div>
               </div>`
            : s.urlFetchStatus === 'loaded' && jd
              ? `<div class="bg-[#f7f8fa] rounded-[14px] p-3.5 space-y-2.5">
                   <div class="pb-2 border-b border-[#e4e6ea]">
                     <div class="flex items-center justify-between gap-2">
                       <span class="text-[12.5px] font-medium text-[#181d27]">About the job</span>
                       <span class="h-[20px] px-2 rounded-full bg-[#ecfdf3] text-[#027a48] text-[10px] font-medium inline-flex items-center shrink-0">Loaded · ${escapeUrlText(s.urlParsedJob.sourceHost)}</span>
                     </div>
                     <div class="text-[11px] text-[#44658b] font-medium mt-0.5">${escapeUrlText(s.urlParsedJob.title)} · ${escapeUrlText(s.urlParsedJob.company)}</div>
                   </div>
                   <div class="max-h-[260px] overflow-y-auto no-scrollbar space-y-2.5 pr-1 text-[11.5px] leading-[17px] text-[#414651]">
                     <div>
                       <div class="font-medium text-[#181d27] mb-1">Responsibilities</div>
                       <ul class="list-disc pl-4 space-y-1">
                         ${jd.responsibilities.map((item) => `<li>${item}</li>`).join('')}
                       </ul>
                     </div>
                     <div>
                       <div class="font-medium text-[#181d27] mb-1">Requirements</div>
                       <ul class="list-disc pl-4 space-y-1">
                         ${jd.requirements.map((item) => `<li>${item}</li>`).join('')}
                       </ul>
                     </div>
                   </div>
                 </div>`
              : `<p class="text-[11px] text-[#717680]">Paste a job link and tap Check URL to load the job description.</p>`
      }
    </div>
  `;
};

window.handleOnboardingCvUpload = function (input) {
  const file = input && input.files && input.files[0];
  workbenchState.uploadedCvName = file ? file.name : `${workbenchState.userFirstName}_CV.pdf`;
  // Roles are only suggested from the CV, never selected: the CV says what you did, not what you want next
  workbenchState.cvExtract = {
    experienceLevel: '3_5',
    experienceText: '4 years of experience',
    roles: ['Product Designer', 'UI/UX Designer', 'Design Systems Lead'],
    // A design-systems CV with no research or engineering work, so some listings come back partial
    skills: ['Figma', 'Product Design', 'Design Systems', 'Prototyping', 'Mobile UI', 'Visual Design', 'Responsive Web', 'Usability Testing'],
  };
  workbenchState.experienceEditing = false;
  if (!workbenchState.experienceLevel) {
    workbenchState.experienceLevel = workbenchState.cvExtract.experienceLevel;
    workbenchState.experienceFromCv = true;
  }
  updateActiveScreenDOM(false);
};

window.removeOnboardingCv = function () {
  workbenchState.uploadedCvName = '';
  workbenchState.cvExtract = null;
  workbenchState.experienceEditing = false;
  if (workbenchState.experienceFromCv) {
    workbenchState.experienceLevel = '';
    workbenchState.experienceFromCv = false;
  }
  updateActiveScreenDOM(false);
};

window.toggleOnboardingLinkedin = function () {
  workbenchState.linkedinConnected = !workbenchState.linkedinConnected;
  updateActiveScreenDOM(false);
};

document.addEventListener('DOMContentLoaded', () => {
  renderWorkbench(true);
  if (workbenchState.activeScreenId === 6 && workbenchState.viewMode === 'single') {
    startProcessingSequence();
  }
});
