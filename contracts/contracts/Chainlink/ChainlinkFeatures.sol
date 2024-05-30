// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

//-----DATAFEEDS-----

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract DataFeeds {
    AggregatorV3Interface internal priceFeed;
    IERC20 public usdt;

    constructor(address _aggregatorAddress, address _tokenA) {
        priceFeed = AggregatorV3Interface(_aggregatorAddress);
        usdt = IERC20(_tokenA);
    }

   function calculate(uint _amount) public view returns (uint) {
        uint256 chainlinkDecimals = 10 ** 10;  // chainlink returns in 8 decimals, needs to add 10 more
        uint256 PriceInUsdt = uint256(getLatestPrice()) * chainlinkDecimals;
        uint256 usdtAmount = (_amount * PriceInUsdt) / 10**18;
        return usdtAmount;
   }

    function getLatestPrice() public view returns (int) {
        (,int price,,,) = priceFeed.latestRoundData();
        return price;
    }
}

//-----APICALL-----

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

interface DeployerContract {
    function _apiFallback(string memory _result) external;
}

contract APICall is FunctionsClient, ConfirmedOwner, ERC721URIStorage {
    address router;
    uint64 subscriptionId;
    bytes32 donID;
    address deployerContract;

    constructor(address _router, uint64 _subscriptionId, bytes32 _donID, address _deployer) FunctionsClient(_router) ConfirmedOwner(msg.sender) ERC721("NFT", "NFT") {
        router = _router;
        subscriptionId = _subscriptionId;
        donID = _donID;
        deployerContract = _deployer;
    }

    using FunctionsRequest for FunctionsRequest.Request;

    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;
    
    error UnexpectedRequestID(bytes32 requestId);

    uint32 gasLimit = 300000;

    string APIScript =
        "const prompt = args[0];"
        "const apiResponse = await Functions.makeHttpRequest({"
        "url: `https://modelgen.pythonanywhere.com/generate-model-img/${prompt}`"
        "});"
        "if (apiResponse.error) {"
        "throw Error('Request failed');"
        "}"
        "const { data } = apiResponse;"
        "return Functions.encodeString(data[0].url);";

    function APICallFunction(
        string[] calldata args
    ) public returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(APIScript);
        
        if (args.length > 0) req.setArgs(args);
        s_lastRequestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            donID
        );
        return s_lastRequestId;
    }

    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (s_lastRequestId != requestId) {
            revert UnexpectedRequestID(requestId);
        }
        s_lastResponse = response;
        s_lastError = err;
        string memory result = string(response);
        DeployerContract deployerContractInstance = DeployerContract(deployerContract);
        deployerContractInstance._apiFallback(result);
    }
}

//-----CCIP-----

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";

library CCIPMessage {
    struct MessageStruct {
        string _nftMetadataUri;
        address _nftTokenAddress;
        uint256 _nftTokenId;
        // address _ercToken;
        // uint256 _ercAmount;
    }
}

contract CCIP is CCIPReceiver, OwnerIsCreator {
    using SafeERC20 for IERC20;

    error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees);
    error NothingToWithdraw();
    error FailedToWithdrawEth(address owner, address target, uint256 value);
    error DestinationChainNotAllowed(uint64 destinationChainSelector);
    error SourceChainNotAllowed(uint64 sourceChainSelector);
    error SenderNotAllowed(address sender);
    error InvalidReceiverAddress();

    event MessageSent(
        bytes32 indexed messageId,
        uint64 indexed destinationChainSelector,
        address receiver,
        string text,
        address token,
        uint256 tokenAmount
        // address feeToken,
        // uint256 fees
    );

    event MessageReceived(
        bytes32 indexed messageId,
        uint64 indexed sourceChainSelector,
        address sender,
        string text,
        address token,
        uint256 tokenAmount
    );

    bytes32 private s_lastReceivedMessageId;
    string private s_lastReceivedMessage;
    address private s_lastReceivedNFTAddress;
    uint256 private s_lastReceivedNFTID;

    IERC20 private s_linkToken;

    constructor(address _router, address _link) CCIPReceiver(_router) {
        s_linkToken = IERC20(_link);
    }

    function sendMessage(
        uint64 _destinationChainSelector,
        address _receiver,
        CCIPMessage.MessageStruct memory message    
    )
        external
    {
        // Build the CCIP message
        Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
            _receiver,
            message
        );

         IRouterClient router = IRouterClient(this.getRouter());

        // Get the fee required to send the CCIP message
        uint256 fees = router.getFee(_destinationChainSelector, evm2AnyMessage);

        if (fees > address(this).balance)
            revert NotEnoughBalance(address(this).balance, fees);

        // approve the Router to spend tokens on contract's behalf. It will spend the amount of the given token
        // IERC20(message._ercToken).approve(address(router), message._ercAmount);

        // Send the message through the router and store the returned message ID
        bytes32 messageId = router.ccipSend{value: fees}(
            _destinationChainSelector,
            evm2AnyMessage
        );
        // Emit the MessageSent event
        emit MessageSent(
            messageId,
            _destinationChainSelector,
            _receiver,
            message._nftMetadataUri,
            message._nftTokenAddress,
            message._nftTokenId
        );
    }

    function _buildCCIPMessage(
        address _receiver,
        CCIPMessage.MessageStruct memory message  
    ) internal pure returns (Client.EVM2AnyMessage memory) {
        // Create an array for token amounts
        // Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](2);
        // tokenAmounts[0] = Client.EVMTokenAmount({
        //     token: message._nftTokenAddress,
        //     amount: message._nftTokenId
        // });

        return
            Client.EVM2AnyMessage({
                receiver: abi.encode(_receiver),
                data: abi.encode(message),
                // tokenAmounts: tokenAmounts,
                tokenAmounts: new Client.EVMTokenAmount[](0),
                extraArgs: Client._argsToBytes(
                    Client.EVMExtraArgsV1({gasLimit: 1_500_000})), // Set gas limit to 1,500,000 to pay for fees in native gas
                feeToken: address(0) // Fees are paid in native gas
            }
        );
    }

    function _ccipReceive(
        Client.Any2EVMMessage memory any2EvmMessage
    )
        internal
        override
    {
        s_lastReceivedMessageId = any2EvmMessage.messageId; // fetch the messageId
        CCIPMessage.MessageStruct memory message = abi.decode(any2EvmMessage.data, (CCIPMessage.MessageStruct)); // abi-decoding of the sent text
        s_lastReceivedNFTAddress = message._nftTokenAddress;
        s_lastReceivedNFTID = message._nftTokenId;

        emit MessageReceived(
            any2EvmMessage.messageId,
            any2EvmMessage.sourceChainSelector, // fetch the source chain identifier (aka selector)
            abi.decode(any2EvmMessage.sender, (address)), // abi-decoding of the sender address,
            abi.decode(any2EvmMessage.data, (string)),
            any2EvmMessage.destTokenAmounts[0].token,
            any2EvmMessage.destTokenAmounts[0].amount
        );
    }

    function getLastReceivedMessageDetails()
        public
        view
        returns (
            bytes32 messageId,
            string memory text,
            address tokenAddress,
            uint256 tokenAmount
        )
    {
        return (
            s_lastReceivedMessageId,
            s_lastReceivedMessage,
            s_lastReceivedNFTAddress,
            s_lastReceivedNFTID
        );
    }

    receive() external payable {}

    function withdraw(address _beneficiary) public onlyOwner {
        uint256 amount = address(this).balance;
        if (amount == 0) revert NothingToWithdraw();
        (bool sent, ) = _beneficiary.call{value: amount}("");
        if (!sent) revert FailedToWithdrawEth(msg.sender, _beneficiary, amount);
    }

    function withdrawToken(
        address _beneficiary,
        address _token
    ) public onlyOwner {
        uint256 amount = IERC20(_token).balanceOf(address(this));
        if (amount == 0) revert NothingToWithdraw();
        IERC20(_token).safeTransfer(_beneficiary, amount);
    }
}