import commands from './commands.js';

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

// Function to set a cookie that the startup animation has been played
function setStartupCookie() {
    const date = new Date();
    date.setTime(date.getTime() + 1000 * 60 * 60 * 24 * 365); // Set the cookie expiry to 1 year
    const expires = "expires=" + date.toUTCString();
    document.cookie = "hasPlayedStartup=true;" + expires + ";path=/";
}

// Helper function to move cursor to the end of the input field
function moveCursorToEnd(inputElement) {
    inputElement.focus();
    const val = inputElement.value;
    inputElement.value = '';
    inputElement.value = val;
}

// Helper function to append commands and their output to the terminal
function appendCommandToTerminal(terminal, prefix, command, terminalInput, commandHistory) {
    // Append the command to the terminal
    const commandLine = document.createElement('div');
    commandLine.innerHTML = `<span class="command-prefix">${prefix}</span>${command}`;
    terminal.insertBefore(commandLine, terminalInput.parentNode);

    // If the command is not defined in the commands object, display an error message
    if (!(command in commands)) {
        const errorMessage = document.createElement('div');
        errorMessage.textContent = `Command '${command}' not found`;
        terminal.insertBefore(errorMessage, terminalInput.parentNode);
        return terminalInput; // Return the existing terminalInput if the command is not valid
    }

    // Append the command output to the terminal as a separate line
    const commandOutput = document.createElement('div');
    commandOutput.textContent = commands[command](terminal, terminalInput); // Get the actual command output
    terminal.insertBefore(commandOutput, terminalInput.parentNode);

    // Remove the existing input line
    terminal.removeChild(terminalInput.parentNode);

    // Create a new input line
    const newCommandLine = document.createElement('div');
    newCommandLine.className = 'command-line';
    newCommandLine.innerHTML = `<span class="command-prefix">${prefix}</span><input type="text" id="terminal-input" autofocus spellcheck="false">`;
    terminal.appendChild(newCommandLine);

    // Update the terminalInput reference
    terminalInput = document.getElementById('terminal-input');

    // Move the cursor to the end of the new input field
    moveCursorToEnd(terminalInput);

    // Add 'Enter' key event listener to the new input field
    addInputEventListener(terminalInput, terminal, prefix, commandHistory, commandHistory.length);

    // Return the new terminalInput
    return terminalInput;
}

// Function to add 'Enter' key event listener to an input field
function addInputEventListener(terminalInput, terminal, commandPrefix, commandHistory, historyPosition) {
    terminalInput.addEventListener('keydown', async (event) => { // Add async keyword here
        if (event.key === 'Enter') {
            event.preventDefault();
            const input = terminalInput.value.trim().split(' ');
            const command = input[0];
            const args = input.slice(1); // Get the arguments after the command
            const prefix = commandPrefix.textContent; // Get the command prefix

            if (command === 'startup_Page()') {
                // If the command is the startup command, execute the startup sequence directly
                terminalInput.disabled = true; // Disable the input during the startup sequence
                executeStartupSequence(terminal, terminalInput);
            } else if (command in commands) {
                // If the command is defined in the commands object, execute it
                const commandOutput = await commands[command](terminal, terminalInput, args); // Add await keyword here

                // If the command is not 'clear', append the command and its output to the terminal
                if (command !== 'clear') {
                    const commandLine = document.createElement('div');
                    commandLine.innerHTML = `<span class="command-prefix">${prefix}</span>${command}`;
                    terminal.insertBefore(commandLine, terminalInput.parentNode);

                    const commandOutputLine = document.createElement('div');
                    commandOutputLine.innerHTML = commandOutput.replace(/\n/g, '<br>'); // Replace newline characters with <br> tags
                    terminal.insertBefore(commandOutputLine, terminalInput.parentNode);

                    terminalInput.value = ''; // Clear the input field for the next command
                }
            } else if (command) {
                // For other commands, append them to the terminal window
                terminalInput = appendCommandToTerminal(terminal, prefix, command, terminalInput, commandHistory);
                terminalInput.value = ''; // Clear the input field for the next command

                // Add command to history and reset position
                commandHistory.push(command);
                historyPosition = commandHistory.length;
            }
        } else if (event.key === 'ArrowUp') {
            // Replace input with previous command in history
            if (historyPosition > 0) {
                historyPosition--;
                terminalInput.value = commandHistory[historyPosition];
                setTimeout(() => moveCursorToEnd(terminalInput), 0); // Move cursor to the end
            }
        } else if (event.key === 'ArrowDown') {
            // Replace input with next command in history
            if (historyPosition < commandHistory.length - 1) {
                historyPosition++;
                terminalInput.value = commandHistory[historyPosition];
                setTimeout(() => moveCursorToEnd(terminalInput), 0); // Move cursor to the end
            }
        }
    });
}

// Function to simulate terminal command input and output
function initializeTerminalInput(isMobile) {
    const terminal = document.getElementById('terminal');
    const terminalInput = document.getElementById('terminal-input');
    const commandPrefix = document.querySelector('.command-prefix');

    // Initialize command history and position
    const commandHistory = [];
    let historyPosition = 0;

    if (isMobile) {
        // If it's a mobile device, load the main page directly
        setStartupCookie(); // Set the cookie that the startup animation has been played
        window.location.href = 'main.html'; // Redirect to the main page
    } else if (!isMobile) {
        moveCursorToEnd(terminalInput); // Move cursor to the end of the input field
        addInputEventListener(terminalInput, terminal, commandPrefix, commandHistory, historyPosition);
    }
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
            terminalInput.disabled = true; // Keep the input disabled
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
    const isMobile = window.matchMedia("only screen and (max-width: 550px)").matches;
    if (!isMobile) {
        makeDraggable(terminalContainer, windowControls);
    }
    initializeTerminalInput(isMobile);
});
