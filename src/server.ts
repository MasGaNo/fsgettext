import server from "staticserver";

server.useStatic(`${__dirname}/../dist`).listen(8900, () => {
    console.log(`Listen to 8900`, __dirname);
});
