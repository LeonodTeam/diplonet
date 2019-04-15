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
