import commands from './commands.js';

// Helper function to make an element draggable
function makeDraggable(element, handle) {
    let posX = 0, posY = 0, posX2 = 0, posY2 = 0;

    handle.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e.preventDefault();
        posX2 = e.clientX;
        posY2 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e.preventDefault();
        posX = posX2 - e.clientX;
        posY = posY2 - e.clientY;
        posX2 = e.clientX;
        posY2 = e.clientY;
        element.style.top = `${element.offsetTop - posY}px`;
        element.style.left = `${element.offsetLeft - posX}px`;
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function checkStartupCookie() {
    return document.cookie.split(';').some((item) => item.trim().startsWith('hasPlayedStartup=true'));
}

function setStartupCookie() {
    const date = new Date();
    date.setTime(date.getTime() + 365 * 24 * 60 * 60 * 1000);
    document.cookie = `hasPlayedStartup=true; expires=${date.toUTCString()}; path=/`;
}

function moveCursorToEnd(inputElement) {
    inputElement.focus();
    const val = inputElement.value;
    inputElement.value = '';
    inputElement.value = val;
}

async function appendCommandToTerminal(terminal, prefix, command, args, terminalInput, commandHistory) {
    const commandLine = document.createElement('div');
    commandLine.innerHTML = `<span class="command-prefix">${prefix}</span>${command} ${args.join(' ')}`;
    terminal.insertBefore(commandLine, terminalInput.parentNode);

    if (command in commands) {
        const commandOutput = await commands[command](terminal, terminalInput, args);
        if (commandOutput && command !== 'clear') {
            const outputElement = document.createElement('div');
            outputElement.innerHTML = commandOutput.replace(/\n/g, '<br>');
            terminal.insertBefore(outputElement, terminalInput.parentNode);
        }
    } else if (command) {
        const errorMessage = document.createElement('div');
        errorMessage.textContent = `Command '${command}' not found`;
        terminal.insertBefore(errorMessage, terminalInput.parentNode);
    }

    if (command !== 'clear') {
        commandHistory.push(`${command} ${args.join(' ')}`);
    }

    terminal.removeChild(terminalInput.parentNode);
    const newCommandLine = createNewCommandLine(prefix);
    terminal.appendChild(newCommandLine);
    return document.getElementById('terminal-input');
}

function createNewCommandLine(prefix) {
    const newCommandLine = document.createElement('div');
    newCommandLine.className = 'command-line';
    newCommandLine.innerHTML = `<span class="command-prefix">${prefix}</span><input type="text" id="terminal-input" autofocus spellcheck="false">`;
    return newCommandLine;
}

function addInputEventListener(terminalInput, terminal, commandPrefix, commandHistory) {
    let historyPosition = commandHistory.length;

    terminalInput.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const input = terminalInput.value.trim().split(' ');
            const command = input[0];
            const args = input.slice(1);
            const prefix = commandPrefix.textContent;

            if (command === 'startup_Page()') {
                terminalInput.disabled = true;
                executeStartupSequence(terminal, terminalInput);
            } else {
                terminalInput = await appendCommandToTerminal(terminal, prefix, command, args, terminalInput, commandHistory);
                terminalInput.value = '';
                historyPosition = commandHistory.length;
            }
        } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
            historyPosition += event.key === 'ArrowUp' ? -1 : 1;
            historyPosition = Math.max(0, Math.min(commandHistory.length, historyPosition));
            terminalInput.value = commandHistory[historyPosition] || '';
            setTimeout(() => moveCursorToEnd(terminalInput), 0);
        }
    });
}

function executeStartupSequence(terminal, terminalInput) {
    const loadingMessages = [
        "Initializing system...",
        "Compiling data structures...",
        "Calibrating quantum flux...",
        "Synchronizing timeline...",
        "Engaging hyperdrive...",
        "Parsing multiverse protocols...",
        "Decrypting neural networks...",
        "Optimizing space-time algorithms...",
        "Interfacing with reality matrix...",
        "Launching simulation..."
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
            fillProgressBar(terminal, terminalInput);
        }
    };
    typeMessage();
}

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
            terminalInput.disabled = true;
            setTimeout(() => {
                const doneElement = document.createElement('div');
                doneElement.textContent = 'Initialization complete. Redirecting...';
                terminal.appendChild(doneElement);
                terminal.scrollTop = terminal.scrollHeight;

                setTimeout(() => {
                    document.getElementById('terminal-container').style.display = 'none';
                    setStartupCookie();
                    window.location.href = 'main.html';
                }, 3000);
            }, 500);
        }
    }, 250);
}

function initializeTerminal() {
    const terminal = document.getElementById('terminal');
    const terminalInput = document.getElementById('terminal-input');
    const commandPrefix = document.querySelector('.command-prefix');
    const commandHistory = [];

    moveCursorToEnd(terminalInput);
    addInputEventListener(terminalInput, terminal, commandPrefix, commandHistory);

    // Set last login time
    const lastLogin = document.getElementById('last-login');
    const now = new Date();
    lastLogin.textContent = `Last login: ${now.toLocaleString()} on ttys000`;
}

document.addEventListener('DOMContentLoaded', () => {
    if (checkStartupCookie()) {
        window.location.href = 'main.html';
    } else {
        const terminalContainer = document.getElementById('terminal-container');
        const windowControls = document.querySelector('.window-controls');
        const isMobile = window.matchMedia("only screen and (max-width: 550px)").matches;
        
        if (!isMobile) {
            makeDraggable(terminalContainer, windowControls);
        }
        
        initializeTerminal();
    }
});