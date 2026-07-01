/**
 * CareerShield AI — Interview Preparation & Answer Sandbox Handler
 */

document.addEventListener('DOMContentLoaded', () => {
  const roleInput = document.getElementById('interview-target-role');
  const descTextarea = document.getElementById('interview-job-desc');
  
  const btnGenerate = document.getElementById('btn-generate-interview');
  const btnClear = document.getElementById('btn-clear-interview');
  
  const loadingSection = document.getElementById('interview-loading');
  const resultsSection = document.getElementById('interview-results');
  
  const tasksList = document.getElementById('interview-prep-roadmap');
  const accordionContainer = document.getElementById('interview-questions-accordion');
  
  // Sandbox elements
  const sandboxSection = document.getElementById('practice-sandbox-container');
  const sandboxQuestionTitle = document.getElementById('sandbox-active-question-title');
  const answerInput = document.getElementById('interview-answer-input');
  const btnSubmitAnswer = document.getElementById('btn-submit-answer');
  const gradingLoading = document.getElementById('interview-grade-loading');
  
  const feedbackCard = document.getElementById('interview-feedback-card');
  const scoreBadge = document.getElementById('sandbox-score-badge');
  const strengthsList = document.getElementById('sandbox-strengths-list');
  const improvementsList = document.getElementById('sandbox-improvements-list');
  const modelAnswerText = document.getElementById('sandbox-model-answer');

  let activeQuestionText = '';
  let activeQuestionsArray = [];

  // Enable button on typing target role
  const checkInputs = () => {
    btnGenerate.disabled = roleInput.value.trim().length < 2;
  };
  roleInput.addEventListener('input', checkInputs);

  // Clear button handler
  btnClear.addEventListener('click', () => {
    roleInput.value = '';
    descTextarea.value = '';
    
    roleInput.disabled = false;
    descTextarea.disabled = false;
    btnGenerate.disabled = true;
    btnClear.disabled = false;

    resultsSection.style.display = 'none';
    loadingSection.style.display = 'none';
    sandboxSection.style.display = 'none';
  });

  // Generate Questions handler
  btnGenerate.addEventListener('click', async () => {
    const targetRole = roleInput.value.trim();
    if (targetRole.length < 2) return;

    const jobDescription = descTextarea.value.trim();

    // Disable forms & loading state toggle
    roleInput.disabled = true;
    descTextarea.disabled = true;
    btnGenerate.disabled = true;
    btnClear.disabled = true;

    resultsSection.style.display = 'none';
    sandboxSection.style.display = 'none';
    loadingSection.style.display = 'flex';

    try {
      const response = await fetch('/api/prep-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ targetRole, jobDescription })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Server error during interview questions generation');
      }

      const result = await response.json();
      activeQuestionsArray = result.questions || [];

      // Save generated questions to Storage Manager
      window.StorageManager.saveScan('interview', result, `Prep: ${targetRole}`);

      // Render
      renderQuestions(result);

    } catch (error) {
      console.error('Error generating questions:', error);
      alert(`Generation Failed: ${error.message}\nMake sure the local server is running.`);
      resultsSection.style.display = 'none';
    } finally {
      roleInput.disabled = false;
      descTextarea.disabled = false;
      btnGenerate.disabled = false;
      btnClear.disabled = false;
      loadingSection.style.display = 'none';
    }
  });

  function renderQuestions(data) {
    // Render prep tasks
    tasksList.innerHTML = '';
    if (data.prep_roadmap && data.prep_roadmap.length > 0) {
      data.prep_roadmap.forEach(task => {
        const li = document.createElement('li');
        li.textContent = task;
        tasksList.appendChild(li);
      });
    } else {
      tasksList.innerHTML = '<li>Review company mission details.</li>';
    }

    // Render questions accordions
    accordionContainer.innerHTML = '';
    if (data.questions && data.questions.length > 0) {
      accordionContainer.innerHTML = data.questions.map((q, idx) => {
        const catBadge = q.category === 'technical' ? 'badge-tech' : 'badge-behavioral';
        return `
          <div class="accordion-item" id="accordion-item-${idx}">
            <div class="accordion-header" style="display: flex; justify-content: space-between; align-items: center;">
              <div class="accordion-title-container">
                <span class="accordion-category-badge ${catBadge}">${q.category}</span>
                <span class="accordion-title">${escapeHtml(q.question)}</span>
              </div>
              <svg class="accordion-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2" style="margin-left: 1rem; flex-shrink:0;">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <div class="accordion-body">
              <div class="accordion-content">
                <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; margin-bottom: 1.25rem; border-left: 2.5px solid var(--border-glow); padding-left: 0.75rem;">
                  <strong>Recruiter Tip:</strong> ${escapeHtml(q.tip)}
                </p>
                <button class="btn btn-primary btn-practice-this" data-index="${idx}" style="font-size: 0.85rem; padding: 0.5rem 1.25rem; font-weight: 500;">
                  Practice This Question
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Add click events to headers for expand/collapse behavior
      const items = accordionContainer.querySelectorAll('.accordion-item');
      items.forEach(item => {
        const header = item.querySelector('.accordion-header');
        const body = item.querySelector('.accordion-body');
        
        header.addEventListener('click', () => {
          const isActive = item.classList.contains('active');
          
          // Collapse other active accordion items
          items.forEach(otherItem => {
            if (otherItem !== item) {
              otherItem.classList.remove('active');
              otherItem.querySelector('.accordion-body').style.maxHeight = null;
            }
          });

          if (isActive) {
            item.classList.remove('active');
            body.style.maxHeight = null;
          } else {
            item.classList.add('active');
            body.style.maxHeight = body.scrollHeight + 'px';
          }
        });
      });

      // Attach clicks to "Practice This Question" buttons
      const practiceBtns = accordionContainer.querySelectorAll('.btn-practice-this');
      practiceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const index = parseInt(btn.getAttribute('data-index'), 10);
          const activeQ = activeQuestionsArray[index];
          if (activeQ) {
            openSandbox(activeQ.question);
          }
        });
      });

    } else {
      accordionContainer.innerHTML = '<p style="color: var(--text-muted);">No questions generated.</p>';
    }

    resultsSection.style.display = 'grid';
  }

  function openSandbox(questionText) {
    activeQuestionText = questionText;
    sandboxQuestionTitle.innerHTML = `<strong>Question:</strong> "${escapeHtml(questionText)}"`;
    
    // Clear sandbox inputs
    answerInput.value = '';
    answerInput.disabled = false;
    btnSubmitAnswer.disabled = false;
    
    feedbackCard.style.display = 'none';
    gradingLoading.style.display = 'none';
    
    sandboxSection.style.display = 'block';
    
    // Scroll sandbox into view smoothly
    sandboxSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Answer Evaluation Click Handler
  btnSubmitAnswer.addEventListener('click', async () => {
    const typedAnswer = answerInput.value.trim();
    if (typedAnswer.length < 5) {
      alert('Please write a slightly longer practice answer to grade (at least 5 characters).');
      return;
    }

    const targetRole = roleInput.value.trim();
    const jobDescription = descTextarea.value.trim();

    // Disable inputs and show spinner
    answerInput.disabled = true;
    btnSubmitAnswer.disabled = true;
    feedbackCard.style.display = 'none';
    gradingLoading.style.display = 'flex';

    try {
      const response = await fetch('/api/grade-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: activeQuestionText,
          targetRole,
          jobDescription,
          answer: typedAnswer
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Server error during answer grading');
      }

      const feedback = await response.json();

      renderFeedback(feedback);

    } catch (error) {
      console.error('Error grading answer:', error);
      alert(`Grading Failed: ${error.message}\nMake sure the local server is running.`);
      feedbackCard.style.display = 'none';
      answerInput.disabled = false;
      btnSubmitAnswer.disabled = false;
    } finally {
      gradingLoading.style.display = 'none';
    }
  });

  function renderFeedback(data) {
    const score = data.score || 0;
    
    // Update Score badge
    scoreBadge.textContent = `Score: ${score}%`;
    
    // Set badge style classes based on score
    scoreBadge.className = 'badge-level';
    let colorClass = 'level-high';
    if (score >= 75) colorClass = 'level-low';
    else if (score >= 50) colorClass = 'level-medium';
    scoreBadge.classList.add(colorClass);

    // Render Strengths
    strengthsList.innerHTML = '';
    if (data.strengths && data.strengths.length > 0) {
      data.strengths.forEach(s => {
        const li = document.createElement('li');
        li.textContent = s;
        strengthsList.appendChild(li);
      });
    } else {
      strengthsList.innerHTML = '<li>Good attempt. Continue practice.</li>';
    }

    // Render Improvements
    improvementsList.innerHTML = '';
    if (data.improvements && data.improvements.length > 0) {
      data.improvements.forEach(imp => {
        const li = document.createElement('li');
        li.textContent = imp;
        improvementsList.appendChild(li);
      });
    } else {
      improvementsList.innerHTML = '<li>No major improvements suggested. Excellent work!</li>';
    }

    // Render Sample response
    modelAnswerText.textContent = data.sample_answer || 'No sample answer provided.';

    // Show feedback card
    feedbackCard.style.display = 'block';
    
    // Re-enable input so user can edit response and try again
    answerInput.disabled = false;
    btnSubmitAnswer.disabled = false;

    // Scroll feedback card into view
    feedbackCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
