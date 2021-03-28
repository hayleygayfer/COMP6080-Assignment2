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

// IMPLEMENT ERROR POPUP
const close_error = document.getElementById("closebtn");
const alert_popup = document.getElementById("alert");
const error_content = document.getElementById("error_msg");
close_error.addEventListener('click', () => {
    while (error_content.lastChild) {
        error_content.removeChild(error_content.lastChild);
    }
    alert_popup.style.display = 'none';
});

// POLL THE SERVER FOR PUSH NOTIFICATIONS


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
            alert_popup.style.backgroundColor = "#f44336";
            error_content.appendChild(document.createTextNode("Please log in"));
            alert_popup.style.display = 'block';
        } else if (data.status === 404) {
            alert_popup.style.backgroundColor = "#f44336";
            error_content.appendChild(document.createTextNode("User does not exist"));
            alert_popup.style.display = 'block';
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

// Close comment editor
const close_comment = document.getElementById('close_comment');
close_comment.addEventListener('click', () => {
    document.getElementById('comment_edit').style.display = 'none';
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
            alert_popup.style.backgroundColor = "#53ed7c";
            error_content.appendChild(document.createTextNode("Updated Profile!"));
            alert_popup.style.display = 'block';
        } else if (data.status === 403) {
            alert_popup.style.backgroundColor = "#f44336";
            error_content.appendChild(document.createTextNode("Please log in"));
            alert_popup.style.display = 'block';
        }
    }).catch((error) => {
        alert('Error: ', error);
    });
    edit_profile_g.style.display = 'none';
});

// create new post
const submit_post = document.getElementById("submit_post");
submit_post.addEventListener('click', () => {
    const new_desc = document.getElementById("new_desc").value;
    const img_file = document.getElementById("post_img").files[0];
    fileToDataUrl(img_file).then((src) => {
        const img_src = src.split(",").pop();
        const body = {
            "description_text": new_desc,
            "src": `${img_src}`,
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
                data.json().then(result => {
                    api.makeAPIRequest(`post/?id=${result.post_id}`, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': `Token ${user_token}`,
                        },
                    }).then(data => {
                        if (data.status === 200) {
                            data.json().then(res => {
                                load_post(res, "p_message_feed");
                            })
                        }
                    }).catch((error) => {
                        alert('Error: ', error);
                    });
                })
                alert_popup.style.backgroundColor = "#53ed7c";
                error_content.appendChild(document.createTextNode("Successfully posted!"));
                alert_popup.style.display = 'block';
            } else if (data.status === 400) {
                alert_popup.style.backgroundColor = "#f44336";
                error_content.appendChild(document.createTextNode("Image could not be processed"));
                alert_popup.style.display = 'block';
            } else if (data.status === 403) {
                alert_popup.style.backgroundColor = "#f44336";
                error_content.appendChild(document.createTextNode("Please log in"));
                alert_popup.style.display = 'block';
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
        } else if (data.status === 400) {
            alert_popup.style.backgroundColor = "#f44336";
            error_content.appendChild(document.createTextNode("Please enter a name"));
            alert_popup.style.display = 'block';
        } else if (data.status === 404) {
            alert_popup.style.backgroundColor = "#f44336";
            error_content.appendChild(document.createTextNode("No user with that name"));
            alert_popup.style.display = 'block';
        } else if (data.status === 403) {
            alert_popup.style.backgroundColor = "#f44336";
            error_content.appendChild(document.createTextNode("Please log in"));
            alert_popup.style.display = 'block';
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
            alert_popup.style.backgroundColor = "#f44336";
            error_content.appendChild(document.createTextNode("Please log in"));
            alert_popup.style.display = 'block';
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
        new_post.setAttribute("id", `message_${post_data.id}`);

        const new_desc = document.createElement("span");
        new_desc.appendChild(document.createTextNode(post_data.meta.description_text));
        // attributes
        new_desc.setAttribute("id", "post_description");

        // if post belongs to user add edit button
        if (post_data.meta.author === user_name) {
            const edit_button = document.createElement("button");
            edit_button.setAttribute("id", "edit_button");
            edit_button.appendChild(document.createTextNode("Edit"));
            new_post.appendChild(edit_button);

            /*----------------ADD EVENT LISTENER TO EDIT BUTTON---------------*/
            const post_editor = document.getElementById('edit_post');
            edit_button.addEventListener('click', () => {
                post_editor.style.display = 'block';
                // edit existing post
                const update_post = document.getElementById("save_edits");
                update_post.addEventListener('click', () => {
                    const ch_desc = document.getElementById("changed_desc").value;
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
                            new_desc.removeChild(new_desc.firstChild);
                            new_desc.appendChild(document.createTextNode(ch_desc));
                            alert_popup.style.backgroundColor = "#53ed7c";
                            error_content.appendChild(document.createTextNode("Updated post"));
                            alert_popup.style.display = 'block';
                        } else if (data.status === 403) {
                            alert_popup.style.backgroundColor = "#f44336";
                            error_content.appendChild(document.createTextNode("Please log in"));
                            alert_popup.style.display = 'block';
                        } else if (data.status === 404) {
                            alert_popup.style.backgroundColor = "#f44336";
                            error_content.appendChild(document.createTextNode("Post not found"));
                            alert_popup.style.display = 'block';
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
                            const deleted_post = document.getElementById(`message_${post_data.id}`);
                            deleted_post.remove();
                            alert_popup.style.backgroundColor = "#53ed7c";
                            error_content.appendChild(document.createTextNode("Post deleted"));
                            alert_popup.style.display = 'block';
                        } else if (data.status === 403) {
                            alert_popup.style.backgroundColor = "#f44336";
                            error_content.appendChild(document.createTextNode("Please log in"));
                            alert_popup.style.display = 'block';
                        } else if (data.status === 404) {
                            alert_popup.style.backgroundColor = "#f44336";
                            error_content.appendChild(document.createTextNode("Post not found"));
                            alert_popup.style.display = 'block';
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
        new_poster.appendChild(document.createTextNode(post_data.meta.author));
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
                        document.getElementById("follower_data").innerHTML;
                        document.getElementById("p_message_feed").innerHTML;
                        load_profile(result);
                        document.getElementById(feed).style.display = 'none';
                        document.getElementById("profile").style.display = 'flex';
                    })
                } else if (data.status === 403) {
                    alert_popup.style.backgroundColor = "#f44336";
                    error_content.appendChild(document.createTextNode("Please log in"));
                    alert_popup.style.display = 'block';
                } else if (data.status === 404) {
                    alert_popup.style.backgroundColor = "#f44336";
                    error_content.appendChild(document.createTextNode("User not found"));
                    alert_popup.style.display = 'block';
                }
            }).catch((error) => {
                alert('Error: ', error);
            });
        });
        /*--------------------------------------------------------------------------------*/

        const new_likes = document.createElement("span");
        new_likes.appendChild(document.createTextNode(`Likes: ${post_data.meta.likes.length}`));
        // attributes
        new_likes.setAttribute("id", "num_likes");

        const new_like_button = document.createElement("button");
        new_like_button.setAttribute("id", `like_button_${post_data.id}`);
        new_like_button.setAttribute("class", "like_button");
        new_like_button.appendChild(document.createTextNode("Like Post"));

        console.log(user_id);
        console.log(post_data.meta.likes);
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
                                    new_likes.removeChild(new_likes.firstChild);
                                    new_likes.appendChild(document.createTextNode(`Likes: ${result.meta.likes.length}`));
                                    const liker = document.createElement("span");
                                    liker.appendChild(document.createTextNode(user_name));
                                    liker.setAttribute("id", `liker_${user_name}`);
                                    likers_list.appendChild(liker);
                                })
                            } else if (data.status === 403) {
                                alert_popup.style.backgroundColor = "#f44336";
                                error_content.appendChild(document.createTextNode("Please log in"));
                                alert_popup.style.display = 'block';
                            } else if (data.status === 404) {
                                alert_popup.style.backgroundColor = "#f44336";
                                error_content.appendChild(document.createTextNode("Post not found"));
                                alert_popup.style.display = 'block';
                            }
                        }).catch((error) => {
                            alert('Error: ', error);
                        });
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
                                    new_likes.removeChild(new_likes.firstChild);
                                    new_likes.appendChild(document.createTextNode(`Likes: ${result.meta.likes.length}`));
                                    const unliker = document.getElementById(`liker_${user_name}`);
                                    unliker.remove();
                                })
                            }  else if (data.status === 403) {
                                alert_popup.style.backgroundColor = "#f44336";
                                error_content.appendChild(document.createTextNode("Please log in"));
                                alert_popup.style.display = 'block';
                            } else if (data.status === 404) {
                                alert_popup.style.backgroundColor = "#f44336";
                                error_content.appendChild(document.createTextNode("Post not found"));
                                alert_popup.style.display = 'block';
                            }
                        }).catch((error) => {
                            alert('Error: ', error);
                        });
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
                        liker.setAttribute("id", `liker_${result.name}`);
                        liker.appendChild(document.createTextNode(result.name));
                    })
                }
            }).catch((error) => {
                alert('Error: ', error);
            });

            likers_list.appendChild(liker);
        }

        const toggle_likers = document.createElement("button");
        toggle_likers.setAttribute("id", "display_likers");
        toggle_likers.appendChild(document.createTextNode("Show who liked"));

        /*------------ADD EVENT LISTENER FOR TOGGLING LIKERS LIST-----------*/
        toggle_likers.addEventListener('click', () => {
            if (likers_list.style.display === 'none') {
                likers_list.style.display = 'flex';
                toggle_likers.removeChild(toggle_likers.firstChild);
                toggle_likers.appendChild(document.createTextNode("Hide who liked"));
            } else {
                likers_list.style.display = 'none';
                toggle_likers.removeChild(toggle_likers.firstChild);
                toggle_likers.appendChild(document.createTextNode("Show who liked"));
            }
        });
        /*------------------------------------------------------------------*/

        const new_img = document.createElement("img");
        new_img.src = `data:image/png;base64,${post_data.src}`;
        // attributes
        new_img.setAttribute("id", "post_image");

        const new_time_posted = document.createElement("span");
        const milliseconds = post_data.meta.published * 1000;
        const new_date = new Date(milliseconds)
        const date_format = new_date.toLocaleString()
        new_time_posted.appendChild(document.createTextNode(date_format));
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
            new_c_poster.appendChild(document.createTextNode(post_data.comments[j].author));
            new_c_poster.setAttribute("id", "comment_poster");

            const new_c_time_posted = document.createElement("span");
            const milliseconds = post_data.comments[j].published * 1000;
            const new_date = new Date(milliseconds);
            const date_format = new_date.toLocaleString();
            new_c_time_posted.appendChild(document.createTextNode(date_format));
            new_c_time_posted.setAttribute("id", "c_time_posted");

            const new_c_content = document.createElement("span");
            new_c_content.appendChild(document.createTextNode(post_data.comments[j].comment));
            new_c_content.setAttribute("id", "c_content");

            // Compile comment elements in comment
            new_comment.appendChild(new_c_poster);
            new_comment.appendChild(new_c_time_posted);
            new_comment.appendChild(new_c_content);

            // append comment to comment list
            new_comment_list.appendChild(new_comment);
        }

        const new_toggle_comments = document.createElement("button");
        new_toggle_comments.appendChild(document.createTextNode("Show Comments"));
        new_toggle_comments.setAttribute("id", "display_comments");
        
        /*-------------------ADD EVENT LISTENER FOR TOGGLING COMMENTS-------------*/
        new_toggle_comments.addEventListener('click', () => {
            if (new_comment_list.style.display === 'none') {
                new_comment_list.style.display = 'flex';
                new_toggle_comments.removeChild(new_toggle_comments.firstChild);
                new_toggle_comments.appendChild(document.createTextNode("Hide Comments"));
            } else {
                new_comment_list.style.display = 'none';
                new_toggle_comments.removeChild(new_toggle_comments.firstChild);
                new_toggle_comments.appendChild(document.createTextNode("Show Comments"));
            }
        });
        /*------------------------------------------------------------------------*/

        const new_num_comments = document.createElement("span");
        new_num_comments.appendChild(document.createTextNode(`Comments: ${post_data.comments.length}`));
        // attributes
        new_num_comments.setAttribute("id", "num_comments");

        /*------------------COMMENT ON POST-------------------*/
        // leave a comment on a post
        const leave_comment = document.createElement("button")
        leave_comment.setAttribute("id", "comment_button");
        leave_comment.appendChild(document.createTextNode("Leave a comment"));

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
                    method: 'PUT',
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
                                alert_popup.style.backgroundColor = "#53ed7c";
                                error_content.appendChild(document.createTextNode("Comment posted"));
                                alert_popup.style.display = 'block';
                                data.json().then(result => {
                                    new_num_comments.removeChild(new_num_comments.firstChild);
                                    new_num_comments.appendChild(document.createTextNode(`Comments: ${result.comments.length}`));
                                    const p_comment = document.createElement("div");
                                    p_comment.setAttribute("class", "comment");
                                    p_comment.setAttribute("id", "comment");

                                    const p_c_poster = document.createElement("span");
                                    p_c_poster.appendChild(document.createTextNode(result.comments[result.comments.length - 1].author));
                                    p_c_poster.setAttribute("id", "comment_poster");

                                    const p_c_time_posted = document.createElement("span");
                                    const milliseconds = result.comments[result.comments.length - 1].published * 1000;
                                    const new_date = new Date(milliseconds);
                                    const date_format = new_date.toLocaleString();
                                    p_c_time_posted.appendChild(document.createTextNode(date_format));
                                    p_c_time_posted.setAttribute("id", "c_time_posted");

                                    const p_c_content = document.createElement("span");
                                    p_c_content.appendChild(document.createTextNode(result.comments[result.comments.length - 1].comment));
                                    p_c_content.setAttribute("id", "c_content");

                                    // Compile comment elements in comment
                                    p_comment.appendChild(p_c_poster);
                                    p_comment.appendChild(p_c_time_posted);
                                    p_comment.appendChild(p_c_content);

                                    // append comment to comment list
                                    new_comment_list.appendChild(p_comment);
                                })
                            }  else if (data.status === 403) {
                                alert_popup.style.backgroundColor = "#f44336";
                                error_content.appendChild(document.createTextNode("Please log in"));
                                alert_popup.style.display = 'block';
                            } else if (data.status === 404) {
                                alert_popup.style.backgroundColor = "#f44336";
                                error_content.appendChild(document.createTextNode("Post not found"));
                                alert_popup.style.display = 'block';
                            }
                        }).catch((error) => {
                            alert('Error: ', error);
                        });
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
        alert_popup.style.backgroundColor = "#f44336";
        error_content.appendChild(document.createTextNode("Passwords do not match"));
        alert_popup.style.display = 'block';
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
            alert_popup.style.backgroundColor = "#f44336";
            error_content.appendChild(document.createTextNode("Incorrect login details"));
            alert_popup.style.display = 'block';
        } else if (data.status === 400) {
            alert_popup.style.backgroundColor = "#f44336";
            error_content.appendChild(document.createTextNode("Missing Username / Password"));
            alert_popup.style.display = 'block';
        } else if (data.status === 200) {
            data.json().then(result => {
                user_token = result.token;
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
                            alert_popup.style.backgroundColor = "#53ed7c";
                            error_content.appendChild(document.createTextNode(`Logged in as ${result.name}`));
                            alert_popup.style.display = 'block';
                            display_feed();
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
        alert_popup.style.backgroundColor = "#f44336";
        error_content.appendChild(document.createTextNode("Password do not match"));
        alert_popup.style.display = 'block';
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
            alert_popup.style.backgroundColor = "#f44336";
            error_content.appendChild(document.createTextNode("Username taken"));
            alert_popup.style.display = 'block';
        } else if (data.status === 400) {
            alert_popup.style.backgroundColor = "#f44336";
            error_content.appendChild(document.createTextNode("Missing Username / Password"));
            alert_popup.style.display = 'block';
        } else if (data.status === 200) {
            data.json().then(result => {
                alert_popup.style.backgroundColor = "#53ed7c";
                error_content.appendChild(document.createTextNode("Registered Successfully!"));
                alert_popup.style.display = 'block';
                user_token = result.token;
                document.getElementById('registration_form').style.display = 'none'
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
                            display_feed();
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
    const p_username = document.getElementById("p_username");
    const p_email = document.getElementById("p_email");
    const p_name = document.getElementById("p_name");
    const followed_count = document.getElementById("followed_count");
    const follower_data = document.getElementById("follower_data");
    const msg_feed = document.getElementById('p_message_feed');

    if (p_username.hasChildNodes())
        p_username.removeChild(p_username.firstChild);
    if (p_email.hasChildNodes())
        p_email.removeChild(p_email.firstChild);
    if (p_name.hasChildNodes())
        p_name.removeChild(p_name.firstChild);
    if (followed_count.hasChildNodes())
        followed_count.removeChild(followed_count.firstChild);
    
    p_username.appendChild(document.createTextNode(pro_data.username));
    p_email.appendChild(document.createTextNode(pro_data.email));
    p_name.appendChild(document.createTextNode(pro_data.name));
    followed_count.appendChild(document.createTextNode(`Followers: ${pro_data.followed_num}`));
    
    if (follower_data.hasChildNodes()) {
        while (follower_data.lastEChild) {
            follower_data.removeChild(follower_data.lastChild);
        }
    }
    if (msg_feed.hasChildNodes()) {
        while (msg_feed.lastChild) {
            msg_feed.removeChild(msg_feed.lastChild);
        }
    }

    // Follow / Unfollow
    if (pro_data.id !== user_id) {
        const follow_button = document.createElement('button');
        follow_button.setAttribute('id', 'follow_unfollow');
        follow_button.appendChild(document.createTextNode('Unfollow'));

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
                        alert_popup.style.backgroundColor = "#53ed7c";
                        error_content.appendChild(document.createTextNode(`Unfollowed ${pro_data.username}`));
                        alert_popup.style.display = 'block';
                        follow_button.appendChild(document.createTextNode("Follow"));
                        is_following = false;
                    } else if (data.status === 403) {
                        alert_popup.style.backgroundColor = "#f44336";
                        error_content.appendChild(document.createTextNode("Please log in"));
                        alert_popup.style.display = 'block';
                    } else if (data.status === 404) {
                        alert_popup.style.backgroundColor = "#f44336";
                        error_content.appendChild(document.createTextNode("User not found"));
                        alert_popup.style.display = 'block';
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
                        alert_popup.style.backgroundColor = "#53ed7c";
                        error_content.appendChild(document.createTextNode(`Followed ${pro_data.username}`));
                        alert_popup.style.display = 'block';
                        follow_button.appendChild(document.createTextNode("Unfollow"));
                        is_following = true;
                    } else if (data.status === 403) {
                        alert_popup.style.backgroundColor = "#f44336";
                        error_content.appendChild(document.createTextNode("Please log in"));
                        alert_popup.style.display = 'block';
                    } else if (data.status === 404) {
                        alert_popup.style.backgroundColor = "#f44336";
                        error_content.appendChild(document.createTextNode("User not found"));
                        alert_popup.style.display = 'block';
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
        edit_profile_btn.appendChild(document.createTextNode("Update Profile"));
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
        toggle_followers.appendChild(document.createTextNode("Show Following"));
        follower_data.appendChild(toggle_followers);

        const following_list = document.createElement("ul");
        following_list.setAttribute('id', 'following_list');
        following_list.style.display = 'none';
        let i;
        for (i = 0; i < following.length; i++) {
            const new_followed = document.createElement("li");
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
                        new_followed.appendChild(document.createTextNode(result.name));
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
                following_list.style.display = 'block';
                toggle_followers.removeChild(toggle_followers.firstChild);
                toggle_followers.appendChild(document.createTextNode("Hide Following"));
            } else {
                following_list.style.display = 'none';
                toggle_followers.removeChild(toggle_followers.firstChild);
                toggle_followers.appendChild(document.createTextNode("Show Following"));
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