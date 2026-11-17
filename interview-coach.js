// UpNext — AI Interview Coach (NEX) Module
// Strict Option A Design System · Connected 8-Step Interactive Journey

const interviewCoachState = {
  step: 'landing', // 'landing' | 'select_job' | 'prepare' | 'setup' | 'session' | 'completed' | 'feedback' | 'practice'
  jobSource: 'upnext', // 'upnext' | 'paste' | 'url'
  selectedJobId: 'job-1',
  pastedJobText: '',
  pastedJobUrl: '',
  urlParseError: '',
  urlFetchStatus: 'idle', // 'idle' | 'loading' | 'loaded'
  urlParsedJob: null,
  urlTimer: null,
  customJob: null,

  // Screen 3: Preparation
  categories: ['Behavioral', 'Role-specific'],
  questionCount: 3,
  questions: [],
  editingQuestionIdx: null,
  editingQuestionText: '',

  // Screen 4: Setup
  mode: 'voice', // 'voice' | 'conversation'
  language: 'English', // 'English' | 'Indonesian'
  durationMinutes: 10, // 10 | 20 | 30
  difficulty: 'Realistic', // 'Warm-up' | 'Realistic' | 'Challenging'

  // Screen 5: Session
  micPermission: 'granted', // 'prompt' | 'granted' | 'denied'
  sessionPhase: 'idle', // 'idle' | 'listening' | 'processing' | 'speaking'
  isPaused: false,
  connectionError: false,
  endConfirmOpen: false,
  currentQuestionIdx: 0,
  elapsedSeconds: 0,
  timerId: null,
  liveTranscript: '',
  voiceStepTimer: null,
  answers: [], // { questionId, question, category, transcript, skipped, followUps: [] }
  conversationLog: [], // { role: 'nex' | 'user', text, tag? }

  // Screen 7: Feedback
  expandedReviewIdx: 0,
  evaluation: null,

  // Screen 1: Recent sessions
  recentSessions: [
    {
      id: 'sess-sample-1',
      jobTitle: 'Product Designer',
      company: 'Karya Cloud (Sample)',
      mode: 'Voice Mode',
      dateLabel: '2 days ago',
      answered: 3,
      total: 3,
      score: 84,
      durationLabel: '06:20',
      summary: 'Clear explanation of design system work; add more measurable outcomes.',
    },
  ],
};

function getCoachActiveJob() {
  if (interviewCoachState.jobSource === 'paste' && interviewCoachState.customJob) {
    return interviewCoachState.customJob;
  }
  if (interviewCoachState.jobSource === 'url' && interviewCoachState.urlParsedJob) {
    return interviewCoachState.urlParsedJob;
  }
  const catalog = typeof sampleJobsCatalog !== 'undefined' ? sampleJobsCatalog : [];
  return catalog.find((j) => j.id === interviewCoachState.selectedJobId) || catalog[0] || {
    id: 'job-1',
    title: 'Product Designer',
    company: 'Karya Cloud (Sample)',
    roleDetails: {
      experienceYears: { label: '3–5 years' },
      requiredSkills: ['Product Design', 'Figma', 'Design Systems'],
    },
    companyInfo: { industry: 'SaaS & Collaboration Technology' },
  };
}

function generateCoachQuestions(job, categories, count, language, difficulty) {
  const isId = language === 'Indonesian';
  const skills = job.roleDetails?.requiredSkills || ['Product Design', 'Figma'];
  const s1 = skills[0] || 'Product Design';
  const s2 = skills[1] || 'Figma';
  const role = job.title || 'Product Designer';
  const company = (job.company || 'the company').replace(' (Sample)', '');

  const bank = {
    'HR & Introduction': [
      isId
        ? `Ceritakan secara singkat latar belakang Anda dan mengapa posisi ${role} di ${company} menarik bagi Anda.`
        : `Tell me briefly about your background and what drew you to the ${role} role at ${company}.`,
      isId
        ? `Bagaimana Anda mengatur jam kerja dan komunikasi saat bekerja secara remote?`
        : `How do you structure your daily routine and communication when working in a remote setup?`,
    ],
    Behavioral: [
      isId
        ? `Ceritakan pengalaman saat Anda harus menyelaraskan perbedaan pendapat dengan stakeholder atau engineer terkait keputusan ${s1}.`
        : `Tell me about a time you had to align differing opinions with engineers or stakeholders on a ${s1} decision.`,
      isId
        ? `Pernahkah Anda menghadapi tenggat waktu yang ketat tanpa mengorbankan kualitas? Bagaimana Anda menentukan prioritas?`
        : `Describe a situation where you faced a tight deadline without sacrificing quality. How did you prioritize trade-offs?`,
    ],
    'Role-specific': [
      isId
        ? `Dalam peran ${role}, bagaimana pendekatan Anda saat merancang alur pengguna dari riset hingga handoff ke tim engineering?`
        : `In a ${role} role, how do you approach designing a workflow from early discovery through engineering handoff?`,
      isId
        ? `Bagaimana Anda memastikan konsistensi ${s2} di berbagai fitur yang dikerjakan beberapa tim sekaligus?`
        : `How do you keep ${s2} consistent across multiple features shipped by different squads?`,
    ],
    Technical: [
      isId
        ? `Jelaskan keputusan teknis atau arsitektur ${s1} yang paling menantang yang pernah Anda ambil, serta dampaknya.`
        : `Walk me through a challenging ${s1} or system decision you made recently and the trade-offs involved.`,
      isId
        ? `Bagaimana Anda mengukur apakah solusi yang Anda bangun benar-benar berhasil setelah dirilis?`
        : `How do you validate and measure whether a solution you shipped actually solved the user problem?`,
    ],
    'Portfolio & Experience': [
      isId
        ? `Proyek mana dari pengalaman Anda yang paling relevan dengan kebutuhan ${company} di bidang ${job.companyInfo?.industry || 'teknologi'}?`
        : `Which project in your portfolio is most relevant to ${company}’s focus on ${job.companyInfo?.industry || 'technology'}, and what was your specific role?`,
    ],
    'Salary Negotiation': [
      isId
        ? `Apa ekspektasi kompensasi Anda untuk posisi ${role} ini, dan faktor apa saja yang paling Anda pertimbangkan?`
        : `What are your compensation expectations for this ${role} role, and how do you weigh total remote benefits?`,
    ],
  };

  const activeCats = categories.length > 0 ? categories : ['Behavioral', 'Role-specific'];
  const generated = [];
  let idx = 0;
  while (generated.length < count && idx < 16) {
    const cat = activeCats[idx % activeCats.length];
    const pool = bank[cat] || bank.Behavioral;
    const text = pool[Math.floor(idx / activeCats.length) % pool.length];
    const diffTag = difficulty === 'Challenging' ? 'Deep-dive' : difficulty === 'Warm-up' ? 'Warm-up' : 'Standard';
    generated.push({
      id: `q-${idx + 1}`,
      category: cat,
      difficultyTag: diffTag,
      text,
    });
    idx += 1;
  }
  return generated;
}

function buildSimulatedTranscript(question, job, language) {
  const isId = language === 'Indonesian';
  const skill = job.roleDetails?.requiredSkills?.[0] || 'Product Design';
  if (question.category === 'Behavioral') {
    return isId
      ? `Di proyek sebelumnya, tim kami harus merilis ulang alur onboarding dalam dua minggu. Saya memfasilitasi sesi sinkronisasi singkat dengan engineer, memotong langkah yang tidak esensial di Figma, dan kami berhasil meluncurkan versi baru tepat waktu.`
      : `In my previous role, our squad needed to ship a redesigned onboarding flow in two weeks. I aligned with engineering early on component reuse in ${skill}, simplified two secondary steps, and we delivered on schedule with fewer handoff revisions.`;
  }
  if (question.category === 'HR & Introduction') {
    return isId
      ? `Saya memiliki pengalaman 3–5 tahun di bidang ${skill} untuk produk digital. Saya tertarik dengan ${job.company.replace(' (Sample)', '')} karena budaya kerja remote yang terstruktur dan fokus pada kolaborasi lintas zona waktu.`
      : `I have 3–5 years of experience in ${skill} building mobile and web workflows. I’m excited about ${job.company.replace(' (Sample)', '')} because of your structured remote culture and focus on distributed collaboration.`;
  }
  return isId
    ? `Pendekatan saya dimulai dari memahami tujuan pengguna dan batasan teknis bersama PM serta engineer, lalu membuat prototipe cepat untuk divalidasi sebelum masuk ke sistem desain.`
    : `My approach starts with aligning on user goals and technical constraints with PM and engineering, building a focused prototype to validate key flows, and documenting edge cases clearly for async handoff.`;
}

function generateContextualFollowUp(userText, job, language) {
  const isId = language === 'Indonesian';
  const lower = (userText || '').toLowerCase();
  if (lower.includes('figma') || lower.includes('component') || lower.includes('design')) {
    return isId
      ? `Menarik—saat menyederhanakan komponen tersebut, bagaimana Anda memastikan perubahan itu tetap konsisten dengan design system yang sudah ada?`
      : `That’s helpful context—when you simplified those components, how did you make sure the changes stayed aligned with the existing design system?`;
  }
  if (lower.includes('engineer') || lower.includes('team') || lower.includes('aligned')) {
    return isId
      ? `Bagaimana Anda menangani jika ada perbedaan prioritas antara kebutuhan pengguna dan keterbatasan engineering?`
      : `What did you do when user needs conflicted with engineering constraints—how did you reach agreement?`;
  }
  return isId
    ? `Bisa ceritakan satu hasil konkret atau pembelajaran utama dari keputusan tersebut yang paling relevan untuk peran ${job.title}?`
    : `Could you share one concrete outcome or key takeaway from that experience that applies directly to ${job.title}?`;
}

function evaluateInterviewSession(answers, job) {
  const answered = answers.filter((a) => !a.skipped && (a.transcript || '').trim().length > 20);
  const skippedCount = answers.filter((a) => a.skipped).length;

  if (answered.length === 0) {
    return {
      hasSufficientEvidence: false,
      overallScore: null,
      overallLabel: 'Insufficient evidence',
      summary:
        'Not enough spoken responses were recorded to generate a reliable performance score. Complete at least one question to receive grounded feedback.',
      dimensions: [],
      strengths: [],
      improvements: [
        'Record at least one full answer so NEX can evaluate clarity, structure, and role alignment.',
      ],
      reviews: answers.map((a) => ({
        question: a.question,
        category: a.category,
        transcript: a.skipped ? '(Question skipped)' : a.transcript || '(No transcript recorded)',
        workedWell: 'No response recorded for this question.',
        toImprove: 'Try answering with your real project context and role-specific actions.',
        suggestedAnswer: 'Use 2–3 sentences covering the context, what you personally did, and the result.',
      })),
      practicePlan: {
        priorities: ['Complete a short 3-question Warm-up session to establish baseline feedback.'],
        exercises: ['Practice summarizing one recent project in 60 seconds (Context → Action → Result).'],
        recommendedQuestions: answers.map((a) => a.question).slice(0, 2),
        nextSession: '10-min Warm-up · Voice Mode',
      },
    };
  }

  const avgWords = Math.round(
    answered.reduce((acc, a) => acc + a.transcript.trim().split(/\s+/).length, 0) / answered.length
  );
  const hasMetrics = answered.some((a) => /\d|%|weeks|minggu|hari|users|metric/i.test(a.transcript));
  const skillMentioned = answered.some((a) =>
    (job.roleDetails?.requiredSkills || []).some((s) => a.transcript.toLowerCase().includes(s.toLowerCase().split(' ')[0]))
  );

  const relevance = skillMentioned ? 88 : 76;
  const structure = avgWords >= 25 ? 84 : 70;
  const clarity = avgWords >= 18 && avgWords <= 90 ? 86 : 74;
  const examples = answered.some((a) => /previous|role|proyek|project|team|tim/i.test(a.transcript)) ? 85 : 68;
  const conciseness = avgWords <= 75 ? 87 : 73;
  const alignment = skillMentioned ? 86 : 74;

  const overallScore = Math.round((relevance + structure + clarity + examples + conciseness + alignment) / 6);
  const overallLabel = overallScore >= 85 ? 'Strong session' : overallScore >= 75 ? 'Solid foundation' : 'Needs refinement';

  const reviews = answers.map((a) => {
    if (a.skipped) {
      return {
        question: a.question,
        category: a.category,
        transcript: '(Question skipped)',
        workedWell: 'Skipped during session.',
        toImprove: 'Prepare a short 2-sentence example so you can handle this topic calmly if asked.',
        suggestedAnswer: `Anchor your answer in one real project where you applied ${job.roleDetails?.requiredSkills?.[0] || 'your core skills'}.`,
      };
    }
    const isBehavioral = a.category === 'Behavioral';
    const hasNumbers = /\d|%/.test(a.transcript);
    return {
      question: a.question,
      category: a.category,
      transcript: a.transcript,
      workedWell: 'Clear explanation of your direct role and collaboration with engineering.',
      toImprove: hasNumbers
        ? 'You could briefly highlight the specific trade-off you considered before finalizing the solution.'
        : 'Add one concrete, observable outcome (e.g., reduced handoff friction or timeline met) without over-explaining.',
      suggestedAnswer: isBehavioral
        ? `${a.transcript} (Optional STAR polish: state the measurable impact or team outcome in your closing sentence.)`
        : `${a.transcript} Closing with how this workflow supports distributed teams at ${job.company.replace(' (Sample)', '')} will make it even sharper.`,
    };
  });

  return {
    hasSufficientEvidence: true,
    overallScore,
    overallLabel,
    summary: `You answered ${answered.length} of ${answers.length} questions${skippedCount ? ` (${skippedCount} skipped)` : ''}. Your explanations clearly communicated your role and collaboration; adding measurable outcomes will make your answers stronger.`,
    dimensions: [
      { label: 'Answer relevance', score: relevance },
      { label: 'Structure & organization', score: structure },
      { label: 'Clarity of explanation', score: clarity },
      { label: 'Use of specific examples', score: examples },
      { label: 'Conciseness', score: conciseness },
      { label: 'Alignment with job requirements', score: alignment },
    ],
    strengths: [
      `Directly referenced real collaboration and ${job.roleDetails?.requiredSkills?.[0] || 'product'} decisions in your answers.`,
      'Kept responses focused and easy to follow without rambling.',
    ],
    improvements: [
      hasMetrics
        ? 'Connect your technical trade-offs more explicitly to the employer’s remote workflow.'
        : 'Practice explaining project impact using concrete, observable outcomes.',
      skippedCount > 0
        ? `Revisit the ${skippedCount} skipped question(s) so you feel ready if they come up.`
        : 'Sharpen your closing sentence to tie your experience back to the target role.',
    ],
    reviews,
    practicePlan: {
      priorities: [
        hasMetrics
          ? 'Articulate trade-offs concisely under Realistic difficulty.'
          : 'Practice explaining project impact using measurable outcomes.',
        'Improve structure of behavioral answers (Context → Action → Result).',
      ],
      exercises: [
        'Record a 45-second summary of your strongest case study focusing on your personal contribution.',
        `Practice answering 2 ${job.title} questions in Conversation Mode to handle follow-ups.`,
      ],
      recommendedQuestions: answers.filter((a) => a.skipped || !/\d/.test(a.transcript)).map((a) => a.question).slice(0, 2),
      nextSession: `10-min ${interviewCoachState.difficulty} · Conversation Mode`,
    },
  };
}

function renderInterviewCoachRoute(animatePage) {
  const s = interviewCoachState;
  const job = getCoachActiveJob();
  const catalog = typeof sampleJobsCatalog !== 'undefined' ? sampleJobsCatalog : [];

  // ── SCREEN 1: LANDING ──
  if (s.step === 'landing') {
    return `
      <div class="oa-ai-banner rounded-[18px] p-4 space-y-3.5 ${getRevealClass(0, animatePage)}">
        <div>
          <span class="h-[20px] px-2 rounded-full bg-white/80 text-[#44658b] text-[10.5px] font-medium inline-flex items-center mb-1.5">AI Interview Coach · NEX</span>
          <h1 class="text-[19px] leading-[25px] font-medium text-[#181d27]">Feel ready for your next interview.</h1>
          <p class="text-[12.5px] leading-[18px] text-[#535862] mt-1">
            Practice real interview scenarios with NEX and get personalized feedback to help you perform at your best.
          </p>
        </div>

        <div class="bg-white/80 rounded-[14px] p-3 space-y-2 text-[12px] text-[#414651]">
          <div class="flex items-center gap-2"><span class="w-5 h-5 rounded-full bg-[#ebf2fa] text-[#355070] text-[11px] font-mono-ds flex items-center justify-center shrink-0">1</span><span>Pick a saved job or paste a job description</span></div>
          <div class="flex items-center gap-2"><span class="w-5 h-5 rounded-full bg-[#ebf2fa] text-[#355070] text-[11px] font-mono-ds flex items-center justify-center shrink-0">2</span><span>Practice by voice or dynamic conversation</span></div>
          <div class="flex items-center gap-2"><span class="w-5 h-5 rounded-full bg-[#ebf2fa] text-[#355070] text-[11px] font-mono-ds flex items-center justify-center shrink-0">3</span><span>Review transcript-grounded feedback & plan</span></div>
        </div>

        <button
          onclick="coachGoStep('select_job')"
          class="oa-press oa-ai-keylight-btn w-full h-[42px] rounded-full text-white text-[13.5px] font-medium cursor-pointer inline-flex items-center justify-center gap-1.5"
        >
          <span class="relative z-10">Start Practicing</span>
          <i data-lucide="arrow-right" class="w-4 h-4 relative z-10"></i>
        </button>
      </div>
    `;
  }

  // ── SCREEN 2: SELECT JOB ──
  if (s.step === 'select_job') {
    return `
      <div class="bg-white rounded-[18px] p-4 space-y-3 ${getRevealClass(0, animatePage)}">
        <div>
          <div class="text-[11px] text-[#44658b] font-medium">Step <span class="font-mono-ds">1</span> of <span class="font-mono-ds">2</span> · Target role</div>
          <h2 class="text-[16px] font-medium text-[#181d27]">Select job to practice for</h2>
        </div>

        <div class="bg-[#f5f6f8] rounded-full p-1 grid grid-cols-3 gap-1">
          <button onclick="coachSetJobSource('upnext')" class="oa-press h-[30px] rounded-full text-[11.5px] font-medium cursor-pointer ${s.jobSource === 'upnext' ? 'bg-white text-[#181d27]' : 'text-[#535862]'}">Saved / Jobs</button>
          <button onclick="coachSetJobSource('paste')" class="oa-press h-[30px] rounded-full text-[11.5px] font-medium cursor-pointer ${s.jobSource === 'paste' ? 'bg-white text-[#181d27]' : 'text-[#535862]'}">Paste JD</button>
          <button onclick="coachSetJobSource('url')" class="oa-press h-[30px] rounded-full text-[11.5px] font-medium cursor-pointer ${s.jobSource === 'url' ? 'bg-white text-[#181d27]' : 'text-[#535862]'}">Job URL</button>
        </div>

        ${
          s.jobSource === 'upnext'
            ? `<div class="space-y-2">
                 ${catalog
                   .slice(0, 3)
                   .map((j) => {
                     const isSel = s.selectedJobId === j.id;
                     const statusChip = typeof renderJobStatusChip === 'function' ? renderJobStatusChip(j.id) : '';
                     return `
                       <button
                         onclick="coachSelectCatalogJob('${j.id}')"
                         class="oa-press w-full p-3 rounded-[14px] text-left flex items-center justify-between gap-2 cursor-pointer ${
                           isSel ? 'bg-[#ebf2fa]' : 'bg-[#f7f8fa] hover:bg-[#f0f1f3]'
                         }"
                       >
                         <div class="min-w-0">
                           <div class="flex items-center gap-1.5">
                             <span class="text-[13px] font-medium text-[#181d27] truncate">${j.title}</span>
                             ${statusChip}
                           </div>
                           <div class="text-[11.5px] text-[#717680] truncate">${j.company} · ${numText(j.roleDetails?.experienceYears?.label || '3–5 years')}</div>
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
                     placeholder="Paste the job title, responsibilities, and required skills here..."
                     oninput="coachUpdatePastedJd(this.value)"
                     class="w-full rounded-[14px] bg-[#f5f6f8] focus:bg-white focus:ring-2 focus:ring-[#44658b]/25 p-3 text-[12px] text-[#181d27] focus:outline-none"
                   >${s.pastedJobText}</textarea>
                   <p class="text-[11px] text-[#717680]">NEX will generate questions directly from the text you provide.</p>
                 </div>`
              : typeof renderJobUrlTabHtml === 'function'
                ? renderJobUrlTabHtml('interviewCoachState', 'coachParseJobUrl', s)
                : ''
        }
      </div>
    `;
  }

  // ── SCREEN 3: INTERVIEW SETUP (Merged Question Config + Session Setup) ──
  if (s.step === 'setup' || s.step === 'prepare') {
    const allCats = ['HR & Introduction', 'Behavioral', 'Role-specific', 'Technical', 'Portfolio & Experience', 'Salary Negotiation'];
    if (s.questions.length === 0) {
      s.questions = generateCoachQuestions(job, s.categories, s.questionCount, s.language, s.difficulty);
    }
    return `
      <!-- Card 1: Question Focus & Count -->
      <div class="bg-white rounded-[18px] p-4 space-y-3.5 ${getRevealClass(0, animatePage)}">
        <div>
          <div class="text-[11px] text-[#44658b] font-medium">Step <span class="font-mono-ds">2</span> of <span class="font-mono-ds">2</span> · Configuration</div>
          <h2 class="text-[16px] font-medium text-[#181d27]">Interview setup</h2>
        </div>

        <!-- Question Focus (Radio List) -->
        <div class="space-y-1.5">
          <div class="text-[12px] font-medium text-[#181d27]">Question focus</div>
          ${allCats
            .map((cat) => {
              const active = s.categories[0] === cat;
              return `
                <button
                  onclick="coachSelectCategory('${cat}')"
                  class="oa-press w-full px-3.5 py-2 rounded-[14px] flex items-center justify-between text-left cursor-pointer ${
                    active ? 'bg-[#ebf2fa] text-[#181d27]' : 'bg-[#f7f8fa] text-[#414651] hover:bg-[#f0f1f3]'
                  }"
                >
                  <span class="text-[12.5px] ${active ? 'font-medium' : ''}">${cat}</span>
                  <span class="w-[18px] h-[18px] rounded-full shrink-0 transition-colors ${
                    active ? 'border-[5px] border-[#44658b] bg-white' : 'border-[1.5px] border-[#d0d5dd] bg-white'
                  }"></span>
                </button>
              `;
            })
            .join('')}
        </div>

        <!-- Number of questions parameter -->
        <div class="flex items-center justify-between bg-[#f7f8fa] rounded-[14px] px-3.5 py-2.5 text-[12.5px]">
          <span class="text-[#535862]">Number of questions</span>
          <div class="flex items-center gap-1.5">
            <button
              onclick="coachSetQuestionCount(${Math.max(1, s.questionCount - 1)})"
              aria-label="Decrease questions"
              class="oa-press w-7 h-7 rounded-full bg-white text-[#414651] hover:bg-[#ebf2fa] text-[14px] flex items-center justify-center cursor-pointer"
            >−</button>
            <input
              type="number"
              min="1"
              max="10"
              value="${s.questionCount}"
              onchange="coachSetQuestionCount(this.value)"
              class="w-11 h-7 rounded-full bg-white text-center text-[12.5px] font-mono-ds text-[#181d27] focus:outline-none focus:ring-2 focus:ring-[#44658b]/25"
            />
            <button
              onclick="coachSetQuestionCount(${Math.min(10, s.questionCount + 1)})"
              aria-label="Increase questions"
              class="oa-press w-7 h-7 rounded-full bg-white text-[#414651] hover:bg-[#ebf2fa] text-[14px] flex items-center justify-center cursor-pointer"
            >+</button>
          </div>
        </div>
      </div>

      <!-- Card 2: Interview Style -->
      <div class="bg-white rounded-[18px] p-4 space-y-2.5 ${getRevealClass(1, animatePage)}">
        <div class="text-[13px] font-medium text-[#181d27]">Interview style</div>
        <button
          onclick="coachSetField('mode', 'voice')"
          class="oa-press w-full p-3 rounded-[14px] text-left flex items-start justify-between gap-2.5 cursor-pointer ${s.mode === 'voice' ? 'bg-[#ebf2fa]' : 'bg-[#f7f8fa]'}"
        >
          <div class="space-y-0.5">
            <div class="text-[13px] font-medium text-[#181d27]">Voice Mode</div>
            <p class="text-[11.5px] text-[#535862]">NEX asks one question at a time. Speak your answer for live transcription and post-session review.</p>
          </div>
          <span class="w-[18px] h-[18px] rounded-full shrink-0 mt-0.5 transition-colors ${s.mode === 'voice' ? 'border-[5px] border-[#44658b] bg-white' : 'border-[1.5px] border-[#d0d5dd] bg-white'}"></span>
        </button>
        <button
          onclick="coachSetField('mode', 'conversation')"
          class="oa-press w-full p-3 rounded-[14px] text-left flex items-start justify-between gap-2.5 cursor-pointer ${s.mode === 'conversation' ? 'bg-[#ebf2fa]' : 'bg-[#f7f8fa]'}"
        >
          <div class="space-y-0.5">
            <div class="text-[13px] font-medium text-[#181d27]">Conversation Mode</div>
            <p class="text-[11.5px] text-[#535862]">Dynamic back-and-forth interview where NEX generates contextual follow-ups from your answers.</p>
          </div>
          <span class="w-[18px] h-[18px] rounded-full shrink-0 mt-0.5 transition-colors ${s.mode === 'conversation' ? 'border-[5px] border-[#44658b] bg-white' : 'border-[1.5px] border-[#d0d5dd] bg-white'}"></span>
        </button>
      </div>

      <!-- Card 3: Session Parameters & Summary -->
      <div class="bg-white rounded-[18px] p-4 space-y-4 ${getRevealClass(2, animatePage)}">
        <div class="space-y-3 text-[12px]">
          <div class="flex items-center justify-between">
            <span class="text-[#535862]">Language</span>
            <div class="flex gap-1.5">
              ${['English', 'Indonesian']
                .map((lang) => `<button onclick="coachSetLanguage('${lang}')" class="oa-press h-[28px] px-3 rounded-full cursor-pointer ${s.language === lang ? 'bg-[#44658b] text-white' : 'bg-[#f5f6f8] text-[#414651]'}">${lang}</button>`)
                .join('')}
            </div>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[#535862]">Duration</span>
            <div class="flex gap-1.5">
              ${[10, 20, 30]
                .map((d) => `<button onclick="coachSetField('durationMinutes', ${d})" class="oa-press h-[28px] px-3 rounded-full font-mono-ds cursor-pointer ${s.durationMinutes === d ? 'bg-[#44658b] text-white' : 'bg-[#f5f6f8] text-[#414651]'}">${d}m</button>`)
                .join('')}
            </div>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[#535862]">Difficulty</span>
            <div class="flex gap-1.5">
              ${['Warm-up', 'Realistic', 'Challenging']
                .map((dif) => `<button onclick="coachSetField('difficulty', '${dif}')" class="oa-press h-[28px] px-2.5 rounded-full cursor-pointer ${s.difficulty === dif ? 'bg-[#44658b] text-white' : 'bg-[#f5f6f8] text-[#414651]'}">${dif}</button>`)
                .join('')}
            </div>
          </div>
        </div>

        <div class="bg-[#f4f8fc] rounded-[14px] p-3 text-[12px] space-y-1">
          <div class="font-medium text-[#355070]">Session summary</div>
          <div class="text-[#414651]">${job.title} · ${s.mode === 'voice' ? 'Voice Mode' : 'Conversation Mode'} · ${s.language} · ${numText(String(s.questionCount))} questions (${numText(String(s.durationMinutes))}m, ${s.difficulty})</div>
        </div>
      </div>
    `;
  }

  // ── SCREEN 5: INTERVIEW SESSION (NO SCORES SHOWN DURING SESSION) ──
  if (s.step === 'session') {
    const mins = String(Math.floor(s.elapsedSeconds / 60)).padStart(2, '0');
    const secs = String(s.elapsedSeconds % 60).padStart(2, '0');
    const totalSecs = s.durationMinutes * 60;
    const rem = Math.max(0, totalSecs - s.elapsedSeconds);
    const remM = String(Math.floor(rem / 60)).padStart(2, '0');
    const remS = String(rem % 60).padStart(2, '0');
    const currentQ = s.questions[s.currentQuestionIdx] || s.questions[0];

    const stateLabel =
      s.isPaused
        ? 'Paused'
        : s.sessionPhase === 'listening'
          ? 'Listening to your voice...'
          : s.sessionPhase === 'processing'
            ? 'NEX is processing...'
            : s.sessionPhase === 'speaking'
              ? 'NEX is speaking...'
              : 'Tap mic to speak';

    return `
      <div class="bg-white rounded-[18px] p-4 space-y-3.5 ${getRevealClass(0, animatePage)}">
        <!-- Session Top Bar -->
        <div class="flex items-center justify-between gap-2 pb-2 border-b border-[#edeef1]">
          <div>
            <div class="text-[11px] text-[#44658b] font-medium">${s.mode === 'voice' ? 'Voice Mode' : 'Conversation Mode'} · ${s.difficulty}</div>
            <div class="text-[12.5px] font-medium text-[#181d27]">
              Question <span class="font-mono-ds">${Math.min(s.currentQuestionIdx + 1, s.questions.length)}</span> of <span class="font-mono-ds">${s.questions.length}</span>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="h-[26px] px-2.5 rounded-full bg-[#f5f6f8] text-[#181d27] text-[11.5px] font-mono-ds inline-flex items-center">
              ${remM}:${remS}
            </span>
            <button onclick="coachTogglePause()" class="oa-press h-[26px] px-2.5 rounded-full bg-[#ebf2fa] text-[#355070] text-[11px] cursor-pointer">
              ${s.isPaused ? 'Resume' : 'Pause'}
            </button>
          </div>
        </div>

        <!-- Prototype Voice Notice -->
        <div class="bg-[#f7f8fa] rounded-[12px] px-3 py-1.5 text-[11px] text-[#717680] flex items-center justify-between">
          <span>Prototype voice simulation (${mins}:${secs} elapsed)</span>
          <button onclick="coachToggleConnectionError()" class="text-[#44658b] cursor-pointer">Test reconnect</button>
        </div>

        ${
          s.connectionError
            ? `<div class="bg-[#fef3f2] rounded-[14px] p-3 space-y-2 text-[12px] text-[#b42318]">
                 <div class="font-medium">Connection interrupted</div>
                 <p>Audio stream dropped momentarily. Your previous answers are saved.</p>
                 <button onclick="coachRecoverConnection()" class="oa-press h-[30px] px-3 rounded-full bg-[#b42318] text-white text-[11.5px] cursor-pointer">Reconnect</button>
               </div>`
            : ''
        }

        ${
          s.micPermission === 'denied'
            ? `<div class="bg-[#fffaeb] rounded-[14px] p-3 space-y-2 text-[12px] text-[#b54708]">
                 <div class="font-medium">Microphone access needed</div>
                 <p>Allow microphone permission in your browser, or use simulated voice input for this prototype.</p>
                 <button onclick="coachGrantMic()" class="oa-press h-[30px] px-3 rounded-full bg-[#44658b] text-white text-[11.5px] cursor-pointer">Enable voice input</button>
               </div>`
            : ''
        }

        ${
          s.mode === 'voice'
            ? `
          <!-- VOICE MODE -->
          <div class="oa-ai-banner rounded-[16px] p-4 space-y-2">
            <div class="flex items-center gap-2">
              <img src="./bosshire-ai-blob.png" alt="NEX" class="nex-orb w-5 h-5 rounded-full" />
              <span class="text-[11px] font-medium text-[#355070]">${currentQ.category}</span>
            </div>
            <p class="text-[14.5px] leading-[21px] font-medium text-[#181d27]">${currentQ.text}</p>
          </div>

          <div class="bg-[#f7f8fa] rounded-[14px] p-3.5 min-h-[84px] space-y-1">
            <div class="text-[11px] text-[#717680]">Live transcript</div>
            <p class="text-[12.5px] leading-[18px] text-[#181d27]">
              ${s.liveTranscript || '<span class="text-[#a4a7ae]">Your spoken response will appear here...</span>'}
            </p>
          </div>
        `
            : `
          <!-- CONVERSATION MODE -->
          <div class="space-y-2 max-h-[240px] overflow-y-auto no-scrollbar pr-0.5">
            ${s.conversationLog
              .map(
                (msg) => `
              <div class="flex ${msg.role === 'user' ? 'justify-end' : 'justify-start items-start gap-2'}">
                ${msg.role === 'nex' ? '<img src="./bosshire-ai-blob.png" alt="NEX" class="nex-orb w-5 h-5 rounded-full shrink-0 mt-1" />' : ''}
                <div class="max-w-[84%] rounded-[14px] px-3 py-2 text-[12px] leading-[18px] ${
                  msg.role === 'user' ? 'bg-[#44658b] text-white' : 'bg-[#ebf2fa] text-[#181d27]'
                }">
                  ${msg.tag ? `<div class="text-[10px] opacity-75 mb-0.5">${msg.tag}</div>` : ''}
                  ${msg.text}
                </div>
              </div>
            `
              )
              .join('')}
          </div>

          ${
            s.liveTranscript
              ? `<div class="bg-[#f7f8fa] rounded-[12px] p-2.5 text-[12px] text-[#414651]">
                   <span class="text-[#717680] text-[10.5px] block">Transcribing...</span>
                   ${s.liveTranscript}
                 </div>`
              : ''
          }
        `
        }
      </div>
    `;
  }

  // ── SCREEN 6: SESSION COMPLETED ──
  if (s.step === 'completed') {
    const answeredCount = s.answers.filter((a) => !a.skipped).length;
    const skippedCount = s.answers.filter((a) => a.skipped).length;
    const mins = String(Math.floor(s.elapsedSeconds / 60)).padStart(2, '0');
    const secs = String(s.elapsedSeconds % 60).padStart(2, '0');

    return `
      <div class="bg-white rounded-[18px] p-5 space-y-4 text-center ${getRevealClass(0, animatePage)}">
        <div class="w-12 h-12 rounded-full bg-[#ecfdf3] text-[#027a48] flex items-center justify-center mx-auto">
          <i data-lucide="check" class="w-5 h-5"></i>
        </div>
        <div>
          <h2 class="text-[18px] font-medium text-[#181d27]">Session completed</h2>
          <p class="text-[12.5px] text-[#535862] mt-1">Great effort practicing for ${job.title} at ${job.company}.</p>
        </div>

        <div class="bg-[#f7f8fa] rounded-[14px] p-3.5 grid grid-cols-3 gap-2 text-center">
          <div>
            <div class="text-[15px] font-medium font-mono-ds text-[#181d27]">${mins}:${secs}</div>
            <div class="text-[11px] text-[#717680]">Duration</div>
          </div>
          <div>
            <div class="text-[15px] font-medium font-mono-ds text-[#027a48]">${answeredCount}</div>
            <div class="text-[11px] text-[#717680]">Answered</div>
          </div>
          <div>
            <div class="text-[15px] font-medium font-mono-ds text-[#b54708]">${skippedCount}</div>
            <div class="text-[11px] text-[#717680]">Skipped</div>
          </div>
        </div>

        <div class="bg-[#ebf2fa] rounded-[14px] p-3 text-left flex items-start gap-2.5">
          <img src="./bosshire-ai-blob.png" alt="NEX" class="nex-orb w-5 h-5 rounded-full shrink-0 mt-0.5" />
          <p class="text-[12px] leading-[18px] text-[#181d27]">
            ${
              answeredCount > 0
                ? 'Nice work! I’ve reviewed your responses and highlighted what worked well plus concrete ways to sharpen your next answer.'
                : 'No responses were recorded this time. Open your feedback summary for tips on getting started.'
            }
          </p>
        </div>

        <button onclick="coachViewFeedback()" class="oa-press oa-ai-keylight-btn w-full h-[42px] rounded-full text-white text-[13.5px] font-medium cursor-pointer">
          <span class="relative z-10">View My Feedback →</span>
        </button>
      </div>
    `;
  }

  // ── SCREEN 7: INTERVIEW FEEDBACK ──
  if (s.step === 'feedback') {
    const ev = s.evaluation || evaluateInterviewSession(s.answers, job);
    return `
      <!-- Overall Performance -->
      <div class="oa-ai-banner rounded-[18px] p-4 space-y-3 ${getRevealClass(0, animatePage)}">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <img src="./bosshire-ai-blob.png" alt="NEX" class="nex-orb w-7 h-7 rounded-full" />
            <div>
              <h2 class="text-[15.5px] font-medium text-[#181d27]">Interview Feedback</h2>
              <div class="text-[11.5px] text-[#535862]">${ev.overallLabel}</div>
            </div>
          </div>
          ${
            ev.hasSufficientEvidence
              ? `<div class="text-right">
                   <div class="text-[20px] font-medium font-mono-ds text-[#181d27]">${ev.overallScore}%</div>
                   <div class="text-[10.5px] text-[#027a48]">Transcript score</div>
                 </div>`
              : `<span class="h-[22px] px-2.5 rounded-full bg-[#fffaeb] text-[#b54708] text-[10.5px] inline-flex items-center">No score yet</span>`
          }
        </div>
        <p class="text-[12px] leading-[18px] text-[#282828]">${numText(ev.summary)}</p>
      </div>

      ${
        ev.dimensions.length > 0
          ? `<div class="bg-white rounded-[18px] p-4 space-y-2.5 ${getRevealClass(1, animatePage)}">
               <h3 class="text-[14.5px] font-medium text-[#181d27]">Performance dimensions</h3>
               <div class="space-y-2">
                 ${ev.dimensions
                   .map(
                     (d) => `
                   <div class="space-y-1">
                     <div class="flex justify-between text-[12px]">
                       <span class="text-[#414651]">${d.label}</span>
                       <span class="font-mono-ds font-medium text-[#181d27]">${d.score}%</span>
                     </div>
                     <div class="h-1.5 w-full rounded-full bg-[#edeef1] overflow-hidden">
                       <div class="h-full rounded-full bg-[#44658b]" style="width: ${d.score}%"></div>
                     </div>
                   </div>
                 `
                   )
                   .join('')}
               </div>
             </div>`
          : ''
      }

      <!-- Strengths & Areas to Improve -->
      <div class="bg-white rounded-[18px] p-4 space-y-3 ${getRevealClass(2, animatePage)}">
        ${
          ev.strengths.length > 0
            ? `<div class="space-y-1">
                 <div class="text-[13px] font-medium text-[#027a48]">Strengths</div>
                 <ul class="space-y-1 text-[12px] leading-[18px] text-[#414651] list-disc pl-4">
                   ${ev.strengths.map((st) => `<li>${st}</li>`).join('')}
                 </ul>
               </div>`
            : ''
        }
        <div class="space-y-1 ${ev.strengths.length > 0 ? 'pt-2 border-t border-[#edeef1]' : ''}">
          <div class="text-[13px] font-medium text-[#b54708]">Areas to improve</div>
          <ul class="space-y-1 text-[12px] leading-[18px] text-[#414651] list-disc pl-4">
            ${ev.improvements.map((im) => `<li>${im}</li>`).join('')}
          </ul>
        </div>
      </div>

      <!-- Question-by-Question Review (Expandable) -->
      <div class="bg-white rounded-[18px] p-4 space-y-2.5 ${getRevealClass(3, animatePage)}">
        <h3 class="text-[14.5px] font-medium text-[#181d27]">Question-by-question review</h3>
        ${ev.reviews
          .map((rev, idx) => {
            const isOpen = s.expandedReviewIdx === idx;
            return `
              <div class="bg-[#f7f8fa] rounded-[14px] p-3 space-y-2">
                <button onclick="coachToggleReview(${idx})" class="w-full flex items-start justify-between gap-2 text-left cursor-pointer">
                  <div>
                    <div class="text-[10.5px] text-[#44658b] font-medium">Q<span class="font-mono-ds">${idx + 1}</span> · ${rev.category}</div>
                    <div class="text-[12.5px] font-medium text-[#181d27]">${rev.question}</div>
                  </div>
                  <i data-lucide="${isOpen ? 'chevron-up' : 'chevron-down'}" class="w-4 h-4 text-[#717680] shrink-0 mt-1"></i>
                </button>
                ${
                  isOpen
                    ? `<div class="space-y-2 pt-2 border-t border-[#edeef1] text-[12px]">
                         <div><span class="font-medium text-[#181d27]">Your transcript:</span> <span class="text-[#535862]">${rev.transcript}</span></div>
                         <div class="text-[#027a48]"><span class="font-medium">What worked:</span> ${rev.workedWell}</div>
                         <div class="text-[#b54708]"><span class="font-medium">To improve:</span> ${rev.toImprove}</div>
                         <div class="bg-white rounded-[10px] p-2.5 text-[#414651]">
                           <div class="text-[10.5px] font-medium text-[#44658b] mb-0.5">Suggested improved answer</div>
                           ${rev.suggestedAnswer}
                         </div>
                       </div>`
                    : ''
                }
              </div>
            `;
          })
          .join('')}
      </div>
    `;
  }

  // ── SCREEN 8: PERSONALIZED PRACTICE ──
  const ev = s.evaluation || evaluateInterviewSession(s.answers, job);
  const plan = ev.practicePlan;
  return `
    <div class="oa-ai-iridescent rounded-[18px] p-4 space-y-3 ${getRevealClass(0, animatePage)}">
      <div class="flex items-center gap-2">
        <img src="./bosshire-ai-blob.png" alt="NEX" class="nex-orb w-6 h-6 rounded-full" />
        <div>
          <h2 class="text-[16px] font-medium text-[#181d27]">Personalized Practice Plan</h2>
          <p class="text-[11.5px] text-[#535862]">Tailored from your ${job.title} session.</p>
        </div>
      </div>

      <div class="bg-white/85 rounded-[14px] p-3.5 space-y-1.5">
        <div class="text-[12px] font-medium text-[#355070]">Top improvement priorities</div>
        <ul class="space-y-1 text-[12px] leading-[18px] text-[#181d27] list-disc pl-4">
          ${plan.priorities.map((p) => `<li>${p}</li>`).join('')}
        </ul>
      </div>

      <div class="bg-white/85 rounded-[14px] p-3.5 space-y-1.5">
        <div class="text-[12px] font-medium text-[#355070]">Specific exercises</div>
        <ul class="space-y-1 text-[12px] leading-[18px] text-[#414651] list-disc pl-4">
          ${plan.exercises.map((ex) => `<li>${numText(ex)}</li>`).join('')}
        </ul>
      </div>

      <div class="bg-white/85 rounded-[14px] p-3.5 space-y-1 text-[12px]">
        <div class="font-medium text-[#355070]">Suggested next session</div>
        <div class="text-[#181d27]">${numText(plan.nextSession)}</div>
      </div>

      <div class="space-y-2 pt-1">
        <button onclick="coachRetryWeakQuestions()" class="oa-press oa-ai-keylight-btn w-full h-[40px] rounded-full text-white text-[13px] font-medium cursor-pointer">
          <span class="relative z-10">Retry Weak Questions</span>
        </button>
        <div class="flex gap-2">
          <button onclick="coachGoStep('prepare')" class="oa-press flex-1 h-[38px] rounded-full bg-white text-[#181d27] text-[12.5px] cursor-pointer">Practice Again</button>
          <button onclick="coachGoStep('landing')" class="oa-press flex-1 h-[38px] rounded-full bg-white text-[#44658b] text-[12.5px] cursor-pointer">Back to Coach</button>
        </div>
      </div>
    </div>
  `;
}

// ── Interactive Handlers ──
function refreshInterviewCoachUI() {
  if (typeof updateActiveScreenDOM === 'function') {
    updateActiveScreenDOM(false);
  }
}

window.coachGoStep = function (step) {
  if (interviewCoachState.timerId) {
    clearInterval(interviewCoachState.timerId);
    interviewCoachState.timerId = null;
  }
  interviewCoachState.step = step;
  refreshInterviewCoachUI();
};

window.coachSetJobSource = function (src) {
  interviewCoachState.jobSource = src;
  interviewCoachState.urlParseError = '';
  refreshInterviewCoachUI();
};

window.coachSelectCatalogJob = function (jobId) {
  interviewCoachState.selectedJobId = jobId;
  refreshInterviewCoachUI();
};

window.coachUpdatePastedJd = function (text) {
  interviewCoachState.pastedJobText = text;
  const firstLine = (text || '').split('\n')[0].trim().slice(0, 48);
  interviewCoachState.customJob = {
    id: 'custom-jd',
    title: firstLine || 'Custom Target Role',
    company: 'Pasted Job Description',
    roleDetails: {
      experienceYears: { label: 'Based on pasted JD' },
      requiredSkills: ['Role-specific skills', 'Communication'],
    },
    companyInfo: { industry: 'Custom listing' },
  };
};

window.coachParseJobUrl = function () {
  if (typeof startSharedUrlCheck === 'function') {
    startSharedUrlCheck(interviewCoachState, refreshInterviewCoachUI);
  }
};

window.coachPrepareQuestionsAndNext = function () {
  const job = getCoachActiveJob();
  interviewCoachState.questions = generateCoachQuestions(
    job,
    interviewCoachState.categories,
    interviewCoachState.questionCount,
    interviewCoachState.language,
    interviewCoachState.difficulty
  );
  interviewCoachState.step = 'setup';
  refreshInterviewCoachUI();
};

window.coachSelectCategory = function (cat) {
  interviewCoachState.categories = [cat];
  coachRegenerateAllQuestions();
};

window.coachToggleCategory = function (cat) {
  interviewCoachState.categories = [cat];
  coachRegenerateAllQuestions();
};

window.coachSetQuestionCount = function (n) {
  const parsed = Math.min(10, Math.max(1, parseInt(n, 10) || 3));
  interviewCoachState.questionCount = parsed;
  coachRegenerateAllQuestions();
};

window.coachRegenerateAllQuestions = function () {
  const job = getCoachActiveJob();
  interviewCoachState.questions = generateCoachQuestions(
    job,
    interviewCoachState.categories,
    interviewCoachState.questionCount,
    interviewCoachState.language,
    interviewCoachState.difficulty
  );
  refreshInterviewCoachUI();
};

window.coachRegenerateSingleQuestion = function (idx) {
  const job = getCoachActiveJob();
  const alt = generateCoachQuestions(job, interviewCoachState.categories, interviewCoachState.questionCount + 2, interviewCoachState.language, interviewCoachState.difficulty);
  if (interviewCoachState.questions[idx]) {
    const replacement = alt[(idx + 1) % alt.length];
    interviewCoachState.questions[idx] = { ...interviewCoachState.questions[idx], text: replacement.text };
  }
  refreshInterviewCoachUI();
};

window.coachStartEditQuestion = function (idx) {
  interviewCoachState.editingQuestionIdx = idx;
  interviewCoachState.editingQuestionText = interviewCoachState.questions[idx]?.text || '';
  refreshInterviewCoachUI();
};

window.coachSaveEditQuestion = function (idx) {
  if (interviewCoachState.questions[idx] && interviewCoachState.editingQuestionText.trim()) {
    interviewCoachState.questions[idx].text = interviewCoachState.editingQuestionText.trim();
  }
  interviewCoachState.editingQuestionIdx = null;
  refreshInterviewCoachUI();
};

window.coachSetField = function (field, val) {
  interviewCoachState[field] = val;
  refreshInterviewCoachUI();
};

window.coachSetLanguage = function (lang) {
  interviewCoachState.language = lang;
  const job = getCoachActiveJob();
  interviewCoachState.questions = generateCoachQuestions(
    job,
    interviewCoachState.categories,
    interviewCoachState.questionCount,
    lang,
    interviewCoachState.difficulty
  );
  refreshInterviewCoachUI();
};

window.coachStartSession = function () {
  const job = getCoachActiveJob();
  if (interviewCoachState.questions.length === 0) {
    interviewCoachState.questions = generateCoachQuestions(
      job,
      interviewCoachState.categories,
      interviewCoachState.questionCount,
      interviewCoachState.language,
      interviewCoachState.difficulty
    );
  }
  interviewCoachState.currentQuestionIdx = 0;
  interviewCoachState.elapsedSeconds = 0;
  interviewCoachState.isPaused = false;
  interviewCoachState.connectionError = false;
  interviewCoachState.endConfirmOpen = false;
  interviewCoachState.sessionPhase = 'idle';
  interviewCoachState.liveTranscript = '';
  interviewCoachState.answers = [];
  const firstQ = interviewCoachState.questions[0];
  interviewCoachState.conversationLog = [
    { role: 'nex', tag: `${firstQ.category}`, text: firstQ.text },
  ];
  interviewCoachState.step = 'session';
  if (interviewCoachState.timerId) clearInterval(interviewCoachState.timerId);
  interviewCoachState.timerId = setInterval(() => {
    if (interviewCoachState.step === 'session' && !interviewCoachState.isPaused) {
      interviewCoachState.elapsedSeconds += 1;
      refreshInterviewCoachUI();
    }
  }, 1000);
  refreshInterviewCoachUI();
};

window.coachTogglePause = function () {
  interviewCoachState.isPaused = !interviewCoachState.isPaused;
  refreshInterviewCoachUI();
};

window.coachToggleConnectionError = function () {
  interviewCoachState.connectionError = true;
  interviewCoachState.sessionPhase = 'idle';
  refreshInterviewCoachUI();
};

window.coachRecoverConnection = function () {
  interviewCoachState.connectionError = false;
  refreshInterviewCoachUI();
};

window.coachGrantMic = function () {
  interviewCoachState.micPermission = 'granted';
  refreshInterviewCoachUI();
};

window.coachHandleMicTap = function () {
  const s = interviewCoachState;
  const job = getCoachActiveJob();
  const q = s.questions[s.currentQuestionIdx] || s.questions[0];

  if (s.sessionPhase === 'idle') {
    s.sessionPhase = 'listening';
    s.liveTranscript = buildSimulatedTranscript(q, job, s.language);
    refreshInterviewCoachUI();
    return;
  }

  if (s.sessionPhase === 'listening') {
    const finalTranscript = s.liveTranscript || buildSimulatedTranscript(q, job, s.language);
    s.sessionPhase = 'processing';
    refreshInterviewCoachUI();

    setTimeout(() => {
      s.answers.push({
        questionId: q.id,
        question: q.text,
        category: q.category,
        transcript: finalTranscript,
        skipped: false,
      });

      if (s.mode === 'conversation') {
        s.conversationLog.push({ role: 'user', text: finalTranscript });
        const followUp = generateContextualFollowUp(finalTranscript, job, s.language);
        s.conversationLog.push({ role: 'nex', tag: 'Follow-up', text: followUp });
        s.sessionPhase = 'idle';
        s.liveTranscript = '';
        if (s.currentQuestionIdx < s.questions.length - 1) {
          s.currentQuestionIdx += 1;
        }
        refreshInterviewCoachUI();
      } else {
        s.liveTranscript = '';
        s.sessionPhase = 'idle';
        if (s.currentQuestionIdx < s.questions.length - 1) {
          s.currentQuestionIdx += 1;
          refreshInterviewCoachUI();
        } else {
          coachFinishSession();
        }
      }
    }, 550);
  }
};

window.coachSkipQuestion = function () {
  const s = interviewCoachState;
  const q = s.questions[s.currentQuestionIdx];
  if (q) {
    s.answers.push({
      questionId: q.id,
      question: q.text,
      category: q.category,
      transcript: '',
      skipped: true,
    });
  }
  s.liveTranscript = '';
  s.sessionPhase = 'idle';
  if (s.currentQuestionIdx < s.questions.length - 1) {
    s.currentQuestionIdx += 1;
    refreshInterviewCoachUI();
  } else {
    coachFinishSession();
  }
};

window.coachNextConversationTopic = function () {
  const s = interviewCoachState;
  if (s.currentQuestionIdx < s.questions.length - 1) {
    s.currentQuestionIdx += 1;
    const nextQ = s.questions[s.currentQuestionIdx];
    s.conversationLog.push({ role: 'nex', tag: nextQ.category, text: nextQ.text });
    refreshInterviewCoachUI();
  } else {
    coachFinishSession();
  }
};

function updateCoachEndConfirmLayer() {
  const layer = document.getElementById('coach-end-confirm-layer');
  if (layer) {
    layer.innerHTML = renderCoachEndConfirmSheet();
    if (typeof hydrateIcons === 'function') hydrateIcons(layer);
  } else {
    refreshInterviewCoachUI();
  }
}

window.coachRequestEnd = function () {
  interviewCoachState.endConfirmOpen = true;
  updateCoachEndConfirmLayer();
};

window.coachCancelEnd = function () {
  interviewCoachState.endConfirmOpen = false;
  updateCoachEndConfirmLayer();
};

window.coachFinishSession = function () {
  const s = interviewCoachState;
  if (s.timerId) {
    clearInterval(s.timerId);
    s.timerId = null;
  }
  s.endConfirmOpen = false;
  const layer = document.getElementById('coach-end-confirm-layer');
  if (layer) layer.innerHTML = '';
  const job = getCoachActiveJob();
  s.evaluation = evaluateInterviewSession(s.answers, job);
  s.step = 'completed';
  refreshInterviewCoachUI();
};

window.coachViewFeedback = function () {
  interviewCoachState.expandedReviewIdx = 0;
  interviewCoachState.step = 'feedback';
  refreshInterviewCoachUI();
};

window.coachToggleReview = function (idx) {
  interviewCoachState.expandedReviewIdx = interviewCoachState.expandedReviewIdx === idx ? -1 : idx;
  refreshInterviewCoachUI();
};

window.coachLoadSampleFeedback = function (sessId) {
  const job = getCoachActiveJob();
  const sampleQs = generateCoachQuestions(job, ['Behavioral', 'Role-specific'], 3, 'English', 'Realistic');
  interviewCoachState.answers = sampleQs.map((q) => ({
    questionId: q.id,
    question: q.text,
    category: q.category,
    transcript: buildSimulatedTranscript(q, job, 'English'),
    skipped: false,
  }));
  interviewCoachState.evaluation = evaluateInterviewSession(interviewCoachState.answers, job);
  interviewCoachState.expandedReviewIdx = 0;
  interviewCoachState.step = 'feedback';
  refreshInterviewCoachUI();
};

window.coachRetryWeakQuestions = function () {
  const job = getCoachActiveJob();
  const weak = interviewCoachState.evaluation?.practicePlan?.recommendedQuestions || [];
  if (weak.length > 0) {
    interviewCoachState.questions = weak.map((text, idx) => ({
      id: `retry-${idx + 1}`,
      category: 'Targeted practice',
      difficultyTag: 'Retry',
      text,
    }));
  } else {
    interviewCoachState.questions = generateCoachQuestions(job, interviewCoachState.categories, 2, interviewCoachState.language, interviewCoachState.difficulty);
  }
  interviewCoachState.step = 'prepare';
  refreshInterviewCoachUI();
};

function renderCoachStickyFooter() {
  const step = interviewCoachState.step;
  if (step === 'select_job') {
    return `
      <div class="sticky bottom-0 z-20 bg-[#f5f6f8]/95 backdrop-blur-md px-3 pt-2.5 pb-4 border-t border-[#edeef1] flex items-center gap-2 shrink-0">
        <button onclick="coachGoStep('landing')" class="oa-press h-[42px] px-4 rounded-full bg-white text-[#181d27] text-[13px] cursor-pointer">Back</button>
        <button onclick="coachPrepareQuestionsAndNext()" class="oa-press flex-1 h-[42px] rounded-full bg-[#44658b] hover:bg-[#355070] text-white text-[13.5px] font-medium cursor-pointer">
          Interview Setup →
        </button>
      </div>
    `;
  }
  if (step === 'setup' || step === 'prepare') {
    return `
      <div class="sticky bottom-0 z-20 bg-[#f5f6f8]/95 backdrop-blur-md px-3 pt-2.5 pb-4 border-t border-[#edeef1] flex items-center gap-2 shrink-0">
        <button onclick="coachGoStep('select_job')" class="oa-press h-[42px] px-4 rounded-full bg-white text-[#181d27] text-[13px] cursor-pointer">Back</button>
        <button onclick="coachStartSession()" class="oa-press oa-ai-keylight-btn flex-1 h-[42px] rounded-full text-white text-[13.5px] font-medium cursor-pointer">
          <span class="relative z-10">Start Interview →</span>
        </button>
      </div>
    `;
  }
  if (step === 'session') {
    const s = interviewCoachState;
    const stateLabel = s.isPaused
      ? 'Paused'
      : s.sessionPhase === 'listening'
        ? 'Listening to your voice...'
        : s.sessionPhase === 'processing'
          ? 'NEX is processing...'
          : s.sessionPhase === 'speaking'
            ? 'NEX is speaking...'
            : 'Tap mic to speak';

    return `
      <div class="sticky bottom-0 z-20 bg-[#f5f6f8]/95 backdrop-blur-md px-3 pt-3 pb-4 border-t border-[#edeef1] shrink-0">
        <div class="grid grid-cols-3 items-center gap-2">
          <div class="flex justify-start">
            ${
              s.mode === 'voice'
                ? `<button onclick="coachSkipQuestion()" class="oa-press h-[34px] px-3 rounded-full bg-white text-[#535862] text-[12px] cursor-pointer">Skip</button>`
                : `<button onclick="coachNextConversationTopic()" class="oa-press h-[34px] px-3 rounded-full bg-white text-[#535862] text-[12px] cursor-pointer">Next topic</button>`
            }
          </div>
          <div class="flex flex-col items-center gap-1.5">
            <button
              onclick="coachHandleMicTap()"
              ${s.isPaused || s.sessionPhase === 'processing' || s.sessionPhase === 'speaking' ? 'disabled' : ''}
              class="oa-press w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                s.sessionPhase === 'listening'
                  ? 'bg-[#f04438] text-white shadow-[0_0_0_6px_rgba(240,68,56,0.16)]'
                  : 'oa-ai-keylight-btn text-white'
              }"
              aria-label="Microphone"
            >
              <i data-lucide="${s.sessionPhase === 'listening' ? 'square' : 'mic'}" class="w-5 h-5 relative z-10"></i>
            </button>
            <span class="text-[11px] text-[#535862] whitespace-nowrap">${stateLabel}</span>
          </div>
          <div class="flex justify-end">
            <button onclick="coachRequestEnd()" class="oa-press h-[34px] px-3 rounded-full bg-[#fef3f2] text-[#b42318] text-[12px] font-medium cursor-pointer">
              End
            </button>
          </div>
        </div>
      </div>
    `;
  }
  if (step === 'feedback') {
    return `
      <div class="sticky bottom-0 z-20 bg-[#f5f6f8]/95 backdrop-blur-md px-3 pt-2.5 pb-4 border-t border-[#edeef1] flex items-center gap-2 shrink-0">
        <button onclick="coachGoStep('practice')" class="oa-press flex-1 h-[42px] rounded-full bg-[#44658b] hover:bg-[#355070] text-white text-[13.5px] font-medium cursor-pointer">
          View Personalized Practice Plan →
        </button>
      </div>
    `;
  }
  return '';
}

function renderCoachEndConfirmSheet() {
  if (!interviewCoachState.endConfirmOpen) return '';
  const s = interviewCoachState;
  const answeredCount = s.answers.filter((a) => !a.skipped).length;
  return `
    <div class="oa-drawer-overlay absolute inset-0 z-40 bg-[#101828]/45 backdrop-blur-[2px] flex items-end justify-center" onclick="coachCancelEnd()">
      <div class="oa-sheet-up w-full bg-[#fdfdfd] rounded-t-[24px] px-5 pt-3 pb-6 space-y-4 shadow-[0_-16px_48px_-12px_rgba(16,24,40,0.22)]" onclick="event.stopPropagation()">
        <div class="w-10 h-1 rounded-full bg-[#d0d5dd] mx-auto"></div>
        <div class="space-y-1">
          <h3 class="text-[16px] font-medium text-[#181d27]">End interview session?</h3>
          <p class="text-[12.5px] leading-[18px] text-[#535862]">
            You’ve answered ${numText(String(answeredCount))} of ${numText(String(s.questions.length))} questions so far. You’ll still receive feedback based on your recorded responses.
          </p>
        </div>
        <div class="flex items-center gap-2 pt-1">
          <button onclick="coachCancelEnd()" class="oa-press flex-1 h-[40px] rounded-full bg-[#f0f1f3] hover:bg-[#e6e8eb] text-[#181d27] text-[13px] cursor-pointer">
            Keep practicing
          </button>
          <button onclick="coachFinishSession()" class="oa-press flex-1 h-[40px] rounded-full bg-[#44658b] hover:bg-[#355070] text-white text-[13px] font-medium cursor-pointer">
            End & finish
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderCoachSpreadCanvas() {
  const coachSteps = [
    { step: 'landing', tag: '1 · Landing' },
    { step: 'select_job', tag: '2 · Select Job' },
    { step: 'setup', tag: '3 · Interview Setup' },
    { step: 'session', tag: '4 · Voice / Conv Session' },
    { step: 'completed', tag: '5 · Completed' },
    { step: 'feedback', tag: '6 · Feedback' },
    { step: 'practice', tag: '7 · Practice Plan' },
  ];

  // Snapshot current state so spread preview doesn't clobber interactive session
  const snapshot = {
    step: interviewCoachState.step,
    questions: [...interviewCoachState.questions],
    answers: [...interviewCoachState.answers],
    evaluation: interviewCoachState.evaluation,
    liveTranscript: interviewCoachState.liveTranscript,
    sessionPhase: interviewCoachState.sessionPhase,
    elapsedSeconds: interviewCoachState.elapsedSeconds,
    currentQuestionIdx: interviewCoachState.currentQuestionIdx,
    expandedReviewIdx: interviewCoachState.expandedReviewIdx,
  };

  const job = getCoachActiveJob();
  const sampleQs = generateCoachQuestions(job, ['Behavioral', 'Role-specific'], 3, 'English', 'Realistic');
  const sampleAnswers = sampleQs.map((q) => ({
    questionId: q.id,
    question: q.text,
    category: q.category,
    transcript: buildSimulatedTranscript(q, job, 'English'),
    skipped: false,
  }));
  const sampleEval = evaluateInterviewSession(sampleAnswers, job);

  interviewCoachState.questions = sampleQs;
  interviewCoachState.answers = sampleAnswers;
  interviewCoachState.evaluation = sampleEval;
  interviewCoachState.liveTranscript = sampleAnswers[0].transcript;
  interviewCoachState.sessionPhase = 'listening';
  interviewCoachState.elapsedSeconds = 185;
  interviewCoachState.currentQuestionIdx = 0;
  interviewCoachState.expandedReviewIdx = 0;

  const html = coachSteps
    .map((item) => {
      interviewCoachState.step = item.step;
      const headerHTML = typeof renderDashboardHeader === 'function' ? renderDashboardHeader('interview_coach') : '';
      const statusHTML = typeof renderStatusBar === 'function' ? renderStatusBar({ id: 8 }) : '';
      const bodyHTML = renderInterviewCoachRoute(false);
      const footerHTML = renderCoachStickyFooter();

      return `
        <div class="flex flex-col items-center gap-2.5">
          <span class="h-[28px] px-3 rounded-full bg-white text-[12px] text-[#535862] inline-flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-[#44658b]"></span>
            <span>${numText(item.tag)}</span>
          </span>
          <div class="phone-frame" data-coach-step="${item.step}">
            ${statusHTML}
            <main class="screen-main flex-1 overflow-y-auto no-scrollbar bg-[#f5f6f8] flex flex-col">
              <div class="flex-1 flex flex-col">
                ${headerHTML}
                <div class="px-3 pb-5 space-y-3 flex-1 flex flex-col">
                  ${bodyHTML}
                </div>
                ${footerHTML}
              </div>
            </main>
          </div>
        </div>
      `;
    })
    .join('');

  // Restore snapshot
  Object.assign(interviewCoachState, snapshot);
  return html;
}
