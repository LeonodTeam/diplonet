// Setup the behaviour of the website, adding the evenments, filling the dinamically allocated informations, etc..
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
                verify_diplom().then((same_hash) => {
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
