// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.20;

// //import "@layerzerolabs/contracts-v2/oapp/OApp.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// contract TokenBridge is OApp {
//     mapping(uint16 => address) public remoteContracts; // Maps endpoint IDs to contract addresses
//     IERC20 public token;

//     event TokenBridged(address indexed sender, uint16 dstEid, uint256 amount);
//     event TokenReceived(address indexed receiver, uint256 amount);

//     constructor(address _endpoint, address _token) OApp(_endpoint) {
//         token = IERC20(_token);
//     }

//     function bridgeTokens(uint16 _dstEid, uint256 _amount) external payable {
//         require(remoteContracts[_dstEid] != address(0), "Destination not set");
//         require(token.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

//         _lzSend(_dstEid, abi.encode(msg.sender, _amount), msg.value, msg.sender);
//         emit TokenBridged(msg.sender, _dstEid, _amount);
//     }

//     function _lzReceive(bytes calldata _message, address, bytes calldata) internal override {
//         (address receiver, uint256 amount) = abi.decode(_message, (address, uint256));
//         token.transfer(receiver, amount);
//         emit TokenReceived(receiver, amount);
//     }

//     function setRemoteContract(uint16 _eid, address _contract) external onlyOwner {
//         remoteContracts[_eid] = _contract;
//     }
// }
