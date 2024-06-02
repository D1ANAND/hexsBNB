// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface Functions {

    function apiCallSetValidateEngagement(
        string[] calldata args, address _hexs
    ) external returns (bytes32 requestId) ;

}