# CareerShield AI 🛡️✨

CareerShield AI is a student-focused web application designed to help entry-level job seekers navigate their careers safely and effectively. It provides six key AI-powered tools integrated into a premium, interactive single-page dashboard.

---

## 🚀 Features

1.  **Dashboard Overview**: Track check statistics (total scans, average risk, best resume score, average trust score, active roadmaps, average match score) and visual history timelines powered by Chart.js.
2.  **Scam & Fraud Message Analyzer**: Scrutinizes job descriptions, emails, and chat app messages (Telegram, WhatsApp, etc.) for common recruiting warning signs, providing an objective risk score and detailed recommendations.
3.  **ATS Resume Scorer**: Extracts text directly from uploaded resumes (PDF or TXT) in the browser, grading formatting structures, detecting missing industry keywords, and providing high-impact optimization recommendations.
4.  **Company Trust Analyzer**: Evaluates the legitimacy of hiring companies using Google Search grounding and AI pattern-matching to assess trust indicators.
5.  **Career Roadmap Generator**: Designs customized month-by-month curricula, milestones, and learning resources based on the user's career goals and resume.
6.  **Internship Match Score**: Calculates the percentage alignment of the student's skills profile (pulled from their uploaded resume) with a pasted job description, highlighting skill gaps.
7.  **Interview Prep Workspace**: Generates customized technical and behavioral interview questions and includes an interactive playground sandbox where users can type practice responses and get detailed constructive feedback.

---

## 🛠️ Tech Stack

*   **Frontend**: HTML5, Vanilla CSS3 (Custom Variables, glassmorphic grids), Vanilla JavaScript (SPA tab-routing).
*   **Libraries**: 
    *   [Chart.js](https://www.chartjs.org/) (Timeline tracking visualizers)
    *   [PDF.js](https://mozilla.github.io/pdf.js/) (Client-side PDF text extraction)
*   **Backend**: Minimal Node/Express API proxy server to protect credentials.
*   **AI Engine**: Google Gemini API (`gemini-2.5-flash` model with schema enforcement and Google Search grounding).
*   **Storage**: Abstracted browser `localStorage` manager (fallback-safe and designed to swap directly with Firestore).

---

## ⚠️ Important Disclosure (AI Reasoning Limits)

Please note that both the fraud analysis, resume scoring, and company trust checks utilize **Large Language Model (LLM) reasoning** via the Google Gemini API.
*   They are **not** verified corporate databases or official registries.
*   **Company Trust Analyzer Limits**: Since we do not query WHOIS or commercial registry databases directly, the trust evaluator operates purely on public web search grounding and pattern-matching.
*   Results should be used as advisory suggestions. Always perform standard verification (e.g. searching official state corporate lookup tables, checking LinkedIn company pages, or contacting the company directly) before signing contracts or sharing private banking details.

---

## 📋 Installation & Running Locally

### Prerequisites
*   [Node.js](https://nodejs.org/) installed (v18+ recommended).
*   A Gemini API Key (get one free at [Google AI Studio](https://aistudio.google.com/)).

### Steps

1.  **Clone / Download the project files.**

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**:
    *   Duplicate the `.env` placeholder template (or edit it directly).
    *   Replace `YOUR_GEMINI_API_KEY_HERE` with your actual Google Gemini API key:
    ```ini
    PORT=3000
    GEMINI_API_KEY=AIzaSyD-YOUR-GEMINI-KEY-HERE
    ```
    *   *(Note: If you run the server without editing the key, it will boot in **Demo Mode**, displaying mock simulations of the analyzers so you can still test UI animations immediately!)*

4.  **Run the application**:
    *   For standard production launch:
        ```bash
        npm start
        ```
    *   For hot-reloading development (runs with file watchers):
        ```bash
        npm run dev
        ```

5.  **Open in Browser**:
    *   Navigate to [http://localhost:3000](http://localhost:3000) to access the application.

---

## 🗺️ Phase 3 Roadmap (Future Scope)

The following capabilities are earmarked for future iterations:
*   **Firebase Firestore Database**: Sync history logs to a persistent cloud database.
*   **Firebase Authentication**: Enable multi-device accounts for sync.
*   **Mock Interview Simulator**: Full multi-turn audio or chat interview loop.
