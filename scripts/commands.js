const commands = {
    ping: function() {
        // Return "Pong!" when the ping command is entered
        return "Pong!";
    },
    clear: function(terminal, terminalInput) {
        // Get all the child nodes of the terminal
        const terminalLines = Array.from(terminal.childNodes);

        // Remove all child nodes of the terminal except for the current command line
        for (const line of terminalLines) {
            if (line !== terminalInput.parentNode) {
                terminal.removeChild(line);
            }
        }
    },
    help: function() {
        // Return the help message when the help command is entered
        return "Available commands:\n" +
            "help - Display this message\n" +
            "clear - Clear the terminal window\n" +
            "ping - Pong!\n" +
            "startup_Page() - Enter the main page";
    },

    // Add more commands here...
};

export default commands;