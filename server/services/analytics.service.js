const { Transaction, Account } = require('../models');
const { TRANSACTION_STATUS } = require('../config/constants');

/**
 * Analytics Service
 * Handles analytics and reporting
 */
class AnalyticsService {
  /**
   * Get monthly transaction statistics
   * @param {string} accountNumber - Account number
   * @param {number} year - Year for analytics
   * @returns {Object} Monthly stats
   */
  async getMonthlyStats(accountNumber, year = new Date().getFullYear()) {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    // Credit stats (money received)
    const creditStats = await Transaction.aggregate([
      {
        $match: {
          receiverAccount: accountNumber,
          status: TRANSACTION_STATUS.COMPLETED,
          createdAt: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Debit stats (money sent)
    const debitStats = await Transaction.aggregate([
      {
        $match: {
          senderAccount: accountNumber,
          status: TRANSACTION_STATUS.COMPLETED,
          createdAt: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format data for all 12 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = months.map((month, index) => {
      const creditData = creditStats.find(c => c._id === index + 1);
      const debitData = debitStats.find(d => d._id === index + 1);

      return {
        month,
        monthNumber: index + 1,
        credit: {
          total: creditData?.total || 0,
          count: creditData?.count || 0
        },
        debit: {
          total: debitData?.total || 0,
          count: debitData?.count || 0
        },
        net: (creditData?.total || 0) - (debitData?.total || 0)
      };
    });

    // Calculate totals
    const totals = monthlyData.reduce(
      (acc, month) => ({
        totalCredit: acc.totalCredit + month.credit.total,
        totalDebit: acc.totalDebit + month.debit.total,
        totalCreditCount: acc.totalCreditCount + month.credit.count,
        totalDebitCount: acc.totalDebitCount + month.debit.count
      }),
      { totalCredit: 0, totalDebit: 0, totalCreditCount: 0, totalDebitCount: 0 }
    );

    return {
      year,
      monthlyData,
      totals: {
        ...totals,
        netFlow: totals.totalCredit - totals.totalDebit,
        totalTransactions: totals.totalCreditCount + totals.totalDebitCount
      }
    };
  }

  /**
   * Get transaction summary/overview
   * @param {string} accountNumber - Account number
   * @returns {Object} Summary data
   */
  async getSummary(accountNumber) {
    const account = await Account.findOne({ accountNumber });
    if (!account) {
      return null;
    }

    // Get current month stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [monthlyCredit, monthlyDebit, allTimeStats] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            receiverAccount: accountNumber,
            status: TRANSACTION_STATUS.COMPLETED,
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      Transaction.aggregate([
        {
          $match: {
            senderAccount: accountNumber,
            status: TRANSACTION_STATUS.COMPLETED,
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      Transaction.aggregate([
        {
          $match: {
            $or: [
              { senderAccount: accountNumber },
              { receiverAccount: accountNumber }
            ],
            status: TRANSACTION_STATUS.COMPLETED
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    return {
      currentBalance: account.balance,
      currency: account.currency,
      thisMonth: {
        income: monthlyCredit[0]?.total || 0,
        incomeCount: monthlyCredit[0]?.count || 0,
        expense: monthlyDebit[0]?.total || 0,
        expenseCount: monthlyDebit[0]?.count || 0,
        net: (monthlyCredit[0]?.total || 0) - (monthlyDebit[0]?.total || 0)
      },
      allTime: {
        totalTransactions: allTimeStats[0]?.count || 0
      }
    };
  }

  /**
   * Get spending by category/reference pattern
   * @param {string} accountNumber - Account number
   * @param {number} months - Number of months to analyze
   * @returns {Object} Spending breakdown
   */
  async getSpendingBreakdown(accountNumber, months = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const spending = await Transaction.aggregate([
      {
        $match: {
          senderAccount: accountNumber,
          status: TRANSACTION_STATUS.COMPLETED,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $regexMatch: { input: { $ifNull: ['$reference', ''] }, regex: /bill|utility/i } },
              'Bills & Utilities',
              {
                $cond: [
                  { $regexMatch: { input: { $ifNull: ['$reference', ''] }, regex: /rent|housing/i } },
                  'Housing',
                  {
                    $cond: [
                      { $regexMatch: { input: { $ifNull: ['$reference', ''] }, regex: /food|grocery|restaurant/i } },
                      'Food & Dining',
                      'Other Transfers'
                    ]
                  }
                ]
              }
            ]
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const totalSpending = spending.reduce((sum, cat) => sum + cat.total, 0);

    return {
      period: `Last ${months} months`,
      totalSpending,
      categories: spending.map(cat => ({
        category: cat._id,
        amount: cat.total,
        count: cat.count,
        percentage: totalSpending > 0 ? Math.round((cat.total / totalSpending) * 100) : 0
      }))
    };
  }

  /**
   * Get daily transaction trend
   * @param {string} accountNumber - Account number
   * @param {number} days - Number of days
   * @returns {Object} Daily trend data
   */
  async getDailyTrend(accountNumber, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const dailyStats = await Transaction.aggregate([
      {
        $match: {
          $or: [
            { senderAccount: accountNumber },
            { receiverAccount: accountNumber }
          ],
          status: TRANSACTION_STATUS.COMPLETED,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            type: {
              $cond: [
                { $eq: ['$senderAccount', accountNumber] },
                'debit',
                'credit'
              ]
            }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Format into daily entries
    const dailyMap = {};
    dailyStats.forEach(stat => {
      if (!dailyMap[stat._id.date]) {
        dailyMap[stat._id.date] = { date: stat._id.date, credit: 0, debit: 0, creditCount: 0, debitCount: 0 };
      }
      if (stat._id.type === 'credit') {
        dailyMap[stat._id.date].credit = stat.total;
        dailyMap[stat._id.date].creditCount = stat.count;
      } else {
        dailyMap[stat._id.date].debit = stat.total;
        dailyMap[stat._id.date].debitCount = stat.count;
      }
    });

    return {
      period: `Last ${days} days`,
      data: Object.values(dailyMap).map(day => ({
        ...day,
        net: day.credit - day.debit
      }))
    };
  }
}

module.exports = new AnalyticsService();
