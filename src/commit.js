const { createApi } = require('./api')
const { Address } = require('@signumjs/core')
const { Amount } = require('@signumjs/util')
const { generateMasterKeys } = require('@signumjs/crypto')

async function applyCommitment ({ api, amount, signPrivateKey, publicKey, fee }) {
  return api.account.addCommitment({
    amountPlanck: amount.getPlanck(),
    feePlanck: fee.getPlanck(),
    senderPrivateKey: signPrivateKey,
    senderPublicKey: publicKey
  })
}

function getBalancesFromAccount (account) {
  const totalBalance = Amount.fromPlanck(account.balanceNQT || '0')
  const availableBalance = Amount.fromPlanck(account.unconfirmedBalanceNQT || '0')
  const lockedBalance = totalBalance.clone().subtract(availableBalance)
  const committedBalance = Amount.fromPlanck(account.committedBalanceNQT || '0')
  return {
    availableBalance,
    committedBalance,
    lockedBalance,
    totalBalance
  }
}

function calculateCommitmentAmount ({ availableBalance, amount, fee }) {
  let commitment
  const netBalance = availableBalance.clone().subtract(fee)
  if (amount.endsWith('%')) {
    const percentage = parseInt(amount)
    commitment = netBalance.multiply(percentage / 100)
  } else {
    const toBeCommittedAmount = Amount.fromSigna(amount)
    commitment = toBeCommittedAmount.greater(netBalance) ? netBalance : toBeCommittedAmount
  }
  if (commitment.lessOrEqual(Amount.Zero())) {
    throw new Error('Insufficient Balance')
  }

  const MinimumCommitment = Amount.fromSigna(1)
  if (commitment.lessOrEqual(MinimumCommitment)) {
    throw new Error(`Commitment must be at least ${MinimumCommitment}. Current amount is ${commitment}`)
  }

  return commitment
}

async function getAccount ({ api, accountId }) {
  return api.account.getAccount({
    accountId,
    includeCommittedAmount: true
  })
}

async function getFeeAmount ({ api, feeType }) {
  const fees = await api.network.getSuggestedFees()
  return Amount.fromPlanck(fees[feeType])
}

async function commit (opts) {
  const { node, fee: feeType, secret, exec, amount } = opts
  const api = await createApi(node)
  const { publicKey, signPrivateKey } = generateMasterKeys(secret)
  const address = Address.fromPublicKey(publicKey)

  const account = await getAccount({ api, accountId: address.getNumericId() })
  const fee = await getFeeAmount({ api, feeType })

  const balances = getBalancesFromAccount(account)

  const commitmentAmount = calculateCommitmentAmount({
    availableBalance: balances.availableBalance,
    amount,
    fee
  })
  const balanceAfterCommitment = balances.availableBalance.clone().subtract(commitmentAmount).subtract(fee)
  const newCommitment = balances.committedBalance.clone().add(commitmentAmount)

  console.info(`Address: ${address.getReedSolomonAddress()} - (id: ${address.getNumericId()})`)
  console.info(`Available Balance: ${balances.availableBalance}`)
  console.info(`Locked Balance: ${balances.lockedBalance}`)
  console.info(`Current Commitment: ${balances.committedBalance}`)
  console.info(`Total Balance: ${balances.totalBalance}`)
  console.info(`Fee: ${fee}`)
  console.info(`Added Commitment: ${commitmentAmount}`)
  console.info(`New Total Commitment: ${newCommitment}`)
  console.info(`Available Balance After Commitment: ${balanceAfterCommitment}`)

  if (exec) {
    console.info('Committing...')
    await applyCommitment({
      api,
      amount: commitmentAmount,
      fee,
      signPrivateKey,
      publicKey
    })
    console.info('✅ Successfully committed')
  } else {
    console.info('🧪 Test Run: Commitment not applied (Run with -x to apply)')
  }

  return {
    address,
    commitmentAmount
  }
}

module.exports = {
  commit
}
