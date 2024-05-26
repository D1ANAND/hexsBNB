"use client";
import web3modal from "web3modal";
import { ethers } from "ethers";
import { addressHexs, abiHexs } from "./constants/constants";
import lighthouse from "@lighthouse-web3/sdk";
import axios from "axios";
import kavach from "@lighthouse-web3/kavach";

//stats page - control visibility variable, see number of forks, dao management

// ------- instances

export async function getHexsContract(providerOrSigner: any) {
  const modal = new web3modal();
  const connection = await modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const contract = new ethers.Contract(addressHexs, abiHexs, provider);
  if (providerOrSigner == true) {
    const signer = provider.getSigner();
    const contract = new ethers.Contract(addressHexs, abiHexs, signer);
    return contract;
  }
  return contract;
}

export async function getUserAddress() {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts"
  });
  return accounts[0];
}

// ------- setter

export async function tokenizeModel(_yamlJson: any) {
  //   console.log(_yamlJson);

  //download the SDL file
  const fileName = await generateUniqueFileName();
  download(_yamlJson, fileName);

  let _visibility = true;

  //create contract instance for deployment
  const contract = await getHexsContract(true);
  const tx = await contract.createModel(_visibility, "");
  await tx.wait();

  //fetch the new model id
  let _newModelId = await getNewModelId();

  //encrypt the SDL file with NFT contract address
  let _uri = await encryptSDLUsingLighthouse(_yamlJson, _newModelId);

  //update the Model's URI
  const tx2 = await contract.updateSDLURI(_newModelId, _uri);
  await tx2.wait();

  console.log("Model Tokenized");
  return true;
}

export async function putModelOnSaleCall(_modelId: any, _price: any) {
  const contract = await getHexsContract(true);
  const weiPrice = ethers.utils.parseUnits(_price.toString(), "ether");
  const tx = await contract.putModelOnSale(_modelId, weiPrice);
  await tx.wait();
  fetchAllModels();
  console.log("Model put on sale");
}

export async function buyModelCall(_modelId: any, _price: any) {
  const contract = await getHexsContract(true);
  const weiPrice = ethers.utils.parseUnits(_price.toString(), "ether");
  // send money af
  const tx = await contract.buyModel(_modelId, {
    value: weiPrice,
    gasLimit: 1000000
  });
  await tx.wait();
  console.log("Model bought");
}

export async function forkModelCall(_modelId: any) {
  let _visibility = true;
  const contract = await getHexsContract(true);
  const tx = await contract.forkModel(_modelId, _visibility);
  await tx.wait();
  console.log("Model forked");
}

export async function updateSDLURICall(_modelId: any, _uri: any) {
  const contract = await getHexsContract(true);
  const tx = await contract.updateSDLURI(_modelId, _uri);
  await tx.wait();
  console.log("SDL URI updated");
}

export async function addMemberToDaoCall(_modelId: any, _newMember: any) {
  const contract = await getHexsContract(true);
  const tx = await contract.addMemberToDao(_modelId, _newMember);
  await tx.wait();
  console.log("Member added to DAO");
}

let _visibility: boolean = false;

export async function changeVisibilityCall(_modelId: any, _currentVisibility: any) {
  console.log("before", _currentVisibility, _visibility);
  if (_currentVisibility === "false") {
    _visibility = true;
  }
  console.log("after", _currentVisibility, _visibility);

  const contract = await getHexsContract(true);
  const tx = await contract.changeVisibility(_modelId, _visibility);
  await tx.wait();
  console.log("Visibility changed");
  await fetchMyModelsPage();
}

export async function addReviewCall(_modelId: any, _review: any) {
  const contract = await getHexsContract(true);
  const tx = await contract.addReviews(_modelId, _review);
  await tx.wait();
  console.log("Review added");
}

// ------- getter

async function getNewModelId() {
  const contract = await getHexsContract(false);
  const modelId = await contract.modelId();
  return modelId.toNumber();
}

async function getNFTContractAddress(_modelId: any) {
  const contract = await getHexsContract(false);
  const modelStruct = await contract.idToModel(_modelId);
  // console.log("modelll", modelStruct)
  return modelStruct.NFTContract;
}

let allModels: any = [];
fetchAllModels();

async function fetchAllModels() {
  const contract = await getHexsContract(true);
  const data = await contract.fetchAllModels();

  // console.log("data", data)
  const items = await Promise.all(
    data.map(async (i: any) => {
      //   const tokenUri = await contract.uri(i.ticketId.toString());
      // console.log(tokenUri);
      //   const meta = await axios.get(tokenUri);
      let price = ethers.utils.formatEther(i.lastSoldPrice);
      let item = {
        creator: i.creator.toString(),
        owner: i.owner.toString(),
        modelId: i.modelId.toNumber(),
        reviewsURI: i.reviewsURI,
        encryptedSDLURI: i.encryptedSDLURI,
        visibility: i.visibility.toString(),
        isForked: i.isForked.toString(),
        baseModel: i.baseModel.toNumber(),
        forkedFrom: i.forkedFrom.toNumber(),
        NFTContract: i.NFTContract.toString(),
        lastSoldPrice: price,
        onSale: i.onSale.toString()
      };
      return item;
    })
  );

  allModels = items;
  console.log("All Models fetched: ", items);
  return items;
}

export async function fetchMarketplacePage() {
  if (allModels.length > 0) {
    const filteredArray = allModels.filter((subarray: any) => subarray.onSale == "true");
    return filteredArray;
  } else {
    const data = await fetchAllModels();
    const filteredArray = data.filter(subarray => subarray.onSale == "true");
    return filteredArray;
  }
}

// export async function fetchDiscoveryPage() {
//   if (allModels.length > 0) {
//     const filteredArray = allModels.filter((subarray: any) => subarray.visibility == "true");
//     return filteredArray;
//   } else {
//     const data = await fetchAllModels();
//     const filteredArray = data.filter(subarray => subarray.visibility == "true");
//     return filteredArray;
//   }
// }

export async function fetchDiscoveryPage() {
  const data = await fetchAllModels();
  return data;
}

export async function fetchMyModelsPage() {
  const currentUser = await getUserAddress();

  const contract = await getHexsContract(true);
  const data = await contract.fetchInventory(currentUser.toString());

  // console.log("data", data)
  const items = await Promise.all(
    data.map(async (i: any) => {
      //   const tokenUri = await contract.uri(i.ticketId.toString());
      // console.log(tokenUri);
      //   const meta = await axios.get(tokenUri);
      let price = ethers.utils.formatEther(i.lastSoldPrice);
      let item = {
        creator: i.creator.toString(),
        owner: i.owner.toString(),
        modelId: i.modelId.toNumber(),
        reviewsURI: i.reviewsURI,
        encryptedSDLURI: i.encryptedSDLURI,
        visibility: i.visibility.toString(),
        isForked: i.isForked.toString(),
        baseModel: i.baseModel.toNumber(),
        forkedFrom: i.forkedFrom.toNumber(),
        NFTContract: i.NFTContract.toString(),
        lastSoldPrice: price,
        onSale: i.onSale.toString()
      };
      return item;
    })
  );

  allModels = items;
  console.log("All Models fetched: ", items);
  return items;
}

export async function fetchAllDaoMembers(_modelId: any) {
  const contract = await getHexsContract(false);
  const data = await contract.modelIdToMembers(_modelId);
  return data;
}

export async function getModelEncryptedSDLURI(_modelId: any) {
  const contract = await getHexsContract(false);
  const modelStruct = await contract.idToModel(_modelId);
  alert(`Encrypted Hash : ${modelStruct.encryptedSDLURI}`);
}

// ------- lighthouse functions

const lighthouseKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_KEY;
// const lighthouseKey = "f4fe69b9.b425d2fd61e84cb38a104149081a406a";

async function encryptSDLUsingLighthouse(_yamlJson: any, _newModelId: any) {
  try {
    const encryptionAuth = await signAuthMessage();
    if (!encryptionAuth) {
      console.error("Failed to sign the message.");
      return;
    }

    const { signature, signerAddress } = encryptionAuth;

    const output = await lighthouse.textUploadEncrypted(_yamlJson, lighthouseKey, signerAddress, signature);
    console.log("Upload Successful", output);
    alert(`Upload JSON Success : ${output.data.Hash}`);

    await applyAccessConditions(output.data.Hash, _newModelId);
    console.log("cid", output.data.Hash);
    return output.data.Hash;
  } catch (error) {
    console.error("Error uploading encrypted file:", error);
  }
}

const signAuthMessage = async () => {
  if ((window as any).ethereum) {
    try {
      const accounts = await window?.ethereum?.request({
        method: "eth_requestAccounts"
      });
      if (accounts.length === 0) {
        throw new Error("No accounts returned from Wallet.");
      }
      const signerAddress = accounts[0];
      const { message } = (await lighthouse.getAuthMessage(signerAddress)).data;
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, signerAddress]
      });
      return { signature, signerAddress };
    } catch (error) {
      console.error("Error signing message with Wallet", error);
      return null;
    }
  } else {
    console.log("Please install Wallet!");
    return null;
  }
};

const applyAccessConditions = async (cid: any, _newModelId: any) => {
  let nftContractAddress = await getNFTContractAddress(_newModelId);

  console.log("nftContractAddress", nftContractAddress)

  const conditions = [
    {
      id: 97,
      chain: "bsc",
      method: "balanceOf",
      standardContractType: "ERC721",
      contractAddress: nftContractAddress,
      returnValueTest: { comparator: ">=", value: "1" },
      parameters: [":userAddress"]
    }
  ];

  const aggregator = "([1])";
  const { publicKey, signedMessage } = await encryptionSignature();

  const response = await lighthouse.applyAccessCondition(publicKey, cid, signedMessage, conditions, aggregator);

  console.log("access condition res:",  response);
};

const encryptionSignature = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  const messageRequested = (await lighthouse.getAuthMessage(address)).data.message;
  const signedMessage = await signer.signMessage(messageRequested);
  return {
    signedMessage: signedMessage,
    publicKey: address
  };
};

async function decryptSDLUsingLighthouse() {}

// ------ dead code lighthouse

// const signAuthMessage = async () => {
//   const provider = new ethers.providers.Web3Provider(window.ethereum);
//   const signer = provider.getSigner();
//   const address = await signer.getAddress();
//   const authMessage = await kavach.getAuthMessage(address);
//   const signedMessage = await signer.signMessage(authMessage.message);
//   const { JWT, error } = await kavach.getJWT(address, signedMessage);
//   return JWT;
// };

// async function encryptSDLUsingLighthouse(_yamlJson: any, _fileName: any) {
//   console.log("lighthouse started");

//   const provider = new ethers.providers.Web3Provider(window.ethereum);
//   const signer = provider.getSigner();
//   const address = await signer.getAddress();

//   const jwt = await signAuthMessage();
//   const yourText = "_yamlJson";

//   const response = await lighthouse.textUploadEncrypted(yourText, lighthouseKey, address, jwt, _fileName);
//   console.log("lighthouse", response);

//   //   applyAccessConditions(response.data.Hash, _modelId);
//   //   console.log("cid", response.data.Hash);
// }

// const sig = await encryptionSignature();

// const e = new File([_yamlJson], _fileName, { type: "application/json", endings: "native" });
// const dataTransfer = new DataTransfer();
// dataTransfer.items.add(e);
// console.log("filelist", dataTransfer.files)

// const response = await lighthouse.uploadEncrypted(dataTransfer.files[0], lighthouseKey, address, jwt, progressCallback);
// console.log("lighthouse response:", response);

// const publicKey = await getUserAddress();
// const apiKey = "beb93df5.78de7074ed1f4e6691485078798ee59c";
// const signedMessage = "SIGNATURE/JWT";
// const name = "SDL file";

// interface ProgressData {
//   total: number;
//   uploaded: number;
// }

// const progressCallback = (progressData: ProgressData) => {
//   let percentageDone = 100 - (progressData.total / progressData.uploaded) * 100;
//   console.log(percentageDone.toFixed(2));
// };

// ------ dead code lighthouse

// ------- extra functions

async function generateUniqueFileName() {
  const contract = await getHexsContract(false);
  const modelId = contract.modelId;
  return addressHexs + (modelId + 1);
}

function createFileFromObject(_yamlJson: any, _fileName: any) {
  const jsonString = JSON.stringify(_yamlJson);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  return url;
}

function download(_yamlJson: any, _fileName: any) {
  const url: any = createFileFromObject(_yamlJson, _fileName);
  const link = document.createElement("a");
  link.href = url;
  link.download = `SDL.json`;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function downloadSDL(_modelId: any) {}

