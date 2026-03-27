const PgBoss = require('pg-boss');
require('dotenv').config();

const boss = new PgBoss(process.env.DATABASE_URL);

boss.on('error', error => console.error(error));

const startQueue = async () => {
  await boss.start();
  console.log('pg-boss started');

  // Register Job Handlers
  await boss.work('probation-trigger', async (job) => {
    console.log(`Processing probation trigger for employee ${job.data.employee_id}, day ${job.data.trigger_day}`);
    // Logic to send email and mark sent_at
    // const { employee_id, trigger_day } = job.data;
    // await db.query('UPDATE probation_triggers SET sent_at = NOW() WHERE employee_id = $1 AND trigger_day = $2', [employee_id, trigger_day]);
  });

  await boss.work('review-cycle-reminder', async (job) => {
    console.log(`Processing review cycle reminder for user ${job.data.user_id}`);
    // Logic to send reminder
  });
};

const scheduleJob = async (name, data, options) => {
  return await boss.send(name, data, options);
};

module.exports = { startQueue, scheduleJob };
