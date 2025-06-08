import { db } from './db';
import { users, startups, opportunities, events, savedOpportunities, applications, onboardingResponses, embeddings } from '@shared/schema';
import bcrypt from 'bcrypt';

export async function seedSampleData() {
  console.log('Seeding sample data from provided dataset...');

  try {
    // Clear existing data first - respect foreign key constraints
    await db.delete(embeddings);
    await db.delete(applications);
    await db.delete(savedOpportunities);
    await db.delete(onboardingResponses);
    await db.delete(events);
    await db.delete(opportunities);
    await db.delete(startups);
    await db.delete(users);
    // Create sample users based on the provided profiles
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1.1 Startup Founders
    const aliceTan = await db.insert(users).values({
      email: 'alice.tan@ecobreeze.co',
      password: hashedPassword,
      name: 'Alice Tan',
      role: 'STARTUP_FOUNDER',
      company: 'EcoBreeze',
      sector: 'Climate Tech',
      location: 'Kuala Lumpur, Malaysia',
      description: 'Founder of EcoBreeze - IoT-based smart ventilation systems for eco-friendly buildings',
      website: 'https://ecobreeze.co',
      stage: 'Seed',
      interests: 'Climate Tech,Clean Technology,IoT,Smart Buildings',
      experience: '5+ years in climate technology',
      profileCompleted: true,
      onboardingCompleted: true
    }).returning();

    const budiSantoso = await db.insert(users).values({
      email: 'budi.santoso@finlink.example.com',
      password: hashedPassword,
      name: 'Budi Santoso',
      role: 'STARTUP_FOUNDER',
      company: 'FinLink',
      sector: 'Fintech',
      location: 'Jakarta, Indonesia',
      description: 'Founder of FinLink - Digital payments and SME lending platform enabling financial access across Southeast Asia',
      website: 'https://finlink.example.com',
      stage: 'Series A',
      interests: 'Fintech,Digital Payments,SME Lending,Southeast Asia',
      experience: '8+ years in financial technology',
      profileCompleted: true,
      onboardingCompleted: true
    }).returning();

    const noraAziz = await db.insert(users).values({
      email: 'nora.aziz@mediai.example.com',
      password: hashedPassword,
      name: 'Nora Aziz',
      role: 'STARTUP_FOUNDER',
      company: 'MediAI',
      sector: 'HealthTech',
      location: 'Singapore',
      description: 'Founder of MediAI - AI-powered telehealth assistant offering personalized patient care and remote monitoring',
      website: 'https://mediai.example.com',
      stage: 'Pre-seed',
      interests: 'HealthTech,AI in Healthcare,Telehealth,Remote Monitoring',
      experience: '6+ years in healthcare technology',
      profileCompleted: true,
      onboardingCompleted: true
    }).returning();

    // 1.2 Investors
    const davidLee = await db.insert(users).values({
      email: 'david.lee@seaventures.com',
      password: hashedPassword,
      name: 'David Lee',
      role: 'FUNDER',
      company: 'SEA Ventures',
      sector: 'Fintech,AI',
      location: 'Singapore',
      description: 'General Partner at SEA Ventures. Focus on Fintech and AI startups, Seed to Series A stages in Southeast Asia',
      investmentRange: '$500K - $5M',
      interests: 'Fintech,AI,Southeast Asia,Seed,Series A',
      experience: '12+ years in venture capital',
      profileCompleted: true,
      onboardingCompleted: true
    }).returning();

    const mariaGomez = await db.insert(users).values({
      email: 'maria.gomez@globalimpactfund.com',
      password: hashedPassword,
      name: 'Maria Gomez',
      role: 'FUNDER',
      company: 'Global Impact Fund',
      sector: 'Climate Tech,Social Impact',
      location: 'Global',
      description: 'Principal at Global Impact Fund. Focus on Climate Tech and social impact ventures, Series A & B stages across emerging markets',
      investmentRange: '$1M - $10M',
      interests: 'Climate Tech,Social Impact,Sustainability,Series A,Series B',
      experience: '10+ years in impact investing',
      profileCompleted: true,
      onboardingCompleted: true
    }).returning();

    // 1.3 Ecosystem Builders
    const arifRahman = await db.insert(users).values({
      email: 'arif.rahman@startuphubkl.com',
      password: hashedPassword,
      name: 'Arif Rahman',
      role: 'ECOSYSTEM_BUILDER',
      company: 'StartupHub Kuala Lumpur',
      sector: 'General',
      location: 'Kuala Lumpur, Malaysia',
      description: 'Program Manager at StartupHub KL. Organizing events and programs to support Malaysian startups',
      interests: 'Startup Ecosystem,Events,Accelerators,Malaysia',
      experience: '7+ years in ecosystem development',
      profileCompleted: true,
      onboardingCompleted: true
    }).returning();

    const janiceWong = await db.insert(users).values({
      email: 'janice.wong@aseanstartupnetwork.com',
      password: hashedPassword,
      name: 'Janice Wong',
      role: 'ECOSYSTEM_BUILDER',
      company: 'ASEAN Startup Network',
      sector: 'Regional',
      location: 'Southeast Asia',
      description: 'Community Lead at ASEAN Startup Network. Focus on regional programs and cross-border startup collaboration',
      interests: 'ASEAN,Regional Collaboration,Incubators,Cross-border',
      experience: '9+ years in regional ecosystem building',
      profileCompleted: true,
      onboardingCompleted: true
    }).returning();

    // Create startup profiles
    await db.insert(startups).values({
      name: 'EcoBreeze',
      description: 'IoT-based smart ventilation systems for eco-friendly buildings (energy-efficient climate control)',
      sector: 'Climate Tech',
      location: 'Kuala Lumpur, Malaysia',
      website: 'https://ecobreeze.co',
      stage: 'Seed',
      employeeCount: 8,
      foundedYear: 2023,
      socialEnterpriseFlag: true,
      ownerUserId: aliceTan[0].id
    });

    await db.insert(startups).values({
      name: 'FinLink',
      description: 'Digital payments and SME lending platform enabling financial access across Southeast Asia',
      sector: 'Fintech',
      location: 'Jakarta, Indonesia',
      website: 'https://finlink.example.com',
      stage: 'Series A',
      employeeCount: 45,
      foundedYear: 2021,
      socialEnterpriseFlag: false,
      ownerUserId: budiSantoso[0].id
    });

    await db.insert(startups).values({
      name: 'MediAI',
      description: 'AI-powered telehealth assistant offering personalized patient care and remote monitoring',
      sector: 'HealthTech',
      location: 'Singapore',
      website: 'https://mediai.example.com',
      stage: 'Pre-seed',
      employeeCount: 5,
      foundedYear: 2024,
      socialEnterpriseFlag: false,
      ownerUserId: noraAziz[0].id
    });

    // Create opportunity listings from the sample data
    await db.insert(opportunities).values({
      type: 'Accelerator',
      title: 'She Wins Climate Southeast Asia 2025',
      description: 'A 12-month accelerator for 25 early-stage, women-led climate startups in Southeast Asia, offering mentorship, investor connections, and pitch coaching',
      sector: 'Climate Tech',
      location: 'Southeast Asia',
      provider: 'New Energy Nexus',
      criteria: 'Women-led climate startups, early stage',
      deadline: new Date('2025-06-13'),
      amount: 'Funding and mentorship',
      link: 'https://newenergynexus.com/she-wins-climate',
      creatorUserId: arifRahman[0].id
    });

    await db.insert(opportunities).values({
      type: 'Accelerator',
      title: 'Selangor Accelerator Programme 2024 (SAP24)',
      description: 'A state-run accelerator to drive Malaysian tech startups towards growth. 4-month program with workshops, mentorship, and demo day',
      sector: 'Technology',
      location: 'Selangor, Malaysia',
      provider: 'SIDEC',
      criteria: 'Early-stage tech startups, various sectors including AI, Biotech, net-zero solutions',
      deadline: new Date('2025-06-30'),
      amount: 'RM250k for winners',
      link: 'https://sidec.com.my/accelerator',
      creatorUserId: arifRahman[0].id
    });

    await db.insert(opportunities).values({
      type: 'Grant',
      title: 'Asia Gender Equality Fund (Round 3)',
      description: 'A grant fund dedicated to advancing gender-just climate action across Asia Pacific. Targets non-profit or social enterprise projects',
      sector: 'Climate Tech',
      location: 'Asia Pacific',
      provider: 'AVPN with Chanel & Gates Foundation',
      criteria: 'APAC-based org, scalable solution, 2 years of financials, gender-focused climate initiatives',
      deadline: new Date('2025-06-08'),
      amount: 'Grant funding for climate initiatives',
      link: 'https://avpn.asia/gender-equality-fund',
      creatorUserId: janiceWong[0].id
    });

    await db.insert(opportunities).values({
      type: 'Grant',
      title: 'Cradle CIP Spark Grant',
      description: 'Malaysian grant program for idea-stage and prototype-stage startups. Covers development and pre-commercialization for tech startups',
      sector: 'Technology',
      location: 'Malaysia',
      provider: 'Cradle Fund',
      criteria: 'Pre-seed stage tech startups, Malaysian incorporation',
      deadline: new Date('2025-12-31'),
      amount: 'Up to MYR 50k plus business coaching',
      link: 'https://cradlefund.com.my/cip-spark',
      creatorUserId: arifRahman[0].id
    });

    await db.insert(opportunities).values({
      type: 'Competition',
      title: 'Climate Impact Innovations Challenge 2025',
      description: 'A global competition for climate-tech startups and innovators. Offers grant awards and pilot project support for solutions in renewable energy',
      sector: 'Climate Tech',
      location: 'Global',
      provider: 'Climate Impact Asia',
      criteria: 'Climate-tech startups, renewable energy and emissions reduction solutions',
      deadline: new Date('2025-06-24'),
      amount: 'Grant awards and pilot project support',
      link: 'https://climateimpactasia.org/challenge',
      creatorUserId: janiceWong[0].id
    });

    // Create events from sample data
    await db.insert(events).values({
      name: 'KL Smart City Innovation Summit 2025',
      description: 'A one-day summit in Kuala Lumpur featuring Smart City startups, city officials, and investors. Includes keynote speeches, startup showcases, and networking',
      date: new Date('2025-09-01'),
      venue: 'Kuala Lumpur Convention Centre',
      link: 'https://startuphubkl.com/smart-city-summit',
      creatorUserId: arifRahman[0].id
    });

    await db.insert(events).values({
      name: 'ASEAN Incubator 2025',
      description: 'A cross-border incubator program accepting startups from various Southeast Asian countries. Virtual coaching sessions and regional mentor matching over 3 months',
      date: new Date('2025-07-15'),
      venue: 'Virtual/Multi-location',
      link: 'https://aseanstartupnetwork.com/incubator-2025',
      creatorUserId: janiceWong[0].id
    });

    await db.insert(events).values({
      name: 'Monthly Startup Pitch Night',
      description: 'Regular pitch night for founders to present their startups to investors and ecosystem players. Networking and feedback session',
      date: new Date('2025-07-25'),
      venue: 'StartupHub KL',
      link: 'https://startuphubkl.com/pitch-night',
      creatorUserId: arifRahman[0].id
    });

    await db.insert(events).values({
      name: 'ASEAN Cross-border Hackathon',
      description: 'Multi-country hackathon facilitating networking across ASEAN markets. Focus on regional solutions and cross-border collaboration',
      date: new Date('2025-08-15'),
      venue: 'Multiple ASEAN cities',
      link: 'https://aseanstartupnetwork.com/hackathon',
      creatorUserId: janiceWong[0].id
    });

    console.log('Sample data seeded successfully');
    console.log('Created users:', [
      'alice.tan@ecobreeze.co (Founder)',
      'budi.santoso@finlink.example.com (Founder)',
      'nora.aziz@mediai.example.com (Founder)',
      'david.lee@seaventures.com (Investor)',
      'maria.gomez@globalimpactfund.com (Investor)',
      'arif.rahman@startuphubkl.com (Builder)',
      'janice.wong@aseanstartupnetwork.com (Builder)'
    ]);
    console.log('Password for all accounts: password123');

  } catch (error) {
    console.error('Error seeding sample data:', error);
    throw error;
  }
}

// Direct execution when called via tsx
seedSampleData()
  .then(() => {
    console.log('✓ Sample data seeded successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('✗ Failed to seed sample data:', error);
    process.exit(1);
  });