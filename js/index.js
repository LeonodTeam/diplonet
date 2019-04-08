// Makes a header menu (nav) item as active
// VOID
function set_active(element) {
    const menu = document.getElementById('header_menu');
    items = menu.children;
    for (let i of items) {
        i.className = i.className.replace(' active', '');
    }
    element.className += ' active';
}

// Shows the homepage
// VOID
function show_home() {
    const homepage_div = document.getElementById('home_div');
    const certify_div = document.getElementById('certif_diplom_div');
    homepage_div.style.display = 'block';
    certify_div.style.display = 'none';
    set_active(document.getElementById('header_link_home'))
}

// Shows the page to certify a diplom
// VOID
function show_certify() {
    const homepage_div = document.getElementById('home_div');
    const certify_div = document.getElementById('certif_diplom_div');
    homepage_div.style.display = 'none';
    certify_div.style.display = 'block';
    // Set the header link as active
    set_active(document.getElementById('header_link_certify'));
}

// Checks entries from user in the form to certify a diplom
// :return: True if informations seems correct, False otherwise
function check_form_certify() {
    const form = document.getElementById('form_certify');
    if (form.diplom.value == '') {
        console.log('dip');
        return false;
    } else if (!(2010 <= parseInt(form.diplom.awarding_year, 10) <= 2019)) {
        console.log('award');
        return false;
    } else if (!form.student_name.value.match(/^[A-Za-z ]+$/)) {
        // The name MUST be composed of only letters and space
        console.log('name');
        return false;
    }
    const birthdate = form.birthdate.value.split('/');
    console.log(birthdate);
    if (birthdate.length != 3) {
        console.log('length');
        return false;
    } else if (!(1 <= parseInt(birthdate[0], 10) <= 31)) {
        console.log('jour');
        return false;
    } else if (!(1 <= parseInt(birthdate[1], 10) <= 12)) {
        console.log('mois');
        return false;
    } else if (!(1919 <= parseInt(birthdate[2], 10) <= 2019)) {
        console.log('jour');
        return false;
    }
    console.log('Tout va bien');
    return true;
}

// Customize the select2 searchbox behaviour. Makes the entries match if the user types the first letters,
// non case-sensitive, without considering spaces. 
// HINT : $.trim() doesn't remove spaces as expected
// :return: The entry on success, null on failure
function matchDiplom(params, data) {
    params.term = params.term || '';
    // If there are no search terms, return all of the data
    if (params.term.replace(/\s+/g, '') === '') {
      return data;
    }
    // Do not display the item if there is no 'text' property
    if (typeof data.text === 'undefined') {
      return null;
    }
    if (data.text.toUpperCase().replace(/\s+/g, '').indexOf(params.term.toUpperCase().replace(/\s+/g, '')) > -1) {
        return data;
    }
    return null;
}

// Checks the validity of mnemonic words entered in the form
function check_mnemonics() {
    const form = document.getElementById('form_mnemonic');
    const mnemonics = form.mnemonics.value.split(' ');

    if (!(12 <= mnemonics.length <= 24)) {
        return false;
    }
    mnemonics.forEach( (mnemonic) => {
        mnemonic = mnemonic.toLowerCase();
        if (!mnemonic.match(/^[a-z]+$/)) {
            return false;
        }
    });
    return true;
}

// Creates a Bitcoin transaction with an OP_RETURN as output containing the hash of the informations
// provided in the form, signing it with the mnemonics passed as parameters.
// The hash is composed of : the rncp code + the awarding date + the student name in lowercase, without any space + his birthdate without any separator.
// The source of the rncps is the onicep.
// :param mnemonics: The words to derive a private key from, as a string
// :return: A transaction object
function createTransaction(mnemonics) {
    // Get the hash from form entries
    const mnemonic_entropy = buffer.Buffer.from(bip39.mnemonicToEntropy(mnemonics), 'hex');
    const keypair = Bitcoin.ECPair.fromPrivateKey(mnemonic_entropy, { network: Bitcoin.networks.testnet });
    const address = Bitcoin.payments.p2pkh({pubkey: keypair.publicKey, network: Bitcoin.networks.testnet}).address; // :'(
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
    // 10 block confirmation is OK, no need for an instant inclusion in a block.
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
                tx.addOutput(address, value);
            }
            else if (sats_needed > 0) {
                throw 'Not enough funds to send the transaction';
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


// Setup the behaviour of this one-pager website, adding the evenments, filling the dinamically allocated informations, etc..
function setup() {
    document.addEventListener('DOMContentLoaded', () => {
        show_home();
        
        // Populate diplom list in <select>
        const element_select = document.getElementById('diplom_list');
        fetch('diplomes.json', {mode: 'no-cors'})
        .then((r) => {
            return r.json();
        })
        .then((doc) => {
            let diploms = [];
            doc.forEach((obj) => {
                if (obj.code_rncp != "") {
                    let diplom = obj.sigle_type_formation != "" ? obj.sigle_type_formation + '  ' : '';
                    diplom += obj.libelle_formation_principal + ' ' + obj.libelle_formation_complementaire;
                    diplom += obj.libelle_niveau_rncp;
                    diplom += " --- RNCP : " + obj.code_rncp;
                    diplom = diplom.charAt(0).toUpperCase() + diplom.slice(1);
                    diploms.push(diplom);
                }
            });
            diploms = diploms.sort();
            diploms.forEach((diplom) => {
                const option = document.createElement('option');
                option.innerHTML = diplom;
                element_select.appendChild(option);
            });
        });
        // The search function for the select2 searchbox
        $('.select2_list').select2({
            matcher: matchDiplom,
            theme: 'bootstrap'
        });

        // ======== Events ===========
        // Homepage
        document.getElementById('homepage_certify_button').addEventListener('click', show_certify, false);
        // Header
        document.getElementById('header_logo').addEventListener('click', show_home, false);
        document.getElementById('header_link_home').addEventListener('click', show_home, false);
        document.getElementById('header_link_certify').addEventListener('click', show_certify, false);
        // Certify page
        document.getElementById('btn_certify').addEventListener('click', (e) => {
            e.preventDefault();
           // if (check_form_certify()) {
                $('#bitcoinTxModal').modal();
           // }
                
        }, false);
        document.getElementById('btn_signtx').addEventListener('click', (e) => {
            e.preventDefault();
            //if (check_mnemonics()) {
                createTransaction(document.getElementById('form_mnemonic').mnemonics.value).then((tx) => {
                    // Broadcast the tx once again using Blockstream's API because bitcoinjs does not provide peer messaging.....
                    fetch('https://blockstream.info/testnet/api/tx', {
                        method: 'POST',
                        body: tx,
                        headers: {
                            'Accept': '*/*'
                        }
                    })
                    .then((response) => {
                        console.log(response);
                    })
                    .catch((error) => {
                        console.log(error);
                    });
                });
            //}
        });

    }, false);
}

setup();
