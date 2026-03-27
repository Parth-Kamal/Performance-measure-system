const moment = require('moment-business-days');
const db = require('../db');

/**
 * Calculate the trigger date based on DOJ and working days.
 * @param {string} doj - Date of Joining (YYYY-MM-DD)
 * @param {number} days - Number of working days (30, 60, 80)
 * @returns {string} - Scheduled date
 */
const calculateTriggerDate = (doj, days) => {
  return moment(doj, 'YYYY-MM-DD').businessAdd(days).format('YYYY-MM-DD');
};

/**
 * Initialize probation triggers for a new employee.
 */
const initializeProbation = async (userId, doj) => {
  const triggers = [30, 60, 80];
  for (const day of triggers) {
    const scheduledDate = calculateTriggerDate(doj, day);
    await db.query(
      'INSERT INTO probation_triggers (employee_id, trigger_day, scheduled_date) VALUES ($1, $2, $3)',
      [userId, day, scheduledDate]
    );
  }
};

/**
 * Adjust triggers due to leave.
 */
const adjustForLeave = async (userId, leaveDays) => {
  // Logic to shift scheduled dates by leaveDays (working days)
  const triggers = await db.query('SELECT * FROM probation_triggers WHERE employee_id = $1 AND sent_at IS NULL', [userId]);
  for (const trigger of triggers.rows) {
    const newDate = moment(trigger.scheduled_date).businessAdd(leaveDays).format('YYYY-MM-DD');
    await db.query(
      'UPDATE probation_triggers SET scheduled_date = $1, leave_adjusted_date = $1 WHERE id = $2',
      [newDate, trigger.id]
    );
  }
};

module.exports = { initializeProbation, adjustForLeave, calculateTriggerDate };
