const fs = require('fs-extra')
const { Amount } = require('@signumjs/util')
const { extractMessage } = require('./extractMessage')
const { generateMasterKeys } = require('@signumjs/crypto')

function updateLogFile (opts, transactions) {
  fs.ensureFileSync(opts.file)
  let data = {}
  try {
    data = fs.readJsonSync(opts.file)
  } catch (e) {
    // no op -- for an empty file!
  }
  let decryptKey = null
  if (opts.phrase) {
    const { agreementPrivateKey } = generateMasterKeys(opts.phrase)
    decryptKey = agreementPrivateKey
  }
  const mappedTransactions = transactions.map(t => ({
    id: t.transaction,
    sender: t.sender,
    amount: Amount.fromPlanck(t.amountNQT).getSigna(),
    message: extractMessage(t, decryptKey)
  }))

  const { lines, address, signa, message } = opts
  const previousTransactions = data.transactions || []
  previousTransactions.unshift(...mappedTransactions)
  const updatedTransactions = previousTransactions.slice(0, lines)

  const updatedData = {
    lastModified: new Date().toISOString(),
    params: {
      address,
      lines,
      signa,
      message
    },
    transactions: updatedTransactions
  }

  fs.writeJsonSync(opts.file, updatedData)
}

module.exports = {
  updateLogFile
}
