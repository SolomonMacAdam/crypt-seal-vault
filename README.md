# Crypt Seal Vault - Encrypted Rating System

A privacy-preserving rating system built with Fully Homomorphic Encryption (FHE) using FHEVM by Zama. Users can submit anonymous ratings (1-10 scale) for various subjects while maintaining complete privacy. Only aggregated statistics are revealed, never individual ratings.

## 🎬 Live Demo

- **Live Application**: [https://crypt-seal-vault.vercel.app/](https://crypt-seal-vault.vercel.app/)
- **Demo Video**: [https://github.com/SolomonMacAdam/crypt-seal-vault/blob/main/crypt-seal-vault.mp4](https://github.com/SolomonMacAdam/crypt-seal-vault/blob/main/crypt-seal-vault.mp4)

## 🚀 Features

- **Anonymous Ratings**: Submit ratings without revealing your identity or individual scores
- **FHE-Powered**: Uses Fully Homomorphic Encryption to compute on encrypted data
- **Privacy-First**: Individual ratings remain encrypted on-chain forever
- **Aggregated Insights**: View average ratings and statistics without compromising privacy
- **Multi-Subject Support**: Rate different subjects/categories independently
- **Decentralized**: Built on blockchain with wallet-based authentication

## 🎯 Use Cases

- Anonymous leadership feedback
- Private team performance reviews
- Anonymous satisfaction surveys
- Privacy-preserving employee evaluations
- Confidential product/service ratings

## 🏗️ Architecture

### Smart Contract (`EncryptedRatingSystem.sol`)

The core smart contract implements a privacy-preserving rating system using FHEVM. Key features:

#### Core Data Structures
- **RatingEntry**: Stores encrypted rating data including submitter address, subject, encrypted rating value (euint32), timestamp, and active status
- **Encrypted Aggregates**: Maintains encrypted sums per subject and global encrypted sum for statistical computations
- **User Management**: Tracks user submissions per subject to prevent duplicate ratings

#### Key Functions

1. **`submitRating()`**: 
   - Accepts encrypted rating (euint32) with input proof
   - Validates subject and prevents duplicate submissions
   - Stores encrypted rating on-chain
   - Updates encrypted aggregates using homomorphic addition (`FHE.add()`)
   - Sets FHE permissions for decryption access

2. **`updateRating()`**:
   - Allows users to update their existing rating
   - Removes old rating from aggregates using homomorphic subtraction (`FHE.sub()`)
   - Adds new rating to aggregates using homomorphic addition
   - Maintains data consistency

3. **`deleteRating()`**:
   - Soft-deletes user's rating entry
   - Removes rating from encrypted aggregates
   - Allows user to submit again

4. **`requestSubjectStats()` / `requestGlobalStats()`**:
   - Requests decryption of encrypted aggregates
   - Uses FHEVM's `FHE.requestDecryption()` to initiate off-chain decryption
   - Triggers callback functions when decryption completes

5. **`subjectStatsCallback()` / `globalStatsCallback()`**:
   - Receives decrypted aggregate values from Zama's relayer network
   - Calculates average ratings (total / count)
   - Publishes statistics via events

#### FHE Operations
- **Homomorphic Addition**: `FHE.add()` - Computes sum of encrypted values without decryption
- **Homomorphic Subtraction**: `FHE.sub()` - Removes values from encrypted aggregates
- **Permission Management**: `FHE.allow()` - Grants decryption permissions to users
- **External Input**: `FHE.fromExternal()` - Converts external encrypted input to contract's euint32 format

### Frontend Application

#### Encryption Flow (`ui/src/lib/fhevm.ts`)
1. **Initialize FHEVM Instance**:
   - **Localhost (31337)**: Uses `@fhevm/mock-utils` with Hardhat node
   - **Sepolia (11155111)**: Uses `@zama-fhe/relayer-sdk` with SepoliaConfig

2. **Encrypt Rating** (`encryptRating()`):
   ```typescript
   // Create encrypted input for contract
   const encryptedInput = fhevm
     .createEncryptedInput(contractAddress, userAddress)
     .add32(rating); // Add rating value (1-10)
   
   // Encrypt (triggers MetaMask signature on Sepolia)
   const encrypted = await encryptedInput.encrypt();
   
   // Return handles and input proof for contract call
   return { handles, inputProof };
   ```

3. **Decrypt Aggregates** (`batchDecrypt()`):
   - **Localhost**: Uses `userDecryptHandleBytes32` from mock-utils
   - **Sepolia**: Uses `userDecrypt()` with EIP712 signature
   - Batch decrypts multiple handles for efficiency

#### Contract Interaction (`ui/src/lib/contract.ts`)
- Wraps contract calls with proper error handling
- Manages encrypted input formatting
- Handles decryption permission grants
- Provides helper functions for statistics retrieval

#### UI Components (`ui/src/components/RatingSystem.tsx`)
- Real-time auto-decryption of aggregates
- Star-based rating interface (1-10 scale)
- Subject selection and management
- Statistics display with loading states
- Wallet connection via RainbowKit

### FHEVM Infrastructure

- **Encryption**: Client-side encryption using `@zama-fhe/relayer-sdk` (Sepolia) or `@fhevm/mock-utils` (localhost)
- **Computation**: On-chain homomorphic operations using `@fhevm/solidity` library
- **Decryption**: Off-chain decryption via Zama's relayer network with EIP712 signatures
- **Permission System**: ACL-based access control for decryption operations

## Quick Start

### Prerequisites
- **Node.js**: Version 20 or higher
- **npm**: Package manager

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone https://github.com/SolomonMacAdam/crypt-seal-vault.git
   cd crypt-seal-vault
   npm install
   cd ui && npm install
   ```

2. **Set up environment variables**
   ```bash
   npx hardhat vars set MNEMONIC
   npx hardhat vars set INFURA_API_KEY
   ```

3. **Start local development**
   ```bash
   # Terminal 1: Start local FHEVM node
   npx hardhat node

   # Terminal 2: Deploy contracts
   npx hardhat deploy --network localhost

   # Terminal 3: Start frontend
   cd ui && npm run dev
   ```

## 📱 Usage

1. **Connect Wallet**: Use the RainbowKit button in the top-right corner
2. **Submit Rating**: Select a subject and provide a 1-10 rating
3. **View Statistics**: Request decryption to see aggregated results
4. **Explore Categories**: Rate different subjects independently

## 🧪 Testing

### Local Testing
```bash
# Run contract tests
npm run test

# Run rating system task
npx hardhat task:RatingSystem
```

### Sepolia Testing
```bash
# Deploy to Sepolia
npx hardhat deploy --network sepolia

# Run Sepolia tests
npx hardhat task:RatingSystemSepolia
```

## 📁 Project Structure

```
crypt-seal-vault/
├── contracts/              # Smart contracts
│   └── EncryptedRatingSystem.sol  # Main FHE rating system contract
├── deploy/                 # Deployment scripts
│   └── deploy.ts           # Contract deployment logic
├── tasks/                  # Hardhat tasks
│   ├── RatingSystem.ts     # Local testing task
│   └── RatingSystemSepolia.ts  # Sepolia testing task
├── scripts/                # Utility scripts
│   ├── deploy-sepolia.ts   # Sepolia deployment script
│   └── check-balance.ts    # Balance checking utility
├── test/                   # Test files
│   ├── FHECounter.ts       # FHE counter tests
│   └── FHECounterSepolia.ts # Sepolia FHE tests
├── ui/                     # Frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── RatingSystem.tsx    # Main rating component
│   │   │   ├── Header.tsx          # App header
│   │   │   └── ui/                 # shadcn/ui components
│   │   ├── lib/
│   │   │   ├── fhevm.ts            # FHEVM encryption/decryption logic
│   │   │   └── contract.ts         # Contract interaction helpers
│   │   ├── hooks/
│   │   │   └── useFhevm.tsx        # FHEVM React hook
│   │   ├── config/
│   │   │   └── wagmi.ts            # Wagmi configuration
│   │   └── pages/
│   │       └── Index.tsx            # Main page
│   └── package.json
├── deployments/            # Deployment artifacts
│   ├── localhost/          # Local deployment data
│   └── sepolia/            # Sepolia deployment data
├── types/                  # TypeScript type definitions
│   └── contracts/          # Generated contract types
└── hardhat.config.ts       # Hardhat configuration
```

## 🔐 Privacy & Security

### Privacy Guarantees

- **Individual Privacy**: Your ratings are encrypted as `euint32` and never revealed on-chain
- **Zero-Knowledge Computation**: All aggregations (sum, average) happen on encrypted data using homomorphic operations
- **Selective Decryption**: Only aggregated statistics can be decrypted, never individual ratings
- **Permission-Based Access**: Decryption requires explicit ACL permissions via `FHE.allow()`

### Security Features

- **Input Validation**: Contract validates encrypted input proofs before accepting ratings
- **Duplicate Prevention**: One rating per user per subject enforced on-chain
- **Wallet Authentication**: All operations require wallet signature
- **Network Isolation**: Separate configurations for localhost (mock) and Sepolia (production)
- **Decentralized**: No central authority can access individual encrypted data

### FHEVM Security Model

- **Encryption**: Uses TFHE (Torus Fully Homomorphic Encryption) scheme
- **Key Management**: Public keys stored on-chain, private keys managed by Zama's relayer network
- **Access Control**: ACL (Access Control List) system controls who can decrypt which values
- **Input Proofs**: Cryptographic proofs ensure encrypted inputs are valid without revealing values

## 📊 How It Works

### Complete Data Flow

1. **User Submits Rating**:
   - User selects a subject (e.g., "Leadership") and provides a rating (1-10)
   - Frontend validates input (rating must be between 1-10)

2. **Client-Side Encryption**:
   ```typescript
   // Frontend encrypts rating before sending to blockchain
   const encrypted = await encryptRating(
     fhevmInstance,
     contractAddress,
     userAddress,
     rating // e.g., 7
   );
   // Returns: { handles: [bytes32], inputProof: bytes }
   ```

3. **On-Chain Submission**:
   - Encrypted rating (euint32) is sent to `submitRating()` function
   - Contract validates input proof and converts to internal euint32 format
   - Rating is stored in `ratingEntries` mapping
   - **Homomorphic aggregation**: Contract adds encrypted rating to encrypted sum using `FHE.add()`
     ```solidity
     _encryptedRatingSum[subjectHash] = FHE.add(
       _encryptedRatingSum[subjectHash], 
       rating
     );
     ```

4. **Encrypted Storage**:
   - Individual ratings remain encrypted as `euint32` on-chain
   - Encrypted aggregates (`_encryptedRatingSum`) accumulate sums without decryption
   - Entry counts are stored as plain `uint32` (not sensitive)

5. **Statistics Request**:
   - User requests decryption of aggregates via `requestSubjectStats()` or `requestGlobalStats()`
   - Contract calls `FHE.requestDecryption()` with encrypted sum handle
   - Request is sent to Zama's relayer network

6. **Off-Chain Decryption**:
   - Zama's relayer network decrypts the encrypted sum
   - Decryption requires proper ACL permissions (granted via `FHE.allow()`)
   - Decrypted value is returned to contract via callback

7. **Statistics Calculation**:
   ```solidity
   // Callback receives decrypted total
   uint32 totalRating = extractFromCleartexts(cleartexts);
   uint32 average = totalRating / count; // Calculate average
   ```

8. **Display Results**:
   - Frontend automatically decrypts aggregates using `batchDecrypt()`
   - Statistics are displayed: average rating, total count
   - Individual ratings remain private forever

### Key Encryption/Decryption Logic

#### Encryption Process
```typescript
// 1. Create FHEVM instance (network-specific)
const fhevm = await getFHEVMInstance(chainId);

// 2. Create encrypted input
const encryptedInput = fhevm
  .createEncryptedInput(contractAddress, userAddress)
  .add32(rating); // Add plaintext value

// 3. Encrypt (requires MetaMask signature on Sepolia)
const encrypted = await encryptedInput.encrypt();

// 4. Format for contract call
const handles = encrypted.handles.map(h => ethers.hexlify(h));
const inputProof = ethers.hexlify(encrypted.inputProof);
```

#### Decryption Process
```typescript
// 1. Read encrypted handles from contract
const [encryptedSum, count] = await contract.getEncryptedSubjectStats(subject);

// 2. Batch decrypt handles
const decrypted = await batchDecrypt(
  fhevm,
  [{ handle: encryptedSum, contractAddress }],
  userAddress,
  signer,
  chainId
);

// 3. Calculate statistics
const average = decrypted[encryptedSum] / count;
```

#### Homomorphic Operations
- **Addition**: `FHE.add(euint32 a, euint32 b)` - Adds two encrypted values
- **Subtraction**: `FHE.sub(euint32 a, euint32 b)` - Subtracts encrypted values
- **Permission**: `FHE.allow(euint32 value, address user)` - Grants decryption access
- **External Input**: `FHE.fromExternal(externalEuint32, proof)` - Validates and converts external encrypted input

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [FHEVM Docs](https://docs.zama.ai)
- **Community**: [Zama Discord](https://discord.gg/zama)
- **Issues**: [GitHub Issues](https://github.com/SolomonMacAdam/crypt-seal-vault/issues)

---

**Built with ❤️ using FHEVM by Zama**
