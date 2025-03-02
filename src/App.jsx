import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const EXPECTED_CHAIN_ID = 17000n;
const CONTRACT_ADDRESS = "0x6bFEF8ac708ef73142Fb59D29590351D0C07920a";

const abi = [
    "function requestTokens() public",
    "function getBalance(address user) public view returns (uint256)",
    "function lastRequestTime(address user) public view returns (uint256)",
    "function symbol() public view returns (string)",
    "function name() public view returns (string)"
];

const fetchBalance = async (userAddress, contractAddress, provider) => {
    const contract = new ethers.Contract(contractAddress, abi, provider);
    try {
        const balance = await contract.getBalance(userAddress);
        return ethers.formatEther(balance);
    } catch (error) {
        console.error("Error fetching balance:", error);
        throw error;
    }
};

const checkContract = async (contractAddress, provider) => {
    try {
        const bytecode = await provider.getCode(contractAddress);
        if (bytecode === '0x') {
            throw new Error("No contract found at the specified address");
        }
        return true;
    } catch (error) {
        console.error("Contract check error:", error);
        throw error;
    }
};

const switchToCorrectNetwork = async () => {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${EXPECTED_CHAIN_ID.toString(16)}` }],
        });
        return true;
    } catch (error) {
        if (error.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: `0x${EXPECTED_CHAIN_ID.toString(16)}`,
                        chainName: 'Holesky',
                        nativeCurrency: {
                            name: 'Holesky ETH',
                            symbol: 'ETH',
                            decimals: 18
                        },
                        rpcUrls: ['https://ethereum-holesky.publicnode.com'],
                        blockExplorerUrls: ['https://holesky.etherscan.io']
                    }]
                });
                return true;
            } catch (addError) {
                console.error("Error adding network:", addError);
                throw addError;
            }
        }
        console.error("Error switching network:", error);
        throw error;
    }
};

function App() {
    const [balance, setBalance] = useState('0');
    const [address, setAddress] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [contractBalance, setContractBalance] = useState('0');
    const [isRequesting, setIsRequesting] = useState(false);
    const [lastRequestTime, setLastRequestTime] = useState(null);
    const [cooldownTime, setCooldownTime] = useState(0);

    const fetchAddressAndBalance = useCallback(async () => {
        try {
            if (!window.ethereum) {
                throw new Error('Please install MetaMask to use this app');
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const network = await provider.getNetwork();
            
            if (network.chainId !== EXPECTED_CHAIN_ID) {
                await switchToCorrectNetwork();
            }

            const signer = await provider.getSigner();
            const userAddress = await signer.getAddress();
            setAddress(userAddress);

            await checkContract(CONTRACT_ADDRESS, provider);

            const [userBalance, contractBalanceValue] = await Promise.all([
                fetchBalance(userAddress, CONTRACT_ADDRESS, provider),
                fetchBalance(CONTRACT_ADDRESS, CONTRACT_ADDRESS, provider)
            ]);

            setBalance(userBalance);
            setContractBalance(contractBalanceValue);
            setError('');
        } catch (error) {
            console.error("Error:", error);
            setError(error.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAddressAndBalance();
        
        if (window.ethereum) {
            window.ethereum.on('chainChanged', () => window.location.reload());
            window.ethereum.on('accountsChanged', () => window.location.reload());
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('chainChanged', () => {});
                window.ethereum.removeListener('accountsChanged', () => {});
            }
        };
    }, [fetchAddressAndBalance]);

    useEffect(() => {
        let timer;
        if (cooldownTime > 0) {
            timer = setInterval(() => {
                setCooldownTime(prevTime => prevTime - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cooldownTime]);

    const requestTokens = async () => {
        setIsRequesting(true);
        setError('');
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

            const tx = await contract.requestTokens();
            await tx.wait();
            
            setLastRequestTime(new Date().toLocaleString());
            setCooldownTime(3600);
            
            await fetchAddressAndBalance();
        } catch (error) {
            console.error("Error requesting tokens:", error);
            setError(error.reason || error.message || 'Error requesting tokens');
            if (error.reason === "execution reverted: Tokens already requested") {
                setCooldownTime(3600);
            }
        } finally {
            setIsRequesting(false);
        }
    };

    const formatCooldownTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-primary-600 to-primary-800">
                <div className="text-3xl font-bold text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-r from-primary-600 to-primary-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div className="px-6 py-8 sm:p-10">
                        <h1 className="text-4xl font-extrabold text-primary-900 text-center mb-8">
                            TokenTap Faucet
                        </h1>
                        
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg" role="alert">
                                <p className="font-medium">{error}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="bg-primary-50 rounded-xl p-6">
                                <h2 className="text-lg font-semibold text-primary-900 mb-2">Your Address</h2>
                                <p className="text-sm text-primary-700 break-all font-mono">{address}</p>
                            </div>
                            <div className="bg-primary-50 rounded-xl p-6">
                                <h2 className="text-lg font-semibold text-primary-900 mb-2">Your Balance</h2>
                                <p className="text-3xl font-bold text-primary-600">{balance} Tokens</p>
                            </div>
                        </div>

                        <div className="mt-6 bg-primary-50 rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-primary-900 mb-2">Contract Balance</h2>
                            <p className="text-2xl font-semibold text-primary-600">{contractBalance} Tokens</p>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={requestTokens}
                                disabled={isRequesting || cooldownTime > 0}
                                className={`w-full flex justify-center py-4 px-6 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white transition-all duration-200 ${
                                    isRequesting || cooldownTime > 0
                                        ? 'bg-primary-400 cursor-not-allowed'
                                        : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                                }`}
                            >
                                {isRequesting ? 'Requesting...' : cooldownTime > 0 ? `Try again in ${formatCooldownTime(cooldownTime)}` : 'Request Tokens'}
                            </button>
                        </div>

                        {lastRequestTime && (
                            <div className="mt-4 text-center text-sm text-primary-600">
                                Last request: {lastRequestTime}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;