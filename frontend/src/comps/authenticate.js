import axios from 'axios'

export async function authenticateAction(navigate) {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });

    //No active accounts
    if(accounts.length === 0) {
        return navigate('/login');
    }

    const nonce = await getNonce(accounts[0]);
    const signature = await handleSign(accounts[0], nonce);

    return [accounts[0], signature];
}

async function getNonce(publicAddress) {
    const nonce = await axios.get('/api/account/publicAddress', { params: {
        publicAddress: publicAddress
    }})
    .then((res) => {
        return res.data.nonce
    });

    return nonce;
}

async function handleSign(publicAddress, nonce) {
    const signed = await window.ethereum.request({
        jsonrpc: "2.0",
        method: 'personal_sign',
        params: [
            publicAddress,
            `Signing a one-time nonce: ${nonce}`
        ],
        from: publicAddress
    });

    return signed;
}