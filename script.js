/**
 * HIRE AI — Multi-Candidate Recruitment Screening Engine
 * Pure Vanilla JavaScript | 100% Offline | Zero External Dependencies
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. Smooth Scroll Anchor Links (Landing + Analyzer)
  // ==========================================================================
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // ==========================================================================
  // ARC SCENE — Orbital Card Positioning + Scanning Sequence Animation
  // ==========================================================================
  (function initArcScene() {
    const scene = document.getElementById('arcScene');
    if (!scene) return; // Only runs on landing page

    const NUM_CARDS = 4;
    const ORBIT_R  = 175;   // px radius (matches SVG viewBox orbit ring r=175 scaled to element)
    const CX       = 260;   // SVG centre x
    const CY       = 260;   // SVG centre y
    const CARD_W   = 110;   // card width px
    const CARD_H   = 90;    // approx card height px

    // Scene dimensions (matches CSS: 520x520)
    const SCENE_W  = 520;
    const SCENE_H  = 520;

    // Starting angles for each card (degrees, 0 = top)
    // Spread: top-left, top-right, bottom-left, bottom-right quadrants
    const BASE_ANGLES = [220, 320, 140, 40]; // degrees
    let   cardAngles  = [...BASE_ANGLES];
    const ORBIT_SPEED = 0.012; // degrees per frame

    // Cache DOM
    const cards  = [0,1,2,3].map(i => document.getElementById(`rc${i}`));
    const checks = [0,1,2,3].map(i => document.getElementById(`rck${i}`));
    const lines  = [0,1,2,3].map(i => document.getElementById(`cl${i}`));
    const statusPanel = document.getElementById('arcStatus');
    const aspRows     = [0,1,2,3].map(i => document.getElementById(`asr${i}`));
    const chestCore   = document.getElementById('chestCore');

    // Scale orbit radius from SVG coords → CSS pixel coords
    // scene is 520px wide/tall, SVG viewBox is 0 0 520 520 → 1:1
    const R = ORBIT_R; // same as SVG since viewBox matches element size

    /* Position card so its centre is at (cx, cy) in scene space */
    function placeCard(card, cx, cy) {
      card.style.left = (cx - CARD_W / 2) + 'px';
      card.style.top  = (cy - CARD_H / 2) + 'px';
    }

    /* Update SVG connection line from robot core to card centre */
    function updateLine(line, cx, cy) {
      line.setAttribute('x1', CX);
      line.setAttribute('y1', CY - 5);
      line.setAttribute('x2', cx);
      line.setAttribute('y2', cy);
    }

    let animFrame;
    let scanPhase = 'orbit'; // 'orbit' | 'scan' | 'status' | 'reset'
    let scanIdx   = 0;
    let phaseTimer = 0;
    let lastTime   = 0;

    /* ── Scanning sequence state ── */
    let scanAngles  = null; // frozen angles during scan
    let scanCardDone = 0;
    let statusStep  = 0;

    function resetStatusPanel() {
      statusPanel.classList.add('hidden');
      aspRows.forEach(r => { r.classList.remove('show'); });
    }

    function resetCards() {
      cards.forEach(c => c.classList.remove('card-active'));
      checks.forEach(c => c.classList.remove('visible'));
      lines.forEach(l => l.classList.remove('active'));
      if (chestCore) chestCore.classList.remove('chest-burst');
    }

    function tick(ts) {
      const dt = ts - lastTime;
      lastTime = ts;

      // ─── Always update card positions (orbit continuously) ─────────────
      if (scanPhase === 'orbit') {
        // Slowly rotate all cards
        cardAngles = cardAngles.map(a => (a + ORBIT_SPEED * dt) % 360);
      }

      // Compute card positions from angles
      const positions = cardAngles.map(deg => {
        const rad = (deg - 90) * Math.PI / 180; // offset so 0° = top
        return {
          cx: CX + R * Math.cos(rad),
          cy: CY + R * Math.sin(rad)
        };
      });

      // Apply positions
      cards.forEach((card, i) => placeCard(card, positions[i].cx, positions[i].cy));
      lines.forEach((line, i) => updateLine(line, positions[i].cx, positions[i].cy));

      // ─── Phase machine ──────────────────────────────────────────────────
      phaseTimer += dt;

      if (scanPhase === 'orbit') {
        // After 5s of orbiting, start scan
        if (phaseTimer > 5000) {
          scanPhase   = 'scan';
          phaseTimer  = 0;
          scanCardDone = 0;
          scanAngles  = [...cardAngles]; // freeze positions (orbit continues anyway)
          resetCards();
        }

      } else if (scanPhase === 'scan') {
        // Scan each card with 1.4s gap
        const cardToScan = Math.floor(phaseTimer / 1400);
        if (cardToScan >= NUM_CARDS) {
          // All cards scanned → move to status
          scanPhase  = 'status';
          phaseTimer = 0;
          statusStep = 0;
          statusPanel.classList.remove('hidden');
          // Pulse chest core
          if (chestCore) {
            chestCore.style.filter = 'drop-shadow(0 0 18px rgba(0,200,83,0.9))';
            setTimeout(() => { if (chestCore) chestCore.style.filter = ''; }, 800);
          }
        } else {
          // Activate card in sequence
          if (cardToScan !== scanCardDone - 1) {
            // Light up current card
            for (let i = 0; i < NUM_CARDS; i++) {
              if (i <= cardToScan) {
                cards[i].classList.add('card-active');
                checks[i].classList.add('visible');
                lines[i].classList.add('active');
              }
            }
            scanCardDone = cardToScan + 1;
          }
        }

      } else if (scanPhase === 'status') {
        // Show status rows one by one
        const rowToShow = Math.floor(phaseTimer / 600);
        if (rowToShow < 4 && !aspRows[rowToShow].classList.contains('show')) {
          aspRows[rowToShow].classList.add('show');
        }
        // After all 4 rows shown + 1.5s, reset
        if (phaseTimer > 600 * 4 + 1500) {
          scanPhase  = 'reset';
          phaseTimer = 0;
        }

      } else if (scanPhase === 'reset') {
        // Brief pause then go back to orbiting
        if (phaseTimer > 800) {
          resetCards();
          resetStatusPanel();
          scanPhase  = 'orbit';
          phaseTimer = 0;
        }
      }

      animFrame = requestAnimationFrame(tick);
    }

    // Initialise card positions before first frame
    cardAngles.forEach((deg, i) => {
      const rad = (deg - 90) * Math.PI / 180;
      const cx  = CX + R * Math.cos(rad);
      const cy  = CY + R * Math.sin(rad);
      placeCard(cards[i], cx, cy);
      updateLine(lines[i], cx, cy);
    });

    lastTime   = performance.now();
    animFrame  = requestAnimationFrame(tick);

    // Pause animation when tab is hidden (performance)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animFrame);
      } else {
        lastTime  = performance.now();
        phaseTimer = 0;
        animFrame = requestAnimationFrame(tick);
      }
    });
  })();

  // ==========================================================================
  // 2. Skill Taxonomy & Stop Words
  // ==========================================================================

  const STOP_WORDS = new Set([
    'a','about','above','after','again','against','all','am','an','and','any','are','as','at',
    'be','because','been','before','being','below','between','both','but','by','can','cannot',
    'could','did','do','does','doing','down','during','each','few','for','from','further','had',
    'has','have','having','he','her','here','hers','herself','him','himself','his','how','i',
    'if','in','into','is','it','its','itself','me','more','most','my','myself','no','nor','not',
    'of','off','on','once','only','or','other','ought','our','ours','ourselves','out','over',
    'own','same','she','should','so','some','such','than','that','the','their','theirs','them',
    'themselves','then','there','these','they','this','those','through','to','too','under',
    'until','up','very','was','we','were','what','when','where','which','while','who','whom',
    'why','with','would','you','your','yours','yourself','yourselves','looking','candidate',
    'role','job','position','company','work','working','ability','proficient','knowledge',
    'understanding','required','requirement','requirements','responsibilities','qualifications',
    'experience','years','strong','good','excellent'
  ]);

  const SKILL_TAXONOMY = [
    { name: 'Java', category: 'Programming' },
    { name: 'Python', category: 'Programming' },
    { name: 'C++', category: 'Programming' },
    { name: 'C#', category: 'Programming' },
    { name: 'C', category: 'Programming' },
    { name: 'JavaScript', category: 'Programming' },
    { name: 'TypeScript', category: 'Programming' },
    { name: 'HTML', category: 'Web' },
    { name: 'CSS', category: 'Web' },
    { name: 'SQL', category: 'Database' },
    { name: 'MySQL', category: 'Database' },
    { name: 'MongoDB', category: 'Database' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'React', category: 'Web Frameworks' },
    { name: 'Node.js', category: 'Web Frameworks' },
    { name: 'Express.js', category: 'Web Frameworks' },
    { name: 'Spring', category: 'Web Frameworks' },
    { name: 'Spring Boot', category: 'Web Frameworks' },
    { name: 'REST API', category: 'Web Frameworks' },
    { name: 'Git', category: 'DevOps & Tools' },
    { name: 'GitHub', category: 'DevOps & Tools' },
    { name: 'Docker', category: 'DevOps & Tools' },
    { name: 'AWS', category: 'Cloud' },
    { name: 'Azure', category: 'Cloud' },
    { name: 'Machine Learning', category: 'AI & Data Science' },
    { name: 'Artificial Intelligence', category: 'AI & Data Science' },
    { name: 'Data Science', category: 'AI & Data Science' },
    { name: 'Data Analysis', category: 'AI & Data Science' },
    { name: 'Communication', category: 'Soft Skills' },
    { name: 'Leadership', category: 'Soft Skills' },
    { name: 'Problem Solving', category: 'Soft Skills' },
    { name: 'Teamwork', category: 'Soft Skills' }
  ];

  // ==========================================================================
  // 3. DOM Element Selectors & Analyzer Workspace Setup
  // ==========================================================================
  const analyzeBtn = document.getElementById('analyzeBtn');
  if (!analyzeBtn) return; // Exit if not on analyzer.html page

  const loadSampleBtn = document.getElementById('loadSampleBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');

  const jdInput = document.getElementById('jdInput');
  const jdWordCount = document.getElementById('jdWordCount');
  const clearJdBtn = document.getElementById('clearJdBtn');

  const jdFileInput = document.getElementById('jdFileInput');
  const jdDropzone = document.getElementById('jdDropzone');
  const jdFileName = document.getElementById('jdFileName');
  const removeJdFileBtn = document.getElementById('removeJdFileBtn');

  const resumeFileInput = document.getElementById('resumeFileInput');
  const resumeDropzone = document.getElementById('resumeDropzone');
  const candidateFilesContainer = document.getElementById('candidateFilesContainer');
  const candidateCountTag = document.getElementById('candidateCountTag');
  const emptyCandidatesMsg = document.getElementById('emptyCandidatesMsg');
  const clearResumesBtn = document.getElementById('clearResumesBtn');

  const thresholdSlider = document.getElementById('thresholdSlider');
  const thresholdDisplay = document.getElementById('thresholdDisplay');
  const summaryThresholdLabel = document.getElementById('summaryThresholdLabel');

  const validationBanner = document.getElementById('validationBanner');
  const validationMessage = document.getElementById('validationMessage');
  const closeAlertBtn = document.getElementById('closeAlertBtn');

  const terminalStatus = document.getElementById('terminalStatus');

  const resultsSection = document.getElementById('resultsSection');
  const summaryTotal = document.getElementById('summaryTotal');
  const summarySelected = document.getElementById('summarySelected');
  const summaryNotSelected = document.getElementById('summaryNotSelected');
  const summaryBestMatch = document.getElementById('summaryBestMatch');

  const rankingTableBody = document.getElementById('rankingTableBody');
  const sortSelect = document.getElementById('sortSelect');

  const resetAnalysisBtn = document.getElementById('resetAnalysisBtn');
  const exportReportBtn = document.getElementById('exportReportBtn');
  const printReportBtn = document.getElementById('printReportBtn');
  const analysisTimestamp = document.getElementById('analysisTimestamp');

  // Candidate Pool
  let candidatePool = new Map();
  let candidateIdCounter = 0;
  let lastEvaluatedResults = null;

  // Terminal status helper
  function setTerminal(text) {
    if (terminalStatus) {
      terminalStatus.innerHTML = `<code>&gt; ${text}</code>`;
    }
  }

  // Word counter
  jdInput.addEventListener('input', () => updateWordCount(jdInput, jdWordCount));

  clearJdBtn.addEventListener('click', () => {
    jdInput.value = '';
    resetFileInput(jdFileInput, jdFileName);
    updateWordCount(jdInput, jdWordCount);
  });

  clearResumesBtn.addEventListener('click', () => {
    candidatePool.clear();
    renderCandidatePoolChips();
    setTerminal('hireai.ready() <span class="text-green">✓</span>');
  });

  clearAllBtn.addEventListener('click', () => {
    jdInput.value = '';
    candidatePool.clear();
    resetFileInput(jdFileInput, jdFileName);
    updateWordCount(jdInput, jdWordCount);
    renderCandidatePoolChips();
    hideValidationAlert();
    resultsSection.classList.add('hidden');
    setTerminal('hireai.ready() <span class="text-green">✓</span>');
  });

  // Threshold Slider
  thresholdSlider.addEventListener('input', () => {
    const val = thresholdSlider.value;
    thresholdDisplay.textContent = `${val}%`;
    summaryThresholdLabel.textContent = `${val}%`;
    if (lastEvaluatedResults) {
      reEvaluateThresholdAndRender();
    }
  });

  // File Handlers
  setupSingleFileDropzone(jdDropzone, jdFileInput, jdInput, jdFileName, jdWordCount);
  setupMultiFileDropzone(resumeDropzone, resumeFileInput);

  if (removeJdFileBtn) {
    removeJdFileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      resetFileInput(jdFileInput, jdFileName);
    });
  }

  if (closeAlertBtn) closeAlertBtn.addEventListener('click', hideValidationAlert);

  loadSampleBtn.addEventListener('click', loadSampleCandidates);
  analyzeBtn.addEventListener('click', performMultiCandidateAnalysis);

  if (resetAnalysisBtn) {
    resetAnalysisBtn.addEventListener('click', () => {
      resultsSection.classList.add('hidden');
      jdInput.value = '';
      candidatePool.clear();
      resetFileInput(jdFileInput, jdFileName);
      updateWordCount(jdInput, jdWordCount);
      renderCandidatePoolChips();
      hideValidationAlert();
      setTerminal('hireai.ready() <span class="text-green">✓</span>');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (exportReportBtn) exportReportBtn.addEventListener('click', exportTextReport);
  if (printReportBtn) printReportBtn.addEventListener('click', () => window.print());
  if (sortSelect) sortSelect.addEventListener('change', renderRankingTable);

  // ==========================================================================
  // 4. File Handling Engine
  // ==========================================================================

  function setupSingleFileDropzone(dropzoneEl, fileInputEl, textareaEl, fileNameTagEl, wordCountEl) {
    dropzoneEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzoneEl.classList.add('dragover');
    });
    dropzoneEl.addEventListener('dragleave', () => dropzoneEl.classList.remove('dragover'));
    dropzoneEl.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzoneEl.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        handleSingleTxtFile(e.dataTransfer.files[0], textareaEl, fileNameTagEl, wordCountEl);
      }
    });
    fileInputEl.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleSingleTxtFile(e.target.files[0], textareaEl, fileNameTagEl, wordCountEl);
      }
    });
  }

  function handleSingleTxtFile(file, textareaEl, fileNameTagEl, wordCountEl) {
    if (!file.name.endsWith('.txt')) {
      showValidationAlert('Please upload a valid .txt file for the Job Description.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      textareaEl.value = e.target.result;
      updateWordCount(textareaEl, wordCountEl);
      const nameText = fileNameTagEl.querySelector('.file-name-text');
      if (nameText) nameText.textContent = file.name;
      fileNameTagEl.classList.remove('hidden');
      hideValidationAlert();
      setTerminal(`loaded "${file.name}" <span class="text-green">✓</span>`);
    };
    reader.readAsText(file);
  }

  function setupMultiFileDropzone(dropzoneEl, fileInputEl) {
    dropzoneEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzoneEl.classList.add('dragover');
    });
    dropzoneEl.addEventListener('dragleave', () => dropzoneEl.classList.remove('dragover'));
    dropzoneEl.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzoneEl.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        readMultipleFiles(Array.from(e.dataTransfer.files));
      }
    });
    fileInputEl.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        readMultipleFiles(Array.from(e.target.files));
      }
    });
  }

  function readMultipleFiles(files) {
    const txtFiles = files.filter(f => f.name.endsWith('.txt'));
    if (txtFiles.length === 0) {
      showValidationAlert('Please select valid .txt candidate resume files.');
      return;
    }
    setTerminal(`loading ${txtFiles.length} candidate(s)...`);
    let loaded = 0;
    txtFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        candidateIdCounter++;
        const id = `cand_${candidateIdCounter}`;
        candidatePool.set(id, { id, name: file.name, text: e.target.result });
        loaded++;
        if (loaded === txtFiles.length) {
          renderCandidatePoolChips();
          hideValidationAlert();
          setTerminal(`${candidatePool.size} candidate(s) loaded <span class="text-green">✓</span>`);
        }
      };
      reader.readAsText(file);
    });
  }

  function renderCandidatePoolChips() {
    candidateFilesContainer.innerHTML = '';
    const count = candidatePool.size;
    candidateCountTag.textContent = `${count} candidate${count === 1 ? '' : 's'}`;

    if (count === 0) {
      emptyCandidatesMsg.classList.remove('hidden');
      return;
    }
    emptyCandidatesMsg.classList.add('hidden');

    candidatePool.forEach((cand, id) => {
      const item = document.createElement('div');
      item.className = 'candidate-chip-item';
      item.innerHTML = `
        <div class="chip-title">
          <span>📄</span>
          <span>${escapeHtml(cand.name)}</span>
        </div>
        <button class="chip-remove-btn" title="Remove candidate">&times;</button>
      `;
      item.querySelector('.chip-remove-btn').addEventListener('click', () => {
        candidatePool.delete(id);
        renderCandidatePoolChips();
        setTerminal(`${candidatePool.size} candidate(s) loaded <span class="text-green">✓</span>`);
      });
      candidateFilesContainer.appendChild(item);
    });
  }

  // ==========================================================================
  // 5. Multi-Candidate Analysis Engine
  // ==========================================================================

  function performMultiCandidateAnalysis() {
    hideValidationAlert();

    const jdText = jdInput.value.trim();
    if (!jdText && candidatePool.size === 0) {
      showValidationAlert('Please provide both a Job Description and Candidate Resumes.');
      return;
    }
    if (!jdText) {
      showValidationAlert('Please enter a Job Description.');
      return;
    }
    if (candidatePool.size === 0) {
      showValidationAlert('Please upload at least one Candidate Resume.');
      return;
    }

    setTerminal('analyzing resumes...');

    const normalizedJd = normalizeText(jdText);
    const jdKeywords = extractKeywordsFromJD(jdText, normalizedJd);

    if (jdKeywords.length === 0) {
      showValidationAlert('Could not extract skill keywords from the Job Description. Please add standard skill terminology.');
      setTerminal('hireai.ready() <span class="text-green">✓</span>');
      return;
    }

    const threshold = parseInt(thresholdSlider.value, 10);
    const candidateResults = [];

    setTerminal('matching skills...');

    candidatePool.forEach((cand) => {
      const matchedSkills = [];
      const missingSkills = [];

      jdKeywords.forEach(kw => {
        const escaped = kw.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`(?:^|[^a-zA-Z0-9+#.])${escaped}(?:$|[^a-zA-Z0-9+#.])`, 'gi');
        const matches = cand.text.match(regex);
        if (matches && matches.length > 0) {
          matchedSkills.push(kw.name);
        } else {
          missingSkills.push(kw.name);
        }
      });

      const matchedRatio = jdKeywords.length > 0 ? (matchedSkills.length / jdKeywords.length) : 0;
      const score = Math.round(matchedRatio * 100);

      candidateResults.push({
        id: cand.id,
        name: cand.name.replace(/\.txt$/i, ''),
        fileName: cand.name,
        score,
        matchedSkills,
        missingSkills,
        totalKeywords: jdKeywords.length,
        isSelected: score >= threshold
      });
    });

    lastEvaluatedResults = candidateResults;
    renderResultsDashboard();

    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    setTerminal(`screening complete <span class="text-green">✓</span> — ${candidateResults.length} candidates ranked`);
  }

  function reEvaluateThresholdAndRender() {
    if (!lastEvaluatedResults) return;
    const threshold = parseInt(thresholdSlider.value, 10);
    lastEvaluatedResults.forEach(cand => {
      cand.isSelected = cand.score >= threshold;
    });
    renderResultsDashboard();
  }

  function renderResultsDashboard() {
    if (!lastEvaluatedResults) return;

    const total = lastEvaluatedResults.length;
    const selectedCount = lastEvaluatedResults.filter(c => c.isSelected).length;
    const notSelectedCount = total - selectedCount;
    const sortedByScore = [...lastEvaluatedResults].sort((a, b) => b.score - a.score);
    const bestMatch = sortedByScore.length > 0 ? `${sortedByScore[0].name} (${sortedByScore[0].score}%)` : '—';

    summaryTotal.textContent = total;
    summarySelected.textContent = selectedCount;
    summaryNotSelected.textContent = notSelectedCount;
    summaryBestMatch.textContent = bestMatch;
    analysisTimestamp.textContent = `Generated on ${new Date().toLocaleTimeString()}`;

    renderRankingTable();
  }

  function renderRankingTable() {
    if (!lastEvaluatedResults) return;

    const sortOption = sortSelect ? sortSelect.value : 'score-desc';
    let sortedList = [...lastEvaluatedResults];

    if (sortOption === 'score-desc') {
      sortedList.sort((a, b) => b.score - a.score);
    } else if (sortOption === 'score-asc') {
      sortedList.sort((a, b) => a.score - b.score);
    } else if (sortOption === 'selected-first') {
      sortedList.sort((a, b) => (b.isSelected === a.isSelected) ? b.score - a.score : (b.isSelected ? 1 : -1));
    } else if (sortOption === 'not-selected-first') {
      sortedList.sort((a, b) => (b.isSelected === a.isSelected) ? b.score - a.score : (a.isSelected ? 1 : -1));
    }

    rankingTableBody.innerHTML = '';

    sortedList.forEach((cand, index) => {
      const rank = index + 1;
      const rankClass = rank === 1 ? 'rank-1' : '';
      const barClass = cand.isSelected ? '' : 'bar-red';

      // Main Row
      const tr = document.createElement('tr');
      tr.className = 'candidate-row';
      tr.innerHTML = `
        <td><span class="rank-badge ${rankClass}">${rank}</span></td>
        <td><strong style="color: var(--text-primary);">${escapeHtml(cand.name)}</strong></td>
        <td>
          <div class="score-bar-wrapper">
            <span class="score-text ${cand.isSelected ? 'text-green' : 'text-red'}">${cand.score}%</span>
            <div class="score-bar-track">
              <div class="score-bar-fill ${barClass}" style="width: 0%;"></div>
            </div>
          </div>
        </td>
        <td>
          <span class="status-tag ${cand.isSelected ? 'tag-selected' : 'tag-rejected'}">
            ${cand.isSelected ? '✓ SELECTED' : '✕ NOT SELECTED'}
          </span>
        </td>
        <td>
          <button class="btn btn-outline-muted btn-sm toggle-detail-btn" style="font-size:0.72rem; padding:0.2rem 0.5rem;">
            Details ↓
          </button>
        </td>
      `;

      // Detail Row
      const detailTr = document.createElement('tr');
      detailTr.className = 'detail-row hidden';
      detailTr.innerHTML = `
        <td colspan="5">
          <div class="candidate-detail-box">
            <div class="detail-header">
              <h4>${escapeHtml(cand.name)} — Skill Match Breakdown</h4>
              <span class="status-tag ${cand.isSelected ? 'tag-selected' : 'tag-rejected'}">
                Score: ${cand.score}% &bull; ${cand.isSelected ? '✓ SELECTED' : '✕ NOT SELECTED'}
              </span>
            </div>
            <div class="detail-skills-grid">
              <div class="detail-skill-column">
                <h5 style="color: var(--success-green);">✓ MATCHED SKILLS (${cand.matchedSkills.length})</h5>
                <div class="skill-chips-flex">
                  ${cand.matchedSkills.length > 0
                    ? cand.matchedSkills.map(s => `<span class="skill-chip skill-chip-matched">✓ ${escapeHtml(s)}</span>`).join('')
                    : '<span style="font-size:0.78rem;color:var(--text-muted);">No matching skills found.</span>'}
                </div>
              </div>
              <div class="detail-skill-column">
                <h5 style="color: var(--danger-red);">✕ MISSING SKILLS (${cand.missingSkills.length})</h5>
                <div class="skill-chips-flex">
                  ${cand.missingSkills.length > 0
                    ? cand.missingSkills.map(s => `<span class="skill-chip skill-chip-missing">✕ ${escapeHtml(s)}</span>`).join('')
                    : '<span style="font-size:0.78rem;color:var(--success-green);">All job skills matched!</span>'}
                </div>
              </div>
            </div>
          </div>
        </td>
      `;

      tr.addEventListener('click', () => {
        detailTr.classList.toggle('hidden');
      });

      rankingTableBody.appendChild(tr);
      rankingTableBody.appendChild(detailTr);
    });

    // Animate score bars after a short delay
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.querySelectorAll('.score-bar-fill').forEach(bar => {
          const row = bar.closest('.candidate-row') || bar.closest('tr');
          // Find the score text sibling
          const wrapper = bar.closest('.score-bar-wrapper');
          if (wrapper) {
            const scoreText = wrapper.querySelector('.score-text');
            if (scoreText) {
              const pct = parseInt(scoreText.textContent, 10);
              bar.style.width = pct + '%';
            }
          }
        });
      }, 100);
    });
  }

  // ==========================================================================
  // 6. Sample Candidates
  // ==========================================================================

  function loadSampleCandidates() {
    setTerminal('loading candidates...');

    jdInput.value = `We are looking for a Java Backend Developer with knowledge of Java, SQL, Spring Boot, Git, REST API, Docker, AWS, and problem solving skills.`;
    updateWordCount(jdInput, jdWordCount);

    candidatePool.clear();

    const samples = [
      {
        name: 'Priya_Resume.txt',
        text: `Priya Academic Resume. Computer Science graduate with strong expertise in Java, SQL, Spring Boot, REST API, Git, and problem solving. Built backend microservices using Spring Boot and MySQL.`
      },
      {
        name: 'Arun_Resume.txt',
        text: `Arun Software Engineer. Proficient in Java, SQL, REST API, Git, Docker, and problem solving. 2 years experience developing web applications.`
      },
      {
        name: 'Karthik_Resume.txt',
        text: `Karthik Resume. Frontend Web Developer with skills in JavaScript, HTML, CSS, React, and SQL. Basic experience with Git.`
      },
      {
        name: 'Vasanth_Resume.txt',
        text: `Vasanth Candidate Profile. Business analyst with strong communication, leadership, and project management skills. Experience with Excel.`
      }
    ];

    samples.forEach(s => {
      candidateIdCounter++;
      const id = `cand_${candidateIdCounter}`;
      candidatePool.set(id, { id, name: s.name, text: s.text });
    });

    renderCandidatePoolChips();
    hideValidationAlert();

    setTerminal('ranking candidates...');

    setTimeout(() => {
      performMultiCandidateAnalysis();
    }, 300);
  }

  // ==========================================================================
  // 7. Helpers & Export
  // ==========================================================================

  function exportTextReport() {
    if (!lastEvaluatedResults) return;

    const threshold = thresholdSlider.value;
    const lines = [
      `=====================================================`,
      `HIRE AI — MULTI-CANDIDATE SCREENING REPORT`,
      `=====================================================`,
      `Date: ${new Date().toLocaleString()}`,
      `Selection Threshold: ${threshold}%`,
      `Total Candidates: ${lastEvaluatedResults.length}`,
      `Selected: ${lastEvaluatedResults.filter(c => c.isSelected).length}`,
      `Not Selected: ${lastEvaluatedResults.filter(c => !c.isSelected).length}`,
      `-----------------------------------------------------`,
      `RANKING:`,
      `-----------------------------------------------------`
    ];

    const sorted = [...lastEvaluatedResults].sort((a, b) => b.score - a.score);
    sorted.forEach((c, idx) => {
      lines.push(`${idx + 1}. ${c.name} | Match: ${c.score}% | ${c.isSelected ? 'SELECTED' : 'NOT SELECTED'}`);
      lines.push(`   Matched: ${c.matchedSkills.join(', ') || 'None'}`);
      lines.push(`   Missing: ${c.missingSkills.join(', ') || 'None'}`);
      lines.push(``);
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HireAI_Screening_Report_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function normalizeText(text) {
    return text.toLowerCase().replace(/[^\w\s\+\#\.\/]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function extractKeywordsFromJD(rawJd, normalizedJd) {
    const extractedMap = new Map();

    SKILL_TAXONOMY.forEach(skill => {
      const escaped = skill.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(?:^|[^a-zA-Z0-9+#.])${escaped}(?:$|[^a-zA-Z0-9+#.])`, 'gi');
      const matches = rawJd.match(regex);
      if (matches && matches.length > 0) {
        extractedMap.set(skill.name.toLowerCase(), {
          name: skill.name,
          category: skill.category,
          jdFreq: matches.length
        });
      }
    });

    const words = normalizedJd.split(' ').filter(w => w.length > 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));
    const wordFreq = {};
    words.forEach(w => { wordFreq[w] = (wordFreq[w] || 0) + 1; });

    Object.keys(wordFreq).forEach(w => {
      if (wordFreq[w] >= 2 && !extractedMap.has(w)) {
        extractedMap.set(w, {
          name: w.charAt(0).toUpperCase() + w.slice(1),
          category: 'Domain Term',
          jdFreq: wordFreq[w]
        });
      }
    });

    return Array.from(extractedMap.values());
  }

  function updateWordCount(textarea, displayEl) {
    const text = textarea.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    displayEl.textContent = `${words} word${words === 1 ? '' : 's'}`;
  }

  function resetFileInput(fileInputEl, fileNameTagEl) {
    fileInputEl.value = '';
    fileNameTagEl.classList.add('hidden');
  }

  function showValidationAlert(message) {
    validationMessage.textContent = message;
    validationBanner.classList.remove('hidden');
    validationBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function hideValidationAlert() {
    validationBanner.classList.add('hidden');
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

});
