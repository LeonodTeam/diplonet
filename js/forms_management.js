// Checks entries from user in the form to certify a diplom and feedbacks the user on error
// :return: True if informations seems correct, False otherwise
function check_form_certify() {
    const form = document.getElementById('form_certify');
    const error = document.getElementById('form_certify_error');
    error.style.display = 'none';
    if (form.diplom.value == '') {
        error.innerHTML = 'Please select a diplom.';
        error.style.display = 'block';
        return false;
    } else if (!(2010 <= parseInt(form.awarding_year.value, 10) && parseInt(form.awarding_year.value, 10) <= 2019)) {
        error.innerHTML = 'Please fill in a valid awarding date. (2010 -> 2019)';
        error.style.display = 'block';
        return false;
    } else if (!form.student_name.value.match(/^[A-Za-z ]+$/)) {
        error.innerHTML = 'Please fill in a valid name. What I call a "valid name" is a name given with only letters and spaces.<br>\
            Ex: "Jean-Pierre Dupont" should be entered as "Jean Pierre Dupont"';
        error.style.display = 'block';
        return false;
    }
    const birthdate = form.birthdate.value.split('/');
    if (birthdate.length != 3) {
        error.innerHTML = 'Please fill in a valid birthdate. Ex: 01/01/1995';
        error.style.display = 'block';
        return false;
    } else if (!(1 <= parseInt(birthdate[0], 10) && parseInt(birthdate[0], 10) <= 31)) {
        error.innerHTML = 'Please fill in a valid birthdate. Ex: 01/01/1995';
        error.style.display = 'block';
        return false;
    } else if (!(1 <= parseInt(birthdate[1], 10) && parseInt(birthdate[1], 10) <= 12)) {
        error.innerHTML = 'Please fill in a valid birthdate. Ex: 01/01/1995';
        error.style.display = 'block';
        return false;
    } else if (!(1919 <= parseInt(birthdate[2], 10) && parseInt(birthdate[2], 10) <= 2019)) {
        error.innerHTML = 'Please fill in a valid birthdate. Ex: 01/01/1995 with the 1919 <= year <= 2019';
        error.style.display = 'block';
        return false;
    }
    return true;
}

// Checks entries from user in the verify form and feedbacks the user on error
// :return: True if informations seems correct, False otherwise
function check_form_verify () {
    const form = document.getElementById('form_verify');
    const error = document.getElementById('form_verify_error');
    error.style.display = 'none';
    if (form.diplom.value == '') {
        error.innerHTML = 'Please select a diplom.';
        error.style.display = 'block';
        return false;
    } else if (!(2010 <= parseInt(form.awarding_year.value, 10) && parseInt(form.awarding_year.value, 10) <= 2019)) {
        error.innerHTML = 'Please fill in a valid awarding date. (2010 -> 2019)';
        error.style.display = 'block';
        return false;
    } else if (!form.student_name.value.match(/^[A-Za-z ]+$/)) {
        error.innerHTML = 'Please fill in a valid name. What I call a "valid name" is a name given with only letters and spaces.<br>\
            Ex: "Jean-Pierre Dupont" should be entered as "Jean Pierre Dupont"';
        error.style.display = 'block';
        return false;
    }
    const birthdate = form.student_birthdate.value.split('/');
    if (birthdate.length != 3) {
        error.innerHTML = 'Please fill in a valid birthdate. Ex: 01/01/1995';
        error.style.display = 'block';
        return false;
    } else if (!(1 <= parseInt(birthdate[0], 10) && parseInt(birthdate[0], 10) <= 31)) {
        error.innerHTML = 'Please fill in a valid birthdate. Ex: 01/01/1995';
        error.style.display = 'block';
        return false;
    } else if (!(1 <= parseInt(birthdate[1], 10) && parseInt(birthdate[1], 10) <= 12)) {
        error.innerHTML = 'Please fill in a valid birthdate. Ex: 01/01/1995';
        error.style.display = 'block';
        return false;
    } else if (!(1919 <= parseInt(birthdate[2], 10) && parseInt(birthdate[2], 10) <= 2019)) {
        error.innerHTML = 'Please fill in a valid birthdate. Ex: 01/01/1995 with the 1919 <= year <= 2019';
        error.style.display = 'block';
        return false;
    }
    const txid = form.txid.value;
    if (txid.length != 64) {
        error.innerHTML = 'Please fill in a valid transaction identifier (txid). This is a 64 characters hexadecimal value.';
        error.style.display = 'block';
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

// Gives the appropriate feedback to the user at mnemonic submission
// VOID
function form_mnemonics_result(result, result_is_error=false) {
    const result_div = document.getElementById('tx_form_result');
    if (result_is_error) {
        if (result_div.classList.contains('alert-success')) {
            result_div.classList.remove('alert-warning');
            result_div.classList.add('alert-warning');
        }
        result_div.innerHTML = 'Could not send the transaction ' + result;
    } else {
        // If there is no error, then the result MUST be a txid
        if (result_div.classList.contains('alert-warning')) {
            result_div.classList.remove('alert-warning');
            result_div.classList.add('alert-success');
        }
        result_div.innerHTML = 'Succesfully sent the transaction to the Bitcoin network. Txid : ' + result;
    }
    result_div.style.display = 'block';       
}

function form_verify_result(same_hash) {
    const result_div = document.getElementById('verify_form_result');
    const form = document.getElementById('form_verify');
    const diplom = form.diplom.value.split(' --- ')[0];
    if (same_hash) {
        if (result_div.classList.contains('alert-danger')) {
            result_div.classList.remove('alert-danger');
            result_div.classList.add('alert-success');
        }
        result_div.innerHTML = `${form.student_name.value} has been certified to be "${diplom}" on ${form.awarding_year.value}`;
    } else {
        if (result_div.classList.contains('alert-success')) {
            result_div.classList.remove('alert-succes');
            result_div.classList.add('alert-danger');
        }
        result_div.innerHTML = `${form.student_name.value} has not been certified to be "${diplom}". Please double check the inputs.`;   
    }
    result_div.style.display = 'block';
}
