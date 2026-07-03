/**
 * "Can You Find What's Wrong?" — An Interactive UX Mystery
 * Core Application Script (Vanilla JS) — 25 Problems Edition
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     GLOBAL APP STATE
     ========================================================================== */
  const TOTAL_PROBLEMS = 25;

  const state = {
    currentScore: 10,
    problemsSolved: {},
    helperActive: false,
    activeProblemId: null,
    confettiActive: false
  };

  // Initialize all 25 problems as unsolved
  for (let i = 1; i <= TOTAL_PROBLEMS; i++) {
    state.problemsSolved[i] = false;
  }

  // Discovery Messages — cryptic, no explicit labels or problem numbers
  const discoveryMessages = {
    1:  { title: "Something's off with the brand.",       desc: "The logo font and color scream chaos rather than trust. Comic Sans and neon green are not professional choices for a finance app.", evidenceText: "Logo was visually chaotic.", evidenceIcon: "🏷️" },
    2:  { title: "The navigation is a maze.",             desc: "Menu items use abbreviations ('Rptz', 'Sttngs'), vague labels ('??'), and fake entries ('Click Me', 'N/A'). Users can't find anything.", evidenceText: "Navigation labels were useless.", evidenceIcon: "🧭" },
    3:  { title: "Button sizes are wildly inconsistent.", desc: "One header button is tiny (notification icon only) while the profile button is enormous. Fitts's Law requires consistent, reachable targets.", evidenceText: "Header actions had no size consistency.", evidenceIcon: "📐" },
    4:  { title: "The alert bar is a wall of noise.",     desc: "The alert bar crams every possible warning into one unreadable mega-sentence. Information overload destroys priority — when everything is urgent, nothing is.", evidenceText: "Alert text was unreadable information overload.", evidenceIcon: "⚠️" },
    5:  { title: "The page title is meaningless.",        desc: "'User Account Portal Dashboard Info Management Center Home Page Overview' — this title is 10 words that say nothing useful. Clear, concise titles orient users instantly.", evidenceText: "Page title had no clarity.", evidenceIcon: "📝" },
    6:  { title: "Body text is microscopic.",             desc: "The welcome paragraph is set below 9px with 1.2 line-height. WCAG advisory minimums recommend 14-16px with 1.4+ line-height for comfortable reading.", evidenceText: "Text was physically hard to read.", evidenceIcon: "🔬" },
    7:  { title: "The contrast is nearly invisible.",     desc: "The transaction card uses near-invisible grey text on a dark background. WCAG AA requires 4.5:1 contrast for normal text — this fails catastrophically.", evidenceText: "Text contrast failed WCAG standards.", evidenceIcon: "👁" },
    8:  { title: "Button hierarchy is backwards.",        desc: "The destructive 'Cancel' button is enormous, while the primary 'Validate' action is a tiny 8px 'v'. Users are being guided to the wrong action.", evidenceText: "Primary action was impossible to find.", evidenceIcon: "👆" },
    9:  { title: "The color palette hurts the eyes.",    desc: "Pure red, pure lime green, and pure magenta as background colors simultaneously — this clashes violently and creates visual noise that distracts from actual data.", evidenceText: "Color palette was visually hostile.", evidenceIcon: "🎨" },
    10: { title: "This card has no coherent structure.",  desc: "Random text sizes, three competing buttons with vague labels ('DO THING', 'Also Do This', 'Or Maybe This'), and a dense status block with no visual grouping.", evidenceText: "Card layout had no logical structure.", evidenceIcon: "🃏" },
    11: { title: "The table headers are too verbose.",   desc: "Column headers like 'DATE/TIME (UTC±0 approximate)' and 'TRANSACTION TYPE' are all-caps and excessively long. Good data tables use short, scannable headers.", evidenceText: "Table headers were over-engineered.", evidenceIcon: "📊" },
    12: { title: "Table row colors are distracting.",    desc: "Alternating rows use bright orange and bright teal backgrounds. Subtle zebra striping (5-10% shade difference) helps readability; high-contrast alternating colors compete with the data.", evidenceText: "Table rows had distracting colors.", evidenceIcon: "🦓" },
    13: { title: "Form fields have no labels.",           desc: "Three input fields each say 'Enter something here...' with no labels. Screen readers can't describe them, and sighted users have to guess what to type.", evidenceText: "Form inputs had no descriptive labels.", evidenceIcon: "📋" },
    14: { title: "Error state uses the wrong color.",    desc: "The error message shows a green checkmark icon (✓) and says 'Error: Invalid input'. Users associate green with success, not errors. Red with an ✕ is the universal standard.", evidenceText: "Error color signaled the wrong meaning.", evidenceIcon: "❌" },
    15: { title: "Form actions are deliberately confusing.", desc: "The submit button says 'RESET ALL DATA' and the reset button says 'Save Changes'. Swapping these labels causes catastrophic user mistakes — this is a critical UX anti-pattern.", evidenceText: "Submit and reset labels were swapped.", evidenceIcon: "🔀" },
    16: { title: "Notification overload is paralyzing.", desc: "7 notifications, 4 of which are 'CRITICAL', compete for equal attention. When everything screams urgency, users experience decision paralysis and ignore all of them.", evidenceText: "Too many critical alerts at once.", evidenceIcon: "🔔" },
    17: { title: "Icons mean the opposite of labels.",   desc: "A folder icon labeled 'Delete File', a trash icon labeled 'New Folder', a + icon labeled 'Undo Action'. Mismatched icons break mental models users have built over decades.", evidenceText: "Icons contradicted their labels.", evidenceIcon: "🚫" },
    18: { title: "Progress bars have zero context.",     desc: "Four progress bars with no labels, no percentages, no titles. Users see colored bars and have no idea what they measure. Data visualizations must always have context.", evidenceText: "Metrics were completely unlabeled.", evidenceIcon: "📈" },
    19: { title: "The pie chart has no legend.",         desc: "A pie chart showing a single slice labeled only '?' with the caption 'Chart (see data for details)'. The data doesn't exist. This visualization communicates absolutely nothing.", evidenceText: "Chart provided no useful information.", evidenceIcon: "🥧" },
    20: { title: "Interactive elements have no focus state.", desc: "The support panel buttons have no :focus styles at all — tabbing through them makes them invisible to keyboard users. This excludes users who can't use a mouse.", evidenceText: "Buttons were invisible to keyboard users.", evidenceIcon: "⌨️" },
    21: { title: "Buttons and links are swapped.",       desc: "Buttons are styled to look like plain text links, and anchor tags are styled to look like pill buttons. This destroys affordance — users can't predict what clicking will do.", evidenceText: "Buttons and links had wrong affordance.", evidenceIcon: "🔗" },
    22: { title: "Text line length is unreadable.",     desc: "The terms of service paragraph stretches the full width of the card with justified alignment and no max-width. Optimal reading line length is 45-75 characters; this is 200+.", evidenceText: "Text line length made reading painful.", evidenceIcon: "📏" },
    23: { title: "Images have no alternative text.",     desc: "Three broken image placeholders have no alt text and no aria-label. Screen readers announce 'image' with no description. Every image must have meaningful alt text or role='presentation'.", evidenceText: "Images had no accessible descriptions.", evidenceIcon: "🖼️" },
    24: { title: "Critical information is hover-only.", desc: "The account balance is only visible on hover — but hover doesn't exist on touchscreens. Mobile users can never see their own balance. Never hide essential data behind hover alone.", evidenceText: "Balance required hover to view.", evidenceIcon: "👆" },
    25: { title: "Layout breaks on smaller screens.",   desc: "A fixed 800px-wide input element forces horizontal scrolling on any screen narrower than 800px. Responsive design requires flexible units (%, vw, min/max-width) not fixed pixel widths.", evidenceText: "Fixed-width elements broke mobile layout.", evidenceIcon: "📱" }
  };

  /* ==========================================================================
     DOM ELEMENTS
     ========================================================================== */
  const quickAccessBtn       = document.getElementById('quickAccessibilityBtn');
  const accessibilityPanel   = document.getElementById('accessibilityPanel');
  const closeAccPanelBtn     = document.getElementById('closeAccPanelBtn');
  const themeToggle          = document.getElementById('themeToggle');
  const contrastToggle       = document.getElementById('contrastToggle');
  const textScaleSelect      = document.getElementById('textScaleSelect');
  const keyboardHelpToggle   = document.getElementById('keyboardHelpToggle');
  const srCaptionsBox        = document.getElementById('srCaptionsBox');

  const cursorOuter  = document.getElementById('customCursor');
  const cursorInner  = document.getElementById('customCursorDot');

  const headerScoreVal       = document.getElementById('headerScoreValue');
  const headerScoreFill      = document.getElementById('headerScoreFill');
  const detectiveScore       = document.getElementById('detectiveScore');
  const detectiveStatus      = document.getElementById('detectiveStatus');
  const detectiveProgressFill = document.getElementById('detectiveProgressFill');

  const flawedAppFrame   = document.getElementById('flawedAppFrame');
  const toggleHelperBtn  = document.getElementById('toggleHelperBtn');
  const hotspotTriggers  = document.querySelectorAll('.hotspot-trigger');

  const detectiveModal   = document.getElementById('detectiveModal');
  const closeModalBtn    = document.getElementById('closeModalBtn');
  const modalCancelBtn   = document.getElementById('modalCancelBtn');
  const modalFixBtn      = document.getElementById('modalFixBtn');
  const modalBadge       = document.getElementById('modalBadge');
  const modalTitle       = document.getElementById('modalTitle');
  const modalFlawExplain = document.getElementById('modalFlawExplain');

  const pushErrorBtn         = document.getElementById('pushErrorBtn');
  const hintPanelLabel       = document.getElementById('hintPanelLabel');
  const hintCountdownEl      = document.getElementById('hintCountdown');
  const hintExplanationBar   = document.getElementById('hintExplanationBar');
  const hintExplanationIcon  = document.getElementById('hintExplanationIcon');
  const hintExplanationText  = document.getElementById('hintExplanationText');
  const hintExplanationClose = document.getElementById('hintExplanationClose');

  const sliderFontSize  = document.getElementById('sliderFontSize');
  const sliderContrast  = document.getElementById('sliderContrast');
  const sliderSpacing   = document.getElementById('sliderSpacing');
  const sliderDensity   = document.getElementById('sliderDensity');
  const valFontSize     = document.getElementById('valFontSize');
  const valContrast     = document.getElementById('valContrast');
  const valSpacing      = document.getElementById('valSpacing');
  const valDensity      = document.getElementById('valDensity');
  const lblMetricAccess    = document.getElementById('lblMetricAccess');
  const lblMetricRead      = document.getElementById('lblMetricRead');
  const lblMetricHierarchy = document.getElementById('lblMetricHierarchy');
  const metricCircleAccess    = document.getElementById('metricCircleAccess');
  const metricCircleRead      = document.getElementById('metricCircleRead');
  const metricCircleHierarchy = document.getElementById('metricCircleHierarchy');
  const labCardPreview = document.getElementById('labCardPreview');

  const btnWireframeMode  = document.getElementById('btnWireframeMode');
  const btnFinalMode      = document.getElementById('btnFinalMode');
  const wireframeCanvas   = document.getElementById('wireframeCanvas');
  const toggleActiveBg    = document.querySelector('.toggle-active-bg');

  const btnDeviceDesktop = document.getElementById('btnDeviceDesktop');
  const btnDeviceTablet  = document.getElementById('btnDeviceTablet');
  const btnDeviceMobile  = document.getElementById('btnDeviceMobile');
  const deviceMockFrame  = document.getElementById('deviceMockFrame');

  const explorerTriggerBtn = document.getElementById('explorerTriggerBtn');
  const explorerDrawer     = document.getElementById('explorerDrawer');
  const closeDrawerBtn     = document.getElementById('closeDrawerBtn');

  const celebrationOverlay   = document.getElementById('celebrationOverlay');
  const confettiCanvas       = document.getElementById('confettiCanvas');
  const replayBtn            = document.getElementById('replayBtn');
  const continueExploringBtn = document.getElementById('continueExploringBtn');
  const sliderContainer      = document.getElementById('sliderContainer');
  const flawedLayer          = document.getElementById('flawedLayer');
  const sliderHandle         = document.getElementById('sliderHandle');


  /* ==========================================================================
     CUSTOM MOUSE CURSOR TRACKING
     ========================================================================== */
  let cursorX = 0, cursorY = 0;
  let targetX = 0, targetY = 0;

  document.addEventListener('mousemove', (e) => {
    document.body.classList.add('mouse-moving');
    targetX = e.clientX;
    targetY = e.clientY;
    cursorInner.style.left = `${targetX}px`;
    cursorInner.style.top  = `${targetY}px`;
  });

  function animateCursor() {
    cursorX += (targetX - cursorX) * 0.15;
    cursorY += (targetY - cursorY) * 0.15;
    cursorOuter.style.left = `${cursorX}px`;
    cursorOuter.style.top  = `${cursorY}px`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  const hoverSelectors = 'a, button, select, input, [role="button"], .evidence-slot';
  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest(hoverSelectors);
    if (target) {
      cursorOuter.classList.add('hovering');
      if (target.classList.contains('hotspot-trigger')) cursorOuter.classList.add('hotspot-hover');
    }
  });
  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest(hoverSelectors);
    if (target) {
      cursorOuter.classList.remove('hovering');
      cursorOuter.classList.remove('hotspot-hover');
    }
  });


  /* ==========================================================================
     ACCESSIBILITY CENTER CONTROLLER
     ========================================================================== */
  quickAccessBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const active = accessibilityPanel.classList.toggle('active');
    quickAccessBtn.setAttribute('aria-expanded', active);
  });
  closeAccPanelBtn.addEventListener('click', () => {
    accessibilityPanel.classList.remove('active');
    quickAccessBtn.setAttribute('aria-expanded', 'false');
  });
  document.addEventListener('click', (e) => {
    if (!accessibilityPanel.contains(e.target) && e.target !== quickAccessBtn) {
      accessibilityPanel.classList.remove('active');
      quickAccessBtn.setAttribute('aria-expanded', 'false');
    }
  });

  themeToggle.setAttribute('aria-pressed', 'true');
  themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-theme');
    document.body.classList.toggle('light-theme', !isDark);
    themeToggle.setAttribute('aria-pressed', isDark);
    announceAccessibilityChange(`Theme changed to ${isDark ? 'Dark Mode' : 'Light Mode'}`);
  });

  contrastToggle.addEventListener('click', () => {
    const active = document.body.classList.toggle('high-contrast');
    contrastToggle.setAttribute('aria-pressed', active);
    announceAccessibilityChange(`High Contrast Mode ${active ? 'Enabled' : 'Disabled'}`);
  });

  textScaleSelect.addEventListener('change', (e) => {
    const scale = e.target.value;
    document.documentElement.style.setProperty('--text-scale', scale);
    announceAccessibilityChange(`Font scale adjusted to ${scale * 100}%`);
  });

  keyboardHelpToggle.addEventListener('click', () => {
    const active = document.body.classList.toggle('keyboard-assist-mode');
    keyboardHelpToggle.setAttribute('aria-pressed', active);
    announceAccessibilityChange(`Keyboard focus assistance ${active ? 'enabled' : 'disabled'}`);
  });

  function announceAccessibilityChange(message) {
    srCaptionsBox.textContent = message;
    srCaptionsBox.classList.add('active');
    setTimeout(() => srCaptionsBox.classList.remove('active'), 3500);
  }

  hotspotTriggers.forEach(hotspot => {
    hotspot.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hotspot.click(); }
    });
  });


  /* ==========================================================================
     INVESTIGATION GAME ENGINE
     ========================================================================== */

  // Hint messages — vague directional clues, not explicit answers
  const hintMessages = [
    { problemId: 1,  text: "The brand identity feels wrong. What font choice would you trust with your finances?" },
    { problemId: 2,  text: "Can you actually navigate this app? Look closely at the menu labels." },
    { problemId: 3,  text: "In the header, try to find all the clickable areas. Are they easy to reach?" },
    { problemId: 4,  text: "Something at the very top of the page is trying to tell you everything at once." },
    { problemId: 5,  text: "The page title should tell you where you are. Does it?" },
    { problemId: 6,  text: "Try reading the welcome text. How does your eye feel after two sentences?" },
    { problemId: 7,  text: "Look at the transaction card text. Can everyone in the room read it clearly?" },
    { problemId: 8,  text: "In the form card, which button should be the primary action? Can you even find it?" },
    { problemId: 9,  text: "The analytics card has colors. Do they help you understand the data or hurt your eyes?" },
    { problemId: 10, text: "There's a card with multiple buttons. What does 'DO THING' mean? Which one do you press?" },
    { problemId: 11, text: "Look at the table headers. Are they short and scannable, or hard to parse?" },
    { problemId: 12, text: "The table rows alternate colors. Are those colors helping readability or competing with the data?" },
    { problemId: 13, text: "The settings form has text inputs. Do you know what to type into each field?" },
    { problemId: 14, text: "There's an error message in the form area. Does its visual style match the severity?" },
    { problemId: 15, text: "Look at the form action buttons. Are you sure which one saves and which one resets?" },
    { problemId: 16, text: "Count the critical alerts in the notification block. What happens when everything is critical?" },
    { problemId: 17, text: "The quick actions row uses icons. Do the icons match what their labels say?" },
    { problemId: 18, text: "There are progress bars. Progress toward what? Can you tell?" },
    { problemId: 19, text: "There's a chart. What does it show? Does it have a legend, labels, or any context?" },
    { problemId: 20, text: "Try pressing Tab to navigate the support buttons. What happens to the focus indicator?" },
    { problemId: 21, text: "Some items look like links but aren't, and some look like plain text but are buttons." },
    { problemId: 22, text: "The terms paragraph runs edge to edge. How long are the lines of text?" },
    { problemId: 23, text: "Three image placeholders exist. What would a screen reader say about them?" },
    { problemId: 24, text: "Find the account balance section. How do you reveal the balance on a touchscreen?" },
    { problemId: 25, text: "Try scrolling horizontally inside the document upload area." }
  ];
  let hintCycleIndex = 0;

  toggleHelperBtn.addEventListener('click', () => {
    const unsolvedHints = hintMessages.filter(h => !state.problemsSolved[h.problemId]);
    if (unsolvedHints.length === 0) {
      showHintExplanation('💡', "You've already found them all. Well done.", false);
      return;
    }
    const hint = unsolvedHints[hintCycleIndex % unsolvedHints.length];
    hintCycleIndex++;
    showHintExplanation('💡', hint.text, false);
    toggleHelperBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>${unsolvedHints.length > 1 ? 'Next Hint →' : 'Show Hint'}`;
  });

  // Push Error — auto-fixes the next unsolved problem in order
  pushErrorBtn.addEventListener('click', () => {
    const unsolvedIds = Object.keys(state.problemsSolved).map(Number).filter(id => !state.problemsSolved[id]).sort((a,b) => a-b);

    if (unsolvedIds.length === 0) {
      showHintExplanation('✅', `All ${TOTAL_PROBLEMS} problems have been fixed! The experience is now delightful.`, true);
      return;
    }

    const id = unsolvedIds[0];
    const msg = discoveryMessages[id];

    state.problemsSolved[id] = true;
    flawedAppFrame.classList.add(`resolved-problem-${id}`);
    revealEvidenceSlot(id);
    updateCluesCounter();
    const targetScore = calculateTotalScore();
    animateScoreCounter(state.currentScore, targetScore);
    state.currentScore = targetScore;

    flawedAppFrame.classList.add('screen-pulse-active');
    setTimeout(() => flawedAppFrame.classList.remove('screen-pulse-active'), 600);

    const hotEl = document.querySelector(`.hotspot-trigger[data-problem-id="${id}"]`);
    if (hotEl) hotEl.style.display = 'none';
    announceAccessibilityChange('Error auto-fixed. The experience just improved.');

    showHintExplanation(msg.evidenceIcon, `Problem #${id} Fixed — ${msg.evidenceText}`, true);

    const remaining = Object.values(state.problemsSolved).filter(v => !v).length;
    if (remaining === 0) {
      pushErrorBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> All Fixed!`;
      pushErrorBtn.disabled = true;
      pushErrorBtn.style.background = 'linear-gradient(135deg, hsl(150, 75%, 35%), hsl(150, 65%, 28%))';
      setTimeout(triggerFinalCelebration, 1200);
    } else {
      pushErrorBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> Fix Next (${remaining} left)`;
    }
  });

  function showHintExplanation(icon, text, isError) {
    hintExplanationIcon.textContent = icon;
    hintExplanationText.textContent = text;
    hintExplanationBar.classList.remove('visible', 'is-error');
    void hintExplanationBar.offsetWidth;
    hintExplanationBar.classList.add('visible');
    if (isError) hintExplanationBar.classList.add('is-error');
  }

  hintExplanationClose.addEventListener('click', () => {
    hintExplanationBar.classList.remove('visible', 'is-error');
  });

  // Click hotspot dots
  hotspotTriggers.forEach(hotspot => {
    hotspot.addEventListener('click', (e) => {
      e.stopPropagation();
      const problemId = parseInt(hotspot.getAttribute('data-problem-id'));
      openDetectiveDialog(problemId);
    });
  });

  // Broad area click handlers for each flawed section
  const brokenAreaMap = [
    { selector: '#flaw-logo',          problemId: 1  },
    { selector: '.nav-links-wrapper',  problemId: 2  },
    { selector: '#flaw-header-actions', problemId: 3 },
    { selector: '#flaw-alert-bar',     problemId: 4  },
    { selector: '#welcomeBannerTitle', problemId: 5  },
    { selector: '#welcomeBodyText',    problemId: 6  },
    { selector: '#contrastCopyText',   problemId: 7  },
    { selector: '#flawedCtaBtn',       problemId: 8  },
    { selector: '#statsCard',          problemId: 9  },
    { selector: '#chaosCard',          problemId: 10 },
    { selector: '#flaw-table',         problemId: 11 },
    { selector: '.flaw-row-a',         problemId: 12 },
    { selector: '#flaw-form-error',    problemId: 14 },
    { selector: '#flaw-form-actions',  problemId: 15 },
    { selector: '#flaw-notif-block',   problemId: 16 },
    { selector: '#flaw-icon-row',      problemId: 17 },
    { selector: '#flaw-progress-block',problemId: 18 },
    { selector: '#flaw-pie-block',     problemId: 19 },
    { selector: '#flaw-nofocus-block', problemId: 20 },
    { selector: '#flaw-linkbtn-block', problemId: 21 },
    { selector: '#flaw-text-block',    problemId: 22 },
    { selector: '#flaw-img-block',     problemId: 23 },
    { selector: '#flaw-hover-block',   problemId: 24 },
    { selector: '#flaw-fixed-block',   problemId: 25 }
  ];

  brokenAreaMap.forEach(({ selector, problemId }) => {
    const el = document.querySelector(selector);
    if (!el) return;
    el.style.cursor = 'pointer';
    el.addEventListener('click', (e) => {
      if (e.target.closest('.hotspot-trigger')) return;
      openDetectiveDialog(problemId);
    });
  });

  // Also handle form section (problem 13 - no labels)
  const formSectionEl = document.getElementById('formSection');
  if (formSectionEl) {
    formSectionEl.style.cursor = 'pointer';
    formSectionEl.addEventListener('click', (e) => {
      if (e.target.closest('.hotspot-trigger') || e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
      openDetectiveDialog(13);
    });
  }

  function openDetectiveDialog(id) {
    const details = discoveryMessages[id];
    if (!details) return;
    state.activeProblemId = id;

    if (state.problemsSolved[id]) {
      modalBadge.textContent = 'Already Resolved';
      modalTitle.textContent = 'Already fixed.';
      modalFlawExplain.textContent = 'You already uncovered this one. Keep exploring — there are more.';
      modalFixBtn.disabled = true;
      modalFixBtn.innerHTML = '<span>Already Applied ✓</span>';
    } else {
      modalBadge.textContent = `Problem #${id} of ${TOTAL_PROBLEMS}`;
      modalTitle.textContent = details.title;
      modalFlawExplain.textContent = details.desc;
      modalFixBtn.disabled = false;
      modalFixBtn.innerHTML = '<span>Apply the Fix</span>';
    }
    detectiveModal.classList.add('active');
    detectiveModal.setAttribute('aria-hidden', 'false');
  }

  const closeModal = () => {
    detectiveModal.classList.remove('active');
    detectiveModal.setAttribute('aria-hidden', 'true');
    state.activeProblemId = null;
  };
  closeModalBtn.addEventListener('click', closeModal);
  modalCancelBtn.addEventListener('click', closeModal);
  detectiveModal.addEventListener('click', (e) => { if (e.target === detectiveModal) closeModal(); });

  modalFixBtn.addEventListener('click', () => {
    const id = state.activeProblemId;
    if (!id || state.problemsSolved[id]) return;

    state.problemsSolved[id] = true;
    flawedAppFrame.classList.add(`resolved-problem-${id}`);
    revealEvidenceSlot(id);
    updateCluesCounter();

    const targetScore = calculateTotalScore();
    animateScoreCounter(state.currentScore, targetScore);
    state.currentScore = targetScore;

    flawedAppFrame.classList.add('screen-pulse-active');
    setTimeout(() => flawedAppFrame.classList.remove('screen-pulse-active'), 600);

    const hotspotElement = document.querySelector(`.hotspot-trigger[data-problem-id="${id}"]`);
    if (hotspotElement) hotspotElement.style.display = 'none';

    closeModal();
    showDiscoveryToast();
    announceAccessibilityChange('Observation resolved. The experience just improved.');

    if (checkAllProblemsSolved()) {
      setTimeout(triggerFinalCelebration, 1200);
    }
  });

  /* ==========================================================================
     SCORE CALCULATION — 25 PROBLEMS
     ========================================================================== */
  function calculateTotalScore() {
    const solved = Object.values(state.problemsSolved).filter(Boolean).length;
    // Base score 10, +3.6 per problem solved = 100 at 25 solved
    return Math.round(10 + (solved / TOTAL_PROBLEMS) * 90);
  }

  function animateScoreCounter(start, end) {
    const duration = 800;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress * (2 - progress);
      const currentVal = Math.round(start + (end - start) * ease);

      headerScoreVal.textContent = currentVal;
      headerScoreFill.style.width = `${currentVal}%`;
      detectiveScore.textContent = `${currentVal}%`;
      detectiveProgressFill.style.width = `${currentVal}%`;

      let statusColor = 'var(--accent-error)';
      let statusText = 'Complete Disaster';

      if (currentVal < 25)      { statusText = 'Complete Disaster';   statusColor = 'hsl(0, 85%, 55%)'; }
      else if (currentVal < 45) { statusText = 'Highly Frustrating';  statusColor = 'hsl(15, 85%, 55%)'; }
      else if (currentVal < 60) { statusText = 'Needs Serious Work';  statusColor = 'var(--accent-warning)'; }
      else if (currentVal < 75) { statusText = 'Getting Cleaner';     statusColor = 'hsl(45, 90%, 55%)'; }
      else if (currentVal < 90) { statusText = 'Almost There';        statusColor = 'var(--accent-primary)'; }
      else if (currentVal < 100){ statusText = 'Nearly Delightful';   statusColor = 'hsl(150, 75%, 45%)'; }
      else                       { statusText = 'Delightful UX ✦';    statusColor = 'var(--accent-success)'; }

      detectiveStatus.textContent = statusText;
      detectiveStatus.style.color = statusColor;
      detectiveScore.style.color = statusColor;
      detectiveProgressFill.style.background = statusColor;

      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  function checkAllProblemsSolved() {
    return Object.values(state.problemsSolved).every(v => v === true);
  }


  /* ==========================================================================
     EVIDENCE REVEAL & NOTIFICATION SYSTEM
     ========================================================================== */
  function revealEvidenceSlot(id) {
    const slot = document.getElementById(`evidence-${id}`);
    const details = discoveryMessages[id];
    if (!slot || !details) return;
    slot.classList.add('revealed');
    const iconEl = slot.querySelector('.evidence-icon');
    const statusEl = slot.querySelector('.evidence-status');
    if (iconEl) iconEl.textContent = details.evidenceIcon;
    if (statusEl) statusEl.textContent = details.evidenceText;
  }

  function updateCluesCounter() {
    const count = Object.values(state.problemsSolved).filter(Boolean).length;
    const cluesEl = document.getElementById('cluesFound');
    if (cluesEl) cluesEl.textContent = `${count} / ${TOTAL_PROBLEMS}`;
  }

  const toastMessages = [
    "Something improved.",
    "The experience just got better.",
    "One less frustration.",
    "Progress made.",
    "Closer to the solution.",
    "A small fix, a big difference.",
    "Users will thank you.",
    "That's one problem solved.",
    "Design is iterative.",
    "Keep going."
  ];
  let toastIndex = 0;

  function showDiscoveryToast() {
    const toast = document.getElementById('discoveryToast');
    const toastMsg = document.getElementById('toastMessage');
    if (!toast || !toastMsg) return;
    toastMsg.textContent = '✓ ' + toastMessages[toastIndex % toastMessages.length];
    toastIndex++;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 3200);
  }


  /* ==========================================================================
     INACTIVITY HINT TIMER (5-second countdown)
     ========================================================================== */
  let hintUnlocked = false;
  let hintCountdownInterval = null;
  let hintCountdownVal = 5;

  function startHintCountdown() {
    if (hintUnlocked) return;
    hintCountdownVal = 5;
    hintPanelLabel.innerHTML = `Hint available in <span id="hintCountdown">${hintCountdownVal}</span>s`;

    clearInterval(hintCountdownInterval);
    hintCountdownInterval = setInterval(() => {
      hintCountdownVal--;
      const cd = document.getElementById('hintCountdown');
      if (cd) cd.textContent = hintCountdownVal;
      if (hintCountdownVal <= 0) { clearInterval(hintCountdownInterval); unlockHintButton(); }
    }, 1000);
  }

  function unlockHintButton() {
    if (hintUnlocked) return;
    hintUnlocked = true;
    clearInterval(hintCountdownInterval);
    if (!checkAllProblemsSolved()) {
      toggleHelperBtn.disabled = false;
      toggleHelperBtn.classList.add('ready');
      hintPanelLabel.textContent = 'Need a nudge? Use a hint!';
    }
  }

  function resetHintCountdown() {
    if (hintUnlocked) return;
    clearInterval(hintCountdownInterval);
    startHintCountdown();
  }

  const detectiveSectionEl = document.getElementById('detective-section');
  if (detectiveSectionEl) {
    const inactivityObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        startHintCountdown();
        ['click', 'mousemove', 'keydown'].forEach(ev =>
          document.addEventListener(ev, resetHintCountdown, { passive: true })
        );
      } else {
        clearInterval(hintCountdownInterval);
      }
    }, { threshold: 0.3 });
    inactivityObserver.observe(detectiveSectionEl);
  }


  /* ==========================================================================
     INTERACTIVE DESIGN LAB ENGINE
     ========================================================================== */
  [sliderFontSize, sliderContrast, sliderSpacing, sliderDensity].forEach(s => s.addEventListener('input', updateLabEngine));

  function updateLabEngine() {
    const fSize      = parseInt(sliderFontSize.value);
    const contrastVal = parseInt(sliderContrast.value);
    const spacingVal  = parseInt(sliderSpacing.value);
    const densityVal  = parseInt(sliderDensity.value);

    valFontSize.textContent = `${fSize}px`;
    valSpacing.textContent  = `${spacingVal}px`;

    const contrastLabels = ['', 'Very Low', 'Low Contrast', 'Accessible Standard', 'High Contrast'];
    valContrast.textContent = contrastLabels[contrastVal] || 'Low Contrast';

    const densityLabels = ['', 'Compressed', 'Balanced', 'Spacious'];
    valDensity.textContent = densityLabels[densityVal] || 'Compressed';

    labCardPreview.style.setProperty('--lab-font-size', `${fSize}px`);
    labCardPreview.style.setProperty('--lab-spacing',   `${spacingVal}px`);

    let fg = 'hsl(215,10%,45%)', titleC = 'hsl(215,10%,40%)', linkC = 'hsl(250,40%,60%)';
    if (contrastVal === 2) { fg='hsl(215,15%,55%)'; titleC='hsl(215,15%,45%)'; linkC='hsl(250,60%,55%)'; }
    else if (contrastVal === 3) { fg='var(--text-secondary)'; titleC='var(--text-primary)'; linkC='var(--accent-primary)'; }
    else if (contrastVal === 4) { fg='var(--text-primary)'; titleC='var(--text-primary)'; linkC='var(--accent-secondary)'; }

    labCardPreview.style.setProperty('--lab-color-body', fg);
    labCardPreview.style.setProperty('--lab-color-title', titleC);
    labCardPreview.style.setProperty('--lab-color-link', linkC);

    const lh = densityVal === 3 ? '2.0' : densityVal === 2 ? '1.6' : '1.2';
    const bm = densityVal === 3 ? '24px' : densityVal === 2 ? '16px' : '8px';
    labCardPreview.style.setProperty('--lab-line-height', lh);
    labCardPreview.style.setProperty('--lab-block-margin', bm);

    const pBody  = labCardPreview.querySelector('.lab-card-body');
    const pTitle = labCardPreview.querySelector('.lab-card-title');
    const pTags  = labCardPreview.querySelectorAll('.lab-tag');
    const pContent = labCardPreview.querySelector('.lab-card-content');

    pBody.style.fontSize   = `var(--lab-font-size)`;
    pBody.style.lineHeight = `var(--lab-line-height)`;
    pBody.style.color      = `var(--lab-color-body)`;
    pBody.style.marginBottom = `var(--lab-block-margin)`;
    pTitle.style.color = `var(--lab-color-title)`;
    pTitle.style.marginBottom = `calc(var(--lab-block-margin) * 0.5)`;
    pTags.forEach(t => t.style.color = `var(--lab-color-link)`);
    pContent.style.padding = `var(--lab-spacing)`;

    const metrics = calcMetrics(fSize, contrastVal, spacingVal, densityVal);
    updateRadialMetric(lblMetricAccess,    metricCircleAccess,    metrics.accessibility);
    updateRadialMetric(lblMetricRead,      metricCircleRead,      metrics.readability);
    updateRadialMetric(lblMetricHierarchy, metricCircleHierarchy, metrics.hierarchy);
  }

  function calcMetrics(fSize, cv, sv, dv) {
    let a = cv===1?15 : cv===2?35 : cv===3?50 : 60;
    a += fSize<12?5 : fSize<15?15 : fSize<18?25 : 30;
    a += sv>=16?10:5;

    let r = fSize>=14&&fSize<=18?40 : fSize>18?30 : 15;
    r += dv===2?40 : dv===3?25 : 10;
    r += sv>=12&&sv<=24?20:10;

    let h = sv>=16?40 : sv>=8?25 : 10;
    h += dv===2?40 : dv===3?30 : 15;
    h += cv>=3?20:10;

    return { accessibility: Math.round(a), readability: Math.round(r), hierarchy: Math.round(h) };
  }

  function updateRadialMetric(labelNode, circleNode, score) {
    labelNode.textContent = score;
    circleNode.setAttribute('stroke-dasharray', `${score}, 100`);
    const color = score < 50 ? 'var(--accent-error)' : score < 80 ? 'var(--accent-warning)' : 'var(--accent-success)';
    circleNode.setAttribute('stroke', color);
  }

  toggleActiveBg.style.width = `${btnWireframeMode.offsetWidth}px`;
  updateLabEngine();


  /* ==========================================================================
     WIREFRAME TO REALITY TOGGLES
     ========================================================================== */
  btnWireframeMode.addEventListener('click', () => setWireframeToggleState(true));
  btnFinalMode.addEventListener('click',     () => setWireframeToggleState(false));

  function setWireframeToggleState(isWireframe) {
    btnWireframeMode.classList.toggle('active', isWireframe);
    btnFinalMode.classList.toggle('active', !isWireframe);
    wireframeCanvas.classList.toggle('wireframe-active', isWireframe);

    if (isWireframe) {
      toggleActiveBg.style.transform = 'translateX(0)';
      toggleActiveBg.style.width     = `${btnWireframeMode.offsetWidth}px`;
    } else {
      toggleActiveBg.style.width     = `${btnFinalMode.offsetWidth}px`;
      toggleActiveBg.style.transform = `translateX(${btnWireframeMode.offsetWidth}px)`;
    }
    announceAccessibilityChange(`Switched to ${isWireframe ? 'Wireframe Mode' : 'Final Design Mode'}`);
  }


  /* ==========================================================================
     RESPONSIVE DESIGN EMULATOR
     ========================================================================== */
  [btnDeviceDesktop, btnDeviceTablet, btnDeviceMobile].forEach(btn => {
    btn.addEventListener('click', () => {
      const targetDevice = btn.getAttribute('data-device');
      [btnDeviceDesktop, btnDeviceTablet, btnDeviceMobile].forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      deviceMockFrame.classList.remove('desktop-width', 'tablet-width', 'mobile-width');
      deviceMockFrame.classList.add(`${targetDevice}-width`);
      announceAccessibilityChange(`Resized to ${targetDevice} screen emulation`);
    });
  });


  /* ==========================================================================
     DESIGN EXPLORER FLOATING DRAWER
     ========================================================================== */
  explorerTriggerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const active = explorerDrawer.classList.toggle('active');
    explorerTriggerBtn.setAttribute('aria-expanded', active);
  });
  closeDrawerBtn.addEventListener('click', () => {
    explorerDrawer.classList.remove('active');
    explorerTriggerBtn.setAttribute('aria-expanded', 'false');
  });
  document.addEventListener('click', (e) => {
    if (!explorerDrawer.contains(e.target) && e.target !== explorerTriggerBtn) {
      explorerDrawer.classList.remove('active');
      explorerTriggerBtn.setAttribute('aria-expanded', 'false');
    }
  });


  /* ==========================================================================
     FINAL CELEBRATION & BEFORE/AFTER SLIDER
     ========================================================================== */
  function triggerFinalCelebration() {
    celebrationOverlay.classList.add('active');
    celebrationOverlay.setAttribute('aria-hidden', 'false');
    state.confettiActive = true;
    startConfettiSimulation();
  }

  let isDraggingSlider = false;
  sliderContainer.addEventListener('mousedown',  () => { isDraggingSlider = true; });
  sliderContainer.addEventListener('touchstart', () => { isDraggingSlider = true; });
  window.addEventListener('mouseup',  () => { isDraggingSlider = false; });
  window.addEventListener('touchend', () => { isDraggingSlider = false; });

  window.addEventListener('mousemove', (e) => {
    if (!isDraggingSlider) return;
    trackSliderDivider(e.clientX);
  });
  window.addEventListener('touchmove', (e) => {
    if (!isDraggingSlider || !e.touches.length) return;
    trackSliderDivider(e.touches[0].clientX);
  });

  function trackSliderDivider(clientX) {
    const rect = sliderContainer.getBoundingClientRect();
    let rel = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const pct = (rel / rect.width) * 100;
    flawedLayer.style.width  = `${pct}%`;
    sliderHandle.style.left  = `${pct}%`;
  }

  replayBtn.addEventListener('click', () => {
    celebrationOverlay.classList.remove('active');
    celebrationOverlay.setAttribute('aria-hidden', 'true');
    state.confettiActive = false;
    resetInvestigationGame();
  });
  continueExploringBtn.addEventListener('click', () => {
    celebrationOverlay.classList.remove('active');
    celebrationOverlay.setAttribute('aria-hidden', 'true');
    state.confettiActive = false;
  });

  function resetInvestigationGame() {
    state.currentScore = 10;
    for (const key in state.problemsSolved) {
      state.problemsSolved[key] = false;
      flawedAppFrame.classList.remove(`resolved-problem-${key}`);
    }

    headerScoreVal.textContent = '10';
    headerScoreFill.style.width = '10%';
    detectiveScore.textContent = '10%';
    detectiveScore.style.color = '';
    detectiveStatus.textContent = 'Complete Disaster';
    detectiveStatus.style.color = 'hsl(0, 85%, 55%)';
    detectiveProgressFill.style.width = '10%';
    detectiveProgressFill.style.background = '';

    hintUnlocked = false;
    clearInterval(hintCountdownInterval);
    toggleHelperBtn.disabled = true;
    toggleHelperBtn.classList.remove('ready');
    toggleHelperBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>Show Hint`;
    hintPanelLabel.innerHTML = 'Hint available in <span id="hintCountdown">5</span>s';
    pushErrorBtn.disabled = false;
    pushErrorBtn.style.background = '';
    pushErrorBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>Fix Error`;
    hintExplanationBar.classList.remove('visible', 'is-error');

    hotspotTriggers.forEach(h => h.style.display = '');
    document.querySelectorAll('.evidence-slot').forEach(slot => {
      slot.classList.remove('revealed');
      const ic = slot.querySelector('.evidence-icon');
      const st = slot.querySelector('.evidence-status');
      if (ic) ic.textContent = '?';
      if (st) st.textContent = 'Undiscovered';
    });

    const cluesEl = document.getElementById('cluesFound');
    if (cluesEl) cluesEl.textContent = `0 / ${TOTAL_PROBLEMS}`;

    toastIndex = 0;
    flawedLayer.style.width = '50%';
    sliderHandle.style.left = '50%';
    announceAccessibilityChange('Investigation reset. Start exploring again.');
  }


  /* ==========================================================================
     CONFETTI PARTICLE SIMULATOR (CANVAS)
     ========================================================================== */
  let confettiParticles = [];
  const ctx = confettiCanvas.getContext('2d');

  function resizeConfettiCanvas() {
    confettiCanvas.width  = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeConfettiCanvas);
  resizeConfettiCanvas();

  class ConfettiPaper {
    constructor() {
      this.x = Math.random() * confettiCanvas.width;
      this.y = Math.random() * -confettiCanvas.height - 20;
      this.size = Math.random() * 10 + 5;
      this.color = `hsl(${Math.random() * 360}, 80%, 60%)`;
      this.speedX = Math.random() * 4 - 2;
      this.speedY = Math.random() * 5 + 3;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 6 - 3;
      this.shape = Math.random() > 0.5 ? 'rect' : 'circle';
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.rotation += this.rotationSpeed;
      if (this.y > confettiCanvas.height) {
        this.y = -20;
        this.x = Math.random() * confettiCanvas.width;
      }
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = this.color;
      if (this.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.5);
      }
      ctx.restore();
    }
  }

  function startConfettiSimulation() {
    confettiParticles = [];
    for (let i = 0; i < 180; i++) confettiParticles.push(new ConfettiPaper());
    (function loop() {
      if (!state.confettiActive) return;
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      confettiParticles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(loop);
    })();
  }


  /* ==========================================================================
     INTERSECTION OBSERVER SCROLL REVEAL
     ========================================================================== */
  const revealSections = document.querySelectorAll('.scroll-reveal');
  const sectionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { root: null, threshold: 0.10, rootMargin: "0px" });
  revealSections.forEach(s => sectionObserver.observe(s));


  /* ==========================================================================
     BUTTON RIPPLE MICROINTERACTION
     ========================================================================== */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.ripple');
    if (!btn) return;
    const rippleSpan = document.createElement('span');
    rippleSpan.classList.add('ripple-element');
    const rect = btn.getBoundingClientRect();
    rippleSpan.style.left = `${e.clientX - rect.left}px`;
    rippleSpan.style.top  = `${e.clientY - rect.top}px`;
    btn.appendChild(rippleSpan);
    setTimeout(() => rippleSpan.remove(), 600);
  });

  // Hero CTA smooth scroll
  const startInvestigationBtn = document.getElementById('startInvestigationBtn');
  if (startInvestigationBtn) {
    startInvestigationBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('detective-section').scrollIntoView({ behavior: 'smooth' });
    });
  }

});
