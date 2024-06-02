//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SDLNFT.sol";

import "./DataFeeds.sol";

//model creation
//marketplace
//dao
//reviews
//fork
//royalties
//fetching models

// priviledged owner - intial creator (or forker) of model who can alter royalty or sell on marketplace
// default royalty rate is set to 3%

contract Hexs {
    struct Model{
        address payable creator;
        address payable priviledgedOwner; // priviledged owner
        uint modelId;
        string reviewsURI;
        string encryptedSDLURI;
        bool visibility;
        bool isForked;
        uint baseModel;
        uint forkedFrom;
        address NFTContract;
        uint lastSoldPrice;
        bool onSale;
        uint royaltyRate;
    }

    uint public modelId;

    mapping (uint => Model) public idToModel;
    mapping (uint => address[]) public modelIdToMembers;
    mapping (address => mapping (uint => uint)) public userToModelToTokeId;
    mapping (uint => string[]) public modelToReviews; 

    DataFeeds public dataFeeds;

    //data-feeds eth/usd
    address aggregatorAddress = 0x59F1ec1f10bD7eD9B938431086bC1D9e233ECf41;

    constructor() {
        dataFeeds = new DataFeeds(aggregatorAddress);
    }


    modifier onlyModelOwner(uint _modelId) {
        Model memory model = idToModel[_modelId];
        SDLNFT nft = SDLNFT(model.NFTContract);
        require(nft.balanceOf(msg.sender) > 0, "");
        _;
    }

    modifier onlyPriviledgedOwner(uint _modelId) {
        Model memory model = idToModel[_modelId];
        require(msg.sender == model.priviledgedOwner, "");
        _;
    }

    function getPriceInUsd(uint _tokenId) public view returns (uint) {
        uint _amount = idToModel[_tokenId].lastSoldPrice;
        return dataFeeds.calculate(_amount);
    }

    function createModel(bool _visibility, string memory _uri) public{
        ++modelId;

        SDLNFT nftMinter = new SDLNFT(msg.sender);
        nftMinter.setUri(_uri);
        uint nftTokenId = nftMinter.mintNFT(msg.sender);
        modelIdToMembers[modelId].push(msg.sender);
        userToModelToTokeId[msg.sender][modelId] = nftTokenId;

        idToModel[modelId] = Model(payable(msg.sender), payable(msg.sender), modelId, "", _uri, _visibility, false, 0, 0, address(nftMinter), 0, false, 3);
    }

    function setRoyaltyRate(uint _modelId, uint _royaltyRate) public onlyPriviledgedOwner(_modelId) {
        idToModel[_modelId].royaltyRate = _royaltyRate;
    }

    function putModelOnSale(uint _modelId, uint _price) public onlyPriviledgedOwner(_modelId) {
        Model storage model = idToModel[_modelId];
        model.onSale = true;
        model.lastSoldPrice = _price;
    }

    function buyModel(uint _modelId) public payable {
        Model memory model = idToModel[_modelId];
        require(model.onSale == true, "");
        require(model.lastSoldPrice == msg.value, "");
        uint256 royalty = (model.lastSoldPrice * 3)/100; // 3% royalties
        uint256 remainingFunds = model.lastSoldPrice - royalty;
        model.creator.transfer(royalty);
        model.priviledgedOwner.transfer(remainingFunds);
        _transferSDLOwnership(_modelId);
    }

    function _transferSDLOwnership(uint _modelId) private {
        Model storage model = idToModel[_modelId];
        model.priviledgedOwner = payable(msg.sender);

        SDLNFT nftMinter =  SDLNFT(model.NFTContract);
        uint nftTokenId = userToModelToTokeId[tx.origin][_modelId];
        nftMinter.safeTransferFrom(msg.sender, address(this), nftTokenId);
    }

    function forkModel(uint _modelId, bool _visibility) public {
        Model memory model = idToModel[_modelId];
        ++modelId;
        SDLNFT nftMinter = new SDLNFT(msg.sender);

        nftMinter.setUri(model.encryptedSDLURI);
        uint nftTokenId = nftMinter.mintNFT(msg.sender);
        modelIdToMembers[modelId].push(msg.sender);
        userToModelToTokeId[msg.sender][modelId] = nftTokenId;

        if (model.baseModel == 0) {
            idToModel[modelId] = Model(payable(msg.sender), payable(msg.sender), modelId, model.reviewsURI, model.encryptedSDLURI, _visibility, true, _modelId, _modelId, address(nftMinter), 0, false, 3);
        }
        else {   
            idToModel[modelId] = Model(payable(msg.sender), payable(msg.sender), modelId, model.reviewsURI, model.encryptedSDLURI, _visibility, true, model.baseModel, _modelId, address(nftMinter), 0, false, 3);
        }
    }

    function updateSDLURI(uint _modelId, string memory _uri) public onlyModelOwner(_modelId) {
        Model storage model = idToModel[modelId];
        SDLNFT nftMinter = SDLNFT(model.NFTContract);
        nftMinter.setUri(model.encryptedSDLURI);
        model.encryptedSDLURI = _uri;
    }

    function addMemberToDao(uint _modelId, address _newMember) public onlyModelOwner(_modelId) {
        Model storage model = idToModel[_modelId];
        SDLNFT nftMinter =  SDLNFT(model.NFTContract);
        nftMinter.mintNFT(_newMember);
        modelIdToMembers[_modelId].push(msg.sender);
    }

    function addReviews(uint _modelId, string memory _review) public {
        modelToReviews[_modelId].push(_review);
    }

    function changeVisibility(uint _modelId, bool _visibility) public {
        idToModel[_modelId].visibility = _visibility;
    }

    function fetchAllModels() public view returns (Model[] memory){
        uint counter = 0;
        uint length = modelId;
        Model[] memory models = new Model[](length);
        for (uint i = 1; i <= length; i++) {
            uint currentId = i;
            Model storage currentItem = idToModel[currentId];
            models[counter] = currentItem;
            counter++; 
        }
        return models;
    }

    function fetchInventory(address _user) public view returns (Model[] memory){
        uint counter = 0;
        uint length;

        for (uint i = 1; i <= modelId; i++) {
            Model memory model = idToModel[i];
            SDLNFT nft = SDLNFT(model.NFTContract);
            if (nft.balanceOf(_user) > 0) {
                length++;
            }
        }

        Model[] memory models = new Model[](length);
        for (uint i = 1; i <= modelId; i++) {
            Model memory model = idToModel[i];
            SDLNFT nft = SDLNFT(model.NFTContract);
            if (nft.balanceOf(_user) > 0) {
                uint currentId = i;
                Model storage currentItem = idToModel[currentId];
                models[counter] = currentItem;
                counter++;
            }
        }
        return models;
    }

    function fetchReviewsLength(uint _modelId) public view returns (uint) {
        uint length = modelToReviews[_modelId].length;
        return length;
    }
}