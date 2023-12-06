# email-checker

This is a small application written in JS with Imap and mailparser modules that reads and saves raw e-mail data to txt files. The app utilizes the node-notifier module to handle notifications.

![GitHub language count](https://img.shields.io/github/languages/count/m0rningdawning/email-checker-pc)
![GitHub top language](https://img.shields.io/github/languages/top/m0rningdawning/email-checker-pc) 
![GitHub last commit](https://img.shields.io/github/last-commit/m0rningdawning/email-checker-pc)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## Compilation  

Before the compilation run `npm install` to install all dependencies.

- Windows:  
`npx pkg@4.5.1 -t node14-win-x64 -o reader-windows.exe -d reader.js`

- Linux:  
`npx pkg@4.5.1 -t node14-linux-x64 -o reader-linux -d reader.js`

- MacOS:  
`npx pkg@4.5.1 -t node14-macos-x64 -o reader-macos -d reader.js`

Alternatively, you can run the application using Node without the need to compile it:  
`node reader.js`

## How to use  

1. Open "config.json" file and modify the info to access your mailbox.

### Config code with explanations:  

```
{
  "username": "1234",         // Input the name of your email-box
  "password": "1234",         // Input the password
  "host": "imap.gmail.com",   // E.G. poczta.student.tu.kielce.pl or imap.gmail.com. "https://" must be excluded!. Be sure to check if your mailbox has imap protocol turned on!
  "tls": true,                // Leave "true" if you don't know what it is ;)
  "date": "May 1, 2023",      // Search starting point. Format: "Mmm DD, YYYY" E.g "May 30, 2023"
  "mode": "UNSEEN"            // Put "UNSEEN" *All caps* to fetch unread messages. Alternatively, put "SEEN" *All caps* to fetch read messages.
}
```

2. Choose your executable and start an app.

- On windows you can run the .vbs file to open the app with no console.

- Fetched emails will be saved in the "mail" directory. The parsed version of fetched emails will be stored in the "regular" subdirectory, while the raw data will be stored in the "raw" subdirectory.

3. Enjoy!

## Credits
Inspired by:  
https://github.com/KaganBaldiran/University_Mail_Checker
