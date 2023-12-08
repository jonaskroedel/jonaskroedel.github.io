document.addEventListener('DOMContentLoaded', () => {
    const cookieConsentBanner = document.getElementById('cookie-consent-banner');
    const cookieConsentYes = document.getElementById('cookie-consent-yes');
    const cookieConsentNo = document.getElementById('cookie-consent-no');
    const welcomeContainer = document.getElementById('welcome-container');


    // Check if the cookie consent state is saved
    const cookieConsent = getCookie('cookieConsent');
    if (cookieConsent !== 'yes') {
        setTimeout(() => {
        cookieConsentBanner.classList.add('fade-in');
        cookieConsentBanner.style.display = 'block'; // Show cookie banner if not consented
        }, 1500);

        // Wait a bit before starting the fade-in animation
        setTimeout(() => {
            welcomeContainer.classList.remove('hidden');
            welcomeContainer.classList.add('fade-in');
        }, 100); // This delay helps ensure the animation runs after navigation
    } else {
        welcomeContainer.classList.remove('hidden');
        welcomeContainer.style.display = 'block'; // Show welcome container if consented
    }

    cookieConsentYes.addEventListener('click', () => {
        setCookie('cookieConsent', 'yes', 365); // Save consent for 365 days
        cookieConsentBanner.style.display = 'none'; // Hide banner
    });

    cookieConsentNo.addEventListener('click', () => {
        // Delete all cookies
        document.cookie.split(";").forEach((c) => {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        cookieConsentBanner.style.display = 'none'; // Hide banner
    });
});

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseAllCookies() {
    // Iterate over all cookies and delete them
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
}

// Utility to fade in elements
function applyFadeIn(element) {
    element.classList.add('fade-in');
    element.style.display = 'block';
}

// Call applyFadeIn if the cookie consent is not given and the page is first loaded
if (getCookie('cookieConsent') !== 'yes') {
    const welcomeTitle = document.getElementById('welcome-title');
    applyFadeIn(welcomeTitle);
}