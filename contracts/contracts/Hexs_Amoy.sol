//SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity ^0.8.20;


import "./SDLNFT.sol";
import "./IDataFeeds.sol";
import "./ICCIPSend.sol";
import "./IFunctions.sol";
// import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
// import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";
// import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";

//model creation
//marketplace
//dao
//reviews
//fork
//royalties
//fetching models

// priviledged owner - intial creator (or forker) of model who can alter royalty or sell on marketplace
// default royalty rate is set to 3%

library ModelStruct {
        struct Model{
        address payable creator;
        address payable priviledgedOwner; // priviledged owner
        uint8 modelId;
        string reviewsURI;
        string encryptedSDLURI;
        bool visibility;
        bool isForked;
        uint8 baseModel;
        uint8 forkedFrom;
        address NFTContract;
        uint lastSoldPrice;
        bool onSale;
        uint8 royaltyRate;
        uint8 engagementScore;
    }
}

contract Hexs {

    uint8 public modelId;

    DataFeeds public dataFeeds;
    CCIPSender public ccipSender;
    Functions public functions; 

    //data-feeds matic/usd
    address aggregatorAddress = 0x001382149eBa3441043c1c66972b4772963f5D43;

    //CCIP amoy
    address _routerA = 0x9C32fCB86BF0f4a1A8921a9Fe46de3198bb884B2;
    address _linkA = 0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b1904;
    uint64 _destinationChainSelector = 14767482510784806043;

    constructor(address datafeedContract, address ccipContract, address functionContract ) {
        dataFeeds = DataFeeds(address(datafeedContract));
        ccipSender = CCIPSender(address(ccipContract));
        functions = Functions(address(functionContract));

    }

    mapping (uint => ModelStruct.Model) public idToModel;
    mapping (uint => address[]) public modelIdToMembers;
    mapping (address => mapping (uint => uint)) public userToModelToTokeId;
    mapping (uint => string[]) public modelToReviews; 

    modifier onlyModelOwner(uint _modelId) {
        ModelStruct.Model memory model = idToModel[_modelId];
        SDLNFT nft = SDLNFT(model.NFTContract);
        require(nft.balanceOf(msg.sender) > 0, "");
        _;
    }

    modifier onlyPriviledgedOwner(uint _modelId) {
        ModelStruct.Model memory model = idToModel[_modelId];
        require(msg.sender == model.priviledgedOwner, "");
        _;
    }

    function getPriceInUsd(uint _tokenId) public view returns (uint) {
        uint _amount = idToModel[_tokenId].lastSoldPrice;
        return dataFeeds.calculate(_amount);
    }

    function bridge(address _receiver, uint _tokenId) public {
        string memory uri = idToModel[_tokenId].encryptedSDLURI;
        CCIPMessage.MessageStruct memory message = CCIPMessage.MessageStruct(uri, address(this), _tokenId);
        ccipSender.sendMessage(_destinationChainSelector, _receiver, message);
    }

    function createModel(address _to, bool _visibility, string memory _uri) public{
        ++modelId;

        SDLNFT nftMinter = new SDLNFT(_to);
        nftMinter.setUri(_uri);
        uint nftTokenId = nftMinter.mintNFT(_to);
        modelIdToMembers[modelId].push(_to);
        userToModelToTokeId[_to][modelId] = nftTokenId;

        idToModel[modelId] = ModelStruct.Model(payable(_to), payable(_to), modelId, "", _uri, _visibility, false, 0, 0, address(nftMinter), 0, false, 3, 0);
    }

    function setRoyaltyRate(uint _modelId, uint8 _royaltyRate) public onlyPriviledgedOwner(_modelId) {
        idToModel[_modelId].royaltyRate = _royaltyRate;
    }

    function putModelOnSale(uint _modelId, uint _price) public onlyPriviledgedOwner(_modelId) {
        ModelStruct.Model storage model = idToModel[_modelId];
        idToModel[_modelId].onSale = true;
        idToModel[_modelId].lastSoldPrice = _price;
    }

    function buyModel(uint _modelId) public payable {
        ModelStruct.Model memory model = idToModel[_modelId];
        require(model.onSale == true, "");
        require(model.lastSoldPrice == msg.value, "");
        uint256 royalty = (model.lastSoldPrice * 3)/100; // 3% royalties
        uint256 remainingFunds = model.lastSoldPrice - royalty;
        model.creator.transfer(royalty);
        model.priviledgedOwner.transfer(remainingFunds);
        _transferSDLOwnership(_modelId);
    }

    function _transferSDLOwnership(uint _modelId) private {
        ModelStruct.Model storage model = idToModel[_modelId];
        model.priviledgedOwner = payable(msg.sender);

        SDLNFT nftMinter =  SDLNFT(model.NFTContract);
        uint nftTokenId = userToModelToTokeId[tx.origin][_modelId];
        nftMinter.safeTransferFrom(msg.sender, address(this), nftTokenId);
    }

    function forkModel(uint8 _modelId, bool _visibility) public {
        ModelStruct.Model memory model = idToModel[_modelId];
        ++modelId;
        SDLNFT nftMinter = new SDLNFT(msg.sender);

        nftMinter.setUri(model.encryptedSDLURI);
        uint nftTokenId = nftMinter.mintNFT(msg.sender);
        modelIdToMembers[modelId].push(msg.sender);
        userToModelToTokeId[msg.sender][modelId] = nftTokenId;

        if (model.baseModel == 0) {
            idToModel[modelId] = ModelStruct.Model(payable(msg.sender), payable(msg.sender), modelId, model.reviewsURI, model.encryptedSDLURI, _visibility, true, _modelId, _modelId, address(nftMinter), 0, false, 3, 0);
        }
        else {   
            idToModel[modelId] = ModelStruct.Model(payable(msg.sender), payable(msg.sender), modelId, model.reviewsURI, model.encryptedSDLURI, _visibility, true, model.baseModel, _modelId, address(nftMinter), 0, false, 3, 0);
        }
    }

    function updateSDLURI(uint _modelId, string memory _uri) public onlyModelOwner(_modelId) {
        ModelStruct.Model storage model = idToModel[modelId];
        SDLNFT nftMinter = SDLNFT(model.NFTContract);
        nftMinter.setUri(model.encryptedSDLURI);
        model.encryptedSDLURI = _uri;
    }

    function addMemberToDao(uint _modelId, address _newMember) public onlyModelOwner(_modelId) {
        ModelStruct.Model storage model = idToModel[_modelId];
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

    function fetchAllModels() public view returns (ModelStruct.Model[] memory){
        uint counter = 0;
        uint length = modelId;
        ModelStruct.Model[] memory models = new ModelStruct.Model[](length);
        for (uint i = 1; i <= length; i++) {
            uint currentId = i;
            ModelStruct.Model storage currentItem = idToModel[currentId];
            models[counter] = currentItem;
            counter++; 
        }
        return models;
    }

    function fetchInventory(address _user) public view returns (ModelStruct.Model[] memory){
        uint counter = 0;
        uint length;

        for (uint i = 1; i <= modelId; i++) {
            ModelStruct.Model memory model = idToModel[i];
            SDLNFT nft = SDLNFT(model.NFTContract);
            if (nft.balanceOf(_user) > 0) {
                length++;
            }
        }

        ModelStruct.Model[] memory models = new ModelStruct.Model[](length);
        for (uint i = 1; i <= modelId; i++) {
            ModelStruct.Model memory model = idToModel[i];
            SDLNFT nft = SDLNFT(model.NFTContract);
            if (nft.balanceOf(_user) > 0) {
                uint currentId = i;
                ModelStruct.Model storage currentItem = idToModel[currentId];
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

    uint modelIdInRqst;

    function callAPI(string[] calldata args, uint _modelIdInRqst) public {
        modelIdInRqst = _modelIdInRqst;
        functions.apiCallSetValidateEngagement(args, address(this));
    }

    function fallbackRequest(bytes memory _response) public {
        uint256 score = uint256(bytes32(_response));
        idToModel[modelIdInRqst].engagementScore = uint8(score);
    }
}