/**
 * HTS Circulating Supply API
 * 
 * Simple REST API that calculates the circulating supply for 
 * Hedera Token Service assets.
 * 
 * Requires the following environmental variables:
 * 
 * PORT: Port number to listen on.
 * TOKEN_ID: ID of the token to examine.
 * MIRROR_NODE: The mirror node to query.
 * TREASURIES: List of treasuries holding non-circulating tokens.
 * 
 * (see comments below for more details on environment variables)
 */
const http = require('http')
const getTokenCirculation = require('./token-circulation');
/**
 * Environmental Variable PORT which is the port the server will listen
 * on and serve requests from.  If not specified, the default value of
 * 3000 will be used.
 */
const port = process.env.PORT || 3000;
/**
 * Environmental Variable TOKEN_ID which is the id of the token to query.
 * It is specified in the HAPI address format (0.0.0).
 */
const token = process.env.TOKEN_ID;
/**
 * Environmental variable MIRROR_NODE which is the dns name or IP of the
 * mirror node to query.  If not specified the MAINNET default of
 * `mainnet-public.mirrornode.hedera.com` will be used.
 */
const source = process.env.MIRROR_NODE || 'mainnet-public.mirrornode.hedera.com';
/**
 * Environmental variable TREASURIES which is a list of treasury accounts, 
 * treasury accounts hold non-circulating balances.  Treasury IDs are specified as
 * a comma (or space) seperated list of values in the HAP address format (0.0.0).
 */
const treasuries = process.env.TREASURIES ? process.env.TREASURIES.trim().split(/[, ]+/) : [];
/**
 * Create a simple http server that wrapping the call to the getTokenCirculation
 * method inside a REST API wrapper.
 */
const app = http.createServer(async (_req, res) => {
    try {
        const results = await getTokenCirculation(source, token, treasuries);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results));
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(err.message || err.toString());
    }
});
/**
 * Launch the simple http server on the specified port.
 */
app.listen(port, () => {
    console.log(`Token Circulation API listening on port ${port}`);
    console.log(`Mirror Node: ${source}`);
    console.log(`Token ID: ${token}`);
    if (treasuries.length == 0) {
        console.log('All coins in circulation (no treasuries)');
    } else if (treasuries.length === 1) {
        console.log(`Treasury ID: ${token}`);
    } else {
        console.log(`Treasury IDs: ${treasuries.join(', ')}`);
    }
});