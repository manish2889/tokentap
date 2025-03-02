# TokenTap - Web3 Token Faucet

TokenTap is a modern Web3 faucet application that allows users to request test tokens on the Holesky testnet. Built with React, Vite, and Ethereum smart contracts, it provides a seamless way to distribute test tokens for development and testing purposes.

## Features

- 🌊 Request 100 TAP tokens every hour
- 💰 Track your token balance
- ⚡ Real-time updates
- 🎨 Modern UI with Tailwind CSS
- 🔒 Secure smart contract integration
- ⛓️ Holesky testnet support

## Live Demo

Contract Address (Holesky): \`${CONTRACT_ADDRESS}\`

## Prerequisites

- Node.js (v16+ recommended)
- MetaMask wallet
- Some Holesky ETH for gas fees

## Project Structure

\`\`\`
tokentap/
├── src/                    # Frontend React application
├── contracts/             # Smart contract files
│   ├── contracts/        # Solidity contract source
│   ├── scripts/          # Deployment and management scripts
│   └── test/            # Contract test files
├── public/               # Static assets
└── package.json         # Project dependencies
\`\`\`

## Quick Start

1. Clone the repository:
   \`\`\`bash
   git clone <repository-url>
   cd tokentap
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   # Install frontend dependencies
   npm install

   # Install smart contract dependencies
   cd contracts
   npm install
   \`\`\`

3. Configure environment:
   - Create \`.env\` file in the \`contracts\` directory
   - Add your private key: \`PRIVATE_KEY=your_private_key_here\`

4. Deploy the contract (if needed):
   \`\`\`bash
   cd contracts
   npm run deploy
   \`\`\`

5. Start the development server:
   \`\`\`bash
   # From the root directory
   npm run dev
   \`\`\`

## Smart Contract Management

### Deploy Contract
\`\`\`bash
cd contracts
npm run deploy
\`\`\`

### Fund Contract with Tokens
\`\`\`bash
cd contracts
npm run mint
\`\`\`

### Additional Funding
\`\`\`bash
cd contracts
npm run fund
\`\`\`

## Contract Details

- Token Name: TokenTap
- Symbol: TAP
- Tokens per Request: 100 TAP
- Cooldown Period: 1 hour
- Network: Holesky Testnet (Chain ID: 17000)

## Frontend Development

1. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

2. Build for production:
   \`\`\`bash
   npm run build
   \`\`\`

## Testing

Run smart contract tests:
\`\`\`bash
cd contracts
npm test
\`\`\`

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## Security

- The contract includes cooldown periods to prevent abuse
- Owner-only functions for minting and management
- Standard OpenZeppelin contracts for security
- Please report any security issues to [security contact]

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenZeppelin for secure contract implementations
- Ethereum community for tools and documentation
- Holesky testnet team
