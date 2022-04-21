/**
 * Example script for retrieving and displaying the
 * circulating supply of the official $CLXY token.
 */
const getTokenCirculation = require('./token-circulation');
/**
 * Retrieves, computes and displays the circulating
 * supply of $CLXY tokens.
 */
async function getClxyCirculation() {
    const source = 'mainnet-public.mirrornode.hedera.com';
    const token = '0.0.859814';
    const treasuries = ['0.0.849428', '0.0.859877', '0.0.859897', '0.0.859903', '0.0.859906', '0.0.859908', '0.0.859910', '0.0.859911'];
    const results = await getTokenCirculation(source, token, treasuries);
    console.dir(results, { depth: 5 });
}
/**
 * Invoke the async function to retrieve and 
 * print results to the console.
 */
getClxyCirculation();