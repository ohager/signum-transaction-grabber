const { decryptMessage, generateMasterKeys } = require('@signumjs/crypto')

function extractMessage (transaction, agreementPrivateKey) {
  const { attachment } = transaction
  if (!attachment) return ''

  if (attachment.message) {
    return attachment.message
  }

  if (agreementPrivateKey && attachment.nonce && attachment.isText) {
    return decryptMessage(attachment, transaction.senderPublicKey, agreementPrivateKey)
  }

  return ''
}

module.exports = {
  extractMessage
}
