const accountModel = require("../models/account.model");

async function createAccountController(req, res) {
  try {
    // Create new account for logged-in user
    const user = req.user;

    const account = await accountModel.create({
      user: user._id
    });

    return res.status(201).json({
      account
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to create account"
    });
  }
}


async function getAccountBalanceController(req, res) {

  const { accountId } = req.params;

  const account = await accountModel.findOne({
    _id: accountId,
    user: req.user._id
  });

  if (!account) {
    return res.status(404).json({
      message: "Account not found"
    });
  }

  const balance = await account.getBalance();

  return res.status(200).json({
    balance
  });
}

async function getUserAccountsController(req, res) {
  try {
    const accounts = await accountModel.find({
      user: req.user._id
    });

    const accountsWithBalance = await Promise.all(
      accounts.map(async (account) => {
        const balance = await account.getBalance();
        return {
          _id: account._id,
          status: account.status,
          currency: account.currency,
          balance
        };
      })
    );

    return res.status(200).json(accountsWithBalance);

  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch accounts"
    });
  }
}

module.exports = {
  createAccountController,
  getAccountBalanceController,
  getUserAccountsController
};


