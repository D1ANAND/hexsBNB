// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface InterfaceInitChainlink {
    function initAPICall(address _deployer) external;

    function initDataFeeds() external;

    function initCCIP(address _ccipReceiverAddress) external;

    function callDataFeeds(uint _amount) external view returns (uint);

    function callAPICall(string[] calldata _args) external;

    function sendCCIPMessage(string memory _nftMetadataUri, address _nftTokenAddress, uint256 _nftTokenId) external;
}