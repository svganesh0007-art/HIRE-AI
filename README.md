# Intelligent Resume Analyzer — Multi-Candidate Screening System

An offline-first, rule-based recruitment screening platform that evaluates **multiple candidate resumes against a single Job Description (JD)**, ranks candidate match scores, and determines **SELECTED** vs **NOT SELECTED** status based on a configurable threshold.

---

## 1. Project Title
**Intelligent Resume Analyzer — Multi-Candidate Screening Platform**

---
## 2.Demo Video

Drive Link:https://drive.google.com/file/d/151Uc4f68CiyHs0EscFgNUPhMbHKJHREL/view?usp=drivesdk

---

## 3. Main Purpose
To streamline HR and recruitment candidate shortlisting by comparing multiple candidate resumes against a target job description in a single operation. The system ranks candidates from highest to lowest match score and classifies each candidate as **SELECTED** or **NOT SELECTED**.

---

## 4. Key Features
- **Multi-File Resume Upload**: Select and process multiple candidate `.txt` files (`Priya_Resume.txt`, `Arun_Resume.txt`, `Karthik_Resume.txt`, `Vasanth_Resume.txt`, etc.) in a single batch.
- **Single Job Description Target**: Paste or upload a common JD text against which all candidate resumes are evaluated.
- **Configurable Selection Threshold**: Interactive slider (default **70%**). Candidates with match score $\ge 70\%$ are classified as **✓ SELECTED**; others are **✕ NOT SELECTED**. Adjusting the slider live-updates selection decisions.
- **Candidate Ranking Table**: Displays candidates ranked by score, status badges, rank indicators (Gold, Silver, Bronze), and expandable rows showing matched vs missing skills for each candidate.
- **Summary Dashboard**: Top metrics displaying `TOTAL CANDIDATES`, `SELECTED`, `NOT SELECTED`, and `BEST MATCH`.
- **Sample Candidates Pre-loader**: One-click demo button populating realistic sample JD and 4 candidate resumes.
- **Export & Print**: Download text screening report summary (`.txt`) or print/save as PDF (`window.print()`).
- **100% Offline & Private**: Zero external libraries, zero frameworks, zero cloud APIs. All processing runs locally in the browser.

---

## 5. Technologies Used
- **HTML5**: Form controls, multi-file inputs (`<input type="file" multiple accept=".txt">`), semantic structure.
- **CSS3**: Custom properties, Flexbox, Grid, rounded framed SaaS layout, responsive styling.
- **Vanilla JavaScript**: Rule-based text preprocessing, keyword extraction, multi-resume FileReader handling, dynamic ranking, threshold evaluation.

---

## 6. How It Works
1. **Input Job Description**: Paste or upload the target role requirements.
2. **Upload Resumes Pool**: Select multiple candidate `.txt` files or drag & drop them into the upload zone.
3. **Compare Candidates**: The engine extracts technical keywords, matches them against every candidate resume, and calculates individual percentage scores.
4. **Rank & Select**: Candidates are sorted in descending order of score. The system applies the selection threshold rule to mark candidates as **SELECTED** or **NOT SELECTED**.

---

## 7. Project Structure
```
intelligent-resume-analyzer/
│
├── index.html        # Framed SaaS Landing Page describing Multi-Candidate Screening
├── analyzer.html     # Multi-Candidate Resume Screening & Ranking Workspace
├── style.css         # Complete CSS design system & responsive styling
├── script.js        # Multi-file FileReader, matching engine, threshold evaluator, ranking table
└── README.md         # Comprehensive documentation
```

---

## 8. Zero External Dependencies Statement
> **Formal Confirmation**: This project contains **NO external packages, libraries, frameworks, or cloud APIs**. No React, Bootstrap, Tailwind, jQuery, Chart.js, OpenAI, or Gemini APIs are used. The application operates 100% locally by opening `index.html` in any web browser.
