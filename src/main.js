import API from './api.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

// This url may need to change depending on what port your backend is running
// on.
const api = new API('http://localhost:5000');

// Example usage of makeAPIRequest method.
api.makeAPIRequest('dummy/user')
    .then(r => console.log(r));

// TOKEN
let user_token = '';

/* IMPLEMENT ERROR POPUP
// error popup
const error_message = document.getElementById('error-popup');
// close error popup
document.getElementById('close_error').addEventListener('click', () => {
    error_message.style.display = 'none';
});
*/

// DISPLAY FEED
function display_feed() {
    const feed_params = {
        "p": '0',
        "n": '10',
    };

    result = fetch('http://localhost:5000/user/feed', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + user_token,
        },
        body: JSON.stringify(feed_params),
    }).then(data => {
        if (data.status === 200) {
            data.json().then(result => {
                alert(result);
                document.getElementById('message_feed').style.display = 'flex'
            })
        } else if (data.status === 403) {
            alert('Not authorised to access feed')
        }
    }).catch((error) => {
        alert('Error: ', error);
    });
}

// PAGE FUNCTIONALITY

const login_form = document.getElementById("login_form");
const registration_form = document.getElementById("registration_form");

document.getElementById("open_register").addEventListener('click', () => {
    login_form.style.display = 'none';
    registration_form.style.display = 'block';
});

// LOGIN FORM
document.getElementById("submit_login").addEventListener('click', () => {
    // Get form fields
    const password = document.getElementById('password').value;
    const password_confirm = document.getElementById('pass_confirm').value;
    const username = document.getElementById('username').value;

    // Verify that passwords match
    if (password !== password_confirm) {
        alert('Passwords do not match!');
        return 1;
    }

    const login_body = {
        "username": username,
        "password": password,
    };

    const result = fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(login_body),
    }).then((data) => {
        if (data.status === 403) {
            alert('Incorrect login details!');
        } else if (data.status === 400) {
            alert('Please enter login details');
        } else if (data.status === 200) {
            data.json().then(result => {
                user_token = result.token;
                alert(result.token);
                document.getElementById('login_form').style.display = 'none'
                display_feed();
            })
        }
    }).catch((error) => {
        alert('Error: ', error);
    });
});

// REGISTRATION FORM
document.getElementById("submit_register").addEventListener('click', () => {
    // Get form fields
    const r_password = document.getElementById('r_pass').value;
    const r_password_confirm = document.getElementById('r_passconfirm').value;
    const r_username = document.getElementById('r_user').value;
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;

    // Verify that passwords match
    if (r_password !== r_password_confirm) {
        alert('Passwords do not match!');
        return 1;
    }

    const register_body = {
        "username": r_username,
        "password": r_password,
        "email": email,
        "name": name,
    };
    const result = fetch('http://localhost:5000/auth/signup', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(register_body),
    }).then((data) => {
        if (data.status === 409) {
            alert('Username taken');
        } else if (data.status === 200) {
            data.json().then(result => {
                alert('Registered Successfully!');
                user_token = result.token;
                document.getElementById('registration_form').style.display = 'none'
                display_feed();
            })
        }
    }).catch((error) => {
        alert('Error: ', error);
    });
});








