// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Agreement is ReentrancyGuard {
    struct Milestone {
        uint256 amount;       // token units
        string  description;
        bool    released;
    }

    address public immutable customer;   // controller
    address public immutable vendor;     // payee
    address public immutable token;      // 0x0 if native
    bool    public immutable isNative;

    Milestone[] public milestones;

    uint256 public totalFunded;
    uint256 public totalReleased;
    uint256 public totalWithdrawn;

    event Funded(address indexed from, uint256 amount);
    event MilestoneReleased(uint256 indexed index, uint256 amount, string description);
    event Withdrawn(address indexed to, uint256 amount);

    modifier onlyCustomer() {
        require(msg.sender == customer, "Only customer");
        _;
    }

    constructor(
        address _customer,
        address _vendor,
        address _token,
        bool _isNative,
        Milestone[] memory _milestones
    ) {
        require(_customer != address(0) && _vendor != address(0), "Zero addr");
        require(_milestones.length > 0, "No milestones");

        customer = _customer;
        vendor   = _vendor;
        token    = _token;
        isNative = _isNative;

        for (uint256 i = 0; i < _milestones.length; i++) {
            require(_milestones[i].amount > 0, "Zero amount");
            milestones.push(
                Milestone({
                    amount: _milestones[i].amount,
                    description: _milestones[i].description,
                    released: false
                })
            );
        }
    }

    // --- VIEW HELPERS ---
    function getMilestones() external view returns (Milestone[] memory all) {
        all = new Milestone[](milestones.length);
        for (uint256 i = 0; i < milestones.length; i++) all[i] = milestones[i];
    }

    // --- FUNDING ---
    function fund(uint256 amount) external payable onlyCustomer nonReentrant {
        if (isNative) {
            require(msg.value > 0, "No ETH sent");
            totalFunded += msg.value;
            emit Funded(msg.sender, msg.value);
        } else {
            require(amount > 0, "Zero amount");
            require(IERC20(token).transferFrom(msg.sender, address(this), amount), "transferFrom failed");
            totalFunded += amount;
            emit Funded(msg.sender, amount);
        }
    }

    // --- RELEASE ---
    function releaseMilestone(uint256 index) external onlyCustomer {
        require(index < milestones.length, "Bad index");
        Milestone storage m = milestones[index];
        require(!m.released, "Already released");

        uint256 available = totalFunded - totalReleased;
        require(available >= m.amount, "Insufficient funded");

        m.released = true;
        totalReleased += m.amount;

        emit MilestoneReleased(index, m.amount, m.description);
    }

    // --- WITHDRAW (VENDOR) ---
    function withdraw() external nonReentrant {
        require(msg.sender == vendor, "Only vendor");
        uint256 claimable = totalReleased - totalWithdrawn;
        require(claimable > 0, "Nothing to withdraw");

        totalWithdrawn += claimable;
        if (isNative) {
            (bool ok, ) = payable(vendor).call{value: claimable}("");
            require(ok, "ETH transfer failed");
        } else {
            require(IERC20(token).transfer(vendor, claimable), "ERC20 transfer failed");
        }
        emit Withdrawn(vendor, claimable);
    }
}