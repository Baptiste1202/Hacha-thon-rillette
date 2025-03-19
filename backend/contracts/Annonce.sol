// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Announce is Ownable {
    uint public announcementCount;

    struct Announcer {
        bool isRegistered;
        uint registrationTimestamp;
    }

    struct Announcement {
        uint id;
        address announcer;
        string content;
        uint timestamp;
    }

    mapping(address => Announcer) public announcers;
    Announcementpublic announcements;

    event AnnouncerRegistered(address announcerAddress);
    event AnnouncementCreated(uint announcementId, address announcerAddress, string content);

    constructor() Ownable(msg.sender) {}

    function registerAnnouncer(address _announcer) public onlyOwner {
        require(!announcers[_announcer].isRegistered, "Address is already registered as an announcer.");
        announcers[_announcer].isRegistered = true;
        announcers[_announcer].registrationTimestamp = block.timestamp;
        emit AnnouncerRegistered(_announcer);
    }

    function makeAnnouncement(string memory _content) public {
        require(announcers[msg.sender].isRegistered, "Only registered announcers can make announcements.");
        require(bytes(_content).length > 0, "Announcement content cannot be empty.");

        announcementCount++;
        Announcement memory newAnnouncement = Announcement(
            announcementCount,
            msg.sender,
            _content,
            block.timestamp
        );
        announcements.push(newAnnouncement);

        emit AnnouncementCreated(announcementCount, msg.sender, _content);
    }

    function getAnnouncement(uint _announcementId) public view returns (Announcement memory) {
        require(_announcementId > 0 && _announcementId <= announcementCount, "Invalid announcement ID.");
        return announcements[_announcementId - 1];
    }

    function getTotalAnnouncements() public view returns (uint) {
        return announcementCount;
    }

    function getAnnouncements(uint _start, uint _count) public view returns (Announcementmemory) {
        require(_start < announcementCount, "Start index out of bounds.");
        uint end = _start + _count;
        if (end > announcementCount) {
            end = announcementCount;
        }
        Announcementmemory result = new Announcement(end - _start);
        for (uint i = _start; i < end; i++) {
            result[i - _start] = announcements[i];
        }
        return result;
    }

    function removeAnnouncer(address _announcer) public onlyOwner {
        require(announcers[_announcer].isRegistered, "Address is not registered as an announcer.");
        delete announcers[_announcer];
    }
}
