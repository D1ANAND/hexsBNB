//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SDLNFT.sol";

//model creation
//marketplace
//dao
//reviews
//fork
//fetching all your models
//royalty 3%

contract Hexs {
    struct Model{
        address payable creator;
        address payable owner;
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
    }

    uint public modelId;

    mapping (uint => Model) public idToModel;
    mapping (uint => address[]) public modelIdToMembers;
    mapping (address => mapping (uint => uint)) public userToModelToTokeId;
    mapping (uint => string[]) public modelToReviews; 

    modifier onlyModelOwner(uint _modelId) {
        Model memory model = idToModel[_modelId];
        require(model.owner == msg.sender, "");
        _;
    }

    function createModel(bool _visibility, string memory _uri) public{
        ++modelId;

        NFTMinter nftMinter = new NFTMinter();
        nftMinter.setUri(_uri);
        uint nftTokenId = nftMinter.mintNFT(msg.sender);
        modelIdToMembers[modelId].push(msg.sender);
        userToModelToTokeId[msg.sender][modelId] = nftTokenId;

        idToModel[modelId] = Model(payable(msg.sender), payable(msg.sender), modelId, "", _uri, _visibility, false, 0, 0, address(nftMinter), 0, false);
    }

    function putModelOnSale(uint _modelId, uint _price) public onlyModelOwner(_modelId) {
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
        model.owner.transfer(remainingFunds);
        model.creator.transfer(royalty);
        _transferSDLOwnership(_modelId);
    }

    function _transferSDLOwnership(uint _modelId) private {
        Model storage model = idToModel[_modelId];
        model.owner = payable(msg.sender);

        NFTMinter nftMinter =  NFTMinter(model.NFTContract);
        uint nftTokenId = userToModelToTokeId[tx.origin][_modelId];
        nftMinter.safeTransferFrom(msg.sender, address(this), nftTokenId);
    }

    function forkModel(uint _modelId, bool _visibility) public {
        Model memory model = idToModel[_modelId];
        ++modelId;
        NFTMinter nftMinter = new NFTMinter();

        nftMinter.setUri(model.encryptedSDLURI);
        uint nftTokenId = nftMinter.mintNFT(msg.sender);
        modelIdToMembers[modelId].push(msg.sender);
        userToModelToTokeId[msg.sender][modelId] = nftTokenId;

        if (model.baseModel == 0) {
            idToModel[modelId] = Model(payable(msg.sender), payable(msg.sender), modelId, model.reviewsURI, model.encryptedSDLURI, _visibility, true, _modelId, _modelId, address(nftMinter), 0, false);
        }
        else {   
            idToModel[modelId] = Model(payable(msg.sender), payable(msg.sender), modelId, model.reviewsURI, model.encryptedSDLURI, _visibility, true, model.baseModel, _modelId, address(nftMinter), 0, false);
        }
    }

    function updateSDLURI(uint _modelId, string memory _uri) public onlyModelOwner(_modelId) {
        Model storage model = idToModel[modelId];
        NFTMinter nftMinter = NFTMinter(model.NFTContract);
        nftMinter.setUri(model.encryptedSDLURI);
        model.encryptedSDLURI = _uri;
    }

    function addMemberToDao(uint _modelId, address _newMember) public onlyModelOwner(_modelId) {
        Model storage model = idToModel[_modelId];
        NFTMinter nftMinter =  NFTMinter(model.NFTContract);
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
            if (idToModel[i].owner == _user) {
                length++;
            }
        }

        Model[] memory models = new Model[](length);
        for (uint i = 1; i <= modelId; i++) {
            if (idToModel[i].owner == _user) {
                uint currentId = i;
                Model storage currentItem = idToModel[currentId];
                models[counter] = currentItem;
                counter++;
            }
        }
        return models;
    }
}