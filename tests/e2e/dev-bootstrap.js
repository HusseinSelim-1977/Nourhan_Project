// One-off local smoke-test bootstrap. NOT committed.
// Spins up mongodb-memory-server, exports MONGO_URI/JWT_SECRET, then loads server.js.
const path = require('path');
const { MongoMemoryServer } = require(path.join(__dirname, 'repos/Nourhan_Project/Backend/node_modules/mongodb-memory-server'));

(async () => {
  const mem = await MongoMemoryServer.create();
  process.env.MONGO_URI = mem.getUri();
  process.env.JWT_SECRET = 'dev-smoke-jwt-secret-must-be-32-chars-long-yes';
  process.env.JWT_EXPIRES_IN = '7d';
  process.env.PORT = '5000';
  process.env.NODE_ENV = 'development';
  process.env.OPENAI_API_KEY = 'sk-disabled-not-used-for-this-smoke-test';

  process.chdir(path.join(__dirname, 'repos/Nourhan_Project/Backend'));
  require(path.join(__dirname, 'repos/Nourhan_Project/Backend/server.js'));

  console.log('[bootstrap] Mongo URI:', process.env.MONGO_URI);

  // Seed an approved recruiter + 3 jobs after the server has booted, so the
  // Jobs board has something to render in the live demo.
  setTimeout(async () => {
    const mongoose = require(path.join(__dirname, 'repos/Nourhan_Project/Backend/node_modules/mongoose'));
    const User = require(path.join(__dirname, 'repos/Nourhan_Project/Backend/src/models/User'));
    const RecruiterProfile = require(path.join(__dirname, 'repos/Nourhan_Project/Backend/src/models/RecruiterProfile'));
    const Job = require(path.join(__dirname, 'repos/Nourhan_Project/Backend/src/models/Job'));
    if (mongoose.connection.readyState !== 1) {
      console.log('[bootstrap] mongoose not ready yet, skipping seed');
      return;
    }
    let recruiter = await User.findOne({ email: 'demo.recruiter@giu-nexus.test' });
    if (!recruiter) {
      const bcrypt = require(path.join(__dirname, 'repos/Nourhan_Project/Backend/node_modules/bcryptjs'));
      const hash = await bcrypt.hash('password123', 10);
      recruiter = await User.create({
        name: 'Demo Recruiter', email: 'demo.recruiter@giu-nexus.test',
        password: hash, role: 'recruiter'
      });
      await RecruiterProfile.create({ user: recruiter._id, company: 'Aurora Labs', approvalStatus: 'approved' });
    } else {
      await RecruiterProfile.updateOne({ user: recruiter._id }, { $set: { approvalStatus: 'approved' } });
    }
    const existing = await Job.countDocuments();
    if (existing === 0) {
      await Job.create([
        {
          title: 'Senior React Engineer', company: 'Aurora Labs', location: 'Remote', type: 'remote',
          description: 'We are hiring a Senior React Engineer to lead our front-end platform. You will architect a TypeScript design-system, mentor mid-level engineers, ship Node.js BFF services, and own the shared component library. Strong opinions on testing, accessibility, and performance budgets are required.',
          requirements: ['React', 'TypeScript', 'Node.js', 'Testing', 'Accessibility'],
          postedBy: recruiter._id, status: 'active'
        },
        {
          title: 'Cloud Platform Engineer', company: 'Nebula Corp', location: 'Hybrid', type: 'hybrid',
          description: 'Cloud Platform Engineer focused on Kubernetes, AWS Lambda, Postgres, and CI/CD pipelines. You will own the production-readiness checklist for every team rolling new services onto the platform and design the next generation of our deployment tooling.',
          requirements: ['Kubernetes', 'AWS', 'Postgres', 'CI/CD', 'Terraform'],
          postedBy: recruiter._id, status: 'active'
        },
        {
          title: 'Junior Data Scientist', company: 'Tyrell Corp', location: 'On-site', type: 'on-site',
          description: 'Junior Data Scientist working with Python, pandas, scikit-learn, and PyTorch on customer-churn prediction. You will partner with product managers to translate business questions into experiments, build training pipelines, and present findings to non-technical stakeholders.',
          requirements: ['Python', 'pandas', 'scikit-learn', 'SQL'],
          postedBy: recruiter._id, status: 'active'
        }
      ]);
    }
    console.log('[bootstrap] seeded', await Job.countDocuments(), 'jobs');
  }, 1500);
})();
