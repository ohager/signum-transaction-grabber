const { version } = require('../package.json')
const { program } = require('commander')
const { Address } = require('@signumjs/core')
const { grab } = require('./grab')
const { Amount } = require('@signumjs/util')
const { updateLogFile } = require('./updateLogFile')

function validateAddress (address) {
  Address.create(address)
  return address
}

function validateAmount (amount) {
  return Amount.fromSigna(amount).getSigna()
}

function toInt (value) {
  const i = parseInt(value, 10)
  if (Number.isNaN(i)) {
    throw new Error('Expected a number')
  }
  return i
}

const app = program
  .version(version)
  .description(`
            @@@@@@@@  @@@@@@@           
         @@@@@    @@@@@    @@@@@        
           @@@  @@@  @@@ @@@@@          
    @@@      @@@@@     @@@@       @@@   
  @@@@@@@@ &@@@  @@@@@@@@ @@@@  @@@@@@@ 
 @@@    @@@@       @@@      @@@@@    @@@
 @@@  @@@ *@@@@           @@@  @@@  @@@@
   @@@@@     @@@         @@@     @@@@@  
 @@@@  @@@  @@@           @@@@  @@@  @@@
 @@@    @@@@@      @@@       @@@@    @@@
  @@@@@@@  @@@  @@@@@@@@  @@@  @@@@@@@@ 
    @@@       @@@@     @@@@@      @@@   
           @@@@  @@@  @@@  @@@          
         @@@@@    @@@@@    @@@@@        
            @@@@@@@  @@@@@@@@    
 
           Signum Pir8 Grabber          
      
  Author: ohager
  Version: ${version}
  `)
  .requiredOption('-a, --address <address>', 'Address to be monitored, can be Reed-Solomon or Id ', validateAddress)
  .option('-p, --phrase <yoursecret>', 'Your senders Signum account passphrase (to read encrypted messages)', '')
  .option('-s, --signa <amount>', 'Target amount in SIGNA', validateAmount)
  .option('-m, --message <regex>', 'Target message using a regex pattern')
  .option('-f, --file <filename>', 'Filename where the data is being collected', './pir8grabber.json')
  .option('-l, --lines <number>', 'Amount of lines inside the file', toInt, 10)
  .option('-n, --node <url>', 'Your custom node. Otherwise the node is selected automatically');

(async () => {
  let opts = {}
  try {
    opts = app.parse().opts()
    const transactions = await grab(opts)
    updateLogFile(opts, transactions)
    console.info(`✅ Found ${transactions.length} new transactions. Updated ${opts.file} sucessfully`)
  } catch (e) {
    console.error('❌ Damn, something Failed:', e)
  }
})()
