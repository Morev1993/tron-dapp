// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    uint8 private _decimals;

    constructor(string memory name_, string memory symbol_, uint8 decimals_) ERC20(name_, symbol_) {
        _setupDecimals(decimals_);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount * (10 ** uint256(_decimals)));
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    function _setupDecimals(uint8 decimals_) private onlyOwner {
        _decimals = decimals_;
    }
}