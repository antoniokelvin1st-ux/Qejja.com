import { auth, database } from "./firebase.js";
import { ref, push, set, get, update, remove, onValue } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

const EDIT_LIMIT = 20 * 60 * 1000;

function canEditOrDelete(item, currentUserId) {
    if (!item.createdAt) return false;
    const age = Date.now() - new Date(item.createdAt).getTime();
    return item.userId === currentUserId && age <= EDIT_LIMIT;
}

function isPostOwner(postOwnerId, currentUserId) {
    return postOwnerId === currentUserId;
}

window.openComments = function(postId, postOwnerId) {
    const box = document.getElementById("comments-" + postId);
    box.style.display = box.style.display === "block" ? "none" : "block";
    loadNestedComments(postId, postOwnerId);
};

window.addRootComment = async function(postId) {
    const user = auth.currentUser;
    if (!user) return alert("Please login first");

    const input = document.getElementById("commentInput-" + postId);
    const text = input.value.trim();

    if (!text) return alert("Write a comment first");

    const userSnap = await get(ref(database, "users/" + user.uid));
    const userData = userSnap.exists() ? userSnap.val() : {};

    const commentRef = push(ref(database, `comments/${postId}`));

    await set(commentRef, {
        id: commentRef.key,
        postId,
        parentId: null,
        userId: user.uid,
        userName: userData.fullName || "Qejja User",
        text,
        likesCount: 0,
        dislikesCount: 0,
        createdAt: new Date().toISOString()
    });

    input.value = "";
};

function loadNestedComments(postId, postOwnerId) {
    const list = document.getElementById("commentList-" + postId);

    onValue(ref(database, `comments/${postId}`), (snapshot) => {
        list.innerHTML = "";

        if (!snapshot.exists()) {
            list.innerHTML = "<p>No comments yet.</p>";
            return;
        }

        const comments = [];

        snapshot.forEach(child => {
            comments.push(child.val());
        });

        const rootComments = comments
            .filter(c => !c.parentId)
            .sort((a, b) => {
                const likesA = a.likesCount || 0;
                const likesB = b.likesCount || 0;
                if (likesB !== likesA) return likesB - likesA;
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            });

        rootComments.forEach(comment => {
            list.appendChild(renderComment(postId, postOwnerId, comment, comments, 0));
        });
    });
}

function renderComment(postId, postOwnerId, comment, allComments, level) {
    const user = auth.currentUser;
    const currentUserId = user ? user.uid : null;

    const wrapper = document.createElement("div");
    wrapper.className = "comment-item";
    wrapper.style.marginLeft = `${Math.min(level * 22, 90)}px`;

    const userCanEdit = canEditOrDelete(comment, currentUserId);
    const userCanDelete = userCanEdit || isPostOwner(postOwnerId, currentUserId);

    wrapper.innerHTML = `
        <strong>${comment.userName || "Qejja User"}</strong>
        <p id="text-${comment.id}">${comment.text}</p>

        <small>
            ❤️ ${comment.likesCount || 0}
            &nbsp; 👎 ${comment.dislikesCount || 0}
        </small><br>

        <button class="small-btn orange-btn" onclick="reactToComment('${postId}', '${comment.id}', 'like')">Like</button>
        <button class="small-btn dark-btn" onclick="reactToComment('${postId}', '${comment.id}', 'dislike')">Dislike</button>
        <button class="small-btn dark-btn" onclick="showReplyInput('${comment.id}')">Reply</button>

        ${userCanEdit ? `<button class="small-btn dark-btn" onclick="editNestedComment('${postId}', '${comment.id}')">Edit</button>` : ""}
        ${userCanDelete ? `<button class="small-btn danger-btn" onclick="deleteNestedComment('${postId}', '${comment.id}')">Delete</button>` : ""}

        <div id="replyBox-${comment.id}" style="display:none;margin-top:8px;">
            <input id="replyInput-${comment.id}" class="comment-input" placeholder="Write a reply...">
            <button class="small-btn orange-btn" onclick="addNestedReply('${postId}', '${comment.id}')">Post Reply</button>
        </div>

        <div id="children-${comment.id}"></div>
    `;

    const children = allComments
        .filter(c => c.parentId === comment.id)
        .sort((a, b) => {
            const likesA = a.likesCount || 0;
            const likesB = b.likesCount || 0;
            if (likesB !== likesA) return likesB - likesA;
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });

    const childBox = wrapper.querySelector(`#children-${comment.id}`);

    children.forEach(child => {
        childBox.appendChild(renderComment(postId, postOwnerId, child, allComments, level + 1));
    });

    return wrapper;
}

window.showReplyInput = function(commentId) {
    const box = document.getElementById("replyBox-" + commentId);
    box.style.display = box.style.display === "block" ? "none" : "block";
};

window.addNestedReply = async function(postId, parentId) {
    const user = auth.currentUser;
    if (!user) return alert("Please login first");

    const input = document.getElementById("replyInput-" + parentId);
    const text = input.value.trim();

    if (!text) return alert("Write a reply first");

    const userSnap = await get(ref(database, "users/" + user.uid));
    const userData = userSnap.exists() ? userSnap.val() : {};

    const replyRef = push(ref(database, `comments/${postId}`));

    await set(replyRef, {
        id: replyRef.key,
        postId,
        parentId,
        userId: user.uid,
        userName: userData.fullName || "Qejja User",
        text,
        likesCount: 0,
        dislikesCount: 0,
        createdAt: new Date().toISOString()
    });

    input.value = "";
};

window.editNestedComment = async function(postId, commentId) {
    const user = auth.currentUser;
    if (!user) return;

    const commentRef = ref(database, `comments/${postId}/${commentId}`);
    const snap = await get(commentRef);

    if (!snap.exists()) return;

    const comment = snap.val();

    if (!canEditOrDelete(comment, user.uid)) {
        alert("You can only edit your own comment/reply within 20 minutes.");
        return;
    }

    const newText = prompt("Edit your comment/reply:", comment.text);

    if (!newText || !newText.trim()) return;

    await update(commentRef, {
        text: newText.trim(),
        editedAt: new Date().toISOString()
    });
};

window.deleteNestedComment = async function(postId, commentId) {
    const user = auth.currentUser;
    if (!user) return;

    const postSnap = await get(ref(database, `posts/${postId}`));
    const post = postSnap.exists() ? postSnap.val() : {};

    const commentRef = ref(database, `comments/${postId}/${commentId}`);
    const snap = await get(commentRef);

    if (!snap.exists()) return;

    const comment = snap.val();

    const userCanDelete = canEditOrDelete(comment, user.uid);
    const ownerCanDelete = post.ownerId === user.uid;

    if (!userCanDelete && !ownerCanDelete) {
        alert("You cannot delete this comment/reply.");
        return;
    }

    if (!confirm("Delete this comment/reply and its replies?")) return;

    await deleteWithChildren(postId, commentId);
};

async function deleteWithChildren(postId, commentId) {
    const snap = await get(ref(database, `comments/${postId}`));

    if (snap.exists()) {
        const all = [];
        snap.forEach(child => all.push(child.val()));

        const children = all.filter(c => c.parentId === commentId);

        for (const child of children) {
            await deleteWithChildren(postId, child.id);
        }
    }

    await remove(ref(database, `comments/${postId}/${commentId}`));
    await remove(ref(database, `commentReactions/${postId}/${commentId}`));
}

window.reactToComment = async function(postId, commentId, type) {
    const user = auth.currentUser;
    if (!user) return alert("Please login first");

    const reactionRef = ref(database, `commentReactions/${postId}/${commentId}/${user.uid}`);
    const commentRef = ref(database, `comments/${postId}/${commentId}`);

    const reactionSnap = await get(reactionRef);
    const commentSnap = await get(commentRef);

    if (!commentSnap.exists()) return;

    const comment = commentSnap.val();

    let likes = comment.likesCount || 0;
    let dislikes = comment.dislikesCount || 0;

    if (reactionSnap.exists()) {
        const oldType = reactionSnap.val();

        if (oldType === type) {
            await remove(reactionRef);

            if (type === "like") likes = Math.max(0, likes - 1);
            if (type === "dislike") dislikes = Math.max(0, dislikes - 1);

            await update(commentRef, { likesCount: likes, dislikesCount: dislikes });
            return;
        }

        if (oldType === "like") likes = Math.max(0, likes - 1);
        if (oldType === "dislike") dislikes = Math.max(0, dislikes - 1);
    }

    if (type === "like") likes++;
    if (type === "dislike") dislikes++;

    await set(reactionRef, type);
    await update(commentRef, {
        likesCount: likes,
        dislikesCount: dislikes
    });
};
