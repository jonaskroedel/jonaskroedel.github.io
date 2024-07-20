document.addEventListener('DOMContentLoaded', () => {
    const terminal = document.getElementById('terminal');
    const titlebar = terminal.querySelector('.titlebar');
    const output = document.getElementById('output');
    const userInput = document.getElementById('user-input');
    const titleElement = document.querySelector('.title');

    let isDragging = false;
    let startX, startY, startLeft, startTop;

    function updateTitle() {
        const width = Math.floor(terminal.clientWidth / 7);  // Approximate character width
        const height = Math.floor(terminal.clientHeight / 14);  // Approximate line height
        titleElement.textContent = `user — -zsh — ${width}×${height}`;
    }

    // Initial title update
    updateTitle();

    // Update title on resize
    new ResizeObserver(updateTitle).observe(terminal);

    // Make the window draggable
    titlebar.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = terminal.offsetLeft;
        startTop = terminal.offsetTop;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            terminal.style.left = `${startLeft + dx}px`;
            terminal.style.top = `${startTop + dy}px`;
        } else if (isDragging) {
            const dx = e.clientX - startX;
            const dy = e.clientY -startY;
            terminal.style.width = `${startWidth + dx}px`;
            terminal.style.height = `${startHeight + dy}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Handle user input
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = userInput.value;
            output.innerHTML += `<div><span class="prompt">user@kroedel.at ~ %</span> ${command}</div>`;
            processCommand(command);
            userInput.value = '';
        }
    });

    function processCommand(command) {
        switch (command.toLowerCase()) {
            case 'help':
                output.innerHTML += '<div>Available commands: help, clear, date, echo, exit</div>';
                break;
            case 'clear':
                output.innerHTML = '';
                break;
            case 'date':
                output.innerHTML += `<div>${new Date().toString()}</div>`;
                break;
            case 'exit':
                window.location.href = 'main.html';
                break;
            default:
                if (command.toLowerCase().startsWith('echo ')) {
                    output.innerHTML += `<div>${command.slice(5)}</div>`;
                } else {
                    output.innerHTML += `<div>Command not found: ${command}</div>`;
                }
        }
    }

    // Simulate startup sequence
    setTimeout(() => {
        output.innerHTML += '<div>macOS Terminal [Version 10.15.7]</div>';
        output.innerHTML += '<div>Copyright (c) 2024 Apple Inc. All rights reserved.</div>';
        output.innerHTML += '<div>Type "help" for available commands.</div>';
    }, 500);

    // Load main.html in the background
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = 'main.html';
    document.body.appendChild(iframe);
});