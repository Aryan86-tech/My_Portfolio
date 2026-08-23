# Aryan — Personal Portfolio Website

A premium, production-ready personal portfolio website for **Aryan** (Computer Science Engineering student at IIIT Sonepat), featuring a dynamic Persona 5-inspired design language, interactive command wheel menu, frame splash loader, parameter star chart, and crimson red screen wipe transitions.

---

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS Variables & Clip-Paths
- **Animations**: Framer Motion (Page wipe transitions, staggered list entrances, hover scaling)
- **Icons**: Lucide React + Custom SVG Vectors
- **Deployment**: Fully optimized for Vercel

---

## 📁 Project Structure

```
My_Portfolio/
├── public/
│   └── resume/
│       ├── README.md               # Resume placement instructions
│       └── Aryan_Resume.pdf        # Downloadable PDF asset location
├── src/
│   ├── app/
│   │   ├── globals.css            # Custom P5 clip-path polygons, stripes, scrollbars
│   │   ├── layout.tsx             # Root layout, SEO & OpenGraph metadata
│   │   └── page.tsx               # Master App Hub, section router & keyboard shortcuts
│   ├── data/
│   │   └── portfolioData.ts       # Central data store for Aryan's content & info
│   ├── components/
│   │   ├── SplashScreen.tsx       # Intro loading sequence & logo reveal
│   │   ├── CharacterSprite.tsx    # Vector character avatar animation loop
│   │   ├── RadarChart.tsx         # SVG Persona parameter star chart
│   │   ├── NavigationWheel.tsx    # Command wheel hub with skewed hover highlights
│   │   ├── PageTransitionWipe.tsx # Fullscreen crimson red wipe overlay
│   │   ├── Header.tsx             # Top header bar with emblem & route status
│   │   ├── Footer.tsx             # Bottom control bar (● CLOSE  ✕ CONFIRM) & copyright
│   │   ├── SocialIcons.tsx        # Vector icons for GitHub and LinkedIn
│   │   └── sections/
│   │       ├── PersonaSection.tsx        # About Aryan & IIIT Sonepat bio
│   │       ├── EducationSection.tsx      # Academic degree & CGPA 8.35/10
│   │       ├── SkillsSection.tsx         # Technical skills & parameter star chart
│   │       ├── ProjectsSection.tsx       # Process Automation Copilot, Orchestrixx, FixIt Fellows
│   │       ├── ExperienceSection.tsx     # CoGrad Assistant Trainer role
│   │       ├── AchievementsSection.tsx   # Academic excellence cert & hackathon participations
│   │       ├── ExtracurricularSection.tsx # IIT Delhi Volleyball Captain & Team Orchestrixx
│   │       └── ContactSection.tsx        # Direct transmission form & social channels
```

---

## 💻 Getting Started Locally

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Aryan86-tech/My_Portfolio.git
   cd My_Portfolio
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run the Local Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the portfolio.

---

## 🛠️ Building for Production & Vercel Deployment

1. **Test Production Build**:
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**:
   - Push your code to GitHub.
   - Import the repository on [Vercel](https://vercel.com).
   - Vercel automatically detects Next.js and builds the project with zero configuration required.

---

## 📄 Adding Your Resume PDF

Place your resume PDF file at:
`public/resume/Aryan_Resume.pdf`

The "Download Resume" buttons across the website are pre-configured to download this exact file path.
