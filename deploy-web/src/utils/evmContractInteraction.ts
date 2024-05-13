"use client"
import web3modal from "web3modal";
import { ethers } from "ethers";
import { addressHexs, abiHexs } from "./constants/constants";
import lighthouse from "@lighthouse-web3/sdk";
import axios from "axios";

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
  console.log("default name", _yamlJson.name);
  _yamlJson.name = fileName;
  download(_yamlJson, fileName);

  //encrypt the SDL file
  await encryptSDLUsingLighthouse(_yamlJson, fileName);

  //tokenize the file
  let _visibility = true;
  const contract = await getHexsContract(true);
  const tx = await contract.createModel(_visibility);
  await tx.wait();
  console.log("Model Tokenized");
  return true;
}

export async function putModelOnSaleCall(_modelId : any, _price : any) {
    const contract = await getHexsContract(true);
    const weiPrice = ethers.utils.parseUnits(_price.toString(), "ether");
    const tx = await contract.putModelOnSale(_modelId, weiPrice);
    await tx.wait();
    console.log("Model put on sale");
}

export async function buyModelCall(_modelId : any) {
    const contract = await getHexsContract(true);
    const tx = await contract.buyModel(_modelId);
    await tx.wait();
    console.log("Model bought");
}

export async function forkModelCall(_modelId : any, _visibility : any) {
    const contract = await getHexsContract(true);
    const tx = await contract.forkModel(_modelId, _visibility);
    await tx.wait();
    console.log("Model forked");
}

export async function updateSDLURICall(_modelId : any, _uri : any) {
    const contract = await getHexsContract(true);
    const tx = await contract.updateSDLURI(_modelId, _uri);
    await tx.wait();
    console.log("SDL URI updated");
}

export async function addMemberToDaoCall(_modelId : any, _newMember : any) {
    const contract = await getHexsContract(true);
    const tx = await contract.addMemberToDao(_modelId, _newMember);
    await tx.wait();
    console.log("Member added to DAO");
}

// ------- getter

async function getNFTContractAddress(_modelId: any) {
  const contract = await getHexsContract(false);
  const modelStruct = await contract.idToModel(_modelId);
  return modelStruct.nftContractAddress;
}

let allModels: any = [];

async function fetchAllModels() {
  const contract = await getHexsContract(false);
  const data = await contract.fetchAllModels();

  console.log("3");

  // console.log("data", data)
  const items = await Promise.all(
    data.map(async (i: any) => {
      const tokenUri = await contract.uri(i.ticketId.toString());
      // console.log(tokenUri);
      const meta = await axios.get(tokenUri);
      let price = ethers.utils.formatEther(i.price);
      let item = {
        creator: i.creator.toString(),
        owner: i.owner.toNumber(),
        modelId: i.modelId.toNumber(),
        price,
        reviewsURI: i.reviewsURI.toString(),
        encryptedSDLURI: i.encryptedSDLURI.toString(),
        isForked: i.isForked,
        baseModel: i.baseModel,
        NFTContract: i.NFTContract,
        lastSoldPrice: i.lastSoldPrice,
        onSale: i.onSale
      };
      return item;
    })
  );
  console.log("4");

  allModels = items;
  console.log("All Events", items);
  return items;
}

export async function fetchMyModelsPage() {
  const userAddress = await getUserAddress();
  if (allModels.length > 0) {
    const filteredArray = allModels.filter((subarray: any) => subarray.owner == userAddress);
    return filteredArray;
  } else {
    const data = await fetchAllModels();
    const filteredArray = data.filter(subarray => subarray.owner == userAddress);
    return filteredArray;
  }
}

export async function fetchMarketplacePage() {
  if (allModels.length > 0) {
    const filteredArray = allModels.filter((subarray: any) => subarray.onSale == true );
    return filteredArray;
  } else {
    const data = await fetchAllModels();
    const filteredArray = data.filter(subarray => subarray.onSale == true);
    return filteredArray;
  }
}

export async function fetchAllDaoMembers(_modelId: any) {
    const contract = await getHexsContract(false);
    const data = await contract.modelIdToMembers(_modelId);
    return data
}

// ------- lighthouse functions

// const lighthouseKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_KEY;
const lighthouseKey = "f4fe69b9.b425d2fd61e84cb38a104149081a406a";

// async function newEncryptSDLUsingLighthouse(_yamlJson: any) {
//   const yourText = "_yamlJson";
//   const apiKey = "beb93df5.78de7074ed1f4e6691485078798ee59c";
//   const publicKey = await getUserAddress();
//   const signedMessage = "SIGNATURE/JWT";
//   const name = "SDL file";
//   const response = await lighthouse.textUploadEncrypted(yourText, apiKey, publicKey, signedMessage, name);
//   console.log("lighthouse", response);
// }

async function encryptSDLUsingLighthouse(_yamlJson: any, _fileName: any) {
  console.log("lighthouse started");

  const e = new File([_yamlJson], _fileName, { type: "application/json", endings: "native" });

  const sig = await encryptionSignature();
  const response = await lighthouse.uploadEncrypted(e, lighthouseKey, sig.publicKey, sig.signedMessage, progressCallback);
  console.log("lighthouse response:", response);

  //   applyAccessConditions(response.data.Hash, _modelId);
  //   console.log("cid", response.data.Hash);
}

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

interface ProgressData {
  total: number;
  uploaded: number;
}

const progressCallback = (progressData: ProgressData) => {
  let percentageDone = 100 - (progressData.total / progressData.uploaded) * 100;
  console.log(percentageDone.toFixed(2));
};

const applyAccessConditions = async (cid: any, _modelId: any) => {
  let nftContractAddress = await getNFTContractAddress(_modelId);

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

  console.log(response);
};

async function decryptSDLUsingLighthouse() {}

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