//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ChainlinkFeatures.sol";

interface Deployer {
    function _apiFallback(string memory _result) external;
}

// deploy a ccip receiver first and then this contract
contract InitChainlink {

    //api-call amoy
    address router = 0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C;
    uint64 subscriptionId = 1068;
    bytes32 donID = 0x66756e2d706f6c79676f6e2d6d756d6261692d31000000000000000000000000;

    //data-feeds amoy/usd
    address aggregatorAddress = 0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada;
    address tokenA = 0xc4bF5CbDaBE595361438F8c6a187bDc330539c60;

    //ccip sender amoy
    address _routerA = 0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada;
    address _linkA = 0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada;
    uint64 _destinationChainSelector = 0;
    
    //ccip receiver avalanche
    address _routerB;
    address _linkB;

    address deployer;
    bool public isFullfilled = true;
    string public result;
    address _receiver;
    
    //instances
    DataFeeds dataFeeds;
    APICall apiCall;
    CCIP ccip;

    //data-feeds methods
    function initDataFeeds() public {
        dataFeeds = new DataFeeds(aggregatorAddress, tokenA);
    }

    function callDataFeeds(uint _amount) public view returns (uint) {
        return dataFeeds.calculate(_amount);
    }

    //api-call methods
    function initAPICall(address _deployer) public {
        apiCall = new APICall(router, subscriptionId, donID, _deployer);
    }

    function setDeployer(address _deployer) public { //for apicall fallback
        deployer = _deployer;
    } 
    
    function callAPICall(string[] calldata _args) public {
        apiCall.APICallFunction(_args);
        isFullfilled = false;
    }

    //ccip methods
    function initCCIP(address _ccipReceiverAddress) public {
        _receiver = _ccipReceiverAddress;
        ccip = new CCIP(_routerA, _linkA);
    }

    function sendCCIPMessage(
        string memory _nftMetadataUri,
        address _nftTokenAddress,
        uint256 _nftTokenId
    ) public {
        CCIPMessage.MessageStruct memory message = CCIPMessage.MessageStruct(_nftMetadataUri, _nftTokenAddress, _nftTokenId);
        ccip.sendMessage(_destinationChainSelector, _receiver, message);
    }
}