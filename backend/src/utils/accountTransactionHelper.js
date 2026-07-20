const AccountTransaction = require("../models/AccountTransaction");

/**
 * Helper to record an automated credit or debit transaction.
 * Automatically assigns the current financial year based on the date.
 */
const recordTransaction = async ({
  transactionType,
  source,
  category,
  amount,
  paymentMethod,
  description,
  referenceId,
  referenceModel,
  recordedBy,
  status = "Completed"
}) => {
  try {
    const today = new Date();
    // Indian Financial Year: April 1 to March 31
    const currentMonth = today.getMonth(); // 0-11
    const currentYear = today.getFullYear();
    let financialYear = "";
    if (currentMonth >= 3) {
      financialYear = `${currentYear}-${currentYear + 1}`;
    } else {
      financialYear = `${currentYear - 1}-${currentYear}`;
    }

    const transaction = new AccountTransaction({
      transactionType,
      source,
      category,
      amount,
      financialYear,
      paymentMethod,
      description,
      referenceId,
      referenceModel,
      recordedBy,
      status
    });

    await transaction.save();
    console.log(`[Accounts] Successfully recorded ${transactionType} from ${source} for amount ${amount}`);
    return transaction;
  } catch (error) {
    console.error("[Accounts] Failed to record automated transaction:", error);
  }
};

module.exports = { recordTransaction };
