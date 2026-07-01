/**
 * CareerShield AI — Interactive Mock Interview Simulator with Voice support
 */

document.addEventListener('DOMContentLoaded', () => {
  const roleInput = document.getElementById('sim-target-role');
  const levelSelect = document.getElementById('sim-skill-level');
  const focusSelect = document.getElementById('sim-focus-type');
  const descTextarea = document.getElementById('sim-job-desc');
  
  const ttsCheckbox = document.getElementById('sim-voice-tts-toggle');
  const sttCheckbox = document.getElementById('sim-voice-stt-toggle');
  
  const btnStart = document.getElementById('btn-start-simulation');
  const btnSend = document.getElementById('btn-sim-send');
  const btnVoiceToggle = document.getElementById('btn-sim-voice-toggle');
  const btnConclude = document.getElementById('btn-sim-conclude');
  const btnRestart = document.getElementById('btn-sim-restart');

  const setupCard = document.getElementById('simulator-setup-card');
  const activeCard = document.getElementById('simulator-active-card');
  const reportCard = document.getElementById('simulator-report-card');
  const loadingOverlay = document.getElementById('simulator-loading');
  const loadingText = document.getElementById('sim-loading-text');

  const chatStream = document.getElementById('sim-chat-stream');
  const chatInput = document.getElementById('sim-chat-input');
  const turnIndicator = document.getElementById('sim-turn-indicator');
  const voiceVisualizer = document.getElementById('sim-voice-visualizer');

  // Report fields
  const overallScoreNum = document.getElementById('sim-report-overall-score');
  const gaugeFill = document.getElementById('sim-report-gauge-fill');
  const fitBadge = document.getElementById('sim-report-fit-badge');
  const techGrade = document.getElementById('sim-report-tech-grade');
  const commGrade = document.getElementById('sim-report-comm-grade');
  const strengthsList = document.getElementById('sim-report-strengths');
  const improvementsList = document.getElementById('sim-report-improvements');
  const qaReviewContainer = document.getElementById('sim-report-qa-review-container');

  const GAUGE_CIRCUMFERENCE = 251.2;

  let conversationHistory = [];
  let questionCount = 0;
  let targetRole = '';
  let activeInterviewerUtterance = null;
  let isInterviewConcluded = false;

  // Initialize Speech Recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let isListening = false;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      isListening = true;
      voiceVisualizer.style.display = 'flex';
      btnVoiceToggle.style.background = 'rgba(0, 242, 254, 0.15)';
      btnVoiceToggle.style.borderColor = 'var(--primary)';
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (chatInput) {
        // Append text if already typing, otherwise set
        if (chatInput.value.trim().length > 0) {
          chatInput.value = chatInput.value.trim() + ' ' + transcript;
        } else {
          chatInput.value = transcript;
        }
      }
    };

    recognition.onend = () => {
      isListening = false;
      voiceVisualizer.style.display = 'none';
      btnVoiceToggle.style.background = 'rgba(255,255,255,0.03)';
      btnVoiceToggle.style.borderColor = 'var(--border-light)';
    };

    recognition.onerror = (e) => {
      console.warn('Speech recognition error encountered:', e.error);
    };
  } else {
    // Hide mic toggle button if not supported in this browser
    if (btnVoiceToggle) {
      btnVoiceToggle.style.display = 'none';
    }
  }

  // Input validation
  const validateInputs = () => {
    btnStart.disabled = roleInput.value.trim().length < 2;
  };
  roleInput.addEventListener('input', validateInputs);

  // Toggle Mic Recognition click
  if (btnVoiceToggle) {
    btnVoiceToggle.addEventListener('click', () => {
      if (!recognition) return;
      
      if (isListening) {
        recognition.stop();
      } else {
        // Cancel active TTS output so it doesn't listen to itself
        cancelSpeechReadout();
        recognition.start();
      }
    });
  }

  // --- Start Interview Simulation Click ---
  btnStart.addEventListener('click', async () => {
    targetRole = roleInput.value.trim();
    if (targetRole.length < 2) return;

    const skillLevel = levelSelect.value;
    const focusType = focusSelect.value;
    const jobDesc = descTextarea.value.trim();

    // Toggle setups UI
    setupCard.style.display = 'none';
    activeCard.style.display = 'none';
    reportCard.style.display = 'none';
    
    loadingText.textContent = 'Calibrating Interviewer Questions';
    loadingOverlay.style.display = 'flex';

    conversationHistory = [];
    questionCount = 1;
    isInterviewConcluded = false;
    chatStream.innerHTML = '';
    turnIndicator.textContent = `Question ${questionCount} of 4`;
    chatInput.value = '';

    const initMessage = `Hi! I am ready to start my mock interview for the role of ${targetRole} (Experience Level: ${skillLevel}) focusing primarily on ${focusType} parameters. Please ask me the first question.`;

    try {
      const response = await fetch('/api/simulator/turn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          history: [],
          message: initMessage
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Server error during interview start');
      }

      const data = await response.json();
      
      // Save model turn
      conversationHistory.push({
        role: 'user',
        parts: [{ text: initMessage }]
      });
      conversationHistory.push({
        role: 'model',
        parts: [{ text: data.reply }]
      });

      // Render model response
      loadingOverlay.style.display = 'none';
      activeCard.style.display = 'block';

      appendMessage('ai', data.reply);
      speakText(data.reply);

      // Trigger automatic voice recognition listening if checked
      if (sttCheckbox.checked && recognition) {
        // Wait briefly for question speak to kick off
        setTimeout(() => {
          if (!window.speechSynthesis.speaking) {
            recognition.start();
          } else {
            // Wait for TTS speech end
            activeInterviewerUtterance.onend = () => {
              recognition.start();
            };
          }
        }, 800);
      }

    } catch (error) {
      console.error('Error starting simulation:', error);
      alert(`Simulation failed to start: ${error.message}\nMake sure local server is running.`);
      setupCard.style.display = 'block';
      loadingOverlay.style.display = 'none';
    }
  });

  // --- Send Message Click ---
  btnSend.addEventListener('click', () => {
    submitUserResponse();
  });

  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitUserResponse();
    }
  });

  async function submitUserResponse() {
    if (isInterviewConcluded) return;

    const answerText = chatInput.value.trim();
    if (answerText.length < 3) return;

    // Acknowledge user input
    appendMessage('user', answerText);
    chatInput.value = '';
    cancelSpeechReadout();

    // Disable inputs
    chatInput.disabled = true;
    btnSend.disabled = true;
    if (btnVoiceToggle) btnVoiceToggle.disabled = true;

    // Append to conversation history
    conversationHistory.push({
      role: 'user',
      parts: [{ text: answerText }]
    });

    // Check if concluding
    questionCount++;
    if (questionCount > 4) {
      isInterviewConcluded = true;
      turnIndicator.textContent = 'Assessment Finished';
      appendSystemBubble('Interview questions complete. Evaluating performance metrics...');
      evaluateInterviewSession();
      return;
    }

    turnIndicator.textContent = `Question ${questionCount} of 4`;

    try {
      const response = await fetch('/api/simulator/turn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          history: conversationHistory.slice(0, -1), // Send history before this latest turn to sync chat instance properly
          message: answerText
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Server error during turn processing');
      }

      const data = await response.json();
      let replyText = data.reply;

      // Handle conclude markers
      if (replyText.includes('[CONCLUDE]')) {
        isInterviewConcluded = true;
        replyText = replyText.replace('[CONCLUDE]', '').trim();
      }

      conversationHistory.push({
        role: 'model',
        parts: [{ text: replyText }]
      });

      appendMessage('ai', replyText);
      speakText(replyText);

      // Re-enable inputs
      chatInput.disabled = false;
      btnSend.disabled = false;
      if (btnVoiceToggle) btnVoiceToggle.disabled = false;

      if (isInterviewConcluded) {
        turnIndicator.textContent = 'Assessment Finished';
        appendSystemBubble('Interview questions complete. Evaluating performance metrics...');
        evaluateInterviewSession();
      } else {
        // Auto trigger mic typing if checked
        if (sttCheckbox.checked && recognition) {
          if (!window.speechSynthesis.speaking) {
            recognition.start();
          } else {
            activeInterviewerUtterance.onend = () => {
              recognition.start();
            };
          }
        }
      }

    } catch (error) {
      console.error('Error submitting response:', error);
      appendSystemBubble(`Network error: ${error.message}. Please click Conclude to view current evaluation reports.`);
      
      chatInput.disabled = false;
      btnSend.disabled = false;
      if (btnVoiceToggle) btnVoiceToggle.disabled = false;
    }
  }

  // --- Conclude and Evaluate Session Click ---
  btnConclude.addEventListener('click', () => {
    cancelSpeechReadout();
    isInterviewConcluded = true;
    evaluateInterviewSession();
  });

  async function evaluateInterviewSession() {
    activeCard.style.display = 'none';
    loadingText.textContent = 'Analyzing Performance Transcripts';
    loadingOverlay.style.display = 'flex';

    try {
      const response = await fetch('/api/simulator/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          history: conversationHistory
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Server failed to grade transcript');
      }

      const evaluation = await response.json();

      // Log report output using Unified Storage
      window.StorageManager.saveScan('interview', evaluation, `Mock Simulator: ${targetRole}`);

      renderReport(evaluation);

    } catch (e) {
      console.error('Error grading chat session:', e);
      alert(`Grading Failed: ${e.message}\nMake sure the local server is running.`);
      activeCard.style.display = 'block';
    } finally {
      loadingOverlay.style.display = 'none';
    }
  }

  function renderReport(data) {
    const score = data.overall_score || 0;
    
    overallScoreNum.textContent = score;

    const percentage = score / 100;
    const offset = GAUGE_CIRCUMFERENCE - (percentage * GAUGE_CIRCUMFERENCE);
    gaugeFill.style.strokeDashoffset = offset;

    // Badge styling class
    fitBadge.className = 'badge-level';
    let colorClass = 'level-high';
    let labelText = 'Needs Development';
    if (score >= 80) {
      colorClass = 'level-low';
      labelText = 'Excellent Role Fit';
    } else if (score >= 50) {
      colorClass = 'level-medium';
      labelText = 'Moderate Role Fit';
    }
    fitBadge.classList.add(colorClass);
    fitBadge.textContent = labelText;

    // Gauge circle coloring
    if (score >= 80) {
      gaugeFill.style.stroke = 'var(--color-safe)';
    } else if (score >= 50) {
      gaugeFill.style.stroke = 'var(--color-warning)';
    } else {
      gaugeFill.style.stroke = 'var(--color-danger)';
    }

    // Technical & Comm Grades
    techGrade.textContent = data.technical_depth || 'N/A';
    commGrade.textContent = data.communication_clarity || 'N/A';

    // Strengths
    strengthsList.innerHTML = '';
    if (data.strengths && data.strengths.length > 0) {
      data.strengths.forEach(s => {
        const li = document.createElement('li');
        li.textContent = s;
        strengthsList.appendChild(li);
      });
    } else {
      strengthsList.innerHTML = '<li>Response structure was acceptable.</li>';
    }

    // Improvements
    improvementsList.innerHTML = '';
    if (data.improvements && data.improvements.length > 0) {
      data.improvements.forEach(imp => {
        const li = document.createElement('li');
        li.textContent = imp;
        improvementsList.appendChild(li);
      });
    } else {
      improvementsList.innerHTML = '<li>No critical improvements suggested.</li>';
    }

    // QA breakdown container
    qaReviewContainer.innerHTML = '';
    if (data.qa_review && data.qa_review.length > 0) {
      qaReviewContainer.innerHTML = data.qa_review.map((item, index) => `
        <div style="border-left: 3px solid var(--border-glow); padding-left: 1rem; margin-bottom: 2rem;">
          <h5 style="color: var(--primary); font-size: 0.95rem; font-weight: 700; margin-bottom: 0.5rem;">Q${index + 1}: ${escapeHtml(item.question)}</h5>
          <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 0.5rem; line-height: 1.4;">
            <strong>Your Response:</strong> "${escapeHtml(item.answer)}"
          </p>
          <div class="sim-card-critique" style="margin-bottom: 0.75rem;">
            <p style="font-size: 0.85rem; color: var(--color-warning); margin-bottom: 0.25rem; font-weight: 600;">
              Critique Evaluation (Score: ${item.score}%):
            </p>
            <p style="font-size: 0.85rem; color: var(--text-secondary);">${escapeHtml(item.critique)}</p>
          </div>
          <p style="font-size: 0.85rem; color: var(--color-safe); line-height: 1.4;">
            <strong>Ideal Response Blueprint:</strong> "${escapeHtml(item.model_answer)}"
          </p>
        </div>
      `).join('');
    } else {
      qaReviewContainer.innerHTML = '<p style="color: var(--text-muted);">No structured answer breakdown details returned.</p>';
    }

    // Display report panel
    reportCard.style.display = 'block';
  }

  // --- Restart Session Click ---
  btnRestart.addEventListener('click', () => {
    reportCard.style.display = 'none';
    setupCard.style.display = 'block';
    // Trigger check
    validateInputs();
  });

  // --- Voice Readout Narration Engine ---
  function speakText(text) {
    if (!ttsCheckbox.checked) return;
    if (!window.speechSynthesis) return;

    // Clean voice synthesis first
    window.speechSynthesis.cancel();

    // Remove concludes or tags
    const cleanedText = text.replace(/\[CONCLUDE\]/g, '').trim();

    activeInterviewerUtterance = new SpeechSynthesisUtterance(cleanedText);
    
    // Choose voice option if available
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Zira')));
    if (premiumVoice) {
      activeInterviewerUtterance.voice = premiumVoice;
    }

    window.speechSynthesis.speak(activeInterviewerUtterance);
  }

  function cancelSpeechReadout() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  // --- UI Helpers for messaging streams ---
  function appendMessage(sender, text) {
    const row = document.createElement('div');
    row.className = `sim-message-row ${sender === 'ai' ? 'ai-row' : 'user-row'}`;

    const bubble = document.createElement('div');
    bubble.className = `sim-bubble ${sender === 'ai' ? 'sim-bubble-ai' : 'sim-bubble-user'}`;
    bubble.textContent = text;

    row.appendChild(bubble);
    chatStream.appendChild(row);
    
    // Scroll chat stream to bottom
    chatStream.scrollTop = chatStream.scrollHeight;
  }

  function appendSystemBubble(text) {
    const bubble = document.createElement('div');
    bubble.style.textAlign = 'center';
    bubble.style.color = 'var(--text-secondary)';
    bubble.style.fontSize = '0.78rem';
    bubble.style.margin = '0.5rem 0';
    bubble.style.fontStyle = 'italic';
    bubble.textContent = `• ${text} •`;
    
    chatStream.appendChild(bubble);
    chatStream.scrollTop = chatStream.scrollHeight;
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

  // Prefill check on load
  validateInputs();
});
