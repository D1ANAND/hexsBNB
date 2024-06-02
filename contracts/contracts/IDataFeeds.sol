// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


interface DataFeeds {
    function calculate(uint _amount) external view returns (uint) ;
}