// One-off: approve the demo recruiter so they can post jobs.
const mongoose = require('/home/ubuntu/repos/Nourhan_Project/Backend/node_modules/mongoose');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const RecruiterProfile = mongoose.connection.db.collection('recruiterprofiles');
  const r = await RecruiterProfile.updateMany({}, { $set: { approvalStatus: 'approved' } });
  console.log('updated', r.modifiedCount, 'recruiter profiles to approved');
  await mongoose.disconnect();
})();
