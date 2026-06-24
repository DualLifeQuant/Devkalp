import asyncio
from datetime import datetime, date, timedelta
from sqlalchemy import select
from app.database import AsyncSessionLocal, engine, Base
from app.models import User, UserRole, Job, JobStatus

async def seed():
    # Make sure tables are created
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as db:
        # 1. Get default admin
        admin_email = "admin@devkalp.org"
        result = await db.execute(select(User).where(User.email == admin_email))
        admin = result.scalar_one_or_none()
        
        if not admin:
            # Create default admin if not exist
            from app.core.security import get_password_hash
            admin = User(
                full_name="Super Admin",
                email=admin_email,
                phone="9999999999",
                hashed_password=get_password_hash("Admin@123"),
                role=UserRole.ADMIN,
                is_active=True,
                is_verified=True,
            )
            db.add(admin)
            await db.flush()
            
        # 2. Check if jobs exist
        result = await db.execute(select(Job))
        jobs = result.scalars().all()
        
        # If there are fewer than 2 jobs, seed the default jobs
        if len(jobs) <= 1:
            print("Seeding default jobs...")
            default_jobs = [
                Job(
                    title="Senior Community Outreach Lead",
                    department="Community Development",
                    location="Surat HQ, Gujarat (Hybrid)",
                    job_type="full-time",
                    experience_min=3,
                    experience_max=8,
                    salary_min=45000,
                    salary_max=65000,
                    description="We are seeking an experienced Senior Community Outreach Lead to spearhead our grassroots development programs across Surat and rural Gujarat. You will collaborate closely with local municipal bodies, community elders, and volunteer networks to design and execute high-impact social welfare campaigns.",
                    requirements="• 3+ years of experience in community development or social work.\n• Proven team leadership and project management capabilities.\n• Fluency in Gujarati and Hindi; strong English is a plus.\n• Excellent public speaking and relationship-building skills.",
                    responsibilities="Lead a dedicated team of 15+ regional volunteers and field coordinators.\nEstablish strategic partnerships with local NGOs, educational institutions, and healthcare providers.\nMonitor program metrics, assess community impact, and prepare quarterly executive transparency reports.\nOrganize large-scale health camps, vocational training drives, and educational empowerment workshops.",
                    skills_required=["Community Organizing", "Team Leadership", "Gujarati & Hindi", "Public Speaking", "Program Management"],
                    positions=2,
                    status=JobStatus.OPEN.value,
                    application_deadline=(date.today() + timedelta(days=30)),
                    created_by=admin.id
                ),
                Job(
                    title="Healthcare Program Coordinator",
                    department="Medical Initiatives",
                    location="Surat HQ, Gujarat",
                    job_type="full-time",
                    experience_min=2,
                    experience_max=5,
                    salary_min=38000,
                    salary_max=52000,
                    description="The Healthcare Program Coordinator plays a pivotal role in organizing mobile medical dispensaries, specialized health camps, and preventive healthcare awareness campaigns in underserved neighborhoods of Surat.",
                    requirements="• Bachelor's or Master's degree in Public Health, Healthcare Management, or Social Work.\n• 2+ years of coordinating experience in healthcare campaigns or NGOs.\n• Strong organizational, logistics, and record-keeping skills.",
                    responsibilities="Coordinate with volunteer doctors, nursing staff, and medical supply vendors.\nManage end-to-end logistics for weekly mobile health clinics and diagnostic camps.\nMaintain rigorous patient care records and follow-up tracking databases.\nConduct community health surveys to identify prevalent medical needs.",
                    skills_required=["Healthcare Management", "NGO Operations", "Medical Camp Coordination", "Budgeting"],
                    positions=3,
                    status=JobStatus.OPEN.value,
                    application_deadline=(date.today() + timedelta(days=25)),
                    created_by=admin.id
                ),
                Job(
                    title="Rural Education Specialist",
                    department="Education & Literacy",
                    location="Surat District / Rural Gujarat",
                    job_type="contract",
                    experience_min=2,
                    experience_max=6,
                    salary_min=35000,
                    salary_max=48000,
                    description="Join our mission to bridge the educational divide in rural Gujarat. As a Rural Education Specialist, you will develop interactive learning modules, train local village educators, and implement digital literacy programs for primary and secondary school children.",
                    requirements="• Strong foundation in curriculum design, child psychology, or teacher training.\n• Native fluency in Gujarati is mandatory.\n• Ability to travel and work in rural settings.",
                    responsibilities="Design culturally relevant, engaging curriculum materials for rural students.\nConduct interactive training workshops for village teachers and Anganwadi workers.\nImplement tablet-based learning initiatives in remote community centers.\nAssess student learning outcomes and adapt teaching methodologies accordingly.",
                    skills_required=["Curriculum Design", "Child Psychology", "Teacher Training", "Gujarati Fluency"],
                    positions=4,
                    status=JobStatus.OPEN.value,
                    application_deadline=(date.today() + timedelta(days=40)),
                    created_by=admin.id
                ),
                Job(
                    title="Digital Marketing & Fundraising Officer",
                    department="Communications & PR",
                    location="Surat HQ, Gujarat (Remote Eligible)",
                    job_type="full-time",
                    experience_min=1,
                    experience_max=4,
                    salary_min=40000,
                    salary_max=60000,
                    description="We are looking for a creative, results-driven Digital Marketing & Fundraising Officer to amplify Devkalp Foundation’s digital presence, manage crowdfunding campaigns, and engage our global donor community through compelling storytelling.",
                    requirements="• 1+ years of experience in digital marketing, fundraising, or social media strategy.\n• Familiarity with ad campaigns, copywriting, and analytics tools.\n• Strong empathy and storytelling abilities.",
                    responsibilities="Strategize and execute multi-channel fundraising campaigns across social media and email newsletters.\nCreate high-impact video narratives, infographics, and impact reports highlighting our ongoing projects.\nCultivate relationships with corporate CSR heads, philanthropic foundations, and individual major donors.\nOptimize website conversion funnels and track campaign ROI using advanced web analytics.",
                    skills_required=["Digital Campaign Management", "Donor Relations", "Social Media Strategy", "Content Writing", "Analytics"],
                    positions=1,
                    status=JobStatus.OPEN.value,
                    application_deadline=(date.today() + timedelta(days=15)),
                    created_by=admin.id
                ),
                Job(
                    title="Operations & Logistics Manager",
                    department="Administration",
                    location="Surat HQ, Gujarat",
                    job_type="full-time",
                    experience_min=4,
                    experience_max=10,
                    salary_min=50000,
                    salary_max=70000,
                    description="The Operations & Logistics Manager oversees the smooth administrative functioning of our Surat headquarters and regional relief centers. You will manage procurement, inventory of relief materials, vehicle fleet logistics, and facility safety protocols.",
                    requirements="• 4+ years of experience in supply chain, logistics, or facility administration.\n• Exceptional vendor negotiation and contract management skills.\n• Detail-oriented with focus on inventory control.",
                    responsibilities="Manage end-to-end supply chain for disaster relief materials, medical kits, and educational supplies.\nNegotiate favorable contracts with vendors, transport agencies, and maintenance contractors.\nImplement robust inventory tracking systems to ensure complete transparency and zero wastage.\nOversee fleet management of mobile medical vans and outreach vehicles.",
                    skills_required=["Supply Chain Management", "Vendor Negotiation", "Facility Administration", "Inventory Control"],
                    positions=1,
                    status=JobStatus.OPEN.value,
                    application_deadline=(date.today() + timedelta(days=35)),
                    created_by=admin.id
                ),
                Job(
                    title="Social Work Research Intern",
                    department="Research & Policy",
                    location="Surat HQ, Gujarat",
                    job_type="internship",
                    experience_min=0,
                    experience_max=1,
                    salary_min=15000,
                    salary_max=20000,
                    description="Gain invaluable grassroots experience by joining our Research & Policy division as a Social Work Research Intern. You will conduct field surveys, interview community beneficiaries, and assist senior researchers in publishing text studies on urban poverty and healthcare access.",
                    requirements="• Pursuing or completed degree in Social Work, Sociology, or Public Policy.\n• Strong empathy and active listening skills.\n• Basic knowledge of data collection and report writing.",
                    responsibilities="Conduct structured door-to-door surveys and focus group discussions in target communities.\nClean, tabulate, and analyze qualitative and quantitative field data.\nAssist in drafting policy briefs, grant proposals, and academic research papers.\nParticipate in weekly mentorship seminars led by senior social scientists.",
                    skills_required=["Data Collection", "Qualitative Research", "Survey Design", "Report Writing", "Empathy"],
                    positions=6,
                    status=JobStatus.OPEN.value,
                    application_deadline=(date.today() + timedelta(days=60)),
                    created_by=admin.id
                )
            ]
            db.add_all(default_jobs)
            await db.commit()
            print("Successfully seeded default jobs in the database!")
        else:
            print("Database already has jobs. Skipping seeding.")

if __name__ == "__main__":
    asyncio.run(seed())
