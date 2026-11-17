// UpNext — AI Cover Letter Generator (NEX) Module
// Strict Option A Design System · Document-First Interactive Workspace

const coverLetterState = {
  step: 'landing', // 'landing' | 'select' | 'customize' | 'generating' | 'editor' | 'continue_apply'
  jobSource: 'upnext', // 'upnext' | 'paste' | 'url'
  selectedJobId: 'job-1',
  pastedJobText: '',
  pastedJobUrl: '',
  urlParseError: '',
  urlFetchStatus: 'idle', // 'idle' | 'loading' | 'loaded'
  urlParsedJob: null,
  urlTimer: null,
  customJob: null,

  selectedCvId: 'cv-1',
  cvVersions: [
    {
      id: 'cv-1',
      name: 'Vinna_Product_Designer_CV.pdf',
      updated: '2 days ago',
      summary: '3–5 yrs Product Design · Figma & Design Systems · Remote async teams',
    },
    {
      id: 'cv-2',
      name: 'Vinna_Mobile_UIUX_Resume.pdf',
      updated: '2 weeks ago',
      summary: 'Mobile iOS/Android UI · Prototyping · Usability testing',
    },
  ],

  // Step 2: Customization
  tone: 'Professional', // 'Professional' | 'Confident' | 'Warm & Personable'
  length: 'Standard', // 'Concise' | 'Standard' | 'Detailed'
  additionalContext: '',
  clarificationInput: '',
  needsClarification: false,

  // Step 3: Generation progress
  genStep: 0,
  genTimer: null,

  // Step 4: Document Editor
  activeDocId: 'doc-1',
  docTitle: 'Product Designer — Karya Cloud',
  docDate: 'November 17, 2026',
  recipientLine: 'Hiring Team · Karya Cloud',
  greetingLine: 'Dear Hiring Team,',
  sections: {
    opening: '',
    experience: '',
    skillsFit: '',
    closing: '',
  },
  signOff: 'Best regards,\nVinna',
  activeSectionKey: 'opening',
  selectedSnippet: '',
  history: [],
  historyIdx: -1,
  autosaveLabel: 'Autosaved',
  lastEditedAt: 'Just now',
  copiedNotice: false,
  exportedNotice: false,
  exportNotice: '',

  // Bottom-sheet pockets (NEX revision review, Save/Export & Employer handoff)
  revisionSheet: null, // { sectionKey, actionLabel, originalText, suggestedText }
  exportSheetOpen: false,
  applyHandoffOpen: false,

  // Library of saved cover letters
  library: [
    {
      id: 'doc-sample-1',
      jobId: 'job-1',
      title: 'Product Designer — Karya Cloud (Draft)',
      jobTitle: 'Product Designer',
      company: 'Karya Cloud (Sample)',
      tone: 'Professional',
      length: 'Standard',
      lastEdited: 'Yesterday',
      sections: {
        opening:
          'I am writing to apply for the Product Designer role at Karya Cloud. With 3–5 years of experience designing SaaS and mobile collaboration workflows, I thrive in async-first remote teams.',
        experience:
          'In my recent product design work, I led end-to-end user flows from early discovery through component handoff in Figma, partnering closely with distributed engineering squads.',
        skillsFit:
          'My strengths in Product Design, Figma design systems, and lightweight remote usability testing align directly with your focus on tools for APAC and Europe teams.',
        closing:
          'Based in Jakarta (GMT+7), I am well-aligned with your 3-hour afternoon WIB overlap and look forward to contributing to Karya Cloud.',
      },
    },
  ],
};

function getClActiveJob() {
  if (coverLetterState.jobSource === 'paste' && coverLetterState.customJob) {
    return coverLetterState.customJob;
  }
  if (coverLetterState.jobSource === 'url' && coverLetterState.urlParsedJob) {
    return coverLetterState.urlParsedJob;
  }
  const catalog = typeof sampleJobsCatalog !== 'undefined' ? sampleJobsCatalog : [];
  return catalog.find((j) => j.id === coverLetterState.selectedJobId) || catalog[0] || {
    id: 'job-1',
    title: 'Product Designer',
    company: 'Karya Cloud (Sample)',
    arrangement: 'Fully remote',
    type: 'Full-time',
    location: 'Worldwide · Indonesia eligible',
    companyInfo: { industry: 'SaaS & Collaboration Technology', overview: '' },
    roleDetails: { requiredSkills: ['Product Design', 'Figma', 'Design Systems'] },
    compensation: { overlapLabel: '3 hours in the afternoon WIB' },
    applicationMethod: { type: 'company_site', label: 'Apply through company website', url: 'https://karyacloud.example/careers' },
  };
}

function getClActiveCv() {
  return coverLetterState.cvVersions.find((c) => c.id === coverLetterState.selectedCvId) || coverLetterState.cvVersions[0];
}

function generateGroundedCoverLetter(job, cv, state, tone, length, extraContext) {
  const companyClean = (job.company || 'your company').replace(' (Sample)', '');
  const skills = (job.roleDetails?.requiredSkills || ['Product Design', 'Figma']).slice(0, 3);
  const firstName = state?.userFirstName || 'Vinna';
  const city = state?.city || 'Jakarta';
  const tz = state?.timezone || 'GMT+7 (WIB)';
  const expMap = { fresh: 'fresh graduate', lt_1: 'nearly 1 year', '1_2': '1–2 years', '3_5': '3–5 years', gt_5: 'over 5 years' };
  const expText = expMap[state?.experienceLevel] || '3–5 years';
  const verifiedIndustry = job.companyInfo?.industry ? ` in ${job.companyInfo.industry}` : '';

  let opening = '';
  if (tone === 'Confident') {
    opening = `I am excited to bring ${expText} of focused ${skills[0] || 'product design'} experience to the ${job.title} position at ${companyClean}.`;
  } else if (tone === 'Warm & Personable') {
    opening = `It is a pleasure to apply for the ${job.title} role at ${companyClean}. I appreciate how your team focuses on thoughtful work${verifiedIndustry}, and I would love to contribute.`;
  } else {
    opening = `I am writing to express my interest in the ${job.title} opportunity at ${companyClean}. With ${expText} of experience in ${skills[0] || 'product design'}, my background aligns closely with the responsibilities outlined in your listing.`;
  }

  let experience = `Drawn from ${cv.name}, my experience covers ${cv.summary.toLowerCase()}, collaborating across engineering and product stakeholders from discovery through implementation.`;
  if (length === 'Concise') {
    experience = `My background (${expText}) in ${skills.slice(0, 2).join(' and ')} equips me to contribute smoothly from day one.`;
  } else if (length === 'Detailed') {
    experience += ` I focus on clear documentation, practical trade-offs, and consistent component systems so remote squads can ship predictably.`;
  }

  let skillsFit = `Specifically, my hands-on work with ${skills.join(', ')} matches your stated requirements for this ${job.type?.toLowerCase() || 'role'} position.`;
  if (extraContext && extraContext.trim()) {
    skillsFit += ` ${extraContext.trim()}`;
  } else if (coverLetterState.clarificationInput && coverLetterState.clarificationInput.trim()) {
    skillsFit += ` ${coverLetterState.clarificationInput.trim()}`;
  }

  const overlapNote = job.compensation?.scheduleConfirmed
    ? `Working from ${city} (${tz}), I fit comfortably within your ${job.compensation.overlapLabel} collaboration window.`
    : `Working remotely from ${city} (${tz}), I am ready to align with your team’s working schedule.`;

  const closing =
    tone === 'Warm & Personable'
      ? `${overlapNote} Thank you for your time and consideration—I would welcome the chance to discuss how I can support ${companyClean}.`
      : `${overlapNote} Thank you for considering my application, and I look forward to the opportunity to speak with your team.`;

  return {
    title: `${job.title} — ${companyClean}`,
    recipientLine: `Hiring Team · ${companyClean}`,
    greetingLine: `Dear ${companyClean} Hiring Team,`,
    sections: { opening, experience, skillsFit, closing },
    signOff: `Best regards,\n${firstName}`,
  };
}

function getFullCoverLetterText() {
  const s = coverLetterState;
  return [
    s.docDate,
    s.recipientLine,
    '',
    s.greetingLine,
    '',
    s.sections.opening,
    '',
    s.sections.experience,
    '',
    s.sections.skillsFit,
    '',
    s.sections.closing,
    '',
    s.signOff,
  ]
    .filter((line) => line !== null && line !== undefined)
    .join('\n');
}

function pushClHistory() {
  const s = coverLetterState;
  const snap = JSON.stringify({
    docTitle: s.docTitle,
    sections: { ...s.sections },
    signOff: s.signOff,
  });
  if (s.historyIdx >= 0 && s.history[s.historyIdx] === snap) return;
  s.history = s.history.slice(0, s.historyIdx + 1);
  s.history.push(snap);
  s.historyIdx = s.history.length - 1;
}

function syncClToLibrary() {
  const s = coverLetterState;
  const job = getClActiveJob();
  const idx = s.library.findIndex((item) => item.id === s.activeDocId);
  const entry = {
    id: s.activeDocId || `doc-${Date.now()}`,
    jobId: job.id,
    title: s.docTitle || `${job.title} — ${job.company}`,
    jobTitle: job.title,
    company: job.company,
    tone: s.tone,
    length: s.length,
    lastEdited: 'Just now',
    sections: { ...s.sections },
  };
  if (idx >= 0) {
    s.library[idx] = entry;
  } else {
    s.activeDocId = entry.id;
    s.library.unshift(entry);
  }
  if (typeof workbenchState !== 'undefined') {
    workbenchState.coverLetterJobId = job.id;
    workbenchState.coverLetterDraft = getFullCoverLetterText();
    workbenchState.savedCoverLetters[job.id] = workbenchState.coverLetterDraft;
  }
}

function generateAiSectionSuggestion(sectionKey, actionLabel, currentText, job, tone) {
  const base = (currentText || '').trim();
  const companyClean = (job.company || 'the company').replace(' (Sample)', '');
  const skill1 = job.roleDetails?.requiredSkills?.[0] || 'Product Design';

  if (actionLabel === 'Shorten') {
    const firstSentence = base.split(/(?<=[.!?])\s+/)[0] || base;
    return firstSentence;
  }
  if (actionLabel === 'Make More Confident') {
    return base
      .replace(/I am writing to express my interest in/i, 'I am excited to contribute directly to')
      .replace(/I appreciate how your team focuses on/i, 'I bring direct experience supporting teams that prioritize')
      .replace(/my background aligns closely with/i, 'my hands-on work directly matches');
  }
  if (actionLabel === 'Make More Professional') {
    return base
      .replace(/I would love to/i, 'I would welcome the opportunity to')
      .replace(/I’m/g, 'I am')
      .replace(/excited to bring/i, 'pleased to offer');
  }
  if (actionLabel === 'Expand') {
    return `${base} Throughout my work with ${skill1}, I have prioritized clear documentation and cross-functional alignment so remote stakeholders stay informed.`;
  }
  if (actionLabel === 'Rewrite' || actionLabel === 'Improve Writing') {
    if (sectionKey === 'opening') {
      return `With direct experience in ${skill1} and distributed collaboration, I am keen to support ${companyClean} as your next ${job.title}.`;
    }
    if (sectionKey === 'experience') {
      return `Across recent product initiatives, I owned UX workflows from early scoping to Figma component handoff, keeping engineering collaboration predictable and well-documented.`;
    }
    return `${base.replace(/\s+/g, ' ')} My workflow emphasizes practical clarity and reliable execution for ${companyClean}.`;
  }
  return base;
}

function renderCoverLetterRoute(animatePage) {
  const s = coverLetterState;
  const userState = typeof workbenchState !== 'undefined' ? workbenchState : { userFirstName: 'Vinna', city: 'Jakarta', country: 'Indonesia', timezone: 'GMT+7 (WIB)', savedJobIds: ['job-1'] };
  const job = getClActiveJob();
  const cv = getClActiveCv();
  const catalog = typeof sampleJobsCatalog !== 'undefined' ? sampleJobsCatalog : [];

  // ── SCREEN 1: LANDING ──
  if (s.step === 'landing') {
    return `
      <div class="oa-ai-banner rounded-[18px] p-4 space-y-3.5 ${getRevealClass(0, animatePage)}">
        <div>
          <span class="h-[20px] px-2 rounded-full bg-white/80 text-[#44658b] text-[10.5px] font-medium inline-flex items-center mb-1.5">AI Cover Letter · NEX</span>
          <h1 class="text-[19px] leading-[25px] font-medium text-[#181d27]">Make your next application stand out.</h1>
          <p class="text-[12.5px] leading-[18px] text-[#535862] mt-1">
            Create a personalized cover letter with NEX, tailored to your experience and the job you’re applying for.
          </p>
        </div>

        <div class="bg-white/80 rounded-[14px] p-3 space-y-2 text-[12px] text-[#414651]">
          <div class="flex items-center gap-2"><span class="w-5 h-5 rounded-full bg-[#ebf2fa] text-[#355070] text-[11px] font-mono-ds flex items-center justify-center shrink-0">1</span><span>Select a target job & review your CV source</span></div>
          <div class="flex items-center gap-2"><span class="w-5 h-5 rounded-full bg-[#ebf2fa] text-[#355070] text-[11px] font-mono-ds flex items-center justify-center shrink-0">2</span><span>Choose tone, length, and key highlights</span></div>
          <div class="flex items-center gap-2"><span class="w-5 h-5 rounded-full bg-[#ebf2fa] text-[#355070] text-[11px] font-mono-ds flex items-center justify-center shrink-0">3</span><span>Refine directly in the document editor & export</span></div>
        </div>

        <button
          onclick="clGoStep('select')"
          class="oa-press oa-ai-keylight-btn w-full h-[42px] rounded-full text-white text-[13.5px] font-medium cursor-pointer inline-flex items-center justify-center gap-1.5"
        >
          <span class="relative z-10">Create Cover Letter</span>
          <i data-lucide="arrow-right" class="w-4 h-4 relative z-10"></i>
        </button>
      </div>

      ${
        s.library.length > 0
          ? `<div class="bg-white rounded-[18px] p-4 space-y-2.5 ${getRevealClass(1, animatePage)}">
               <div class="flex items-center justify-between">
                 <h2 class="text-[14.5px] font-medium text-[#181d27]">Recent cover letters</h2>
                 <span class="text-[11px] text-[#717680] font-mono-ds">${s.library.length}</span>
               </div>
               <div class="space-y-2">
                 ${s.library
                   .map(
                     (doc) => `
                   <div class="bg-[#f7f8fa] rounded-[14px] p-3 flex items-center justify-between gap-2.5">
                     <div class="min-w-0">
                       <div class="text-[13px] font-medium text-[#181d27] truncate">${doc.title}</div>
                       <div class="text-[11px] text-[#717680] truncate">${doc.tone} · Edited ${doc.lastEdited}</div>
                     </div>
                     <button
                       onclick="clOpenSavedDoc('${doc.id}')"
                       class="oa-press h-[30px] px-3 rounded-full bg-white hover:bg-[#ebf2fa] text-[#44658b] text-[11.5px] font-medium cursor-pointer shrink-0"
                     >
                       Edit
                     </button>
                   </div>
                 `
                   )
                   .join('')}
               </div>
             </div>`
          : ''
      }
    `;
  }

  // ── SCREEN 2: SELECT JOB & REVIEW PROFILE ──
  if (s.step === 'select') {
    return `
      <!-- Card 1: Select Target Job -->
      <div class="bg-white rounded-[18px] p-4 space-y-3 ${getRevealClass(0, animatePage)}">
        <div>
          <div class="text-[11px] text-[#44658b] font-medium">Step <span class="font-mono-ds">1</span> of <span class="font-mono-ds">2</span> · Job & profile</div>
          <h2 class="text-[16px] font-medium text-[#181d27]">Select job to apply for</h2>
        </div>

        <div class="bg-[#f5f6f8] rounded-full p-1 grid grid-cols-3 gap-1">
          <button onclick="clSetJobSource('upnext')" class="oa-press h-[30px] rounded-full text-[11.5px] font-medium cursor-pointer ${s.jobSource === 'upnext' ? 'bg-white text-[#181d27]' : 'text-[#535862]'}">Saved / Jobs</button>
          <button onclick="clSetJobSource('paste')" class="oa-press h-[30px] rounded-full text-[11.5px] font-medium cursor-pointer ${s.jobSource === 'paste' ? 'bg-white text-[#181d27]' : 'text-[#535862]'}">Paste JD</button>
          <button onclick="clSetJobSource('url')" class="oa-press h-[30px] rounded-full text-[11.5px] font-medium cursor-pointer ${s.jobSource === 'url' ? 'bg-white text-[#181d27]' : 'text-[#535862]'}">Job URL</button>
        </div>

        ${
          s.jobSource === 'upnext'
            ? `<div class="space-y-1.5">
                 ${catalog
                   .slice(0, 3)
                   .map((j) => {
                     const isSel = s.selectedJobId === j.id;
                     const statusChip = typeof renderJobStatusChip === 'function' ? renderJobStatusChip(j.id) : '';
                     return `
                       <button
                         onclick="clSelectJob('${j.id}')"
                         class="oa-press w-full p-3 rounded-[14px] text-left flex items-center justify-between gap-2 cursor-pointer ${
                           isSel ? 'bg-[#ebf2fa]' : 'bg-[#f7f8fa] hover:bg-[#f0f1f3]'
                         }"
                       >
                         <div class="min-w-0">
                           <div class="flex items-center gap-1.5">
                             <span class="text-[13px] font-medium text-[#181d27] truncate">${j.title}</span>
                             ${statusChip}
                           </div>
                           <div class="text-[11.5px] text-[#717680] truncate">${j.company} · ${j.arrangement}</div>
                         </div>
                         <span class="w-[18px] h-[18px] rounded-full shrink-0 transition-colors ${isSel ? 'border-[5px] border-[#44658b] bg-white' : 'border-[1.5px] border-[#d0d5dd] bg-white'}"></span>
                       </button>
                     `;
                   })
                   .join('')}
               </div>`
            : s.jobSource === 'paste'
              ? `<div class="space-y-2">
                   <textarea
                     rows="4"
                     placeholder="Paste the job title, company, and key requirements here..."
                     oninput="clUpdatePastedJd(this.value)"
                     class="w-full rounded-[14px] bg-[#f5f6f8] focus:bg-white focus:ring-2 focus:ring-[#44658b]/25 p-3 text-[12px] text-[#181d27] focus:outline-none"
                   >${s.pastedJobText}</textarea>
                 </div>`
              : typeof renderJobUrlTabHtml === 'function'
                ? renderJobUrlTabHtml('coverLetterState', 'clCheckJobUrl', s)
                : ''
        }

        <div class="bg-[#f4f8fc] rounded-[14px] p-3 text-[12px] space-y-1">
          <div class="font-medium text-[#355070]">${job.title} · ${job.company}</div>
          <div class="text-[#535862]">${job.location || 'Remote'} · ${job.type || 'Full-time'}</div>
        </div>
      </div>

      <!-- Card 2: Career Profile & CV Source -->
      <div class="bg-white rounded-[18px] p-4 space-y-3 ${getRevealClass(1, animatePage)}">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-[14.5px] font-medium text-[#181d27]">Profile & CV source</h3>
            <p class="text-[11.5px] text-[#717680]">NEX uses only verified facts from your source.</p>
          </div>
          <button onclick="navigateDashboardRoute('profile')" class="text-[11.5px] text-[#44658b] hover:underline cursor-pointer">Edit profile</button>
        </div>

        <div class="bg-[#f7f8fa] rounded-[14px] p-3 text-[12px] space-y-1">
          <div class="font-medium text-[#181d27]">${userState.userFirstName} · ${numText(userState.timezone || 'GMT+7 (WIB)')}</div>
          <div class="text-[#535862]">${userState.city || 'Jakarta'}, ${userState.country || 'Indonesia'}</div>
        </div>

        <div class="space-y-1.5">
          ${s.cvVersions
            .map((cvItem) => {
              const active = s.selectedCvId === cvItem.id;
              return `
                <button
                  onclick="clSelectCv('${cvItem.id}')"
                  class="oa-press w-full p-3 rounded-[14px] flex items-center justify-between gap-2 text-left cursor-pointer ${
                    active ? 'bg-[#ebf2fa]' : 'bg-[#f7f8fa] hover:bg-[#f0f1f3]'
                  }"
                >
                  <div class="min-w-0">
                    <div class="text-[12.5px] font-medium text-[#181d27] truncate">${cvItem.name}</div>
                    <div class="text-[11px] text-[#717680] truncate">Updated ${numText(cvItem.updated)} · ${cvItem.summary}</div>
                  </div>
                  <span class="w-[18px] h-[18px] rounded-full shrink-0 transition-colors ${active ? 'border-[5px] border-[#44658b] bg-white' : 'border-[1.5px] border-[#d0d5dd] bg-white'}"></span>
                </button>
              `;
            })
            .join('')}
        </div>
      </div>
    `;
  }

  // ── SCREEN 3: CUSTOMIZE COVER LETTER ──
  if (s.step === 'customize') {
    const tones = [
      { id: 'Professional', desc: 'Clear, structured, and respectful.' },
      { id: 'Confident', desc: 'Direct and focused on proven impact.' },
      { id: 'Warm & Personable', desc: 'Human, approachable, and authentic.' },
    ];
    const lengths = ['Concise', 'Standard', 'Detailed'];
    const isPastedShort = s.jobSource === 'paste' && (s.pastedJobText || '').trim().length < 20;

    return `
      <!-- Card 1: Writing Tone (Radio List) -->
      <div class="bg-white rounded-[18px] p-4 space-y-2.5 ${getRevealClass(0, animatePage)}">
        <div>
          <div class="text-[11px] text-[#44658b] font-medium">Step <span class="font-mono-ds">2</span> of <span class="font-mono-ds">2</span> · Style</div>
          <h2 class="text-[16px] font-medium text-[#181d27]">Customize cover letter</h2>
        </div>

        <div class="space-y-1.5">
          <div class="text-[12px] font-medium text-[#181d27]">Writing tone</div>
          ${tones
            .map((t) => {
              const active = s.tone === t.id;
              return `
                <button
                  onclick="clSetField('tone', '${t.id}')"
                  class="oa-press w-full px-3.5 py-2.5 rounded-[14px] flex items-center justify-between gap-2 text-left cursor-pointer ${
                    active ? 'bg-[#ebf2fa]' : 'bg-[#f7f8fa] hover:bg-[#f0f1f3]'
                  }"
                >
                  <div>
                    <div class="text-[12.5px] font-medium text-[#181d27]">${t.id}</div>
                    <div class="text-[11px] text-[#717680]">${t.desc}</div>
                  </div>
                  <span class="w-[18px] h-[18px] rounded-full shrink-0 transition-colors ${active ? 'border-[5px] border-[#44658b] bg-white' : 'border-[1.5px] border-[#d0d5dd] bg-white'}"></span>
                </button>
              `;
            })
            .join('')}
        </div>
      </div>

      <!-- Card 2: Length & Additional Context -->
      <div class="bg-white rounded-[18px] p-4 space-y-3.5 ${getRevealClass(1, animatePage)}">
        <div class="flex items-center justify-between text-[12.5px]">
          <span class="font-medium text-[#181d27]">Letter length</span>
          <div class="flex gap-1.5">
            ${lengths
              .map(
                (len) => `<button onclick="clSetField('length', '${len}')" class="oa-press h-[28px] px-3 rounded-full text-[11.5px] cursor-pointer ${
                  s.length === len ? 'bg-[#44658b] text-white' : 'bg-[#f5f6f8] text-[#414651]'
                }">${len}</button>`
              )
              .join('')}
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-[12px] font-medium text-[#181d27] block">Additional context (optional)</label>
          <textarea
            rows="3"
            placeholder="Is there anything specific you'd like to highlight for this application?"
            oninput="coverLetterState.additionalContext = this.value"
            class="w-full rounded-[14px] bg-[#f5f6f8] focus:bg-white focus:ring-2 focus:ring-[#44658b]/25 p-3 text-[12px] leading-[18px] text-[#181d27] focus:outline-none"
          >${s.additionalContext}</textarea>
        </div>

        ${
          isPastedShort
            ? `<div class="bg-[#fffaeb] rounded-[14px] p-3 space-y-2 text-[12px] text-[#b54708]">
                 <div class="font-medium">Clarification needed before generating</div>
                 <p>Your pasted job description is brief. Add key skills or responsibilities below so NEX doesn’t guess:</p>
                 <input
                   type="text"
                   value="${s.clarificationInput}"
                   placeholder="e.g., Mobile Figma systems, 3+ years SaaS"
                   oninput="coverLetterState.clarificationInput = this.value"
                   class="w-full h-[36px] px-3 rounded-full bg-white text-[#181d27] text-[12px] focus:outline-none"
                 />
               </div>`
            : ''
        }
      </div>
    `;
  }

  // ── SCREEN 4: AI GENERATION ──
  if (s.step === 'generating') {
    const steps = [
      'Reviewing your career profile',
      'Analyzing the job requirements',
      'Identifying relevant experience',
      'Writing your personalized cover letter',
    ];
    return `
      <div class="bg-white rounded-[18px] p-5 space-y-4 my-auto ${getRevealClass(0, animatePage)}">
        <div class="flex flex-col items-center text-center gap-2">
          <div class="relative w-16 h-16 flex items-center justify-center">
            <img src="./bosshire-ai-blob.png" alt="NEX" class="nex-orb w-14 h-14 rounded-full object-contain" />
          </div>
          <h2 class="text-[16px] font-medium text-[#181d27]">Drafting your cover letter...</h2>
          <p class="text-[12px] text-[#717680]">Using ${cv.name} for ${job.title} at ${job.company}</p>
        </div>

        <div class="space-y-2">
          ${steps
            .map((label, idx) => {
              const done = s.genStep > idx;
              const current = s.genStep === idx;
              return `
                <div class="rounded-[12px] px-3.5 py-2.5 flex items-center gap-2.5 text-[12.5px] ${
                  done ? 'bg-[#ecfdf3] text-[#027a48]' : current ? 'bg-[#ebf2fa] text-[#355070] font-medium' : 'bg-[#f7f8fa] text-[#717680]'
                }">
                  <span class="w-4 text-center font-mono-ds">${done ? '✓' : current ? '•' : `${idx + 1}`}</span>
                  <span>${label}</span>
                </div>
              `;
            })
            .join('')}
        </div>
      </div>
    `;
  }

  // ── SCREEN 5: EDITABLE DOCUMENT EDITOR (CORE EXPERIENCE) ──
  if (s.step === 'editor') {
    const canUndo = s.historyIdx > 0;
    const canRedo = s.historyIdx >= 0 && s.historyIdx < s.history.length - 1;
    const sectionMeta = [
      { key: 'opening', label: 'Opening paragraph' },
      { key: 'experience', label: 'Relevant experience' },
      { key: 'skillsFit', label: 'Skills & qualifications' },
      { key: 'closing', label: 'Closing paragraph' },
    ];
    const aiActions = [
      'Improve Writing',
      'Make More Confident',
      'Make More Professional',
      'Shorten',
      'Expand',
      'Rewrite',
    ];

    return `
      <!-- Workspace Toolbar: Title, Autosave, Undo/Redo, Quick Actions -->
      <div class="bg-white rounded-[18px] p-3.5 space-y-2.5 ${getRevealClass(0, animatePage)}">
        <div class="flex items-center justify-between gap-2">
          <input
            type="text"
            value="${s.docTitle.replace(/"/g, '&quot;')}"
            oninput="clRenameDocument(this.value)"
            aria-label="Document title"
            class="flex-1 min-w-0 text-[14px] font-medium text-[#181d27] bg-transparent hover:bg-[#f5f6f8] focus:bg-[#f5f6f8] rounded-[8px] px-2 py-1 focus:outline-none truncate"
          />
          <div class="flex items-center gap-1 shrink-0">
            <button
              onclick="clUndo()"
              ${canUndo ? '' : 'disabled'}
              title="Undo"
              class="oa-press w-7 h-7 rounded-full bg-[#f5f6f8] text-[#414651] disabled:opacity-35 flex items-center justify-center text-[13px] cursor-pointer"
            >↶</button>
            <button
              onclick="clRedo()"
              ${canRedo ? '' : 'disabled'}
              title="Redo"
              class="oa-press w-7 h-7 rounded-full bg-[#f5f6f8] text-[#414651] disabled:opacity-35 flex items-center justify-center text-[13px] cursor-pointer"
            >↷</button>
          </div>
        </div>

        <div class="flex items-center justify-between text-[11px] px-1">
          <span class="text-[#027a48]">✓ ${s.autosaveLabel} · ${numText(s.lastEditedAt)}</span>
          <div class="flex items-center gap-2">
            <button onclick="clCopyFullLetter()" class="text-[#44658b] font-medium cursor-pointer">${s.copiedNotice ? 'Copied ✓' : 'Copy text'}</button>
            <button onclick="clOpenExportSheet()" class="text-[#44658b] font-medium cursor-pointer">Export PDF</button>
          </div>
        </div>
      </div>

      <!-- Editable Document Sheet -->
      <div class="bg-white rounded-[18px] p-4 space-y-3 ${getRevealClass(1, animatePage)}">
        <div class="text-[11.5px] text-[#717680] space-y-0.5 pb-2 border-b border-[#edeef1]">
          <div>${numText(s.docDate)}</div>
          <div class="text-[#181d27] font-medium">${s.recipientLine}</div>
        </div>

        <div class="text-[12.5px] text-[#181d27] font-medium">${s.greetingLine}</div>

        ${sectionMeta
          .map((sec) => {
            const isSelected = s.activeSectionKey === sec.key;
            return `
              <div class="rounded-[12px] p-2 transition-colors ${isSelected ? 'bg-[#f4f8fc] ring-1 ring-[#44658b]/25' : 'bg-[#f7f8fa]/70 hover:bg-[#f7f8fa]'}">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-[10.5px] font-medium ${isSelected ? 'text-[#44658b]' : 'text-[#717680]'}">${sec.label}</span>
                  ${
                    isSelected
                      ? `<button onclick="clRequestAiRevision('${sec.key}', 'Rewrite')" class="text-[10.5px] text-[#44658b] cursor-pointer">↻ Regenerate</button>`
                      : ''
                  }
                </div>
                <textarea
                  data-cl-section="${sec.key}"
                  rows="${s.length === 'Detailed' ? 4 : 3}"
                  onfocus="clSetActiveSection('${sec.key}')"
                  oninput="clEditSection('${sec.key}', this.value)"
                  class="w-full bg-transparent text-[12.5px] leading-[19px] text-[#181d27] focus:outline-none resize-none"
                >${s.sections[sec.key] || ''}</textarea>
              </div>
            `;
          })
          .join('')}

        <textarea
          rows="2"
          oninput="clEditSignOff(this.value)"
          class="w-full bg-transparent text-[12.5px] leading-[18px] text-[#181d27] pt-1 focus:outline-none resize-none"
        >${s.signOff}</textarea>
      </div>

      <!-- Contextual NEX Writing Assistance Bar -->
      <div class="oa-ai-iridescent rounded-[18px] p-3.5 space-y-2 ${getRevealClass(2, animatePage)}">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <img src="./bosshire-ai-blob.png" alt="NEX" class="nex-orb w-4 h-4 rounded-full" />
            <span class="text-[12px] font-medium text-[#181d27]">NEX writing assistant</span>
          </div>
          <span class="text-[10.5px] text-[#44658b]">Editing: ${sectionMeta.find((m) => m.key === s.activeSectionKey)?.label || 'Paragraph'}</span>
        </div>
        <div class="flex flex-wrap gap-1.5">
          ${aiActions
            .map(
              (act) => `
            <button
              onclick="clRequestAiRevision('${s.activeSectionKey}', '${act}')"
              class="oa-press h-[28px] px-2.5 rounded-full bg-white/85 hover:bg-white text-[#355070] text-[11px] font-medium cursor-pointer"
            >${act}</button>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  // ── SCREEN 7: REDESIGNED DOCUMENT WORKSPACE ("Your cover letter") ──
  return `
    <!-- C. Compact Document Title -->
    <div class="px-1 ${getRevealClass(0, animatePage)}">
      <div class="text-[15.5px] font-medium text-[#181d27] leading-[21px]">${s.docTitle}</div>
    </div>

    <!-- D. Main Document Preview (Visual Centerpiece) -->
    <div class="bg-white rounded-[18px] p-5 space-y-3.5 shadow-[0_2px_14px_-4px_rgba(16,24,40,0.06)] ${getRevealClass(1, animatePage)}">
      <div class="max-h-[420px] overflow-y-auto no-scrollbar space-y-3 pr-0.5 text-[12.5px] leading-[20px] text-[#282828]">
        <div class="text-[11.5px] leading-[17px] text-[#717680] pb-2.5 border-b border-[#edeef1]">
          <div>${numText(s.docDate)}</div>
          <div class="text-[#181d27] font-medium mt-0.5">${s.recipientLine}</div>
        </div>

        <p class="font-medium text-[#181d27]">${s.greetingLine}</p>
        <p>${s.sections.opening}</p>
        <p>${s.sections.experience}</p>
        <p>${s.sections.skillsFit}</p>
        <p>${s.sections.closing}</p>
        <p class="whitespace-pre-line text-[#181d27] pt-1">${s.signOff}</p>
      </div>

      <!-- E. Document Actions (Edit primary + Copy & Export PDF icon buttons) -->
      ${renderClActionBarWithIcons(
        `<button
           onclick="clGoStep('editor')"
           class="oa-press flex-1 h-[40px] rounded-full border border-[#44658b] bg-white hover:bg-[#ebf2fa] text-[#44658b] text-[13px] font-medium cursor-pointer inline-flex items-center justify-center gap-1.5"
         >
           <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
           <span>Edit cover letter</span>
         </button>`,
        'w-[40px] h-[40px]',
        'pt-2 border-t border-[#edeef1]'
      )}
    </div>
  `;
}

function renderCoverLetterStickyFooter() {
  const s = coverLetterState;
  if (s.step === 'select') {
    return `
      <div class="sticky bottom-0 z-20 bg-[#f5f6f8]/95 backdrop-blur-md px-3 pt-2.5 pb-4 border-t border-[#edeef1] flex items-center gap-2 shrink-0">
        <button onclick="clGoStep('landing')" class="oa-press h-[42px] px-4 rounded-full bg-white text-[#181d27] text-[13px] cursor-pointer">Back</button>
        <button onclick="clGoStep('customize')" class="oa-press flex-1 h-[42px] rounded-full bg-[#44658b] hover:bg-[#355070] text-white text-[13.5px] font-medium cursor-pointer">
          Customize Letter →
        </button>
      </div>
    `;
  }
  if (s.step === 'customize') {
    return `
      <div class="sticky bottom-0 z-20 bg-[#f5f6f8]/95 backdrop-blur-md px-3 pt-2.5 pb-4 border-t border-[#edeef1] flex items-center gap-2 shrink-0">
        <button onclick="clGoStep('select')" class="oa-press h-[42px] px-4 rounded-full bg-white text-[#181d27] text-[13px] cursor-pointer">Back</button>
        <button onclick="clStartGeneration()" class="oa-press oa-ai-keylight-btn flex-1 h-[42px] rounded-full text-white text-[13.5px] font-medium cursor-pointer">
          <span class="relative z-10">Generate Cover Letter →</span>
        </button>
      </div>
    `;
  }
  if (s.step === 'editor') {
    return `
      <div class="sticky bottom-0 z-20 bg-[#f5f6f8]/95 backdrop-blur-md px-3 pt-2.5 pb-4 border-t border-[#edeef1] flex items-center gap-2 shrink-0">
        <button onclick="clOpenExportSheet()" class="oa-press h-[42px] px-4 rounded-full bg-white text-[#181d27] text-[13px] cursor-pointer">Save & Export</button>
        <button onclick="clGoStep('continue_apply')" class="oa-press oa-ai-keylight-btn flex-1 h-[42px] rounded-full text-white text-[13.5px] font-medium cursor-pointer">
          <span class="relative z-10">Continue to Application →</span>
        </button>
      </div>
    `;
  }
  if (s.step === 'continue_apply') {
    const job = getClActiveJob();
    const appMethod = job.applicationMethod || { type: 'company_site', label: 'Apply through company website', url: null };
    const hasAppUrl = Boolean(appMethod.url);
    return `
      <div class="sticky bottom-0 z-20 bg-[#f5f6f8]/95 backdrop-blur-md px-3 pt-2.5 pb-4 border-t border-[#edeef1] shrink-0">
        ${
          hasAppUrl
            ? `<div class="space-y-1.5">
                 <button
                   onclick="clLaunchEmployerApplication()"
                   class="oa-press oa-ai-keylight-btn w-full h-[44px] rounded-full text-white text-[13.5px] font-medium cursor-pointer inline-flex items-center justify-center gap-1.5"
                 >
                   <span class="relative z-10">Continue to Application</span>
                   <i data-lucide="arrow-right" class="w-4 h-4 relative z-10"></i>
                 </button>
                 <p class="text-[11px] text-center text-[#717680]">
                   Your application will be submitted through the employer’s website.
                 </p>
               </div>`
            : `<div class="bg-white rounded-[14px] px-3.5 py-2.5 text-[11.5px] text-[#535862] text-center">
                 No external application link is attached. Use Copy or Export PDF above to submit on the company’s site.
               </div>`
        }
      </div>
    `;
  }
  return '';
}

function buildSimplePdfBlob(text) {
  const cleanAscii = String(text || '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[^\x20-\x7E\n]/g, ' ');

  const wrappedLines = [];
  cleanAscii.split('\n').forEach((para) => {
    if (!para.trim()) {
      wrappedLines.push('');
      return;
    }
    const words = para.split(/\s+/);
    let cur = '';
    words.forEach((w) => {
      if ((cur + ' ' + w).trim().length > 78) {
        wrappedLines.push(cur.trim());
        cur = w;
      } else {
        cur = (cur + ' ' + w).trim();
      }
    });
    if (cur) wrappedLines.push(cur);
  });

  const pdfTextOps = wrappedLines
    .map((line) => `(${line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')}) Tj T*`)
    .join('\n');
  const stream = `BT\n/F1 11 Tf\n15 TL\n56 750 Td\n${pdfTextOps}\nET`;
  const objs = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj',
    `4 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
    '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
  ];

  let body = '%PDF-1.4\n';
  const offsets = [0];
  objs.forEach((o) => {
    offsets.push(body.length);
    body += o + '\n';
  });
  const xrefPos = body.length;
  body += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i += 1) {
    body += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }
  body += `trailer << /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  return new Blob([body], { type: 'application/pdf' });
}

function renderCoverLetterRevisionSheet() {
  const rev = coverLetterState.revisionSheet;
  if (!rev) return '';
  return `
    <div class="oa-drawer-overlay absolute inset-0 z-40 bg-[#101828]/45 backdrop-blur-[2px] flex items-end justify-center" onclick="clRejectRevision()">
      <div class="oa-sheet-up w-full max-h-[82%] flex flex-col bg-[#fdfdfd] rounded-t-[24px] px-5 pt-3 pb-5 space-y-3 shadow-[0_-16px_48px_-12px_rgba(16,24,40,0.22)]" onclick="event.stopPropagation()">
        <div class="w-10 h-1 rounded-full bg-[#d0d5dd] mx-auto shrink-0"></div>
        <div class="flex items-start justify-between gap-2">
          <div>
            <div class="text-[11px] text-[#44658b] font-medium">NEX suggestion · ${rev.actionLabel}</div>
            <h3 class="text-[15.5px] font-medium text-[#181d27]">Review suggested revision</h3>
          </div>
          <button onclick="clRejectRevision()" aria-label="Close" class="oa-press w-8 h-8 rounded-full bg-[#f5f6f8] text-[#535862] flex items-center justify-center cursor-pointer">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto no-scrollbar space-y-2.5 text-[12px]">
          <div class="bg-[#f7f8fa] rounded-[14px] p-3 space-y-1">
            <div class="text-[10.5px] font-medium text-[#717680]">Your original version</div>
            <p class="leading-[18px] text-[#535862]">${rev.originalText}</p>
          </div>
          <div class="bg-[#ebf2fa] rounded-[14px] p-3 space-y-1">
            <div class="text-[10.5px] font-medium text-[#355070]">Suggested revision</div>
            <p class="leading-[18px] text-[#181d27]">${rev.suggestedText}</p>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-1 shrink-0">
          <button onclick="clRejectRevision()" class="oa-press flex-1 h-[40px] rounded-full bg-[#f0f1f3] text-[#181d27] text-[13px] cursor-pointer">Keep original</button>
          <button onclick="clAcceptRevision()" class="oa-press flex-1 h-[40px] rounded-full bg-[#44658b] text-white text-[13px] font-medium cursor-pointer">Accept revision</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders a primary pill button paired in one row with Copy & Export PDF icon buttons.
 */
function renderClActionBarWithIcons(primaryBtnHtml, iconSizeClass = 'w-[42px] h-[42px]', wrapperClass = '') {
  const s = coverLetterState;
  return `
    <div class="${wrapperClass} space-y-1.5">
      <div class="flex items-center gap-2">
        ${primaryBtnHtml}
        <button
          onclick="clCopyFullLetter()"
          title="Copy cover letter"
          aria-label="Copy cover letter"
          class="oa-press ${iconSizeClass} rounded-full shrink-0 cursor-pointer inline-flex items-center justify-center ${
            s.copiedNotice ? 'bg-[#ecfdf3] text-[#027a48]' : 'bg-[#f5f6f8] hover:bg-[#ebf2fa] text-[#181d27]'
          }"
        >
          <i data-lucide="${s.copiedNotice ? 'check' : 'copy'}" class="w-4 h-4"></i>
        </button>
        <button
          onclick="clDownloadPdf()"
          title="Export PDF"
          aria-label="Export PDF"
          class="oa-press ${iconSizeClass} rounded-full shrink-0 cursor-pointer inline-flex items-center justify-center ${
            s.exportedNotice ? 'bg-[#ecfdf3] text-[#027a48]' : 'bg-[#f5f6f8] hover:bg-[#ebf2fa] text-[#44658b]'
          }"
        >
          <i data-lucide="${s.exportedNotice ? 'check' : 'file-down'}" stroke-width="1.5" class="w-4 h-4"></i>
        </button>
      </div>
      ${
        s.copiedNotice || s.exportedNotice
          ? `<div class="text-[11px] text-[#027a48] text-right pr-1">${
              s.copiedNotice ? 'Copied to clipboard' : 'PDF downloaded'
            }</div>`
          : ''
      }
    </div>
  `;
}

function renderCoverLetterExportSheet() {
  const s = coverLetterState;
  const job = getClActiveJob();

  if (s.applyHandoffOpen) {
    const appMethod = job.applicationMethod || { type: 'company_site', label: 'Apply through company website', url: '' };
    const url = appMethod.url || '';
    const isSampleUrl = /\.example(\/|$)/i.test(url);
    return `
      <div class="oa-drawer-overlay absolute inset-0 z-40 bg-[#101828]/45 backdrop-blur-[2px] flex items-end justify-center" onclick="clCloseApplyHandoff()">
        <div class="oa-sheet-up w-full bg-[#fdfdfd] rounded-t-[24px] px-5 pt-3 pb-6 space-y-4 shadow-[0_-16px_48px_-12px_rgba(16,24,40,0.22)]" onclick="event.stopPropagation()">
          <div class="w-10 h-1 rounded-full bg-[#d0d5dd] mx-auto"></div>
          <div class="flex items-start justify-between gap-2">
            <div>
              <h3 class="text-[16px] font-medium text-[#181d27]">Ready for ${job.company}</h3>
              <p class="text-[11.5px] text-[#717680]">${job.title}</p>
            </div>
            <button onclick="clCloseApplyHandoff()" aria-label="Close" class="oa-press w-8 h-8 rounded-full bg-[#f5f6f8] text-[#535862] flex items-center justify-center cursor-pointer">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>

          <div class="bg-[#f4f8fc] rounded-[14px] p-3.5 space-y-2 text-[12px]">
            <div class="flex items-center justify-between gap-2">
              <span class="font-medium text-[#355070]">${appMethod.label || 'Employer website'}</span>
              <span class="h-[20px] px-2 rounded-full bg-white text-[#44658b] text-[10.5px] font-medium inline-flex items-center">In progress</span>
            </div>
            <p class="text-[#414651] leading-[18px]">
              ${
                isSampleUrl
                  ? `This prototype listing uses a placeholder URL (<span class="font-mono-ds text-[#355070]">.example</span>), so UpNext previews the handoff here instead of opening a nonexistent domain.`
                  : `Opened ${job.company}’s application page in a new tab.`
              }
              Remember to paste or attach your cover letter before submitting — generating or opening a link does not submit your application.
            </p>
            ${url ? `<div class="text-[11px] font-mono-ds text-[#44658b] truncate pt-0.5">${url}</div>` : ''}
          </div>

          ${renderClActionBarWithIcons(
            `<button onclick="clFinishApplyHandoff()" class="oa-press flex-1 h-[42px] rounded-full bg-[#44658b] hover:bg-[#355070] text-white text-[13px] font-medium cursor-pointer">Back to Job Details</button>`,
            'w-[42px] h-[42px]'
          )}
        </div>
      </div>
    `;
  }

  if (!s.exportSheetOpen) return '';
  return `
    <div class="oa-drawer-overlay absolute inset-0 z-40 bg-[#101828]/45 backdrop-blur-[2px] flex items-end justify-center" onclick="clCloseExportSheet()">
      <div class="oa-sheet-up w-full bg-[#fdfdfd] rounded-t-[24px] px-5 pt-3 pb-6 space-y-4 shadow-[0_-16px_48px_-12px_rgba(16,24,40,0.22)]" onclick="event.stopPropagation()">
        <div class="w-10 h-1 rounded-full bg-[#d0d5dd] mx-auto"></div>
        <div class="flex items-start justify-between gap-2">
          <div>
            <h3 class="text-[16px] font-medium text-[#181d27]">Save & export cover letter</h3>
            <p class="text-[11.5px] text-[#717680]">${job.title} · ${job.company}</p>
          </div>
          <button onclick="clCloseExportSheet()" aria-label="Close" class="oa-press w-8 h-8 rounded-full bg-[#f5f6f8] text-[#535862] flex items-center justify-center cursor-pointer">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <div class="space-y-1.5">
          <label class="text-[11.5px] font-medium text-[#535862]">Document title</label>
          <input
            type="text"
            value="${s.docTitle.replace(/"/g, '&quot;')}"
            oninput="clRenameDocument(this.value)"
            class="w-full h-[38px] px-3.5 rounded-full bg-[#f5f6f8] text-[12.5px] text-[#181d27] focus:outline-none focus:ring-2 focus:ring-[#44658b]/25"
          />
          <div class="text-[11px] text-[#717680]">Last edited: ${numText(s.lastEditedAt)} · Autosave enabled</div>
        </div>

        ${
          s.exportNotice
            ? `<div class="bg-[#ecfdf3] rounded-[12px] p-2.5 text-[12px] text-[#027a48]">${s.exportNotice}</div>`
            : ''
        }

        ${renderClActionBarWithIcons(
          `<button onclick="clSaveAndCloseSheet()" class="oa-press flex-1 h-[42px] rounded-full bg-[#44658b] hover:bg-[#355070] text-white text-[13px] font-medium cursor-pointer">Save to Library</button>`,
          'w-[42px] h-[42px]'
        )}
      </div>
    </div>
  `;
}

// ── Interactive Handlers ──
function refreshCoverLetterUI() {
  if (typeof updateActiveScreenDOM === 'function') {
    updateActiveScreenDOM(false);
  }
}

function updateClSheets() {
  const revLayer = document.getElementById('cl-revision-layer');
  if (revLayer) {
    revLayer.innerHTML = renderCoverLetterRevisionSheet();
    if (typeof hydrateIcons === 'function') hydrateIcons(revLayer);
  }
  const expLayer = document.getElementById('cl-export-layer');
  if (expLayer) {
    expLayer.innerHTML = renderCoverLetterExportSheet();
    if (typeof hydrateIcons === 'function') hydrateIcons(expLayer);
  }
}

window.clGoStep = function (step) {
  if (coverLetterState.genTimer) {
    clearInterval(coverLetterState.genTimer);
    coverLetterState.genTimer = null;
  }
  coverLetterState.exportNotice = '';
  coverLetterState.exportSheetOpen = false;
  coverLetterState.applyHandoffOpen = false;
  coverLetterState.step = step;
  refreshCoverLetterUI();
};

window.clSetJobSource = function (src) {
  coverLetterState.jobSource = src;
  coverLetterState.urlParseError = '';
  refreshCoverLetterUI();
};

window.clSelectJob = function (jobId) {
  coverLetterState.selectedJobId = jobId;
  refreshCoverLetterUI();
};

window.clUpdatePastedJd = function (text) {
  coverLetterState.pastedJobText = text;
  const firstLine = (text || '').split('\n')[0].trim().slice(0, 48);
  coverLetterState.customJob = {
    id: 'custom-cl-job',
    title: firstLine || 'Custom Role',
    company: 'Pasted Job Description',
    arrangement: 'Remote',
    type: 'Full-time',
    location: 'Specified in pasted description',
    companyInfo: { industry: '', overview: '' },
    roleDetails: { requiredSkills: ['Role-relevant skills', 'Communication'] },
    compensation: { scheduleConfirmed: false, overlapLabel: '' },
    applicationMethod: { type: 'company_site', label: 'Apply via job posting link', url: null },
  };
};

window.clCheckJobUrl = function () {
  if (typeof startSharedUrlCheck === 'function') {
    startSharedUrlCheck(coverLetterState, refreshCoverLetterUI);
  }
};

window.clSelectCv = function (cvId) {
  coverLetterState.selectedCvId = cvId;
  refreshCoverLetterUI();
};

window.clSetField = function (field, val) {
  coverLetterState[field] = val;
  refreshCoverLetterUI();
};

window.clStartGeneration = function () {
  const s = coverLetterState;
  s.genStep = 0;
  s.step = 'generating';
  refreshCoverLetterUI();

  if (s.genTimer) clearInterval(s.genTimer);
  s.genTimer = setInterval(() => {
    s.genStep += 1;
    if (s.genStep >= 4) {
      clearInterval(s.genTimer);
      s.genTimer = null;
      const job = getClActiveJob();
      const cv = getClActiveCv();
      const userState = typeof workbenchState !== 'undefined' ? workbenchState : {};
      const gen = generateGroundedCoverLetter(job, cv, userState, s.tone, s.length, s.additionalContext);
      s.docTitle = gen.title;
      s.recipientLine = gen.recipientLine;
      s.greetingLine = gen.greetingLine;
      s.sections = gen.sections;
      s.signOff = gen.signOff;
      s.activeDocId = `doc-${Date.now()}`;
      s.history = [];
      s.historyIdx = -1;
      pushClHistory();
      s.autosaveLabel = 'Autosaved';
      s.lastEditedAt = 'Just now';
      syncClToLibrary();
      s.step = 'editor';
    }
    refreshCoverLetterUI();
  }, 420);
};

window.clOpenSavedDoc = function (docId) {
  const s = coverLetterState;
  const found = s.library.find((d) => d.id === docId);
  if (!found) return;
  s.activeDocId = found.id;
  s.selectedJobId = found.jobId || 'job-1';
  s.docTitle = found.title;
  s.tone = found.tone || 'Professional';
  s.length = found.length || 'Standard';
  s.sections = { ...found.sections };
  s.history = [];
  s.historyIdx = -1;
  pushClHistory();
  s.lastEditedAt = found.lastEdited || 'Just now';
  s.step = 'editor';
  refreshCoverLetterUI();
};

window.clSetActiveSection = function (key) {
  if (coverLetterState.activeSectionKey !== key) {
    coverLetterState.activeSectionKey = key;
    refreshCoverLetterUI();
    const ta = document.querySelector(`[data-cl-section="${key}"]`);
    if (ta) {
      ta.focus();
      const len = ta.value.length;
      if (ta.setSelectionRange) ta.setSelectionRange(len, len);
    }
  }
};

window.clEditSection = function (key, val) {
  coverLetterState.sections[key] = val;
  coverLetterState.autosaveLabel = 'Autosaved';
  coverLetterState.lastEditedAt = 'Just now';
  pushClHistory();
  syncClToLibrary();
};

window.clEditSignOff = function (val) {
  coverLetterState.signOff = val;
  pushClHistory();
  syncClToLibrary();
};

window.clRenameDocument = function (newTitle) {
  coverLetterState.docTitle = newTitle;
  syncClToLibrary();
};

window.clUndo = function () {
  const s = coverLetterState;
  if (s.historyIdx > 0) {
    s.historyIdx -= 1;
    const snap = JSON.parse(s.history[s.historyIdx]);
    s.docTitle = snap.docTitle;
    s.sections = { ...snap.sections };
    s.signOff = snap.signOff;
    syncClToLibrary();
    refreshCoverLetterUI();
  }
};

window.clRedo = function () {
  const s = coverLetterState;
  if (s.historyIdx < s.history.length - 1) {
    s.historyIdx += 1;
    const snap = JSON.parse(s.history[s.historyIdx]);
    s.docTitle = snap.docTitle;
    s.sections = { ...snap.sections };
    s.signOff = snap.signOff;
    syncClToLibrary();
    refreshCoverLetterUI();
  }
};

window.clRequestAiRevision = function (sectionKey, actionLabel) {
  const job = getClActiveJob();
  const originalText = coverLetterState.sections[sectionKey] || '';
  const suggestedText = generateAiSectionSuggestion(sectionKey, actionLabel, originalText, job, coverLetterState.tone);
  coverLetterState.revisionSheet = { sectionKey, actionLabel, originalText, suggestedText };
  updateClSheets();
};

window.clAcceptRevision = function () {
  const rev = coverLetterState.revisionSheet;
  if (rev) {
    coverLetterState.sections[rev.sectionKey] = rev.suggestedText;
    coverLetterState.autosaveLabel = 'Autosaved';
    coverLetterState.lastEditedAt = 'Just now';
    pushClHistory();
    syncClToLibrary();
  }
  coverLetterState.revisionSheet = null;
  updateClSheets();
  refreshCoverLetterUI();
};

window.clRejectRevision = function () {
  coverLetterState.revisionSheet = null;
  updateClSheets();
};

window.clCopyFullLetter = function () {
  const text = getFullCoverLetterText();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
  coverLetterState.copiedNotice = true;
  refreshCoverLetterUI();
  updateClSheets();
  setTimeout(() => {
    coverLetterState.copiedNotice = false;
    refreshCoverLetterUI();
    updateClSheets();
  }, 1800);
};

window.clOpenExportSheet = function () {
  coverLetterState.applyHandoffOpen = false;
  coverLetterState.exportSheetOpen = true;
  coverLetterState.exportNotice = '';
  updateClSheets();
};

window.clCloseExportSheet = function () {
  coverLetterState.exportSheetOpen = false;
  updateClSheets();
};

window.clSaveAndCloseSheet = function () {
  syncClToLibrary();
  coverLetterState.exportNotice = 'Saved to your Cover Letter library.';
  updateClSheets();
  setTimeout(() => {
    coverLetterState.exportSheetOpen = false;
    updateClSheets();
    refreshCoverLetterUI();
  }, 700);
};

window.clDownloadPdf = function () {
  const text = getFullCoverLetterText();
  try {
    const blob = buildSimplePdfBlob(text);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(coverLetterState.docTitle || 'cover-letter').replace(/[^a-z0-9-_ ]/gi, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {}
  coverLetterState.exportedNotice = true;
  refreshCoverLetterUI();
  updateClSheets();
  setTimeout(() => {
    coverLetterState.exportedNotice = false;
    coverLetterState.exportNotice = '';
    refreshCoverLetterUI();
    updateClSheets();
  }, 1800);
};

window.clLaunchEmployerApplication = function () {
  const job = getClActiveJob();
  const url = job.applicationMethod?.url || '';
  const isSampleUrl = /\.example(\/|$)/i.test(url);
  if (typeof workbenchState !== 'undefined') {
    workbenchState.appliedJobTracker[job.id] = 'in_progress';
  }
  if (url && !isSampleUrl) {
    window.open(url, '_blank', 'noopener');
  }
  coverLetterState.exportSheetOpen = false;
  coverLetterState.applyHandoffOpen = true;
  updateClSheets();
};

window.clCloseApplyHandoff = function () {
  coverLetterState.applyHandoffOpen = false;
  updateClSheets();
};

window.clFinishApplyHandoff = function () {
  coverLetterState.applyHandoffOpen = false;
  updateClSheets();
  if (typeof navigateDashboardRoute === 'function') {
    navigateDashboardRoute('job_details');
  }
};
