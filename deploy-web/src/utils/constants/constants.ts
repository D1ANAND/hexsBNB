export const addressHexs =`0x992727458B4ae6Cf40Bba66EEE42EeF24236D3FC`
export const currencyTicker =`tBNB`

export const abiHexs =`
[
	{
		"inputs": [],
		"name": "addMemberToDao",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "buyModel",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bool",
				"name": "_visibility",
				"type": "bool"
			}
		],
		"name": "createModel",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "fetchDiscoveryPage",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "fetchMarketplacePage",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "fetchMyModelsPage",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_modelId",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "_visibility",
				"type": "bool"
			}
		],
		"name": "forkModel",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "putModelOnSale",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "updateSDLURI",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "idToModel",
		"outputs": [
			{
				"internalType": "address",
				"name": "creator",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "modelId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "reviewsURI",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "encryptedSDLURI",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "visibility",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "isForked",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "baseModel",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "modelId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "modelIdToNFTAddress",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
`