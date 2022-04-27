const https = require('https');
const URLSearchParams = require('url').URLSearchParams;
/**
 * Queries a remote hedera mirror node, retrieving the total supply and
 * balance information of treasuries for a given HTS token.  Computes the current
 * circulating supply as the total supply of token less the sum of the balances
 * of the identified treasury accounts.
 * 
 * @param {string} source the mirror node to query token information and balances.
 * @param {string} token the id of the token (in HAPI 0.0.0 format)
 * @param {string[]} treasuries an array of treasury accounts.  Treasury accounts
 * do not count towards circulating token supply.
 * 
 * @returns an object holding the results of query balances and calculations.
 */
module.exports = async function tokenCirculation(source, token, treasuries) {

    validateInput();
    const agent = new https.Agent({ keepAlive: true });
    const timestamp = (Date.now() / 1000).toFixed(9);
    const { totalSupply, decimals } = await getTokenSupply();
    const treasuryBalances = await getTreasuryBalances();
    const totalTreasuryBalances = treasuryBalances.reduce((p, c) => p + c.balance, BigInt(0));
    const circulating = totalSupply - totalTreasuryBalances;

    return {
        token,
        decimals,
        totalSupply: totalSupply.toString(),
        circulating: circulating.toString(),
        treasuryBalances: treasuryBalances.map(value => { return { treasury: value.treasury, balance: value.balance.toString() }; }),
        timestamp,
        source
    }

    /**
     * Helper function to validate token/treasury input values.  It checks
     * to confirm that the strings for address are in HAPI format (0.0.0) and
     * that the mirror node server is identified.
     * 
     * @throws {Error} Error if any of the input values appear to be invalid.
     */
    function validateInput() {
        if (!source) {
            throw new TypeError('Source (mirror node) must be defined.');
        }
        if (!/^\d+\.\d+\.\d+$/.test(token)) {
            throw new TypeError(`Invalid token ID ${token}`);
        }
        if (treasuries) {
            if (!Array.isArray(treasuries)) {
                throw new TypeError('If defined, the treasuries argument must be an arrray.');
            }
            for (let treasury of treasuries) {
                if (!/^\d+\.\d+\.\d+$/.test(treasury)) {
                    throw new TypeError(`Invalid treasury ID ${treasury}`);
                }
            }
        }
    }
    /**
     * Retrieves the total supply and decimal places for the target token.
     * 
     * @returns a structure identifying the total supply and decimial places
     * for the target token.
     * 
     * @throws {Error} Error if there was a problem communicating with the mirror node
     * endpoint or if the token with the specified ID was not found.
     */
    async function getTokenSupply() {
        const tokenInfo = await getHtsTokenInfo();
        return {
            totalSupply: BigInt(tokenInfo.total_supply),
            decimals: tokenInfo.decimals !== undefined ? parseInt(tokenInfo.decimals, 10) : 0
        };
    }
    /**
     * Retrieves the token info from a mirror node for the given HTS token.
     * 
     * @returns the token info object returned from the mirror node, this information
     * includes the tokens's total supply and decimal places.
     * 
     * @throws {Error} Error if there was a problem communicating with the mirror node
     * endpoint or if the token with the specified ID was not found.
     */
    async function getHtsTokenInfo() {
        const queryParams = new URLSearchParams({ 'timestamp': timestamp });
        const path = `/api/v1/tokens/${token}?${queryParams.toString()}`;
        const options = { hostname: source, path, method: 'GET', agent };
        let { code, data } = await executeRequest(options);
        if (code === 200) {
            return JSON.parse(data.toString('ascii'));
        } else {
            throw new Error(`HTS Token ${token} was not found, code: ${code}`);
        }
    }
    /**
     * Retrieves the token balances for each of the designated treasury accounts.
     * 
     * @returns an array of objects identifying the treasury account (by id) and
     * how many tokens the account holds (in tiny token amounts).
     * 
     * @throws {Error} Error if there was a problem communicating with the mirror node
     * endpoint or if the treasury account with the specified ID was not found.
     */
    async function getTreasuryBalances() {
        const result = [];
        for (var treasury of treasuries) {
            const info = await getHTSAccountBalance(treasury);
            if (info && info.balances) {
                const balances = info.balances[0];
                if (balances && balances.tokens) {
                    const tokenBalanceInfo = balances.tokens.find(b => b.token_id === token);
                    if (tokenBalanceInfo) {
                        const balance = tokenBalanceInfo.balance !== undefined ? BigInt(tokenBalanceInfo.balance) : BigInt(0);
                        result.push({ treasury, balance });
                    }
                }
            }
        }
        return result;
    }
    /**
     * Retrieves the balance info from a mirror node for the given hedera account.
     * 
     * @param {string} account account id in HAPI 0.0.0 format.
     * 
     * @returns the balance info object returned from the mirror node, this information
     * includes the account's crypto and token balances.
     * 
     * @throws {Error} Error if there was a problem communicating with the mirror node
     * endpoint or if the account with the specified ID was not found.
     */
    async function getHTSAccountBalance(account) {
        const queryParams = new URLSearchParams({ 'account.id': account, 'timestamp': timestamp });
        const path = `/api/v1/balances?${queryParams.toString()}`;
        const options = { hostname: source, path, method: 'GET', agent };
        let { code, data } = await executeRequest(options);
        if (code === 200) {
            return JSON.parse(data.toString('ascii'));
        } else {
            throw new Error(`Balance for ${account} was not found, code: ${code}`);
        }
    }
    /**
     * Helper function that executes a simple https request
     * for the given resource.
     * 
     * @param {import('https').RequestOptions} options HTTP options
     * of the request, including the host name, path, method and agent.
     * 
     * @returns the http code returned from the retmote service
     * pluss a buffer containing body content from the response.
     */
    function executeRequest(options) {
        let data = [];
        return new Promise((resolve, reject) => {
            const req = https.request(options, res => {
                res.on('data', chunk => { data.push(chunk); });
                res.on('end', () => resolve({ code: res.statusCode, data: Buffer.concat(data) }));
            });
            req.on('error', e => reject(e));
            req.end();
        });
    }
};