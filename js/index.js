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
// :param mnemonics: The words to derive a private key from, as a string
// :return: A transaction object
function createTransaction(mnemonics) {
    mnemonic_entropy = buffer.Buffer.from(bip39.mnemonicToEntropy(mnemonics));
    keypair = Bitcoin.ECPair.fromPrivateKey(mnemonic_entropy);
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
                let diplom = obj.sigle_type_formation != "" ? obj.sigle_type_formation + '  ' : '';
                diplom += obj.libelle_formation_principal + ' ' + obj.libelle_formation_complementaire;
                diplom += obj.libelle_niveau_rncp != "non inscrit au RNCP" ? ' -- ' + obj.libelle_niveau_rncp : '  (non inscrit au RNCP)';
                diplom = diplom.charAt(0).toUpperCase() + diplom.slice(1);
                diploms.push(diplom);
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
                tx = createTransaction(document.getElementById('form_mnemonic').mnemonics.value);
            //}
        });
    }, false);
}

setup();
