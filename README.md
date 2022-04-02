# Token wizard (TRON)
Write a UI that deploys TRC-20 token on the Tron network (Testnet)

# User flow
1. Connect Tron link wallet
2. Inputs:
- Name of token
- Decimals
- Symbol
- total supply
- who should receive total supply
3. Deploy button sends a request to the wallet to sign a transaction that deploys the smart contract.


## Bonus points if it feels too easy
- Add Mintable functionality ( it means you would have to make changes on how to deploy preminted tokens vs mintable)
- Write detailed token page after deployment where a person can call methods of the token (read and write methods)

Questions:
- Q: Where to get the token contract?
- A: Feel free to either deploy FAU.sol token(erc20faucet.com). Copy/paste it, compile it. OR feel free to utilize openzeppelin wizard(link below)

References:
https://erc20faucet.com/ ( it’s our product ) github

https://docs.openzeppelin.com/contracts/4.x/wizard - great tool, but it doesn’t allow people to deploy right from there( no metamask integration )


https://developers.tron.network/reference/tronweb-object