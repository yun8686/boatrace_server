const Twitter = require("twitter");
const setting = require("./twitter.setting.json");
const client = new Twitter(setting);

const content = "自動化します。1";
client.post("statuses/update", { status: content }, function (
  error,
  tweet,
  response
) {
  if (!error) {
    console.log("tweet success: " + content);
  } else {
    console.log(error);
  }
});
