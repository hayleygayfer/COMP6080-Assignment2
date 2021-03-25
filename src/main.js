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

// PAGE FUNCTIONALITY

const login_form = document.getElementById("login_form");
const registration_form = document.getElementById("registration_form");

document.getElementById("open_register").addEventListener('click', () => {
    login_form.style.display = 'none';
    registration_form.style.display = 'block';
});

// Toggle comments
const toggle_comments = document.getElementById("display_comments")
toggle_comments.addEventListener('click', () => {
    const comments_list = document.getElementById("comments_list");
    if (comments_list.style.display === 'none') {
        comments_list.style.display = 'flex';
        toggle_comments.textContent = "Hide Comments";
    } else {
        comments_list.style.display = 'none';
        toggle_comments.textContent = "Show Comments";
    }
});

// Toggle likers
const toggle_likers = document.getElementById("display_likers");
toggle_likers.addEventListener('click', () => {
    const liker_list = document.getElementById("who_liked");
    if (liker_list.style.display === 'none') {
        liker_list.style.display = 'flex';
        toggle_likers.textContent = "Hide who liked";
    } else {
        liker_list.style.display = 'none';
        toggle_likers.textContent = "Show who liked";
    }
});

// Toggle follower_list
const toggle_followers = document.getElementById("toggle_following");
toggle_followers.addEventListener('click', () => {
    const follower_list = document.getElementById("following");
    if (follower_list.style.display === 'none') {
        follower_list.style.display = 'flex';
        toggle_followers.textContent = "Hide Followers";
    } else {
        follower_list.style.display = 'none';
        toggle_followers.textContent = "Show Followers";
    }
});

// Open post editor
const open_editor = document.getElementById("cr_post_btn");
const post_editor = document.getElementById("edit_post");
open_editor.addEventListener('click', () => {
    post_editor.style.display = 'block';
});
// Close post editor
const close_editor = document.getElementById("close_edit");
close_editor.addEventListener('click', () => {
    post_editor.style.display = 'none';
});
// Submit changes
const submit_post = document.getElementById("save_edits");
submit_post.addEventListener('click', () => {
    const new_desc = document.getElementById("new_desc");
    const img_src = document.getElementById("img_src");
    post_message(img_src, new_desc);
    post_editor.style.display = 'none';
})

/*---------------DISPLAY FEED----------------*/
function display_feed() {
    api.makeAPIRequest('user/feed', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + user_token,
        },
    }).then(data => {
        if (data.status === 200) {
            data.json().then(result => {
                load_posts(result.posts, "message_feed");
                console.log(result.posts);
                document.getElementById('message_feed').style.display = 'flex'
            })
        } else if (data.status === 403) {
            alert('Not authorised to access feed')
        }
    }).catch((error) => {
        alert('Error: ', error);
    });
}

// LOAD ALL POSTS FROM GET
function load_posts(post_data, feed) {
    for (let i = 0; i < post_data.length; i++) {
        // extract data from the GET
        const new_post = document.createElement("div");
        // attributes
        new_post.setAttribute("class", "message");
        new_post.setAttribute("id", "message");

        const new_poster = document.createElement("button");
        new_poster.value = post_data[i].meta.author;
        // attributes
        new_poster.setAttribute("id", "poster");
        /*---------------------ADD EVENT LISTENER FOR OPENING PROFILE---------------------*/
        new_poster.addEventListener('click', display_profile(post_data[i].meta.author));
        /*--------------------------------------------------------------------------------*/

        const new_desc = document.createElement("span");
        new_desc.innerHTML = post_data[i].meta.description;
        // attributes
        new_desc.setAttribute("id", "post_description");

        const new_likes = document.createElement("span");
        new_likes.innerHTML = `Likes: ${post_data[i].meta.likes[0]}`;
        // attributes
        new_likes.setAttribute("id", "num_likes");

        const new_like_button = document.createElement("button");
        new_like_button.setAttribute("id", `like_button_${post_data[i].id}`)
        new_like_button.value = "&#128077";
        /*------------ADD EVENT LISTENER FOR CLICKING LIKE------------*/
        new_like_button.addEventListener('click', like_unlike_post(post_data[i].id));
        /*-------------------------------------------------------------*/

        const new_img = document.createElement("img");
        new_img.src = post_data[i].src;
        // attributes
        new_img.setAttribute("id", "post_image");

        const new_time_posted = document.createElement("span");
        new_time_posted.innerHTML = post_data[i].meta.published;
        // attributes
        new_time_posted.setAttribute("id", "time_posted");

        const new_num_comments = document.createElement("span");
        new_num_comments.innerHTML = `Comments: ${post_data[i].meta.comments.length}`;
        // attributes
        new_num_comments.setAttribute("id", "num_comments");

        const new_comment_list = document.createElement("div");
        new_comment_list.setAttribute("class", "comments_list");
        new_comment_list.setAttribute("id", "comments_list");

        // extract all comments
        for (const j = 0; j < post_data[i].meta.comments.length; j++) {
            const new_comment = document.createElement("div");
            new_comment.setAttribute("class", "comment");
            new_comment.setAttribute("id", "comment");

            const new_c_poster = document.createElement("span");
            new_c_poster.innerHTML = post_data[i].meta.comments[j].author;
            new_c_poster.setAttribute("id", "comment_poster");

            const new_c_time_posted = document.createElement("span");
            new_c_time_posted.innerHTML = post_data[i].meta.comments[j].published;
            new_c_time_posted.setAttribute("id", "c_time_posted");

            const new_c_content = document.createElement("span");
            new_c_content.innerHTML = post_data[i].meta.comments[j].comment;
            new_c_content.setAttribute("id", "c_content");

            // Compile comment elements in comment
            new_comment.appendChild(new_c_poster);
            new_comment.appendChild(new_c_time_posted);
            new_comment.appendChild(new_c_content);

            // append comment to comment list
            new_comment_list.appendChild(new_comment);
        }

        // Add all elements to main post
        new_post.appendChild(new_poster);
        new_post.appendChild(new_img);
        new_post.appendChild(new_time_posted);
        new_post.appendChild(new_likes);
        new_post.appendChild(new_like_button);
        new_post.appendChild(new_desc);
        new_post.appendChild(new_num_comments);
        new_post.appendChild(new_comment_list);

        // Add post to message_feed
        document.getElementById(feed).appendChild(new_post);
    }
}

/*-----------------------LIKE POST-------------------------*/
function like_unlike_post(id) {
    const like_button = document.getElementById(`like_button_${id}`);
    if (like_button.style.backgroundColor === "grey") {
        api.makeAPIRequest(`post/like?id=${id}`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': user_token,
            },
        }).then(data => {
            if (data.status === 200) {
                like_button.style.backgroundColor = "blue";
                alert("Thanks for the like!");
            }
        }).catch((error) => {
            alert('Error: ', error);
        });
    } else {
        api.makeAPIRequest(`post/unlike?id=${id}`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': user_token,
            },
        }).then(data => {
            if (data.status === 200) {
                like_button.style.backgroundColor = "grey";
                alert("Aw shucks");
            }
        }).catch((error) => {
            alert('Error: ', error);
        });
    }
}

/*-----------------------LOGIN FORM-------------------------*/
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

    api.makeAPIRequest('auth/login', {
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
        alert('Error: Not so great huh?', error);
    });
});

/*--------------------REGISTRATION FORM----------------------*/
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
    api.makeAPIRequest('auth/signup', {
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

/*----------------------LOAD PROFILE-----------------------*/
function load_profile(pro_data) {
    document.getElementById("p_username").innerHTML = pro_data.username;
    document.getElementById("p_email").innerHTML = pro_data.email;
    document.getElementById("p_name").innerHTML = pro_data.name;
    document.getElementById("followed_count").innerHTML = pro_data.followed_num;

    // Follow / Unfollow
    const follow_button = document.getElementById("follow_unfollow");
    follow_button.addEventListener('click', () => {
        if (follow_unfollow(pro_data.username) === 'follow') {
            follow_button.innerHTML = "Unfollow";
        } else {
            follow_button.innerHTML = "Follow";
        }
    })
    
    const following_list = document.getElementById("following");
    for (let i = 0; i < pro_data.following.length; i++) {
        const new_followed = document.createElement("button");
        new_followed.value = pro_data.following[i];
        following_list.appendChild(new_followed);
    }

    let post_list = [];
    for (let i = 0; i < pro_data.posts.length; i++) {
        api.makeAPIRequest(`post?id=${pro_data.posts[i]}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': user_token,
            },
        }).then(data => {
            if (data.status === 200) {
                data.json().then(result => {
                    post_list.push(result);
                })
            }
        }).catch((error) => {
            alert('Error: ', error);
        });
    }

    load_posts(post_list, "p_message_feed");
}

/*---------------------DISPLAY PROFILE---------------------*/
function display_profile(user_name) {
    api.makeAPIRequest(`user/?username=${user_name}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': user_token,
        },
    }).then(data => {
        if (data.status === 200) {
            data.json().then(result => {
                load_profile(result);
                document.getElementById("message_feed").style.display = 'none';
                document.getElementById("profile").style.display = 'flex';
            })
        }
    }).catch((error) => {
        alert('Error: ', error);
    });
}

/*----------------------FOLLOW / UNFOLLOW-------------------------*/
function follow_unfollow(user_name) {
    if (is_following(user_name)) {
        // UNFOLLOW
        api.makeAPIRequest(`user/unfollow?username=${user_name}`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': user_token,
            },
        }).then(data => {
            if (data.status === 200) {
                alert("Successfully unfollowed " + user_name);
                return 'unfollow';
            }
        }).catch((error) => {
            alert('Error: ', error);
        });
    } else {
        // FOLLOW
        api.makeAPIRequest(`user/follow?username=${user_name}`, {
            method: 'PUT',
            headers: {
                'Accept': 'aplication/json',
                'Content-Type': 'application/json',
                'Authorization': user_token,
            },
        }).then(data => {
            if (data.status === 200) {
                alert("Successfully followed " + user_name);
                return 'follow';
            }
        }).catch((error) => {
            alert('Error: ', error);
        });
    }
}

/*-----------------------------CREATE NEW POST--------------------------------*/
function post_message(img_src, post_desc) { 
    const body = {
        "description_text": post_desc,
        "src": img_src,
    }

    api.makeAPIRequest('post', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': user_token,
        },
        body: JSON.stringify(body),
    }).then(data => {
        if (data.status === 200) {
            alert("Successfully Posted!");
        }
    }).catch((error) => {
        alert('Error: ', error);
    });
}

/*----------------------------UPDATE POST-----------------------------------*/
function update_post(post_id, post_desc, img_src) {
    const body = {
        "description_text": post_desc,
        "src": img_src,
    }

    api.makeAPIRequest(`post?id=${post_id}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': user_token,
        },
        body: JSON.stringify(body),
    }).then(data => {
        if (data.status === 200) {
            alert("Successfully Posted!");
        } else if (data.status === 403) {
            alert("Not authorized to edit post")
        }
    }).catch((error) => {
        alert('Error: ', error);
    });
}

/*------------------------GET CURRENT USER ID---------------------------------*/
function get_user_id() {
    api.makeAPIRequest(`user`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': user_token,
        },
    }).then(data => {
        if (data.status === 200) {
            data.json().then(result => {
                return result.id;
            })
        }
    }).catch((error) => {
        alert('Error: ', error);
        return -1;
    });
}

/*------------------------CHECK IF USER IS FOLLOWING TARGET-------------------------*/
function is_following(target_user) {
    let user_id = get_user_id();

    api.makeAPIRequest(`user?username=${target_user}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': user_token,
        },
    }).then(data => {
        if (data.status === 200) {
            data.json().then(result => {
                if (result.following.includes(user_id))
                    return true
                else
                    return false
            })
        }
    }).catch((error) => {
        alert('Error: ', error);
    });
}











