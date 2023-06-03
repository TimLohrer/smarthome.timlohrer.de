function getCookie (key = String) {
    const cookies = document.cookie.split('; ');
    let cookie;
    cookies.forEach(_cookie => {
        if (_cookie.split('=')[0] == key) {
            cookie = _cookie.split('=')[1];
        }
    })
    if (cookie) { return cookie }
    else { return false }
}

function parseJwt (token) {
    if (!token) {
        window.open('/signin', '_self');
    }
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}