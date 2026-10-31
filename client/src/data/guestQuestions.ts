// Built-in question bank for guest mode (same 20 Physiology MCQs as server/src/utils/seed.ts).
export interface GuestQuestion {
  _id: string;
  subject: string;
  topic: string;
  subtopic: string;
  difficulty: "easy" | "medium" | "hard";
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  conceptSummary: string;
  wrongOptionExplanations: string[];
  tags: string[];
}

export const guestQuestions: GuestQuestion[] = [
  {
    "_id": "q01",
    "subject": "Physiology",
    "topic": "Cell Physiology",
    "subtopic": "Cell Membrane",
    "difficulty": "easy",
    "questionText": "Which of the following is the primary lipid component of the cell membrane?",
    "options": [
      "Cholesterol",
      "Phospholipids",
      "Sphingolipids",
      "Glycolipids"
    ],
    "correctOptionIndex": 1,
    "explanation": "Phospholipids form the basic bilayer structure of the cell membrane, creating a semi-permeable barrier.",
    "conceptSummary": "The cell membrane is a fluid mosaic model primarily composed of a phospholipid bilayer.",
    "wrongOptionExplanations": [
      "Cholesterol modulates fluidity but is not the primary component",
      "Sphingolipids are present but in smaller amounts",
      "Glycolipids are mainly on the outer leaflet for cell recognition"
    ],
    "tags": [
      "cell-biology",
      "membrane"
    ]
  },
  {
    "_id": "q02",
    "subject": "Physiology",
    "topic": "Cell Physiology",
    "subtopic": "Transport",
    "difficulty": "medium",
    "questionText": "Active transport differs from facilitated diffusion in that active transport:",
    "options": [
      "Requires ATP",
      "Uses carrier proteins",
      "Moves molecules down their concentration gradient",
      "Occurs in all cells"
    ],
    "correctOptionIndex": 0,
    "explanation": "Active transport requires energy (ATP) to move substances against their concentration gradient.",
    "conceptSummary": "Active transport uses ATP to move molecules against concentration gradients, unlike passive transport.",
    "wrongOptionExplanations": [
      "Correct answer",
      "Both active transport and facilitated diffusion use carrier proteins",
      "This describes passive transport, not active transport",
      "Both occur in cells but this is not the distinguishing feature"
    ],
    "tags": [
      "transport",
      "ATP"
    ]
  },
  {
    "_id": "q03",
    "subject": "Physiology",
    "topic": "Blood & Hematology",
    "subtopic": "RBC",
    "difficulty": "easy",
    "questionText": "The normal lifespan of a red blood cell is approximately:",
    "options": [
      "30 days",
      "60 days",
      "120 days",
      "180 days"
    ],
    "correctOptionIndex": 2,
    "explanation": "RBCs have a lifespan of approximately 120 days before they are removed by the spleen.",
    "conceptSummary": "Red blood cells live approximately 120 days and are recycled by the reticuloendothelial system.",
    "wrongOptionExplanations": [
      "30 days is the lifespan of platelets",
      "60 days is too short for RBCs",
      "180 days is longer than actual RBC lifespan"
    ],
    "tags": [
      "blood",
      "RBC",
      "hematology"
    ]
  },
  {
    "_id": "q04",
    "subject": "Physiology",
    "topic": "Blood & Hematology",
    "subtopic": "WBC",
    "difficulty": "medium",
    "questionText": "Which type of white blood cell is most abundant in normal blood?",
    "options": [
      "Lymphocytes",
      "Monocytes",
      "Neutrophils",
      "Eosinophils"
    ],
    "correctOptionIndex": 2,
    "explanation": "Neutrophils constitute 60-70% of all WBCs and are the first responders to bacterial infection.",
    "conceptSummary": "Neutrophils are the most abundant WBCs, forming the primary defense against bacterial infections.",
    "wrongOptionExplanations": [
      "Lymphocytes are second most abundant (20-40%)",
      "Monocytes comprise only 2-8%",
      "Eosinophils are 1-4%, mainly for parasitic defense"
    ],
    "tags": [
      "blood",
      "WBC",
      "immunity"
    ]
  },
  {
    "_id": "q05",
    "subject": "Physiology",
    "topic": "Cardiovascular Physiology",
    "subtopic": "Heart",
    "difficulty": "medium",
    "questionText": "The normal cardiac output at rest is approximately:",
    "options": [
      "3 L/min",
      "5 L/min",
      "8 L/min",
      "10 L/min"
    ],
    "correctOptionIndex": 1,
    "explanation": "Normal resting cardiac output is approximately 5 L/min (stroke volume ~70ml × heart rate ~72bpm).",
    "conceptSummary": "Cardiac output = Stroke Volume × Heart Rate. Normal resting CO is about 5 L/min.",
    "wrongOptionExplanations": [
      "3 L/min would indicate cardiac insufficiency",
      "8 L/min is typical during moderate exercise",
      "10 L/min is seen during vigorous exercise"
    ],
    "tags": [
      "heart",
      "cardiac-output",
      "CVS"
    ]
  },
  {
    "_id": "q06",
    "subject": "Physiology",
    "topic": "Cardiovascular Physiology",
    "subtopic": "Blood Pressure",
    "difficulty": "easy",
    "questionText": "Normal systolic blood pressure in a healthy adult is:",
    "options": [
      "100 mmHg",
      "120 mmHg",
      "140 mmHg",
      "160 mmHg"
    ],
    "correctOptionIndex": 1,
    "explanation": "Normal blood pressure is 120/80 mmHg. Systolic represents peak ventricular ejection pressure.",
    "conceptSummary": "Normal BP is 120/80 mmHg. Hypertension is defined as sustained BP ≥140/90 mmHg.",
    "wrongOptionExplanations": [
      "100 mmHg may indicate hypotension",
      "140 mmHg is borderline hypertension",
      "160 mmHg is stage 2 hypertension"
    ],
    "tags": [
      "blood-pressure",
      "CVS"
    ]
  },
  {
    "_id": "q07",
    "subject": "Physiology",
    "topic": "Respiratory Physiology",
    "subtopic": "Lung Volumes",
    "difficulty": "medium",
    "questionText": "The total lung capacity in a healthy adult male is approximately:",
    "options": [
      "3000 mL",
      "4500 mL",
      "6000 mL",
      "8000 mL"
    ],
    "correctOptionIndex": 2,
    "explanation": "Total Lung Capacity (TLC) is approximately 6000 mL, which is the sum of all lung volumes.",
    "conceptSummary": "TLC = TV + IRV + ERV + RV ≈ 6000 mL in adult males.",
    "wrongOptionExplanations": [
      "3000 mL is close to vital capacity minus residual volume",
      "4500 mL is close to vital capacity alone",
      "8000 mL exceeds normal TLC"
    ],
    "tags": [
      "lungs",
      "volumes",
      "respiratory"
    ]
  },
  {
    "_id": "q08",
    "subject": "Physiology",
    "topic": "Respiratory Physiology",
    "subtopic": "Gas Exchange",
    "difficulty": "hard",
    "questionText": "The partial pressure of oxygen in arterial blood (PaO2) is normally:",
    "options": [
      "40 mmHg",
      "60 mmHg",
      "80-100 mmHg",
      "120 mmHg"
    ],
    "correctOptionIndex": 2,
    "explanation": "Normal PaO2 ranges from 80-100 mmHg. Values below 60 mmHg indicate respiratory failure.",
    "conceptSummary": "PaO2 normally ranges 80-100 mmHg. PaCO2 is normally 35-45 mmHg.",
    "wrongOptionExplanations": [
      "40 mmHg is the normal PvO2 (venous)",
      "60 mmHg is the critical threshold for O2 therapy",
      "120 mmHg would indicate hyperoxia"
    ],
    "tags": [
      "gas-exchange",
      "oxygen",
      "respiratory"
    ]
  },
  {
    "_id": "q09",
    "subject": "Physiology",
    "topic": "Renal Physiology",
    "subtopic": "GFR",
    "difficulty": "medium",
    "questionText": "The normal glomerular filtration rate (GFR) is approximately:",
    "options": [
      "60 mL/min",
      "90 mL/min",
      "125 mL/min",
      "180 mL/min"
    ],
    "correctOptionIndex": 2,
    "explanation": "Normal GFR is approximately 125 mL/min or 180 L/day. This is the rate at which blood is filtered.",
    "conceptSummary": "GFR ≈ 125 mL/min. It depends on net filtration pressure across glomerular capillaries.",
    "wrongOptionExplanations": [
      "60 mL/min suggests stage 3 CKD",
      "90 mL/min is borderline low normal",
      "180 mL/min is above normal range"
    ],
    "tags": [
      "kidney",
      "GFR",
      "renal"
    ]
  },
  {
    "_id": "q10",
    "subject": "Physiology",
    "topic": "GI Physiology",
    "subtopic": "Digestion",
    "difficulty": "easy",
    "questionText": "Which enzyme initiates carbohydrate digestion in the mouth?",
    "options": [
      "Pepsin",
      "Lipase",
      "Salivary amylase",
      "Trypsin"
    ],
    "correctOptionIndex": 2,
    "explanation": "Salivary amylase (ptyalin) begins starch digestion in the mouth at optimal pH 6.8.",
    "conceptSummary": "Carbohydrate digestion begins in the mouth with salivary amylase breaking starch into maltose.",
    "wrongOptionExplanations": [
      "Pepsin digests proteins in the stomach",
      "Lipase digests fats",
      "Trypsin is a pancreatic protease"
    ],
    "tags": [
      "digestion",
      "enzymes",
      "GI"
    ]
  },
  {
    "_id": "q11",
    "subject": "Physiology",
    "topic": "GI Physiology",
    "subtopic": "Absorption",
    "difficulty": "medium",
    "questionText": "The maximum absorption of nutrients occurs in the:",
    "options": [
      "Duodenum",
      "Jejunum",
      "Ileum",
      "Colon"
    ],
    "correctOptionIndex": 1,
    "explanation": "The jejunum is the primary site for nutrient absorption due to its large surface area with villi.",
    "conceptSummary": "Jejunum is the main absorptive segment. Iron and folate are absorbed in duodenum, B12 in ileum.",
    "wrongOptionExplanations": [
      "Duodenum absorbs iron, calcium, and folate primarily",
      "Ileum absorbs B12 and bile salts",
      "Colon absorbs water and electrolytes"
    ],
    "tags": [
      "absorption",
      "jejunum",
      "GI"
    ]
  },
  {
    "_id": "q12",
    "subject": "Physiology",
    "topic": "Neurophysiology",
    "subtopic": "Action Potential",
    "difficulty": "hard",
    "questionText": "During the absolute refractory period of an action potential:",
    "options": [
      "Na+ channels are in the resting state",
      "K+ channels are closed",
      "No stimulus can generate another action potential",
      "The membrane is hyperpolarized"
    ],
    "correctOptionIndex": 2,
    "explanation": "During the absolute refractory period, Na+ channels are inactivated and no stimulus, regardless of strength, can trigger another AP.",
    "conceptSummary": "Absolute refractory period = Na+ channels inactivated. Relative refractory period = stronger stimulus needed.",
    "wrongOptionExplanations": [
      "Na+ channels are inactivated, not resting",
      "K+ channels are actually open during this phase",
      "Hyperpolarization occurs during relative refractory period"
    ],
    "tags": [
      "action-potential",
      "neurons",
      "neuro"
    ]
  },
  {
    "_id": "q13",
    "subject": "Physiology",
    "topic": "Neurophysiology",
    "subtopic": "Synapse",
    "difficulty": "medium",
    "questionText": "The most common excitatory neurotransmitter in the brain is:",
    "options": [
      "GABA",
      "Dopamine",
      "Glutamate",
      "Serotonin"
    ],
    "correctOptionIndex": 2,
    "explanation": "Glutamate is the principal excitatory neurotransmitter in the CNS, acting on NMDA and AMPA receptors.",
    "conceptSummary": "Glutamate = main excitatory NT. GABA = main inhibitory NT in the brain.",
    "wrongOptionExplanations": [
      "GABA is the main inhibitory neurotransmitter",
      "Dopamine is involved in reward and motor control",
      "Serotonin modulates mood, sleep, and appetite"
    ],
    "tags": [
      "neurotransmitter",
      "brain",
      "neuro"
    ]
  },
  {
    "_id": "q14",
    "subject": "Physiology",
    "topic": "Endocrinology",
    "subtopic": "Thyroid",
    "difficulty": "easy",
    "questionText": "Which hormone is primarily responsible for increasing basal metabolic rate?",
    "options": [
      "Insulin",
      "Cortisol",
      "Thyroxine (T4)",
      "Growth Hormone"
    ],
    "correctOptionIndex": 2,
    "explanation": "Thyroxine (T4) and T3 are the primary regulators of basal metabolic rate in the body.",
    "conceptSummary": "Thyroid hormones (T3/T4) increase BMR by stimulating oxygen consumption in most tissues.",
    "wrongOptionExplanations": [
      "Insulin regulates glucose metabolism",
      "Cortisol affects stress response and metabolism but less than thyroid hormones",
      "Growth hormone promotes growth but T4 has greater effect on BMR"
    ],
    "tags": [
      "thyroid",
      "metabolism",
      "endocrine"
    ]
  },
  {
    "_id": "q15",
    "subject": "Physiology",
    "topic": "Endocrinology",
    "subtopic": "Pancreas",
    "difficulty": "medium",
    "questionText": "Insulin is secreted by which cells of the pancreatic islets?",
    "options": [
      "Alpha cells",
      "Beta cells",
      "Delta cells",
      "PP cells"
    ],
    "correctOptionIndex": 1,
    "explanation": "Beta cells of the Islets of Langerhans secrete insulin in response to elevated blood glucose.",
    "conceptSummary": "Alpha cells → glucagon, Beta cells → insulin, Delta cells → somatostatin.",
    "wrongOptionExplanations": [
      "Alpha cells secrete glucagon",
      "Delta cells secrete somatostatin",
      "PP cells secrete pancreatic polypeptide"
    ],
    "tags": [
      "insulin",
      "pancreas",
      "endocrine"
    ]
  },
  {
    "_id": "q16",
    "subject": "Physiology",
    "topic": "Cell Physiology",
    "subtopic": "Osmosis",
    "difficulty": "hard",
    "questionText": "A cell placed in a hypertonic solution will:",
    "options": [
      "Swell and burst",
      "Remain unchanged",
      "Shrink (crenation)",
      "Undergo apoptosis"
    ],
    "correctOptionIndex": 2,
    "explanation": "In a hypertonic solution, water moves out of the cell by osmosis, causing the cell to shrink (crenation in RBCs).",
    "conceptSummary": "Hypertonic = cell shrinks. Hypotonic = cell swells. Isotonic = no net water movement.",
    "wrongOptionExplanations": [
      "Swelling occurs in hypotonic solutions",
      "Cells remain unchanged only in isotonic solutions",
      "Apoptosis is programmed cell death, unrelated to tonicity"
    ],
    "tags": [
      "osmosis",
      "tonicity",
      "cell-biology"
    ]
  },
  {
    "_id": "q17",
    "subject": "Physiology",
    "topic": "Blood & Hematology",
    "subtopic": "Coagulation",
    "difficulty": "hard",
    "questionText": "The extrinsic pathway of coagulation is initiated by:",
    "options": [
      "Factor XII",
      "Factor III (Tissue Factor)",
      "Platelet phospholipids",
      "Calcium ions"
    ],
    "correctOptionIndex": 1,
    "explanation": "The extrinsic pathway begins when tissue factor (Factor III) is released from damaged tissue and activates Factor VII.",
    "conceptSummary": "Extrinsic pathway: TF + Factor VII → Factor X activation. Intrinsic: Factor XII contact activation.",
    "wrongOptionExplanations": [
      "Factor XII initiates the intrinsic pathway",
      "Platelet phospholipids provide a surface but do not initiate",
      "Calcium is a cofactor, not an initiator"
    ],
    "tags": [
      "coagulation",
      "hemostasis",
      "blood"
    ]
  },
  {
    "_id": "q18",
    "subject": "Physiology",
    "topic": "Cardiovascular Physiology",
    "subtopic": "ECG",
    "difficulty": "medium",
    "questionText": "The P wave on an ECG represents:",
    "options": [
      "Ventricular depolarization",
      "Atrial depolarization",
      "Ventricular repolarization",
      "Atrial repolarization"
    ],
    "correctOptionIndex": 1,
    "explanation": "The P wave represents atrial depolarization. The QRS complex represents ventricular depolarization.",
    "conceptSummary": "ECG: P wave = atrial depolarization, QRS = ventricular depolarization, T wave = ventricular repolarization.",
    "wrongOptionExplanations": [
      "Ventricular depolarization is represented by QRS complex",
      "Ventricular repolarization is the T wave",
      "Atrial repolarization is masked by the QRS complex"
    ],
    "tags": [
      "ECG",
      "heart",
      "CVS"
    ]
  },
  {
    "_id": "q19",
    "subject": "Physiology",
    "topic": "Respiratory Physiology",
    "subtopic": "Control",
    "difficulty": "hard",
    "questionText": "The primary chemical stimulus for breathing under normal conditions is:",
    "options": [
      "Low O2 levels",
      "High CO2 levels",
      "Low pH in blood",
      "High bicarbonate levels"
    ],
    "correctOptionIndex": 1,
    "explanation": "CO2 (via H+ from carbonic acid in CSF) is the primary stimulus for the central chemoreceptors in the medulla.",
    "conceptSummary": "Central chemoreceptors respond primarily to CO2/H+. Peripheral chemoreceptors respond to low O2.",
    "wrongOptionExplanations": [
      "Low O2 stimulates peripheral chemoreceptors but is secondary",
      "Low pH contributes but CO2 is the primary driver",
      "High bicarbonate would actually decrease respiratory drive"
    ],
    "tags": [
      "breathing",
      "chemoreceptors",
      "respiratory"
    ]
  },
  {
    "_id": "q20",
    "subject": "Physiology",
    "topic": "Renal Physiology",
    "subtopic": "Hormones",
    "difficulty": "medium",
    "questionText": "Antidiuretic hormone (ADH) primarily acts on which part of the nephron?",
    "options": [
      "Proximal convoluted tubule",
      "Loop of Henle",
      "Distal convoluted tubule",
      "Collecting duct"
    ],
    "correctOptionIndex": 3,
    "explanation": "ADH increases water reabsorption by inserting aquaporin-2 channels in the collecting duct.",
    "conceptSummary": "ADH acts on collecting ducts to increase water permeability via aquaporin-2 insertion.",
    "wrongOptionExplanations": [
      "PCT reabsorbs 65% of filtrate but is not ADH-dependent",
      "Loop of Henle creates concentration gradient but is not the ADH target",
      "DCT is a site for aldosterone action, not primary ADH target"
    ],
    "tags": [
      "ADH",
      "nephron",
      "renal"
    ]
  }
];
