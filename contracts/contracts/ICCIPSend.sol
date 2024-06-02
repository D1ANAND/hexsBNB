
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library CCIPMessage {
    struct MessageStruct {
        string _nftMetadataUri;
        address _nftTokenAddress;
        uint256 _nftTokenId;
    }
}

interface CCIPSender {
        function sendMessage(
            uint64 _destinationChainSelector,
            address _receiver,
            CCIPMessage.MessageStruct memory message    
        )
        external;
}