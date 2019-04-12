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
    const verify_div = document.getElementById('verif_diplom_div');
    const aboutpage_div = document.getElementById('about_div');
    homepage_div.style.display = 'block';
    certify_div.style.display = 'none';
    verify_div.style.display = 'none';
    aboutpage_div.style.display = 'none';
    // Set the header link as active
    set_active(document.getElementById('header_link_home'));
}

// Shows the page to certify a diploma
// VOID
function show_certify() {
    const homepage_div = document.getElementById('home_div');
    const certify_div = document.getElementById('certif_diplom_div');
    const verify_div = document.getElementById('verif_diplom_div');
    const aboutpage_div = document.getElementById('about_div');
    homepage_div.style.display = 'none';
    certify_div.style.display = 'block';
    verify_div.style.display = 'none';
    aboutpage_div.style.display = 'none';
    // Set the header link as active
    set_active(document.getElementById('header_link_certify'));
    // Hide tx form result
    document.getElementById('tx_form_result').style.display = 'none';
}

// Shows the page to verify a diploma
// VOID
function show_verify() {
    const homepage_div = document.getElementById('home_div');
    const certify_div = document.getElementById('certif_diplom_div');
    const verify_div = document.getElementById('verif_diplom_div');
    const aboutpage_div = document.getElementById('about_div');
    homepage_div.style.display = 'none';
    certify_div.style.display = 'none';
    verify_div.style.display = 'block';
    aboutpage_div.style.display = 'none';
    // Set the header link as active
    set_active(document.getElementById('header_link_verify'));
    document.getElementById('verify_form_result').style.display = 'none';
}

// Shows the page about
// VOID
function show_about() {
    const homepage_div = document.getElementById('home_div');
    const certify_div = document.getElementById('certif_diplom_div');
    const verify_div = document.getElementById('verif_diplom_div');
    const aboutpage_div = document.getElementById('about_div');
    homepage_div.style.display = 'none';
    certify_div.style.display = 'none';
    verify_div.style.display = 'none';
    aboutpage_div.style.display = 'block';
    // Set the header link as active
    set_active(document.getElementById('header_link_about'));
}

// Checks entries from user in the form to certify a diplom
// :return: True if informations seems correct, False otherwise
function check_form_certify() {
    const form = document.getElementById('form_certify');
    if (form.diplom.value == '') {
        return false;
    } else if (!(2010 <= parseInt(form.diplom.awarding_year, 10) <= 2019)) {
        return false;
    } else if (!form.student_name.value.match(/^[A-Za-z ]+$/)) {
        // The name MUST be composed of only letters and space
        return false;
    }
    const birthdate = form.birthdate.value.split('/');
    if (birthdate.length != 3) {
        return false;
    } else if (!(1 <= parseInt(birthdate[0], 10) <= 31)) {
        return false;
    } else if (!(1 <= parseInt(birthdate[1], 10) <= 12)) {
        return false;
    } else if (!(1919 <= parseInt(birthdate[2], 10) <= 2019)) {
        return false;
    }
    return true;
}

// Checks entries from user in the verify form
// :return: True if informations seems correct, False otherwise
function check_form_verify () {
    const form = document.getElementById('form_verify');
    if (form.diplom.value == '') {
        return false;
    } else if (!(2010 <= parseInt(form.diplom.awarding_year, 10) <= 2019)) {
        return false;
    } else if (!form.student_name.value.match(/^[A-Za-z ]+$/)) {
        // The name MUST be composed of only letters and space
        return false;
    }
    const birthdate = form.student_birthdate.value.split('/');
    if (birthdate.length != 3) {
        return false;
    } else if (!(1 <= parseInt(birthdate[0], 10) <= 31)) {
        return false;
    } else if (!(1 <= parseInt(birthdate[1], 10) <= 12)) {
        return false;
    } else if (!(1919 <= parseInt(birthdate[2], 10) <= 2019)) {
        return false;
    }
    const txid = form.txid.value;
    if (txid.length != 64) {
        return false;
    }
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

 function verify() {
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

// Setup the behaviour of this one-pager website, adding the evenments, filling the dinamically allocated informations, etc..
function setup() {
    document.addEventListener('DOMContentLoaded', () => {
        show_home();
        
        // Populate diplom list in <select>s
        const element_select_certify = document.getElementById('diplom_list_certify');
        const element_select_verify = document.getElementById('diplom_list_verify');
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
                const optionb = document.createElement('option');
                optionb.innerHTML = diplom;
                element_select_certify.appendChild(option);
                element_select_verify.appendChild(optionb);
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
        document.getElementById('homepage_verify_button').addEventListener('click', show_verify, false);
        document.getElementById('homepage_graduate_button').addEventListener('click', show_verify, false);
        // Header
        document.getElementById('header_logo').addEventListener('click', show_home, false);
        document.getElementById('header_link_home').addEventListener('click', show_home, false);
        document.getElementById('header_link_certify').addEventListener('click', show_certify, false);
        document.getElementById('header_link_verify').addEventListener('click', show_verify, false);
        document.getElementById('header_link_about').addEventListener('click', show_about, false);
        // Thumbnails
        document.getElementById('img_company').addEventListener('click', show_verify, false);
        document.getElementById('img_school').addEventListener('click', show_certify, false);
        document.getElementById('img_graduate').addEventListener('click', show_verify, false);

        // Certify page
        document.getElementById('btn_certify').addEventListener('click', (e) => {
            e.preventDefault();
           if (check_form_certify()) {
                $('#bitcoinTxModal').modal();
           }
        }, false);
        document.getElementById('btn_signtx').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('tx_form_result').style.display = 'none';
            if (check_mnemonics()) {
                try {
                    createTransaction(document.getElementById('form_mnemonic').mnemonics.value).then((tx) => {
                        // Broadcast the tx once again using Blockstream's API because bitcoinjs does not provide peer messaging.....
                        fetch('https://blockstream.info/testnet/api/tx', {
                            method: 'POST',
                            body: tx,
                            headers: {
                                'Accept': '*/*'
                            }
                        }).then((r) => r.text())
                        .then((txid) => {
                            const result_div = document.getElementById('tx_form_result');
                            if (result_div.classList.contains('alert-warning')) {
                                result_div.classList.remove('alert-warning');
                                result_div.classList.add('alert-success');
                            }
                            result_div.innerHTML = 'Succesfully sent the transaction to the Bitcoin network. Txid : ' + txid;
                            result_div.style.display = 'block';
                        });
                    })
                    .catch((error) => {
                        const result_div = document.getElementById('tx_form_result');
                        if (result_div.classList.contains('alert-success')) {
                            result_div.classList.remove('alert-warning');
                            result_div.classList.add('alert-warning');
                        }
                        result_div.innerHTML += 'Could not send the transaction ' + error;
                        result_div.style.display = 'block';
                    });
                }
                catch (error) {
                    const result_div = document.getElementById('tx_form_result');
                    if (result_div.classList.contains('alert-success')) {
                        result_div.classList.remove('alert-warning');
                        result_div.classList.add('alert-warning');
                    }
                    result_div.innerHTML = 'Could not send the transaction. ' + error;
                    result_div.style.display = 'block';
                }
            }
        });

        // Verify page
        document.getElementById('form_verify').btn_verify.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('verify_form_result').style.display = 'none';
            if (check_form_verify()) {
                verify().then((same_hash) => {
                    if (same_hash) {
                        const result_div = document.getElementById('verify_form_result');
                        const form = document.getElementById('form_verify');
                        if (result_div.classList.contains('alert-danger')) {
                            result_div.classList.remove('alert-danger');
                            result_div.classList.add('alert-success');
                        }
                        const diplom = form.diplom.value.split(' --- ')[0];
                        result_div.innerHTML = `${form.student_name.value} has been certified to be "${diplom}" on ${form.awarding_year.value}`;
                        result_div.style.display = 'block';
                    }
                    else {
                        const result_div = document.getElementById('verify_form_result');
                        const form = document.getElementById('form_verify');
                        if (result_div.classList.contains('alert-success')) {
                            result_div.classList.remove('alert-succes');
                            result_div.classList.add('alert-danger');
                        }
                        const diplom = form.diplom.value.split(' --- ')[0];
                        result_div.innerHTML = `${form.student_name.value} has not been certified to be "${diplom}". Please double check the inputs.`;
                        result_div.style.display = 'block';
                    }
                })
            }
        });

    }, false);
}

setup();
