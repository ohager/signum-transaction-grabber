# signum-transaction-grabber

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
![node-current](https://img.shields.io/node/v/signum-pir8-grabber)
![npm](https://img.shields.io/npm/v/signum-pir8-grabber)

<img src="./img/signum_logo.svg" height="64" />

A small tool that grabs Signum transactions from a specific account by certain criteria and logs it into a file.

# Usage

> Prerequisite: NodeJS 14+ installed

Install using 

```bash 
npm i signum-transaction-grabber -g
signum-grabber -h
```

```
Usage: pir8grabber [options]

Options:
  -V, --version              output the version number
  -a, --address <address>    Address to be monitored, can be Reed-Solomon or Id
  -p, --phrase <yoursecret>  Your senders Signum account passphrase (to read encrypted messages) (default: "")
  -s, --signa <amount>       Target amount in SIGNA
  -m, --message <regex>      Target message using a regex pattern
  -f, --file <filename>      Filename where the data is being collected (default: "./pir8grabber.json")
  -l, --lines <number>       Amount of lines inside the file (default: 10)
  -n, --node <url>           Your custom node. Otherwise the node is selected automatically
  -h, --help                 display help for command
```

Usage Examples:

----

Log last at maximum ten transactions sent to account `S-9K9L-4CB5-88Y5-F5G4Z` that contains the string "NDS" in their message 

`pir8grabber -a S-9K9L-4CB5-88Y5-F5G4Z -m "NDS"`

----
Log last at maximum twenty transactions sent to account `S-9K9L-4CB5-88Y5-F5G4Z` that has more than 50 SIGNA into `./acme.json` 

`pir8grabber -a S-9K9L-4CB5-88Y5-F5G4Z -s 50 -l 20 -f ./acme.json`

----
Log last at maximum ten transactions sent to account `S-9K9L-4CB5-88Y5-F5G4Z` that has messages starting with "foo"  and considering also encrypted messages`

`pir8grabber -a S-9K9L-4CB5-88Y5-F5G4Z -m "^foo" -p "my super secret passphrase"`

