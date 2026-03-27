const moment = require('moment');
const db = require('../db');

/**
 * Initialize a new review cycle.
 */
const startReviewCycle = async (type, periodLabel, startDate, closeDate, finalizeDate) => {
  const result = await db.query(
    'INSERT INTO review_cycles (type, period_label, start_date, close_date, finalize_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [type, periodLabel, startDate, closeDate, finalizeDate]
  );
  return result.rows[0];
};

/**
 * Check if an employee should skip the current cycle.
 */
const shouldSkipCycle = (doj, cycleCloseDate) => {
  const joinDate = moment(doj);
  const closeDate = moment(cycleCloseDate);
  return closeDate.diff(joinDate, 'days') < 60;
};

/**
 * Get active cycle for a user, handling dual-track logic.
 */
const getActiveCycleForUser = async (userId) => {
  // Logic to fetch user, check cycle_type, and return appropriate active cycle
  // If 'both', quarterly takes precedence.
};

module.exports = { startReviewCycle, shouldSkipCycle, getActiveCycleForUser };
