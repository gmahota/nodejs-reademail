const Imap = require("imap");
const { simpleParser } = require("mailparser");

const imapConfig = {
  user: "ola@gmail.com",
  password: "AAAAA",
  host: "imap.gmail.com",
  port: 993,
  tls: true,
};

var imap = new Imap(imapConfig);

function openInbox(cb) {
  imap.openBox("INBOX", true, cb);
}

imap.once("ready", () => {
  imap.openBox("INBOX", false, () => {
    imap.search(["UNSEEN", ["SINCE", new Date()]], (err, results) => {
      const f = imap.fetch(results, { bodies: "" });
      f.on("message", (msg) => {
        msg.on("body", (stream) => {
          simpleParser(stream, async (err, parsed) => {
            console.log(parsed);
          });
        });
        msg.once("attributes", (attrs) => {
          const { uid } = attrs;
          imap.addFlags(uid, ["\\Seen"], () => {
            console.log("Marked as read!");
          });
        });
      });
      f.once("error", (ex) => {
        return Promise.reject(ex);
      });
      f.once("end", () => {
        console.log("Done fetching all messages!");
        imap.end();
      });
    });
  });
});

imap.once("error", function (err) {
  console.log(err);
});

imap.once("end", function () {
  console.log("Connection ended");
});

module.exports = {
  imap
}


