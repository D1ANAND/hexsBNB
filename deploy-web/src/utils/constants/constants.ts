const currencyTBNB = `tBNB`
const currencySepolia = `SEP`

export const addressHexs =`0xbbCEf98E7cBbcC0edADfa0fE8b5de06f31f0692b`
export const currencyTicker = currencySepolia

export const abiHexs =`
[
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_modelId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_newMember",
				"type": "address"
			}
		],
		"name": "addMemberToDao",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "addReviews",
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
			}
		],
		"name": "buyModel",
		"outputs": [],
		"stateMutability": "payable",
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
		"name": "changeVisibility",
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
			},
			{
				"internalType": "string",
				"name": "_uri",
				"type": "string"
			}
		],
		"name": "createModel",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "fetchAllModels",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address payable",
						"name": "creator",
						"type": "address"
					},
					{
						"internalType": "address payable",
						"name": "owner",
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
					},
					{
						"internalType": "uint256",
						"name": "forkedFrom",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "NFTContract",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "lastSoldPrice",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "onSale",
						"type": "bool"
					}
				],
				"internalType": "struct Hexs.Model[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
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
				"internalType": "address payable",
				"name": "creator",
				"type": "address"
			},
			{
				"internalType": "address payable",
				"name": "owner",
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
			},
			{
				"internalType": "uint256",
				"name": "forkedFrom",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "NFTContract",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "lastSoldPrice",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "onSale",
				"type": "bool"
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
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "modelIdToMembers",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
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
				"internalType": "uint256",
				"name": "_price",
				"type": "uint256"
			}
		],
		"name": "putModelOnSale",
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
				"internalType": "string",
				"name": "_uri",
				"type": "string"
			}
		],
		"name": "updateSDLURI",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "userToModelToTokeId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
`