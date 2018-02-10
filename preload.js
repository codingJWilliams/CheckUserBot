const fs = require("fs");

if (!process.env.CONFIG_CONTENT) {
    console.error("You have not provided the CONFIG_CONTENT variable");
    process.exit(1);
}

fs.writeFileSync("./token.json", process.env.CONFIG_CONTENT)