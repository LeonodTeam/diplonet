// Creates a Bitcoin transaction with an OP_RETURN as output containing the hash of the informations
// provided in the form, signing it with the mnemonics passed as parameters.
// The hash is composed of : the rncp code + the awarding date + the student name in lowercase, without any space + his birthdate without any separator.
// The source of the rncps is the onicep.
// :param mnemonics: The words to derive a private key from, as a string
// :return: A transaction object
function createTransaction(mnemonics) {
    // Generate a Bitcoin keypair from mnemonics
    let mnemonic_entropy;
    try {
        mnemonic_entropy = new buffer.Buffer.from(bip39.mnemonicToEntropy(mnemonics), 'hex');
    } catch (e) {
        throw 'Invalid mnemonic';
    }
    const keypair = Bitcoin.ECPair.fromPrivateKey(mnemonic_entropy, { network: Bitcoin.networks.testnet });
    const address = Bitcoin.payments.p2pkh({pubkey: keypair.publicKey, network: Bitcoin.networks.testnet}).address; // :'(
    // Get the hash from form entries
    const form = document.getElementById('form_certify');
    const rncp = buffer.Buffer.from(form.diplom.value.split(' RNCP : ')[1]); // OUCH.. :"(
    const year = buffer.Buffer.from(form.awarding_year.value);
    const name = buffer.Buffer.from(form.student_name.value.toLowerCase().replace(/\s+/g, ''));
    const birthdate = buffer.Buffer.from(form.student_birthdate.value.replace(/\//g, ''));
    const hash = Bitcoin.crypto.sha256(rncp + year + name + birthdate);
    // Create a transaction with an OP_RETURN output containing this hash
    const tx = new Bitcoin.TransactionBuilder(Bitcoin.networks.testnet);
    out_opreturn = Bitcoin.script.compile([Bitcoin.opcodes.OP_RETURN, hash])
    tx.addOutput(out_opreturn, 0);
    // 10 blocks confirmation is OK, no need for an instant inclusion in a block.
    return fetch('https://blockstream.info/testnet/api/fee-estimates').then((r) => r.json()).then((fees) => fees['10']).then((feerate) => {
        // Fetching UTXOs txids to add as input of this tx
        const inputs = [];
        // https://en.bitcoin.it/wiki/Weight_units
        //          version flag nin nout outvalue outscriptsize outscript sigsize sig pubkeysize pubkey locktime
        const tx_vsize = 4 + 1 + 1 + 1 + 8 + 1 + out_opreturn.length + 1 + 72 + 1 + 32 + 4
        let sats_needed = feerate * tx_vsize // We just need to pay for the fee.
        return fetch('https://blockstream.info/testnet/api/address/'+address+'/utxo').then((r) => r.json()).then((utxos) => {
            // First we check for little inputs to avoid making a second output (and to help the network ^^)
            for (let i = 0; i < utxos.length; ++i) {
                if (utxos[i].value < sats_needed) {
                    sats_needed -= utxos[i].value;
                    sats_needed += 64 * feerate; // txid + index + script length + script + sequence, taking an approximate script size of 23bytes
                    inputs.push(utxos[i]);
            }
                if (sats_needed <= 0) {
                    break;
                }
            }
            // If the value has not been filled then check any input
            for (let i = 0; i < utxos.length; ++i) {
                if (sats_needed > 0) {
                    sats_needed -= utxos[i].value;
                    sats_needed += 64; // txid + index + script length + script + sequence, taking an approximate script size of 23bytes
                    inputs.push(utxos[i]);
                } else {
                    break;
                }
            }
            if (sats_needed <= -35 * feerate) {
                // It becomes viable to create another output
                const value = -sats_needed - 40;
                tx.addOutput(address, Math.round(value));
            }
            else if (sats_needed > 0) {
                throw 'Not enough funds';
            }
            // We now got all inputs
            for (let i = 0; i < inputs.length; ++i) {
                tx.addInput(inputs[i].txid, inputs[i].vout);
                tx.sign(i, keypair);
            }
            return tx.build().toHex();
        });
    });
}

// Verifies if the hash of given informations is the same as the one in the transaction
// :return: A promise that resolves as a boolean.
function verify_diplom() {
    const form = document.getElementById('form_verify');
    const rncp = buffer.Buffer.from(form.diplom.value.split(' RNCP : ')[1]); // OUCH.. :"(
    const year = buffer.Buffer.from(form.awarding_year.value);
    const name = buffer.Buffer.from(form.student_name.value.toLowerCase().replace(/\s+/g, ''));
    const birthdate = buffer.Buffer.from(form.student_birthdate.value.replace(/\//g, ''));
    const txid = form.txid.value;
    const hash = Bitcoin.crypto.sha256(rncp + year + name + birthdate);

    return fetch(`https://blockstream.info/testnet/api/tx/${txid}`).then(r => r.json()).then((tx) => {
        for (let i = 0; i < tx.vout.length; ++i) {
            // If this output contains an OPRETURN
            if (tx.vout[i].scriptpubkey.substr(0,2) == '6a') {
                const opreturn_hash = tx.vout[i].scriptpubkey.substr(4);
                if (opreturn_hash == hash.toString('hex')) {
                    return true;
                }
            }
        }
        return false; // return here so we check all the outputs, in the unlikely case where the tx contains many OPRETURN
    })
}
