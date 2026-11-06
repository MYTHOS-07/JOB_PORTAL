import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = "Password@123";

const categoryNames = [
  "Information Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Engineering",
  "Marketing",
  "Hospitality",
  "Customer Service",
  "Human Resources",
  "Administration",
];

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function main(): Promise<void> {
  const password = await bcrypt.hash(DEMO_PASSWORD, 10);

  const categories = new Map<string, { id: number; slug: string }>();
  for (const name of categoryNames) {
    const category = await prisma.jobCategory.upsert({
      where: { slug: toSlug(name) },
      update: { name },
      create: { name, slug: toSlug(name) },
    });
    categories.set(category.slug, category);
  }

  const cat = (slug: string) => categories.get(slug)!.id;

  const admin = await prisma.user.upsert({
    where: { email: "admin@elevateworkforce.local" },
    update: { name: "Platform Admin", password, role: "ADMIN", status: "ACTIVE" },
    create: {
      name: "Platform Admin",
      email: "admin@elevateworkforce.local",
      password,
      role: "ADMIN",
    },
  });

  const employers = [
    {
      name: "Sita Maharjan",
      email: "employer@elevateworkforce.local",
      company: {
        companyName: "Tech Solutions Nepal",
        description: "Product and software engineering team building tools for Nepali businesses.",
        industry: "Information Technology",
        website: "https://techsolutions.np",
        location: "Kathmandu, Nepal",
        phone: "9801000001",
      },
    },
    {
      name: "Dr. Hari Poudel",
      email: "health@elevateworkforce.local",
      company: {
        companyName: "Himalayan Health Care",
        description: "Private hospital network serving Pokhara and the western region.",
        industry: "Healthcare",
        website: "https://himalayanhealth.np",
        location: "Pokhara, Nepal",
        phone: "9801000002",
      },
    },
    {
      name: "Rina Shakya",
      email: "finance@elevateworkforce.local",
      company: {
        companyName: "Everest Digital Bank",
        description: "Retail and digital banking with branches across Nepal.",
        industry: "Finance",
        website: "https://everestdigital.np",
        location: "Kathmandu, Nepal",
        phone: "9801000003",
      },
    },
    {
      name: "Kamal Joshi",
      email: "edu@elevateworkforce.local",
      company: {
        companyName: "Green Valley School",
        description: "K-12 school in Lalitpur focused on science and languages.",
        industry: "Education",
        website: "https://greenvalley.np",
        location: "Lalitpur, Nepal",
        phone: "9801000004",
      },
    },
    {
      name: "Pramila Basnet",
      email: "infra@elevateworkforce.local",
      company: {
        companyName: "Nepal Infra Works",
        description: "Civil and electrical contractors for roads, hydropower and buildings.",
        industry: "Engineering",
        website: "https://nepalinfra.np",
        location: "Bhaktapur, Nepal",
        phone: "9801000005",
      },
    },
    {
      name: "Aayush Karki",
      email: "brand@elevateworkforce.local",
      company: {
        companyName: "Peak Marketing Studio",
        description: "Brand, content and performance marketing for startups.",
        industry: "Marketing",
        website: "https://peakstudio.np",
        location: "Kathmandu, Nepal",
        phone: "9801000006",
      },
    },
    {
      name: "Sabina Gurung",
      email: "hotel@elevateworkforce.local",
      company: {
        companyName: "Lakeside Hospitality Group",
        description: "Hotels and restaurants around Phewa Lake.",
        industry: "Hospitality",
        website: "https://lakesidegroup.np",
        location: "Pokhara, Nepal",
        phone: "9801000007",
      },
    },
    {
      name: "Nabin Rai",
      email: "support@elevateworkforce.local",
      company: {
        companyName: "Customer First Nepal",
        description: "Outsourced support and BPO for banks and ISPs.",
        industry: "Customer Service",
        website: "https://customerfirst.np",
        location: "Biratnagar, Nepal",
        phone: "9801000008",
      },
    },
  ];

  const companyIds = new Map<string, number>();

  for (const employer of employers) {
    const user = await prisma.user.upsert({
      where: { email: employer.email },
      update: { name: employer.name, password, role: "EMPLOYER", status: "ACTIVE" },
      create: {
        name: employer.name,
        email: employer.email,
        password,
        role: "EMPLOYER",
      },
    });

    const company = await prisma.company.upsert({
      where: { userId: user.id },
      update: employer.company,
      create: {
        userId: user.id,
        ...employer.company,
        status: "APPROVED",
      },
    });
    companyIds.set(employer.company.companyName, company.id);
  }

  const seekers = [
    {
      name: "Ram Sharma",
      email: "seeker@elevateworkforce.local",
      profile: {
        phone: "9802000001",
        location: "Kathmandu, Nepal",
        bio: "Junior full-stack developer interested in TypeScript and product teams.",
      },
    },
    {
      name: "Anisha Karki",
      email: "anisha@elevateworkforce.local",
      profile: {
        phone: "9802000002",
        location: "Lalitpur, Nepal",
        bio: "Registered nurse with two years of ward experience.",
      },
    },
    {
      name: "Bikash Thapa",
      email: "bikash@elevateworkforce.local",
      profile: {
        phone: "9802000003",
        location: "Pokhara, Nepal",
        bio: "Civil engineer looking for site and design roles.",
      },
    },
    {
      name: "Nisha Gurung",
      email: "nisha@elevateworkforce.local",
      profile: {
        phone: "9802000004",
        location: "Kathmandu, Nepal",
        bio: "Marketing graduate focused on social content and campaigns.",
      },
    },
    {
      name: "Prakash Adhikari",
      email: "prakash@elevateworkforce.local",
      profile: {
        phone: "9802000005",
        location: "Bhaktapur, Nepal",
        bio: "Accountant with experience in payroll and GST filings.",
      },
    },
    {
      name: "Maya Shrestha",
      email: "maya@elevateworkforce.local",
      profile: {
        phone: "9802000006",
        location: "Biratnagar, Nepal",
        bio: "Customer support specialist fluent in Nepali, Hindi and English.",
      },
    },
    {
      name: "Sanjay Tamang",
      email: "sanjay@elevateworkforce.local",
      profile: {
        phone: "9802000007",
        location: "Kathmandu, Nepal",
        bio: "HR generalist interested in recruitment and employee relations.",
      },
    },
  ];

  const seekerIds = new Map<string, number>();
  for (const seeker of seekers) {
    const user = await prisma.user.upsert({
      where: { email: seeker.email },
      update: { name: seeker.name, password, role: "JOB_SEEKER", status: "ACTIVE" },
      create: {
        name: seeker.name,
        email: seeker.email,
        password,
        role: "JOB_SEEKER",
        profile: { create: seeker.profile },
      },
    });
    await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: seeker.profile,
      create: { userId: user.id, ...seeker.profile },
    });
    seekerIds.set(seeker.email, user.id);
  }

  await prisma.user.upsert({
    where: { email: "suspended@elevateworkforce.local" },
    update: { status: "SUSPENDED", role: "JOB_SEEKER", password },
    create: {
      name: "Suspended Demo User",
      email: "suspended@elevateworkforce.local",
      password,
      role: "JOB_SEEKER",
      status: "SUSPENDED",
    },
  });

  const jobs = [
    {
      company: "Tech Solutions Nepal",
      category: "information-technology",
      title: "Junior Full Stack Developer",
      description:
        "Build features for our job and HR products using TypeScript, React and Node.js. You will pair with senior engineers and ship weekly.",
      location: "Kathmandu",
      employmentType: "FULL_TIME" as const,
      experienceLevel: "ENTRY_LEVEL" as const,
      salaryMin: 25000,
      salaryMax: 45000,
      status: "PUBLISHED" as const,
    },
    {
      company: "Tech Solutions Nepal",
      category: "information-technology",
      title: "Senior Backend Engineer",
      description:
        "Own API design, PostgreSQL performance and Redis caching for our SaaS platform. Mentoring juniors is part of the role.",
      location: "Kathmandu",
      employmentType: "FULL_TIME" as const,
      experienceLevel: "SENIOR" as const,
      salaryMin: 80000,
      salaryMax: 120000,
      status: "PUBLISHED" as const,
    },
    {
      company: "Tech Solutions Nepal",
      category: "information-technology",
      title: "QA Intern",
      description: "Write test cases, run regression suites and report bugs during a 3-month internship.",
      location: "Lalitpur",
      employmentType: "INTERNSHIP" as const,
      experienceLevel: "ENTRY_LEVEL" as const,
      salaryMin: 8000,
      salaryMax: 12000,
      status: "PUBLISHED" as const,
    },
    {
      company: "Tech Solutions Nepal",
      category: "information-technology",
      title: "Product Designer (Draft)",
      description: "Internal draft for a designer role. Not visible to seekers.",
      location: "Kathmandu",
      employmentType: "CONTRACT" as const,
      experienceLevel: "MID_LEVEL" as const,
      salaryMin: 40000,
      salaryMax: 60000,
      status: "DRAFT" as const,
    },
    {
      company: "Himalayan Health Care",
      category: "healthcare",
      title: "Staff Nurse",
      description: "Rotate across medical and surgical wards. NNC registration required. Night shifts included.",
      location: "Pokhara",
      employmentType: "FULL_TIME" as const,
      experienceLevel: "MID_LEVEL" as const,
      salaryMin: 35000,
      salaryMax: 50000,
      status: "PUBLISHED" as const,
    },
    {
      company: "Himalayan Health Care",
      category: "healthcare",
      title: "Lab Technician",
      description: "Run routine blood and urine tests in our central laboratory and maintain equipment logs.",
      location: "Pokhara",
      employmentType: "FULL_TIME" as const,
      experienceLevel: "ENTRY_LEVEL" as const,
      salaryMin: 22000,
      salaryMax: 32000,
      status: "PUBLISHED" as const,
    },
    {
      company: "Himalayan Health Care",
      category: "healthcare",
      title: "Hospital Administrator",
      description: "Coordinate admissions, insurance claims and vendor contracts for the Pokhara campus.",
      location: "Pokhara",
      employmentType: "FULL_TIME" as const,
      experienceLevel: "SENIOR" as const,
      salaryMin: 60000,
      salaryMax: 85000,
      status: "CLOSED" as const,
    },
    {
      company: "Everest Digital Bank",
      category: "finance",
      title: "Credit Analyst",
      description: "Assess SME loan files, visit clients and prepare credit committee notes.",
      location: "Kathmandu",
      employmentType: "FULL_TIME" as const,
      experienceLevel: "MID_LEVEL" as const,
      salaryMin: 45000,
      salaryMax: 70000,
      status: "PUBLISHED" as const,
    },
    {
      company: "Everest Digital Bank",
      category: "finance",
      title: "Mobile Banking Support Officer",
      description: "Help customers with app onboarding, PIN resets and transaction disputes from our contact centre.",
      location: "Kathmandu",
      employmentType: "FULL_TIME" as const,
      experienceLevel: "ENTRY_LEVEL" as const,
      salaryMin: 28000,
      salaryMax: 38000,
      status: "PUBLISHED" as const,
    },
    {
      company: "Everest Digital Bank",
      category: "finance",
      title: "Branch Teller",
      description: "Cash handling and account opening at our New Road branch.",
      location: "Kathmandu",
      employmentType: "PART_TIME" as const,
      experienceLevel: "ENTRY_LEVEL" as const,
      salaryMin: 18000,
      salaryMax: 25000,
      status: "PUBLISHED" as const,
    },
    {
      company: "Green Valley School",
      category: "education",
      title: "Secondary Science Teacher",
      description: "Teach grades 8–10 science following the national curriculum. Lesson planning and lab supervision included.",
      location: "Lalitpur",
      employmentType: "FULL_TIME" as const,
      experienceLevel: "MID_LEVEL" as const,
      salaryMin: 30000,
      salaryMax: 45000,
      status: "PUBLISHED" as const,
    },
    {
      company: "Green Valley School",
      category: "education",
      title: "School Counsellor",
      description: "Support student wellbeing, parent meetings and career guidance for senior grades.",
      location: "Lalitpur",
      employmentType: "PART_TIME" as const,
      experienceLevel: "MID_LEVEL" as const,
      salaryMin: 20000,
      salaryMax: 30000,
      status: "PUBLISHED" as const,
    },
    {
      company: "Nepal Infra Works",
      category: "engineering",
      title: "Site Civil Engineer",
      description: "Supervise road and building works in Bhaktapur. AutoCAD and quantity surveying experience preferred.",
      location: "Bhaktapur",
      employmentType: "FULL_TIME" as const,
      experienceLevel: "MID_LEVEL" as const,
      salaryMin: 40000,
      salaryMax: 65000,
      status: "PUBLISHED" as const,
    },
    {
      company: "Nepal Infra Works",
      category: "engineering",
      title: "Electrical Engineer",
      description: "Design and inspect electrical layouts for hydropower camp facilities.",
      location: "Dhading",
      employmentType: "CONTRACT" as const,
      experienceLevel: "SENIOR" as const,
      salaryMin: 70000,
      salaryMax: 95000,
      status: "PUBLISHED" as const,
    },
    {
      company: "Nepal Infra Works",
      category: "engineering",
      title: "Survey Intern",
      description: "Assist the survey team with total station work on local road packages.",
      location: "Bhaktapur",
      employmentType: "INTERNSHIP" as const,
      experienceLevel: "ENTRY_LEVEL" as const,
      salaryMin: 10000,
      salaryMax: 15000,
      status: "PUBLISHED" as const,
    },
    {
      company: "Peak Marketing Studio",
      category: "marketing",
      title: "Social Media Executive",
      description: "Plan weekly content, shoot short videos and report campaign metrics for FMCG clients.",
      location: "Kathmandu",
      employmentType: "FULL_TIME" as const,
      experienceLevel: "ENTRY_LEVEL" as const,
      salaryMin: 25000,
      salaryMax: 40000,
      status: "PUBLISHED" as const,
    },
    {
      company: "Peak Marketing Studio",
      category: "marketing",
      title: "Performance Marketing Lead",
      description: "Own Meta and Google ads for 8 retainers. Budget ownership and weekly client calls.",
      location: "Remote",
      employmentType: "REMOTE" as const,
      experienceLevel: "LEAD" as const,
      salaryMin: 70000,
      salaryMax: 110000,
      status: "PUBLISHED" as const,
    },
    {
      company: "Lakeside Hospitality Group",
      category: "hospitality",
      title: "Front Office Executive",
      description: "Check-in guests, handle reservations and coordinate with housekeeping at our lakeside hotel.",
      location: "Pokhara",
      employmentType: "FULL_TIME" as const,
      experienceLevel: "ENTRY_LEVEL" as const,
      salaryMin: 20000,
      salaryMax: 30000,
      status: "PUBLISHED" as const,
    },
    {
      company: "Lakeside Hospitality Group",
      category: "hospitality",
      title: "Sous Chef",
      description: "Support the head chef for breakfast and dinner service. Experience with continental and Nepali menus required.",
      location: "Pokhara",
      employmentType: "FULL_TIME" as const,
      experienceLevel: "MID_LEVEL" as const,
      salaryMin: 35000,
      salaryMax: 50000,
      status: "PUBLISHED" as const,
    },
    {
      company: "Customer First Nepal",
      category: "customer-service",
      title: "Customer Support Associate",
      description: "Answer inbound calls and chat for ISP clients. Rotating shifts including weekends.",
      location: "Biratnagar",
      employmentType: "FULL_TIME" as const,
      experienceLevel: "ENTRY_LEVEL" as const,
      salaryMin: 18000,
      salaryMax: 26000,
      status: "PUBLISHED" as const,
    },
    {
      company: "Customer First Nepal",
      category: "customer-service",
      title: "Team Leader – Voice",
      description: "Coach a team of 12 agents, review QA scores and escalate billing issues.",
      location: "Biratnagar",
      employmentType: "FULL_TIME" as const,
      experienceLevel: "SENIOR" as const,
      salaryMin: 40000,
      salaryMax: 55000,
      status: "PUBLISHED" as const,
    },
    {
      company: "Tech Solutions Nepal",
      category: "human-resources",
      title: "People Operations Associate",
      description: "Run onboarding, leave records and monthly payroll with our HRIS.",
      location: "Kathmandu",
      employmentType: "FULL_TIME" as const,
      experienceLevel: "ENTRY_LEVEL" as const,
      salaryMin: 30000,
      salaryMax: 42000,
      status: "PUBLISHED" as const,
    },
    {
      company: "Everest Digital Bank",
      category: "administration",
      title: "Office Administrator",
      description: "Manage vendor bills, meeting rooms and correspondence for the head office.",
      location: "Kathmandu",
      employmentType: "FULL_TIME" as const,
      experienceLevel: "MID_LEVEL" as const,
      salaryMin: 28000,
      salaryMax: 40000,
      status: "PUBLISHED" as const,
    },
  ];

  const jobIds = new Map<string, number>();
  for (const job of jobs) {
    const companyId = companyIds.get(job.company);
    if (!companyId) {
      throw new Error(`Missing company ${job.company}`);
    }

    const existing = await prisma.job.findFirst({
      where: { companyId, title: job.title },
    });

    const record = existing
      ? await prisma.job.update({
          where: { id: existing.id },
          data: {
            categoryId: cat(job.category),
            description: job.description,
            location: job.location,
            employmentType: job.employmentType,
            experienceLevel: job.experienceLevel,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            status: job.status,
            applicationDeadline: new Date("2027-03-31"),
          },
        })
      : await prisma.job.create({
          data: {
            companyId,
            categoryId: cat(job.category),
            title: job.title,
            description: job.description,
            location: job.location,
            employmentType: job.employmentType,
            experienceLevel: job.experienceLevel,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            status: job.status,
            applicationDeadline: new Date("2027-03-31"),
          },
        });

    jobIds.set(job.title, record.id);
  }

  const applications = [
    {
      email: "seeker@elevateworkforce.local",
      title: "Junior Full Stack Developer",
      status: "SHORTLISTED" as const,
      coverLetter: "I built course projects in React and Express and would like to join your Kathmandu team.",
    },
    {
      email: "seeker@elevateworkforce.local",
      title: "QA Intern",
      status: "PENDING" as const,
      coverLetter: "I am keen to learn structured testing during an internship.",
    },
    {
      email: "anisha@elevateworkforce.local",
      title: "Staff Nurse",
      status: "INTERVIEW" as const,
      coverLetter: "I currently work in a 50-bed hospital and am ready to relocate to Pokhara.",
    },
    {
      email: "anisha@elevateworkforce.local",
      title: "Lab Technician",
      status: "PENDING" as const,
      coverLetter: "I completed CMLT training and interned at a diagnostic centre.",
    },
    {
      email: "bikash@elevateworkforce.local",
      title: "Site Civil Engineer",
      status: "REVIEWING" as const,
      coverLetter: "I have two years of site experience on municipal road packages.",
    },
    {
      email: "bikash@elevateworkforce.local",
      title: "Survey Intern",
      status: "ACCEPTED" as const,
      coverLetter: "Happy to start as an intern if a full engineer seat is not open.",
    },
    {
      email: "nisha@elevateworkforce.local",
      title: "Social Media Executive",
      status: "PENDING" as const,
      coverLetter: "I managed college festival socials and freelance Reels for cafes.",
    },
    {
      email: "nisha@elevateworkforce.local",
      title: "Performance Marketing Lead",
      status: "REJECTED" as const,
      coverLetter: "I know this is a lead role; I applied to show interest in growing into ads.",
    },
    {
      email: "prakash@elevateworkforce.local",
      title: "Credit Analyst",
      status: "PENDING" as const,
      coverLetter: "I prepare monthly MIS for an SME and want to move into credit.",
    },
    {
      email: "prakash@elevateworkforce.local",
      title: "Office Administrator",
      status: "WITHDRAWN" as const,
      coverLetter: "I applied earlier and later withdrew to focus on finance roles.",
    },
    {
      email: "maya@elevateworkforce.local",
      title: "Customer Support Associate",
      status: "SHORTLISTED" as const,
      coverLetter: "I handled 80+ chats a day at a local ISP helpdesk.",
    },
    {
      email: "maya@elevateworkforce.local",
      title: "Mobile Banking Support Officer",
      status: "PENDING" as const,
      coverLetter: "I am comfortable explaining app issues to first-time users.",
    },
    {
      email: "sanjay@elevateworkforce.local",
      title: "People Operations Associate",
      status: "PENDING" as const,
      coverLetter: "I coordinated campus hiring for 40 interns last year.",
    },
    {
      email: "seeker@elevateworkforce.local",
      title: "Senior Backend Engineer",
      status: "REJECTED" as const,
      coverLetter: "I know I am junior for this role but wanted to be in the system.",
    },
  ];

  for (const application of applications) {
    const applicantId = seekerIds.get(application.email);
    const jobId = jobIds.get(application.title);
    if (!applicantId || !jobId) {
      continue;
    }

    await prisma.application.upsert({
      where: { jobId_applicantId: { jobId, applicantId } },
      update: {
        status: application.status,
        coverLetter: application.coverLetter,
      },
      create: {
        jobId,
        applicantId,
        status: application.status,
        coverLetter: application.coverLetter,
      },
    });
  }

  const notifications = [
    {
      email: "seeker@elevateworkforce.local",
      title: "Application shortlisted",
      message: "Tech Solutions Nepal shortlisted you for Junior Full Stack Developer.",
      type: "APPLICATION_STATUS",
    },
    {
      email: "seeker@elevateworkforce.local",
      title: "Application submitted",
      message: "Your application for QA Intern has been received.",
      type: "APPLICATION_SUBMITTED",
    },
    {
      email: "anisha@elevateworkforce.local",
      title: "Interview invitation",
      message: "Himalayan Health Care invited you to interview for Staff Nurse.",
      type: "APPLICATION_STATUS",
    },
    {
      email: "employer@elevateworkforce.local",
      title: "New application",
      message: "Ram Sharma applied for Junior Full Stack Developer.",
      type: "NEW_APPLICATION",
    },
    {
      email: "health@elevateworkforce.local",
      title: "New application",
      message: "Anisha Karki applied for Staff Nurse.",
      type: "NEW_APPLICATION",
    },
    {
      email: "admin@elevateworkforce.local",
      title: "Seed data loaded",
      message: "Demo users, companies and jobs are ready for assignment screenshots.",
      type: "SYSTEM",
    },
  ];

  for (const notification of notifications) {
    const user = await prisma.user.findUnique({ where: { email: notification.email } });
    if (!user) continue;
    const existing = await prisma.notification.findFirst({
      where: {
        userId: user.id,
        title: notification.title,
        message: notification.message,
      },
    });
    if (!existing) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
        },
      });
    }
  }

  const [userCount, companyCount, jobCount, applicationCount, notificationCount] = await Promise.all([
    prisma.user.count(),
    prisma.company.count(),
    prisma.job.count(),
    prisma.application.count(),
    prisma.notification.count(),
  ]);

  console.log("Seed complete");
  console.log({
    users: userCount,
    companies: companyCount,
    jobs: jobCount,
    applications: applicationCount,
    notifications: notificationCount,
    password: DEMO_PASSWORD,
    logins: {
      admin: "admin@elevateworkforce.local",
      seeker: "seeker@elevateworkforce.local",
      employer: "employer@elevateworkforce.local",
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
