// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";

interface Hexs {
    function fallbackRequest(bytes memory response) external;
}

contract functions is FunctionsClient {

    address router = 0xC22a79eBA640940ABB6dF0f7982cc119578E11De;
    uint64 subscriptionId = 290;
    bytes32 donID = 0x66756e2d706f6c79676f6e2d616d6f792d310000000000000000000000000000;

    constructor() FunctionsClient(router) {}

    using FunctionsRequest for FunctionsRequest.Request;

    bytes32 public s_lastRequestId;
    
    error UnexpectedRequestID(bytes32 requestId);

    uint32 gasLimit = 300000;

    uint public lastRqstTokenId;
    
    address HexsAddress;
    Hexs hexs;

    string APIScript =
        "const modelId = args[0];"
        "const apiResponse = await Functions.makeHttpRequest({"
        "url: `https://engagementscore-zvglklnxya-em.a.run.app/view/${_modelId}`"
        "});"
        "if (apiResponse.error) {"
        "throw Error('Request failed');"
        "}"
        "const { response } = apiResponse;"
        "return Functions.encodeString(response.data.EngagementScore);";

    function apiCallSetValidateEngagement(
        string[] calldata args, address _hexs
    ) public returns (bytes32 requestId) {
        HexsAddress = _hexs;
        hexs = Hexs(HexsAddress);
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
        hexs.fallbackRequest(response);
    }
}