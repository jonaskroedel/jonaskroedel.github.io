const commands = {
    ping: () => "Pong!",
    clear: (terminal, terminalInput) => {
        Array.from(terminal.childNodes).forEach(node => {
            if (node !== terminalInput.parentNode) {
                terminal.removeChild(node);
            }
        });
        return '';
    },
    help: () => `Available commands:
help - Display this message
clear - Clear the terminal window
ping - Pong!
startup_Page() - Enter the main page
date - Display current date and time
echo [text] - Display the provided text
whoami - Display current user information`,
    date: () => new Date().toString(),
    echo: (_, __, args) => args.join(' '),
    whoami: () => "user@kroedel.at",
    startup_Page: () => "Initializing startup sequence...",
};

export default commands;