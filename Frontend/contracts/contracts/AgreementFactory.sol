// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Agreement.sol";

contract AgreementFactory {
    event AgreementCreated(
        address indexed agreement,
        address indexed customer,
        address indexed vendor,
        address token,
        bool isNative
    );

    function createAgreement(
        address vendor,
        address token,
        bool isNative,
        Agreement.Milestone[] memory milestones
    ) external returns (address addr) {
        Agreement a = new Agreement(msg.sender, vendor, token, isNative, milestones);
        addr = address(a);
        emit AgreementCreated(addr, msg.sender, vendor, token, isNative);
    }
}