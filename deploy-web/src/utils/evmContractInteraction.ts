import web3modal from "web3modal";
import { ethers } from "ethers";
import {
    addressHexs,
    abiHexs,
} from "./constants/constants";

//stats page - control visibility variable, see number of forks, dao management


export async function getHexsContract(providerOrSigner: any) {
    const modal = new web3modal();
    const connection = await modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const contract = new ethers.Contract(addressHexs, abiHexs, provider);
    if (providerOrSigner == true) {
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
            addressHexs,
            abiHexs,
            signer
        );
        return contract;
    }
    return contract;
}

export async function tokenizeModel(_yamlJson: any) {
    console.log(_yamlJson)

    //download the SDL file
    download(_yamlJson, "SDL")

    //encrypt the SDL file
    await encryptSDLUsingLighthouse()

    //tokenize the file
    let _visibility = true;
    const contract = await getHexsContract(true);
    const tx = await contract.createModel(_visibility);
    await tx.wait()
    console.log("Model Tokenized");
    return true;
}

function download(_fileData: any, _fileName: any) {
    const jsonString = JSON.stringify(_fileData);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${_fileName}.json`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

async function encryptSDLUsingLighthouse() {}

async function decryptSDLUsingLighthouse() {}