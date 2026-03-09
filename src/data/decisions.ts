export type ImpactLevel = number; // -100 (catastrophic) to +100 (highly beneficial)

export interface Dimension {
  key: string;
  label: string;
  description: string;
  color: string; // tailwind color token
  hexColor: string; // for recharts
  icon: string;
}

export interface StakeholderImpact {
  stakeholder: string;
  description: string;
  impacts: Record<string, ImpactLevel>;
  quote: string;
}

export interface TimeframeData {
  label: string;
  years: string;
  dimensions: Record<string, ImpactLevel>;
}

export interface Decision {
  id: string;
  title: string;
  subtitle: string;
  context: string;
  region: string;
  scale: string;
  moralWeight: number; // how morally complex 0-100
  timeframes: TimeframeData[];
  stakeholders: StakeholderImpact[];
  keyTension: string;
  irreversibilityScore: number; // 0-100
  uncertaintyScore: number; // 0-100
  historicalAnalogues: string[];
}

export const DIMENSIONS: Dimension[] = [
  {
    key: "environment",
    label: "Environment",
    description: "Ecological systems, biodiversity, climate, natural resources",
    color: "dim-environment",
    hexColor: "#34d399",
    icon: "🌿",
  },
  {
    key: "economy",
    label: "Economy",
    description: "GDP impact, employment, trade, infrastructure value",
    color: "dim-economy",
    hexColor: "#fbbf24",
    icon: "📈",
  },
  {
    key: "wellbeing",
    label: "Human Wellbeing",
    description: "Health outcomes, quality of life, safety, basic needs",
    color: "dim-wellbeing",
    hexColor: "#c084fc",
    icon: "🏥",
  },
  {
    key: "culture",
    label: "Cultural Impact",
    description: "Heritage, identity, traditions, community cohesion",
    color: "dim-culture",
    hexColor: "#fb923c",
    icon: "🏛️",
  },
  {
    key: "equity",
    label: "Social Equity",
    description: "Justice, distribution of benefits, displacement, rights",
    color: "dim-equity",
    hexColor: "#38bdf8",
    icon: "⚖️",
  },
  {
    key: "longterm",
    label: "Long-Term Stability",
    description: "Resilience, adaptability, intergenerational consequences",
    color: "dim-longterm",
    hexColor: "#e879f9",
    icon: "🔭",
  },
];

export const DECISIONS: Decision[] = [
  {
    id: "hydrodam",
    title: "Build the Grand River Dam",
    subtitle: "Large-scale hydroelectric infrastructure",
    context:
      "A proposed 2.4 GW hydroelectric dam on the Grand River would flood 340 km² of valley land, displace 18,000 indigenous residents, eliminate three endangered fish species' habitats, and provide clean energy to 4 million people for 80 years.",
    region: "Sub-Saharan Africa",
    scale: "National",
    moralWeight: 88,
    irreversibilityScore: 95,
    uncertaintyScore: 32,
    keyTension:
      "Clean energy for millions vs. irreversible destruction of ecosystems and forced displacement of indigenous communities",
    historicalAnalogues: ["Three Gorges Dam (China)", "Aswan High Dam (Egypt)", "Belo Monte Dam (Brazil)"],
    timeframes: [
      {
        label: "Immediate",
        years: "0–5 years",
        dimensions: {
          environment: -72,
          economy: -15,
          wellbeing: -45,
          culture: -80,
          equity: -65,
          longterm: -10,
        },
      },
      {
        label: "Short-Term",
        years: "5–20 years",
        dimensions: {
          environment: -60,
          economy: 55,
          wellbeing: 30,
          culture: -55,
          equity: -20,
          longterm: 25,
        },
      },
      {
        label: "Long-Term",
        years: "20–80 years",
        dimensions: {
          environment: -48,
          economy: 72,
          wellbeing: 55,
          culture: -40,
          equity: 10,
          longterm: 60,
        },
      },
    ],
    stakeholders: [
      {
        stakeholder: "Indigenous Communities",
        description: "18,000 people whose ancestral lands would be flooded",
        impacts: { environment: -85, economy: -60, wellbeing: -88, culture: -95, equity: -90, longterm: -40 },
        quote: "You are asking us to surrender what no money can restore — our relationship with this river.",
      },
      {
        stakeholder: "Urban Population",
        description: "4 million urban residents gaining reliable electricity",
        impacts: { environment: 10, economy: 65, wellbeing: 70, culture: 5, equity: 55, longterm: 60 },
        quote: "Electricity means schools can run at night, hospitals can operate, businesses can grow.",
      },
      {
        stakeholder: "National Government",
        description: "State actors seeking energy independence and economic growth",
        impacts: { environment: -20, economy: 80, wellbeing: 45, culture: -10, equity: 15, longterm: 70 },
        quote: "This dam represents energy sovereignty — the foundation of our nation's development.",
      },
      {
        stakeholder: "Environmental Scientists",
        description: "Researchers tracking ecosystem collapse and species extinction",
        impacts: { environment: -90, economy: -5, wellbeing: -15, culture: -30, equity: -25, longterm: -55 },
        quote: "Three endemic species will disappear forever. There is no mitigation for extinction.",
      },
    ],
  },
  {
    id: "nuclear",
    title: "Commission New Nuclear Plant",
    subtitle: "3rd generation+ nuclear fission facility",
    context:
      "A 1,600 MW nuclear power plant would provide zero-carbon baseload electricity for 60 years, require permanent waste storage, carry a 0.02% catastrophic failure risk per decade, cost $18B to build, and could replace four coal plants currently causing 1,200 premature deaths annually.",
    region: "Central Europe",
    scale: "Regional",
    moralWeight: 82,
    irreversibilityScore: 78,
    uncertaintyScore: 65,
    keyTension:
      "Preventing certain near-term climate deaths vs. creating uncertain but catastrophic long-term nuclear risk",
    historicalAnalogues: ["Chernobyl disaster (1986)", "Fukushima (2011)", "French nuclear program success"],
    timeframes: [
      {
        label: "Immediate",
        years: "0–5 years",
        dimensions: {
          environment: -5,
          economy: -40,
          wellbeing: -10,
          culture: -15,
          equity: -20,
          longterm: 15,
        },
      },
      {
        label: "Short-Term",
        years: "5–20 years",
        dimensions: {
          environment: 45,
          economy: 30,
          wellbeing: 55,
          culture: -5,
          equity: 25,
          longterm: 40,
        },
      },
      {
        label: "Long-Term",
        years: "20–80 years",
        dimensions: {
          environment: 55,
          economy: 60,
          wellbeing: 65,
          culture: 10,
          equity: 35,
          longterm: -30,
        },
      },
    ],
    stakeholders: [
      {
        stakeholder: "Climate Scientists",
        description: "Researchers focused on decarbonization timelines",
        impacts: { environment: 60, economy: 15, wellbeing: 50, culture: 0, equity: 20, longterm: 30 },
        quote: "Nuclear is the only proven technology that can decarbonize baseload power at scale, now.",
      },
      {
        stakeholder: "Local Residents",
        description: "Communities within 30km of the proposed site",
        impacts: { environment: -20, economy: 40, wellbeing: -35, culture: -25, equity: -30, longterm: -60 },
        quote: "We didn't choose to be guardians of the world's most dangerous waste for 10,000 years.",
      },
      {
        stakeholder: "Energy Workers",
        description: "Coal plant workers facing phase-out",
        impacts: { environment: 30, economy: -25, wellbeing: -40, culture: -50, equity: -45, longterm: 20 },
        quote: "Our identity is tied to this industry. Transition funds don't replace what we're losing.",
      },
      {
        stakeholder: "Future Generations",
        description: "Hypothetical stakeholders born 100+ years from now",
        impacts: { environment: 40, economy: 30, wellbeing: 45, culture: 5, equity: -20, longterm: -80 },
        quote: "They decided our inheritance without our consent: clean air, and waste we must guard forever.",
      },
    ],
  },
  {
    id: "ai-surveillance",
    title: "Deploy National AI Surveillance",
    subtitle: "City-wide real-time behavioral monitoring",
    context:
      "A national AI surveillance network would monitor all public spaces using facial recognition and behavioral prediction, reducing violent crime by an estimated 34%, identifying undocumented immigrants in real-time, enabling predictive policing, and creating a comprehensive citizen behavioral database owned by the state.",
    region: "Southeast Asia",
    scale: "National",
    moralWeight: 91,
    irreversibilityScore: 60,
    uncertaintyScore: 55,
    keyTension:
      "Measurable safety gains through provably effective crime reduction vs. irreversible erosion of civil liberties and normalization of total surveillance",
    historicalAnalogues: ["China's Social Credit System", "CCTV in UK", "NSA PRISM program"],
    timeframes: [
      {
        label: "Immediate",
        years: "0–5 years",
        dimensions: {
          environment: 0,
          economy: 15,
          wellbeing: 30,
          culture: -35,
          equity: -55,
          longterm: -20,
        },
      },
      {
        label: "Short-Term",
        years: "5–20 years",
        dimensions: {
          environment: 0,
          economy: 25,
          wellbeing: 20,
          culture: -60,
          equity: -70,
          longterm: -50,
        },
      },
      {
        label: "Long-Term",
        years: "20–80 years",
        dimensions: {
          environment: 0,
          economy: 35,
          wellbeing: -10,
          culture: -80,
          equity: -85,
          longterm: -75,
        },
      },
    ],
    stakeholders: [
      {
        stakeholder: "Law Enforcement",
        description: "Police and security agencies seeking crime reduction tools",
        impacts: { environment: 0, economy: 30, wellbeing: 50, culture: -10, equity: -20, longterm: 20 },
        quote: "For the first time, we can prevent crimes before they happen. That saves real lives.",
      },
      {
        stakeholder: "Marginalized Communities",
        description: "Ethnic minorities and immigrants disproportionately surveilled",
        impacts: { environment: 0, economy: -20, wellbeing: -75, culture: -65, equity: -90, longterm: -70 },
        quote: "This system sees us as threats first and citizens second. It codifies discrimination at scale.",
      },
      {
        stakeholder: "Tech Industry",
        description: "Companies providing and profiting from surveillance infrastructure",
        impacts: { environment: -5, economy: 85, wellbeing: 10, culture: -5, equity: -15, longterm: 30 },
        quote: "This is inevitable. Better our system — built for safety — than one with no accountability.",
      },
      {
        stakeholder: "Civil Rights Advocates",
        description: "Organizations defending privacy and democratic freedoms",
        impacts: { environment: 0, economy: -10, wellbeing: -60, culture: -85, equity: -88, longterm: -90 },
        quote: "A society that watches its citizens has already begun to consume itself.",
      },
    ],
  },
  {
    id: "geoengineering",
    title: "Solar Geoengineering Deployment",
    subtitle: "Stratospheric aerosol injection program",
    context:
      "Deploying stratospheric aerosol injection to reflect 1-2% of sunlight could reduce global temperatures by 0.5°C within 18 months, potentially preventing 150 million climate deaths by 2100, but risks termination shock, unpredictable regional precipitation changes, and sets a precedent for unilateral planetary control.",
    region: "Global",
    scale: "Planetary",
    moralWeight: 97,
    irreversibilityScore: 45,
    uncertaintyScore: 88,
    keyTension:
      "Potentially preventing mass climate mortality vs. unknown second-order planetary risks and assuming unilateral authority over Earth's climate system",
    historicalAnalogues: ["Mount Pinatubo eruption effects (1991)", "Great Ozone Crisis", "Green Revolution"],
    timeframes: [
      {
        label: "Immediate",
        years: "0–5 years",
        dimensions: {
          environment: 20,
          economy: -10,
          wellbeing: 35,
          culture: -20,
          equity: -40,
          longterm: -30,
        },
      },
      {
        label: "Short-Term",
        years: "5–20 years",
        dimensions: {
          environment: 40,
          economy: 30,
          wellbeing: 55,
          culture: -30,
          equity: -35,
          longterm: -45,
        },
      },
      {
        label: "Long-Term",
        years: "20–80 years",
        dimensions: {
          environment: -20,
          economy: 15,
          wellbeing: 20,
          culture: -45,
          equity: -55,
          longterm: -65,
        },
      },
    ],
    stakeholders: [
      {
        stakeholder: "Climate-Vulnerable Nations",
        description: "Island states and low-lying countries facing submersion",
        impacts: { environment: 50, economy: 45, wellbeing: 70, culture: 20, equity: 30, longterm: -25 },
        quote: "We did not cause this crisis. We will not wait for the perfect solution while we drown.",
      },
      {
        stakeholder: "Global South Agriculture",
        description: "Farmers dependent on regional monsoon patterns",
        impacts: { environment: -30, economy: -55, wellbeing: -60, culture: -40, equity: -65, longterm: -50 },
        quote: "Your solution to your pollution is changing our rains. We have no say in this.",
      },
      {
        stakeholder: "Climate Scientists",
        description: "Researchers modeling planetary system risks",
        impacts: { environment: 15, economy: 10, wellbeing: 20, culture: -10, equity: -30, longterm: -55 },
        quote: "The termination shock risk alone should give us pause. We cannot stop once we start.",
      },
      {
        stakeholder: "Future Generations",
        description: "All people born after the program begins",
        impacts: { environment: -10, economy: 25, wellbeing: 30, culture: -20, equity: -40, longterm: -70 },
        quote: "They inherited a managed sky — beautiful, perhaps cooler, but no longer entirely natural.",
      },
    ],
  },
  {
    id: "ubi",
    title: "Universal Basic Income Rollout",
    subtitle: "Unconditional monthly stipend for all citizens",
    context:
      "A national UBI program would provide every adult citizen $1,200/month unconditionally, funded by a 2% wealth tax, VAT increase, and automation dividend. Projected to eliminate absolute poverty for 38 million people, cost 14% of GDP annually, and restructure the relationship between labor, identity, and economic participation.",
    region: "North America",
    scale: "National",
    moralWeight: 79,
    irreversibilityScore: 42,
    uncertaintyScore: 74,
    keyTension:
      "Eradicating poverty and freeing human potential vs. fiscal sustainability, labor market disruption, and cultural redefinition of work as moral obligation",
    historicalAnalogues: [
      "Alaska Permanent Fund (1982–present)",
      "Finland UBI Pilot (2017–2018)",
      "Stockton SEED experiment (2019)",
    ],
    timeframes: [
      {
        label: "Immediate",
        years: "0–5 years",
        dimensions: {
          environment: 5,
          economy: -30,
          wellbeing: 65,
          culture: -15,
          equity: 70,
          longterm: -10,
        },
      },
      {
        label: "Short-Term",
        years: "5–20 years",
        dimensions: {
          environment: 15,
          economy: 20,
          wellbeing: 75,
          culture: -25,
          equity: 80,
          longterm: 20,
        },
      },
      {
        label: "Long-Term",
        years: "20–60 years",
        dimensions: {
          environment: 25,
          economy: 45,
          wellbeing: 80,
          culture: -35,
          equity: 85,
          longterm: 55,
        },
      },
    ],
    stakeholders: [
      {
        stakeholder: "Low-Income Households",
        description: "38 million people living below the poverty line",
        impacts: { environment: 10, economy: 75, wellbeing: 90, culture: 20, equity: 95, longterm: 65 },
        quote: "For the first time in my life, I can say no to a job that exploits me. That is dignity.",
      },
      {
        stakeholder: "Small Business Owners",
        description: "Entrepreneurs and employers in labor-intensive sectors",
        impacts: { environment: 5, economy: -35, wellbeing: 15, culture: -20, equity: 25, longterm: 30 },
        quote: "Workers can afford to quit. We either raise wages and prices, or close. There is no third option.",
      },
      {
        stakeholder: "Fiscal Conservatives",
        description: "Economists and politicians prioritizing debt and growth orthodoxy",
        impacts: { environment: 0, economy: -60, wellbeing: -10, culture: -40, equity: 10, longterm: -50 },
        quote: "You cannot build long-term prosperity on permanently subsidized inactivity. The math does not work.",
      },
      {
        stakeholder: "Creative & Care Workers",
        description: "Artists, caregivers, and volunteers whose work is currently uncompensated",
        impacts: { environment: 20, economy: 30, wellbeing: 85, culture: 75, equity: 70, longterm: 60 },
        quote: "Society finally acknowledges that raising children, making art, and caring for the elderly has value.",
      },
    ],
  },
  {
    id: "genetic-screening",
    title: "Mandatory Genetic Screening at Birth",
    subtitle: "Universal newborn genome sequencing program",
    context:
      "A national mandate would sequence the full genome of every newborn, storing data in a federated health database. It could predict 4,300+ hereditary conditions, enable early interventions saving an estimated 220,000 lives per decade, and allow insurers and employers to access anonymized risk pools — while creating an unprecedented biological surveillance infrastructure and permanently altering the right to genetic privacy.",
    region: "Western Europe",
    scale: "National",
    moralWeight: 95,
    irreversibilityScore: 70,
    uncertaintyScore: 62,
    keyTension:
      "Saving hundreds of thousands through early genetic intervention vs. creating a permanent biological identity record that could enable discrimination, surveillance, and the erosion of consent for unborn persons",
    historicalAnalogues: [
      "Newborn PKU bloodspot screening (1960s–present)",
      "Iceland deCODE Genetics population project",
      "China's national DNA database program",
      "UK Biobank voluntary genomic registry",
    ],
    timeframes: [
      {
        label: "Immediate",
        years: "0–5 years",
        dimensions: {
          environment: 0,
          economy: -20,
          wellbeing: 45,
          culture: -30,
          equity: -25,
          longterm: -15,
        },
      },
      {
        label: "Short-Term",
        years: "5–20 years",
        dimensions: {
          environment: 5,
          economy: 35,
          wellbeing: 65,
          culture: -50,
          equity: -45,
          longterm: -30,
        },
      },
      {
        label: "Long-Term",
        years: "20–60 years",
        dimensions: {
          environment: 10,
          economy: 55,
          wellbeing: 70,
          culture: -65,
          equity: -60,
          longterm: -55,
        },
      },
    ],
    stakeholders: [
      {
        stakeholder: "Parents & Families",
        description: "Parents making health decisions for newborns who cannot consent",
        impacts: { environment: 0, economy: 25, wellbeing: 60, culture: -30, equity: -20, longterm: -10 },
        quote: "I want to know if my child will suffer — but I never agreed to hand their DNA to a government database forever.",
      },
      {
        stakeholder: "Insurance Industry",
        description: "Health and life insurers seeking actuarial risk data",
        impacts: { environment: 0, economy: 80, wellbeing: -20, culture: -10, equity: -75, longterm: 30 },
        quote: "Risk pooling requires data. Accurate risk data means fair pricing for low-risk individuals.",
      },
      {
        stakeholder: "Bioethicists & Rights Advocates",
        description: "Philosophers and civil liberties groups protecting genetic autonomy",
        impacts: { environment: 0, economy: -15, wellbeing: -30, culture: -70, equity: -80, longterm: -85 },
        quote: "We are encoding a child's entire biological destiny into a state record before they draw their first breath.",
      },
      {
        stakeholder: "Future Patients",
        description: "People who will one day be diagnosed based on childhood genomic flags",
        impacts: { environment: 0, economy: 40, wellbeing: 75, culture: -45, equity: -50, longterm: -60 },
        quote: "They gave me a 74% lifetime risk score at birth. My whole life has been lived in the shadow of a probability.",
      },
    ],
  },
];
