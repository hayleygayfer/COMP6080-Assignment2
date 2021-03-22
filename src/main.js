import API from './api.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

// This url may need to change depending on what port your backend is running
// on.
//const api = new API('http://localhost:5000');

// Example usage of makeAPIRequest method.
/*api.makeAPIRequest('dummy/user')
    .then(r => console.log(r));*/

let user_token = '';

document.getElementById("submit_login").addEventListener('click', () => {
    const login_body = {
        "username": document.getElementById('username').value,
        "password": document.getElementById('password').value,
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
        } else if (data.status === 200) {
            data.json().then(result => {
                user_token = result.token;
                alert(result.token);
            })
        }
    }).catch((error) => {
        alert('Error: ', error);
    });
});



