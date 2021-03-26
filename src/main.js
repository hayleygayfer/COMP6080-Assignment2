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
let user_id = 0;
let user_name = '';
let following = [];

/* IMPLEMENT ERROR POPUP
// error popup
const error_message = document.getElementById('error-popup');
// close error popup
document.getElementById('close_error').addEventListener('click', () => {
    error_message.style.display = 'none';
});
*/

// PAGE FUNCTIONALITY

let scroll_pos = 0;

const login_form = document.getElementById("login_form");
const registration_form = document.getElementById("registration_form");

document.getElementById("open_register").addEventListener('click', () => {
    login_form.style.display = 'none';
    registration_form.style.display = 'block';
});

// View profile
const view_profile = document.getElementById("view_profile");
view_profile.addEventListener('click', () => {

    api.makeAPIRequest(`user/?id=${user_id}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Token ${user_token}`,
        },
    }).then(data => {
        if (data.status === 200) {
            data.json().then(result => {
                document.getElementById("follower_data").innerHTML = '';
                document.getElementById("p_message_feed").innerHTML = '';
                load_profile(result);
                document.getElementById("message_feed").style.display = 'none';
                document.getElementById("profile").style.display = 'flex';
            })
        } else if (data.status === 403) {
            alert('please log in');
        }
    }).catch((error) => {
        alert('Error: ', error);
    });
});

// Go back to feed
const back_button = document.getElementById("back_to_feed");
back_button.addEventListener('click', () => {
    document.getElementById("message_feed").style.display = 'flex';
    document.getElementById("profile").style.display = 'none';
});

// Open post editor
const open_create = document.getElementById("cr_post_btn");
const post_create = document.getElementById("create_post");
open_create.addEventListener('click', () => {
    post_create.style.display = 'block';
});

// Close post editor
const close_editor = document.getElementById("close_edit");
close_editor.addEventListener('click', () => {
    post_create.style.display = 'none';
});

const edit_profile_g = document.getElementById('update_profile');
// close update profile
const close_update = document.getElementById("close_p_update");
close_update.addEventListener('click', () => {
    edit_profile_g.style.display = 'none';
});

// update profile
const change_profile = document.getElementById('submit_profile_update');
change_profile.addEventListener('click', () => {
    const new_email = document.getElementById('update_email').value;
    const new_password = document.getElementById('update_password').value;
    const new_name = document.getElementById('update_name').value;

    console.log(new_email);
    console.log(new_password);
    console.log(new_name);

    const body = {
        "email": new_email,
        "name": new_name,
        "password": new_password,
    };

    api.makeAPIRequest('user', {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Token ${user_token}`,
        },
        body: JSON.stringify(body),
    }).then(data => {
        if (data.status === 200) {
            alert("Updated Profile!");
        }
    }).catch((error) => {
        alert('Error: ', error);
    });
    edit_profile_g.style.display = 'none';
});

// create new post
const submit_post = document.getElementById("submit_post");
submit_post.addEventListener('click', () => {
    const new_desc = document.getElementById("new_desc");
    const img_file = document.getElementById("post_img").files[0];
    fileToDataUrl(img_file).then((src) => {
        const img_src = src.split(",").pop()
        const body = {
            "description_text": new_desc,
            "src": img_src,
        };

        api.makeAPIRequest('post', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Token ${user_token}`,
            },
            body: JSON.stringify(body),
        }).then(data => {
            if (data.status === 200) {
                alert("Successfully Posted!");
            }
        }).catch((error) => {
            alert('Error: ', error);
        });
    });

    post_create.style.display = 'none';
})

// LIVE SCROLLING
window.onscroll = function() {
    if (document.getElementById('message_feed').style.display === 'flex') {
        if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight) {
            display_feed();
        }
}   
};

// SEARCH FOR USER
const u_search_btn = document.getElementById('search_btn');
u_search_btn.addEventListener('click', () => {
    const user_search = document.getElementById('user_search').value;
    api.makeAPIRequest(`user/?username=${user_search}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Token ${user_token}`,
        },
    }).then(data => {
        if (data.status === 200) {
            data.json().then(result => {
                document.getElementById("follower_data").innerHTML = '';
                document.getElementById("p_message_feed").innerHTML = '';
                load_profile(result);
                document.getElementById("message_feed").style.display = 'none';
                document.getElementById("profile").style.display = 'flex';
            })
        } else if (data.status === 404) {
            alert('No user with that name');
        }
    }).catch((error) => {
        alert('Error: ', error);
    });
});

/*---------------DISPLAY FEED----------------*/
function display_feed() {
    api.makeAPIRequest(`user/feed/?p=${scroll_pos}&n=5`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Token ${user_token}`,
        },
    }).then(data => {
        if (data.status === 200) {
            data.json().then(result => {
                result.posts.forEach(post => { load_post(post, "message_feed"); });
                document.getElementById('message_feed').style.display = 'flex'
            })
        } else if (data.status === 403) {
            alert('Not authorised to access feed');
        }
    }).catch((error) => {
        alert('Error: ', error);
    });

    scroll_pos += 5;
}

// LOAD ALL POSTS FROM GET
function load_post(post_data, feed) {
        // extract data from the GET
        const new_post = document.createElement("div");
        // attributes
        new_post.setAttribute("class", "message");
        new_post.setAttribute("id", "message");

        // if post belongs to user add edit button
        if (post_data.meta.author === user_name) {
            const edit_button = document.createElement("button");
            edit_button.setAttribute("id", "edit_button");
            edit_button.innerHTML = "Edit";
            new_post.appendChild(edit_button);

            /*----------------ADD EVENT LISTENER TO EDIT BUTTON---------------*/
            const post_editor = document.getElementById('edit_post');
            edit_button.addEventListener('click', () => {
                post_editor.style.display = 'block';
                // edit existing post
                const update_post = document.getElementById("save_edits");
                update_post.addEventListener('click', () => {
                    const ch_desc = document.getElementById("changed_desc");
                    const body = {
                        "description_text": ch_desc,
                    }

                    api.makeAPIRequest(`post/?id=${post_data.id}`, {
                        method: 'PUT',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': `Token ${user_token}`,
                        },
                        body: JSON.stringify(body),
                    }).then(data => {
                        if (data.status === 200) {
                            alert("Successfully Updated!");
                        }
                    }).catch((error) => {
                        alert('Error: ', error);
                    });
                    post_editor.style.display = 'none';
                });
                
                // add event listener to delete post
                const delete_post = document.getElementById("delete_post");
                delete_post.addEventListener('click', () => {
                    api.makeAPIRequest(`post/?id=${post_data.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': `Token ${user_token}`,
                        },
                    }).then(data => {
                        if (data.status === 200) {
                            alert("Post Deleted");
                        }
                    }).catch((error) => {
                        alert('Error: ', error);
                    });

                    post_editor.style.display = 'none';
                });
            })
            /*----------------------------------------------------------------*/
        }

        const new_poster = document.createElement("button");
        new_poster.innerHTML = post_data.meta.author;
        new_poster.setAttribute("id", `poster_${post_data.id}`);
        new_poster.setAttribute("class", 'poster');
        
        /*---------------------ADD EVENT LISTENER FOR OPENING PROFILE---------------------*/
        new_poster.addEventListener('click', () => {
            api.makeAPIRequest(`user/?username=${post_data.meta.author}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${user_token}`,
                },
            }).then(data => {
                if (data.status === 200) {
                    data.json().then(result => {
                        document.getElementById("follower_data").innerHTML = '';
                        document.getElementById("p_message_feed").innerHTML = '';
                        load_profile(result);
                        document.getElementById(feed).style.display = 'none';
                        document.getElementById("profile").style.display = 'flex';
                    })
                }
            }).catch((error) => {
                alert('Error: ', error);
            });
        });
        /*--------------------------------------------------------------------------------*/

        const new_desc = document.createElement("span");
        new_desc.innerHTML = post_data.meta.description_text;
        // attributes
        new_desc.setAttribute("id", "post_description");

        const new_likes = document.createElement("span");
        new_likes.innerHTML = `Likes: ${post_data.meta.likes.length}`;
        // attributes
        new_likes.setAttribute("id", "num_likes");

        const new_like_button = document.createElement("button");
        new_like_button.setAttribute("id", `like_button_${post_data.id}`);
        new_like_button.setAttribute("class", "like_button");
        new_like_button.innerHTML = "&#128077";

        if (post_data.meta.likes.includes(user_id)) {
            new_like_button.style.backgroundColor = "blue";
        } else {
            new_like_button.style.backgroundColor = "grey";
        }

        /*------------ADD EVENT LISTENER FOR CLICKING LIKE------------*/
        new_like_button.addEventListener('click', () => {
            if (new_like_button.style.backgroundColor === "grey") {
                api.makeAPIRequest(`post/like?id=${post_data.id}`, {
                    method: 'PUT',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${user_token}`,
                    },
                }).then(data => {
                    if (data.status === 200) {
                        new_like_button.style.backgroundColor = "blue";
                        api.makeAPIRequest(`post/?id=${post_data.id}`, {
                            method: 'GET',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'Authorization': `Token ${user_token}`,
                            },
                        }).then(data => {
                            if (data.status === 200) {
                                data.json().then(result => {
                                    new_likes.innerHTML = `Likes: ${result.meta.likes.length}`;
                                })
                            }
                        }).catch((error) => {
                            alert('Error: ', error);
                        });
                        alert("Thanks for the like!");
                    }
                }).catch((error) => {
                    alert('Error: ', error);
                });
            } else if (new_like_button.style.backgroundColor === "blue") {
                api.makeAPIRequest(`post/unlike?id=${post_data.id}`, {
                    method: 'PUT',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${user_token}`,
                    },
                }).then(data => {
                    if (data.status === 200) {
                        new_like_button.style.backgroundColor = "grey";
                        api.makeAPIRequest(`post/?id=${post_data.id}`, {
                            method: 'GET',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'Authorization': `Token ${user_token}`,
                            },
                        }).then(data => {
                            if (data.status === 200) {
                                data.json().then(result => {
                                    new_likes.innerHTML = `Likes: ${result.meta.likes.length}`;
                                })
                            }
                        }).catch((error) => {
                            alert('Error: ', error);
                        });
                        alert("Aw shucks");
                    }
                }).catch((error) => {
                    alert('Error: ', error);
                });
            }
        });
        /*-------------------------------------------------------------*/

        const likers_list = document.createElement("div");
        likers_list.setAttribute("id", "who_liked");
        likers_list.setAttribute("class", "who_liked");
        likers_list.style.display = 'none';

        let k;
        for (k = 0; k < post_data.meta.likes.length; k++) {
            const liker = document.createElement("span");
            liker.setAttribute("id", "liker");
            // GET NAME FROM ID
            api.makeAPIRequest(`user/?id=${post_data.meta.likes[k]}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${user_token}`,
                },
            }).then(data => {
                if (data.status === 200) {
                    data.json().then(result => {
                        liker.innerHTML = result.name;
                    })
                }
            }).catch((error) => {
                alert('Error: ', error);
            });

            likers_list.appendChild(liker);
        }

        const toggle_likers = document.createElement("button");
        toggle_likers.setAttribute("id", "display_likers");
        toggle_likers.innerHTML = "Show who liked"

        /*------------ADD EVENT LISTENER FOR TOGGLING LIKERS LIST-----------*/
        toggle_likers.addEventListener('click', () => {
            if (likers_list.style.display === 'none') {
                likers_list.style.display = 'flex';
                toggle_likers.innerHTML = "Hide who liked";
            } else {
                likers_list.style.display = 'none';
                toggle_likers.innerHTML = "Show who liked";
            }
        });
        /*------------------------------------------------------------------*/

        const new_img = document.createElement("img");
        new_img.src = `data:image/png;base64,${post_data.src}`;
        // attributes
        new_img.setAttribute("id", "post_image");

        const new_time_posted = document.createElement("span");
        new_time_posted.innerHTML = post_data.meta.published;
        // attributes
        new_time_posted.setAttribute("id", "time_posted");

        const new_comment_list = document.createElement("div");
        new_comment_list.setAttribute("class", "comments_list");
        new_comment_list.setAttribute("id", "comments_list");
        new_comment_list.style.display = 'none';

        // extract all comments
        let j;
        for (j = 0; j < post_data.comments.length; j++) {
            const new_comment = document.createElement("div");
            new_comment.setAttribute("class", "comment");
            new_comment.setAttribute("id", "comment");

            const new_c_poster = document.createElement("span");
            new_c_poster.innerHTML = post_data.comments[j].author;
            new_c_poster.setAttribute("id", "comment_poster");

            const new_c_time_posted = document.createElement("span");
            new_c_time_posted.innerHTML = post_data.comments[j].published;
            new_c_time_posted.setAttribute("id", "c_time_posted");

            const new_c_content = document.createElement("span");
            new_c_content.innerHTML = post_data.comments[j].comment;
            new_c_content.setAttribute("id", "c_content");

            // Compile comment elements in comment
            new_comment.appendChild(new_c_poster);
            new_comment.appendChild(new_c_time_posted);
            new_comment.appendChild(new_c_content);

            // append comment to comment list
            new_comment_list.appendChild(new_comment);
        }

        const new_toggle_comments = document.createElement("button");
        new_toggle_comments.innerHTML = "Show Comments";
        new_toggle_comments.setAttribute("id", "display_comments");
        
        /*-------------------ADD EVENT LISTENER FOR TOGGLING COMMENTS-------------*/
        new_toggle_comments.addEventListener('click', () => {
            if (new_comment_list.style.display === 'none') {
                new_comment_list.style.display = 'flex';
                new_toggle_comments.innerHTML = "Hide Comments";
            } else {
                new_comment_list.style.display = 'none';
                new_toggle_comments.innerHTML = "Show Comments";
            }
        });
        /*------------------------------------------------------------------------*/

        const new_num_comments = document.createElement("span");
        new_num_comments.innerHTML = `Comments: ${post_data.comments.length}`;
        // attributes
        new_num_comments.setAttribute("id", "num_comments");

        /*------------------COMMENT ON POST-------------------*/
        // leave a comment on a post
        const leave_comment = document.createElement("button")
        leave_comment.setAttribute("id", "comment_button");
        leave_comment.innerHTML = "Leave a comment";

        // add event listener for comment button
        const post_comment = document.getElementById('comment_edit');
        leave_comment.addEventListener('click', () => {
            post_comment.style.display = 'block';
            const send_comment = document.getElementById("post_comment");
            send_comment.addEventListener('click', () => {
                const c_content = document.getElementById("text_comment").value;
                console.log(c_content);
                const body = {
                    "comment": c_content,
                };

                api.makeAPIRequest(`post/comment?id=${post_data.id}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${user_token}`,
                    },
                    body: JSON.stringify(body),
                }).then(data => {
                    if (data.status === 200) {
                        api.makeAPIRequest(`post/?id=${post_data.id}`, {
                            method: 'GET',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'Authorization': `Token ${user_token}`,
                            },
                        }).then(data => {
                            if (data.status === 200) {
                                data.json().then(result => {
                                    const p_comment = document.createElement("div");
                                    p_comment.setAttribute("class", "comment");
                                    p_comment.setAttribute("id", "comment");

                                    const p_c_poster = document.createElement("span");
                                    p_c_poster.innerHTML = result.comments[result.comments.length - 1].author;
                                    p_c_poster.setAttribute("id", "comment_poster");

                                    const p_c_time_posted = document.createElement("span");
                                    p_c_time_posted.innerHTML = result.comments[result.comments.length - 1].published;
                                    p_c_time_posted.setAttribute("id", "c_time_posted");

                                    const p_c_content = document.createElement("span");
                                    p_c_content.innerHTML = result.comments[result.comments.length - 1].comment;
                                    p_c_content.setAttribute("id", "c_content");

                                    // Compile comment elements in comment
                                    p_comment.appendChild(p_c_poster);
                                    p_comment.appendChild(p_c_time_posted);
                                    p_comment.appendChild(p_c_content);

                                    // append comment to comment list
                                    new_comment_list.appendChild(p_comment);
                                })
                            }
                        }).catch((error) => {
                            alert('Error: ', error);
                        });
                        alert("Comment posted!");
                    }
                }).catch((error) => {
                    alert('Error: ', error);
                });

                post_comment.style.display = 'none';
            });
        });
        /*---------------------------------------------------*/

        // Add all elements to main post
        new_post.appendChild(new_poster);
        new_post.appendChild(new_img);
        new_post.appendChild(new_time_posted);
        new_post.appendChild(new_likes);
        new_post.appendChild(new_like_button);
        new_post.appendChild(toggle_likers);
        new_post.appendChild(likers_list);
        new_post.appendChild(new_desc);
        new_post.appendChild(new_num_comments);
        new_post.appendChild(new_toggle_comments);
        new_post.appendChild(new_comment_list);
        new_post.appendChild(leave_comment);

        // Add post to message_feed
        document.getElementById(feed).appendChild(new_post);
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
                api.makeAPIRequest('user', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${user_token}`,
                    },
                }).then(data => {
                    if (data.status === 200) {
                        data.json().then(result => {
                            user_id = result.id;
                            following = result.following;
                            user_name = result.name;
                        })
                    }
                }).catch((error) => {
                    alert('Error: ', error);
                });
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
                api.makeAPIRequest('user', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${user_token}`,
                    },
                }).then(data => {
                    if (data.status === 200) {
                        data.json().then(result => {
                            user_id = result.id;
                            following = result.following;
                            user_name = result.name;
                        })
                    }
                }).catch((error) => {
                    alert('Error: ', error);
                });
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
    document.getElementById("followed_count").innerHTML = `Followers: ${pro_data.followed_num}`;
    const follower_data = document.getElementById("follower_data");

    // Follow / Unfollow
    if (pro_data.id !== user_id) {
        console.log("not equal");
        const follow_button = document.createElement('button');
        follow_button.setAttribute('id', 'follow_unfollow');
        follow_button.innerHTML = 'Unfollow';

        follower_data.appendChild(follow_button);

        let is_following = true;
        follow_button.addEventListener('click', () => {
            if (is_following === true) {
                // UNFOLLOW
                api.makeAPIRequest(`user/unfollow/?username=${pro_data.username}`, {
                    method: 'PUT',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${user_token}`,
                    },
                }).then(data => {
                    if (data.status === 200) {
                        alert("Successfully unfollowed " + pro_data.username);
                        follow_button.innerHTML = "Follow";
                        is_following = false;
                    }
                }).catch((error) => {
                    alert('Error: ', error);
                });
            } else {
                // FOLLOW
                api.makeAPIRequest(`user/follow/?username=${pro_data.username}`, {
                    method: 'PUT',
                    headers: {
                        'Accept': 'aplication/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${user_token}`,
                    },
                }).then(data => {
                    if (data.status === 200) {
                        alert("Successfully followed " + pro_data.username);
                        follow_button.innerHTML = "Unfollow";
                        is_following = true;
                    }
                }).catch((error) => {
                    alert('Error: ', error);
                });
            }
        });
    }

    if (user_id === pro_data.id) {
        // add profile edit button
        const edit_profile_btn = document.createElement("button");
        edit_profile_btn.innerHTML = "Update Profile";
        edit_profile_btn.setAttribute("id", "u_profile_btn");

        const profile_editor = document.getElementById("update_profile");
        edit_profile_btn.addEventListener('click', () => {
            profile_editor.style.display = 'block';
        });

        const edit_div = document.getElementById("edit_profile");
        edit_div.appendChild(edit_profile_btn);

        // Toggle follower_list
        const toggle_followers = document.createElement("button");
        toggle_followers.setAttribute("id", "toggle_following");
        toggle_followers.innerHTML = "Show Following"
        follower_data.appendChild(toggle_followers);

        const following_list = document.createElement("div");
        following_list.setAttribute('id', 'following_list');
        let i;
        for (i = 0; i < following.length; i++) {
            const new_followed = document.createElement("button");
            api.makeAPIRequest(`user/?id=${following[i]}`, {
                method: 'GET',
                headers: {
                    'Accept': 'aplication/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${user_token}`,
                },
            }).then(data => {
                if (data.status === 200) {
                    data.json().then(result => {
                        new_followed.innerHTML = result.name;
                    })
                }
            }).catch((error) => {
                alert('Error: ', error);
            });
            following_list.appendChild(new_followed);
        }
        follower_data.appendChild(following_list);

        // add event listener for following list
        toggle_followers.addEventListener('click', () => {
            if (following_list.style.display === 'none') {
                following_list.style.display = 'flex';
                toggle_followers.innerHTML = "Hide Following";
            } else {
                following_list.style.display = 'none';
                toggle_followers.innerHTML = "Show Following";
            }
        });
    }

    let i;
    for (i = 0; i < pro_data.posts.length; i++) {
        api.makeAPIRequest(`post/?id=${pro_data.posts[i]}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Token ${user_token}`,
            },
        }).then(data => {
            if (data.status === 200) {
                data.json().then(result => {
                    load_post(result, "p_message_feed");
                })
            }
        }).catch((error) => {
            alert('Error: ', error);
        });
    }
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
            'Authorization': `Token ${user_token}`,
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

// Get an array of user ids who liked a post based on id of post
function get_post_likes(post_id) {
    const post_likes = [];
    api.makeAPIRequest(`post?id=${post_id}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Token ${user_token}`,
        },
        body: JSON.stringify(body),
    }).then(data => {
        if (data.status === 200) {
            data.json().then(result => {
                post_likes = result.meta.likes;
            })
        }
    }).catch((error) => {
        alert('Error: ', error);
    });

    return post_likes;
}

// check if the current user is following the target user
function is_following(target_user) {
    api.makeAPIRequest(`user/?username=${target_user}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Token ${user_token}`,
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