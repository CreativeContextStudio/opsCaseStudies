/**
 * Seed script for Market Intelligence — Case Study #2
 *
 * Creates the "Healthcare AI Sector Monitor" demo with:
 * - 1 project + 1 sector profile
 * - ~2,800 ingested items across 14 trading days
 * - 14 daily briefings with hand-written analyst prose
 * - 14 system runs + output log entries
 *
 * Narrative arc:
 *   Days 1-4:   Baseline — routine monitoring, funding rounds, partnerships
 *   Days 5-7:   FDA catalyst — new draft guidance on AI/ML-based SaMD
 *   Days 8-10:  Industry reaction — pivots, partnerships, analyst coverage
 *   Days 11-14: New landscape — stabilization, major funding round
 *
 * Run: npm run db:seed-market (from packages/db)
 */

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../packages/db/src/schema/index.js'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

// ── Constants ──────────────────────────────────────────────────

const PROJECT_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901'
const PROFILE_ID = 'c3d4e5f6-a7b8-9012-cdef-123456789012'

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(5, 30, 0, 0)
  return d
}

function dateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

// Seeded pseudo-random for reproducible data
let _seed = 42
function seededRandom(): number {
  _seed = (_seed * 1103515245 + 12345) & 0x7fffffff
  return _seed / 0x7fffffff
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(seededRandom() * arr.length)]
}

function randInt(min: number, max: number): number {
  return Math.floor(seededRandom() * (max - min + 1)) + min
}

// ── Company & Title Pools ──────────────────────────────────────

const companies = [
  'Tempus AI', 'Recursion Pharmaceuticals', 'Flatiron Health', 'PathAI', 'Viz.ai',
  'Butterfly Network', 'Aidoc', 'Caption Health', 'Owkin', 'Paige AI',
  'Arterys', 'HeartFlow', 'Cleerly', 'Regard', 'Insilico Medicine',
  'BenevolentAI', 'Exscientia', 'Isomorphic Labs', 'Illumina', 'Genomics England',
  'Subtle Medical', 'Enlitic', 'Lunit', 'Qure.ai', 'Zebra Medical',
  'Whiterabbit.ai', 'Deep Genomics', 'Absci', 'Verge Genomics', 'Valo Health',
]

const sourceTypes = ['news', 'press_release', 'research', 'sec_filing', 'social'] as const
const sourceWeights = [0.60, 0.15, 0.10, 0.08, 0.07]

const categories = ['regulatory', 'funding', 'product_launch', 'partnership', 'earnings', 'research', 'market_shift'] as const
const categoryWeights = [0.18, 0.16, 0.15, 0.14, 0.12, 0.14, 0.11]

const titleTemplates: Record<string, string[]> = {
  news: [
    '${company} Expands AI Diagnostic Platform to New Markets',
    '${company} Reports Progress on ML-Based Drug Discovery Pipeline',
    'Healthcare AI Adoption Accelerates in ${region} Hospital Systems',
    '${company} Partners with Major Health System on Predictive Analytics',
    'New Study Validates ${company} AI Model for Early Detection',
    '${company} CEO Discusses Growth Strategy at JPMorgan Healthcare Conference',
    'AI-Powered Diagnostics Market Expected to Reach $${amount}B by 2028',
    '${company} Receives CE Mark for AI-Assisted Radiology Tool',
    'Digital Health Venture Funding Reaches $${amount}B in Q1',
    '${company} Clinical Trial Shows ${percent}% Improvement in Detection Rate',
  ],
  press_release: [
    '${company} Announces Strategic Partnership with ${partner}',
    '${company} Launches Next-Generation AI Platform for ${application}',
    '${company} Appoints Former FDA Official as Chief Regulatory Officer',
    '${company} Expands Real-World Data Network to ${count} Hospital Sites',
    '${company} Completes Integration with Epic EHR System',
  ],
  research: [
    'Deep Learning Model Achieves ${percent}% Accuracy in ${condition} Screening',
    'Multi-Center Trial: AI-Assisted Pathology Reduces Turnaround by ${percent}%',
    'Federated Learning Approach Shows Promise for Cross-Institutional ${application}',
    'Generative AI for Drug Discovery: A Systematic Review',
    'Regulatory Frameworks for Clinical AI: Comparative Analysis Across ${count} Jurisdictions',
  ],
  sec_filing: [
    '${company} — Form 10-Q Quarterly Report Filed',
    '${company} — Form 8-K: Material Agreement with ${partner}',
    '${company} — S-1 Registration Statement (IPO Filing)',
    '${company} — Proxy Statement: Annual Meeting of Stockholders',
    '${company} — Form 4: Insider Transaction Report',
  ],
  social: [
    'Industry Discussion: ${company} AI Model Performance Under Scrutiny',
    'Healthcare AI Leaders React to ${event}',
    'Trending: ${company} Demo at ${conference} Goes Viral',
    'Expert Commentary: Implications of ${event} for Digital Health',
    'KOL Thread: Why ${company} Approach Differs from Competitors',
  ],
}

const regions = ['Northeast', 'West Coast', 'Midwest', 'European', 'Asia-Pacific']
const applications = ['Pathology', 'Radiology', 'Cardiology', 'Oncology', 'Drug Discovery', 'Clinical Trials']
const conditions = ['Breast Cancer', 'Lung Nodule', 'Cardiac Arrhythmia', 'Diabetic Retinopathy', 'Stroke']
const conferences = ['HIMSS 2026', 'RSNA 2025', 'JP Morgan Healthcare', 'Bio-IT World', 'AACR Annual']
const partners = ['Mayo Clinic', 'Cleveland Clinic', 'Mass General Brigham', 'Roche', 'Siemens Healthineers', 'GE Healthcare', 'Pfizer']
const events = ['FDA Draft Guidance', 'CMS Reimbursement Update', 'HIPAA AI Amendment', 'EU AI Act Implementation']

function fillTemplate(template: string): string {
  return template
    .replace('${company}', pick(companies))
    .replace('${partner}', pick(partners))
    .replace('${region}', pick(regions))
    .replace('${application}', pick(applications))
    .replace('${condition}', pick(conditions))
    .replace('${conference}', pick(conferences))
    .replace('${event}', pick(events))
    .replace('${amount}', String(randInt(1, 12)))
    .replace('${percent}', String(randInt(15, 45)))
    .replace('${count}', String(randInt(5, 50)))
}

function generateTitle(sourceType: string): string {
  const templates = titleTemplates[sourceType] || titleTemplates.news
  return fillTemplate(pick(templates))
}

function generateSnippet(title: string, category: string): string {
  const snippets: Record<string, string[]> = {
    regulatory: [
      `The announcement represents a significant shift in regulatory approach to AI-enabled medical devices. Industry analysts note this could accelerate or delay product approvals depending on companies' existing compliance infrastructure.`,
      `Regulatory experts indicate the new framework will require additional validation data for AI models deployed in clinical settings. Companies with robust real-world evidence programs may see an advantage.`,
    ],
    funding: [
      `The round was led by a consortium of healthcare-focused investors, signaling continued confidence in the AI-driven diagnostic and therapeutic space despite broader market headwinds.`,
      `Proceeds will be directed toward expanding clinical validation studies and scaling commercial operations across new geographies.`,
    ],
    product_launch: [
      `The new platform leverages transformer-based architectures trained on proprietary datasets spanning multiple clinical domains. Early adopter feedback indicates significant workflow improvements.`,
      `Clinical partners report measurable improvements in diagnostic accuracy and turnaround time during beta testing across three hospital systems.`,
    ],
    partnership: [
      `The collaboration will integrate AI-powered analytics into existing clinical workflows, targeting improved patient outcomes and operational efficiency across participating sites.`,
      `Both organizations cite complementary strengths: deep clinical data access paired with advanced machine learning capabilities.`,
    ],
    earnings: [
      `Revenue growth was driven primarily by expansion of enterprise contracts and increased utilization of the AI platform across existing customers.`,
      `Management highlighted improving unit economics and a growing pipeline of health system evaluations as key indicators for continued growth.`,
    ],
    research: [
      `The peer-reviewed study, published in a leading medical journal, demonstrates statistically significant improvements over standard-of-care approaches in a multi-site validation cohort.`,
      `Researchers note the model's performance was consistent across demographic subgroups, addressing a key concern in clinical AI deployment.`,
    ],
    market_shift: [
      `The development signals a broader industry recalibration as healthcare organizations reassess their AI adoption strategies in light of evolving regulatory and reimbursement landscapes.`,
      `Market observers note this could trigger a wave of consolidation as smaller players seek partnerships or acquisition to meet new requirements.`,
    ],
  }
  return pick(snippets[category] || snippets.research)
}

function weightedPick<T>(items: readonly T[], weights: number[]): T {
  const r = seededRandom()
  let cumulative = 0
  for (let i = 0; i < items.length; i++) {
    cumulative += weights[i]
    if (r < cumulative) return items[i]
  }
  return items[items.length - 1]
}

function generateUrl(sourceType: string, company: string): string {
  const slug = company.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const domains: Record<string, string[]> = {
    news: ['reuters.com', 'fiercehealthcare.com', 'statnews.com', 'healthcareitnews.com', 'mobihealthnews.com'],
    press_release: ['businesswire.com', 'prnewswire.com', 'globenewswire.com'],
    research: ['nature.com', 'thelancet.com', 'jamanetwork.com', 'arxiv.org', 'medrxiv.org'],
    sec_filing: ['sec.gov'],
    social: ['twitter.com', 'linkedin.com'],
  }
  const domain = pick(domains[sourceType] || domains.news)
  return `https://${domain}/healthcare-ai/${slug}-${randInt(10000, 99999)}`
}

// ── Day-specific parameters for narrative arc ──────────────────

interface DayConfig {
  day: number
  itemsIngested: number
  regulatoryWeight: number  // boost for FDA catalyst days
}

const dayConfigs: DayConfig[] = [
  // Days 1-4: Baseline
  { day: 13, itemsIngested: 198, regulatoryWeight: 0.18 },
  { day: 12, itemsIngested: 205, regulatoryWeight: 0.18 },
  { day: 11, itemsIngested: 191, regulatoryWeight: 0.18 },
  { day: 10, itemsIngested: 212, regulatoryWeight: 0.18 },
  // Days 5-7: FDA Catalyst
  { day: 9, itemsIngested: 218, regulatoryWeight: 0.35 },
  { day: 8, itemsIngested: 224, regulatoryWeight: 0.40 },
  { day: 7, itemsIngested: 209, regulatoryWeight: 0.32 },
  // Days 8-10: Industry Reaction
  { day: 6, itemsIngested: 215, regulatoryWeight: 0.25 },
  { day: 5, itemsIngested: 201, regulatoryWeight: 0.22 },
  { day: 4, itemsIngested: 207, regulatoryWeight: 0.20 },
  // Days 11-14: New Landscape
  { day: 3, itemsIngested: 196, regulatoryWeight: 0.18 },
  { day: 2, itemsIngested: 203, regulatoryWeight: 0.18 },
  { day: 1, itemsIngested: 211, regulatoryWeight: 0.18 },
  { day: 0, itemsIngested: 199, regulatoryWeight: 0.18 },
]

// ── Briefing Data (14 days) ────────────────────────────────────

interface BriefingData {
  itemsIncluded: number
  executiveSummary: string
  fullBriefing: string
  signals: { title: string; category: string; relevanceScore: number; sourceType: string; snippet: string }[]
}

const briefings: BriefingData[] = [
  // Day 1 - Baseline
  {
    itemsIncluded: 7,
    executiveSummary: 'Quiet open to the trading week. Tempus AI expands molecular profiling to three new cancer types. Recursion Pharmaceuticals reports positive Phase 2 data on its AI-discovered compound for ulcerative colitis. Butterfly Network signs multi-year agreement with HCA Healthcare. No regulatory surprises. Sector fundamentals stable.',
    fullBriefing: `## Tempus AI Expands Molecular Profiling to Three New Cancer Types\n\nTempus announced expansion of its xT assay to cover bladder, ovarian, and head-and-neck cancers. The move adds approximately 180,000 new annual US cases to the platform's addressable market. Validation data from 1,200 patient samples showed concordance rates above 98% with gold-standard methods.\n\n## Recursion Reports Positive Phase 2 Data for REC-4881\n\nRecursion Pharmaceuticals disclosed interim Phase 2 results for REC-4881, an AI-discovered small molecule targeting MAPK pathway dysregulation in ulcerative colitis. The 120-patient trial showed statistically significant improvement in clinical remission at 12 weeks (34% vs 18% placebo). The compound was identified through Recursion's phenomics platform in under 18 months.\n\n## Butterfly Network Signs Multi-Year HCA Healthcare Agreement\n\nButterfly Network's handheld ultrasound platform will deploy across 42 HCA Healthcare facilities under a three-year enterprise agreement. The deal includes Butterfly's AI-assisted image interpretation features and is valued at an estimated $28M.\n\n## PathAI Publishes Validation Study in Nature Medicine\n\nPathAI's AI-powered pathology platform demonstrated 97.3% concordance with expert pathologist consensus reads in a 5,000-slide breast cancer grading study. The multi-site validation included 12 academic medical centers.\n\n## Viz.ai Receives FDA Clearance for Aortic Aneurysm Detection\n\nViz.ai received 510(k) clearance for its AI algorithm detecting aortic aneurysms in CT imaging. This marks the company's 12th FDA-cleared algorithm. The system demonstrated 94% sensitivity and 96% specificity in the submission dataset.\n\n## Digital Health VC Investment Steady in Q1\n\nVenture capital investment in healthcare AI reached $2.8B in Q1 2026, roughly flat with Q4 2025. Diagnostic AI led with 38% of deal volume. Drug discovery AI saw a slight decline in mega-rounds but maintained steady Series A/B activity.\n\n## Exscientia Reports Q1 Revenue Growth of 42%\n\nExscientia posted Q1 revenue of $48M, up 42% year-over-year, driven by milestone payments from its Sanofi and Bristol-Myers Squibb collaborations. Management reaffirmed full-year guidance and highlighted three new AI-designed compounds entering IND-enabling studies.`,
    signals: [
      { title: 'Tempus AI Expands Molecular Profiling to Three New Cancer Types', category: 'product_launch', relevanceScore: 88, sourceType: 'news', snippet: 'The xT assay expansion adds bladder, ovarian, and head-and-neck cancers, representing approximately 180,000 new annual US cases addressable by the platform.' },
      { title: 'Recursion Reports Positive Phase 2 Data for AI-Discovered Compound REC-4881', category: 'research', relevanceScore: 91, sourceType: 'press_release', snippet: 'Interim Phase 2 results show statistically significant improvement in clinical remission for ulcerative colitis (34% vs 18% placebo). Compound was identified via phenomics platform in under 18 months.' },
      { title: 'Butterfly Network Signs $28M Multi-Year Agreement with HCA Healthcare', category: 'partnership', relevanceScore: 82, sourceType: 'news', snippet: 'Three-year enterprise deployment across 42 HCA facilities. Includes AI-assisted image interpretation features.' },
      { title: 'PathAI Publishes Nature Medicine Validation: 97.3% Concordance in Breast Cancer Grading', category: 'research', relevanceScore: 85, sourceType: 'research', snippet: 'Multi-site validation across 12 academic medical centers with 5,000-slide dataset demonstrates concordance with expert pathologist consensus.' },
      { title: 'Viz.ai Receives 12th FDA Clearance for Aortic Aneurysm Detection Algorithm', category: 'regulatory', relevanceScore: 79, sourceType: 'news', snippet: '510(k) clearance for aortic aneurysm detection in CT imaging. 94% sensitivity, 96% specificity in submission dataset.' },
      { title: 'Healthcare AI Venture Capital Steady at $2.8B in Q1 2026', category: 'funding', relevanceScore: 74, sourceType: 'news', snippet: 'Diagnostic AI led with 38% of deal volume. Drug discovery AI maintained steady Series A/B activity despite slight decline in mega-rounds.' },
      { title: 'Exscientia Posts Q1 Revenue of $48M, Up 42% YoY', category: 'earnings', relevanceScore: 76, sourceType: 'sec_filing', snippet: 'Growth driven by Sanofi and BMS collaboration milestones. Three new AI-designed compounds entering IND-enabling studies.' },
    ],
  },
  // Day 2 - Baseline
  {
    itemsIncluded: 6,
    executiveSummary: 'Funding activity picks up. Cleerly raises $223M Series C for cardiac AI imaging. Owkin announces federated learning partnership with five European cancer centers. Insilico Medicine compound enters Phase 2 for idiopathic pulmonary fibrosis. Market positioning suggests pre-regulatory-cycle preparations across multiple companies.',
    fullBriefing: `## Cleerly Raises $223M Series C for Cardiac AI Imaging\n\nCleerly closed a $223M Series C led by T. Rowe Price with participation from Fidelity and Vanguard. The AI-powered cardiac imaging company will use proceeds to expand commercial operations and fund two pivotal trials for its coronary artery disease assessment platform. CEO James Min cited "unprecedented payer interest" in AI-guided cardiac risk stratification.\n\n## Owkin Launches Federated Learning Consortium with Five European Cancer Centers\n\nOwkin announced a multi-year federated learning initiative with Institut Gustave Roussy, Charité Berlin, Karolinska Institute, Vall d'Hebron, and University of Cambridge. The consortium will train AI models across 2.1M patient records without centralizing data. Initial focus: predicting immunotherapy response in non-small cell lung cancer.\n\n## Insilico Medicine IPF Compound Enters Phase 2\n\nInsilico Medicine's ISM001-055, a first-in-class TNIK inhibitor discovered entirely by AI, has enrolled its first patient in Phase 2 for idiopathic pulmonary fibrosis. The compound was designed, synthesized, and advanced to clinical trials in under 30 months. This represents the fastest AI-to-clinic timeline in the industry.\n\n## Aidoc Processes 10 Millionth Clinical Case\n\nAidoc announced it has processed its 10 millionth clinical case through its AI radiology triage platform, deployed across 1,200+ facilities globally. The company reports average time-to-notification of under 90 seconds for critical findings.\n\n## Lunit Receives FDA Breakthrough Device Designation for Breast Cancer AI\n\nLunit's AI algorithm for detecting breast cancer in mammography received FDA Breakthrough Device designation, providing an expedited pathway to potential clearance. The algorithm demonstrated 11% improvement in cancer detection rates in a 50,000-case retrospective study.\n\n## GE Healthcare-Caption Health Integration Reaches 200 Hospital Sites\n\nGE Healthcare's AI-guided ultrasound technology (acquired via Caption Health) is now deployed at 200 hospital sites across the US and Europe, up from 85 sites at the start of Q1. The technology enables non-specialist clinicians to perform diagnostic-quality cardiac ultrasound examinations.`,
    signals: [
      { title: 'Cleerly Raises $223M Series C for AI-Powered Cardiac Imaging', category: 'funding', relevanceScore: 92, sourceType: 'news', snippet: 'Led by T. Rowe Price with Fidelity and Vanguard. Proceeds for commercial expansion and two pivotal trials. CEO cites "unprecedented payer interest" in AI cardiac risk stratification.' },
      { title: 'Owkin Launches Federated Learning Consortium Across Five European Cancer Centers', category: 'partnership', relevanceScore: 86, sourceType: 'press_release', snippet: 'Multi-year initiative with Gustave Roussy, Charité, Karolinska, Vall d\'Hebron, and Cambridge. Training AI on 2.1M patient records. Focus: immunotherapy response in NSCLC.' },
      { title: 'Insilico Medicine IPF Compound ISM001-055 Enters Phase 2 — Fastest AI-to-Clinic Timeline', category: 'research', relevanceScore: 89, sourceType: 'news', snippet: 'First-in-class TNIK inhibitor discovered entirely by AI. Design to Phase 2 in under 30 months. First patient enrolled for idiopathic pulmonary fibrosis.' },
      { title: 'Aidoc Reaches 10 Million Clinical Cases Processed', category: 'product_launch', relevanceScore: 77, sourceType: 'press_release', snippet: 'Deployed across 1,200+ facilities globally. Average time-to-notification under 90 seconds for critical findings.' },
      { title: 'Lunit Receives FDA Breakthrough Device Designation for Mammography AI', category: 'regulatory', relevanceScore: 84, sourceType: 'news', snippet: 'Expedited pathway to clearance. Algorithm showed 11% improvement in cancer detection in 50,000-case retrospective study.' },
      { title: 'GE Healthcare-Caption Health AI Ultrasound Reaches 200 Hospital Sites', category: 'product_launch', relevanceScore: 73, sourceType: 'news', snippet: 'Up from 85 sites at Q1 start. Enables non-specialist clinicians to perform diagnostic-quality cardiac ultrasound.' },
    ],
  },
  // Day 3 - Baseline
  {
    itemsIncluded: 8,
    executiveSummary: 'Healthcare AI sector shows breadth across multiple verticals. BenevolentAI discloses positive interim data from atopic dermatitis trial. Paige AI secures $75M credit facility for international expansion. Illumina partners with Genomics England on whole-genome AI platform. Multiple mid-tier companies filing for regulatory clearances suggest a crowding pipeline environment entering Q2.',
    fullBriefing: `## BenevolentAI Reports Positive Interim Data for Atopic Dermatitis Compound\n\nBenevolentAI's BEN-8744, a selective TYK2/JAK1 inhibitor discovered through its AI platform, showed dose-dependent improvements in EASI-75 scores at 12 weeks in a Phase 2a trial involving 156 patients with moderate-to-severe atopic dermatitis. The company noted the compound's selectivity profile may offer a differentiated safety advantage over existing JAK inhibitors.\n\n## Paige AI Secures $75M Credit Facility from Silicon Valley Bank\n\nPaige AI secured a $75M venture debt facility to fund international expansion of its AI-powered digital pathology platform. The company plans to open offices in London and Tokyo and expand its sales team from 45 to 80 by year-end. Paige has FDA-cleared products in prostate and breast cancer pathology.\n\n## Illumina and Genomics England Announce AI-Powered Whole Genome Platform\n\nIllumina and Genomics England announced a joint initiative to build an AI-powered interpretation engine for the UK's 100,000 Genomes Project dataset. The platform will leverage Illumina's DRAGEN Bio-IT infrastructure and Genomics England's curated variant databases. Initial focus: rare disease diagnosis and pharmacogenomics.\n\n## Subtle Medical Raises $18M Series B for AI-Enhanced Medical Imaging\n\nSubtle Medical closed an $18M Series B for its AI software suite that enhances MRI and PET scan quality while reducing scan times by up to 4x. FDA-cleared products are deployed across 150 imaging centers.\n\n## HeartFlow Reports 45% Revenue Growth in Q1\n\nHeartFlow reported Q1 revenue of $62M, up 45% year-over-year. The company's AI-powered non-invasive FFR-CT analysis for coronary artery disease saw 30% growth in Medicare reimbursement claims. Management announced expansion into peripheral artery disease assessment.\n\n## Qure.ai Deploys Chest X-Ray AI in 14 African Nations\n\nQure.ai's AI-powered chest X-ray interpretation tool has been deployed across screening programs in 14 African nations, processing over 500,000 scans to date. The WHO-prequalified technology targets tuberculosis and other pulmonary conditions in resource-limited settings.\n\n## Zebra Medical Vision Acquires Radiology AI Startup for $45M\n\nZebra Medical Vision acquired a small radiology AI company focused on musculoskeletal imaging for $45M. The acquisition adds three FDA-cleared algorithms for bone fracture and joint degeneration detection to Zebra's portfolio.\n\n## Regard Raises $40M to Expand AI Clinical Decision Support\n\nRegard, which provides AI-powered clinical decision support for inpatient settings, raised $40M in a round led by Foundation Medicine founder backing. The platform analyzes patient records in real-time to flag missed diagnoses.`,
    signals: [
      { title: 'BenevolentAI Reports Positive Phase 2a Data for AI-Discovered Atopic Dermatitis Compound', category: 'research', relevanceScore: 87, sourceType: 'press_release', snippet: 'BEN-8744 shows dose-dependent EASI-75 improvements in 156 patients. Selective TYK2/JAK1 inhibitor may offer differentiated safety profile.' },
      { title: 'Paige AI Secures $75M Venture Debt for International Expansion', category: 'funding', relevanceScore: 81, sourceType: 'news', snippet: 'Plans London and Tokyo offices. Sales team expansion from 45 to 80. FDA-cleared products in prostate and breast cancer pathology.' },
      { title: 'Illumina and Genomics England Launch AI-Powered Whole Genome Interpretation Engine', category: 'partnership', relevanceScore: 88, sourceType: 'press_release', snippet: 'Joint initiative on 100,000 Genomes Project dataset. DRAGEN Bio-IT infrastructure. Focus: rare disease diagnosis and pharmacogenomics.' },
      { title: 'Subtle Medical Raises $18M Series B for AI-Enhanced MRI and PET Imaging', category: 'funding', relevanceScore: 72, sourceType: 'news', snippet: 'AI software reduces scan times by up to 4x. FDA-cleared. Deployed across 150 imaging centers.' },
      { title: 'HeartFlow Reports 45% Revenue Growth, Expands to Peripheral Artery Disease', category: 'earnings', relevanceScore: 83, sourceType: 'sec_filing', snippet: 'Q1 revenue $62M. 30% growth in Medicare reimbursement claims for FFR-CT analysis. New PAD assessment product announced.' },
      { title: 'Qure.ai Chest X-Ray AI Deployed in 14 African Nations, 500K Scans Processed', category: 'product_launch', relevanceScore: 78, sourceType: 'news', snippet: 'WHO-prequalified tuberculosis screening technology. Over 500,000 scans in resource-limited settings.' },
      { title: 'Zebra Medical Acquires MSK Imaging AI Startup for $45M', category: 'market_shift', relevanceScore: 75, sourceType: 'news', snippet: 'Adds three FDA-cleared algorithms for bone fracture and joint degeneration. Consolidation trend in radiology AI continues.' },
      { title: 'Regard Raises $40M for AI-Powered Inpatient Clinical Decision Support', category: 'funding', relevanceScore: 74, sourceType: 'news', snippet: 'Real-time patient record analysis to flag missed diagnoses. Led by Foundation Medicine founder.' },
    ],
  },
  // Day 4 - Baseline (pre-catalyst)
  {
    itemsIncluded: 6,
    executiveSummary: 'Routine but notable signals today. Isomorphic Labs (DeepMind) publishes breakthrough protein-ligand binding predictions. Flatiron Health partners with NCI on real-world oncology data sharing. Several companies filing pre-submission meetings with FDA suggest regulatory activity is building. Sector is positioning ahead of expected FDA guidance cycle.',
    fullBriefing: `## Isomorphic Labs Publishes Breakthrough Protein-Ligand Binding Predictions\n\nIsomorphic Labs, Alphabet's drug discovery subsidiary spun out of DeepMind, published results in Science demonstrating their AI model predicts protein-ligand binding affinities with unprecedented accuracy. The model achieved a correlation of 0.89 against experimental data across 12 protein families, significantly outperforming existing docking methods. This has immediate implications for the computational drug discovery pipeline.\n\n## Flatiron Health Partners with NCI on Real-World Oncology Data Sharing\n\nFlatiron Health (Roche) announced a five-year data sharing agreement with the National Cancer Institute. The initiative will provide NCI researchers access to de-identified real-world oncology data from Flatiron's network of 280+ community oncology practices. The arrangement includes AI-powered data curation to standardize unstructured clinical notes.\n\n## Pre-Submission Activity Suggests Building FDA Pipeline\n\nAt least four healthcare AI companies — Aidoc, Cleerly, Enlitic, and Whiterabbit.ai — have disclosed pre-submission meetings with the FDA in recent SEC filings or press communications. The clustering suggests companies are positioning ahead of the agency's anticipated updated guidance on AI/ML-based Software as a Medical Device.\n\n## Absci Raises $120M in Follow-On Offering\n\nAbsci, which combines AI with synthetic biology for drug and target discovery, raised $120M in a follow-on public offering priced at $8.50 per share. Proceeds will fund expansion of the company's generative AI platform for antibody design.\n\n## Deep Genomics Enters Clinical Stage with AI-Designed Oligonucleotide\n\nDeep Genomics announced IND clearance for DG12P1, an antisense oligonucleotide targeting a rare genetic liver disease. The compound was designed using the company's AI platform to identify and correct specific splicing defects. Phase 1 dosing is expected to begin in Q2.\n\n## European Commission Publishes AI Act Implementation Timeline for Medical Devices\n\nThe European Commission released a detailed implementation timeline for the EU AI Act as applied to medical devices. High-risk AI medical devices must comply by August 2027. The timeline was broadly in line with industry expectations but included stricter-than-anticipated post-market surveillance requirements.`,
    signals: [
      { title: 'Isomorphic Labs Publishes Breakthrough Protein-Ligand Binding Predictions in Science', category: 'research', relevanceScore: 93, sourceType: 'research', snippet: 'AI model achieves 0.89 correlation with experimental binding data across 12 protein families. Significantly outperforms existing docking methods.' },
      { title: 'Flatiron Health and NCI Announce Five-Year Real-World Oncology Data Sharing Agreement', category: 'partnership', relevanceScore: 86, sourceType: 'press_release', snippet: 'Access to de-identified data from 280+ community oncology practices. AI-powered data curation for unstructured clinical notes.' },
      { title: 'Four Healthcare AI Companies Disclose FDA Pre-Submission Meetings', category: 'regulatory', relevanceScore: 82, sourceType: 'sec_filing', snippet: 'Aidoc, Cleerly, Enlitic, and Whiterabbit.ai positioning ahead of expected AI/ML SaMD guidance update. Clustered filing activity unusual.' },
      { title: 'Absci Raises $120M Follow-On for Generative AI Antibody Design Platform', category: 'funding', relevanceScore: 78, sourceType: 'sec_filing', snippet: 'Priced at $8.50/share. Proceeds for generative AI platform expansion in antibody design and drug discovery.' },
      { title: 'Deep Genomics Receives IND Clearance for AI-Designed Oligonucleotide DG12P1', category: 'research', relevanceScore: 84, sourceType: 'press_release', snippet: 'Targeting rare genetic liver disease via splicing correction. AI-designed from target ID through compound optimization. Phase 1 in Q2.' },
      { title: 'EU AI Act Medical Device Implementation Timeline Published — Compliance by August 2027', category: 'regulatory', relevanceScore: 80, sourceType: 'news', snippet: 'High-risk medical AI devices must comply by August 2027. Post-market surveillance requirements stricter than expected.' },
    ],
  },
  // Day 5 - FDA Catalyst begins
  {
    itemsIncluded: 9,
    executiveSummary: 'Material regulatory event. The FDA published draft guidance titled "Artificial Intelligence and Machine Learning in Drug Development" — a 47-page framework covering AI/ML applications across the drug lifecycle. Separately, the agency announced expanded Predetermined Change Control Plans for AI-enabled medical devices. Multiple watchlist companies named in the guidance. Immediate market implications across diagnostic and therapeutic AI.',
    fullBriefing: `## FDA Publishes Draft Guidance on AI/ML in Drug Development\n\nThe FDA released a 47-page draft guidance document, "Artificial Intelligence and Machine Learning in Drug Development," establishing a comprehensive framework for AI/ML applications across the pharmaceutical lifecycle. The guidance addresses clinical trial design optimization, real-world evidence generation, biomarker identification, and AI-assisted manufacturing. A 90-day public comment period is open. This is the most significant regulatory framework for AI in drug development since the agency's 2021 action plan.\n\n## FDA Expands Predetermined Change Control Plans for AI Medical Devices\n\nSimultaneously, the FDA announced expanded scope for Predetermined Change Control Plans (PCCPs), allowing AI-enabled medical devices to implement certain algorithm updates without requiring new 510(k) submissions. The announcement names specific algorithmic modification types (retraining with new data, performance threshold adjustments) that qualify. Aidoc, Viz.ai, and Tempus AI were cited as companies with existing approved PCCPs that would benefit from the expanded framework.\n\n## Tempus AI Stock Rises 8% on FDA Guidance\n\nTempus AI shares rose 8% in pre-market trading following the FDA guidance release. Analysts at Morgan Stanley noted the company's existing regulatory infrastructure and broad PCCPs position it as a "primary beneficiary" of the updated framework. Tempus has 7 FDA-cleared AI algorithms and the broadest PCCP scope in the industry.\n\n## Recursion Pharmaceuticals Issues Statement on Drug Development Guidance\n\nRecursion CEO Chris Gibson issued a public statement calling the FDA guidance "a watershed moment for AI-native drug discovery companies." The company highlighted that its Phase 2 programs (REC-4881, REC-3964) align with the guidance's framework for AI-assisted clinical trial design and biomarker strategies.\n\n## Industry Groups React to Regulatory Framework\n\nThe Digital Medicine Society, Health AI Partnership, and American Clinical Informatics Association all issued statements within hours of the guidance release. Common themes: support for the principles-based approach, concerns about retrospective validation data requirements, and requests for clearer guidance on foundational model governance.\n\n## PathAI and Paige AI Both See Regulatory Pathway Clarity\n\nBoth digital pathology leaders issued statements noting that the expanded PCCP framework addresses their top regulatory concern — the ability to update diagnostic algorithms with new training data without re-clearing the entire product. PathAI's CEO noted this "removes the single largest commercial barrier to AI pathology adoption."\n\n## BenevolentAI Highlights Drug Development Guidance Alignment\n\nBenevolentAI noted that its BEN-8744 program (currently in Phase 2a for atopic dermatitis) was designed using AI-assisted target identification methods explicitly addressed in the new FDA framework. The company suggested the guidance may expedite regulatory discussions for AI-discovered compounds.\n\n## Healthcare AI ETF Volumes Surge 340%\n\nThe Global X Artificial Intelligence & Technology ETF (AIQ) and ARK Genomic Revolution ETF (ARKG) both saw trading volumes surge over 300% as investors repositioned around the FDA guidance. Healthcare AI-focused stocks broadly outperformed the S&P Health Care index by 3.2% on the session.\n\n## Expert Analysis: Implications for Pre-Submission Pipeline\n\nRBC Capital Markets published a same-day analysis noting the guidance resolves "12-18 months of regulatory uncertainty" for AI drug development companies. The analysts estimate the expanded PCCP framework could save AI medical device companies an average of $2-4M per product per year in regulatory compliance costs.`,
    signals: [
      { title: 'FDA Publishes 47-Page Draft Guidance on AI/ML in Drug Development', category: 'regulatory', relevanceScore: 98, sourceType: 'news', snippet: 'Comprehensive framework for AI/ML across pharmaceutical lifecycle. Covers trial design, RWE, biomarker ID, AI manufacturing. 90-day comment period. Most significant since 2021 action plan.' },
      { title: 'FDA Expands Predetermined Change Control Plans for AI Medical Devices', category: 'regulatory', relevanceScore: 96, sourceType: 'news', snippet: 'Allows certain algorithm updates without new 510(k) submissions. Aidoc, Viz.ai, and Tempus cited as existing PCCP holders. Major commercial barrier removed.' },
      { title: 'Tempus AI Rises 8% Pre-Market on FDA Guidance — Morgan Stanley Names "Primary Beneficiary"', category: 'market_shift', relevanceScore: 91, sourceType: 'news', snippet: 'Broadest PCCP scope in industry with 7 FDA-cleared algorithms. Existing regulatory infrastructure positions company as immediate beneficiary.' },
      { title: 'Recursion CEO Calls FDA Guidance "Watershed Moment" for AI Drug Discovery', category: 'regulatory', relevanceScore: 87, sourceType: 'press_release', snippet: 'Phase 2 programs align with guidance framework for AI-assisted trial design and biomarker strategies.' },
      { title: 'PathAI and Paige AI: PCCP Expansion "Removes Largest Commercial Barrier" to AI Pathology', category: 'regulatory', relevanceScore: 85, sourceType: 'news', snippet: 'Both digital pathology leaders cite ability to update diagnostic algorithms with new data without full re-clearance as transformative.' },
      { title: 'Industry Groups Issue Statements on FDA AI Framework — Support with Caveats', category: 'regulatory', relevanceScore: 79, sourceType: 'news', snippet: 'Support for principles-based approach. Concerns about retrospective validation requirements and foundational model governance.' },
      { title: 'BenevolentAI: Drug Development Guidance Validates AI-Discovered Compound Pathway', category: 'regulatory', relevanceScore: 78, sourceType: 'press_release', snippet: 'BEN-8744 Phase 2a program designed with AI methods explicitly addressed in new framework. May expedite regulatory discussions.' },
      { title: 'Healthcare AI ETF Volumes Surge 340% on FDA Guidance Day', category: 'market_shift', relevanceScore: 83, sourceType: 'news', snippet: 'AIQ and ARKG volumes up 300%+. Healthcare AI stocks outperform S&P Health Care by 3.2%. Broad investor repositioning.' },
      { title: 'RBC Analysis: FDA Guidance Resolves 12-18 Months of Regulatory Uncertainty', category: 'market_shift', relevanceScore: 81, sourceType: 'research', snippet: 'Expanded PCCP framework estimated to save AI device companies $2-4M per product per year in compliance costs.' },
    ],
  },
  // Day 6 - FDA aftermath
  {
    itemsIncluded: 8,
    executiveSummary: 'Continued fallout from FDA guidance. Viz.ai announces accelerated filing for three new algorithms leveraging expanded PCCP. Exscientia publishes response paper mapping its pipeline to the drug development framework. Cleerly raises guidance estimates citing regulatory clarity. Insilico Medicine evaluates implications for its China-first regulatory strategy. Regulatory category remains elevated.',
    fullBriefing: `## Viz.ai Accelerates Three Algorithm Filings Under Expanded PCCP\n\nViz.ai announced it will accelerate FDA submissions for three new AI algorithms — pulmonary embolism detection, intracranial hemorrhage classification, and cervical spine fracture identification — leveraging the expanded PCCP framework. CEO Chris Mansi stated the regulatory clarity "compresses our submission timeline by approximately 6 months per product."\n\n## Exscientia Publishes White Paper Mapping Pipeline to FDA AI/ML Framework\n\nExscientia published a 22-page response paper detailing how its AI-driven drug design methodology aligns with each section of the FDA's draft guidance. The paper specifically addresses the guidance's requirements for AI model validation, data provenance documentation, and algorithmic transparency in clinical trial design.\n\n## Cleerly Raises Full-Year Guidance on Regulatory Clarity\n\nCleerly raised its full-year revenue guidance from $180-195M to $200-215M, citing the FDA's expanded PCCP framework as removing a key commercial headwind. The cardiac AI imaging company noted that three health system contracts had been "in regulatory holding pattern" and are now expected to close in Q2.\n\n## Insilico Medicine Evaluates Dual-Track Regulatory Approach\n\nInsilico Medicine, which has pursued a China-first regulatory strategy for its AI-discovered compounds, stated it is "actively evaluating" submitting its IPF compound (ISM001-055) under the new FDA framework simultaneously. CEO Alex Zhavoronkov noted the guidance provides "significantly more clarity for AI-native drug developers than existed 48 hours ago."\n\n## Aidoc Sees Enterprise Pipeline Acceleration\n\nAidoc reported that three enterprise-scale hospital system evaluations, collectively representing over 200 facilities, have advanced to contract stage following the FDA guidance. The company's VP of Commercial noted: "The regulatory conversation was the single biggest friction point in our sales cycle. That friction point was substantially reduced this week."\n\n## Arterys (Tempus Subsidiary) Submits Updated PCCP for Cardiac MRI\n\nArterys, now a Tempus AI subsidiary, submitted an updated Predetermined Change Control Plan for its cardiac MRI analysis platform. The submission leverages the expanded framework to include continuous learning capabilities — algorithm updates based on de-identified patient data from deployed sites.\n\n## Senator Warren Requests FDA Briefing on AI Guidance Consumer Protections\n\nSenator Elizabeth Warren sent a letter to FDA Commissioner requesting a briefing on consumer protection provisions in the new AI guidance. The letter specifically asked about patient notification requirements when AI systems are involved in diagnostic or treatment decisions. Industry lobbyists characterized the inquiry as "expected but manageable."\n\n## Goldman Sachs Upgrades Healthcare AI Sector to Overweight\n\nGoldman Sachs upgraded its Healthcare AI sector rating from Market Weight to Overweight, citing the FDA guidance as a "structural de-risking event." The report specifically highlights Tempus AI, Viz.ai, and Recursion Pharmaceuticals as top picks. Price targets raised across the coverage universe.`,
    signals: [
      { title: 'Viz.ai Accelerates Three FDA Submissions Under Expanded PCCP — 6 Month Timeline Compression', category: 'regulatory', relevanceScore: 92, sourceType: 'press_release', snippet: 'Pulmonary embolism, ICH classification, and C-spine fracture algorithms. CEO: regulatory clarity "compresses submission timeline by ~6 months per product."' },
      { title: 'Exscientia Publishes 22-Page Response Mapping Pipeline to FDA AI/ML Framework', category: 'regulatory', relevanceScore: 83, sourceType: 'research', snippet: 'Detailed alignment analysis covering model validation, data provenance, and algorithmic transparency requirements.' },
      { title: 'Cleerly Raises Full-Year Revenue Guidance to $200-215M on FDA PCCP Expansion', category: 'earnings', relevanceScore: 88, sourceType: 'news', snippet: 'Three health system contracts in "regulatory holding pattern" now expected to close Q2. Previous guidance $180-195M.' },
      { title: 'Insilico Medicine Evaluates Dual US/China Regulatory Track for AI-Discovered IPF Compound', category: 'regulatory', relevanceScore: 81, sourceType: 'news', snippet: 'CEO: new guidance provides "significantly more clarity for AI-native drug developers." Considering simultaneous FDA submission for ISM001-055.' },
      { title: 'Aidoc Reports Enterprise Pipeline Acceleration — 200+ Facility Contracts Advancing', category: 'market_shift', relevanceScore: 85, sourceType: 'press_release', snippet: 'Three enterprise evaluations advancing to contract stage. VP Commercial: "Regulatory conversation was single biggest friction point — substantially reduced."' },
      { title: 'Arterys/Tempus Submits Updated PCCP with Continuous Learning Capabilities', category: 'regulatory', relevanceScore: 79, sourceType: 'sec_filing', snippet: 'Leveraging expanded framework for cardiac MRI platform. Includes algorithm updates from deployed site data.' },
      { title: 'Senator Warren Requests FDA Briefing on AI Guidance Consumer Protections', category: 'regulatory', relevanceScore: 76, sourceType: 'news', snippet: 'Letter asks about patient notification when AI involved in diagnostics/treatment. Industry characterizes as "expected but manageable."' },
      { title: 'Goldman Sachs Upgrades Healthcare AI Sector to Overweight — Cites "Structural De-Risking"', category: 'market_shift', relevanceScore: 90, sourceType: 'research', snippet: 'FDA guidance characterized as structural de-risking event. Top picks: Tempus AI, Viz.ai, Recursion. Price targets raised across coverage.' },
    ],
  },
  // Day 7
  {
    itemsIncluded: 7,
    executiveSummary: 'FDA catalyst reverberations continue but moderating. Butterfly Network announces 510(k) filing under expanded framework. Public comment period attracts 200+ submissions in first 48 hours. Recursion partners with Roche on AI-guided clinical trial design. Funding activity: Verge Genomics raises $98M. Market sentiment shifting from reaction to positioning.',
    fullBriefing: `## Butterfly Network Files 510(k) for AI-Enhanced Point-of-Care Diagnostics\n\nButterfly Network submitted a 510(k) application for an expanded AI feature set on its handheld ultrasound platform, leveraging the new PCCP framework. The submission includes automated cardiac function assessment and thyroid nodule classification algorithms. This is the first new filing publicly announced under the expanded framework.\n\n## FDA Draft Guidance Attracts 200+ Public Comments in 48 Hours\n\nThe FDA's draft guidance on AI/ML in drug development attracted over 200 public comment submissions within 48 hours — the highest initial engagement for any medical device guidance in 2026. Comments range from pharmaceutical companies requesting broader scope to patient advocacy groups emphasizing transparency requirements.\n\n## Recursion Pharmaceuticals Partners with Roche on AI-Guided Trial Design\n\nRecursion and Roche announced a strategic collaboration to apply Recursion's AI platform to clinical trial design optimization for Roche's oncology pipeline. The multi-year agreement is valued at up to $300M including milestones. Recursion will leverage its biological map of disease to identify optimal patient stratification and biomarker strategies.\n\n## Verge Genomics Raises $98M Series C for Neuroscience AI\n\nVerge Genomics closed a $98M Series C to advance its AI-powered neuroscience drug discovery platform. Lead compound VRG50635, targeting ALS, is in Phase 1b. The company's platform uses human-derived multi-omics data to identify drug targets, differentiating from structure-based AI approaches.\n\n## Caption Health/GE Healthcare Receives Japanese PMDA Approval\n\nCaption Health's AI-guided ultrasound technology received regulatory approval from Japan's Pharmaceuticals and Medical Devices Agency (PMDA), opening the largest Asian market for the GE Healthcare subsidiary. The approval covers both cardiac and abdominal ultrasound guidance.\n\n## Whiterabbit.ai Completes FDA Pre-Submission for Mammography AI\n\nWhiterabbit.ai disclosed completion of its FDA pre-submission meeting for an AI-powered mammography reading tool. The company reported "constructive engagement" on the regulatory pathway and anticipates formal 510(k) submission in Q3.\n\n## Morgan Stanley: Healthcare AI Revenue Estimates Need Upward Revision\n\nMorgan Stanley's healthcare team published a follow-up note arguing that consensus revenue estimates for healthcare AI companies are "structurally too low" in light of the FDA guidance. The analysts estimate the regulatory clarity could add 15-25% to forward revenue estimates for companies with established PCCP frameworks.`,
    signals: [
      { title: 'Butterfly Network Files First 510(k) Under Expanded PCCP Framework', category: 'regulatory', relevanceScore: 85, sourceType: 'press_release', snippet: 'Automated cardiac function and thyroid nodule classification on handheld platform. First public filing under new framework.' },
      { title: 'FDA Guidance Attracts 200+ Comments in 48 Hours — Highest Engagement in 2026', category: 'regulatory', relevanceScore: 80, sourceType: 'news', snippet: 'Pharma companies request broader scope. Patient advocacy groups emphasize transparency. Signals industry-wide engagement.' },
      { title: 'Recursion and Roche Partner on AI-Guided Clinical Trial Design — Up to $300M', category: 'partnership', relevanceScore: 94, sourceType: 'press_release', snippet: 'Multi-year collaboration applying Recursion AI to Roche oncology pipeline. Patient stratification and biomarker strategy optimization.' },
      { title: 'Verge Genomics Raises $98M Series C for AI-Powered Neuroscience Drug Discovery', category: 'funding', relevanceScore: 84, sourceType: 'news', snippet: 'Lead ALS compound in Phase 1b. Human-derived multi-omics approach differentiates from structure-based AI methods.' },
      { title: 'Caption Health/GE Receives Japanese PMDA Approval — Opens Largest Asian Market', category: 'regulatory', relevanceScore: 82, sourceType: 'news', snippet: 'Cardiac and abdominal ultrasound AI guidance approved. Japan represents significant growth market for GE Healthcare subsidiary.' },
      { title: 'Whiterabbit.ai Completes FDA Pre-Submission for Mammography AI', category: 'regulatory', relevanceScore: 73, sourceType: 'press_release', snippet: 'Reports "constructive engagement" on pathway. Formal 510(k) expected Q3.' },
      { title: 'Morgan Stanley: Consensus Revenue Estimates "Structurally Too Low" for Healthcare AI', category: 'market_shift', relevanceScore: 87, sourceType: 'research', snippet: 'Regulatory clarity could add 15-25% to forward revenue estimates for companies with established PCCPs.' },
    ],
  },
  // Day 8 - Industry Reaction
  {
    itemsIncluded: 7,
    executiveSummary: 'Reaction phase begins. Flatiron Health restructures regulatory team to align with new framework. Owkin pivots federated learning consortium to include drug development applications. Two mid-tier acquisitions announced as consolidation accelerates. BenevolentAI announces Phase 2b expansion for BEN-8744. Sector moving from commentary to concrete strategic repositioning.',
    fullBriefing: `## Flatiron Health Restructures Regulatory Affairs Division\n\nFlatiron Health (Roche) announced a restructuring of its regulatory affairs division, creating a new "AI Regulatory Strategy" team dedicated to navigating the FDA's AI/ML framework. The 12-person team will be led by a newly hired VP with former FDA CDRH experience. Flatiron cited the "materially changed regulatory landscape" as necessitating dedicated expertise.\n\n## Owkin Expands Federated Learning Consortium to Drug Development\n\nOwkin announced expansion of its European federated learning consortium to include AI-guided drug development applications. The pivot, announced just two weeks after the consortium's launch, adds pharmaceutical trial design optimization to the original diagnostic AI scope. Owkin CEO Thomas Clozel stated: "The FDA guidance creates a clear framework for the exact type of federated drug discovery we've been building."\n\n## Enlitic Acquires Radiology Workflow Company for $32M\n\nEnlitic acquired a small radiology workflow management company for $32M, adding PACS integration and clinical workflow orchestration to its AI diagnostic platform. The acquisition positions Enlitic as an end-to-end radiology AI provider.\n\n## BenevolentAI Announces Phase 2b Expansion for Atopic Dermatitis Compound\n\nBenevolentAI announced expansion of its Phase 2a atopic dermatitis trial (BEN-8744) to Phase 2b, enrolling an additional 300 patients across 40 sites. The expansion was enabled by the positive interim data disclosed earlier this month and will evaluate two dose levels over 24 weeks.\n\n## Lunit Partners with Siemens Healthineers on Integrated AI Diagnostics\n\nLunit announced a strategic partnership with Siemens Healthineers to integrate its breast cancer AI into Siemens' mammography systems. The partnership includes joint commercialization in 15 markets and represents Lunit's largest distribution agreement to date.\n\n## Valo Health Raises $65M Series D for AI-Driven Precision Medicine\n\nValo Health closed a $65M Series D round for its AI-driven precision medicine platform that combines computational chemistry, clinical data, and genomics. The company's lead compound, targeting a rare cardiovascular condition, is in Phase 1.\n\n## Healthcare AI M&A Volume Doubles Quarter-Over-Quarter\n\nDealogic data shows healthcare AI M&A transaction volume doubled in Q1 compared to Q4 2025, driven by strategic acquirers positioning for the regulatory clarity provided by recent FDA actions. Average deal size increased 40% to $78M.`,
    signals: [
      { title: 'Flatiron Health Creates Dedicated "AI Regulatory Strategy" Team — 12 Staff, Former FDA VP', category: 'market_shift', relevanceScore: 86, sourceType: 'news', snippet: 'New VP with former FDA CDRH experience. Cites "materially changed regulatory landscape." Signals major organizational commitment.' },
      { title: 'Owkin Pivots Federated Learning Consortium to Include Drug Development', category: 'partnership', relevanceScore: 84, sourceType: 'press_release', snippet: 'Adds pharma trial design optimization to diagnostic scope. CEO: FDA guidance "creates clear framework for federated drug discovery."' },
      { title: 'Enlitic Acquires Radiology Workflow Company for $32M — Positions as End-to-End AI Provider', category: 'market_shift', relevanceScore: 77, sourceType: 'news', snippet: 'Adds PACS integration and clinical workflow orchestration. Consolidation play in post-guidance radiology AI market.' },
      { title: 'BenevolentAI Expands Phase 2a to Phase 2b for BEN-8744 — 300 Additional Patients', category: 'research', relevanceScore: 88, sourceType: 'press_release', snippet: 'Expansion to 40 sites, two dose levels, 24-week evaluation. Enabled by positive interim data.' },
      { title: 'Lunit and Siemens Healthineers Partner on Integrated Breast Cancer AI — 15 Markets', category: 'partnership', relevanceScore: 87, sourceType: 'press_release', snippet: 'Joint commercialization of AI-integrated mammography. Lunit\'s largest distribution agreement to date.' },
      { title: 'Valo Health Raises $65M Series D for AI-Driven Precision Medicine Platform', category: 'funding', relevanceScore: 76, sourceType: 'news', snippet: 'Computational chemistry + clinical data + genomics. Lead compound for rare cardiovascular condition in Phase 1.' },
      { title: 'Healthcare AI M&A Volume Doubles QoQ — Average Deal Size Up 40% to $78M', category: 'market_shift', relevanceScore: 82, sourceType: 'news', snippet: 'Dealogic data shows strategic acquirers positioning for regulatory clarity. Consolidation accelerating.' },
    ],
  },
  // Day 9
  {
    itemsIncluded: 6,
    executiveSummary: 'Continued positioning. Tempus AI announces $200M expansion of multimodal data platform. Recursion shares additional detail on Roche collaboration scope. Illumina integrates AI variant calling into clinical genome sequencing. Smaller companies face headwinds — two report delaying IPO timelines citing increased regulatory compliance costs.',
    fullBriefing: `## Tempus AI Announces $200M Expansion of Multimodal Data Platform\n\nTempus AI announced a $200M investment in expanding its multimodal data platform, including genomic, clinical, imaging, and real-world evidence data. The expansion will add 15 new data partnerships with health systems and create a dedicated "AI Model Hub" for third-party algorithm deployment. Tempus positioned the investment as capitalizing on the regulatory clarity provided by the FDA's expanded PCCP framework.\n\n## Recursion Shares Roche Collaboration Technical Details\n\nRecursion published additional details on its $300M Roche collaboration, revealing that the partnership will apply Recursion's biological map to optimize patient selection for three specific oncology programs (undisclosed targets). The collaboration will also develop novel biomarkers using Recursion's cellular imaging platform.\n\n## Illumina Integrates AI Variant Calling into Clinical Sequencing Platform\n\nIllumina announced integration of its DRAGEN AI variant calling algorithms into the MiSeqDx clinical genome sequencing platform. The update, which received FDA clearance as a software modification, improves detection of structural variants and reduces false-positive rates by 30%. Available immediately to existing MiSeqDx customers.\n\n## Two Smaller AI Companies Delay IPO Timelines\n\nTwo mid-stage healthcare AI companies (unnamed in filings, but identified by bankers as a radiology AI and a pathology AI startup) have delayed planned IPO timelines, citing increased regulatory compliance costs associated with the new FDA framework. Analysts note the guidance, while beneficial for established players, creates a "compliance moat" that may disadvantage smaller companies.\n\n## Regard Expands Clinical Decision Support to Outpatient Settings\n\nRegard, the AI-powered clinical decision support company, announced expansion of its platform to outpatient settings. The move follows the $40M raise earlier this month and targets the primary care market, where missed diagnoses account for an estimated $80B in annual healthcare costs.\n\n## Nature Medicine Editorial: "FDA AI Guidance Sets New Global Standard"\n\nNature Medicine published an editorial characterizing the FDA's AI/ML guidance as "the most comprehensive regulatory framework for clinical AI globally" and predicting that international regulators will use it as a template. The editorial specifically praised the PCCP expansion as "balancing innovation speed with patient safety."`,
    signals: [
      { title: 'Tempus AI Announces $200M Multimodal Data Platform Expansion and AI Model Hub', category: 'market_shift', relevanceScore: 91, sourceType: 'press_release', snippet: '15 new health system data partnerships. Dedicated third-party algorithm deployment hub. Positioned as capitalizing on PCCP regulatory clarity.' },
      { title: 'Recursion Reveals Roche Collaboration Targets Three Oncology Programs', category: 'partnership', relevanceScore: 85, sourceType: 'news', snippet: 'Biological map applied to patient selection optimization. Novel biomarker development via cellular imaging. Three undisclosed oncology targets.' },
      { title: 'Illumina AI Variant Calling Integrated into Clinical MiSeqDx — 30% False Positive Reduction', category: 'product_launch', relevanceScore: 83, sourceType: 'press_release', snippet: 'FDA-cleared software modification. Improved structural variant detection. Available immediately to existing customers.' },
      { title: 'Two Healthcare AI Startups Delay IPOs Citing Increased Compliance Costs', category: 'market_shift', relevanceScore: 80, sourceType: 'news', snippet: 'FDA framework creates "compliance moat" disadvantaging smaller companies. Radiology and pathology AI startups identified by bankers.' },
      { title: 'Regard Expands AI Clinical Decision Support to Outpatient Primary Care', category: 'product_launch', relevanceScore: 74, sourceType: 'press_release', snippet: 'Targets missed diagnosis market estimated at $80B annually. Follows recent $40M raise.' },
      { title: 'Nature Medicine Editorial: FDA AI Guidance "Sets New Global Standard"', category: 'regulatory', relevanceScore: 78, sourceType: 'research', snippet: 'Characterized as "most comprehensive clinical AI framework globally." Predicts international regulators will use as template.' },
    ],
  },
  // Day 10
  {
    itemsIncluded: 7,
    executiveSummary: 'Industry reaction phase winding down. PathAI files updated PCCP for prostate cancer grading. Exscientia announces accelerated IND timelines for two programs. Healthcare AI hiring surges — regulatory affairs roles up 180%. Analyst consensus forming: established players benefit, smaller companies face compliance burden. Transition to new landscape beginning.',
    fullBriefing: `## PathAI Files Updated PCCP for Prostate Cancer Grading Algorithm\n\nPathAI submitted an updated Predetermined Change Control Plan for its flagship prostate cancer Gleason grading algorithm. The updated PCCP leverages the expanded framework to include continuous algorithm improvement based on pathologist feedback and additional tissue samples. PathAI stated this will enable "near-real-time algorithm refinement" for the first time in digital pathology.\n\n## Exscientia Announces Accelerated IND Timelines for Two Programs\n\nExscientia announced it will accelerate IND submissions for two oncology programs by approximately 4 months each, citing the FDA's drug development guidance as providing a clearer pathway for AI-designed molecules. The programs target CDK7 (breast cancer) and A2a receptor (immuno-oncology).\n\n## Healthcare AI Regulatory Affairs Hiring Surges 180%\n\nLinkedIn data shows healthcare AI companies have increased regulatory affairs job postings by 180% since the FDA guidance release. Companies including Tempus, Viz.ai, Aidoc, and PathAI have posted senior regulatory roles. A recruitment firm noted: "There's a 6-month window where companies with strong regulatory teams will pull ahead."\n\n## Cleerly Announces Payer Coverage Agreement with Aetna\n\nCleerly signed a coverage agreement with Aetna for its AI-powered coronary artery disease assessment, covering approximately 23 million members. The agreement includes value-based pricing tied to patient outcomes. Cleerly cited the FDA's regulatory clarity as "critical to finalizing payer conversations."\n\n## Aidoc Launches Triage Marketplace for Third-Party AI Algorithms\n\nAidoc announced a marketplace feature within its Always-On AI platform, enabling third-party algorithm developers to deploy their models through Aidoc's installed base. The marketplace launches with algorithms from four partners and leverages Aidoc's regulatory infrastructure (including its broad PCCP) for streamlined deployment.\n\n## Isomorphic Labs Expands Team by 50 Researchers\n\nIsomorphic Labs (DeepMind) announced the addition of 50 researchers to its drug discovery team, bringing total headcount to approximately 200. The expansion focuses on medicinal chemistry, ADMET prediction, and clinical development — signaling a shift from pure research to development-stage programs.\n\n## JP Morgan Healthcare AI Investment Survey: 73% Plan to Increase Allocation\n\nA JP Morgan survey of 200 institutional healthcare investors found that 73% plan to increase their allocation to healthcare AI companies over the next 12 months, up from 51% in the previous survey. The primary catalyst cited: "regulatory clarity from the FDA" (89% of respondents).`,
    signals: [
      { title: 'PathAI Files Updated PCCP for Continuous Prostate Cancer Algorithm Improvement', category: 'regulatory', relevanceScore: 86, sourceType: 'press_release', snippet: 'Enables "near-real-time algorithm refinement" via pathologist feedback and new tissue samples. First in digital pathology.' },
      { title: 'Exscientia Accelerates Two IND Submissions by 4 Months Each on FDA Clarity', category: 'research', relevanceScore: 84, sourceType: 'press_release', snippet: 'CDK7 (breast cancer) and A2a receptor (immuno-oncology) programs. AI drug development guidance provides clearer pathway.' },
      { title: 'Healthcare AI Regulatory Affairs Hiring Up 180% Post-Guidance', category: 'market_shift', relevanceScore: 81, sourceType: 'social', snippet: 'Tempus, Viz.ai, Aidoc, PathAI posting senior roles. Recruiter: "6-month window where strong regulatory teams pull ahead."' },
      { title: 'Cleerly Signs Aetna Coverage for AI Cardiac Assessment — 23M Members', category: 'partnership', relevanceScore: 89, sourceType: 'news', snippet: 'Value-based pricing tied to outcomes. Covers 23M Aetna members. FDA regulatory clarity cited as "critical to finalizing payer conversations."' },
      { title: 'Aidoc Launches Third-Party AI Algorithm Marketplace Leveraging PCCP Infrastructure', category: 'product_launch', relevanceScore: 83, sourceType: 'press_release', snippet: 'Four initial partners. Third-party developers deploy through Aidoc installed base. Regulatory infrastructure as platform advantage.' },
      { title: 'Isomorphic Labs Expands to 200 Headcount — Shifting from Research to Development', category: 'market_shift', relevanceScore: 79, sourceType: 'news', snippet: '50 new researchers in medicinal chemistry, ADMET prediction, clinical development. Signals transition to development-stage programs.' },
      { title: 'JP Morgan Survey: 73% of Healthcare Investors Plan to Increase AI Allocation', category: 'funding', relevanceScore: 85, sourceType: 'research', snippet: 'Up from 51% in previous survey. 89% cite "regulatory clarity from FDA" as primary catalyst.' },
    ],
  },
  // Day 11 - New Landscape
  {
    itemsIncluded: 6,
    executiveSummary: 'Landscape stabilizing with new norms. Tempus AI files comprehensive PCCP covering all seven algorithms. Owkin publishes first federated learning results from European consortium. Genomics England platform processes 10,000th clinical genome. Routine business activity returning — the FDA guidance is now priced in. Funding pipeline remains robust.',
    fullBriefing: `## Tempus AI Files Comprehensive PCCP Covering All Seven FDA-Cleared Algorithms\n\nTempus AI submitted a unified Predetermined Change Control Plan encompassing all seven of its FDA-cleared AI algorithms. This is the first "umbrella PCCP" filed under the expanded framework and, if approved, would allow Tempus to update any of its algorithms through a single regulatory mechanism. Analysts called it "a regulatory strategy masterclass."\n\n## Owkin Publishes First Federated Learning Results from European Consortium\n\nOwkin published initial results from its European federated learning consortium, demonstrating that an AI model trained across five institutions (without centralizing data) achieved equivalent performance to a model trained on pooled data for predicting immunotherapy response in NSCLC. The result validates the federated approach for multi-institutional clinical AI.\n\n## Genomics England AI Platform Processes 10,000th Clinical Genome\n\nGenomics England reported that its AI-powered genome interpretation platform, built in partnership with Illumina, has processed its 10,000th clinical genome. The platform has contributed to definitive diagnoses in 42% of rare disease cases, exceeding the 35% benchmark set at launch.\n\n## Paige AI Receives EU CE Mark for Prostate Cancer Algorithm\n\nPaige AI's AI-powered prostate cancer grading algorithm received EU CE Mark approval, clearing the way for commercial deployment across European markets. The company plans to launch in the UK, Germany, and France in Q3.\n\n## Healthcare AI Index Outperforms S&P Healthcare by 8.2% Month-to-Date\n\nA custom healthcare AI index (tracking 25 publicly traded healthcare AI companies) has outperformed the S&P Healthcare index by 8.2% month-to-date. The outperformance is broadly attributed to the FDA regulatory catalyst and subsequent sector repositioning.\n\n## Deep Genomics Presents Phase 1 Safety Data at ASGCT\n\nDeep Genomics presented Phase 1 safety data for its AI-designed oligonucleotide DG12P1 at the American Society of Gene & Cell Therapy annual meeting. The compound was well-tolerated across three dose cohorts with no serious adverse events. Efficacy signals were observed at the two higher doses.`,
    signals: [
      { title: 'Tempus AI Files First-Ever "Umbrella PCCP" Covering All Seven FDA-Cleared Algorithms', category: 'regulatory', relevanceScore: 93, sourceType: 'sec_filing', snippet: 'Single regulatory mechanism for updating all algorithms. Analysts call it "regulatory strategy masterclass." If approved, unprecedented scope.' },
      { title: 'Owkin Federated Learning Matches Pooled-Data Model Performance for NSCLC Immunotherapy', category: 'research', relevanceScore: 87, sourceType: 'research', snippet: 'Five-institution model achieves equivalent accuracy without centralizing data. Validates federated approach for multi-institutional clinical AI.' },
      { title: 'Genomics England AI Platform Hits 10K Clinical Genomes — 42% Rare Disease Diagnosis Rate', category: 'product_launch', relevanceScore: 81, sourceType: 'press_release', snippet: 'Built with Illumina. 42% definitive diagnosis rate exceeds 35% launch benchmark. Demonstrates real-world clinical AI impact at scale.' },
      { title: 'Paige AI Receives EU CE Mark for Prostate Cancer AI — Q3 European Launch Planned', category: 'regulatory', relevanceScore: 79, sourceType: 'news', snippet: 'Clearing UK, Germany, and France markets. Follows FDA clearance. International regulatory momentum for digital pathology.' },
      { title: 'Healthcare AI Index Outperforms S&P Healthcare by 8.2% Month-to-Date', category: 'market_shift', relevanceScore: 77, sourceType: 'news', snippet: 'Custom 25-stock index. Outperformance attributed to FDA regulatory catalyst and sector repositioning.' },
      { title: 'Deep Genomics DG12P1 Phase 1 Data: Well-Tolerated, Efficacy Signals at Higher Doses', category: 'research', relevanceScore: 82, sourceType: 'research', snippet: 'AI-designed oligonucleotide for rare genetic liver disease. No serious adverse events across three dose cohorts. Presented at ASGCT.' },
    ],
  },
  // Day 12
  {
    itemsIncluded: 7,
    executiveSummary: 'New landscape solidifying. Caption Health/GE Healthcare reports 150% increase in US demo requests post-guidance. Recursion publishes additional Roche collaboration biomarker data. Qure.ai expands to screening programs in Latin America. Two new analyst initiations on healthcare AI names. Sector has successfully absorbed the regulatory catalyst and is now operating in a structurally improved environment.',
    fullBriefing: `## Caption Health/GE Reports 150% Increase in US Demo Requests\n\nCaption Health (GE Healthcare) reported a 150% increase in demo requests from US hospital systems since the FDA guidance release. The company attributed the surge to "resolved regulatory uncertainty around AI-guided imaging" and noted that decision-makers who had been in evaluation mode are now "actively pursuing procurement."\n\n## Recursion Publishes Biomarker Discovery Data from Roche Collaboration\n\nRecursion and Roche published preliminary biomarker discovery data from their collaboration, identifying three novel protein biomarkers associated with immunotherapy response in colorectal cancer. The biomarkers were discovered using Recursion's phenomic screening platform and validated in Roche's clinical sample bank of 15,000 patients.\n\n## Qure.ai Expands AI Screening Programs to 6 Latin American Countries\n\nQure.ai announced expansion of its AI-powered medical imaging screening programs to Brazil, Mexico, Colombia, Argentina, Peru, and Chile. The expansion, supported by Pan American Health Organization funding, targets tuberculosis, chest pathology, and head CT screening. Qure.ai now operates in 20+ countries.\n\n## Jefferies Initiates Coverage on Healthcare AI — "Secular Growth Story"\n\nJefferies initiated coverage on 8 healthcare AI companies with a sector thesis of "secular growth catalyzed by regulatory clarity." Top picks: Tempus AI (buy, PT $85), Recursion (buy, PT $18), and HeartFlow (buy, PT $32). The analysts project the addressable market for clinical AI will reach $28B by 2030.\n\n## Subtle Medical Partners with Canon Medical Systems\n\nSubtle Medical announced a partnership with Canon Medical Systems to integrate its AI-enhanced imaging software into Canon's MRI and PET-CT platforms. The agreement covers distribution in North America and Asia-Pacific.\n\n## Illumina Reports 28% Growth in Clinical Genomics Segment\n\nIllumina reported its clinical genomics segment grew 28% in the quarter, driven by AI-enhanced workflow adoption. The company noted that the Genomics England partnership has served as a "proof point" for health system decision-makers evaluating AI-integrated sequencing.\n\n## FDA Publishes Response to Senator Warren: Patient Notification Framework Forthcoming\n\nThe FDA responded to Senator Warren's inquiry, confirming that a separate patient notification framework for AI-assisted diagnostics is under development and expected for public comment in Q3. The response was characterized by industry as "constructive and non-disruptive."`,
    signals: [
      { title: 'Caption Health/GE Reports 150% Surge in US Demo Requests Post-FDA Guidance', category: 'market_shift', relevanceScore: 85, sourceType: 'press_release', snippet: 'Decision-makers moving from evaluation to procurement. Attributed to "resolved regulatory uncertainty around AI-guided imaging."' },
      { title: 'Recursion-Roche Collaboration Identifies Three Novel Immunotherapy Biomarkers', category: 'research', relevanceScore: 88, sourceType: 'research', snippet: 'Colorectal cancer immunotherapy response biomarkers. Phenomic screening platform + 15,000-patient clinical sample bank validation.' },
      { title: 'Qure.ai Expands AI Screening to 6 Latin American Countries — Now in 20+ Nations', category: 'product_launch', relevanceScore: 79, sourceType: 'press_release', snippet: 'PAHO-funded TB, chest pathology, and head CT screening. Brazil, Mexico, Colombia, Argentina, Peru, Chile.' },
      { title: 'Jefferies Initiates Healthcare AI Coverage — Projects $28B Addressable Market by 2030', category: 'market_shift', relevanceScore: 83, sourceType: 'research', snippet: 'Top picks: Tempus (PT $85), Recursion (PT $18), HeartFlow (PT $32). "Secular growth catalyzed by regulatory clarity."' },
      { title: 'Subtle Medical Partners with Canon Medical for AI-Enhanced MRI and PET-CT', category: 'partnership', relevanceScore: 74, sourceType: 'press_release', snippet: 'North America and Asia-Pacific distribution. AI image enhancement integrated into Canon platforms.' },
      { title: 'Illumina Clinical Genomics Segment Grows 28% — AI Workflow Adoption Cited', category: 'earnings', relevanceScore: 82, sourceType: 'sec_filing', snippet: 'Genomics England partnership serves as "proof point" for health system decision-makers. AI-integrated sequencing driving growth.' },
      { title: 'FDA Confirms Patient AI Notification Framework Coming Q3 — Industry Calls "Constructive"', category: 'regulatory', relevanceScore: 78, sourceType: 'news', snippet: 'Response to Senator Warren inquiry. Separate framework for AI-assisted diagnostic notifications. Non-disruptive to current guidance.' },
    ],
  },
  // Day 13
  {
    itemsIncluded: 8,
    executiveSummary: 'The defining event of the new landscape. Tempus AI raises $500M in convertible notes at a $14B valuation — the largest single healthcare AI financing this year. The round signals definitive investor confidence in the post-guidance regulatory environment. Separately, Flatiron publishes landmark RWE study and Viz.ai surpasses 5M clinical cases processed.',
    fullBriefing: `## Tempus AI Raises $500M Convertible Notes at $14B Valuation\n\nTempus AI raised $500M through a convertible notes offering at a $14B implied valuation, representing the largest single healthcare AI financing of 2026. The round was led by SoftBank Vision Fund with participation from existing investors including Google Ventures, NEA, and Baillie Gifford. CEO Eric Lefkofsky stated: "The regulatory environment has never been more favorable for clinical AI at scale." Proceeds will fund the multimodal data platform expansion announced last week and accelerate international regulatory submissions.\n\n## Flatiron Health Publishes Landmark RWE Study: AI-Curated vs. Manual Data Quality\n\nFlatiron Health published a landmark study in JAMA Network Open demonstrating that AI-curated real-world evidence data matched or exceeded manually curated data quality across 12 oncology endpoints, while reducing curation time by 85%. The study, conducted across 280 community oncology practices and 1.2M patient records, is expected to influence regulatory acceptance of AI-curated data for drug approvals.\n\n## Viz.ai Surpasses 5 Million Clinical Cases Processed\n\nViz.ai announced it has processed over 5 million clinical cases through its AI-powered care coordination platform, up from 3.5 million at the start of the year. The company reported that AI-detected critical findings led to measurable improvements in time-to-treatment: 26 minutes faster for stroke, 18 minutes faster for pulmonary embolism.\n\n## Aidoc Closes $60M Growth Round Led by General Atlantic\n\nAidoc raised $60M in a growth round led by General Atlantic, bringing total funding to $250M. The round values Aidoc at approximately $1.4B. Proceeds will fund the AI algorithm marketplace announced earlier this month and expand the company's enterprise sales team.\n\n## Exscientia Receives FDA Fast Track Designation for AI-Designed CDK7 Inhibitor\n\nExscientia received FDA Fast Track designation for its AI-designed CDK7 inhibitor for breast cancer, one of the two programs with accelerated IND timelines. Fast Track designation provides increased FDA interaction and eligibility for priority review.\n\n## Recursion Shares Rise 12% on Updated Roche Milestone Timeline\n\nRecursion shares rose 12% after the company disclosed that two milestones in the Roche collaboration are tracking ahead of schedule, with potential payments of $75M in the current quarter. Analysts noted the milestone acceleration as evidence of the Recursion platform's productivity.\n\n## Arterys/Tempus Receives PCCP Approval for Continuous Learning Cardiac MRI\n\nArterys (Tempus subsidiary) received FDA approval for its updated PCCP, making it the first AI medical device authorized for continuous learning from deployed clinical data. The approval was characterized as a "landmark precedent" for the adaptive AI regulatory pathway.\n\n## Healthcare AI Companies Account for 22% of All FDA AI/ML Submissions YTD\n\nFDA data shows healthcare AI companies have submitted 22% of all AI/ML-related regulatory applications year-to-date, up from 14% in the same period last year. The increase is attributed to both the expanded PCCP framework and overall sector maturation.`,
    signals: [
      { title: 'Tempus AI Raises $500M Convertible Notes at $14B Valuation — Largest Healthcare AI Financing of 2026', category: 'funding', relevanceScore: 97, sourceType: 'news', snippet: 'SoftBank Vision Fund leads. Google Ventures, NEA, Baillie Gifford participate. CEO: "Regulatory environment never more favorable." Funds data platform expansion and international submissions.' },
      { title: 'Flatiron Health JAMA Study: AI-Curated RWE Matches Manual Quality, 85% Faster', category: 'research', relevanceScore: 90, sourceType: 'research', snippet: '1.2M patient records across 280 practices. 12 oncology endpoints. Expected to influence regulatory acceptance of AI-curated evidence for drug approvals.' },
      { title: 'Viz.ai Hits 5M Clinical Cases — 26 Minutes Faster Stroke Treatment', category: 'product_launch', relevanceScore: 84, sourceType: 'press_release', snippet: 'Up from 3.5M at year start. Measurable time-to-treatment improvements: 26 min faster (stroke), 18 min faster (PE).' },
      { title: 'Aidoc Raises $60M at ~$1.4B Valuation — General Atlantic Leads', category: 'funding', relevanceScore: 82, sourceType: 'news', snippet: 'Total funding $250M. Funds AI marketplace and enterprise sales expansion.' },
      { title: 'Exscientia CDK7 Inhibitor Receives FDA Fast Track for Breast Cancer', category: 'regulatory', relevanceScore: 86, sourceType: 'press_release', snippet: 'AI-designed compound. Fast Track provides increased FDA interaction and priority review eligibility.' },
      { title: 'Recursion Shares +12% on Ahead-of-Schedule Roche Milestones — $75M Potential Payment', category: 'earnings', relevanceScore: 85, sourceType: 'news', snippet: 'Two collaboration milestones tracking early. Evidence of Recursion platform productivity.' },
      { title: 'Arterys/Tempus First FDA Approval for Continuous Learning AI Medical Device', category: 'regulatory', relevanceScore: 91, sourceType: 'news', snippet: 'First AI device authorized for continuous learning from deployed clinical data. "Landmark precedent" for adaptive AI pathway.' },
      { title: 'Healthcare AI Submissions Reach 22% of All FDA AI/ML Filings YTD — Up from 14%', category: 'market_shift', relevanceScore: 78, sourceType: 'news', snippet: 'Driven by expanded PCCP framework and sector maturation. Regulatory pipeline deepening significantly.' },
    ],
  },
  // Day 14 - Final day
  {
    itemsIncluded: 7,
    executiveSummary: 'Steady state in the new landscape. BenevolentAI reports Phase 2b enrollment ahead of schedule. Genomics England expands AI platform to include cancer genomics. FDA guidance comment period analysis shows 85% industry support rate. The healthcare AI sector has absorbed its most significant regulatory catalyst in five years and emerged structurally stronger.',
    fullBriefing: `## BenevolentAI Phase 2b Enrollment Running 30% Ahead of Schedule\n\nBenevolentAI reported that enrollment in its expanded Phase 2b trial for BEN-8744 (atopic dermatitis) is running 30% ahead of schedule, with 195 of 300 patients enrolled across 28 of 40 planned sites. The company attributed the rapid enrollment to "strong investigator and patient interest driven by the Phase 2a results and growing confidence in AI-discovered therapeutics."\n\n## Genomics England Expands AI Platform to Include Cancer Genomics\n\nGenomics England announced expansion of its AI-powered genome interpretation platform to include cancer genomics, complementing its existing rare disease focus. The expansion will leverage Illumina's DRAGEN oncology pipeline and is expected to process tumor-normal pairs from 50,000 NHS cancer patients in its first year.\n\n## FDA Guidance Comment Period Analysis: 85% Industry Support Rate\n\nAn analysis of the first 500 public comments on the FDA's AI/ML drug development guidance shows 85% expressing overall support, with the most common constructive criticism targeting retrospective validation requirements (32% of critical comments) and the need for additional guidance on generative AI models (28%). The FDA is expected to issue final guidance by Q4.\n\n## Butterfly Network Reports 65% Revenue Growth in Q1\n\nButterfly Network reported Q1 revenue of $22M, up 65% year-over-year. The handheld ultrasound company attributed growth to the HCA Healthcare enterprise deal and "accelerating hospital system adoption of AI-guided point-of-care imaging." Gross margins improved to 62% from 54% in the prior year.\n\n## HeartFlow Expands AI Cardiac Assessment to Coronary Microvascular Disease\n\nHeartFlow announced expansion of its AI-powered cardiac assessment platform to coronary microvascular disease (CMD), a condition affecting an estimated 3M patients in the US that is frequently underdiagnosed. The new algorithm received FDA 510(k) clearance and is available immediately.\n\n## Recursion CEO Publishes Op-Ed: "The AI Drug Discovery Winter Is Over"\n\nRecursion CEO Chris Gibson published an op-ed in Nature Biotechnology arguing that the healthcare AI sector has transitioned from "hype and skepticism" to "validated productivity." Gibson cited the FDA guidance, the Roche collaboration, and Recursion's own clinical data as evidence of sector maturation.\n\n## Global Healthcare AI Market Projected at $45B by 2030 — McKinsey Report\n\nMcKinsey published a comprehensive report projecting the global healthcare AI market will reach $45B by 2030, up from a previous estimate of $36B. The upward revision was attributed primarily to "faster-than-expected regulatory framework development" and "demonstrated clinical and operational ROI from deployed AI systems."`,
    signals: [
      { title: 'BenevolentAI Phase 2b Enrollment 30% Ahead of Schedule — 195 of 300 Patients', category: 'research', relevanceScore: 84, sourceType: 'press_release', snippet: 'Strong investigator and patient interest. 28 of 40 sites active. Confidence in AI-discovered therapeutics growing.' },
      { title: 'Genomics England Expands AI Platform to Cancer Genomics — 50K NHS Patients Year 1', category: 'product_launch', relevanceScore: 86, sourceType: 'press_release', snippet: 'Complementing rare disease with tumor-normal pair analysis. Illumina DRAGEN oncology pipeline integration.' },
      { title: 'FDA Comment Analysis: 85% Industry Support for AI/ML Guidance — Final Version Expected Q4', category: 'regulatory', relevanceScore: 82, sourceType: 'research', snippet: '500 comments analyzed. Top critiques: retrospective validation requirements (32%) and generative AI guidance gaps (28%).' },
      { title: 'Butterfly Network Q1 Revenue Up 65% to $22M — HCA Enterprise Deal Driving Growth', category: 'earnings', relevanceScore: 79, sourceType: 'sec_filing', snippet: 'Gross margins improve to 62%. HCA deal and "accelerating hospital system adoption of AI-guided imaging" cited.' },
      { title: 'HeartFlow Expands to Coronary Microvascular Disease — 3M US Patients Addressable', category: 'product_launch', relevanceScore: 81, sourceType: 'press_release', snippet: 'FDA 510(k) cleared. Targets frequently underdiagnosed CMD. Available immediately.' },
      { title: 'Recursion CEO Op-Ed in Nature Biotech: "The AI Drug Discovery Winter Is Over"', category: 'market_shift', relevanceScore: 77, sourceType: 'research', snippet: 'Argues sector has transitioned from hype to "validated productivity." Cites FDA guidance, Roche deal, and clinical data as evidence.' },
      { title: 'McKinsey Revises Global Healthcare AI Market Projection Upward to $45B by 2030', category: 'market_shift', relevanceScore: 83, sourceType: 'research', snippet: 'Up from previous $36B estimate. "Faster-than-expected regulatory framework" and "demonstrated clinical ROI" cited as drivers.' },
    ],
  },
]

// ── Seed Functions ─────────────────────────────────────────────

async function cleanup() {
  const rawSql = neon(process.env.DATABASE_URL!)
  await rawSql`DELETE FROM public.output_log WHERE run_id IN (SELECT id FROM public.system_runs WHERE module = 'market')`
  await rawSql`DELETE FROM public.system_runs WHERE module = 'market'`
  await rawSql`DELETE FROM market.ingested_items WHERE profile_id = ${PROFILE_ID}`
  await rawSql`DELETE FROM market.market_briefings WHERE profile_id = ${PROFILE_ID}`
  await rawSql`DELETE FROM market.sector_profiles WHERE id = ${PROFILE_ID}`
  await rawSql`DELETE FROM public.projects WHERE id = ${PROJECT_ID}`
  console.log('✓ Cleaned up existing market data')
}

async function seedProject() {
  await db.insert(schema.projects).values({
    id: PROJECT_ID,
    name: 'Healthcare AI Sector Monitor',
    module: 'market',
    config: {
      sector: 'Healthcare AI',
      deliveryTime: '06:30',
      timezone: 'America/New_York',
      relevanceThreshold: 40,
    },
    active: true,
  })
  console.log('✓ Project created: Healthcare AI Sector Monitor')
}

async function seedProfile() {
  await db.insert(schema.sectorProfiles).values({
    id: PROFILE_ID,
    projectId: PROJECT_ID,
    name: 'Healthcare AI',
    description: 'Artificial intelligence, machine learning, and digital health applications in healthcare — diagnostics, drug discovery, clinical decision support, and medical imaging.',
    keywords: 'artificial intelligence, machine learning, digital health, medical imaging AI, drug discovery AI, clinical decision support, FDA AI, healthcare automation, diagnostic AI, precision medicine',
    watchlistCompanies: 'Tempus AI, Recursion Pharmaceuticals, Flatiron Health, PathAI, Viz.ai, Butterfly Network, Aidoc, Caption Health, Owkin, Paige AI',
    themes: 'FDA regulation, clinical trial automation, diagnostic AI, drug discovery ML, real-world evidence, federated learning, AI medical devices',
    recipientEmail: 'analyst@astrolab.dev',
    active: true,
  })
  console.log('✓ Sector profile created: Healthcare AI')
}

async function seedDay(dayIndex: number) {
  const config = dayConfigs[dayIndex]
  const briefingData = briefings[dayIndex]
  const dayDate = daysAgo(config.day)
  const dateString = dateStr(dayDate)

  // Create system run
  const runId = crypto.randomUUID()
  const startedAt = new Date(dayDate)
  startedAt.setHours(5, 30, 0, 0)
  const completedAt = new Date(startedAt.getTime() + randInt(75, 110) * 1000)

  await db.insert(schema.systemRuns).values({
    id: runId,
    projectId: PROJECT_ID,
    module: 'market',
    status: 'success',
    startedAt,
    completedAt,
    tokenCount: randInt(10000, 15000),
    toolCalls: randInt(12, 18),
    metadata: { sector: 'Healthcare AI', itemsScanned: config.itemsIngested },
  })

  // Create briefing
  const briefingId = crypto.randomUUID()
  await db.insert(schema.marketBriefings).values({
    id: briefingId,
    profileId: PROFILE_ID,
    runId,
    date: dateString,
    itemsIngested: config.itemsIngested,
    itemsIncluded: briefingData.itemsIncluded,
    executiveSummary: briefingData.executiveSummary,
    fullBriefing: briefingData.fullBriefing,
    deliveredTo: 'analyst@astrolab.dev',
  })

  // Create output log
  await db.insert(schema.outputLog).values({
    runId,
    outputType: 'team_brief',
    content: briefingData.executiveSummary,
    deliveredAt: completedAt,
    deliveryStatus: 'delivered',
  })

  // Generate included items (from signals)
  for (const signal of briefingData.signals) {
    const publishedAt = new Date(dayDate)
    publishedAt.setHours(randInt(0, 5), randInt(0, 59), 0, 0)

    const company = pick(companies)
    await db.insert(schema.ingestedItems).values({
      profileId: PROFILE_ID,
      title: signal.title,
      url: generateUrl(signal.sourceType, company),
      publishedAt,
      sourceType: signal.sourceType,
      rawSnippet: signal.snippet,
      relevanceScore: signal.relevanceScore,
      category: signal.category,
      briefingIncluded: true,
      briefingId,
      ingestedAt: startedAt,
    })
  }

  // Generate noise items (the ~190-210 that didn't make the cut)
  const noiseCount = config.itemsIngested - briefingData.itemsIncluded
  const batchSize = 50
  for (let batch = 0; batch < noiseCount; batch += batchSize) {
    const batchItems = []
    const currentBatch = Math.min(batchSize, noiseCount - batch)
    for (let i = 0; i < currentBatch; i++) {
      const sourceType = weightedPick(sourceTypes, sourceWeights)
      // Adjust category weights for FDA catalyst days
      const adjWeights = [...categoryWeights]
      adjWeights[0] = config.regulatoryWeight // regulatory
      const total = adjWeights.reduce((s, w) => s + w, 0)
      const normWeights = adjWeights.map(w => w / total)
      const category = weightedPick(categories, normWeights)

      const publishedAt = new Date(dayDate)
      publishedAt.setHours(randInt(0, 23), randInt(0, 59), 0, 0)

      // Most noise items score low
      let score: number
      const r = seededRandom()
      if (r < 0.70) score = randInt(5, 25)
      else if (r < 0.90) score = randInt(26, 39)
      else score = randInt(40, 65)

      const company = pick(companies)

      batchItems.push({
        profileId: PROFILE_ID,
        title: generateTitle(sourceType),
        url: generateUrl(sourceType, company),
        publishedAt,
        sourceType,
        rawSnippet: generateSnippet(generateTitle(sourceType), category),
        relevanceScore: score,
        category,
        briefingIncluded: false,
        briefingId: null,
        ingestedAt: startedAt,
      })
    }
    await db.insert(schema.ingestedItems).values(batchItems)
  }

  console.log(`✓ Day ${dayIndex + 1} seeded: ${dateString} — ${config.itemsIngested} items, ${briefingData.itemsIncluded} signals`)
}

// ── Main ───────────────────────────────────────────────────────

async function main() {
  console.log('\n🏦 Seeding Market Intelligence — Case Study #2\n')

  await cleanup()
  await seedProject()
  await seedProfile()

  for (let i = 0; i < 14; i++) {
    await seedDay(i)
  }

  console.log('\n✓ Market Intelligence seeded successfully\n')
  console.log(`  Project: Healthcare AI Sector Monitor`)
  console.log(`  Profile: Healthcare AI`)
  console.log(`  Days: 14`)
  console.log(`  Briefings: 14`)
  console.log(`  Est. ingested items: ~${dayConfigs.reduce((s, d) => s + d.itemsIngested, 0)}\n`)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
