const db = require('../db');

/**
 * Log an action to the audit_log table.
 */
const logAction = async (action, performedBy, targetEntity = null, targetId = null, notes = null) => {
  try {
    await db.query(
      'INSERT INTO audit_log (action, performed_by, target_entity, target_id, notes) VALUES ($1, $2, $3, $4, $5)',
      [action, performedBy, targetEntity, targetId, notes]
    );
  } catch (err) {
    console.error('Audit Log Error:', err);
  }
};

module.exports = { logAction };
