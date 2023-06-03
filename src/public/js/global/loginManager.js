const API = 'https://api.login.timlohrer.de/api';
let USER_DATA;

setTimeout(async () => {
    const accessToken = (new URLSearchParams(window.location.search)).get('token');
    window.history.replaceState({}, document.title, document.location.pathname);
    if (!accessToken || !parseJwt(accessToken)) {
        return window.open('https://login.timlohrer.de/signin?redirect_uri=https://smarthome.timlohrer.de/', '_self');
    }
    let userData = await fetch(`${API}/accounts/${parseJwt(accessToken).id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    if (!userData.ok) {
        alert('Failed to get user data. Please sign in  again!');
        return window.open('https://login.timlohrer.de/signin?redirect_uri=https://smarthome.timlohrer.de/&signOut=true', '_self');
    }
    userData = await userData.json();
    if (!userData.roles.includes('34068695-26af-4344-b041-285370c65a89') && !userData.roles.includes('2587fc3d-7581-461b-8452-ed689e9c198e') && !userData.roles.includes('00000000-0000-0000-0000-000000000000')) {
        alert('Missing permisisons to access this site!');
        return window.open('https://login.timlohrer.de/signin?redirect_uri=https://smarthome.timlohrer.de/&signOut=true', '_self');
    }
    userData.accessToken = accessToken;
    USER_DATA = userData;
    build();
});