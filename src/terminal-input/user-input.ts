export enum UserAction {
    EXIT,
    FAVORIZE,
    KILL,
    NEXT,
    PREVIOUS,
    UNDEFINED
}

// Allows processing special keys
process.stdin.setRawMode(true);
process.stdin.resume();

// Returns the action performed by the user
export async function userInput() : Promise<UserAction> {
    return new Promise((resolve) => {
        // Listens on any keyboard input and maps specific inputs to user actions
        const listener = (key: Buffer) => {
            if (key.length === 1) {
                if (key[0] === 3) {
                    resolve(UserAction.KILL);
                }
                const char = String.fromCharCode(key[0]);
                switch(char) {
                    case "f":
                        resolve(UserAction.FAVORIZE);
                        break;
                    case "q":
                        resolve(UserAction.EXIT);
                        break;
                }
            }
            
            // Map arrow keys
            if (key.length === 3) {
                if (key[0] === 27 && key[1] === 91) {
                    switch (key[2]) {
                        // Arrow Up
                        case 65:
                            resolve(UserAction.PREVIOUS);
                            break;
                        // Arrow Down
                        case 66:
                            resolve(UserAction.NEXT);
                            break;
                    }
                }
            }
            resolve(UserAction.UNDEFINED);
        };
        process.stdin.once("data", listener);
    });
}