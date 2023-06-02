const fs = require('fs');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const Imap = require('imap');
const notifier = require('node-notifier');
const MailParser = require('mailparser').MailParser;

const noNewMailMessages = [
  "No new mail. Enjoy your day!",
  "You're all caught up. No new messages.",
  "Inbox empty. Nothing new to read.",
  "No unread emails. Keep up the good work!",
  "Great news! Your inbox is clear.",
  "No new mail. Take a break and relax.",
  "Congratulations! Zero unread emails.",
  "No new messages. Take a moment to breathe.",
  "Inbox up to date. No new emails found.",
  "No unread emails. Keep up the productivity!",
  "All clear! No new messages in your inbox.",
  "No new mail. Time for a well-deserved break!",
  "Nothing new to report. Inbox empty.",
  "No unread emails. Enjoy the peace and quiet.",
  "Zero new messages. Keep up the good habits!",
  "No new mail. Take a moment for yourself.",
  "Inbox empty. No new messages to read.",
  "No new emails. Enjoy the clutter-free inbox!",
  "No unread messages. Time for a celebration!",
  "No new mail. Stay focused and keep it up!",
  "You're up to date. No new messages received.",
  "No new mail. Everything is under control.",
  "Inbox empty. No new messages waiting.",
  "No unread emails. Feel the satisfaction!",
  "All clear! No new messages to attend to.",
  "No new mail. Your inbox is pristine.",
  "Congratulations! No unread emails.",
  "No new messages. Relax and unwind.",
  "Inbox up to date. Nothing new to see here.",
  "No unread emails. Keep up the great work!",
  "All clear! No new messages in sight.",
  "No new mail. Take a moment to recharge.",
  "Nothing new to report. Inbox is clear.",
  "No unread emails. Enjoy the tranquility.",
  "Zero new messages. Keep it up!",
  "No new mail. Indulge in some me-time.",
  "Inbox empty. No new messages available.",
  "No new emails. Revel in the empty inbox!",
  "No unread messages. Celebrate the achievement!",
  "No new mail. Stay focused and determined.",
  "You're up to date. No new messages to handle.",
  "No new mail. Everything is in order.",
  "Inbox empty. No new messages in queue.",
  "No unread emails. Embrace the calmness!",
  "All clear! No new messages to address.",
  "No new mail. Your inbox is spotless.",
  "Congratulations! No unread emails in sight.",
  "No new messages. Take a moment to relax.",
  "Inbox up to date. Nothing new to read.",
  "No unread emails. Keep up the outstanding work!",
  "All clear! No new messages to worry about.",
  "No new mail. Pause and enjoy the moment."
];

function showNotification(message) {
  notifier.notify({
    title: 'Email Reader',
    message: message,
    sound: true,
  });
}

const logError = async (error) => {
  const errorMessage = `${new Date().toISOString()} - ${error.stack}\n`;
  try {
    await writeFileAsync('error.log', errorMessage, { flag: 'a' });
  } catch (err) {
    console.error('Failed to write error to log file:', err);
  }
};

const folderPath = 'mail';
const regularFolderPath = 'regular';
const rawFolderPath = 'raw';

fs.mkdirSync(folderPath, { recursive: true });
fs.mkdirSync(`${folderPath}/${regularFolderPath}`, { recursive: true });
fs.mkdirSync(`${folderPath}/${rawFolderPath}`, { recursive: true });

try {
  const configData = fs.readFileSync('./config.json', 'utf8');
  const config = JSON.parse(configData);

  const imap = new Imap({
    user: config.username,
    password: config.password,
    host: config.host,
    port: 993,
    tls: config.tls,
    tlsOptions: {
      rejectUnauthorized: false,
    },
  });

  function headersToString(headers) {
    let headerString = '';

    function stringifyValue(value) {
      if (Array.isArray(value)) {
        return value.map(stringifyValue).join(', ');
      }

      if (typeof value === 'object' && value !== null) {
        return headersToString(value);
      }

      return value.toString();
    }

    for (const key in headers) {
      if (headers.hasOwnProperty(key)) {
        const value = headers[key];
        const formattedValue = stringifyValue(value);
        headerString += `${key}: ${formattedValue}\n`;
      }
    }

    return headerString;
  }

  function openInbox(cb) {
    imap.openBox('INBOX', true, cb);
  }

  imap.once('ready', function () {
    openInbox(function (err, box) {
      if (err)
        throw err;

      imap.search([config.mode, ['SINCE', config.date]], function (err, results) {
        if (err)
          throw err;

        if (results.length === 0) {
          imap.end();
          const randomMessage = noNewMailMessages[Math.floor(Math.random() * noNewMailMessages.length)];
          showNotification(randomMessage);
          console.log('No new messages found!');
          return;
        }

        var f = imap.fetch(results, { bodies: '' });

        f.on('message', function (msg, seqno) {
          const parser = new MailParser();

          let parsedHeaders = [];
          let parsedBody = '';

          console.log('Message #%d', seqno);

          var prefix = '(#' + seqno + ') ';

          parser.on('headers', headers => {
            const includedHeaders = ['from', 'to', 'cc', 'bcc', 'subject', 'date', 'reply-to', 'message-id', 'in-reply-to', 'references'];

            includedHeaders.forEach(key => {
              const headerValue = headers.get(key);
              if (headerValue)
                parsedHeaders[key] = headerValue;
            });
          });

          parser.on('data', data => {
            if (data.type === 'text')
              parsedBody += data.text;
          });

          parser.on('end', () => {
            const parsedData = headersToString(parsedHeaders) + parsedBody;

            console.log(parsedData);
            console.log('Parsing complete');
          });

          msg.on('body', function (stream, info) {
            console.log(prefix + 'Body');
            const filePath = `${folderPath}/${regularFolderPath}/msg-${seqno}-body.txt`;

            stream.pipe(parser);

            parser.on('end', () => {
              const parsedData = headersToString(parsedHeaders) + parsedBody;

              fs.writeFile(filePath, parsedData, (error) => {
                if (error)
                  console.error('Error writing file:', error);
                else
                  console.log('File written successfully:', filePath);
              });
            });
            stream.pipe(fs.createWriteStream(`${folderPath}/${rawFolderPath}/msg-${seqno}-body.txt`));
          });

          msg.once('end', function () {
            console.log(prefix + 'Finished');
          });
        });

        f.once('error', function (err) {
          logError(err).catch(console.error);
        });

        f.once('end', function () {
          console.log('Done fetching all messages!');
          imap.end();
          if (results.length == 1) {
            console.log('You have 1 new message!');
            showNotification('You have 1 new message!');
          } else {
            console.log('You have ' + results.length + ' new messages!');
            showNotification('You have ' + results.length + ' new messages!');
          }
        });
      });
    });
  });

  imap.once('error', function (err) {
    logError(err).catch(console.error);
  });

  imap.once('end', function () {
    console.log('Connection ended');
  });

  imap.connect();
} catch (error) {
  logError(error).catch(console.error);
  process.exit(1);
}
