const { Address, TransactionType, TransactionPaymentSubtype } = require('@signumjs/core')
const { Amount } = require('@signumjs/util')
const { createApi } = require('./api')
const { extractMessage } = require('./extractMessage')
const { generateMasterKeys } = require('@signumjs/crypto')

let api = null

async function fetchTransactions (address) {
  const monitoredAddress = Address.create(address)
  const { transactions } = await api.account.getAccountTransactions({
    accountId: monitoredAddress.getNumericId(),
    type: TransactionType.Payment,
    subtype: TransactionPaymentSubtype.Ordinary,
    includeIndirect: false
  })

  return transactions
}

function filterTransactions (transactions, opts) {
  const regex = new RegExp(opts.message, 'gi')
  let decryptKey = null
  if (opts.phrase) {
    const { agreementPrivateKey } = generateMasterKeys(opts.phrase)
    decryptKey = agreementPrivateKey
  }
  return transactions.filter(tx => {
    let accept = true
    if (opts.message) {
      accept &= regex.test(extractMessage(tx, decryptKey))
    }
    if (opts.signa) {
      accept &= Amount.fromPlanck(tx.amountNQT).greaterOrEqual(Amount.fromSigna(opts.signa))
    }
    return accept
  })
}

async function grab (opts) {
  const { address } = opts
  api = await createApi(opts.node)
  const transactions = await fetchTransactions(address)
  return filterTransactions(transactions, opts)
}

module.exports = {
  grab
}
