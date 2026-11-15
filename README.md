# BioChip Monitor · MetaMatrix

**NASA Space Apps Challenge 2026 · Team MetaMatrix (IMAMU, Riyadh)**

> Closed-Loop Hybrid System for Early Detection of Cardiovascular Risks among Astronauts during Long-Duration Space Missions.

| | |
|---|---|
| 🚀 **Live demo** | https://tarafals.github.io/biochip-monitor/ |
| 🎬 **Demo video** | _YouTube link: add here_ |
| 📑 **Presentation** | [presentation/MetaMatrix-NASA-Space-Apps.pdf](presentation/MetaMatrix-NASA-Space-Apps.pdf) |

---

## The problem

In microgravity, blood flow changes because normal gravitational forces are missing. Flow in the internal jugular vein (IJV) can slow down or even reverse, which raises the risk of thrombosis (blood clots) during the mission. These changes are hard to detect in real time in space, and the risk can continue after return to Earth while the body readapts to gravity.

## Our idea

A hybrid monitoring system with three parts:

1. **Wearable PPG bracelet**: continuously monitors heart rate and peripheral blood-flow patterns.
2. **Subdermal microfluidic biochip**: monitors internal biochemical markers linked to blood clotting and cardiovascular stress.
3. **AI-powered Digital Twin**: builds a personalized physiological model of each astronaut from their preflight baseline and flags deviations.

The data feeds a **closed loop**: collect → integrate → analyze against the personal baseline → detect risk and alert the medical team. A controlled drug-delivery component (anticoagulant release) is a proposed future capability, shown in the prototype behind a medical approval step.

## The prototype

A responsive web app with simulated chip data, built for **two roles** that share the same data:

- **Astronaut**: their own vitals, alerts and daily log, in plain words.
- **Medical team**: the whole crew, trends, and approval of countermeasures.

And **three interfaces**:

1. **Chip Data**: live readings (heart rate, IJV flow velocity, SpO₂, vein cross-section), a Stagnation Risk Index, yellow and red alerts, biochip markers, PPG bracelet readings, the AI Digital Twin forecast, and the closed-loop anticoagulant release.
2. **Manual Inputs**: astronaut daily check-ins, preflight baseline (MRI, CVP) used by the Digital Twin, clinical notes, and mission phase (in flight or post-flight recovery).
3. **Connection**: the data path from astronaut to Earth, device battery and signal, Earth link latency, and a link-loss simulation where the onboard system keeps working on its own.

**Arabic / English toggle** with full right-to-left layout in Arabic.

### Try it

- Use the **Demo scenario** buttons (Normal, Moderate stasis, Thrombus risk) to drive the readings.
- Open the app in two browser windows on the same computer, one as astronaut and one as medical team. They stay in sync: alerts, approvals, check-ins and link loss show in both.

### Data note

All sensor data is simulated. Thresholds come from the team's data sheet and the NASA-backed IJV stasis study ([Marshall-Goebel et al., JAMA Netw Open 2019](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6882489/)). Biochip and PPG values are illustrative.

## Tech stack

React 19, Vite, Tailwind CSS, Recharts, lucide-react. No backend: the simulation engine runs in the browser.

```
src/
  pages/        ChipData, ManualInputs, Connection (the three interfaces)
  components/   Layout, RoleSelect, ClosedLoop, AlertModal, LanguageToggle
  sim/          simulation engine and shared state
  viz/          ECG trace, vein flow, risk gauge, charts
  i18n.jsx      Arabic and English strings
presentation/   project slides (PDF)
```

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev        # open the printed localhost link
```

## Build

```bash
npm run build          # static site in dist/ (works on GitHub Pages, Netlify, Vercel)
npm run build:single   # one self-contained HTML file in dist/index.html
```

---

## بالعربية

**نظام هجين مغلق الحلقة للكشف المبكر عن مخاطر القلب والأوعية الدموية لدى رواد الفضاء في المهمات الطويلة.**

في انعدام الجاذبية يتغير تدفق الدم في الوريد الوداجي الداخلي، مما يرفع خطر الجلطات أثناء المهمة وبعد العودة إلى الأرض. يجمع نظامنا بين سوار PPG قابل للارتداء، وشريحة حيوية دقيقة تحت الجلد، وتوأم رقمي بالذكاء الاصطناعي يقارن القراءات بخط الأساس الشخصي لكل رائد قبل الرحلة وينبّه الفريق الطبي مبكرًا.

النموذج الأولي تطبيق ويب ببيانات محاكاة، فيه دوران (رائد الفضاء والفريق الطبي) وثلاث واجهات: بيانات الشريحة، والإدخالات اليدوية، ولوحة الاتصال، مع التبديل بين العربية والإنجليزية.

**التجربة المباشرة:** https://tarafals.github.io/biochip-monitor/
