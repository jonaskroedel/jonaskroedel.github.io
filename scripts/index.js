// Helper function to make an element draggable
function makeDraggable(element, handle) {
    var posX = 0, posY = 0, posX2 = 0, posY2 = 0;

    handle.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e.preventDefault();
        // Get the current mouse cursor position at startup:
        posX2 = e.clientX;
        posY2 = e.clientY;
        document.onmouseup = closeDragElement;
        // Call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e.preventDefault();
        // Calculate the new cursor position:
        posX = posX2 - e.clientX;
        posY = posY2 - e.clientY;
        posX2 = e.clientX;
        posY2 = e.clientY;
        // Set the element's new position:
        element.style.top = (element.offsetTop - posY) + "px";
        element.style.left = (element.offsetLeft - posX) + "px";
    }

    function closeDragElement() {
        // Stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function checkStartupCookie() {
    // Check if the 'hasPlayedStartup' cookie is set to 'true'
    const hasVisited = document.cookie.split(';').some((item) => item.trim().startsWith('hasPlayedStartup=true'));

    if (hasVisited) {
        window.location.href = 'main.html'; // Redirect immediately if the cookie is set    }
    }
}

// Function to simulate terminal command input and output
function initializeTerminalInput() {
    const terminal = document.getElementById('terminal');
    const terminalInput = document.getElementById('terminal-input');
    const commandPrefix = document.querySelector('.command-prefix');

    terminalInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const command = terminalInput.value.trim();
            if (command === 'startup_Page();') {
                // Append the command only if it's not the startup command
                // Execute the startup sequence directly
                terminalInput.disabled = true; // Disable the input during the startup sequence
                executeStartupSequence(terminal, terminalInput);
            } else if (command) {
                // For other commands, append them to the terminal window
                appendCommandToTerminal(terminal, commandPrefix.textContent, command);
                terminalInput.value = ''; // Clear the input field for the next command
            }
        }
    });
}

// Function to set a cookie that the startup animation has been played
function setStartupCookie() {
    const date = new Date();
    date.setTime(date.getTime() + 1000 * 60 * 60 * 24 * 365); // Set the cookie expiry to 1 year
    const expires = "expires=" + date.toUTCString();
    document.cookie = "hasPlayedStartup=true;" + expires + ";path=/";
}

// Helper function to append commands to the terminal
function appendCommandToTerminal(terminal, prefix, command) {
    const commandLine = document.createElement('div');
    commandLine.innerHTML = `<span class="command-prefix">${prefix}</span>${command}`;
    terminal.appendChild(commandLine);
    terminal.scrollTop = terminal.scrollHeight;
}

// Function to execute the startup sequence
function executeStartupSequence(terminal, terminalInput) {
    const loadingMessages = [
        "Checking system status...",
        "Compiling the source of inspiration...",
        "Initializing the quantum superposition...",
        "Aligning the stars...",
        "Updating the flux capacitor...",
        "Finalizing quantum entanglement procedures...",
        "Reversing the polarity of the neutron flow...",
        "Reconfiguring the space-time continuum...",
        "Analyzing the space-time continuum...",
        "Downloading the universe..."
    ];

    let currentMessage = 0;
    const typeMessage = () => {
        if (currentMessage < loadingMessages.length) {
            const messageElement = document.createElement('div');
            messageElement.textContent = loadingMessages[currentMessage++];
            terminal.appendChild(messageElement);
            terminal.scrollTop = terminal.scrollHeight;
            setTimeout(typeMessage, 1000);
        } else {
            // After last message, start filling the progress bar
            fillProgressBar(terminal, terminalInput);
        }
    };
    typeMessage();
}

// Function to fill the progress bar over time
function fillProgressBar(terminal, terminalInput) {
    const progressBarElement = document.createElement('div');
    progressBarElement.className = 'progress-bar';
    terminal.appendChild(progressBarElement);

    let progress = 0;
    const totalProgress = 20;
    const interval = setInterval(() => {
        progressBarElement.textContent = `[${'#'.repeat(progress)}${'.'.repeat(totalProgress - progress)}]`;
        progress++;
        terminal.scrollTop = terminal.scrollHeight;

        if (progress > totalProgress) {
            clearInterval(interval);
            terminalInput.disabled = false; // Re-enable the input
            setTimeout(() => {
                const doneElement = document.createElement('div');
                doneElement.textContent = 'Done! - Redirecting...';
                terminal.appendChild(doneElement);
                terminal.scrollTop = terminal.scrollHeight;

                // Wait for 5 seconds, then hide the terminal window
                setTimeout(() => {
                    const terminalContainer = document.getElementById('terminal-container');
                    terminalContainer.style.display = 'none'; // Hide the terminal window
                    setStartupCookie(); // Set the cookie that the startup animation has been played
                    window.location.href = 'main.html'; // Redirect to the main page
                }, 3000);
            }, 500);
        }
    }, 500);
}

// Initialization code
document.addEventListener('DOMContentLoaded', () => {
    checkStartupCookie();
    const terminalContainer = document.getElementById('terminal-container');
    const windowControls = document.querySelector('.window-controls');
    const isMobile = window.matchMedia("only screen and (max-width: 760px)").matches;
    if (!isMobile) {
        makeDraggable(terminalContainer, windowControls);
    }
    initializeTerminalInput();
});
