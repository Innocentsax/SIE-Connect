import { storage } from "./storage";

export async function seedDatabase() {
  console.log('Starting database seeding...');

  try {
    // Create comprehensive user base with different roles
    const users = [
      {
        email: "admin@iechub.my",
        password: "password123",
        role: "ADMIN",
        name: "IEC Admin",
        profileCompleted: true,
        onboardingCompleted: true,
        company: "Innovation & Entrepreneurship Centre",
        sector: "ecosystem",
        location: "Kuala Lumpur",
        description: "Ecosystem development and startup support",
        interests: "ecosystem building, innovation policy",
        experience: "10+ years"
      },
      {
        email: "founder@ecotech.my", 
        password: "password123",
        role: "STARTUP_FOUNDER",
        name: "Ahmad Rahman",
        profileCompleted: true,
        onboardingCompleted: true,
        company: "EcoTech Solutions",
        sector: "climate",
        location: "Cyberjaya",
        stage: "seed",
        description: "Developing sustainable technology solutions for environmental challenges",
        interests: "clean technology, carbon reduction, IoT sensors",
        experience: "5 years",
        fundingStage: "Series A"
      },
      {
        email: "investor@maybank.com",
        password: "password123", 
        role: "FUNDER",
        name: "Sarah Lim",
        profileCompleted: true,
        onboardingCompleted: true,
        company: "Maybank Investment Bank",
        sector: "fintech",
        location: "Kuala Lumpur",
        description: "Investment banker focusing on Southeast Asian fintech startups",
        interests: "fintech, digital banking, payment solutions",
        experience: "8 years",
        investmentRange: "RM 1M - 10M"
      },
      {
        email: "builder@mdec.my",
        password: "password123",
        role: "ECOSYSTEM_BUILDER", 
        name: "Dr. Lim Wei Ming",
        profileCompleted: true,
        onboardingCompleted: true,
        company: "Malaysia Digital Economy Corporation",
        sector: "edtech",
        location: "Putrajaya",
        description: "Leading digital transformation initiatives and startup ecosystem development",
        interests: "digital economy, startup policy, innovation hubs",
        experience: "12 years"
      },
      {
        email: "founder@healthai.my",
        password: "password123",
        role: "STARTUP_FOUNDER",
        name: "Dr. Priya Nair",
        profileCompleted: true,
        onboardingCompleted: true,
        company: "HealthAI Analytics",
        sector: "healthtech", 
        location: "Penang",
        stage: "mvp",
        description: "AI-powered healthcare analytics for early disease detection",
        interests: "artificial intelligence, healthcare, medical imaging",
        experience: "7 years",
        fundingStage: "Seed"
      },
      {
        email: "vc@cradle.com.my",
        password: "password123",
        role: "FUNDER",
        name: "Tan Chee Hoe",
        profileCompleted: true,
        onboardingCompleted: true,
        company: "Cradle Fund Sdn Bhd",
        sector: "agritech",
        location: "Kuala Lumpur", 
        description: "Government venture capital supporting Malaysian tech startups",
        interests: "agritech, sustainable farming, food security",
        experience: "10 years",
        investmentRange: "RM 500K - 5M"
      },
      {
        email: "founder@finpay.my",
        password: "password123",
        role: "STARTUP_FOUNDER",
        name: "Lisa Chen",
        profileCompleted: true,
        onboardingCompleted: true,
        company: "FinPay Solutions",
        sector: "fintech",
        location: "Kuala Lumpur",
        stage: "series-a",
        description: "Digital payment platform for SMEs across Southeast Asia",
        interests: "digital payments, blockchain, financial inclusion",
        experience: "6 years",
        fundingStage: "Series B"
      },
      {
        email: "investor@khazanah.com.my",
        password: "password123",
        role: "FUNDER", 
        name: "Dato' Rahman Abdullah",
        profileCompleted: true,
        onboardingCompleted: true,
        company: "Khazanah Nasional",
        sector: "ai",
        location: "Kuala Lumpur",
        description: "Strategic investment in Malaysian deep tech and AI startups",
        interests: "artificial intelligence, deep tech, strategic investments",
        experience: "15 years",
        investmentRange: "RM 5M - 50M"
      }
    ];

    for (const userData of users) {
      try {
        await storage.createUser(userData);
        console.log(`Created user: ${userData.email}`);
      } catch (error) {
        console.log(`User ${userData.email} already exists`);
      }
    }

    // Create diverse startups across sectors
    const startups = [
      {
        name: "EcoTech Solutions",
        description: "IoT-based environmental monitoring and carbon footprint reduction platform for Malaysian businesses",
        sector: "climate",
        location: "Cyberjaya",
        website: "https://ecotech.my",
        stage: "seed",
        employeeCount: 12,
        foundedYear: 2022,
        socialEnterpriseFlag: true,
        ownerUserId: 2
      },
      {
        name: "HealthAI Analytics", 
        description: "AI-powered medical imaging analysis for early detection of diseases in rural healthcare centers",
        sector: "healthtech",
        location: "Penang",
        website: "https://healthai.my",
        stage: "mvp",
        employeeCount: 8,
        foundedYear: 2023,
        socialEnterpriseFlag: true,
        ownerUserId: 5
      },
      {
        name: "FinPay Solutions",
        description: "Digital payment and financial services platform targeting underbanked SMEs in Southeast Asia",
        sector: "fintech",
        location: "Kuala Lumpur",
        website: "https://finpay.my",
        stage: "series-a",
        employeeCount: 25,
        foundedYear: 2021,
        socialEnterpriseFlag: false,
        ownerUserId: 7
      },
      {
        name: "AgriSmart Technologies",
        description: "Precision agriculture platform using IoT sensors and AI for Malaysian palm oil plantations",
        sector: "agritech",
        location: "Johor Bahru",
        website: "https://agrismart.my",
        stage: "seed",
        employeeCount: 15,
        foundedYear: 2022,
        socialEnterpriseFlag: true,
        ownerUserId: 2
      },
      {
        name: "EduTech Malaysia",
        description: "Adaptive learning platform for Malaysian primary and secondary education with local language support",
        sector: "edtech",
        location: "Kuching",
        website: "https://edutech.my",
        stage: "mvp",
        employeeCount: 18,
        foundedYear: 2023,
        socialEnterpriseFlag: true,
        ownerUserId: 5
      },
      {
        name: "LogiFlow Systems",
        description: "Last-mile delivery optimization using AI routing for Malaysian e-commerce platforms",
        sector: "logistics",
        location: "Shah Alam",
        website: "https://logiflow.my",
        stage: "seed",
        employeeCount: 22,
        foundedYear: 2022,
        socialEnterpriseFlag: false,
        ownerUserId: 7
      }
    ];

    for (const startup of startups) {
      try {
        await storage.createStartup(startup);
        console.log(`Created startup: ${startup.name}`);
      } catch (error) {
        console.log(`Startup ${startup.name} already exists`);
      }
    }

    // Create comprehensive opportunities across different types
    const opportunities = [
      {
        title: "MDEC Digital Economy Grant 2025",
        description: "Government grant supporting Malaysian digital startups with up to RM 500,000 funding for technology development and market expansion",
        provider: "Malaysia Digital Economy Corporation",
        type: "Grant",
        amount: "Up to RM 500,000",
        deadline: new Date('2025-03-31'),
        sector: "fintech",
        location: "Malaysia",
        requirements: "Malaysian-incorporated company, minimum 51% local ownership, digital technology focus",
        eligibility: "Early-stage startups with MVP and paying customers",
        link: "https://mdec.my/grants",
        ownerUserId: 1
      },
      {
        title: "Cradle Fund CIP-500 Program",
        description: "Pre-commercialization funding for Malaysian technology startups with proven prototype and market validation",
        provider: "Cradle Fund Sdn Bhd",
        type: "Funding",
        amount: "RM 500,000",
        deadline: new Date('2025-02-28'),
        sector: "healthtech",
        location: "Malaysia",
        requirements: "Technology-based startup, Malaysian ownership, working prototype",
        eligibility: "Pre-revenue companies with technology innovation",
        link: "https://cradlefund.com.my",
        ownerUserId: 1
      },
      {
        title: "MaGIC Accelerator Program Batch 12",
        description: "3-month intensive accelerator program with mentorship, funding, and market access for Southeast Asian startups",
        provider: "Malaysian Global Innovation & Creativity Centre",
        type: "Accelerator",
        amount: "RM 50,000 + Investment",
        deadline: new Date('2025-01-15'),
        sector: "climate",
        location: "Cyberjaya",
        requirements: "Scalable business model, founding team commitment, growth potential",
        eligibility: "Seed to Series A startups across all sectors",
        link: "https://mymagic.my",
        ownerUserId: 1
      },
      {
        title: "Khazanah Deep Tech Investment",
        description: "Strategic investment program for Malaysian deep technology startups with significant R&D components",
        provider: "Khazanah Nasional Berhad",
        type: "Investment",
        amount: "RM 2M - 20M",
        deadline: new Date('2025-06-30'),
        sector: "ai",
        location: "Malaysia",
        requirements: "Deep technology focus, strong IP portfolio, experienced team",
        eligibility: "Series A+ companies with proven technology",
        link: "https://khazanah.com.my",
        ownerUserId: 1
      },
      {
        title: "ASEAN Foundation Social Innovation Challenge",
        description: "Regional competition supporting social enterprises addressing UN SDGs across ASEAN countries",
        provider: "ASEAN Foundation",
        type: "Competition",
        amount: "USD 50,000",
        deadline: new Date('2025-04-15'),
        sector: "edtech",
        location: "ASEAN",
        requirements: "Social impact focus, ASEAN-based operations, SDG alignment",
        eligibility: "Social enterprises with proven impact metrics",
        link: "https://aseanfoundation.org",
        ownerUserId: 1
      },
      {
        title: "Maybank Fintech Incubator 2025",
        description: "Banking-focused incubator program for fintech startups with potential partnership opportunities",
        provider: "Maybank Investment Bank",
        type: "Incubator", 
        amount: "RM 100,000 + Mentorship",
        deadline: new Date('2025-02-14'),
        sector: "fintech",
        location: "Kuala Lumpur",
        requirements: "Fintech solution, partnership potential with banking sector",
        eligibility: "MVP stage fintech startups with regulatory compliance",
        link: "https://maybank.com/fintech",
        ownerUserId: 1
      },
      {
        title: "UN SDG Innovation Lab Malaysia",
        description: "Collaborative innovation program addressing climate change and sustainability challenges in Malaysia",
        provider: "United Nations Malaysia",
        type: "Program",
        amount: "USD 25,000 + Resources",
        deadline: new Date('2025-05-20'),
        sector: "climate",
        location: "Malaysia",
        requirements: "Climate focus, measurable impact potential, local implementation",
        eligibility: "Startups and NGOs working on environmental solutions",
        link: "https://un.org.my",
        ownerUserId: 1
      },
      {
        title: "Palm Oil Innovation Challenge",
        description: "Industry-specific innovation program for sustainable palm oil production and processing technologies",
        provider: "Malaysian Palm Oil Board",
        type: "Challenge",
        amount: "RM 300,000",
        deadline: new Date('2025-03-01'),
        sector: "agritech",
        location: "Malaysia",
        requirements: "Palm oil industry focus, sustainability component, scalable solution",
        eligibility: "Agritech startups with proven technology",
        link: "https://mpob.gov.my",
        ownerUserId: 1
      }
    ];

    for (const opportunity of opportunities) {
      try {
        await storage.createOpportunity(opportunity);
        console.log(`Created opportunity: ${opportunity.title}`);
      } catch (error) {
        console.log(`Opportunity ${opportunity.title} already exists`);
      }
    }

    // Create relevant events
    const events = [
      {
        name: "Malaysian Startup Ecosystem Summit 2025",
        description: "Annual gathering of Malaysian startup founders, investors, and ecosystem builders",
        date: new Date('2025-03-15'),
        venue: "Kuala Lumpur Convention Centre",
        link: "https://startupmalaysia.org/summit",
        ownerUserId: 1
      },
      {
        name: "ASEAN FinTech Festival",
        description: "Regional fintech conference showcasing latest innovations and investment opportunities",
        date: new Date('2025-04-22'),
        venue: "Marina Bay Sands, Singapore",
        link: "https://fintechfestival.sg",
        ownerUserId: 1
      },
      {
        name: "Climate Tech Innovation Workshop",
        description: "Hands-on workshop for climate technology entrepreneurs and researchers",
        date: new Date('2025-02-10'),
        venue: "Cyberjaya Innovation District",
        link: "https://climatetech.my",
        ownerUserId: 1
      }
    ];

    for (const event of events) {
      try {
        await storage.createEvent(event);
        console.log(`Created event: ${event.name}`);
      } catch (error) {
        console.log(`Event ${event.name} already exists`);
      }
    }

    console.log('Database seeding completed successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
}